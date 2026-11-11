import { supabase } from '../../../config/supabase.js'
import { AppError } from '../../utils/AppError.js'

// Obtener el profile_id desde el auth_user_id
const getProfileId = async (authUserId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_user_id', authUserId)
    .single()

  if (error || !data) throw new AppError('Perfil no encontrado', 404)
  return data.id
}

// ── Listar transacciones con filtros ──────────────────────────
export const getTransactions = async (authUserId, filters) => {
  const profileId = await getProfileId(authUserId)
  const { month, year, type, category_id, limit, offset } = filters

  let query = supabase
    .from('transactions')
    .select(`
      id, amount, type, description, transaction_date, created_at,
      categories ( id, name, icon, color )
    `)
    .eq('user_id', profileId)
    .order('transaction_date', { ascending: false })
    .range(offset, offset + limit - 1)

  if (type)        query = query.eq('type', type)
  if (category_id) query = query.eq('category_id', category_id)

  if (month && year) {
    const from = `${year}-${String(month).padStart(2, '0')}-01`
    const to   = new Date(year, month, 0).toISOString().split('T')[0]
    query = query.gte('transaction_date', from).lte('transaction_date', to)
  }

  const { data, error } = await query
  if (error) throw new AppError(error.message, 400)
  return data
}

// ── Obtener una transacción ───────────────────────────────────
export const getTransactionById = async (authUserId, id) => {
  const profileId = await getProfileId(authUserId)

  const { data, error } = await supabase
    .from('transactions')
    .select(`
      id, amount, type, description, transaction_date, created_at,
      categories ( id, name, icon, color )
    `)
    .eq('id', id)
    .eq('user_id', profileId)
    .single()

  if (error || !data) throw new AppError('Transacción no encontrada', 404)
  return data
}

// ── Crear transacción ─────────────────────────────────────────
export const createTransaction = async (authUserId, body) => {
  const profileId = await getProfileId(authUserId)

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id:          profileId,
      amount:           body.amount,
      type:             body.type,
      description:      body.description,
      category_id:      body.category_id,
      transaction_date: body.transaction_date || new Date().toISOString().split('T')[0]
    })
    .select()
    .single()

  if (error) throw new AppError(error.message, 400)
  return data
}

const normalizeName = (value = '') => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .toLowerCase()

// ── Importar transacciones desde CSV/Excel ───────────────────
export const importTransactions = async (authUserId, transactions) => {
  const profileId = await getProfileId(authUserId)

  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name')
    .or(`user_id.eq.${profileId},is_default.eq.true`)

  if (categoriesError) throw new AppError(categoriesError.message, 400)

  const categoryIds = new Set((categories || []).map(category => category.id))
  const categoriesByName = new Map(
    (categories || []).map(category => [normalizeName(category.name), category.id])
  )

  const rows = transactions.map(transaction => {
    let categoryId = transaction.category_id

    if (categoryId && !categoryIds.has(categoryId)) {
      throw new AppError(`La categoría ${categoryId} no está disponible para este usuario`, 400)
    }

    if (!categoryId && transaction.category_name) {
      categoryId = categoriesByName.get(normalizeName(transaction.category_name))
    }

    return {
      user_id:          profileId,
      amount:           transaction.amount,
      type:             transaction.type,
      description:      transaction.description || null,
      category_id:      categoryId || null,
      transaction_date: transaction.transaction_date
    }
  })

  const { data, error } = await supabase
    .from('transactions')
    .insert(rows)
    .select('id')

  if (error) throw new AppError(error.message, 400)

  return {
    imported: data?.length || rows.length,
    uncategorized: rows.filter(row => !row.category_id).length
  }
}

// ── Actualizar transacción ────────────────────────────────────
export const updateTransaction = async (authUserId, id, body) => {
  const profileId = await getProfileId(authUserId)

  // Verificar que pertenece al usuario antes de editar
  await getTransactionById(authUserId, id)

  const { data, error } = await supabase
    .from('transactions')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', profileId)
    .select()
    .single()

  if (error) throw new AppError(error.message, 400)
  return data
}

// ── Eliminar transacción ──────────────────────────────────────
export const deleteTransaction = async (authUserId, id) => {
  const profileId = await getProfileId(authUserId)
  await getTransactionById(authUserId, id)

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', profileId)

  if (error) throw new AppError(error.message, 400)
}

// ── Resumen mensual ───────────────────────────────────────────
export const getMonthlySummary = async (authUserId, month, year) => {
  const profileId = await getProfileId(authUserId)

  const currentMonth = month || new Date().getMonth() + 1
  const currentYear  = year  || new Date().getFullYear()
  const from = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`
  const to   = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('transactions')
    .select('amount, type, categories(name)')
    .eq('user_id', profileId)
    .gte('transaction_date', from)
    .lte('transaction_date', to)

  if (error) throw new AppError(error.message, 400)

  const totalIncome  = data.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const totalExpense = data.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

  // Gastos agrupados por categoría
  const byCategory = data
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const name = t.categories?.name || 'Sin categoría'
      acc[name] = (acc[name] || 0) + Number(t.amount)
      return acc
    }, {})

  return {
    month: currentMonth,
    year: currentYear,
    total_income:  totalIncome,
    total_expense: totalExpense,
    balance:       totalIncome - totalExpense,
    by_category:   byCategory
  }
}

// ── Categorizar una transacción ───────────────────────────────
export const categorizeTransaction = async (authUserId, id, category_id) => {
  return updateTransaction(authUserId, id, { category_id })
}

// ── Transacciones inusuales (anomalías simples por ahora) ─────
// Versión MVP: marca como inusual si el monto supera 2x el promedio del mes.
// En Fase 2 esto lo reemplaza el microservicio Python con Isolation Forest.
export const getAnomalies = async (authUserId) => {
  const profileId = await getProfileId(authUserId)

  const { data, error } = await supabase
    .from('transactions')
    .select('id, amount, type, description, transaction_date, categories(name)')
    .eq('user_id', profileId)
    .eq('type', 'expense')
    .order('transaction_date', { ascending: false })
    .limit(200)

  if (error) throw new AppError(error.message, 400)
  if (!data.length) return []

  const transactions = data.map(t => ({
    id:               t.id,
    amount:           Number(t.amount),
    type:             t.type,
    description:      t.description,
    category:         t.categories?.name || 'Sin categoría',
    transaction_date: t.transaction_date
  }))

  try {
    const response = await fetch(`${process.env.PYTHON_SERVICE_URL || 'http://localhost:8000'}/analyze`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ transactions })
    })

    const result = await response.json()
    return result.anomalies || []

  } catch {
    // Fallback si Python no está corriendo
    const amounts   = data.map(t => Number(t.amount))
    const avg       = amounts.reduce((s, a) => s + a, 0) / amounts.length
    const threshold = avg * 2
    return data
      .filter(t => Number(t.amount) > threshold)
      .map(t => ({ ...t, reason: `Monto ${(Number(t.amount) / avg).toFixed(1)}x mayor al promedio` }))
  }
}

// ── Próximo gasto recurrente (detección automática) ─────────
export const getRecurringNext = async (authUserId) => {
  const profileId = await getProfileId(authUserId)

  // Últimos 90 días de gastos
  const from = new Date()
  from.setDate(from.getDate() - 90)
  const fromStr = from.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('transactions')
    .select('description, amount, transaction_date')
    .eq('user_id', profileId)
    .eq('type', 'expense')
    .gte('transaction_date', fromStr)
    .order('transaction_date', { ascending: false })

  if (error || !data.length) return null

  // Agrupar por descripción normalizada
  const groups = {}
  for (const tx of data) {
    const key = tx.description?.toLowerCase().trim() || 'sin descripción'
    if (!groups[key]) groups[key] = []
    groups[key].push({ amount: Number(tx.amount), date: tx.transaction_date })
  }

  // Filtrar los que aparecen en ≥2 meses distintos con monto similar (±20%)
  const candidates = []
  for (const [desc, txs] of Object.entries(groups)) {
    if (txs.length < 2) continue

    const months = new Set(txs.map(t => t.date.slice(0, 7)))
    if (months.size < 2) continue

    const amounts = txs.map(t => t.amount)
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length
    const allSimilar = amounts.every(a => Math.abs(a - avgAmount) / avgAmount <= 0.2)
    if (!allSimilar) continue

    // Estimar próxima fecha: día del mes de la última ocurrencia + 30 días
    const lastDate = new Date(txs[0].date + 'T00:00:00Z')
    const nextDate = new Date(lastDate)
    nextDate.setMonth(nextDate.getMonth() + 1)

    candidates.push({
      name:          desc.charAt(0).toUpperCase() + desc.slice(1),
      amount:        Math.round(avgAmount),
      next_due_date: nextDate.toISOString().split('T')[0],
      frequency:     'monthly'
    })
  }

  if (!candidates.length) return null

  // Devolver el que vence más pronto
  candidates.sort((a, b) => a.next_due_date.localeCompare(b.next_due_date))
  return candidates[0]
}

// ── Tendencia de los últimos N meses ─────────────────────────
export const getMonthlyTrend = async (authUserId, months = 6) => {
  const profileId = await getProfileId(authUserId)

  const now   = new Date()
  const results = []

  for (let i = months - 1; i >= 0; i--) {
    const d     = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const month = d.getMonth() + 1
    const year  = d.getFullYear()
    const from  = `${year}-${String(month).padStart(2, '0')}-01`
    const to    = new Date(year, month, 0).toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', profileId)
      .gte('transaction_date', from)
      .lte('transaction_date', to)

    if (error) continue

    const income  = data.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
    const expense = data.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

    results.push({ month, year, label: `${String(month).padStart(2,'0')}/${year}`, income, expense, balance: income - expense })
  }

  return results
}

// ── Racha de días consecutivos con registro ──────────────────
export const getStreak = async (authUserId) => {
  const profileId = await getProfileId(authUserId)

  const { data, error } = await supabase
    .from('transactions')
    .select('transaction_date')
    .eq('user_id', profileId)
    .order('transaction_date', { ascending: false })
    .limit(90)

  if (error || !data.length) return { streak: 0, last_date: null }

  // Conjunto de fechas únicas (string YYYY-MM-DD)
  const dates = [...new Set(data.map(t => t.transaction_date))].sort().reverse()

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Offset de inicio: si hoy no tiene registro, empezar desde ayer
  const todayStr     = today.toISOString().split('T')[0]
  const yesterdayStr = new Date(today.getTime() - 86400000).toISOString().split('T')[0]
  const startOffset  = dates[0] === todayStr ? 0 : dates[0] === yesterdayStr ? 1 : null

  if (startOffset !== null) {
    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(today)
      expected.setDate(today.getDate() - (i + startOffset))
      const expectedStr = expected.toISOString().split('T')[0]
      if (dates[i] === expectedStr) {
        streak++
      } else {
        break
      }
    }
  }

  return { streak, last_date: dates[0] }
}

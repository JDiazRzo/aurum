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

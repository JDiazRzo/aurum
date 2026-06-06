import { supabase } from '../../../config/supabase.js'
import { AppError } from '../../utils/AppError.js'

const getProfileId = async (authUserId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_user_id', authUserId)
    .single()
  if (error || !data) throw new AppError('Perfil no encontrado', 404)
  return data.id
}

// Listar todos los presupuestos del usuario
export const getBudgets = async (authUserId) => {
  const profileId = await getProfileId(authUserId)

  const { data, error } = await supabase
    .from('budgets')
    .select(`
      id, total_amount, month, year, created_at,
      budget_categories (
        id, limit_amount, spent_amount,
        categories ( id, name, icon, color )
      )
    `)
    .eq('user_id', profileId)
    .order('year',  { ascending: false })
    .order('month', { ascending: false })

  if (error) throw new AppError(error.message, 400)
  return data
}

// Obtener presupuesto de un mes específico
export const getBudgetByMonth = async (authUserId, month, year) => {
  const profileId = await getProfileId(authUserId)

  const { data, error } = await supabase
    .from('budgets')
    .select(`
      id, total_amount, month, year,
      budget_categories (
        id, limit_amount, spent_amount,
        categories ( id, name, icon, color )
      )
    `)
    .eq('user_id', profileId)
    .eq('month', month)
    .eq('year', year)
    .single()

  if (error || !data) throw new AppError('Presupuesto no encontrado', 404)

  // Calcular totales para el resumen
  const totalSpent = data.budget_categories.reduce((s, bc) => s + Number(bc.spent_amount), 0)
  const remaining  = Number(data.total_amount) - totalSpent

  return { ...data, total_spent: totalSpent, remaining }
}

// Crear presupuesto con sus límites por categoría
export const createBudget = async (authUserId, body) => {
  const profileId = await getProfileId(authUserId)
  const { total_amount, month, year, categories = [] } = body

  // Insertar el presupuesto global
  const { data: budget, error: budgetError } = await supabase
    .from('budgets')
    .insert({ user_id: profileId, total_amount, month, year })
    .select()
    .single()

  if (budgetError) {
    // El UNIQUE constraint lanza error si ya existe ese mes/año
    if (budgetError.code === '23505') {
      throw new AppError(`Ya existe un presupuesto para ${month}/${year}`, 409)
    }
    throw new AppError(budgetError.message, 400)
  }

  // Insertar límites por categoría si los mandaron
  if (categories.length > 0) {
    const budgetCategories = categories.map(c => ({
      budget_id:    budget.id,
      category_id:  c.category_id,
      limit_amount: c.limit_amount,
      spent_amount: 0
    }))

    const { error: bcError } = await supabase
      .from('budget_categories')
      .insert(budgetCategories)

    if (bcError) throw new AppError(bcError.message, 400)
  }

  return getBudgetByMonth(authUserId, month, year)
}

// Actualizar monto global y/o límites por categoría
export const updateBudget = async (authUserId, id, body) => {
  const profileId = await getProfileId(authUserId)
  const { total_amount, categories } = body

  if (total_amount) {
    const { error } = await supabase
      .from('budgets')
      .update({ total_amount, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', profileId)

    if (error) throw new AppError(error.message, 400)
  }

  // Upsert: actualiza si existe, inserta si no
  if (categories?.length > 0) {
    const upsertData = categories.map(c => ({
      budget_id:    id,
      category_id:  c.category_id,
      limit_amount: c.limit_amount
    }))

    const { error } = await supabase
      .from('budget_categories')
      .upsert(upsertData, { onConflict: 'budget_id,category_id' })

    if (error) throw new AppError(error.message, 400)
  }

  const { data: updated } = await supabase
    .from('budgets')
    .select('month, year')
    .eq('id', id)
    .single()

  return getBudgetByMonth(authUserId, updated.month, updated.year)
}

export const deleteBudget = async (authUserId, id) => {
  const profileId = await getProfileId(authUserId)

  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id)
    .eq('user_id', profileId)

  if (error) throw new AppError(error.message, 400)
}

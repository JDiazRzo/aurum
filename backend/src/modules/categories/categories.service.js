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

// Retorna las predeterminadas (globales) + las del usuario
export const getCategories = async (authUserId) => {
  const profileId = await getProfileId(authUserId)

  const { data, error } = await supabase
    .from('categories')
    .select('id, name, icon, color, is_default')
    .or(`user_id.eq.${profileId},is_default.eq.true`)
    .order('is_default', { ascending: false })
    .order('name')

  if (error) throw new AppError(error.message, 400)
  return data
}

export const createCategory = async (authUserId, body) => {
  const profileId = await getProfileId(authUserId)

  const { data, error } = await supabase
    .from('categories')
    .insert({ ...body, user_id: profileId, is_default: false })
    .select()
    .single()

  if (error) throw new AppError(error.message, 400)
  return data
}

export const updateCategory = async (authUserId, id, body) => {
  const profileId = await getProfileId(authUserId)

  // Solo puede editar sus propias categorías, no las predeterminadas
  const { data: existing } = await supabase
    .from('categories')
    .select('id, is_default')
    .eq('id', id)
    .eq('user_id', profileId)
    .single()

  if (!existing) throw new AppError('Categoría no encontrada o no tienes permiso', 404)
  if (existing.is_default) throw new AppError('No puedes editar categorías predeterminadas', 403)

  const { data, error } = await supabase
    .from('categories')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new AppError(error.message, 400)
  return data
}

export const deleteCategory = async (authUserId, id) => {
  const profileId = await getProfileId(authUserId)

  const { data: existing } = await supabase
    .from('categories')
    .select('id, is_default')
    .eq('id', id)
    .eq('user_id', profileId)
    .single()

  if (!existing) throw new AppError('Categoría no encontrada o no tienes permiso', 404)
  if (existing.is_default) throw new AppError('No puedes eliminar categorías predeterminadas', 403)

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) throw new AppError(error.message, 400)
}

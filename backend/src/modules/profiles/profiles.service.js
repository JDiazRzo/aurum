import { supabase } from '../../../config/supabase.js'
import { AppError } from '../../utils/AppError.js'

export const getProfile = async (authUserId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, currency, created_at')
    .eq('auth_user_id', authUserId)
    .single()

  if (error || !data) throw new AppError('Perfil no encontrado', 404)
  return data
}

export const updateProfile = async (authUserId, body) => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_user_id', authUserId)
    .single()

  if (!profile) throw new AppError('Perfil no encontrado', 404)

  const { data, error } = await supabase
    .from('profiles')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', profile.id)
    .select()
    .single()

  if (error) throw new AppError(error.message, 400)
  return data
}

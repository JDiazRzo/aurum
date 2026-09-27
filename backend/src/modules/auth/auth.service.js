import { supabase } from '../../../config/supabase.js'
import { AppError } from '../../utils/AppError.js'



export const registerUser = async ({ email, password, full_name }) => {
  console.log('=== REGISTER LLAMADO ===')
  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name } }
  })
  console.log('Supabase response:', JSON.stringify({ error: error?.message }))
  if (error) throw new AppError(error.message, 400)
  return { user: authData.user, session: authData.session }
}

export const loginUser = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new AppError('Credenciales incorrectas', 401)
  return { user: data.user, session: data.session }
}

export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw new AppError(error.message, 400)
}

export const forgotPasswordUser = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.CLIENT_URL}/reset-password`
  })
  if (error) throw new AppError(error.message, 400)
}

export const resetPasswordUser = async (password) => {
  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw new AppError(error.message, 400)
}

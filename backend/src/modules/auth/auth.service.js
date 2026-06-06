import { supabase } from '../../../config/supabase.js'
import { AppError } from '../../utils/AppError.js'



export const registerUser = async ({ email, password, full_name }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name } }
  })

  if (error) throw new AppError(error.message, 400)
  return { user: data.user, session: data.session }
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

import { registerUser, loginUser, logoutUser } from './auth.service.js'
import { successResponse } from '../../utils/response.js'
import { registerUser, loginUser, logoutUser, forgotPasswordUser, resetPasswordUser } from './auth.service.js'

export const register = async (req, res, next) => {
  try {
    const data = await registerUser(req.body)
    successResponse(res, data, 'Usuario registrado exitosamente', 201)
  } catch (err) { next(err) }
}

export const login = async (req, res, next) => {
  try {
    const data = await loginUser(req.body)
    successResponse(res, data, 'Sesión iniciada')
  } catch (err) { next(err) }
}

export const logout = async (req, res, next) => {
  try {
    await logoutUser()
    successResponse(res, null, 'Sesión cerrada')
  } catch (err) { next(err) }
}

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    await forgotPasswordUser(email)
    successResponse(res, null, 'Correo enviado')
  } catch (err) { next(err) }
}

export const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body
    await resetPasswordUser(password)
    successResponse(res, null, 'Contraseña actualizada')
  } catch (err) { next(err) }
}

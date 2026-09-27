import { Router } from 'express'
import { validateBody } from '../../middlewares/validate.middleware.js'
import { registerSchema, loginSchema } from './auth.validation.js'
import { register, login, logout, forgotPassword, resetPassword } from './auth.controller.js'

export const authRouter = Router()

authRouter.post('/register', validateBody(registerSchema), register)
authRouter.post('/login',    validateBody(loginSchema),    login)
authRouter.post('/logout',   logout)
authRouter.post('/forgot-password', forgotPassword)
authRouter.post('/reset-password',  resetPassword)
import { Router } from 'express'
import { register, login, logout } from './auth.controller.js'
import { validateBody } from '../../middlewares/validate.middleware.js'
import { registerSchema, loginSchema } from './auth.validation.js'

export const authRouter = Router()

authRouter.post('/register', validateBody(registerSchema), register)
authRouter.post('/login',    validateBody(loginSchema),    login)
authRouter.post('/logout',   logout)

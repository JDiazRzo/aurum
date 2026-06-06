import { Router } from 'express'
import { requireAuth } from '../../middlewares/auth.middleware.js'
import { sendMessage } from './chat.controller.js'

export const chatRouter = Router()

chatRouter.use(requireAuth)
chatRouter.post('/', sendMessage)

import { Router } from 'express'
import { requireAuth } from '../../middlewares/auth.middleware.js'
import { getMe, updateMe, acceptHabeasData } from './profiles.controller.js'

export const profilesRouter = Router()

profilesRouter.use(requireAuth)

profilesRouter.get('/me',  getMe)
profilesRouter.put('/me',  updateMe)

profilesRouter.patch('/me/habeas-data', acceptHabeasData)

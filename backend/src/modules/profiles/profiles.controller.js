import * as service from './profiles.service.js'
import { successResponse } from '../../utils/response.js'

export const getMe = async (req, res, next) => {
  try {
    const data = await service.getProfile(req.user.id)
    successResponse(res, data)
  } catch (err) { next(err) }
}

export const updateMe = async (req, res, next) => {
  try {
    const data = await service.updateProfile(req.user.id, req.body)
    successResponse(res, data, 'Perfil actualizado')
  } catch (err) { next(err) }
}

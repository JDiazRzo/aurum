import * as service from './categories.service.js'
import { successResponse } from '../../utils/response.js'

export const getAll = async (req, res, next) => {
  try {
    const data = await service.getCategories(req.user.id)
    successResponse(res, data)
  } catch (err) { next(err) }
}

export const create = async (req, res, next) => {
  try {
    const data = await service.createCategory(req.user.id, req.body)
    successResponse(res, data, 'Categoría creada', 201)
  } catch (err) { next(err) }
}

export const update = async (req, res, next) => {
  try {
    const data = await service.updateCategory(req.user.id, req.params.id, req.body)
    successResponse(res, data, 'Categoría actualizada')
  } catch (err) { next(err) }
}

export const remove = async (req, res, next) => {
  try {
    await service.deleteCategory(req.user.id, req.params.id)
    successResponse(res, null, 'Categoría eliminada')
  } catch (err) { next(err) }
}

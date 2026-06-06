import * as service from './budgets.service.js'
import { successResponse } from '../../utils/response.js'

export const getAll = async (req, res, next) => {
  try {
    const data = await service.getBudgets(req.user.id)
    successResponse(res, data)
  } catch (err) { next(err) }
}

export const getByMonth = async (req, res, next) => {
  try {
    const { month, year } = req.params
    const data = await service.getBudgetByMonth(req.user.id, Number(month), Number(year))
    successResponse(res, data)
  } catch (err) { next(err) }
}

export const create = async (req, res, next) => {
  try {
    const data = await service.createBudget(req.user.id, req.body)
    successResponse(res, data, 'Presupuesto creado', 201)
  } catch (err) { next(err) }
}

export const update = async (req, res, next) => {
  try {
    const data = await service.updateBudget(req.user.id, req.params.id, req.body)
    successResponse(res, data, 'Presupuesto actualizado')
  } catch (err) { next(err) }
}

export const remove = async (req, res, next) => {
  try {
    await service.deleteBudget(req.user.id, req.params.id)
    successResponse(res, null, 'Presupuesto eliminado')
  } catch (err) { next(err) }
}

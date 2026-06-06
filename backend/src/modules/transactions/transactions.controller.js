import * as service from './transactions.service.js'
import { successResponse } from '../../utils/response.js'
import { listQuerySchema } from './transactions.validation.js'

export const getAll = async (req, res, next) => {
  try {
    const filters = listQuerySchema.parse(req.query)
    const data = await service.getTransactions(req.user.id, filters)
    successResponse(res, data)
  } catch (err) { next(err) }
}

export const getOne = async (req, res, next) => {
  try {
    const data = await service.getTransactionById(req.user.id, req.params.id)
    successResponse(res, data)
  } catch (err) { next(err) }
}

export const create = async (req, res, next) => {
  try {
    const data = await service.createTransaction(req.user.id, req.body)
    successResponse(res, data, 'Transacción creada', 201)
  } catch (err) { next(err) }
}

export const update = async (req, res, next) => {
  try {
    const data = await service.updateTransaction(req.user.id, req.params.id, req.body)
    successResponse(res, data, 'Transacción actualizada')
  } catch (err) { next(err) }
}

export const remove = async (req, res, next) => {
  try {
    await service.deleteTransaction(req.user.id, req.params.id)
    successResponse(res, null, 'Transacción eliminada')
  } catch (err) { next(err) }
}

export const summary = async (req, res, next) => {
  try {
    const { month, year } = req.query
    const data = await service.getMonthlySummary(req.user.id, Number(month), Number(year))
    successResponse(res, data)
  } catch (err) { next(err) }
}

export const categorize = async (req, res, next) => {
  try {
    const data = await service.categorizeTransaction(req.user.id, req.params.id, req.body.category_id)
    successResponse(res, data, 'Categoría asignada')
  } catch (err) { next(err) }
}

export const anomalies = async (req, res, next) => {
  try {
    const data = await service.getAnomalies(req.user.id)
    successResponse(res, data)
  } catch (err) { next(err) }
}

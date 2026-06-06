import { Router } from 'express'
import { requireAuth } from '../../middlewares/auth.middleware.js'
import { validateBody } from '../../middlewares/validate.middleware.js'
import { createTransactionSchema, updateTransactionSchema, categorySchema } from './transactions.validation.js'
import { getAll, getOne, create, update, remove, summary, categorize, anomalies } from './transactions.controller.js'

export const transactionsRouter = Router()

transactionsRouter.use(requireAuth)

// Rutas especiales primero (antes de /:id para evitar conflictos)
transactionsRouter.get('/summary',         summary)
transactionsRouter.get('/anomalies',       anomalies)

// CRUD base
transactionsRouter.get('/',                getAll)
transactionsRouter.post('/',               validateBody(createTransactionSchema), create)
transactionsRouter.get('/:id',             getOne)
transactionsRouter.put('/:id',             validateBody(updateTransactionSchema), update)
transactionsRouter.delete('/:id',          remove)

// Categorizar
transactionsRouter.patch('/:id/category',  validateBody(categorySchema), categorize)

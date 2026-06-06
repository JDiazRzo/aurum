import { Router } from 'express'
import { requireAuth } from '../../middlewares/auth.middleware.js'
import { validateBody } from '../../middlewares/validate.middleware.js'
import { createBudgetSchema, updateBudgetSchema } from './budgets.validation.js'
import { getAll, getByMonth, create, update, remove } from './budgets.controller.js'

export const budgetsRouter = Router()

budgetsRouter.use(requireAuth)

budgetsRouter.get('/',                    getAll)
budgetsRouter.get('/:year/:month',        getByMonth)
budgetsRouter.post('/',                   validateBody(createBudgetSchema), create)
budgetsRouter.put('/:id',                 validateBody(updateBudgetSchema), update)
budgetsRouter.delete('/:id',              remove)

import { Router } from 'express'
import { authRouter } from '../modules/auth/auth.routes.js'
import { profilesRouter } from '../modules/profiles/profiles.routes.js'
import { transactionsRouter } from '../modules/transactions/transactions.routes.js'
import { budgetsRouter } from '../modules/budgets/budgets.routes.js'
import { categoriesRouter } from '../modules/categories/categories.routes.js'

export const router = Router()

router.use('/auth',         authRouter)
router.use('/profiles',     profilesRouter)
router.use('/transactions', transactionsRouter)
router.use('/budgets',      budgetsRouter)
router.use('/categories',   categoriesRouter)

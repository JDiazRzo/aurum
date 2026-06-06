import { Router } from 'express'
import { requireAuth } from '../../middlewares/auth.middleware.js'
import { validateBody } from '../../middlewares/validate.middleware.js'
import { createCategorySchema, updateCategorySchema } from './categories.validation.js'
import { getAll, create, update, remove } from './categories.controller.js'

export const categoriesRouter = Router()

categoriesRouter.use(requireAuth)

categoriesRouter.get('/',      getAll)
categoriesRouter.post('/',     validateBody(createCategorySchema), create)
categoriesRouter.put('/:id',   validateBody(updateCategorySchema), update)
categoriesRouter.delete('/:id', remove)

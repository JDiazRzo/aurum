import { z } from 'zod'

export const createBudgetSchema = z.object({
  total_amount: z.number().positive('El monto debe ser mayor a 0'),
  month:        z.number().int().min(1).max(12),
  year:         z.number().int().min(2020),
  categories:   z.array(z.object({
    category_id:  z.string().uuid(),
    limit_amount: z.number().positive()
  })).optional()
})

export const updateBudgetSchema = z.object({
  total_amount: z.number().positive().optional(),
  categories:   z.array(z.object({
    category_id:  z.string().uuid(),
    limit_amount: z.number().positive()
  })).optional()
})

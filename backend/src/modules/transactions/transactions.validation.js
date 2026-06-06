import { z } from 'zod'

export const registerSchema = z.object({
  email:     z.string().email('Email inválido'),
  password:  z.string().min(8, 'Mínimo 8 caracteres'),
  full_name: z.string().min(2, 'Nombre muy corto').optional()
})

export const createTransactionSchema = z.object({
  amount:           z.coerce.number().positive('El monto debe ser mayor a 0'),
  type:             z.enum(['income', 'expense']),
  description:      z.string().max(255).optional(),
  category_id:      z.string().uuid('category_id inválido').optional(),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD').optional()
})

export const updateTransactionSchema = createTransactionSchema.partial()

export const categorySchema = z.object({
  category_id: z.string().uuid('category_id inválido')
})

export const listQuerySchema = z.object({
  month:       z.coerce.number().int().min(1).max(12).optional(),
  year:        z.coerce.number().int().min(2020).optional(),
  type:        z.enum(['income', 'expense']).optional(),
  category_id: z.string().uuid().optional(),
  limit:       z.coerce.number().int().min(1).max(100).default(20),
  offset:      z.coerce.number().int().min(0).default(0)
})
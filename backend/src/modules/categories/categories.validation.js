import { z } from 'zod'

export const createCategorySchema = z.object({
  name:  z.string().min(2, 'Nombre muy corto').max(50),
  icon:  z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color debe ser hex: #RRGGBB').optional()
})

export const updateCategorySchema = createCategorySchema.partial()

import { z } from 'zod'

export const registerSchema = z.object({
  email:     z.string().email('Email inválido'),
  password:  z.string().min(8, 'Mínimo 8 caracteres'),
  full_name: z.string().min(2, 'Nombre muy corto').optional()
})

export const loginSchema = z.object({
  email:    z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida')
})

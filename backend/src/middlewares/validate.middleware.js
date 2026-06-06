import { ZodError } from 'zod'

export const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body)
    next()
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
      return res.status(422).json({ success: false, message: 'Datos inválidos', errors })
    }
    next(err)
  }
}
export const errorHandler = (err, _req, res, _next) => {
  console.error('[Error]', err.message)

  const status = err.statusCode || 500
  const message = err.message || 'Error interno del servidor'

  res.setHeader('Content-Type', 'application/json')
  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}
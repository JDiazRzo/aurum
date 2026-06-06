// Error personalizado con código HTTP.
// Se usa con: throw new AppError('No encontrado', 404)
// El errorHandler lo captura y responde con el código correcto.
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message)
    this.statusCode = statusCode
    this.name = 'AppError'
  }
}

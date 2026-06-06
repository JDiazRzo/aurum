// Helpers para respuestas consistentes en toda la API.
// Todos los controllers usan estas funciones, nunca res.json directo.

export const successResponse = (res, data, message = 'OK', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data })
}

export const errorResponse = (res, message = 'Error', statusCode = 400) => {
  return res.status(statusCode).json({ success: false, message })
}

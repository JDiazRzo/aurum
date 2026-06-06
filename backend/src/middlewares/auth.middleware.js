import { supabase } from '../../config/supabase.js'

// Verifica que el token JWT de Supabase sea válido.
// Adjunta el usuario a req.user para que los controllers lo usen.
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token no proporcionado' })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'Token inválido o expirado' })
    }

    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}

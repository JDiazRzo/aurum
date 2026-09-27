import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../../services/api.js'

export const ForgotPassword = () => {
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await authService.forgotPassword(email)
      setSent(true)
    } catch {
      setError('No se pudo enviar el correo. Verifica el email ingresado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="fade-up w-full max-w-sm px-6">
        <div className="text-center mb-10">
          <div className="font-display text-5xl text-gold tracking-[6px] font-bold">AURUM</div>
          <div className="text-xs text-dim tracking-[2px] mt-1">RECUPERAR CONTRASEÑA</div>
        </div>
        <div className="h-px mb-8" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }} />

        {sent ? (
          <div className="text-center">
            <div className="text-4xl mb-4">✉️</div>
            <div className="text-white font-medium mb-2">Correo enviado</div>
            <div className="text-sm text-muted mb-6">
              Revisa tu bandeja de entrada en <span className="text-gold">{email}</span> y sigue el enlace para restablecer tu contraseña.
            </div>
            <Link to="/login" className="text-sm text-gold no-underline hover:text-gold-light">
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="text-sm text-muted text-center mb-2">
              Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted tracking-wide">Correo electrónico</label>
              <input
                type="email" placeholder="tu@correo.com" required
                value={email} onChange={e => setEmail(e.target.value)}
                className="bg-surface2 border border-border rounded-md px-3.5 py-2.5 text-sm text-white outline-none focus:border-gold placeholder:text-dim transition-colors"
              />
            </div>
            {error && <div className="text-sm text-danger text-center">{error}</div>}
            <button type="submit" disabled={loading}
              className="bg-gold text-black font-semibold rounded-md py-3 text-sm cursor-pointer border-none hover:bg-gold-light transition-all disabled:opacity-60 mt-2">
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </button>
            <Link to="/login" className="text-center text-sm text-dim no-underline hover:text-muted">
              Volver al inicio de sesión
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
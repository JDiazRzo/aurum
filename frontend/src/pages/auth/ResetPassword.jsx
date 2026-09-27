import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase.js'

export const ResetPassword = () => {
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) return setError('Las contraseñas no coinciden')
    if (password.length < 8)  return setError('Mínimo 8 caracteres')
    setLoading(true)
    setError('')
    try {
      await authService.resetPassword(password)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch {
      setError('No se pudo actualizar la contraseña. El enlace puede haber expirado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="fade-up w-full max-w-sm px-6">
        <div className="text-center mb-10">
          <div className="font-display text-5xl text-gold tracking-[6px] font-bold">AURUM</div>
          <div className="text-xs text-dim tracking-[2px] mt-1">NUEVA CONTRASEÑA</div>
        </div>
        <div className="h-px mb-8" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }} />

        {success ? (
          <div className="text-center">
            <div className="text-4xl mb-4">✅</div>
            <div className="text-white font-medium mb-2">Contraseña actualizada</div>
            <div className="text-sm text-muted">Redirigiendo al inicio de sesión...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted tracking-wide">Nueva contraseña</label>
              <input type="password" placeholder="Mínimo 8 caracteres" required
                value={password} onChange={e => setPassword(e.target.value)}
                className="bg-surface2 border border-border rounded-md px-3.5 py-2.5 text-sm text-white outline-none focus:border-gold placeholder:text-dim transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted tracking-wide">Confirmar contraseña</label>
              <input type="password" placeholder="Repite la contraseña" required
                value={confirm} onChange={e => setConfirm(e.target.value)}
                className="bg-surface2 border border-border rounded-md px-3.5 py-2.5 text-sm text-white outline-none focus:border-gold placeholder:text-dim transition-colors"
              />
            </div>
            {error && <div className="text-sm text-danger text-center">{error}</div>}
            <button type="submit" disabled={loading}
              className="bg-gold text-black font-semibold rounded-md py-3 text-sm cursor-pointer border-none hover:bg-gold-light transition-all disabled:opacity-60 mt-2">
              {loading ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
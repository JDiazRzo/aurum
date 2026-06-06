import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Button } from '../../components/ui/Button.jsx'

export const Login = () => {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form,    setForm]    = useState({ email: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form)
      navigate('/dashboard')
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors?.length) setError(errors.map(e => e.message).join(', '))
      else setError(err.response?.data?.message || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="fade-up w-full max-w-sm px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="font-display text-5xl text-gold tracking-[6px] font-bold">
            AURUM
          </div>
          <div className="text-xs text-dim tracking-[2px] mt-1">
            ASISTENTE FINANCIERO PERSONAL
          </div>
        </div>

        {/* Línea decorativa */}
        <div className="h-px mb-8" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }} />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Correo electrónico"
            type="email"
            placeholder="tu@correo.com"
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            required
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            required
          />
          {error && <div className="text-sm text-danger text-center">{error}</div>}
          <Button type="submit" loading={loading} fullWidth style={{ marginTop: 8, padding: '13px' }}>
            Iniciar sesión
          </Button>
        </form>

        <div className="text-center mt-6 text-sm text-dim">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-gold no-underline hover:text-gold-light">
            Regístrate
          </Link>
        </div>
      </div>
    </div>
  )
}
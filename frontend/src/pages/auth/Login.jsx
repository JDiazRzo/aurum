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
      setError(err.response?.data?.message || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--black)',
    }}>
      <div className="fade-up" style={{ width: '100%', maxWidth: 380, padding: '0 1.5rem' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, color: 'var(--gold)', letterSpacing: 6, fontWeight: 700 }}>
            AURUM
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', letterSpacing: 2, marginTop: 4 }}>
            ASISTENTE FINANCIERO PERSONAL
          </div>
        </div>

        {/* Línea decorativa */}
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, var(--gold), transparent)`, marginBottom: '2rem' }} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
          {error && (
            <div style={{ fontSize: 13, color: 'var(--danger)', textAlign: 'center' }}>
              {error}
            </div>
          )}
          <Button type="submit" loading={loading} style={{ marginTop: 8, width: '100%', padding: '13px' }}>
            Iniciar sesión
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 13, color: 'var(--text-dim)' }}>
          ¿No tienes cuenta?{' '}
          <Link to="/register" style={{ color: 'var(--gold)', textDecoration: 'none' }}>
            Regístrate
          </Link>
        </div>
      </div>
    </div>
  )
}

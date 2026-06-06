import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Button } from '../../components/ui/Button.jsx'

export const Register = () => {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [form,    setForm]    = useState({ full_name: '', email: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors?.length) setError(errors.map(e => e.message).join(', '))
      else setError(err.response?.data?.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="fade-up w-full max-w-sm px-6">
        <div className="text-center mb-10">
          <div className="font-display text-5xl text-gold tracking-[6px] font-bold">
            AURUM
          </div>
          <div className="text-xs text-dim tracking-[2px] mt-1">
            CREA TU CUENTA
          </div>
        </div>
        <div className="h-px mb-8" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }} />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Nombre completo" type="text" placeholder="Tu nombre"
            value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} required />
          <Input label="Correo electrónico" type="email" placeholder="tu@correo.com"
            value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
          <Input label="Contraseña" type="password" placeholder="Mínimo 8 caracteres"
            value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
          {error && <div className="text-sm text-danger text-center">{error}</div>}
          <Button type="submit" loading={loading} fullWidth style={{ marginTop: 8, padding: '13px' }}>
            Crear cuenta
          </Button>
        </form>

        <div className="text-center mt-6 text-sm text-dim">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-gold no-underline hover:text-gold-light">
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
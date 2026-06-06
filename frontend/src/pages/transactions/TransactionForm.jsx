import { useState, useEffect } from 'react'
import { Card } from '../../components/ui/Card.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { categoryService } from '../../services/api.js'

const CATS_ICONS = { 'Alimentación':'🍔','Transporte':'🚗','Vivienda':'🏠','Salud':'❤️','Educación':'📚','Entretenimiento':'🎮','Ropa':'👕','Servicios':'⚡','Ahorros':'🐷','Otros':'⋯' }

export const TransactionForm = ({ onSubmit, onClose }) => {
  const [form,       setForm]       = useState({ amount: '', type: 'expense', description: '', category_id: '', transaction_date: new Date().toISOString().split('T')[0] })
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')

  useEffect(() => {
    categoryService.getAll().then(({ data }) => setCategories(data.data || []))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.amount || Number(form.amount) <= 0) return setError('Ingresa un monto válido')
    setLoading(true)
    setError('')
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        // Si category_id está vacío, no lo mandamos
        category_id: form.category_id || undefined
      }
      await onSubmit(payload)
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors?.length) {
        setError(errors.map(e => e.message).join(', '))
      } else {
        setError(err.response?.data?.message || 'Error al guardar')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <Card style={{ width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600 }}>Nuevo movimiento</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Tipo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {['expense','income'].map(type => (
              <button key={type} type="button" onClick={() => setForm(p => ({ ...p, type }))} style={{
                padding: '10px', borderRadius: 'var(--radius-md)', fontSize: 13,
                transition: 'all .2s', cursor: 'pointer',
                background: form.type === type
                  ? (type === 'expense' ? '#1f0808' : '#081f08')
                  : 'var(--surface3)',
                border: form.type === type
                  ? `1px solid ${type === 'expense' ? 'var(--danger)' : 'var(--success)'}`
                  : '1px solid var(--border)',
                color: form.type === type
                  ? (type === 'expense' ? 'var(--danger)' : 'var(--success)')
                  : 'var(--text-muted)',
              }}>
                {type === 'expense' ? 'Gasto' : 'Ingreso'}
              </button>
            ))}
          </div>

          <Input label="Monto (COP)" type="number" placeholder="0" min="1"
            value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required />

          <Input label="Descripción" type="text" placeholder="¿En qué?"
            value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />

          {/* Categorías */}
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: .5, marginBottom: 8 }}>Categoría</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {categories.map(cat => (
                <button key={cat.id} type="button" onClick={() => setForm(p => ({ ...p, category_id: cat.id }))} style={{
                  padding: '8px 4px', borderRadius: 'var(--radius-md)', fontSize: 10,
                  textAlign: 'center', cursor: 'pointer', transition: 'all .2s',
                  background: form.category_id === cat.id ? 'var(--gold-bg)' : 'var(--surface3)',
                  border: `1px solid ${form.category_id === cat.id ? 'var(--gold-dim)' : 'var(--border)'}`,
                  color: form.category_id === cat.id ? 'var(--gold)' : 'var(--text-muted)',
                }}>
                  {CATS_ICONS[cat.name] || '○'}<br />{cat.name}
                </button>
              ))}
            </div>
          </div>

          <Input label="Fecha" type="date" value={form.transaction_date}
            onChange={e => setForm(p => ({ ...p, transaction_date: e.target.value }))} />

          {error && <div style={{ fontSize: 13, color: 'var(--danger)', textAlign: 'center' }}>{error}</div>}

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <Button type="button" variant="ghost" onClick={onClose} style={{ flex: 1 }}>Cancelar</Button>
            <Button type="submit" loading={loading} style={{ flex: 2 }}>Guardar</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

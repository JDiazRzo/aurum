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
        category_id: form.category_id || undefined
      }
      await onSubmit(payload)
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors?.length) setError(errors.map(e => e.message).join(', '))
      else setError(err.response?.data?.message || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-2xl font-semibold">Nuevo movimiento</h2>
          <button onClick={onClose} className="text-muted text-2xl bg-transparent border-none cursor-pointer hover:text-white">×</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
          <div className="grid grid-cols-2 gap-2">
            {['expense', 'income'].map(type => (
              <button
                key={type} type="button"
                onClick={() => setForm(p => ({ ...p, type }))}
                className={`py-2.5 rounded-md text-sm cursor-pointer transition-all duration-200 ${
                  form.type === type
                    ? type === 'expense'
                      ? 'bg-[#1f0808] border border-danger text-danger'
                      : 'bg-[#081f08] border border-success text-success'
                    : 'bg-surface3 border border-border text-muted'
                }`}
              >
                {type === 'expense' ? 'Gasto' : 'Ingreso'}
              </button>
            ))}
          </div>

          <Input label="Monto (COP)" type="number" placeholder="0" min="1"
            value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required />

          <Input label="Descripción" type="text" placeholder="¿En qué?"
            value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />


          <div>
            <div className="text-xs text-muted tracking-wide mb-2">Categoría</div>
            <div className="grid grid-cols-4 gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat.id} type="button"
                  onClick={() => setForm(p => ({ ...p, category_id: cat.id }))}
                  className={`py-2 px-1 rounded-md text-[10px] text-center cursor-pointer transition-all duration-200 ${
                    form.category_id === cat.id
                      ? 'bg-gold-bg border border-gold-dim text-gold'
                      : 'bg-surface3 border border-border text-muted hover:border-gold hover:text-gold'
                  }`}
                >
                  {CATS_ICONS[cat.name] || '○'}<br />{cat.name}
                </button>
              ))}
            </div>
          </div>

          <Input label="Fecha" type="date" value={form.transaction_date}
            onChange={e => setForm(p => ({ ...p, transaction_date: e.target.value }))} />

          {error && <div className="text-sm text-danger text-center">{error}</div>}

          <div className="flex gap-2 mt-1">
            <Button type="button" variant="ghost" onClick={onClose} style={{ flex: 1 }}>Cancelar</Button>
            <Button type="submit" loading={loading} style={{ flex: 2 }}>Guardar</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
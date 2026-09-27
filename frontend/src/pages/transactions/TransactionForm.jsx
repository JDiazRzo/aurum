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
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center z-50"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full md:max-w-md bg-surface border border-border rounded-t-2xl md:rounded-2xl overflow-hidden transition-none">
        
        <div className={`p-5 pb-4 transition-colors duration-300 ${
          form.type === 'expense' ? 'bg-[#1a0808]' : 'bg-[#081a08]'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display text-xl font-semibold text-white">Nuevo movimiento</h2>
            <button onClick={onClose} className="text-muted text-2xl bg-transparent border-none cursor-pointer hover:text-white leading-none">×</button>
          </div>

          <div className="flex bg-black/20 rounded-xl p-1 gap-1">
            {[
              { key: 'expense', label: '↓ Gasto',   active: 'text-danger  border-danger/50  bg-danger/10'  },
              { key: 'income',  label: '↑ Ingreso',  active: 'text-success border-success/50 bg-success/10' },
            ].map(({ key, label, active }) => (
              <button
                key={key} type="button"
                onClick={() => setForm(p => ({ ...p, type: key }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all duration-200 cursor-pointer ${
                  form.type === key ? active : 'text-muted border-transparent bg-transparent'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-4 relative">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl text-muted font-display">$</span>
            <input
              type="number" placeholder="0" min="1"
              value={form.amount}
              onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
              className={`w-full bg-transparent border-none outline-none text-4xl font-display font-bold pl-8 text-white placeholder:text-white/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
              required
            />
          </div>
        </div>

        <div className="p-5 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">

          <div>
            <label className="text-xs text-muted tracking-wide mb-1.5 block">¿En qué?</label>
            <input
              type="text" placeholder="Ej: Almuerzo, Netflix, Nómina..."
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-gold placeholder:text-dim transition-colors"
            />
          </div>

          <div>
            <label className="text-xs text-muted tracking-wide mb-2 block">Categoría</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id} type="button"
                  onClick={() => setForm(p => ({ ...p, category_id: cat.id }))}
                  className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-xs transition-all duration-200 cursor-pointer border ${
                    form.category_id === cat.id
                      ? 'bg-gold-bg border-gold text-gold'
                      : 'bg-surface2 border-border text-muted hover:border-gold/50 hover:text-gold/70'
                  }`}
                >
                  <span className="text-xl">{CATS_ICONS[cat.name] || '○'}</span>
                  <span className="leading-tight text-center">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted tracking-wide mb-1.5 block">Fecha</label>
            <input
              type="date"
              value={form.transaction_date}
              onChange={e => setForm(p => ({ ...p, transaction_date: e.target.value }))}
              className="w-full bg-surface2 border border-border rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-gold transition-colors"
            />
          </div>

          {error && <div className="text-sm text-danger text-center">{error}</div>}
        </div>

        <div className="p-4 border-t border-border flex gap-2">
          <Button type="button" variant="ghost" onClick={onClose} style={{ flex: 1 }}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading} onClick={handleSubmit} style={{ flex: 2 }}>
            Guardar movimiento
          </Button>
        </div>
      </div>
    </div>
  )
}
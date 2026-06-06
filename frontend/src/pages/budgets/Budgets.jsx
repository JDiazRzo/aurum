import { useState, useEffect } from 'react'
import { Layout } from '../../components/layout/Layout.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { budgetService, categoryService } from '../../services/api.js'
import { formatCOP, currentMonth, currentYear, MONTHS } from '../../utils/format.js'

const ProgressBar = ({ value, max }) => {
  const pct = Math.min((value / max) * 100, 100)
  const color = pct >= 100 ? 'bg-danger' : pct >= 80 ? 'bg-warn' : 'bg-gold'
  return (
    <div className="h-1.5 bg-border rounded-full overflow-hidden mt-2">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export const Budgets = () => {
  const [budget,     setBudget]     = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [showEdit,   setShowEdit]   = useState(false)
  const [formError,  setFormError]  = useState('')
  const [categories, setCategories] = useState([])
  const [catLimits,  setCatLimits]  = useState({})
  const [editLimits, setEditLimits] = useState({})
  const [month] = useState(currentMonth())
  const [year]  = useState(currentYear())
  const [newBudget, setNewBudget] = useState({ total_amount: '', month, year })

  useEffect(() => {
    budgetService.getByMonth(year, month)
      .then(({ data }) => setBudget(data.data))
      .catch(() => setBudget(null))
      .finally(() => setLoading(false))
  }, [month, year])

  useEffect(() => {
    categoryService.getAll()
      .then(({ data }) => setCategories(data.data || []))
      .catch(err => console.log('Error categorías:', err))
  }, [])

  const handleCreate = async () => {
    if (!newBudget.total_amount || Number(newBudget.total_amount) <= 0)
      return setFormError('Ingresa un monto válido')
    try {
      const cats = Object.entries(catLimits)
        .filter(([_, v]) => v && Number(v) > 0)
        .map(([category_id, limit_amount]) => ({ category_id, limit_amount: Number(limit_amount) }))
      const { data } = await budgetService.create({
        total_amount: Number(newBudget.total_amount),
        month: newBudget.month, year: newBudget.year, categories: cats
      })
      setBudget(data.data)
      setShowForm(false)
      setFormError('')
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al crear presupuesto')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar el presupuesto de este mes?')) return
    try {
      await budgetService.remove(budget.id)
      setBudget(null)
    } catch (err) { console.error(err) }
  }

  const handleEdit = () => {
    const current = {}
    budget.budget_categories?.forEach(bc => { current[bc.category_id] = bc.limit_amount })
    setEditLimits(current)
    setShowEdit(true)
  }

  const handleUpdate = async () => {
    try {
      const cats = Object.entries(editLimits)
        .filter(([_, v]) => v && Number(v) > 0)
        .map(([category_id, limit_amount]) => ({ category_id, limit_amount: Number(limit_amount) }))
      await budgetService.update(budget.id, { categories: cats })
      const { data } = await budgetService.getByMonth(year, month)
      setBudget(data.data)
      setShowEdit(false)
    } catch (err) { console.error(err) }
  }

  const inputClass = "w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm text-white outline-none focus:border-gold"
  const selectClass = "w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm text-white outline-none focus:border-gold"

  if (loading) return <Layout><div className="text-dim p-8">Cargando...</div></Layout>

  const Modal = ({ title, onClose, onSave, limits, setLimits, isCreate }) => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-surface2 border border-border rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="font-display text-2xl font-semibold mb-6">{title}</h2>
        <div className="flex flex-col gap-4">
          {isCreate && (
            <>
              <div>
                <label className="text-xs text-muted mb-1.5 block">Monto total del mes</label>
                <input type="number" placeholder="$0" className={inputClass}
                  value={newBudget.total_amount}
                  onChange={e => setNewBudget(p => ({ ...p, total_amount: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted mb-1.5 block">Mes</label>
                  <select className={selectClass} value={newBudget.month}
                    onChange={e => setNewBudget(p => ({ ...p, month: Number(e.target.value) }))}>
                    {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted mb-1.5 block">Año</label>
                  <select className={selectClass} value={newBudget.year}
                    onChange={e => setNewBudget(p => ({ ...p, year: Number(e.target.value) }))}>
                    {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}
          <div>
            <label className="text-xs text-muted mb-2 block">Límites por categoría {isCreate && '(opcional)'}</label>
            <div className="flex flex-col gap-2">
              {categories.length === 0 && (
                <div className="text-xs text-dim">Cargando categorías...</div>
              )}
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center gap-2">
                  <span className="text-sm text-muted w-28 flex-shrink-0">{cat.name}</span>
                  <input type="number" placeholder="$0" className={inputClass}
                    value={limits[cat.id] || ''}
                    onChange={e => setLimits(p => ({ ...p, [cat.id]: e.target.value }))} />
                </div>
              ))}
            </div>
          </div>
          {isCreate && formError && <div className="text-sm text-danger">{formError}</div>}
          <div className="flex gap-2 mt-1">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-md bg-transparent border border-border text-muted cursor-pointer hover:border-gold hover:text-gold transition-all">
              Cancelar
            </button>
            <button onClick={onSave}
              className="flex-[2] py-2.5 rounded-md bg-gold border-none text-black font-semibold cursor-pointer hover:bg-gold-light transition-all">
              {isCreate ? 'Crear' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Layout>
      <div className="fade-up flex justify-between items-start mb-8">
        <div>
          <h1 className="font-display text-4xl font-semibold">Presupuesto</h1>
          <div className="text-sm text-muted mt-1">{MONTHS[month - 1]} {year}</div>
        </div>
        {budget && (
          <div className="flex gap-2">
            <button onClick={handleEdit}
              className="px-4 py-2 rounded-md bg-transparent border border-gold text-gold text-sm cursor-pointer hover:bg-gold-bg transition-all">
              Editar
            </button>
            <button onClick={handleDelete}
              className="px-4 py-2 rounded-md bg-transparent border border-danger text-danger text-sm cursor-pointer hover:opacity-80 transition-all">
              Eliminar
            </button>
          </div>
        )}
      </div>

      {!budget ? (
        <Card className="fade-up-1 text-center py-16 px-8">
          <div className="text-4xl mb-4">◎</div>
          <div className="font-display text-2xl text-white mb-2">Sin presupuesto este mes</div>
          <div className="text-sm text-muted mb-6">Define cuánto quieres gastar en {MONTHS[month - 1]}</div>
          <Button style={{ margin: '0 auto' }} onClick={() => setShowForm(true)}>
            Crear presupuesto
          </Button>
        </Card>
      ) : (
        <>
          <Card className="fade-up-1 mb-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-gold opacity-[0.03]" />
            <div className="text-xs text-dim tracking-[1px] mb-2">DISPONIBLE DEL MES</div>
            <div className="font-display text-5xl font-bold text-gold">
              {formatCOP(budget.remaining || 0)}
            </div>
            <ProgressBar value={budget.total_spent || 0} max={budget.total_amount} />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-dim">Gastado: {formatCOP(budget.total_spent || 0)}</span>
              <span className="text-xs text-dim">Total: {formatCOP(budget.total_amount)}</span>
            </div>
          </Card>

          <div className="text-xs text-dim tracking-[1px] mb-4">POR CATEGORÍA</div>
          <div className="fade-up-3 flex flex-col gap-2.5">
            {(budget.budget_categories || []).length === 0 && (
              <Card className="text-center py-8 text-sm text-dim">
                Sin límites por categoría definidos
              </Card>
            )}
            {(budget.budget_categories || []).map(bc => {
              const pct  = Math.round((bc.spent_amount / bc.limit_amount) * 100)
              const over = bc.spent_amount > bc.limit_amount
              return (
                <Card key={bc.id} className="py-4 px-5">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-white">{bc.categories?.name || 'Categoría'}</div>
                    <div className={`text-sm ${over ? 'text-danger' : 'text-muted'}`}>
                      {formatCOP(bc.spent_amount)} / {formatCOP(bc.limit_amount)}
                    </div>
                  </div>
                  <ProgressBar value={bc.spent_amount} max={bc.limit_amount} />
                  <div className={`text-[11px] mt-1.5 ${over ? 'text-danger' : 'text-dim'}`}>
                    {over
                      ? `Excedido en ${formatCOP(bc.spent_amount - bc.limit_amount)}`
                      : `${pct}% usado · ${formatCOP(bc.limit_amount - bc.spent_amount)} restantes`}
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}

      {showForm && (
        <Modal
          title="Nuevo presupuesto"
          onClose={() => setShowForm(false)}
          onSave={handleCreate}
          limits={catLimits}
          setLimits={setCatLimits}
          isCreate={true}
        />
      )}

      {showEdit && (
        <Modal
          title="Editar presupuesto"
          onClose={() => setShowEdit(false)}
          onSave={handleUpdate}
          limits={editLimits}
          setLimits={setEditLimits}
          isCreate={false}
        />
      )}
    </Layout>
  )
}
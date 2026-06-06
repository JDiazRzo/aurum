import { useState, useEffect } from 'react'
import { Layout } from '../../components/layout/Layout.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { budgetService, categoryService } from '../../services/api.js'
import { formatCOP, currentMonth, currentYear, MONTHS } from '../../utils/format.js'

const ProgressBar = ({ value, max }) => {
  const pct = Math.min((value / max) * 100, 100)
  const color = pct >= 100 ? 'var(--danger)' : pct >= 80 ? 'var(--warn)' : 'var(--gold)'
  return (
    <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden', marginTop: 8 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width .5s ease' }} />
    </div>
  )
}


useEffect(() => {
  categoryService.getAll()
    .then(({ data }) => {
      console.log('Categorías:', data)
      setCategories(data.data || [])
    })
}, [])


export const Budgets = () => {
  const [budget,     setBudget]     = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [formError,  setFormError]  = useState('')
  const [categories, setCategories] = useState([])
  const [catLimits,  setCatLimits]  = useState({})
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
    categoryService.getAll().then(({ data }) => setCategories(data.data || []))
  }, [])

  const handleCreate = async () => {
    if (!newBudget.total_amount || Number(newBudget.total_amount) <= 0)
      return setFormError('Ingresa un monto válido')
    try {
      const cats = Object.entries(catLimits)
        .filter(([_, v]) => v && Number(v) > 0)
        .map(([category_id, limit_amount]) => ({
          category_id,
          limit_amount: Number(limit_amount)
        }))

      const { data } = await budgetService.create({
        total_amount: Number(newBudget.total_amount),
        month:        newBudget.month,
        year:         newBudget.year,
        categories:   cats
      })
      setBudget(data.data)
      setShowForm(false)
      setFormError('')
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al crear presupuesto')
    }
  }

  if (loading) return <Layout><div style={{ color: 'var(--text-dim)', padding: '2rem' }}>Cargando...</div></Layout>

  return (
    <Layout>
      <div className="fade-up" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600 }}>Presupuesto</h1>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
          {MONTHS[month - 1]} {year}
        </div>
      </div>

      {!budget ? (
        <Card className="fade-up-1" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: 32, marginBottom: '1rem' }}>◎</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text)', marginBottom: 8 }}>
            Sin presupuesto este mes
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Define cuánto quieres gastar en {MONTHS[month - 1]}
          </div>
          <Button style={{ margin: '0 auto' }} onClick={() => setShowForm(true)}>
            Crear presupuesto
          </Button>
        </Card>
      ) : (
        <>
          <Card className="fade-up-1" style={{ marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: '50%', background: 'var(--gold)', opacity: .03 }} />
            <div style={{ fontSize: 12, color: 'var(--text-dim)', letterSpacing: 1, marginBottom: 8 }}>DISPONIBLE DEL MES</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 700, color: 'var(--gold)' }}>
              {formatCOP(budget.remaining || 0)}
            </div>
            <ProgressBar value={budget.total_spent || 0} max={budget.total_amount} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Gastado: {formatCOP(budget.total_spent || 0)}</span>
              <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Total: {formatCOP(budget.total_amount)}</span>
            </div>
          </Card>

          <div style={{ fontSize: 12, color: 'var(--text-dim)', letterSpacing: 1, marginBottom: '1rem' }}>POR CATEGORÍA</div>
          <div className="fade-up-3" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(budget.budget_categories || []).length === 0 && (
              <Card style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)', fontSize: 13 }}>
                Sin límites por categoría definidos
              </Card>
            )}
            {(budget.budget_categories || []).map(bc => {
              const pct  = Math.round((bc.spent_amount / bc.limit_amount) * 100)
              const over = bc.spent_amount > bc.limit_amount
              return (
                <Card key={bc.id} style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 14, color: 'var(--text)' }}>{bc.categories?.name || 'Categoría'}</div>
                    <div style={{ fontSize: 13, color: over ? 'var(--danger)' : 'var(--text-muted)' }}>
                      {formatCOP(bc.spent_amount)} / {formatCOP(bc.limit_amount)}
                    </div>
                  </div>
                  <ProgressBar value={bc.spent_amount} max={bc.limit_amount} />
                  <div style={{ fontSize: 11, marginTop: 6, color: over ? 'var(--danger)' : 'var(--text-dim)' }}>
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

      {/* Modal crear presupuesto */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={{
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '1.5rem', width: '100%', maxWidth: 420,
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: '1.5rem' }}>
              Nuevo presupuesto
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Monto total del mes</label>
                <input type="number" placeholder="$0"
                  value={newBudget.total_amount}
                  onChange={e => setNewBudget(p => ({ ...p, total_amount: e.target.value }))}
                  style={{ marginTop: 6 }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Mes</label>
                  <select value={newBudget.month}
                    onChange={e => setNewBudget(p => ({ ...p, month: Number(e.target.value) }))}
                    style={{ marginTop: 6 }}>
                    {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Año</label>
                  <select value={newBudget.year}
                    onChange={e => setNewBudget(p => ({ ...p, year: Number(e.target.value) }))}
                    style={{ marginTop: 6 }}>
                    {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              {/* Límites por categoría */}
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>
                  Límites por categoría (opcional)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {categories.map(cat => (
                    <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)', width: 110, flexShrink: 0 }}>
                        {cat.name}
                      </span>
                      <input type="number" placeholder="$0"
                        value={catLimits[cat.id] || ''}
                        onChange={e => setCatLimits(p => ({ ...p, [cat.id]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {formError && <div style={{ fontSize: 13, color: 'var(--danger)' }}>{formError}</div>}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button onClick={() => setShowForm(false)} style={{
                  flex: 1, padding: '10px', borderRadius: 'var(--radius-md)',
                  background: 'transparent', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', cursor: 'pointer'
                }}>Cancelar</button>
                <button onClick={handleCreate} style={{
                  flex: 2, padding: '10px', borderRadius: 'var(--radius-md)',
                  background: 'var(--gold)', border: 'none',
                  color: '#080808', fontWeight: 600, cursor: 'pointer'
                }}>Crear</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
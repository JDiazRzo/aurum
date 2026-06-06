import { useState, useEffect } from 'react'
import { Layout } from '../../components/layout/Layout.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { budgetService } from '../../services/api.js'
import { formatCOP, currentMonth, currentYear, MONTHS } from '../../utils/format.js'

const ProgressBar = ({ value, max, color }) => {
  const pct = Math.min((value / max) * 100, 100)
  const barColor = pct >= 100 ? 'var(--danger)' : pct >= 80 ? 'var(--warn)' : (color || 'var(--gold)')
  return (
    <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden', marginTop: 8 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 3, transition: 'width .5s ease' }} />
    </div>
  )
}

export const Budgets = () => {
  const [budget,  setBudget]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [month]   = useState(currentMonth())
  const [year]    = useState(currentYear())

  useEffect(() => {
    budgetService.getByMonth(year, month)
      .then(({ data }) => setBudget(data.data))
      .catch(() => setBudget(null))
      .finally(() => setLoading(false))
  }, [month, year])

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
          <Button style={{ margin: '0 auto' }}>Crear presupuesto</Button>
        </Card>
      ) : (
        <>
          {/* Balance global */}
          <Card className="fade-up-1" style={{ marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: '50%', background: 'var(--gold)', opacity: .03 }} />
            <div style={{ fontSize: 12, color: 'var(--text-dim)', letterSpacing: 1, marginBottom: 8 }}>DISPONIBLE DEL MES</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 700, color: 'var(--gold)' }}>
              {formatCOP(budget.remaining || 0)}
            </div>
            <ProgressBar value={budget.total_spent} max={budget.total_amount} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Gastado: {formatCOP(budget.total_spent || 0)}</span>
              <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Total: {formatCOP(budget.total_amount)}</span>
            </div>
          </Card>

          {/* Por categoría */}
          <div style={{ fontSize: 12, color: 'var(--text-dim)', letterSpacing: 1, marginBottom: '1rem' }}>POR CATEGORÍA</div>
          <div className="fade-up-3" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(budget.budget_categories || []).map(bc => {
              const pct = Math.round((bc.spent_amount / bc.limit_amount) * 100)
              const over = bc.spent_amount > bc.limit_amount
              return (
                <Card key={bc.id} style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 14, color: 'var(--text)' }}>
                      {bc.categories?.name || 'Categoría'}
                    </div>
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
    </Layout>
  )
}

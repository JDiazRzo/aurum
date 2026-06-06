import { useState } from 'react'
import { Layout } from '../../components/layout/Layout.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { useTransactions } from '../../hooks/useTransactions.js'
import { transactionService, categoryService } from '../../services/api.js'
import { formatCOP, formatDate, currentMonth, currentYear } from '../../utils/format.js'
import { TransactionForm } from './TransactionForm.jsx'

export const Transactions = () => {
  const [showForm, setShowForm] = useState(false)
  const [filter,   setFilter]   = useState({ month: currentMonth(), year: currentYear() })
  const { transactions, loading, create, remove, refetch } = useTransactions(filter)

  const handleCreate = async (payload) => {
    await create(payload)
    setShowForm(false)
  }

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div className="fade-up">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600 }}>Movimientos</h1>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Registro de tus gastos e ingresos</div>
        </div>
        <Button className="fade-up-1" onClick={() => setShowForm(true)}>
          + Nuevo
        </Button>
      </div>

      {/* Filtros */}
      <Card className="fade-up-2" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <select value={filter.month} onChange={e => setFilter(p => ({ ...p, month: Number(e.target.value) }))}
          style={{ width: 'auto', flex: 1, minWidth: 120 }}>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i+1} value={i+1}>{['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][i]}</option>
          ))}
        </select>
        <select value={filter.year} onChange={e => setFilter(p => ({ ...p, year: Number(e.target.value) }))}
          style={{ width: 'auto', flex: 1, minWidth: 100 }}>
          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={filter.type || ''} onChange={e => setFilter(p => ({ ...p, type: e.target.value || undefined }))}
          style={{ width: 'auto', flex: 1, minWidth: 130 }}>
          <option value="">Todos</option>
          <option value="expense">Gastos</option>
          <option value="income">Ingresos</option>
        </select>
      </Card>

      {/* Lista */}
      <div className="fade-up-3" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading && <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem' }}>Cargando...</div>}
        {!loading && transactions.length === 0 && (
          <Card style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
            Sin movimientos para este período.<br />
            <span style={{ fontSize: 13, marginTop: 8, display: 'block' }}>
              Agrega tu primer movimiento con el botón "Nuevo".
            </span>
          </Card>
        )}
        {transactions.map(tx => (
          <Card key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'var(--gold-bg)', border: '1px solid var(--border2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
            }}>
              {tx.type === 'income' ? '↑' : '↓'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 400 }}>
                {tx.description || 'Sin descripción'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 3, display: 'flex', gap: 8 }}>
                <span>{tx.categories?.name || 'Sin categoría'}</span>
                <span>·</span>
                <span>{formatDate(tx.transaction_date)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                fontSize: 15, fontWeight: 500,
                color: tx.type === 'income' ? 'var(--success)' : 'var(--danger)',
                fontFamily: 'var(--font-display)',
              }}>
                {tx.type === 'income' ? '+' : '-'}{formatCOP(tx.amount)}
              </div>
              <button onClick={() => remove(tx.id)} style={{
                background: 'none', border: 'none', color: 'var(--text-dim)',
                fontSize: 16, cursor: 'pointer', lineHeight: 1, padding: 4,
                transition: 'color .2s',
              }}
                onMouseEnter={e => e.target.style.color = 'var(--danger)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-dim)'}
              >
                ×
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal crear transacción */}
      {showForm && (
        <TransactionForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />
      )}
    </Layout>
  )
}

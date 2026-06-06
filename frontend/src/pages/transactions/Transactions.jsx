import { useState } from 'react'
import { Layout } from '../../components/layout/Layout.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { useTransactions } from '../../hooks/useTransactions.js'
import { formatCOP, formatDate, currentMonth, currentYear, MONTHS } from '../../utils/format.js'
import { TransactionForm } from './TransactionForm.jsx'

export const Transactions = () => {
  const [showForm, setShowForm] = useState(false)
  const [filter,   setFilter]   = useState({ month: currentMonth(), year: currentYear() })
  const { transactions, loading, create, remove } = useTransactions(filter)

  const handleCreate = async (payload) => {
    await create(payload)
    setShowForm(false)
  }

  return (
    <Layout>
      <div className="flex justify-between items-start mb-8">
        <div className="fade-up">
          <h1 className="font-display text-4xl font-semibold">Movimientos</h1>
          <div className="text-sm text-muted mt-1">Registro de tus gastos e ingresos</div>
        </div>
        <Button className="fade-up-1" onClick={() => setShowForm(true)}>
          + Nuevo
        </Button>
      </div>

      {/* Filtros */}
      <Card className="fade-up-2 mb-6 flex gap-4 flex-wrap">
        <select
          value={filter.month}
          onChange={e => setFilter(p => ({ ...p, month: Number(e.target.value) }))}
          className="flex-1 min-w-[120px] bg-surface2 border border-border rounded-md px-3 py-2 text-sm text-white outline-none focus:border-gold"
        >
          {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
        </select>
        <select
          value={filter.year}
          onChange={e => setFilter(p => ({ ...p, year: Number(e.target.value) }))}
          className="flex-1 min-w-[100px] bg-surface2 border border-border rounded-md px-3 py-2 text-sm text-white outline-none focus:border-gold"
        >
          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select
          value={filter.type || ''}
          onChange={e => setFilter(p => ({ ...p, type: e.target.value || undefined }))}
          className="flex-1 min-w-[130px] bg-surface2 border border-border rounded-md px-3 py-2 text-sm text-white outline-none focus:border-gold"
        >
          <option value="">Todos</option>
          <option value="expense">Gastos</option>
          <option value="income">Ingresos</option>
        </select>
      </Card>

      {/* Lista */}
      <div className="fade-up-3 flex flex-col gap-2">
        {loading && (
          <div className="text-center text-dim py-8">Cargando...</div>
        )}
        {!loading && transactions.length === 0 && (
          <Card className="text-center py-12">
            <div className="text-dim">Sin movimientos para este período.</div>
            <div className="text-sm text-dim mt-2">Agrega tu primer movimiento con el botón "Nuevo".</div>
          </Card>
        )}
        {transactions.map(tx => (
          <Card key={tx.id} className="flex items-center gap-4 py-4 px-5">
            <div className="w-10 h-10 rounded-[10px] bg-gold-bg border border-border2 flex items-center justify-center text-lg flex-shrink-0">
              {tx.type === 'income' ? '↑' : '↓'}
            </div>
            <div className="flex-1">
              <div className="text-sm text-white">{tx.description || 'Sin descripción'}</div>
              <div className="text-[11px] text-dim mt-0.5 flex gap-2">
                <span>{tx.categories?.name || 'Sin categoría'}</span>
                <span>·</span>
                <span>{formatDate(tx.transaction_date)}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`text-sm font-medium font-display ${tx.type === 'income' ? 'text-success' : 'text-danger'}`}>
                {tx.type === 'income' ? '+' : '-'}{formatCOP(tx.amount)}
              </div>
              <button
                onClick={() => remove(tx.id)}
                className="text-dim text-lg bg-transparent border-none cursor-pointer leading-none p-1 transition-colors hover:text-danger"
              >
                ×
              </button>
            </div>
          </Card>
        ))}
      </div>

      {showForm && (
        <TransactionForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />
      )}
    </Layout>
  )
}
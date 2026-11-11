import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Layout } from '../../components/layout/Layout.jsx'
import { RebalanceCard } from '../../components/dashboard/RebalanceCard.jsx'
import { DashboardSkeleton } from '../../components/ui/Skeleton.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useSummary, useTransactions, useMonthlyTrend, useStreak, useBudgetDashboard, useRebalance } from '../../hooks/useTransactions.js'
import { transactionService, budgetService } from '../../services/api.js'
import { formatCOP, formatDate, currentMonth, currentYear, MONTHS } from '../../utils/format.js'

const StatCard = ({ label, amount, color, delay }) => (
  <Card className={`fade-up-${delay} flex-1`}>
    <div className="text-[11px] text-dim tracking-[1px] mb-2">{label}</div>
    <div className={`text-[22px] font-medium font-display ${color}`}>
      {formatCOP(amount || 0)}
    </div>
  </Card>
)

export const Dashboard = () => {
  const { profile }   = useAuth()
  const month         = currentMonth()
  const year          = currentYear()
  const { summary, loading: summaryLoading, refetch: refetchSummary } = useSummary(month, year)
  const { trend } = useMonthlyTrend(6)
  const { streak } = useStreak()
  const { budget } = useBudgetDashboard()
  const { rebalance } = useRebalance()
  const { transactions, refetch: refetchTransactions } = useTransactions({ month, year, limit: 5 })
  const [anomalies,       setAnomalies]       = useState([])
  const [recurringNext,   setRecurringNext]   = useState(null)
  const [healthScore,     setHealthScore]     = useState(null)

  const fetchRecurring = () =>
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/transactions/recurring-next`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('aurum_token')}` }
    })
      .then(r => r.json())
      .then(d => setRecurringNext(d.data || null))
      .catch(() => {})

  const fetchAnomalies = () => transactionService.anomalies()
    .then(({ data }) => setAnomalies(data.data || []))

  useEffect(() => { fetchAnomalies(); fetchRecurring() }, [])

  const refreshDashboard = () => Promise.all([
    refetchSummary(),
    refetchTransactions(),
    fetchAnomalies()
  ])

  // Score de salud financiera: 0-100 basado en % ahorro
  const scoreValue = (() => {
    if (!summary?.total_income || summary.total_income === 0) return null
    const ratio = summary.balance / summary.total_income
    if (ratio >= 0.3)  return { score: 95, label: 'Excelente', color: '#00C9A7' }
    if (ratio >= 0.15) return { score: 75, label: 'Bueno',     color: '#C9A84C' }
    if (ratio >= 0)    return { score: 50, label: 'Regular',   color: '#E8A020' }
    return               { score: 20, label: 'En déficit',  color: '#E05252' }
  })()

  const topCategory = (() => {
    if (!summary?.by_category) return null
    const entries = Object.entries(summary.by_category)
    if (!entries.length) return null
    entries.sort((a, b) => b[1] - a[1])
    return { name: entries[0][0], amount: entries[0][1] }
  })()

  // Tendencia real: últimos 6 meses desde el backend
  const chartData = trend.length > 0
    ? trend.map(t => ({
        mes:     MONTHS[t.month - 1].slice(0, 3),
        gastos:  t.expense,
        ingresos: t.income
      }))
    : [{ mes: MONTHS[month - 1].slice(0, 3), gastos: summary?.total_expense || 0, ingresos: summary?.total_income || 0 }]

  // Comparación vs mes anterior
  const prevMonth = trend.length >= 2 ? trend[trend.length - 2] : null
  const currMonth = trend.length >= 1 ? trend[trend.length - 1] : null
  const expenseDiff = (prevMonth && currMonth)
    ? currMonth.expense - prevMonth.expense
    : null
  const expensePct = (prevMonth?.expense > 0 && expenseDiff !== null)
    ? Math.round((expenseDiff / prevMonth.expense) * 100)
    : null

  if (summaryLoading) return (
    <Layout>
      <DashboardSkeleton />
    </Layout>
  )

  return (
    <Layout>
     
      <div className="fade-up mb-8">
        <div className="text-sm text-gold/60 mb-1">Bienvenido de nuevo</div>
        <h1 className="font-display text-4xl font-semibold text-white">
          {profile?.full_name || 'Usuario'}
        </h1>
        <div className="text-sm text-muted mt-1">{MONTHS[month - 1]} {year}</div>
      </div>

      <Card className="fade-up-1 mb-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-gold opacity-[0.03]" />
        <div className="text-xs text-dim tracking-[1px] mb-2">BALANCE DEL MES</div>
        <div className="font-display text-4xl md:text-5xl font-bold text-gold tracking-tight">
          {formatCOP(summary?.balance || 0)}
        </div>
        <div className="text-sm text-muted mt-1.5">
          {(summary?.balance || 0) >= 0 ? '↑ Positivo' : '↓ Negativo'} este mes
        </div>
      </Card>

   
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <StatCard label="INGRESOS" amount={summary?.total_income}  color="text-success" delay={2} />
        <StatCard label="GASTOS"   amount={summary?.total_expense} color="text-danger"  delay={3} />
      </div>

     
      <Card className="fade-up-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs text-dim tracking-[1px]">TENDENCIA — ÚLTIMOS 6 MESES</div>
          <div className="flex gap-3 text-xs text-dim">
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-success/70" />
              Ingresos
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-gold/70" />
              Gastos
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#C9A84C" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#C9A84C" stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#00C9A7" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#00C9A7" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <XAxis dataKey="mes" tick={{ fill: '#7a6e52', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: '#1c1a0f', border: '1px solid #2a2410', borderRadius: 8, fontSize: 12 }}
              formatter={(v, name) => [formatCOP(v), name === 'gastos' ? 'Gastos' : 'Ingresos']}
              labelStyle={{ color: '#7a6e52' }}
            />
            <Area type="monotone" dataKey="ingresos" stroke="#00C9A7" strokeWidth={1.5} fill="url(#greenGrad)" strokeDasharray="4 2" />
            <Area type="monotone" dataKey="gastos"   stroke="#C9A84C" strokeWidth={2}   fill="url(#goldGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
     
        <Card>
          <div className="text-xs text-dim tracking-[1px] mb-4">ÚLTIMOS MOVIMIENTOS</div>
          <div className="flex flex-col gap-2.5">
            {transactions.length === 0 && (
              <div className="text-sm text-dim text-center py-4">Sin movimientos este mes</div>
            )}
            {transactions.map(tx => (
              <div key={tx.id} className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-white">{tx.description || 'Sin descripción'}</div>
                  <div className="text-[11px] text-dim mt-0.5">
                    {tx.categories?.name} · {formatDate(tx.transaction_date)}
                  </div>
                </div>
                <div className={`text-sm font-medium ${tx.type === 'income' ? 'text-success' : 'text-danger'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCOP(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="text-xs text-dim tracking-[1px] mb-4">GASTOS INUSUALES</div>
          <div className="flex flex-col gap-2.5">
            {anomalies.length === 0 && (
              <div className="text-sm text-success text-center py-4">✓ Sin alertas este mes</div>
            )}
            {anomalies.slice(0, 4).map(tx => (
              <div key={tx.id} className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-white">{tx.description || 'Sin descripción'}</div>
                  <Badge variant="warn" className="mt-1">⚠ {tx.reason}</Badge>
                </div>
                <div className="text-sm font-medium text-danger">
                  -{formatCOP(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Fila de insights ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">

        {/* Comparación mes anterior */}
        <Card className="fade-up-5">
          <div className="text-xs text-dim tracking-[1px] mb-3">VS MES ANTERIOR</div>
          {expensePct !== null ? (
            <>
              <div className="flex items-end gap-2 mb-1">
                <span
                  className="font-display text-4xl font-bold"
                  style={{ color: expenseDiff > 0 ? '#E05252' : '#00C9A7' }}
                >
                  {expenseDiff > 0 ? '+' : ''}{expensePct}%
                </span>
              </div>
              <div
                className="text-sm font-medium mb-2"
                style={{ color: expenseDiff > 0 ? '#E05252' : '#00C9A7' }}
              >
                {expenseDiff > 0 ? '↑ Más gasto' : '↓ Menos gasto'}
              </div>
              <p className="text-xs text-dim">
                {expenseDiff > 0
                  ? `Gastaste ${formatCOP(Math.abs(expenseDiff))} más que el mes pasado`
                  : `Gastaste ${formatCOP(Math.abs(expenseDiff))} menos que el mes pasado`}
              </p>
            </>
          ) : (
            <p className="text-sm text-dim py-2">Sin datos comparativos</p>
          )}
        </Card>

        {/* Salud financiera */}
        <Card className="fade-up-5">
          <div className="text-xs text-dim tracking-[1px] mb-3">SALUD FINANCIERA</div>
          {scoreValue ? (
            <>
              <div className="flex items-end gap-2 mb-2">
                <span className="font-display text-4xl font-bold" style={{ color: scoreValue.color }}>
                  {scoreValue.score}
                </span>
                <span className="text-muted text-sm mb-1">/100</span>
              </div>
              <div className="text-sm font-medium mb-2" style={{ color: scoreValue.color }}>
                {scoreValue.label}
              </div>
              {/* Barra de progreso */}
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${scoreValue.score}%`, background: scoreValue.color }}
                />
              </div>
              <p className="text-xs text-dim mt-2">
                {summary?.total_income > 0
                  ? `Ahorras el ${Math.max(0, Math.round((summary.balance / summary.total_income) * 100))}% de tus ingresos`
                  : 'Registra ingresos para calcular tu score'}
              </p>
            </>
          ) : (
            <p className="text-sm text-dim py-2">Sin datos este mes</p>
          )}
        </Card>

        {/* Top categoría de gasto */}
        <Card className="fade-up-6">
          <div className="text-xs text-dim tracking-[1px] mb-3">MAYOR GASTO</div>
          {topCategory ? (
            <>
              <div className="font-display text-lg font-semibold text-white mb-1 truncate">
                {topCategory.name}
              </div>
              <div className="text-danger text-2xl font-bold font-display">
                -{formatCOP(topCategory.amount)}
              </div>
              {summary?.total_expense > 0 && (
                <>
                  <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-danger/70"
                      style={{ width: `${Math.min(100, Math.round((topCategory.amount / summary.total_expense) * 100))}%` }}
                    />
                  </div>
                  <p className="text-xs text-dim mt-2">
                    {Math.round((topCategory.amount / summary.total_expense) * 100)}% del gasto total
                  </p>
                </>
              )}
            </>
          ) : (
            <p className="text-sm text-dim py-2">Sin gastos categorizados</p>
          )}
        </Card>

        {/* Próximo gasto recurrente */}
        <Card className="fade-up-7">
          <div className="text-xs text-dim tracking-[1px] mb-3">PRÓXIMO RECURRENTE</div>
          {recurringNext ? (
            <>
              <div className="font-display text-lg font-semibold text-white mb-1 truncate">
                {recurringNext.name}
              </div>
              <div className="text-gold text-2xl font-bold font-display">
                {formatCOP(recurringNext.amount)}
              </div>
              <p className="text-xs text-dim mt-2">
                Vence: {formatDate(recurringNext.next_due_date)}
              </p>
            </>
          ) : (
            <p className="text-sm text-dim py-2">Sin gastos recurrentes</p>
          )}
        </Card>

        {/* Presupuesto del mes */}
        <Card className="fade-up-7">
          <div className="text-xs text-dim tracking-[1px] mb-3">PRESUPUESTO DEL MES</div>
          {budget ? (
            <>
              <div className="flex items-end gap-2 mb-1">
                <span
                  className="font-display text-4xl font-bold"
                  style={{ color: budget.total_spent > budget.total_amount ? '#E05252' : '#C9A84C' }}
                >
                  {Math.min(100, Math.round((budget.total_spent / budget.total_amount) * 100))}%
                </span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, Math.round((budget.total_spent / budget.total_amount) * 100))}%`,
                    background: budget.total_spent > budget.total_amount ? '#E05252' : '#C9A84C'
                  }}
                />
              </div>
              <p className="text-xs text-dim mt-2">
                {budget.total_spent > budget.total_amount
                  ? `Excedido por ${formatCOP(budget.total_spent - budget.total_amount)}`
                  : `Quedan ${formatCOP(budget.total_amount - budget.total_spent)} disponibles`}
              </p>
            </>
          ) : (
            <p className="text-sm text-dim py-2">Sin presupuesto este mes</p>
          )}
        </Card>

        {/* Racha de registro */}
        <Card className="fade-up-8">
          <div className="text-xs text-dim tracking-[1px] mb-3">RACHA DE REGISTRO</div>
          {streak !== null ? (
            <>
              <div className="flex items-end gap-2 mb-1">
                <span className="font-display text-4xl font-bold text-gold">
                  {streak}
                </span>
              </div>
              <div className="text-sm font-medium text-gold/80 mb-1">
                {streak === 1 ? 'día consecutivo' : 'días consecutivos'}
              </div>
              <p className="text-xs text-dim">
                {streak === 0
                  ? 'Registra una transacción hoy para comenzar tu racha'
                  : streak >= 7
                    ? '¡Excelente disciplina financiera!'
                    : 'Sigue registrando para mantener tu racha'}
              </p>
            </>
          ) : (
            <p className="text-sm text-dim py-2">—</p>
          )}
        </Card>


      </div>

      {/* ── Análisis Isolation Forest ───── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <RebalanceCard rebalance={rebalance} />
      </div>

    </Layout>
  )
}

import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Layout } from '../../components/layout/Layout.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Badge } from '../../components/ui/Badge.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useSummary, useTransactions } from '../../hooks/useTransactions.js'
import { transactionService } from '../../services/api.js'
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
  const { summary }   = useSummary(month, year)
  const { transactions } = useTransactions({ month, year, limit: 5 })
  const [anomalies, setAnomalies] = useState([])

  useEffect(() => {
    transactionService.anomalies().then(({ data }) => setAnomalies(data.data || []))
  }, [])

  const chartData = summary?.by_category
  ? Object.entries(summary.by_category).map(([name, amount]) => ({
      mes: name,
      gastos: amount
    }))
  : [{ mes: MONTHS[month - 1], gastos: summary?.total_expense || 0 }]

  return (
    <Layout>
      {/* Header */}
      <div className="fade-up mb-8">
        <div className="text-sm text-muted mb-1">Bienvenido de nuevo</div>
        <h1 className="font-display text-4xl font-semibold text-white">
          {profile?.full_name || 'Usuario'}
        </h1>
        <div className="text-sm text-muted mt-1">{MONTHS[month - 1]} {year}</div>
      </div>

      {/* Balance principal */}
      <Card className="fade-up-1 mb-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-gold opacity-[0.03]" />
        <div className="text-xs text-dim tracking-[1px] mb-2">BALANCE DEL MES</div>
        <div className="font-display text-5xl font-bold text-gold tracking-tight">
          {formatCOP(summary?.balance || 0)}
        </div>
        <div className="text-sm text-muted mt-1.5">
          {(summary?.balance || 0) >= 0 ? '↑ Positivo' : '↓ Negativo'} este mes
        </div>
      </Card>

      {/* Stats */}
      <div className="flex gap-4 mb-6">
        <StatCard label="INGRESOS" amount={summary?.total_income}  color="text-success" delay={2} />
        <StatCard label="GASTOS"   amount={summary?.total_expense} color="text-danger"  delay={3} />
      </div>

      {/* Gráfica */}
      <Card className="fade-up-4 mb-6">
        <div className="text-xs text-dim tracking-[1px] mb-4">TENDENCIA DE GASTOS</div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#C9A84C" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#C9A84C" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <XAxis dataKey="mes" tick={{ fill: '#7a6e52', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: '#1c1a0f', border: '1px solid #2a2410', borderRadius: 8, fontSize: 12 }}
              formatter={(v) => [formatCOP(v), 'Gastos']}
              labelStyle={{ color: '#7a6e52' }}
            />
            <Area type="monotone" dataKey="gastos" stroke="#C9A84C" strokeWidth={2} fill="url(#goldGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {/* Últimos movimientos */}
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

        {/* Anomalías */}
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
    </Layout>
  )
}
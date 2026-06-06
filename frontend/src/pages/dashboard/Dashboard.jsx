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
  <Card className={`fade-up-${delay}`} style={{ flex: 1 }}>
    <div style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: 1, marginBottom: 8 }}>
      {label}
    </div>
    <div style={{ fontSize: 22, fontWeight: 500, color, fontFamily: 'var(--font-display)' }}>
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

  // Datos para la gráfica de área
  const chartData = [
    { mes: 'Ene', gastos: 1800000 },
    { mes: 'Feb', gastos: 2100000 },
    { mes: 'Mar', gastos: 1600000 },
    { mes: 'Abr', gastos: 2400000 },
    { mes: 'May', gastos: summary?.total_expense || 0 },
  ]

  return (
    <Layout>
      {/* Header */}
      <div className="fade-up" style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 4 }}>
          Bienvenido de nuevo
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, color: 'var(--text)' }}>
          {profile?.full_name || 'Usuario'}
        </h1>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
          {MONTHS[month - 1]} {year}
        </div>
      </div>

      {/* Balance principal */}
      <Card className="fade-up-1" style={{ marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: '50%', background: 'var(--gold)', opacity: .03 }} />
        <div style={{ fontSize: 12, color: 'var(--text-dim)', letterSpacing: 1, marginBottom: 8 }}>BALANCE DEL MES</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 700, color: 'var(--gold)', letterSpacing: -1 }}>
          {formatCOP(summary?.balance || 0)}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
          {summary?.balance >= 0 ? '↑ Positivo' : '↓ Negativo'} este mes
        </div>
      </Card>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard label="INGRESOS" amount={summary?.total_income}  color="var(--success)" delay={2} />
        <StatCard label="GASTOS"   amount={summary?.total_expense} color="var(--danger)"  delay={3} />
      </div>

      {/* Gráfica */}
      <Card className="fade-up-4" style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', letterSpacing: 1, marginBottom: '1rem' }}>
          TENDENCIA DE GASTOS
        </div>
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
              contentStyle={{ background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
              formatter={(v) => [formatCOP(v), 'Gastos']}
              labelStyle={{ color: 'var(--text-muted)' }}
            />
            <Area type="monotone" dataKey="gastos" stroke="#C9A84C" strokeWidth={2} fill="url(#goldGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Últimos movimientos */}
        <Card>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', letterSpacing: 1, marginBottom: '1rem' }}>
            ÚLTIMOS MOVIMIENTOS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {transactions.length === 0 && (
              <div style={{ fontSize: 13, color: 'var(--text-dim)', textAlign: 'center', padding: '1rem 0' }}>
                Sin movimientos este mes
              </div>
            )}
            {transactions.map(tx => (
              <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text)' }}>{tx.description || 'Sin descripción'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
                    {tx.categories?.name} · {formatDate(tx.transaction_date)}
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: tx.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                  {tx.type === 'income' ? '+' : '-'}{formatCOP(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Anomalías */}
        <Card>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', letterSpacing: 1, marginBottom: '1rem' }}>
            GASTOS INUSUALES
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {anomalies.length === 0 && (
              <div style={{ fontSize: 13, color: 'var(--success)', textAlign: 'center', padding: '1rem 0' }}>
                ✓ Sin alertas este mes
              </div>
            )}
            {anomalies.slice(0, 4).map(tx => (
              <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text)' }}>{tx.description || 'Sin descripción'}</div>
                  <Badge variant="warn" style={{ marginTop: 3 }}>⚠ {tx.reason}</Badge>
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--danger)' }}>
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

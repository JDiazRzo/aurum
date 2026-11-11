import { Card } from '../ui/Card.jsx'
import { formatCOP } from '../../utils/format.js'

const RiskGauge = ({ score }) => {
  const color  = score >= 70 ? '#00C9A7' : score >= 40 ? '#E8A020' : '#E05252'
  const label  = score >= 70 ? 'Normal'  : score >= 40 ? 'Inusual' : 'En riesgo'
  return (
    <div className="flex items-end gap-2 mb-2">
      <span className="font-display text-4xl font-bold" style={{ color }}>{score}</span>
      <span className="text-muted text-sm mb-1">/100</span>
      <span className="text-sm font-medium mb-1" style={{ color }}>{label}</span>
    </div>
  )
}

export const RebalanceCard = ({ rebalance }) => {
  if (!rebalance) return (
    <Card className="md:col-span-2 lg:col-span-3">
      <div className="text-xs text-dim tracking-[1px] mb-2">ANÁLISIS DE PATRÓN</div>
      <p className="text-sm text-dim py-2">
        Crea un presupuesto este mes para activar el análisis inteligente
      </p>
    </Card>
  )

  const { risk, alert, suggestions } = rebalance
  const hasAlert       = !!alert
  const hasSuggestions = suggestions?.length > 0

  return (
    <Card className="md:col-span-2 lg:col-span-3 fade-up-9">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs text-dim tracking-[1px]">ANÁLISIS DE PATRÓN — ISOLATION FOREST</div>
        {hasAlert && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-danger/10 text-danger border border-danger/20">
            ⚠ Patrón inusual
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Score de riesgo */}
        <div>
          <div className="text-xs text-dim mb-2">ÍNDICE DE NORMALIDAD</div>
          {risk?.risk_score !== null && risk?.risk_score !== undefined ? (
            <>
              <RiskGauge score={risk.risk_score} />
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-3">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${risk.risk_score}%`,
                    background: risk.risk_score >= 70 ? '#00C9A7' : risk.risk_score >= 40 ? '#E8A020' : '#E05252'
                  }}
                />
              </div>
              {alert ? (
                <p className="text-xs text-danger/80 leading-relaxed">{alert}</p>
              ) : (
                <p className="text-xs text-dim">Tu comportamiento de gasto este mes sigue tu patrón histórico</p>
              )}
            </>
          ) : (
            <p className="text-sm text-dim">Registra más transacciones para activar el análisis</p>
          )}
        </div>

        {/* Sugerencias de redistribución */}
        <div>
          <div className="text-xs text-dim mb-2">SUGERENCIAS DE AJUSTE</div>
          {hasSuggestions ? (
            <div className="flex flex-col gap-3">
              {suggestions.slice(0, 2).map((s, i) => (
                <div key={i} className="rounded-lg bg-white/[0.03] border border-white/5 p-3">
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-sm font-medium text-white">{s.category}</span>
                    <span className="text-xs text-danger">+{formatCOP(s.overshoot)} proyectado</span>
                  </div>
                  <p className="text-xs text-dim leading-relaxed mb-2">{s.message}</p>
                  {s.transfers?.slice(0, 2).map((t, j) => (
                    <div key={j} className="flex items-center gap-1.5 text-xs text-gold/70">
                      <span>↓ Reducir {t.from_category}</span>
                      <span className="text-gold font-medium">{formatCOP(t.amount)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-success text-sm py-2">
              <span>✓</span>
              <span>Todas las categorías están dentro del límite proyectado</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

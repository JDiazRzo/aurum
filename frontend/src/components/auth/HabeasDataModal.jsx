import { useState } from 'react'
import { profileService } from '../../services/api.js'

export const HabeasDataModal = ({ onAccept }) => {
  const [loading, setLoading] = useState(false)

  const handleAccept = async () => {
    setLoading(true)
    try {
      await profileService.acceptHabeasData()
      onAccept()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-gold/20 p-8"
        style={{ background: 'linear-gradient(135deg, #1a1500 0%, #0d0d00 100%)' }}
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gold/10 border border-gold/30 mb-3">
            <svg className="w-7 h-7 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 12c0 6.627 5.373 12 12 12s12-5.373 12-12c0-2.1-.54-4.073-1.487-5.793" />
            </svg>
          </div>
          <h2 className="font-display text-2xl font-semibold text-gold">Tratamiento de Datos</h2>
          <p className="text-sm text-muted mt-1">Habeas Data — Ley 1581 de 2012</p>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 mb-6 max-h-56 overflow-y-auto text-sm text-muted leading-relaxed space-y-3">
          <p>
            <span className="text-gold/80 font-medium">AURUM</span>, desarrollado por
            Jerónimo Alejandro Díaz Rozo y Samuel Kalell Zuñiga Molina como proyecto de grado
            en la <strong className="text-white/60">Universidad EAN</strong>, recopila y
            procesa los siguientes datos personales:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-white/50">
            <li>Nombre completo y correo electrónico</li>
            <li>Información financiera personal (ingresos, gastos y categorías)</li>
            <li>Datos de uso e interacción con la plataforma</li>
          </ul>
          <p>
            <strong className="text-white/60">Finalidad:</strong> los datos se usan exclusivamente
            para brindar las funcionalidades de la aplicación (análisis financiero personal,
            detección de anomalías, asistente de IA) y con fines académicos de investigación.
          </p>
          <p>
            <strong className="text-white/60">Derechos:</strong> puedes conocer, actualizar,
            rectificar o suprimir tus datos en cualquier momento desde la configuración de tu
            perfil o contactándonos directamente.
          </p>
          <p>
            <strong className="text-white/60">Almacenamiento:</strong> los datos se almacenan
            de forma segura en Supabase con cifrado en tránsito y en reposo. No compartimos tu
            información con terceros.
          </p>
          <p className="text-white/40 text-xs">
            Al continuar aceptas nuestra Política de Tratamiento de Datos Personales conforme
            a la Ley Estatutaria 1581 de 2012 y el Decreto 1377 de 2013.
          </p>
        </div>

        <button
          onClick={handleAccept}
          disabled={loading}
          className="w-full py-3 rounded-xl font-medium text-sm transition-all"
          style={{
            background: loading ? 'rgba(201,168,76,0.3)' : 'linear-gradient(135deg, #C9A84C, #a07a28)',
            color:  loading ? '#7a6e52' : '#0d0d00',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Guardando…' : 'Acepto el tratamiento de mis datos'}
        </button>

        <p className="text-center text-xs text-dim mt-3">
          Debes aceptar para usar AURUM
        </p>
      </div>
    </div>
  )
}

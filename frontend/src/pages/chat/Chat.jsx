import { useState, useRef, useEffect } from 'react'
import { Layout } from '../../components/layout/Layout.jsx'
import { Card } from '../../components/ui/Card.jsx'
import api from '../../services/api.js'

const Message = ({ msg }) => {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '1rem',
    }}>
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: 10, background: 'var(--gold-bg)',
          border: '1px solid var(--border2)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 14, marginRight: 10, flexShrink: 0,
        }}>◈</div>
      )}
      <div style={{
        maxWidth: '75%', padding: '10px 14px', borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        background: isUser ? 'var(--gold)' : 'var(--surface2)',
        border: isUser ? 'none' : '1px solid var(--border)',
        color: isUser ? '#080808' : 'var(--text)',
        fontSize: 14, lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
      }}>
        {msg.content}
      </div>
    </div>
  )
}

const TypingIndicator = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
    <div style={{
      width: 32, height: 32, borderRadius: 10, background: 'var(--gold-bg)',
      border: '1px solid var(--border2)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: 14, flexShrink: 0,
    }}>◈</div>
    <div style={{
      padding: '10px 16px', borderRadius: '16px 16px 16px 4px',
      background: 'var(--surface2)', border: '1px solid var(--border)',
      display: 'flex', gap: 4, alignItems: 'center',
    }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)',
          animation: `bounce 1.2s ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
    <style>{`
      @keyframes bounce {
        0%, 80%, 100% { transform: translateY(0); opacity: .4; }
        40% { transform: translateY(-6px); opacity: 1; }
      }
    `}</style>
  </div>
)

const SUGGESTIONS = [
  '¿En qué gasté más este mes?',
  '¿Cómo va mi presupuesto?',
  '¿Tengo gastos inusuales?',
  'Dame un consejo para ahorrar',
]

export const Chat = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '¡Hola! Soy Aurum, tu asistente financiero personal. Puedo analizar tus gastos, revisar tu presupuesto y darte consejos financieros. ¿En qué te puedo ayudar hoy?'
    }
  ])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text) => {
    const message = text || input.trim()
    if (!message || loading) return

    const userMsg = { role: 'user', content: message }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      // Historial sin el mensaje de bienvenida inicial
      const history = messages.slice(1).map(m => ({
        role:    m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }))

      const { data } = await api.post('/chat', { message, history })
      setMessages(prev => [...prev, { role: 'assistant', content: data.data.reply }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Ocurrió un error al procesar tu mensaje. Intenta de nuevo.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <Layout>
      <div className="fade-up" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600 }}>Asistente</h1>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
          Pregúntame sobre tus finanzas
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
        {/* Área de mensajes */}
        <Card style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', padding: '1.5rem' }}>
          {messages.map((msg, i) => <Message key={i} msg={msg} />)}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </Card>

        {/* Sugerencias */}
        {messages.length === 1 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1rem' }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => sendMessage(s)} style={{
                padding: '8px 14px', borderRadius: 20, fontSize: 12,
                background: 'var(--surface2)', border: '1px solid var(--border)',
                color: 'var(--text-muted)', cursor: 'pointer', transition: 'all .2s',
              }}
                onMouseEnter={e => { e.target.style.borderColor = 'var(--gold)'; e.target.style.color = 'var(--gold)' }}
                onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-muted)' }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ display: 'flex', gap: 8 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu pregunta... (Enter para enviar)"
            rows={1}
            style={{
              flex: 1, resize: 'none', borderRadius: 'var(--radius-md)',
              padding: '12px 14px', fontSize: 14, lineHeight: 1.5,
              background: 'var(--surface2)', border: '1px solid var(--border)',
              color: 'var(--text)', outline: 'none', transition: 'border-color .2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--gold)'}
            onBlur={e  => e.target.style.borderColor = 'var(--border)'}
          />
          <button onClick={() => sendMessage()} disabled={!input.trim() || loading} style={{
            width: 46, height: 46, borderRadius: 'var(--radius-md)',
            background: input.trim() && !loading ? 'var(--gold)' : 'var(--surface2)',
            border: '1px solid var(--border)', cursor: input.trim() ? 'pointer' : 'default',
            color: input.trim() && !loading ? '#080808' : 'var(--text-dim)',
            fontSize: 18, transition: 'all .2s', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            ↑
          </button>
        </div>
      </div>
    </Layout>
  )
}

import { useState, useRef, useEffect } from 'react'
import { Layout } from '../../components/layout/Layout.jsx'
import { Card } from '../../components/ui/Card.jsx'
import api from '../../services/api.js'

const Message = ({ msg }) => {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-[10px] bg-gold-bg border border-border2 flex items-center justify-center text-sm mr-2.5 flex-shrink-0">
          ◈
        </div>
      )}
      <div className={`max-w-[75%] px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
        isUser
          ? 'bg-gold text-black rounded-[16px_16px_4px_16px]'
          : 'bg-surface2 border border-border text-white rounded-[16px_16px_16px_4px]'
      }`}>
        {msg.content}
      </div>
    </div>
  )
}

const TypingIndicator = () => (
  <div className="flex items-center gap-2.5 mb-4">
    <div className="w-8 h-8 rounded-[10px] bg-gold-bg border border-border2 flex items-center justify-center text-sm flex-shrink-0">
      ◈
    </div>
    <div className="px-4 py-2.5 rounded-[16px_16px_16px_4px] bg-surface2 border border-border flex gap-1 items-center">
      {[0, 1, 2].map(i => (
        <div key={i} className="w-1.5 h-1.5 rounded-full bg-gold"
          style={{ animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
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
    { role: 'assistant', content: '¡Hola! Soy Aurum, tu asistente financiero personal. Puedo analizar tus gastos, revisar tu presupuesto y darte consejos financieros. ¿En qué te puedo ayudar hoy?' }
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
      <div className="fade-up mb-6">
        <h1 className="font-display text-4xl font-semibold">Asistente</h1>
        <div className="text-sm text-muted mt-1">Pregúntame sobre tus finanzas</div>
      </div>

      <div className="flex flex-col" style={{ height: 'calc(100vh - 280px)' }}>
        <Card className="flex-1 overflow-y-auto mb-4 p-6">
          {messages.map((msg, i) => <Message key={i} msg={msg} />)}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </Card>

        {messages.length === 1 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => sendMessage(s)}
                className="px-3.5 py-2 rounded-full text-xs bg-surface2 border border-border text-muted cursor-pointer transition-all hover:border-gold hover:text-gold">
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu pregunta... (Enter para enviar)"
            rows={1}
            className="flex-1 resize-none rounded-md px-3.5 py-3 text-sm leading-relaxed bg-surface2 border border-border text-white outline-none transition-colors focus:border-gold placeholder:text-dim"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className={`w-11 h-11 rounded-md border flex items-center justify-center text-lg transition-all ${
              input.trim() && !loading
                ? 'bg-gold border-gold text-black cursor-pointer hover:bg-gold-light'
                : 'bg-surface2 border-border text-dim cursor-not-allowed'
            }`}
          >
            ↑
          </button>
        </div>
      </div>
    </Layout>
  )
}
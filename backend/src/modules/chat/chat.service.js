import { supabase } from '../../../config/supabase.js'
import { AppError } from '../../utils/AppError.js'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL   = 'llama-3.3-70b-versatile'

const getUserFinancialContext = async (authUserId) => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, currency')
    .eq('auth_user_id', authUserId)
    .single()

  if (!profile) return ''

  const now   = new Date()
  const month = now.getMonth() + 1
  const year  = now.getFullYear()
  const from  = `${year}-${String(month).padStart(2, '0')}-01`
  const to    = new Date(year, month, 0).toISOString().split('T')[0]

  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, type, description, transaction_date, categories(name)')
    .eq('user_id', profile.id)
    .gte('transaction_date', from)
    .lte('transaction_date', to)
    .order('transaction_date', { ascending: false })
    .limit(50)

  const { data: budget } = await supabase
    .from('budgets')
    .select(`total_amount, month, year, budget_categories ( limit_amount, spent_amount, categories(name) )`)
    .eq('user_id', profile.id)
    .eq('month', month)
    .eq('year', year)
    .single()

  const expenses     = (transactions || []).filter(t => t.type === 'expense')
  const incomes      = (transactions || []).filter(t => t.type === 'income')
  const totalExpense = expenses.reduce((s, t) => s + Number(t.amount), 0)
  const totalIncome  = incomes.reduce((s, t)  => s + Number(t.amount), 0)

  const byCategory = expenses.reduce((acc, t) => {
    const name = t.categories?.name || 'Sin categoría'
    acc[name] = (acc[name] || 0) + Number(t.amount)
    return acc
  }, {})

  return `
CONTEXTO FINANCIERO DEL USUARIO (${profile.full_name}):
Moneda: ${profile.currency}
Mes actual: ${month}/${year}

RESUMEN DEL MES:
- Total ingresos: ${totalIncome.toLocaleString('es-CO')} ${profile.currency}
- Total gastos: ${totalExpense.toLocaleString('es-CO')} ${profile.currency}
- Balance: ${(totalIncome - totalExpense).toLocaleString('es-CO')} ${profile.currency}

GASTOS POR CATEGORÍA:
${Object.entries(byCategory).map(([cat, amt]) => `- ${cat}: ${amt.toLocaleString('es-CO')} ${profile.currency}`).join('\n')}

${budget ? `PRESUPUESTO DEL MES:
- Total presupuestado: ${Number(budget.total_amount).toLocaleString('es-CO')} ${profile.currency}
- Límites por categoría:
${(budget.budget_categories || []).map(bc => `  · ${bc.categories?.name}: ${Number(bc.spent_amount).toLocaleString('es-CO')} gastado de ${Number(bc.limit_amount).toLocaleString('es-CO')} permitidos`).join('\n')}` : 'Sin presupuesto definido este mes.'}

ÚLTIMAS TRANSACCIONES:
${(transactions || []).slice(0, 10).map(t => `- ${t.transaction_date}: ${t.type === 'expense' ? '-' : '+'}${Number(t.amount).toLocaleString('es-CO')} ${profile.currency} en ${t.categories?.name || 'Sin categoría'} (${t.description || 'Sin descripción'})`).join('\n')}
`.trim()
}

export const getAIResponse = async (authUserId, message, history) => {
  if (!process.env.GROQ_API_KEY) {
    throw new AppError('GROQ_API_KEY no configurada', 500)
  }

  const financialContext = await getUserFinancialContext(authUserId)

  const messages = [
    {
      role: 'system',
      content: `Eres Aurum, un asistente financiero personal estricto y enfocado.

REGLAS ESTRICTAS:
- SOLO respondes preguntas relacionadas con finanzas personales, gastos, presupuestos, ahorro e inversión
- Si el usuario pregunta algo fuera de ese tema, rechazas amablemente y redirigues a sus finanzas
- NUNCA proporcionas links, URLs ni direcciones web
- NUNCA haces cálculos matemáticos generales no relacionados con las finanzas del usuario
- NUNCA ayudas con tareas, código, recetas, ni ningún otro tema fuera de finanzas
- NUNCA hables acerca de temas politicos, religiosos, ni ningún otro tema fuera de finanzas

Cuando el usuario se salga del tema, responde algo como:
"Eso está fuera de mi área. Soy un asistente financiero y solo puedo ayudarte con tus gastos, presupuesto y finanzas personales. ¿Hay algo de tus finanzas en lo que pueda ayudarte?"

Tu personalidad dentro del tema financiero:
- Directo, claro y empático
- Usas español con formato colombiano para el dinero
- Das consejos prácticos y accionables
- Alertas sobre patrones preocupantes con tacto

Contexto financiero actual del usuario:
${financialContext}

Responde siempre en español.`
    },
    ...history.map(msg => ({
      role:    msg.role,
      content: msg.content
    })),
    {
      role:    'user',
      content: message
    }
  ]

  const response = await fetch(GROQ_API_URL, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model:       GROQ_MODEL,
      messages,
      temperature: 0.7,
      max_tokens:  1024,
    })
  })

  if (!response.ok) {
    const err = await response.json()
    throw new AppError(err.error?.message || 'Error con Groq API', 500)
  }

  const data = await response.json()
  return data.choices[0].message.content
}
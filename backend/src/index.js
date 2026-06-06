import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { router } from './routes/index.js'
import { errorHandler } from './middlewares/errorHandler.js'
import { notFound } from './middlewares/notFound.js'


const app = express()
const PORT = process.env.PORT || 3000

// ── Middlewares globales ──────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL }))
app.use(express.json())

// ── Health check ──────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Rutas de la API ───────────────────────────────────────────
app.use('/api/v1', router)


// ── Manejo de errores (siempre al final) ──────────────────────
app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})

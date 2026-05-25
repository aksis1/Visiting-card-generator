// Tiny backend proxy for LOCAL DEV: keeps the Gemini API key off the client and
// exposes a single photo-processing endpoint. In production this same endpoint is
// served by netlify/functions/process-photo.mjs (both share server/gemini.mjs).
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { removeBackgroundWithGemini, DEFAULT_MODEL } from './gemini.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// API_PORT wins so the dev API never collides with the Vite port (some harnesses
// inject PORT for the web server). Production hosts can still set PORT.
const PORT = process.env.API_PORT || process.env.PORT || 8787
const API_KEY = process.env.GEMINI_API_KEY
const MODEL = process.env.GEMINI_IMAGE_MODEL || DEFAULT_MODEL

const app = express()
app.use(express.json({ limit: '30mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, geminiConfigured: Boolean(API_KEY), model: MODEL })
})

// POST /api/process-photo { image: base64 (no data: prefix), mimeType }
// → { image: base64 png } on success. 503 when no key (client falls back to imgly).
app.post('/api/process-photo', async (req, res) => {
  const { image, mimeType } = req.body || {}
  try {
    const result = await removeBackgroundWithGemini({ apiKey: API_KEY, model: MODEL, image, mimeType })
    res.json(result)
  } catch (err) {
    if (err.detail) console.error('Gemini error', err.status, String(err.detail).slice(0, 500))
    res.status(err.status || 500).json({ error: err.message || 'Internal error processing photo' })
  }
})

// Serve the built SPA in production (Netlify serves it directly, but this keeps
// `npm start` usable as a self-hosted option).
if (process.env.NODE_ENV === 'production') {
  const dist = path.resolve(__dirname, '..', 'dist')
  app.use(express.static(dist))
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')))
}

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT} (gemini ${API_KEY ? 'configured' : 'NOT configured'})`)
})

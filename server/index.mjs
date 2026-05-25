// Tiny backend proxy: keeps the Gemini API key off the client and exposes a
// single photo-processing endpoint. In production it also serves the built SPA.
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// API_PORT wins so the dev API never collides with the Vite port (some harnesses
// inject PORT for the web server). Production hosts can still set PORT.
const PORT = process.env.API_PORT || process.env.PORT || 8787
const API_KEY = process.env.GEMINI_API_KEY
const MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image'

// Cut the subject out without letting the generative model redraw the person.
const CUTOUT_PROMPT =
  'Remove the background from this photograph completely. Keep the person exactly ' +
  'as they are: do not change, regenerate, beautify, restyle, or alter their face, ' +
  'skin, hair, body, clothing, pose, colors, or proportions in any way. Return only ' +
  'the original subject cleanly cut out on a fully transparent background (PNG with ' +
  'an alpha channel), preserving fine edge detail such as individual hair strands. ' +
  'Do not add any new background, shadow, border, or color fill.'

const app = express()
app.use(express.json({ limit: '30mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, geminiConfigured: Boolean(API_KEY), model: MODEL })
})

// POST /api/process-photo { image: base64 (no data: prefix), mimeType }
// → { image: base64 png } on success. 503 when no key (client falls back to imgly).
app.post('/api/process-photo', async (req, res) => {
  if (!API_KEY) {
    return res.status(503).json({ error: 'GEMINI_API_KEY not configured' })
  }

  const { image, mimeType } = req.body || {}
  if (!image || typeof image !== 'string') {
    return res.status(400).json({ error: 'Missing image (base64) in request body' })
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`
    const gemini = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': API_KEY },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { inline_data: { mime_type: mimeType || 'image/png', data: image } },
              { text: CUTOUT_PROMPT },
            ],
          },
        ],
        generationConfig: { responseModalities: ['IMAGE', 'TEXT'], temperature: 0 },
      }),
    })

    if (!gemini.ok) {
      const detail = await gemini.text()
      console.error('Gemini error', gemini.status, detail.slice(0, 500))
      return res.status(502).json({ error: `Gemini request failed (${gemini.status})` })
    }

    const data = await gemini.json()
    const parts = data?.candidates?.[0]?.content?.parts || []
    const imgPart = parts.find(p => p.inline_data?.data || p.inlineData?.data)
    const out = imgPart?.inline_data?.data || imgPart?.inlineData?.data

    if (!out) {
      console.error('Gemini returned no image part', JSON.stringify(data).slice(0, 500))
      return res.status(502).json({ error: 'Gemini returned no image' })
    }

    res.json({ image: out, mimeType: imgPart.inline_data?.mime_type || imgPart.inlineData?.mimeType || 'image/png' })
  } catch (err) {
    console.error('process-photo failed', err)
    res.status(500).json({ error: 'Internal error processing photo' })
  }
})

// Serve the built SPA in production.
if (process.env.NODE_ENV === 'production') {
  const dist = path.resolve(__dirname, '..', 'dist')
  app.use(express.static(dist))
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')))
}

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT} (gemini ${API_KEY ? 'configured' : 'NOT configured'})`)
})

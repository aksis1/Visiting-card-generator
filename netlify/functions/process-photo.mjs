// Netlify Function (v2) mirroring the local Express /api/process-photo endpoint.
// Reached via the /api/process-photo redirect in netlify.toml. The GEMINI_API_KEY
// is read from Netlify environment variables — never shipped to the browser.
import { removeBackgroundWithGemini, DEFAULT_MODEL } from '../../server/gemini.mjs'

const json = (obj, status) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  let body
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  try {
    const result = await removeBackgroundWithGemini({
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_IMAGE_MODEL || DEFAULT_MODEL,
      image: body?.image,
      mimeType: body?.mimeType,
    })
    return json(result, 200)
  } catch (err) {
    if (err.detail) console.error('Gemini error', err.status, String(err.detail).slice(0, 500))
    return json({ error: err.message || 'Internal error processing photo' }, err.status || 500)
  }
}

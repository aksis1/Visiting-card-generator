// Shared Gemini "Nano Banana" background-removal call, used by both the local
// Express dev server (server/index.mjs) and the Netlify Function
// (netlify/functions/process-photo.mjs). Keep this dependency-free (native fetch).

export const DEFAULT_MODEL = 'gemini-2.5-flash-image'

// Cut the subject out without letting the generative model redraw the person.
export const CUTOUT_PROMPT =
  'Remove the background from this photograph completely. Keep the person exactly ' +
  'as they are: do not change, regenerate, beautify, restyle, or alter their face, ' +
  'skin, hair, body, clothing, pose, colors, or proportions in any way. Return only ' +
  'the original subject cleanly cut out on a fully transparent background (PNG with ' +
  'an alpha channel), preserving fine edge detail such as individual hair strands. ' +
  'Do not add any new background, shadow, border, or color fill.'

class GeminiError extends Error {
  constructor(message, status, detail) {
    super(message)
    this.status = status
    this.detail = detail
  }
}

/**
 * @param {{ apiKey?: string, model?: string, image?: string, mimeType?: string }} opts
 * @returns {Promise<{ image: string, mimeType: string }>} base64 PNG of the cutout
 * @throws {GeminiError} with `.status` (503 no key, 400 bad input, 502 upstream)
 */
export async function removeBackgroundWithGemini({ apiKey, model, image, mimeType }) {
  if (!apiKey) throw new GeminiError('GEMINI_API_KEY not configured', 503)
  if (!image || typeof image !== 'string') throw new GeminiError('Missing image (base64) in request body', 400)

  const m = model || DEFAULT_MODEL
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
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

  if (!res.ok) {
    const detail = await res.text()
    throw new GeminiError(`Gemini request failed (${res.status})`, 502, detail)
  }

  const data = await res.json()
  const parts = data?.candidates?.[0]?.content?.parts || []
  const imgPart = parts.find(p => p.inline_data?.data || p.inlineData?.data)
  const out = imgPart?.inline_data?.data || imgPart?.inlineData?.data
  if (!out) throw new GeminiError('Gemini returned no image', 502, JSON.stringify(data).slice(0, 500))

  return {
    image: out,
    mimeType: imgPart.inline_data?.mime_type || imgPart.inlineData?.mimeType || 'image/png',
  }
}

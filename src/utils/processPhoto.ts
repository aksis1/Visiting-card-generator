import { removeBackground } from '@imgly/background-removal'

// Minimum share of non-transparent pixels below which we consider the image
// "still has a background" (Gemini sometimes returns an opaque image).
const MIN_OPAQUE_RATIO = 0.001
const MAX_OPAQUE_RATIO = 0.985
const ALPHA_THRESHOLD = 16 // 0-255; pixels above this count as subject

export interface ProcessResult {
  dataUrl: string
  engine: 'gemini' | 'imgly'
}

// Turn an uploaded photo into a tightly-cropped, background-free subject ready
// to drop into the card panel. Tries the Gemini backend first, falls back to the
// local @imgly model, then auto-crops to the subject's alpha bounding box so the
// face is optically well-sized regardless of how the source was framed.
export async function processPhoto(file: File): Promise<ProcessResult> {
  // Normalize to PNG first. The bg-removal step (imgly + Gemini) only reliably
  // handles PNG/JPEG; AVIF/WebP/HEIC uploads would otherwise fail to decode and
  // fall through to the original image (background intact, nothing to crop).
  const source = await normalizeImage(file)

  let blob: Blob | null = null
  let engine: ProcessResult['engine'] = 'imgly'

  try {
    const geminiBlob = await removeViaGemini(source)
    if (geminiBlob && (await hasUsableAlpha(geminiBlob))) {
      blob = geminiBlob
      engine = 'gemini'
    }
  } catch (err) {
    console.warn('Gemini photo processing unavailable, falling back to imgly:', err)
  }

  if (!blob) {
    blob = await removeBackground(source)
    engine = 'imgly'
  }

  const dataUrl = await autoCropToSubject(blob)
  return { dataUrl, engine }
}

// Decode any browser-supported image (AVIF, WebP, HEIC on supported browsers, …)
// and re-encode it as PNG so downstream bg-removal always gets a format it can
// read. PNG/JPEG pass through untouched. Falls back to the original on failure.
async function normalizeImage(file: File): Promise<File> {
  const t = file.type
  if (t === 'image/png' || t === 'image/jpeg' || t === 'image/jpg') return file
  try {
    const bitmap = await createImageBitmap(file)
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0)
    bitmap.close?.()
    const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png'))
    if (!blob) return file
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.png', { type: 'image/png' })
  } catch (err) {
    console.warn('Could not normalize image to PNG, using original:', err)
    return file
  }
}

async function removeViaGemini(file: File): Promise<Blob | null> {
  const base64 = await fileToBase64(file)
  const res = await fetch('/api/process-photo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64, mimeType: file.type || 'image/png' }),
  })
  if (!res.ok) {
    // 503 = key not configured; treat as "use fallback" without noise.
    if (res.status !== 503) console.warn('Gemini endpoint returned', res.status)
    return null
  }
  const { image, mimeType } = await res.json()
  return base64ToBlob(image, mimeType || 'image/png')
}

// True only if the image has a meaningful mix of transparent + opaque pixels,
// i.e. a real cutout rather than a fully opaque frame.
async function hasUsableAlpha(blob: Blob): Promise<boolean> {
  const { data } = await readPixels(blob)
  let opaque = 0
  const total = data.length / 4
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > ALPHA_THRESHOLD) opaque++
  }
  const ratio = opaque / total
  return ratio > MIN_OPAQUE_RATIO && ratio < MAX_OPAQUE_RATIO
}

// Crop to the subject's alpha bounding box (with a little breathing room) so the
// person fills the frame after the card panel "contains" them.
async function autoCropToSubject(blob: Blob): Promise<string> {
  const { canvas, data, width, height } = await readPixels(blob)

  let minX = width, minY = height, maxX = -1, maxY = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > ALPHA_THRESHOLD) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  // No subject found (e.g. fully transparent) — return as-is.
  if (maxX < minX || maxY < minY) return canvas.toDataURL('image/png')

  const padX = Math.round((maxX - minX + 1) * 0.04)
  const padY = Math.round((maxY - minY + 1) * 0.04)
  const cx = Math.max(0, minX - padX)
  const cy = Math.max(0, minY - padY)
  const cw = Math.min(width, maxX + padX + 1) - cx
  const ch = Math.min(height, maxY + padY + 1) - cy

  const out = document.createElement('canvas')
  out.width = cw
  out.height = ch
  const octx = out.getContext('2d')!
  octx.drawImage(canvas, cx, cy, cw, ch, 0, 0, cw, ch)
  return out.toDataURL('image/png')
}

async function readPixels(blob: Blob) {
  const bitmap = await createImageBitmap(blob)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0)
  bitmap.close?.()
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  return { canvas, ctx, data, width: canvas.width, height: canvas.height }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1] ?? '')
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const bytes = atob(base64)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  return new Blob([arr], { type: mimeType })
}

// Back card — exact Figma layout scaled 0.5× (1080×648 → 540×324)
// node 39:100 "Iesh Front"

import { useState, useRef, useLayoutEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import PowerplayLogo from './PowerplayLogo'
import type { CardData } from '../App'

const S = 0.5

// Content frame is inset 44px on all sides of the 1080×648 card.
const INSET = 44

// Photo panel — right strip of the content frame (Figma w=400, full height 560).
const PANEL_W = 400 * S
const PANEL_H = 560 * S

// Name must stay left of the photo panel: from name x=92 to the panel divider at
// x=636, less a small breathing margin.
const NAME_MAX_W = (636 - 92 - 20) * S

export default function CardBack({ data, exportMode = false }: { data: CardData; exportMode?: boolean }) {
  const { firstName, lastName, title, webLink, photo } = data

  // WYSIWYG: html2canvas renders TEXT ~0.7em lower than the live DOM (measured per
  // size, in 1080-space units below), while images (logo, QR) are faithful. In the
  // off-screen export copy we lift each text element by its own measured shift, so
  // the exported PDF renders pixel-identical to the on-screen preview.
  const nameShift = exportMode ? 47 : 0    // 67.2px name
  const titleShift = exportMode ? 24 : 0   // 28px title
  const connectShift = exportMode ? 20 : 0 // 18px caption
  // Design (shown in BOTH preview and export):
  const TITLE_PAD = 20  // padding between name and title (Figma was 9.6)
  const UNIT_UP = 14    // raise the QR + caption unit for bottom balance

  // Shrink the name if it would run into the photo panel (measured, so it works
  // for any name length). transform:scale doesn't change scrollWidth, so the
  // measurement stays stable across re-renders.
  const nameRef = useRef<HTMLDivElement>(null)
  const [nameScale, setNameScale] = useState(1)
  useLayoutEffect(() => {
    const el = nameRef.current
    if (!el) return
    const fit = () => {
      const natural = el.scrollWidth
      setNameScale(natural > NAME_MAX_W ? Math.max(0.5, NAME_MAX_W / natural) : 1)
    }
    fit()
    // Re-fit once the Clash Grotesk variable font loads (its metrics differ).
    let cancelled = false
    document.fonts?.ready.then(() => { if (!cancelled) fit() })
    return () => { cancelled = true }
  }, [firstName, lastName])

  // Track natural image dimensions to manually compute the fit —
  // html2canvas does not respect object-fit / object-position. We tag the size
  // with the photo URL it belongs to, so a new upload ignores the stale size
  // until its own onLoad fires (no effect / cascading render needed).
  const [natural, setNatural] = useState<{ url: string; w: number; h: number } | null>(null)
  const photoSize = natural && natural.url === photo ? natural : null

  // Contain the (pre-cropped) subject, anchored bottom-centre — keeps the whole
  // person visible while the auto-crop in processPhoto makes them fill the panel.
  let photoStyle: React.CSSProperties = { position: 'absolute', bottom: 0, left: 0, width: PANEL_W, height: PANEL_H }
  if (photoSize) {
    const scale = Math.min(PANEL_W / photoSize.w, PANEL_H / photoSize.h)
    const imgW = photoSize.w * scale
    const imgH = photoSize.h * scale
    photoStyle = {
      position: 'absolute',
      bottom: 0,
      left: (PANEL_W - imgW) / 2,
      width: imgW,
      height: imgH,
      display: 'block',
    }
  }

  return (
    <div style={{
      width: 1080 * S,
      height: 648 * S,
      position: 'relative',
      background: 'white',
      overflow: 'hidden',
      fontFamily: "'IBM Plex Sans', sans-serif",
    }}>
      {/* ── Content frame — rounded-rect border replaces the old corner ticks + guide lines ── */}
      <div style={{
        position: 'absolute',
        left: INSET * S,
        top: INSET * S,
        width: 992 * S,
        height: 560 * S,
        border: `${1 * S}px solid #78c6ff`,
        borderRadius: 8 * S,
        overflow: 'hidden',
        background: 'white',
      }}>

        {/* ── Photo panel — right strip, full height, gradient + left divider ── */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: PANEL_W,
          background: 'linear-gradient(166.16deg, rgb(255,255,255) 13.881%, rgb(233,246,255) 60.955%)',
          borderLeft: `${1.2 * S}px solid #78c6ff`,
          overflow: 'hidden',
        }}>
          {photo ? (
            <img
              src={photo}
              alt="Profile"
              onLoad={e => setNatural({ url: photo, w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
              style={photoStyle}
            />
          ) : (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth={1.5}>
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
              <span style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center', padding: '0 16px' }}>
                Upload photo on the left
              </span>
            </div>
          )}
        </div>

        {/* ── Powerplay logo — frame-relative x=48 y=40 ── */}
        <div style={{
          position: 'absolute',
          left: (92 - INSET) * S,
          top: (84 - INSET) * S,
          display: 'flex',
          alignItems: 'center',
        }}>
          <PowerplayLogo variant="dark" width={166.945 * S} height={36 * S} />
        </div>

        {/* ── Name + Title — frame-relative x=48 y=116 w=474 ── */}
        <div style={{ position: 'absolute', left: (92 - INSET) * S, top: (160 - nameShift - INSET) * S, width: 474 * S }}>

          {/* Name row — first name heavier, last name regular. Scales down if it
              would reach the photo panel; transform-origin keeps it left-anchored. */}
          <div ref={nameRef} style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 19.2 * S,
            height: 77 * S,
            whiteSpace: 'nowrap',
            overflow: 'visible',
            transform: nameScale < 1 ? `scale(${nameScale})` : undefined,
            transformOrigin: 'left top',
          }}>
            <span style={{
              fontFamily: "'Clash Grotesk Variable', 'Clash Grotesk', sans-serif",
              fontWeight: 530,
              fontVariationSettings: "'wght' 530",
              fontSize: 67.2 * S,
              lineHeight: `${76.8 * S}px`,
              color: '#05287a',
            }}>
              {(firstName || 'FIRST').toUpperCase()}
            </span>

            <span style={{
              fontFamily: "'Clash Grotesk Variable', 'Clash Grotesk', sans-serif",
              fontWeight: 400,
              fontVariationSettings: "'wght' 400",
              fontSize: 67.2 * S,
              lineHeight: `${76.8 * S}px`,
              color: '#05287a',
            }}>
              {(lastName || 'LAST').toUpperCase()}
            </span>
          </div>

          {/* Title — 9.6px below the name row */}
          <div style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontWeight: 400,
            fontSize: 28 * S, // 14px on the 540 card
            lineHeight: `${38.4 * S}px`,
            color: '#05287a',
            marginTop: (TITLE_PAD + (nameShift - titleShift)) * S,
          }}>
            {title || 'Title'}
          </div>
        </div>

        {/* ── QR Code frame — frame-relative x=48 y=300 w=196.8 ── */}
        <div style={{
          position: 'absolute',
          left: (92 - INSET) * S,
          top: (344 - UNIT_UP - INSET) * S,
          width: 196.8 * S,
          height: 196.8 * S,
          border: `${1.757 * S}px solid #78c6ff`,
          borderRadius: 6.15 * S,
          background: 'white',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 184.8 * S, height: 184.8 * S,
          }}>
            <QRCodeSVG
              value={webLink || 'https://getpowerplay.ai'}
              size={184.8 * S}
              fgColor="#1946bb"
              bgColor="transparent"
              level="M"
            />
          </div>

          {/* Center Powerplay icon */}
          <div style={{
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 43.2 * S, height: 43.2 * S,
            background: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img src="/assets/qr-center-logo.png" alt="" style={{ width: 42.7 * S, height: 42.7 * S }} />
          </div>

          <img src="/assets/qr-dot.png" alt="" style={{ position: 'absolute', left: 4.39 * S, top: 4.39 * S, width: 6.15 * S, height: 6.15 * S }} />
          <img src="/assets/qr-dot.png" alt="" style={{ position: 'absolute', right: 4.39 * S, top: 4.39 * S, width: 6.15 * S, height: 6.15 * S }} />
          <img src="/assets/qr-dot.png" alt="" style={{ position: 'absolute', left: 4.39 * S, bottom: 4.39 * S, width: 6.15 * S, height: 6.15 * S }} />
          <img src="/assets/qr-dot.png" alt="" style={{ position: 'absolute', right: 4.39 * S, bottom: 4.39 * S, width: 6.15 * S, height: 6.15 * S }} />
        </div>

        {/* ── "Connect with me on Linkedin" — frame-relative x=53 y=506.4 ── */}
        <div style={{
          position: 'absolute',
          left: (97 - INSET) * S,
          top: (550.4 - UNIT_UP - connectShift - INSET) * S,
          width: 187 * S,
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontWeight: 400,
          fontSize: 18 * S, // 9px on the 540 card
          lineHeight: `${19.2 * S}px`,
          color: '#5c77be',
          whiteSpace: 'nowrap',
        }}>
          Connect with me
        </div>
      </div>
    </div>
  )
}

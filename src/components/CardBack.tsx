// Back card — exact Figma layout scaled 0.5× (1080×648 → 540×324)
// node 23:127 "Iesh Front"

import { QRCodeSVG } from 'qrcode.react'
import PowerplayLogo from './PowerplayLogo'
import type { CardData } from '../App'

const S = 0.5

export default function CardBack({ data }: { data: CardData }) {
  const { firstName, lastName, title, webLink, photo } = data
  const displayUrl = webLink.replace(/^https?:\/\//, '').replace(/\/$/, '') || 'www.getpowerplay.ai'

  return (
    <div style={{
      width: 1080 * S,
      height: 648 * S,
      position: 'relative',
      background: 'white',
      overflow: 'hidden',
      fontFamily: "'IBM Plex Sans', sans-serif",
    }}>

      {/* ── Corner markers ── */}
      {/* TL — x=73, y=72 */}
      <img src="/assets/corner-tl.png" alt="" style={{ position: 'absolute', left: 73 * S, top: 72 * S, width: 15 * S, height: 15 * S }} />
      {/* BL — x=72.8, y=560.2 */}
      <img src="/assets/corner-bl.png" alt="" style={{ position: 'absolute', left: 72.8 * S, top: 560.2 * S, width: 15 * S, height: 15 * S }} />
      {/* TR — x=993, y=71 */}
      <img src="/assets/corner-tr.png" alt="" style={{ position: 'absolute', left: 993 * S, top: 71 * S, width: 15 * S, height: 15 * S }} />
      {/* BR — x=992.6, y=560.2 */}
      <img src="/assets/corner-br.png" alt="" style={{ position: 'absolute', left: 992.6 * S, top: 560.2 * S, width: 15 * S, height: 15 * S }} />

      {/* ── Frame lines ── */}
      {/* Left — x=80 */}
      <div style={{ position: 'absolute', left: 80 * S, top: 0, bottom: 0, width: 1.2 * S, background: 'rgba(120,198,255,0.45)' }} />
      {/* Right — x=1000 */}
      <div style={{ position: 'absolute', left: 1000 * S, top: 0, bottom: 0, width: 1.2 * S, background: 'rgba(120,198,255,0.45)' }} />
      {/* Top — y=80 */}
      <div style={{ position: 'absolute', top: 80 * S, left: 0, right: 0, height: 1.2 * S, background: 'rgba(120,198,255,0.45)' }} />
      {/* Bottom — y=568 */}
      <div style={{ position: 'absolute', top: 568 * S, left: 0, right: 0, height: 1.2 * S, background: 'rgba(120,198,255,0.45)' }} />

      {/* ── Powerplay logo — x=100, y=53, w=180.8, h=57.6 ── */}
      {/* Back-logo viewBox is 148.396×32, scale to fit 180.8×57.6 at 1080px → 90.4×28.8 at 540px */}
      <div style={{
        position: 'absolute',
        left: 100 * S,
        top: 53 * S,
        width: 180.8 * S,
        height: 57.6 * S,
        display: 'flex',
        alignItems: 'center',
      }}>
        <PowerplayLogo variant="dark" width={180.8 * S} height={57.6 * S} />
      </div>

      {/* ── Website URL — x=732.4, y=51.2, w=254.4, h=57.6 ── */}
      <div style={{
        position: 'absolute',
        left: 732.4 * S,
        top: 51.2 * S,
        width: 254.4 * S,
        height: 57.6 * S,
        background: 'white',
        display: 'flex',
        alignItems: 'center',
      }}>
        <span style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontWeight: 500,
          fontSize: 21.6 * S,
          lineHeight: `${38.4 * S}px`,
          color: '#1946bb',
          whiteSpace: 'nowrap',
        }}>
          {displayUrl}
        </span>
      </div>

      {/* ── Name + Title — x=116, y=144, w=474 ── */}
      <div style={{
        position: 'absolute',
        left: 116 * S,
        top: 144 * S,
        width: 474 * S,
      }}>
        {/* Name row — h=77, gap=19.2 */}
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 19.2 * S,
          lineHeight: `${76.8 * S}px`,
          whiteSpace: 'nowrap',
        }}>
          <span style={{
            fontFamily: "'Clash Grotesk Variable', 'Clash Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: 67.2 * S,
            color: '#05287a',
          }}>
            {(firstName || 'FIRST').toUpperCase()}
          </span>
          <span style={{
            fontFamily: "'Clash Grotesk Variable', 'Clash Grotesk', sans-serif",
            fontWeight: 400,
            fontSize: 67.2 * S,
            color: '#05287a',
          }}>
            {(lastName || 'LAST').toUpperCase()}
          </span>
        </div>

        {/* Title — y offset 86.6 from name frame top */}
        <div style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontWeight: 400,
          fontSize: 24 * S,
          lineHeight: `${38.4 * S}px`,
          color: '#05287a',
          marginTop: (86.6 - 76.8) * S,
        }}>
          {title || 'Title'}
        </div>
      </div>

      {/* ── QR Code frame — x=116, y=312, w=196.8, h=196.8 ── */}
      <div style={{
        position: 'absolute',
        left: 116 * S,
        top: 312 * S,
        width: 196.8 * S,
        height: 196.8 * S,
        border: `${1.757 * S}px solid #78c6ff`,
        borderRadius: 6.15 * S,
        background: 'white',
        overflow: 'hidden',
      }}>
        {/* QR code centered — 184.8px */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 184.8 * S,
          height: 184.8 * S,
        }}>
          <QRCodeSVG
            value={webLink || 'https://getpowerplay.ai'}
            size={184.8 * S}
            fgColor="#1946bb"
            bgColor="transparent"
            level="M"
          />
        </div>

        {/* Center white badge + Powerplay logo icon — 43.2px */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 43.2 * S,
          height: 43.2 * S,
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <img
            src="/assets/qr-center-logo.png"
            alt=""
            style={{ width: 42.7 * S, height: 42.7 * S, objectFit: 'cover' }}
          />
        </div>

        {/* Corner dots — 6.15px at offset 4.39px */}
        <img src="/assets/qr-dot.png" alt="" style={{ position: 'absolute', left: 4.39 * S, top: 4.39 * S, width: 6.15 * S, height: 6.15 * S }} />
        <img src="/assets/qr-dot.png" alt="" style={{ position: 'absolute', right: 4.39 * S, top: 4.39 * S, width: 6.15 * S, height: 6.15 * S }} />
        <img src="/assets/qr-dot.png" alt="" style={{ position: 'absolute', left: 4.39 * S, bottom: 4.39 * S, width: 6.15 * S, height: 6.15 * S }} />
        <img src="/assets/qr-dot.png" alt="" style={{ position: 'absolute', right: 4.39 * S, bottom: 4.39 * S, width: 6.15 * S, height: 6.15 * S }} />
      </div>

      {/* ── "Connect with me on Linkedin" — x=120.8, y=518.4 ── */}
      <div style={{
        position: 'absolute',
        left: 120.8 * S,
        top: 518.4 * S,
        width: 187 * S,
        height: 20 * S,
        fontFamily: "'IBM Plex Sans', sans-serif",
        fontWeight: 400,
        fontSize: 16 * S,
        color: '#64748b',
        display: 'flex',
        alignItems: 'center',
      }}>
        Connect with me on Linkedin
      </div>

      {/* ── Photo panel — x=664, y=80, w=336, h=487 ── */}
      <div style={{
        position: 'absolute',
        left: 664 * S,
        top: 80 * S,
        width: 336 * S,
        height: 487 * S,
        background: 'linear-gradient(148.68deg, rgb(255,255,255) 26.663%, rgb(233,246,255) 110.48%)',
        borderLeft: `${1.2 * S}px solid #78c6ff`,
        overflow: 'hidden',
      }}>
        {photo ? (
          // User photo — positioned bottom=-19.8, left=-47.2, w=402, h=362.4
          <div style={{
            position: 'absolute',
            bottom: -19.8 * S,
            left: -47.2 * S,
            width: 402 * S,
            height: 362.4 * S,
            overflow: 'hidden',
          }}>
            <img
              src={photo}
              alt="Profile"
              style={{ width: '100%', height: '130.38%', objectFit: 'cover', objectPosition: 'top center' }}
            />
          </div>
        ) : (
          // Placeholder
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
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
    </div>
  )
}

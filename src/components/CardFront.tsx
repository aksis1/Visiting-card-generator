// Front card — exact Figma layout scaled 0.5× (1080×648 → 540×324)
// node 23:56 "Cover back"

import PowerplayLogo from './PowerplayLogo'

const S = 0.5

export default function CardFront() {
  return (
    <div style={{
      width: 1080 * S,
      height: 648 * S,
      position: 'relative',
      background: 'white',
      overflow: 'hidden',
    }}>
      {/* Background image — S2 container (1696×954, bottom offset -86.4, image rotated 180°) */}
      <div style={{
        position: 'absolute',
        left: 0,
        bottom: -86.4 * S,
        width: 1696 * S,
        height: 954 * S,
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          left: -0.11 * S,
          top: -230.47 * S,
          width: 1696.108 * S,
          height: 1301.067 * S,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <img
            src="/assets/front-bg.png"
            alt=""
            style={{
              transform: 'rotate(180deg)',
              width: 1696.108 * S,
              height: 1301.067 * S,
              objectFit: 'cover',
              display: 'block',
              flexShrink: 0,
            }}
          />
        </div>
      </div>

      {/* Logo frame (rounded rect border) — left=256.8 top=216 w=566.4 h=216 */}
      <div style={{
        position: 'absolute',
        left: 256.8 * S,
        top: 216 * S,
        width: 566.4 * S,
        height: 216 * S,
      }}>
        <img
          src="/assets/front-logo-frame.png"
          alt=""
          style={{
            position: 'absolute',
            top: `${-15.36}%`,
            right: `${-5.3}%`,
            bottom: `${-12.44}%`,
            left: `${-5.3}%`,
            width: 'auto',
            height: 'auto',
            maxWidth: 'none',
          }}
        />
      </div>

      {/* Powerplay logo SVG — inset: 43.21% 31.1% 43.21% 31.11% → ~204×44 at scale 0.5 */}
      <div style={{
        position: 'absolute',
        top: `${43.21}%`,
        left: `${31.11}%`,
        right: `${31.1}%`,
        bottom: `${43.21}%`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <PowerplayLogo variant="light" width={408.088 * S} height={88 * S} />
      </div>

      {/* Left vertical line — x=80, full height */}
      <div style={{
        position: 'absolute',
        left: 80 * S,
        top: 0,
        bottom: 0,
        width: 1.2 * S,
        background: 'rgba(144,198,255,0.5)',
      }} />

      {/* Right vertical line — x=1000 (right=80) */}
      <div style={{
        position: 'absolute',
        right: 80 * S,
        top: 0,
        bottom: 0,
        width: 1.2 * S,
        background: 'rgba(144,198,255,0.5)',
      }} />

      {/* Top horizontal line — y=61.2 */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 61.2 * S,
        height: 1.2 * S,
        background: 'rgba(144,198,255,0.5)',
      }} />

      {/* Bottom horizontal line — y=568 (bottom=80) */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 80 * S,
        height: 1.2 * S,
        background: 'rgba(144,198,255,0.5)',
      }} />

      {/* Corner markers */}
      <img src="/assets/corner-tl.png" alt="" style={{ position: 'absolute', left: 72.8 * S, top: 52.8 * S, width: 15.6 * S, height: 15.6 * S }} />
      <img src="/assets/corner-bl.png" alt="" style={{ position: 'absolute', left: 72.8 * S, bottom: 72.8 * S, width: 15.6 * S, height: 15.6 * S }} />
      <img src="/assets/corner-tr.png" alt="" style={{ position: 'absolute', left: 992.6 * S, top: 52.8 * S, width: 15.6 * S, height: 15.6 * S }} />
      <img src="/assets/corner-br.png" alt="" style={{ position: 'absolute', left: 992.6 * S, bottom: 72.8 * S, width: 15.6 * S, height: 15.6 * S }} />
    </div>
  )
}

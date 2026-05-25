// Front card — exact Figma layout scaled 0.5× (1080×648 → 540×324)
// node 39:56 "Cover back"

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

      {/* Logo frame (rounded rect border + corner dots) — x=257 y=216 w=566.4 h=216 */}
      <div style={{
        position: 'absolute',
        left: 257 * S,
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

      {/* Powerplay logo — x=340 y=284 w=408.088 h=88 (nudged off geometric centre to feel optically centred) */}
      <div style={{
        position: 'absolute',
        left: 340 * S,
        top: 284 * S,
        width: 408.088 * S,
        height: 88 * S,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <PowerplayLogo variant="light" width={408.088 * S} height={88 * S} />
      </div>

      {/* Website URL — bottom centre, x=432 y=582 w=216 */}
      <div style={{
        position: 'absolute',
        left: 432 * S,
        top: 582 * S,
        width: 216 * S,
        textAlign: 'center',
        fontFamily: "'IBM Plex Sans', sans-serif",
        fontWeight: 500,
        fontSize: 21.6 * S,
        lineHeight: `${38.4 * S}px`,
        color: '#ffffff',
        whiteSpace: 'nowrap',
      }}>
        www.getpowerplay.ai
      </div>
    </div>
  )
}

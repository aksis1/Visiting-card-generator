import { useState, useRef, useLayoutEffect, useEffect } from 'react'
import InputPanel from './components/InputPanel'
import CardFront from './components/CardFront'
import CardBack from './components/CardBack'
import { exportToPdf } from './utils/exportPdf'

export interface CardData {
  firstName: string
  lastName: string
  title: string
  webLink: string
  photo: string | null
}

export default function App() {
  const [data, setData] = useState<CardData>({
    firstName: 'John',
    lastName: 'Doe',
    title: 'Sales Team',
    webLink: 'https://www.getpowerplay.ai',
    photo: null,
  })
  const [exporting, setExporting] = useState(false)
  const [showBack, setShowBack] = useState(false)
  const [scanning, setScanning] = useState(false) // scan-bar sweep, only on export
  const [fit, setFit] = useState(1)     // scale so the 540×324 card fits the glass
  const frontRef = useRef<HTMLDivElement>(null)
  const backRef = useRef<HTMLDivElement>(null)
  const glassRef = useRef<HTMLDivElement>(null)
  const userFlipped = useRef(false) // suppresses the intro auto-flip after manual flip

  // Intro: show the front (logo) briefly, then auto-flip to the back so the user
  // sees both sides exist and lands on the editable name. Skipped if they flip first.
  useEffect(() => {
    const t = setTimeout(() => {
      if (!userFlipped.current) setShowBack(true)
    }, 1100)
    return () => clearTimeout(t)
  }, [])

  // Fit the fixed-size card to the glass platen on resize. The card stays 540×324
  // in layout (so html2canvas exports it crisp); only a visual transform scales it.
  useLayoutEffect(() => {
    const glass = glassRef.current
    if (!glass) return
    const CARD_W = 540, CARD_H = 324, MARGIN = 56
    const recompute = () => {
      const w = glass.clientWidth - MARGIN
      const h = glass.clientHeight - MARGIN
      setFit(Math.max(0.4, Math.min(w / CARD_W, h / CARD_H, 1.3)))
    }
    recompute()
    const ro = new ResizeObserver(recompute)
    ro.observe(glass)
    return () => ro.disconnect()
  }, [])

  // Flipping the card no longer triggers the scanner light.
  const flip = () => {
    userFlipped.current = true
    setShowBack(s => !s)
  }

  // Export = run the scan light fast top→bottom under the glass, THEN export.
  // Timer-driven (not onAnimationEnd) so the export always fires, even where
  // CSS animation end events don't (reduced-motion / backgrounded tabs).
  const SCAN_MS = 600
  const handleExport = () => {
    if (exporting) return
    setExporting(true)   // button → "Printing…", disabled
    setScanning(true)    // scan-bar sweeps under the glass
    window.setTimeout(async () => {
      setScanning(false)
      try {
        if (frontRef.current && backRef.current) {
          await exportToPdf(frontRef.current, backRef.current)
        }
      } finally {
        setExporting(false)
      }
    }, SCAN_MS)
  }

  return (
    <>
    <div className="machine">
      {/* ── Left: beige control console ── */}
      <div className="console">
        <InputPanel data={data} onChange={setData} onExport={handleExport} exporting={exporting} />
        <span className="screw tl" />
        <span className="screw tr" />
        <span className="screw bl" />
        <span className="screw br" />
      </div>

      {/* ── Right: scanner lid + glass bed ── */}
      <div className="scanner">
        <div className="scanner-head">
          <span className="scanner-title">Platen · Glass A4</span>
          <span className="side-pill">{showBack ? 'SIDE B / BACK' : 'SIDE A / FRONT'}</span>
        </div>

        <div className="glass" ref={glassRef}>
          {/* machine internals seen under the glass */}
          <div className="platen-bed">
            <div className="bed-calib" />
            <div className="bed-roller top" />
            <div className="bed-rod top" />
            <div className="bed-rail" />
            <div className="bed-rod bottom" />
            <div className="bed-roller bottom" />
            <div className="bed-cable" />
            <div className="bed-vents" />
            <div className="bed-etch">PP-2400 · CIS SCANNER</div>
            <span className="bed-bracket b-tl" />
            <span className="bed-bracket b-tr" />
            <span className="bed-bracket b-bl" />
            <span className="bed-bracket b-br" />
            <span className="bed-screw s1" />
            <span className="bed-screw s2" />
            <span className="bed-screw s3" />
            <span className="bed-screw s4" />
          </div>

          {/* scanner lamp — sweeps under the glass on export only */}
          {scanning && <div className="scan-bar run" />}

          {/* dark green-tinted glass laid over the internals + lamp */}
          <div className="glass-tint" />

          <div className="platen-fit" style={{ transform: `scale(${fit})` }}>
            <div className="platen-stage">
              <div className={`flip-card${showBack ? ' show-back' : ''}`}>
                <div className="flip-face flip-face--front">
                  <div className="card-shell">
                    <CardFront />
                  </div>
                </div>
                <div className="flip-face flip-face--back">
                  <div className="card-shell">
                    <CardBack data={data} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flip-dock">
          <button className="flip-btn" onClick={flip} title="Flip card" aria-label="Flip card">
            <FlipIcon />
          </button>
          <span className="flip-caption">Flip card</span>
        </div>

        <span className="screw tl" />
        <span className="screw tr" />
        <span className="screw bl" />
        <span className="screw br" />
      </div>
    </div>

    {/* Off-screen, untransformed copies rendered ONLY for crisp PDF capture.
        Kept out of the flip/scale stage so html2canvas never bakes in a scale
        or 3D rotation. */}
    <div className="export-stage" aria-hidden="true">
      <div ref={frontRef}>
        <CardFront />
      </div>
      <div ref={backRef}>
        <CardBack data={data} />
      </div>
    </div>
    </>
  )
}

function FlipIcon() {
  return (
    <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  )
}

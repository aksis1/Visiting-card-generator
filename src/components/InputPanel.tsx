import { useRef, useState } from 'react'
import { processPhoto } from '../utils/processPhoto'
import type { CardData } from '../App'

interface Props {
  data: CardData
  onChange: (data: CardData) => void
  onExport: () => void
  exporting: boolean
}

export default function InputPanel({ data, onChange, onExport, exporting }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [removingBg, setRemovingBg] = useState(false)
  const [bgError, setBgError] = useState<string | null>(null)
  const [engine, setEngine] = useState<'gemini' | 'imgly' | null>(null)

  const update = (field: keyof CardData, value: string | null) =>
    onChange({ ...data, [field]: value })

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setBgError(null)
    setEngine(null)
    setRemovingBg(true)

    try {
      const { dataUrl, engine } = await processPhoto(file)
      setEngine(engine)
      update('photo', dataUrl)
    } catch (err) {
      console.error(err)
      setBgError('Scan failed — using original image.')
      update('photo', URL.createObjectURL(file))
    } finally {
      setRemovingBg(false)
    }
  }

  const handleRemovePhoto = () => {
    update('photo', null)
    setEngine(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const statusText = exporting ? 'PRINTING…' : removingBg ? 'SCANNING…' : '● READY'
  const name = `${data.firstName} ${data.lastName}`.trim().toUpperCase() || 'NO INPUT'

  return (
    <div className="console-body">
      <div className="console-scroll">
        {/* Brand / model plate */}
        <div className="plate">
          <img className="plate-logo" src="/assets/powerplay-ai.svg" alt="Powerplay" />
          <div className="plate-model">
            CARD COPIER
            <br />
            MODEL PP-2400
          </div>
        </div>

        {/* LCD status readout */}
        <div className="lcd">
          <div className="lcd-row">
            <span className="lcd-label">Status</span>
            <span className={`lcd-sm ${exporting || removingBg ? 'lcd-amber' : 'lcd-green'}`}>
              {statusText}
            </span>
          </div>
          <div className="lcd-row" style={{ marginTop: 6 }}>
            <span className="lcd-amber lcd-big" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {name}
            </span>
          </div>
        </div>

        {/* Fields */}
        <Field label="First Name">
          <input className="r-input" type="text" value={data.firstName}
            onChange={e => update('firstName', e.target.value)} placeholder="John" />
        </Field>

        <Field label="Last Name">
          <input className="r-input" type="text" value={data.lastName}
            onChange={e => update('lastName', e.target.value)} placeholder="Doe" />
        </Field>

        <Field label="Title / Designation">
          <input className="r-input" type="text" value={data.title}
            onChange={e => update('title', e.target.value)} placeholder="Sales Team" />
        </Field>

        <Field label="Web Link · QR">
          <input className="r-input" type="url" value={data.webLink}
            onChange={e => update('webLink', e.target.value)} placeholder="https://www.getpowerplay.ai" />
          <span className="r-hint">&gt; encoded into the QR &amp; shown as the URL</span>
        </Field>

        {/* Photo control */}
        <Field label="Photo">
          {data.photo ? (
            <div className="photo-chip">
              <img className="photo-thumb" src={data.photo} alt="Profile preview" />
              <div className="photo-meta">
                <div className="photo-name">PHOTO LOADED</div>
                <div className="photo-sub">
                  {engine === 'gemini' ? 'gemini · auto-cropped' : 'bg removed · auto-cropped'}
                </div>
              </div>
              <button className="r-btn r-btn--sm" onClick={handleRemovePhoto}>Eject</button>
            </div>
          ) : (
            <>
              <button
                className="r-btn r-btn--dashed"
                onClick={() => fileInputRef.current?.click()}
                disabled={removingBg}
              >
                {removingBg ? (<><SpinnerIcon /> Scanning…</>) : (<><UploadIcon /> Load Photo</>)}
              </button>
              <span className="r-hint">&gt; background removed automatically</span>
              {bgError && <span className="err">! {bgError}</span>}
            </>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
        </Field>

        {/* Machine-detail block, pinned to the bottom of the panel */}
        <div className="console-base">
          {/* deck: knob + vent grille */}
          <div className="deck">
            <div className="knob" />
            <div className="grille" />
          </div>

          {/* status LEDs */}
          <div className="led-row">
            <Led on label="Power" color="green" />
            <Led on={removingBg} label="Scan" color="amber" />
            <Led on={exporting} label="Print" color="amber" />
          </div>

          {/* etched spec plate */}
          <div className="spec">
            <div className="spec-line">AUTO BG-REMOVAL · QR ENCODE · DUPLEX EXPORT</div>
            <div className="spec-line">OUTPUT 85.6 × 54 mm · 1080 × 648 px · 100–240V~</div>
            <div className="barcode" />
          </div>
        </div>
      </div>

      {/* Pinned primary action */}
      <div className="console-foot">
        <button className="r-btn r-btn--accent" onClick={onExport} disabled={exporting}>
          {exporting ? (<><SpinnerIcon /> Printing…</>) : (<><PdfIcon /> Export PDF</>)}
        </button>
        <div className="r-btn-label">Front &amp; back · business-card size 85.6 × 54 mm</div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="r-field">
      <label className="r-label">{label}</label>
      {children}
    </div>
  )
}

function Led({ on, label, color }: { on: boolean; label: string; color: 'green' | 'amber' }) {
  return (
    <div className="led">
      <span className={`led-lamp${on ? (color === 'green' ? ' on-green' : ' on-amber') : ''}`} />
      <span className="led-text">{label}</span>
    </div>
  )
}

function UploadIcon() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg className="r-spin" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}

function PdfIcon() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="15" x2="15" y2="15" />
      <line x1="9" y1="11" x2="15" y2="11" />
    </svg>
  )
}

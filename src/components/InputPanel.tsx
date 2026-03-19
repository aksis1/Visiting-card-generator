import { useRef, useState } from 'react'
import { removeBackground } from '@imgly/background-removal'
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

  const update = (field: keyof CardData, value: string | null) =>
    onChange({ ...data, [field]: value })

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setBgError(null)
    setRemovingBg(true)

    try {
      const resultBlob = await removeBackground(file)
      const url = URL.createObjectURL(resultBlob)
      update('photo', url)
    } catch (err) {
      console.error(err)
      setBgError('Background removal failed. Using original image.')
      // Fallback: use original image
      const url = URL.createObjectURL(file)
      update('photo', url)
    } finally {
      setRemovingBg(false)
    }
  }

  const handleRemovePhoto = () => {
    update('photo', null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid #f1f5f9' }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
          Visiting Card Generator
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#94a3b8' }}>
          Customize the back of your card
        </p>
      </div>

      {/* Fields */}
      <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* First Name */}
        <Field label="First Name">
          <input
            type="text"
            value={data.firstName}
            onChange={e => update('firstName', e.target.value)}
            placeholder="IESH"
            style={inputStyle}
          />
        </Field>

        {/* Last Name */}
        <Field label="Last Name">
          <input
            type="text"
            value={data.lastName}
            onChange={e => update('lastName', e.target.value)}
            placeholder="DIXIT"
            style={inputStyle}
          />
        </Field>

        {/* Title */}
        <Field label="Title / Designation">
          <input
            type="text"
            value={data.title}
            onChange={e => update('title', e.target.value)}
            placeholder="Co-Founder, CEO"
            style={inputStyle}
          />
        </Field>

        {/* Web Link */}
        <Field label="Web Link (for QR code)">
          <input
            type="url"
            value={data.webLink}
            onChange={e => update('webLink', e.target.value)}
            placeholder="https://www.getpowerplay.ai"
            style={inputStyle}
          />
          <p style={{ margin: '4px 0 0', fontSize: 11, color: '#94a3b8' }}>
            This link will be encoded into the QR code and shown as the URL.
          </p>
        </Field>

        {/* Photo */}
        <Field label="Photo">
          {data.photo ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img
                src={data.photo}
                alt="Profile preview"
                style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, background: '#f1f5f9', border: '1px solid #e2e8f0' }}
              />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 12, color: '#0f172a', fontWeight: 500 }}>Photo uploaded</p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>Background removed</p>
              </div>
              <button onClick={handleRemovePhoto} style={ghostBtnStyle}>
                Remove
              </button>
            </div>
          ) : (
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={removingBg}
                style={{
                  ...uploadBtnStyle,
                  opacity: removingBg ? 0.7 : 1,
                  cursor: removingBg ? 'default' : 'pointer',
                }}
              >
                {removingBg ? (
                  <>
                    <SpinnerIcon />
                    Removing background…
                  </>
                ) : (
                  <>
                    <UploadIcon />
                    Upload Photo
                  </>
                )}
              </button>
              <p style={{ margin: '6px 0 0', fontSize: 11, color: '#94a3b8' }}>
                Background will be automatically removed using AI.
              </p>
              {bgError && (
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#ef4444' }}>{bgError}</p>
              )}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            style={{ display: 'none' }}
          />
        </Field>
      </div>

      {/* Export Button */}
      <div style={{ padding: 24, borderTop: '1px solid #f1f5f9' }}>
        <button
          onClick={onExport}
          disabled={exporting}
          style={{
            width: '100%',
            padding: '12px 20px',
            background: exporting ? '#94a3b8' : '#1e3a8a',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: exporting ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontFamily: 'Inter, sans-serif',
            transition: 'background 0.15s',
          }}
        >
          {exporting ? (
            <>
              <SpinnerIcon />
              Generating PDF…
            </>
          ) : (
            <>
              <PdfIcon />
              Export PDF for Print
            </>
          )}
        </button>
        <p style={{ margin: '8px 0 0', fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
          Exports front &amp; back as separate pages at business card size (85.6 × 54mm)
        </p>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid #e2e8f0',
  borderRadius: 7,
  fontSize: 14,
  color: '#0f172a',
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  background: '#f8fafc',
  boxSizing: 'border-box',
}

const uploadBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '9px 16px',
  border: '1.5px dashed #cbd5e1',
  borderRadius: 7,
  background: '#f8fafc',
  color: '#475569',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
  width: '100%',
  justifyContent: 'center',
}

const ghostBtnStyle: React.CSSProperties = {
  padding: '5px 10px',
  border: '1px solid #e2e8f0',
  borderRadius: 6,
  background: 'white',
  color: '#64748b',
  fontSize: 12,
  cursor: 'pointer',
  fontFamily: 'Inter, sans-serif',
}

function UploadIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ animation: 'spin 0.8s linear infinite' }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}

function PdfIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="15" x2="15" y2="15" />
      <line x1="9" y1="11" x2="15" y2="11" />
    </svg>
  )
}

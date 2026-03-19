import { useState, useRef } from 'react'
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
    firstName: 'IESH',
    lastName: 'DIXIT',
    title: 'Co-Founder, CEO',
    webLink: 'https://www.getpowerplay.ai',
    photo: null,
  })
  const [exporting, setExporting] = useState(false)
  const frontRef = useRef<HTMLDivElement>(null)
  const backRef = useRef<HTMLDivElement>(null)

  const handleExport = async () => {
    if (!frontRef.current || !backRef.current) return
    setExporting(true)
    try {
      await exportToPdf(frontRef.current, backRef.current)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      {/* Left: Input Panel */}
      <div style={{
        width: 380,
        flexShrink: 0,
        background: 'white',
        borderRight: '1px solid #e2e8f0',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <InputPanel data={data} onChange={setData} onExport={handleExport} exporting={exporting} />
      </div>

      {/* Right: Preview */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 36,
        padding: 48,
        background: '#f1f5f9',
      }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, textAlign: 'center', margin: '0 0 10px' }}>Front</p>
          <div ref={frontRef} style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)', borderRadius: 8, overflow: 'hidden' }}>
            <CardFront />
          </div>
        </div>

        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, textAlign: 'center', margin: '0 0 10px' }}>Back</p>
          <div ref={backRef} style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.12)', borderRadius: 8, overflow: 'hidden' }}>
            <CardBack data={data} />
          </div>
        </div>
      </div>
    </div>
  )
}

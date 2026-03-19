import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// Standard business card: 85.6mm × 54mm
const CARD_W_MM = 85.6
const CARD_H_MM = 54

export async function exportToPdf(frontEl: HTMLElement, backEl: HTMLElement) {
  // scale:3 gives ~3× pixel density for sharp print output
  const opts = { scale: 3, useCORS: true, allowTaint: true, backgroundColor: null, logging: false }

  const [frontCanvas, backCanvas] = await Promise.all([
    html2canvas(frontEl, opts),
    html2canvas(backEl, { ...opts, backgroundColor: '#ffffff' }),
  ])

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [CARD_W_MM, CARD_H_MM],
  })

  pdf.addImage(frontCanvas.toDataURL('image/png', 1.0), 'PNG', 0, 0, CARD_W_MM, CARD_H_MM)
  pdf.addPage([CARD_W_MM, CARD_H_MM], 'landscape')
  pdf.addImage(backCanvas.toDataURL('image/png', 1.0), 'PNG', 0, 0, CARD_W_MM, CARD_H_MM)

  pdf.save('visiting-card.pdf')
}

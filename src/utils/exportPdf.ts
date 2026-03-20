import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// Card ratio from Figma: 1080 × 648 = 5:3
// Derive height from standard width to preserve exact ratio — no squishing
const CARD_W_MM = 85.6
const CARD_H_MM = 85.6 * (648 / 1080) // 51.36mm

async function captureElement(el: HTMLElement, bg: string | null): Promise<HTMLCanvasElement> {
  const rect = el.getBoundingClientRect()
  return html2canvas(el, {
    scale: 3,
    useCORS: true,
    allowTaint: true,
    backgroundColor: bg,
    logging: false,
    width: rect.width,
    height: rect.height,
    windowWidth: rect.width,
    windowHeight: rect.height,
    x: 0,
    y: 0,
  })
}

export async function exportToPdf(frontEl: HTMLElement, backEl: HTMLElement) {
  // 1. Wait for all declared fonts to finish loading
  await document.fonts.ready

  // 2. Explicitly materialise Clash Grotesk Variable at wght 530
  //    html2canvas needs the browser to have already rasterised this axis
  //    value before it draws to canvas — force-loading it guarantees that.
  const nameFontSize = `${67.2 * 0.5}px`
  await Promise.all([
    document.fonts.load(`530 ${nameFontSize} 'Clash Grotesk Variable'`),
    document.fonts.load(`400 ${nameFontSize} 'Clash Grotesk Variable'`),
  ])

  const [frontCanvas, backCanvas] = await Promise.all([
    captureElement(frontEl, null),
    captureElement(backEl, '#ffffff'),
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

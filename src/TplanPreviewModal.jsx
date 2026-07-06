import React, { useState, useRef, useCallback, useEffect } from 'react'
import { X, ZoomIn, ZoomOut, Printer, Download, Maximize2, AlignCenter } from 'lucide-react'
import TplanPDFView from './TplanPDFView'

// ─── Inline print CSS for the print window ────────────────────────────────────
const PRINT_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #fff; font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; }

  /* ── Document shell ── */
  .tpdf { width: 100%; padding: 52px 64px 80px; color: #1a1a1a; font-size: 10pt; line-height: 1.6; position: relative; }

  /* ── Header: logo row ── */
  .tpdf-header  { margin-bottom: 28px; }
  .tpdf-hd-logo-row { display: flex; justify-content: space-between; align-items: center; padding-bottom: 14px; border-bottom: 1px solid #ebebeb; margin-bottom: 22px; }
  .tpdf-logo-img { height: 28px; object-fit: contain; }
  .tpdf-hd-ref { font-size: 7.5pt; font-weight: 600; color: #aaa; text-transform: uppercase; letter-spacing: 0.1em; }

  /* ── Header: title block ── */
  .tpdf-hd-title-block { margin-bottom: 22px; }
  .tpdf-hd-title  { font-size: 20pt; font-weight: 700; color: #1a1a2e; letter-spacing: -0.03em; line-height: 1.15; margin-bottom: 5px; }
  .tpdf-hd-subtitle { font-size: 9.5pt; color: #999; font-style: italic; line-height: 1.4; }

  /* ── Header: client info card ── */
  .tpdf-hd-card { background: #f6f6fb; border: 1px solid #e8e8f0; border-radius: 8px; padding: 16px 20px 18px; margin-bottom: 20px; }
  .tpdf-hd-card-label { font-size: 7pt; font-weight: 700; color: #6c63ff; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid #e0e0ee; }
  .tpdf-hd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 32px; }
  .tpdf-hd-cell { display: flex; flex-direction: column; gap: 3px; }
  .tpdf-hd-cell-lbl { font-size: 6.5pt; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.1em; }
  .tpdf-hd-cell-val { font-size: 10.5pt; font-weight: 600; color: #1a1a2e; line-height: 1.3; }

  /* ── Dividers ── */
  .tpdf-rule { height: 1px; background: #e0e0e0; border: none; margin: 10px 0; }
  .tpdf-rule--accent { height: 2px; background: linear-gradient(to right, #6c63ff 0%, #c0beff 40%, #ebebeb 100%); border: none; margin: 0 0 4px; }

  /* ── Body sections ── */
  .tpdf-body { display: flex; flex-direction: column; }
  .tpdf-section { margin-bottom: 22px; break-inside: auto; page-break-inside: auto; }
  .tpdf-section-h { font-size: 10.5pt; font-weight: 700; color: #1a1a2e; border-bottom: 1.5px solid #ebebeb; padding-bottom: 5px; margin-bottom: 9px; break-after: avoid; page-break-after: avoid; }
  .tpdf-section-body { font-size: 9.5pt; color: #2a2a2a; line-height: 1.65; break-before: avoid; page-break-before: avoid; }

  /* ── Pills / checkmark grid ── */
  .tpdf-pills-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(185px, 1fr)); gap: 7px 20px; }
  .tpdf-pills-item { display: flex; align-items: flex-start; gap: 7px; font-size: 9.5pt; line-height: 1.45; min-width: 0; break-inside: avoid; page-break-inside: avoid; }
  .tpdf-pills-chk { color: #6c63ff; font-weight: 700; font-size: 9pt; flex-shrink: 0; margin-top: 1px; line-height: 1; }
  .tpdf-pills-name { color: #2a2a2a; word-break: break-word; flex: 1; }

  /* ── Lists ── */
  .tpdf-ol, .tpdf-ul { margin: 0; padding-left: 18px; }
  .tpdf-ol li, .tpdf-ul li { margin-bottom: 4px; }
  .tpdf-rt p { margin: 0 0 5px; }
  .tpdf-rt ul, .tpdf-rt ol { padding-left: 16px; }

  /* ── Roadmap ── */
  .tpdf-roadmap { display: flex; flex-direction: column; gap: 10px; }
  .tpdf-ph { padding: 9px 11px; border: 1px solid #e8e8e8; border-radius: 5px; break-inside: avoid; page-break-inside: avoid; }
  .tpdf-ph-head { display: flex; align-items: flex-start; gap: 9px; margin-bottom: 3px; }
  .tpdf-ph-num { display: flex; align-items: center; justify-content: center; width: 19px; height: 19px; border-radius: 50%; background: #6c63ff; color: #fff; font-size: 7.5pt; font-weight: 700; flex-shrink: 0; margin-top: 1px; }
  .tpdf-ph-right { display: flex; flex-direction: column; gap: 1px; }
  .tpdf-ph-meta { font-size: 8pt; font-weight: 600; color: #666; }
  .tpdf-ph-title { font-size: 9.5pt; font-weight: 600; color: #1a1a2e; }
  .tpdf-ph-desc { font-size: 8.5pt; color: #444; margin: 4px 0 0 28px; line-height: 1.5; }

  /* ── Misc ── */
  .tpdf-p, .tpdf-empty { margin: 0; }
  .tpdf-empty { color: #999; }

  /* ── Footer ── */
  .tpdf-footer { margin-top: 32px; border-top: 1px solid #e8e8e8; padding-top: 10px; display: flex; justify-content: space-between; font-size: 7.5pt; color: #aaa; }
  .tpdf-ft-brand { font-weight: 600; color: #666; font-size: 8pt; }
`

// ─── PDF generation — captures the passed-in DOM element ─────────────────────
async function generateAndSave(element, clientName) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  // Temporarily reset zoom on the element's parent so html2canvas sees 1:1 pixels
  const parent = element.parentElement
  const prevZoom = parent?.style.zoom
  if (parent) parent.style.zoom = '1'

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: element.scrollWidth,
    height: element.scrollHeight,
    windowWidth: 794,
  })

  if (parent && prevZoom !== undefined) parent.style.zoom = prevZoom || ''

  const imgData = canvas.toDataURL('image/jpeg', 0.92)
  const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' })

  const A4_W = 595.28
  const A4_H = 841.89
  const ratio = A4_W / canvas.width
  const imgH  = canvas.height * ratio

  pdf.addImage(imgData, 'JPEG', 0, 0, A4_W, imgH)

  let y = A4_H, page = 1
  while (y < imgH) {
    pdf.addPage()
    pdf.addImage(imgData, 'JPEG', 0, -(page * A4_H), A4_W, imgH)
    y += A4_H
    page++
  }

  const safeName = (clientName || 'Client').replace(/\s+/g, '')
  const date = new Date().toISOString().split('T')[0]
  pdf.save(`TreatmentPlan_${safeName}_${date}.pdf`)
}

// ─── Preview modal ────────────────────────────────────────────────────────────
function TplanPreviewModal({ sections, onClose, autoDownload = false }) {
  const [zoom, setZoom]        = useState(0.82)
  const [downloading, setDown] = useState(false)

  // Single ref — the same element used for both visible preview and PDF capture
  const paperRef = useRef(null)

  // Auto-download: triggered when Download PDF clicked directly (no preview needed)
  useEffect(() => {
    if (!autoDownload) return
    const timer = setTimeout(() => {
      handleDownload()
    }, 300) // allow one render cycle for the PDF view to paint
    return () => clearTimeout(timer)
  }, [autoDownload]) // eslint-disable-line

  const clientName = sections.find(s => s.type === 'client_info')
    ?.data?.fields?.find(f => f.label === 'Client Name')?.value || 'Client'

  const handleDownload = useCallback(async () => {
    if (downloading || !paperRef.current) return
    setDown(true)
    try {
      await generateAndSave(paperRef.current, clientName)
    } catch (err) {
      console.error('PDF generation error:', err)
      alert('Could not generate PDF. Please try again.')
    } finally {
      setDown(false)
    }
  }, [downloading, clientName])

  const handlePrint = useCallback(() => {
    const html = paperRef.current?.innerHTML || ''
    const pw = window.open('', '_blank', 'width=900,height=700')
    if (!pw) return
    pw.document.write(`<!DOCTYPE html><html><head>
      <title>Treatment Plan — ${clientName}</title>
      <style>${PRINT_CSS}</style>
    </head><body><div class="tpdf">${html}</div></body></html>`)
    pw.document.close()
    setTimeout(() => { pw.focus(); pw.print() }, 400)
  }, [clientName])

  const changeZoom = (delta) =>
    setZoom(z => parseFloat(Math.min(2.0, Math.max(0.3, z + delta)).toFixed(2)))

  return (
    <div className="tpdf-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="tpdf-modal">

        {/* ── Toolbar ──────────────────────────────────────── */}
        <div className="tpdf-tb">
          <div className="tpdf-tb-left">
            <span className="tpdf-tb-label">PDF Preview</span>
          </div>

          <div className="tpdf-tb-center">
            <button className="tpdf-tb-btn" onClick={() => changeZoom(-0.1)} title="Zoom out"><ZoomOut size={13} /></button>
            <span className="tpdf-zoom-pct">{Math.round(zoom * 100)}%</span>
            <button className="tpdf-tb-btn" onClick={() => changeZoom(+0.1)} title="Zoom in"><ZoomIn size={13} /></button>
            <div className="tpdf-tb-sep" />
            <button className="tpdf-tb-btn tpdf-tb-text" onClick={() => setZoom(0.82)} title="Fit width">
              <AlignCenter size={12} /> Fit Width
            </button>
            <button className="tpdf-tb-btn tpdf-tb-text" onClick={() => setZoom(0.60)} title="Fit page">
              <Maximize2 size={12} /> Fit Page
            </button>
          </div>

          <div className="tpdf-tb-right">
            <button className="tpdf-tb-btn tpdf-tb-text" onClick={handlePrint}>
              <Printer size={13} /> Print
            </button>
            <button
              className={`tpdf-tb-btn tpdf-tb-text tpdf-tb-dl ${downloading ? 'loading' : ''}`}
              onClick={handleDownload}
              disabled={downloading}
            >
              <Download size={13} /> {downloading ? 'Generating…' : 'Download PDF'}
            </button>
            <button className="tpdf-tb-close" onClick={onClose} title="Close"><X size={14} /></button>
          </div>
        </div>

        {/* ── Paper preview area ────────────────────────────── */}
        {/*
            Single TplanPDFView instance.
            paperRef points directly to the A4 paper div.
            zoom applied to the wrapper shell — paperRef element itself is always at 1x intrinsic size.
            html2canvas resets the shell zoom to 1 before capture, then restores it.
        */}
        <div className="tpdf-preview-area">
          <div className="tpdf-preview-centering">
            <div className="tpdf-paper-shell" style={{ zoom }}>
              <div className="tpdf-paper" ref={paperRef}>
                <TplanPDFView sections={sections} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default TplanPreviewModal

import React from 'react'

// ─── Per-section body renderers ───────────────────────────────────────────────
function RichText({ data }) {
  if (!data?.html) return null
  return <div className="tpdf-rt" dangerouslySetInnerHTML={{ __html: data.html }} />
}

function Checklist({ data }) {
  const items = (data?.items || []).filter(i => i.text?.trim())
  if (!items.length) return null
  return (
    <ol className="tpdf-ol">
      {items.map((item, i) => <li key={item.id || i}>{item.text}</li>)}
    </ol>
  )
}

function Timeline({ data }) {
  const phases = data?.phases || []
  if (!phases.length) return null
  return (
    <div className="tpdf-roadmap">
      {phases.map((phase, idx) => (
        <div key={phase.id || idx} className="tpdf-ph">
          <div className="tpdf-ph-head">
            <span className="tpdf-ph-num">{idx + 1}</span>
            <div className="tpdf-ph-right">
              <span className="tpdf-ph-meta">{phase.label} · {phase.duration}</span>
              {phase.title && <span className="tpdf-ph-title">{phase.title}</span>}
            </div>
          </div>
          {phase.description && <p className="tpdf-ph-desc">{phase.description}</p>}
        </div>
      ))}
    </div>
  )
}

function Pills({ data }) {
  const selected = (data?.selected || []).filter(Boolean)
  if (!selected.length) return <p className="tpdf-empty">—</p>
  return (
    <div className="tpdf-pills-grid">
      {selected.map((item, i) => (
        <div key={i} className="tpdf-pills-item">
          <span className="tpdf-pills-chk" aria-hidden="true">✓</span>
          <span className="tpdf-pills-name">{item}</span>
        </div>
      ))}
    </div>
  )
}

function Lifestyle({ data }) {
  const items = (data?.items || []).filter(i => i.text?.trim())
  if (!items.length) return null
  return (
    <ul className="tpdf-ul">
      {items.map((item, i) => <li key={item.id || i}>{item.text}</li>)}
    </ul>
  )
}

function Frequency({ data }) {
  const val = data?.selected || ''
  const note = data?.customNote || ''
  return <p className="tpdf-p">{val}{val === 'Custom' && note ? ` — ${note}` : ''}</p>
}

function sectionBody(section) {
  switch (section.type) {
    case 'rich_text': return <RichText  data={section.data} />
    case 'checklist': return <Checklist data={section.data} />
    case 'timeline':  return <Timeline  data={section.data} />
    case 'pills':     return <Pills     data={section.data} />
    case 'lifestyle': return <Lifestyle data={section.data} />
    case 'dropdown':  return <Frequency data={section.data} />
    default: return null
  }
}

// ─── Main PDF document (pure presentational) ──────────────────────────────────
function TplanPDFView({ sections }) {
  const ci = sections.find(s => s.type === 'client_info')
  const gf = (label) => ci?.data?.fields?.find(f => f.label === label)?.value?.trim() || '—'
  const body = sections.filter(s => s.type !== 'client_info')

  return (
    <div className="tpdf">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="tpdf-header">

        {/* Logo row */}
        <div className="tpdf-hd-logo-row">
          <img src="/mantra_logo.png" alt="Mantra" className="tpdf-logo-img" />
          <span className="tpdf-hd-ref">Clinical Treatment Plan</span>
        </div>

        {/* Title block */}
        <div className="tpdf-hd-title-block">
          <div className="tpdf-hd-title">Personalized Treatment Plan</div>
          <div className="tpdf-hd-subtitle">Prepared specifically for your therapy journey.</div>
        </div>

        {/* Client information card */}
        <div className="tpdf-hd-card">
          <div className="tpdf-hd-card-label">Client Information</div>
          <div className="tpdf-hd-grid">
            <div className="tpdf-hd-cell">
              <span className="tpdf-hd-cell-lbl">Client Name</span>
              <span className="tpdf-hd-cell-val">{gf('Client Name')}</span>
            </div>
            <div className="tpdf-hd-cell">
              <span className="tpdf-hd-cell-lbl">Provider</span>
              <span className="tpdf-hd-cell-val">{gf('Provider')}</span>
            </div>
            <div className="tpdf-hd-cell">
              <span className="tpdf-hd-cell-lbl">Treatment Type</span>
              <span className="tpdf-hd-cell-val">{gf('Treatment Type')}</span>
            </div>
            <div className="tpdf-hd-cell">
              <span className="tpdf-hd-cell-lbl">Estimated Duration</span>
              <span className="tpdf-hd-cell-val">{gf('Duration')}</span>
            </div>
            <div className="tpdf-hd-cell">
              <span className="tpdf-hd-cell-lbl">Plan Date</span>
              <span className="tpdf-hd-cell-val">{gf('Plan Date')}</span>
            </div>
            {gf('Start Date') !== '—' && (
              <div className="tpdf-hd-cell">
                <span className="tpdf-hd-cell-lbl">Start Date</span>
                <span className="tpdf-hd-cell-val">{gf('Start Date')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Accent divider before body */}
        <div className="tpdf-rule tpdf-rule--accent" />
      </div>


      {/* ── Body sections ─────────────────────────────────────── */}
      <div className="tpdf-body">
        {body.map(section => {
          const content = sectionBody(section)
          if (!content) return null
          return (
            <div key={section.id} className="tpdf-section">
              <div className="tpdf-section-h">{section.title}</div>
              <div className="tpdf-section-body">{content}</div>
            </div>
          )
        })}
      </div>

      {/* ── Footer ────────────────────────────────────────────── */}
      <div className="tpdf-footer">
        <span className="tpdf-ft-brand">Mantra</span>
        <span className="tpdf-ft-conf">Confidential Clinical Document</span>
      </div>
    </div>
  )
}

export default TplanPDFView

import React, { useState } from 'react'
import {
  Plus, ChevronDown, ChevronRight,
  Layout, FileText, AlignLeft, MessageSquare, CheckSquare,
  List, LayoutTemplate
} from 'lucide-react'

// ─── Section add options ──────────────────────────────────────────────────────
const SECTION_OPTIONS = [
  { label: 'Text Section',           description: 'Rich text — notes, summaries',
    template: { type: 'rich_text',   title: 'New Section',              expanded: true, data: { html: '' } } },
  { label: 'Checklist',              description: 'Numbered editable list',
    template: { type: 'checklist',   title: 'New Checklist',            expanded: true, data: { items: [{ id:'t1', text:'' }] } } },
  { label: 'Treatment Roadmap',      description: 'Phased timeline with collapse',
    template: { type: 'timeline',    title: 'Treatment Roadmap',        expanded: true, data: { phases: [{ id:'tp1', label:'Phase 1', duration:'Weeks 1–2', title:'', description:'', collapsed:false }] } } },
  { label: 'Services Included',     description: 'Selectable pill tags for services',
    template: { type: 'pills', title: 'Services Included', expanded: true, data: {
      options: ['Individual Therapy','Psychiatry','Yoga','Meditation','Dietician','Life Coaching','Support Groups','Mindfulness'],
      selected: [],
    }}},
  { label: 'Assessments Included',   description: 'Selectable pill tags for assessments',
    template: { type: 'pills', title: 'Assessments Included', expanded: true, data: {
      options: ['PHQ-9','GAD-7','OCD Assessment','Stress Assessment','Sleep Assessment','Burnout Assessment'],
      selected: [],
    }}},
  { label: 'Lifestyle List',         description: 'Bullet-point recommendations',
    template: { type: 'lifestyle',   title: 'Lifestyle Recommendations', expanded: true, data: { items: [{ id:'nl1', text:'' }] } } },
  { label: 'Session Frequency',      description: 'Dropdown frequency selector',
    template: { type: 'dropdown',    title: 'Session Frequency',         expanded: true, data: { options:['Weekly','Bi-weekly','Monthly','Custom'], selected:'Weekly', customNote:'' } } },
]

// ─── Built-in treatment templates ────────────────────────────────────────────
const TREATMENT_TEMPLATES = [
  { id: 'blank',     name: 'Blank Template',   desc: 'Start from scratch' },
  { id: 'general',   name: 'General Therapy',  desc: 'Standard individual therapy' },
  { id: 'anxiety',   name: 'Anxiety',          desc: 'CBT-based anxiety management' },
  { id: 'depression',name: 'Depression',        desc: 'Depression treatment plan' },
  { id: 'ocd',       name: 'OCD',              desc: 'ERP-based OCD treatment' },
  { id: 'stress',    name: 'Stress & Burnout', desc: 'Stress management and recovery' },
  { id: 'couples',   name: 'Couples Therapy',  desc: 'Relationship and communication' },
  { id: 'family',    name: 'Family Therapy',   desc: 'Family systems and dynamics' },
  { id: 'sleep',     name: 'Sleep Improvement',desc: 'CBT-I based sleep treatment' },
]

// ─── Custom section presets ───────────────────────────────────────────────────
const CUSTOM_PRESETS = [
  'Insurance Notes', 'Medication Plan', 'ERP Schedule',
  'Family Guidance', 'Nutrition Plan',  'Sleep Schedule', 'Crisis Plan',
]

// ─── Collapsible group ────────────────────────────────────────────────────────
function ToolGroup({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="tpstb-group">
      <button className="tpstb-group-header" onClick={() => setOpen(v => !v)}>
        <span>{title}</span>
        {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
      </button>
      {open && <div className="tpstb-group-body">{children}</div>}
    </div>
  )
}

// ─── Document Outline ─────────────────────────────────────────────────────────
function DocOutline({ sections, activeSection, onScrollTo }) {
  return (
    <div className="tpstb-outline">
      {sections.map(section => (
        <button
          key={section.id}
          className={`tpstb-outline-item ${activeSection === section.id ? 'active' : ''}`}
          onClick={() => onScrollTo(section.id)}
          title={section.title}
        >
          <span className="tpstb-outline-dot" />
          <span className="tpstb-outline-label">{section.title}</span>
        </button>
      ))}
    </div>
  )
}

// ─── Main toolbox ─────────────────────────────────────────────────────────────
function TplanToolbox({ sections = [], activeSection, onAddSection, onScrollTo, onApplyTemplate }) {
  const [addMenuOpen,   setAddMenuOpen]   = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [customTitle,   setCustomTitle]   = useState('')

  const handleAdd = (template) => {
    onAddSection({ ...template, id: `${template.type}_${Date.now()}` })
    setAddMenuOpen(false)
  }

  const handleCustom = () => {
    const title = customTitle.trim() || 'Custom Section'
    onAddSection({ type: 'rich_text', title, expanded: true, data: { html: '' } })
    setCustomTitle('')
  }

  return (
    <div className="tpstb">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="tpstb-header">
        <Layout size={13} />
        <span>Document Tools</span>
      </div>

      {/* ── Add Section ──────────────────────────────────────── */}
      <div className="tpstb-section">
        <button className="tpstb-add-section-btn" onClick={() => { setAddMenuOpen(v => !v); setShowTemplates(false) }}>
          <Plus size={14} /> Add Section
        </button>

        {addMenuOpen && (
          <div className="tpstb-add-menu">
            <p className="tpstb-add-menu-label">Section type</p>
            {SECTION_OPTIONS.map((opt, i) => (
              <button key={i} className="tpstb-add-option" onClick={() => handleAdd(opt.template)}>
                <span className="tpstb-add-option-name">{opt.label}</span>
                <span className="tpstb-add-option-desc">{opt.description}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="tpstb-divider" />

      {/* ── Document Outline ─────────────────────────────────── */}
      <ToolGroup title="Document Outline">
        <DocOutline sections={sections} activeSection={activeSection} onScrollTo={onScrollTo} />
      </ToolGroup>

      <div className="tpstb-divider" />

      {/* ── Treatment Templates ───────────────────────────────── */}
      <ToolGroup title="Treatment Templates" defaultOpen={false}>
        <p className="tpstb-hint">Select a template to replace the current document.</p>
        <div className="tpstb-template-list">
          {TREATMENT_TEMPLATES.map(tpl => (
            <button key={tpl.id} className="tpstb-template-item"
              onClick={() => onApplyTemplate && onApplyTemplate(tpl.name)}>
              <LayoutTemplate size={12} className="tpstb-template-icon" />
              <div className="tpstb-template-info">
                <span className="tpstb-template-name">{tpl.name}</span>
                <span className="tpstb-template-desc">{tpl.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </ToolGroup>

      <div className="tpstb-divider" />

      {/* ── Custom Sections ───────────────────────────────────── */}
      <ToolGroup title="Custom Sections" defaultOpen={false}>
        <div className="tpstb-custom-row">
          <input className="tpstb-custom-input" value={customTitle}
            onChange={e => setCustomTitle(e.target.value)}
            placeholder="Section title…"
            onKeyDown={e => e.key === 'Enter' && handleCustom()} />
          <button className="tpstb-custom-add" onClick={handleCustom}><Plus size={13} /></button>
        </div>
        <div className="tpstb-preset-list">
          <p className="tpstb-preset-label">Quick add:</p>
          {CUSTOM_PRESETS.map(name => (
            <button key={name} className="tpstb-preset-chip"
              onClick={() => onAddSection({ type: 'rich_text', title: name, expanded: true, data: { html: '' } })}>
              + {name}
            </button>
          ))}
        </div>
      </ToolGroup>

      <div className="tpstb-divider" />


      {/* ── Document Info ─────────────────────────────────────── */}
      <ToolGroup title="Document Info" defaultOpen={false}>
        <div className="tpstb-info-rows">
          <div className="tpstb-info-row"><span>Status</span>   <span className="tpstb-tag">Draft</span></div>
          <div className="tpstb-info-row"><span>Version</span>  <span>1.0</span></div>
          <div className="tpstb-info-row"><span>Last saved</span><span>Just now</span></div>
          <div className="tpstb-info-row"><span>Sections</span> <span>{sections.length}</span></div>
          <div className="tpstb-info-row"><span>Language</span> <span>English</span></div>
        </div>
      </ToolGroup>
    </div>
  )
}

export default TplanToolbox

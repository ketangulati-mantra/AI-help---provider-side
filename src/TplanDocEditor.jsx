import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  ChevronDown, ChevronRight, ChevronUp, Trash2, Copy,
  Plus, GripVertical, Bold, Italic, Underline, List,
  ListOrdered, Check
} from 'lucide-react'

// ─── Rich Text Editor ─────────────────────────────────────────────────────────
function RichTextEditor({ sectionId, html, onUpdate }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = html || ''
  }, [sectionId]) // eslint-disable-line

  const exec = (cmd) => { ref.current?.focus(); document.execCommand(cmd, false, null) }

  return (
    <div className="tpsd-rte">
      <div className="tpsd-rte-toolbar">
        {[
          { cmd: 'bold',                icon: Bold,        title: 'Bold' },
          { cmd: 'italic',              icon: Italic,      title: 'Italic' },
          { cmd: 'underline',           icon: Underline,   title: 'Underline' },
          null,
          { cmd: 'insertUnorderedList', icon: List,        title: 'Bullet list' },
          { cmd: 'insertOrderedList',   icon: ListOrdered, title: 'Numbered list' },
        ].map((item, i) => {
          if (!item) return <span key={i} className="tpsd-rte-sep" />
          const Icon = item.icon
          return (
            <button key={item.cmd} className="tpsd-rte-btn" title={item.title}
              onMouseDown={e => { e.preventDefault(); exec(item.cmd) }}>
              <Icon size={13} />
            </button>
          )
        })}
      </div>
      <div ref={ref} contentEditable suppressContentEditableWarning className="tpsd-rte-content"
        onBlur={() => onUpdate({ html: ref.current?.innerHTML || '' })} />
    </div>
  )
}

// ─── Checklist ────────────────────────────────────────────────────────────────
function ChecklistEditor({ items, onUpdate }) {
  const add    = () => onUpdate({ items: [...items, { id: `i${Date.now()}`, text: '' }] })
  const remove = (id) => onUpdate({ items: items.filter(i => i.id !== id) })
  const edit   = (id, text) => onUpdate({ items: items.map(i => i.id === id ? { ...i, text } : i) })
  const move   = (idx, dir) => {
    const arr = [...items], t = idx + dir
    if (t < 0 || t >= arr.length) return
    ;[arr[idx], arr[t]] = [arr[t], arr[idx]]
    onUpdate({ items: arr })
  }
  return (
    <div className="tpsd-checklist">
      {items.map((item, idx) => (
        <div key={item.id} className="tpsd-cl-row">
          <span className="tpsd-cl-grip"><GripVertical size={13} /></span>
          <span className="tpsd-cl-bullet">{idx + 1}.</span>
          <input className="tpsd-cl-input" value={item.text}
            onChange={e => edit(item.id, e.target.value)} placeholder="Add item…" />
          <div className="tpsd-cl-controls">
            <button className="tpsd-icon-btn" disabled={idx === 0}               onClick={() => move(idx, -1)}><ChevronUp size={12} /></button>
            <button className="tpsd-icon-btn" disabled={idx === items.length - 1} onClick={() => move(idx,  1)}><ChevronDown size={12} /></button>
            <button className="tpsd-icon-btn danger"                              onClick={() => remove(item.id)}><Trash2 size={12} /></button>
          </div>
        </div>
      ))}
      <button className="tpsd-add-btn" onClick={add}><Plus size={13} /> Add item</button>
    </div>
  )
}

// ─── Client Information (supports text + select field types) ──────────────────
function ClientInfoSection({ data, onUpdate }) {
  const updateField = (id, value) =>
    onUpdate({ fields: data.fields.map(f => f.id === id ? { ...f, value } : f) })

  return (
    <div className="tpsd-client-info">
      {data.fields.map(field => (
        <div key={field.id} className="tpsd-ci-row">
          <label className="tpsd-ci-label">{field.label}</label>
          {field.type === 'select' ? (
            <select
              className="tpsd-ci-select"
              value={field.value}
              onChange={e => updateField(field.id, e.target.value)}
            >
              {field.options?.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              className="tpsd-ci-input"
              value={field.value}
              onChange={e => updateField(field.id, e.target.value)}
              placeholder={field.label === 'Start Date' || field.label === 'Next Review Date' ? 'e.g. 15 Jul 2025' : ''}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Treatment Roadmap ────────────────────────────────────────────────────────
function TimelineSection({ data, onUpdate }) {
  const { phases } = data
  const addPhase = () => onUpdate({ phases: [...phases, {
    id: `p${Date.now()}`, label: `Phase ${phases.length + 1}`,
    duration: 'Weeks —', title: '', description: '', collapsed: false
  }]})
  const removePhase    = (id) => onUpdate({ phases: phases.filter(p => p.id !== id) })
  const duplicatePhase = (id) => {
    const idx = phases.findIndex(p => p.id === id)
    const copy = { ...phases[idx], id: `p${Date.now()}`, label: `${phases[idx].label} (Copy)` }
    const arr = [...phases]; arr.splice(idx + 1, 0, copy); onUpdate({ phases: arr })
  }
  const movePhase  = (id, dir) => {
    const idx = phases.findIndex(p => p.id === id), t = idx + dir
    if (t < 0 || t >= phases.length) return
    const arr = [...phases]; [arr[idx], arr[t]] = [arr[t], arr[idx]]; onUpdate({ phases: arr })
  }
  const togglePhase = (id) =>
    onUpdate({ phases: phases.map(p => p.id === id ? { ...p, collapsed: !p.collapsed } : p) })
  const editPhase = (id, field, value) =>
    onUpdate({ phases: phases.map(p => p.id === id ? { ...p, [field]: value } : p) })

  return (
    <div className="tpsd-timeline">
      {phases.map((phase, idx) => (
        <div key={phase.id} className="tpsd-phase-row">
          <div className="tpsd-phase-spine">
            <div className="tpsd-phase-node">{idx + 1}</div>
            {idx < phases.length - 1 && <div className="tpsd-phase-line" />}
          </div>
          <div className="tpsd-phase-card">
            <div className="tpsd-phase-meta">
              <button className="tpsd-phase-collapse-btn" onClick={() => togglePhase(phase.id)}>
                {phase.collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              </button>
              <input className="tpsd-phase-meta-input" value={phase.label}
                onChange={e => editPhase(phase.id, 'label', e.target.value)} placeholder="Phase" />
              <span className="tpsd-phase-meta-sep">·</span>
              <input className="tpsd-phase-meta-input" value={phase.duration}
                onChange={e => editPhase(phase.id, 'duration', e.target.value)} placeholder="Duration" />
              <div className="tpsd-phase-actions">
                <button className="tpsd-icon-btn" title="Move up"   disabled={idx === 0}                onClick={() => movePhase(phase.id, -1)}><ChevronUp size={12} /></button>
                <button className="tpsd-icon-btn" title="Move down" disabled={idx === phases.length - 1} onClick={() => movePhase(phase.id,  1)}><ChevronDown size={12} /></button>
                <button className="tpsd-icon-btn" title="Duplicate"                                      onClick={() => duplicatePhase(phase.id)}><Copy size={12} /></button>
                <button className="tpsd-icon-btn danger" title="Delete"                                  onClick={() => removePhase(phase.id)}><Trash2 size={12} /></button>
              </div>
            </div>
            {!phase.collapsed && (
              <>
                <input className="tpsd-phase-title-input" value={phase.title}
                  onChange={e => editPhase(phase.id, 'title', e.target.value)} placeholder="Phase title" />
                <textarea className="tpsd-phase-desc-input" value={phase.description}
                  onChange={e => editPhase(phase.id, 'description', e.target.value)}
                  placeholder="Describe what happens in this phase…" rows={2} />
              </>
            )}
          </div>
        </div>
      ))}
      <button className="tpsd-add-btn" onClick={addPhase}><Plus size={13} /> Add phase</button>
    </div>
  )
}

// ─── Pills section — used for Services Included + Assessments Included ────────
function PillsSection({ data, onUpdate }) {
  const [newItem, setNewItem] = useState('')
  const { options = [], selected = [] } = data

  const toggle = (label) => {
    const isOn = selected.includes(label)
    onUpdate({ ...data, selected: isOn ? selected.filter(s => s !== label) : [...selected, label] })
  }

  const addCustom = () => {
    const val = newItem.trim()
    if (!val) return
    const newOptions  = options.includes(val) ? options  : [...options, val]
    const newSelected = selected.includes(val) ? selected : [...selected, val]
    onUpdate({ ...data, options: newOptions, selected: newSelected })
    setNewItem('')
  }

  return (
    <div className="tpsd-pills-section">
      <div className="tpsd-pills-list">
        {options.map(label => {
          const on = selected.includes(label)
          return (
            <button key={label} className={`tpsd-pill ${on ? 'selected' : ''}`} onClick={() => toggle(label)}>
              {on && <Check size={11} />}
              {label}
            </button>
          )
        })}
      </div>
      <div className="tpsd-pills-add-row">
        <input
          className="tpsd-pills-add-input"
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addCustom()}
          placeholder="Add custom…"
        />
        <button className="tpsd-pills-add-btn" onClick={addCustom}><Plus size={13} /></button>
      </div>
    </div>
  )
}

// ─── Lifestyle list ───────────────────────────────────────────────────────────
function LifestyleSection({ data, onUpdate }) {
  const { items } = data
  const add    = () => onUpdate({ items: [...items, { id: `l${Date.now()}`, text: '' }] })
  const remove = (id) => onUpdate({ items: items.filter(i => i.id !== id) })
  const edit   = (id, text) => onUpdate({ items: items.map(i => i.id === id ? { ...i, text } : i) })
  return (
    <div className="tpsd-lifestyle">
      {items.map(item => (
        <div key={item.id} className="tpsd-lifestyle-row">
          <span className="tpsd-lifestyle-dot" />
          <input className="tpsd-cl-input" value={item.text}
            onChange={e => edit(item.id, e.target.value)} placeholder="Add recommendation…" />
          <button className="tpsd-icon-btn danger" onClick={() => remove(item.id)}><Trash2 size={12} /></button>
        </div>
      ))}
      <button className="tpsd-add-btn" onClick={add}><Plus size={13} /> Add item</button>
    </div>
  )
}

// ─── Session Frequency dropdown ───────────────────────────────────────────────
function DropdownSection({ data, onUpdate }) {
  return (
    <div className="tpsd-dropdown-section">
      <select className="tpsd-select" value={data.selected}
        onChange={e => onUpdate({ ...data, selected: e.target.value })}>
        {data.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      {data.selected === 'Custom' && (
        <input className="tpsd-custom-note" value={data.customNote || ''}
          onChange={e => onUpdate({ ...data, customNote: e.target.value })}
          placeholder="Specify frequency (e.g. twice weekly)…" />
      )}
    </div>
  )
}

// ─── Section card wrapper ─────────────────────────────────────────────────────
function SectionCard({ section, isFirst, isLast, onMove, onDelete, onDuplicate, onUpdate, onToggle, sectionRefs }) {
  const updateData  = (newData) => onUpdate(section.id, 'data', { ...section.data, ...newData })
  const updateTitle = (v) => onUpdate(section.id, 'title', v)

  const renderBody = () => {
    switch (section.type) {
      case 'client_info': return <ClientInfoSection data={section.data} onUpdate={updateData} />
      case 'rich_text':   return <RichTextEditor    sectionId={section.id} html={section.data.html} onUpdate={updateData} />
      case 'checklist':   return <ChecklistEditor   items={section.data.items} onUpdate={updateData} />
      case 'timeline':    return <TimelineSection   data={section.data} onUpdate={updateData} />
      case 'pills':       return <PillsSection      data={section.data} onUpdate={updateData} />
      case 'lifestyle':   return <LifestyleSection  data={section.data} onUpdate={updateData} />
      case 'dropdown':    return <DropdownSection   data={section.data} onUpdate={updateData} />
      default:            return null
    }
  }

  return (
    <div className="tpsd-card" ref={el => { if (sectionRefs) sectionRefs.current[section.id] = el }}>
      <div className="tpsd-card-header">
        <button className="tpsd-collapse-btn" onClick={() => onToggle(section.id)}>
          {section.expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <input className="tpsd-card-title" value={section.title} onChange={e => updateTitle(e.target.value)} />
        <div className="tpsd-card-controls">
          <button className="tpsd-icon-btn" title="Move up"   disabled={isFirst} onClick={() => onMove(section.id, -1)}><ChevronUp size={13} /></button>
          <button className="tpsd-icon-btn" title="Move down" disabled={isLast}  onClick={() => onMove(section.id,  1)}><ChevronDown size={13} /></button>
          <button className="tpsd-icon-btn" title="Duplicate"                    onClick={() => onDuplicate(section.id)}><Copy size={13} /></button>
          <button className="tpsd-icon-btn danger" title="Delete"                onClick={() => onDelete(section.id)}><Trash2 size={13} /></button>
        </div>
      </div>
      {section.expanded && <div className="tpsd-card-body">{renderBody()}</div>}
    </div>
  )
}

// ─── Document Editor ──────────────────────────────────────────────────────────
function TplanDocEditor({ sections, onUpdate, onMove, onDelete, onDuplicate, sectionRefs }) {
  const toggleExpand = useCallback((id) => {
    const s = sections.find(s => s.id === id)
    if (s) onUpdate(id, 'expanded', !s.expanded)
  }, [sections, onUpdate])

  return (
    <div className="tpsd-editor">
      {sections.map((section, idx) => (
        <SectionCard
          key={section.id}
          section={section}
          isFirst={idx === 0}
          isLast={idx === sections.length - 1}
          onMove={onMove}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onUpdate={onUpdate}
          onToggle={toggleExpand}
          sectionRefs={sectionRefs}
        />
      ))}
      <div className="tpsd-doc-footer" />
    </div>
  )
}

export default TplanDocEditor

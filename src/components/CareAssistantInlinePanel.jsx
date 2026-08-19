import React, { useState } from 'react'
import { Clock, Check, ChevronDown, ChevronUp } from 'lucide-react'

export default function CareAssistantInlinePanel({
  automations,
  onSaveAutomation,
  onToggleStatus,
  onClose
}) {
  const [editingId, setEditingId] = useState(null)
  const [freq, setFreq] = useState('Daily')
  const [time, setTime] = useState('8:00 AM')
  const [showToast, setShowToast] = useState(false)

  const activeAutos = automations.filter(a => a.status === 'Active' || a.status === 'Paused')
  const availableAutos = automations.filter(a => a.status === 'Off' || !a.status)

  const startConfig = (auto) => {
    setEditingId(auto.id)
    if (auto.frequency?.includes('evening') || auto.frequency?.includes('8:00 PM')) {
      setFreq('Every evening')
      setTime('8:00 PM')
    } else if (auto.frequency?.includes('Daily') || auto.frequency?.includes('8:00 AM')) {
      setFreq('Daily')
      setTime('8:00 AM')
    } else {
      setFreq('Daily')
      setTime('9:00 AM')
    }
  }

  const handleSave = (auto) => {
    const computed = `${freq} · ${time}`
    onSaveAutomation({
      ...auto,
      frequency: computed,
      schedule: computed
    })
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
      setEditingId(null)
    }, 350)
  }

  return (
    <div className="ca-inline-panel animate-fadeIn">
      {showToast && (
        <div className="ca-inline-toast">
          <Check size={13} />
          <span>Saved</span>
        </div>
      )}

      {/* Header */}
      <div className="ca-inline-header">
        <div className="ca-inline-header-left">
          <span className="ca-inline-sparkle">✨</span>
          <span className="ca-inline-title">Care Assistant</span>
          <span className="ca-inline-counts">
            {activeAutos.filter(a => a.status === 'Active').length} active · {availableAutos.length} available
          </span>
        </div>
        <button className="ca-inline-toggle-btn" onClick={onClose} title="Collapse Care Assistant">
          <ChevronDown size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="ca-inline-body">
        {/* ACTIVE SECTION */}
        <div className="ca-inline-sec">
          <div className="ca-inline-sec-title">ACTIVE</div>
          {activeAutos.length === 0 ? (
            <div className="ca-inline-empty">No active automations. Enable one below.</div>
          ) : (
            <div className="ca-inline-list">
              {activeAutos.map(auto => {
                const isEditing = editingId === auto.id
                const isActive = auto.status === 'Active'
                return (
                  <div key={auto.id} className="ca-inline-row">
                    <div className="ca-inline-row-top">
                      <div className="ca-inline-row-name-group">
                        <span className="ca-inline-row-name">{auto.name}</span>
                        <span className={`ca-badge ca-badge--${auto.status.toLowerCase()}`}>
                          {auto.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="ca-inline-row-actions">
                        <button className="ca-link-btn" onClick={() => (isEditing ? setEditingId(null) : startConfig(auto))}>
                          {isEditing ? 'Close' : 'Configure'}
                        </button>
                        <button
                          className={`ca-link-btn ${isActive ? 'ca-link-btn--pause' : 'ca-link-btn--resume'}`}
                          onClick={() => onToggleStatus(auto.id, isActive ? 'Paused' : 'Active')}
                        >
                          {isActive ? 'Pause' : 'Resume'}
                        </button>
                      </div>
                    </div>

                    <div className="ca-inline-row-sched">
                      <Clock size={11} />
                      <span>{auto.frequency || auto.schedule}</span>
                    </div>

                    {/* Inline Configuration Form */}
                    {isEditing && (
                      <div className="ca-inline-edit-form animate-fadeIn">
                        <div className="ca-inline-edit-row">
                          <label className="ca-inline-lbl">Schedule:</label>
                          <select className="ca-inline-select" value={freq} onChange={e => setFreq(e.target.value)}>
                            <option value="Daily">Daily</option>
                            <option value="Every evening">Every evening</option>
                            <option value="Weekly on Monday">Weekly on Monday</option>
                          </select>
                        </div>
                        <div className="ca-inline-edit-row">
                          <label className="ca-inline-lbl">Time:</label>
                          <select className="ca-inline-select" value={time} onChange={e => setTime(e.target.value)}>
                            <option value="8:00 AM">8:00 AM</option>
                            <option value="12:00 PM">12:00 PM</option>
                            <option value="6:00 PM">6:00 PM</option>
                            <option value="8:00 PM">8:00 PM</option>
                          </select>
                        </div>
                        <div className="ca-inline-edit-actions">
                          <button className="ca-btn-cancel" onClick={() => setEditingId(null)}>Cancel</button>
                          <button className="ca-btn-save" onClick={() => handleSave(auto)}>Save</button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* AVAILABLE SECTION */}
        {availableAutos.length > 0 && (
          <div className="ca-inline-sec" style={{ marginTop: 10 }}>
            <div className="ca-inline-sec-title">AVAILABLE</div>
            <div className="ca-inline-list">
              {availableAutos.map(auto => (
                <div key={auto.id} className="ca-inline-row ca-inline-row--avail">
                  <div className="ca-inline-row-top">
                    <div>
                      <div className="ca-inline-row-name">{auto.name}</div>
                      <div className="ca-inline-avail-desc">
                        {auto.id === 3 ? 'Before upcoming session' : 'Before plan expiry'}
                      </div>
                    </div>
                    <button
                      className="ca-btn-enable-sm"
                      onClick={() => onToggleStatus(auto.id, 'Active')}
                    >
                      Enable
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

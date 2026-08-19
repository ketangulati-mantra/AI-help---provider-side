import React, { useState } from 'react'
import { X, Clock, Check, Sparkles, ChevronRight } from 'lucide-react'

export default function ContainedCareAssistantWorkspace({
  automations,
  onSaveAutomation,
  onToggleStatus,
  onClose,
  onOpenFullManagement
}) {
  const [editingId, setEditingId] = useState(null)
  const [enablingId, setEnablingId] = useState(null)

  // Form states
  const [freq, setFreq] = useState('Daily')
  const [time, setTime] = useState('08:00 AM')
  const [showToast, setShowToast] = useState(false)

  const activeAutos = automations.filter(a => a.status === 'Active' || a.status === 'Paused')
  const availableAutos = automations.filter(a => a.status === 'Off' || !a.status)

  const startConfiguring = (auto) => {
    setEditingId(auto.id)
    setEnablingId(null)
    if (auto.frequency.includes('evening') || auto.frequency.includes('8:00 PM')) {
      setFreq('Every evening')
      setTime('08:00 PM')
    } else if (auto.frequency.includes('Daily') || auto.frequency.includes('8:00 AM')) {
      setFreq('Daily')
      setTime('08:00 AM')
    } else {
      setFreq('Daily')
      setTime('09:00 AM')
    }
  }

  const startEnabling = (auto) => {
    setEnablingId(auto.id)
    setEditingId(null)
    if (auto.id === 3) {
      setFreq('Daily')
      setTime('24 hours before session')
    } else {
      setFreq('Daily')
      setTime('3 days before renewal')
    }
  }

  const handleSaveConfig = (auto) => {
    const computed = `${freq} · ${time}`
    const updated = {
      ...auto,
      status: auto.status === 'Off' ? 'Active' : auto.status,
      frequency: computed,
      schedule: computed
    }

    setShowToast(true)
    setTimeout(() => {
      onSaveAutomation(updated)
      setEditingId(null)
      setEnablingId(null)
      setShowToast(false)
    }, 350)
  }

  const handleEnableAutomation = (auto) => {
    onToggleStatus(auto.id, 'Active')
    setShowToast(true)
    setTimeout(() => {
      setEnablingId(null)
      setShowToast(false)
    }, 350)
  }

  return (
    <div className="copilot-ca-contained-workspace animate-fadeIn">
      {/* Toast Notification */}
      {showToast && (
        <div className="copilot-ca-toast animate-fadeIn">
          <Check size={14} />
          <span>Automation updated successfully</span>
        </div>
      )}

      {/* Header */}
      <div className="copilot-ca-contained-header">
        <div>
          <div className="copilot-ca-title-row">
            <span className="copilot-ca-sparkle-icon">✨</span>
            <h3 className="copilot-ca-title">CARE ASSISTANT</h3>
          </div>
          <p className="copilot-ca-subtitle">Automated follow-ups for this client</p>
        </div>
        <button
          type="button"
          className="copilot-ca-close-btn"
          onClick={onClose}
          aria-label="Close workspace"
        >
          <X size={16} />
        </button>
      </div>

      {/* Summary Row */}
      <div className="copilot-ca-summary-row">
        <span className="copilot-ca-summary-pill">
          {activeAutos.filter(a => a.status === 'Active').length} active • {availableAutos.length} available
        </span>
      </div>

      {/* Body Content */}
      <div className="copilot-ca-contained-body">
        
        {/* ACTIVE AUTOMATIONS SECTION */}
        <div className="copilot-ca-section">
          <div className="copilot-ca-section-hd">
            <span className="copilot-ca-section-title">ACTIVE AUTOMATIONS</span>
          </div>

          {activeAutos.length === 0 ? (
            <div className="copilot-ca-empty-box">
              <p className="copilot-ca-empty-title">No automated follow-ups are currently active.</p>
              <p className="copilot-ca-empty-desc">Choose from the supported follow-ups below.</p>
            </div>
          ) : (
            <div className="copilot-ca-list">
              {activeAutos.map(auto => {
                const isEditing = editingId === auto.id
                const isActive = auto.status === 'Active'

                return (
                  <div key={auto.id} className={`copilot-ca-card ${isEditing ? 'is-editing' : ''}`}>
                    <div className="copilot-ca-card-top">
                      <div className="copilot-ca-card-main">
                        <div className="copilot-ca-card-name-row">
                          <span className="copilot-ca-card-name">{auto.name}</span>
                          <span className={`cad-badge cad-badge--${auto.status.toLowerCase()}`}>
                            {auto.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="copilot-ca-card-schedule">
                          <Clock size={11} />
                          <span>{auto.frequency || auto.schedule}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Row */}
                    {!isEditing && (
                      <div className="copilot-ca-card-actions">
                        <button
                          type="button"
                          className="copilot-ca-btn-link"
                          onClick={() => startConfiguring(auto)}
                        >
                          Configure
                        </button>
                        <button
                          type="button"
                          className={`copilot-ca-btn-link ${isActive ? 'copilot-ca-btn-link--pause' : 'copilot-ca-btn-link--resume'}`}
                          onClick={() => onToggleStatus(auto.id, isActive ? 'Paused' : 'Active')}
                        >
                          {isActive ? 'Pause' : 'Resume'}
                        </button>
                      </div>
                    )}

                    {/* INLINE CONFIGURATION FORM */}
                    {isEditing && (
                      <div className="copilot-ca-inline-config animate-fadeIn">
                        <div className="copilot-ca-config-field">
                          <label className="copilot-ca-config-label">When:</label>
                          <select
                            className="copilot-ca-select"
                            value={freq}
                            onChange={e => setFreq(e.target.value)}
                          >
                            <option value="Daily">Daily</option>
                            <option value="Every evening">Every evening</option>
                            <option value="Weekly">Weekly</option>
                          </select>
                        </div>

                        <div className="copilot-ca-config-field">
                          <label className="copilot-ca-config-label">Time:</label>
                          <input
                            type="text"
                            className="copilot-ca-input"
                            value={time}
                            onChange={e => setTime(e.target.value)}
                            placeholder="8:00 AM"
                          />
                        </div>

                        <div className="copilot-ca-config-actions">
                          <button
                            type="button"
                            className="copilot-ca-btn-cancel"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="copilot-ca-btn-save"
                            onClick={() => handleSaveConfig(auto)}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* AVAILABLE FOR THIS SERVICE SECTION */}
        {availableAutos.length > 0 && (
          <div className="copilot-ca-section" style={{ marginTop: 14 }}>
            <div className="copilot-ca-section-hd">
              <span className="copilot-ca-section-title">AVAILABLE FOR THIS SERVICE</span>
            </div>

            <div className="copilot-ca-list">
              {availableAutos.map(auto => {
                const isEnabling = enablingId === auto.id

                return (
                  <div key={auto.id} className={`copilot-ca-card copilot-ca-card--available ${isEnabling ? 'is-editing' : ''}`}>
                    <div className="copilot-ca-card-top">
                      <div className="copilot-ca-card-main">
                        <div className="copilot-ca-card-name-row">
                          <span className="copilot-ca-card-name">{auto.name}</span>
                          <span className="cad-badge cad-badge--off">OFF</span>
                        </div>
                        <p className="copilot-ca-card-desc">
                          {auto.purpose || (auto.id === 3 ? 'Automated preparation reminder before upcoming sessions' : 'Notify the client about upcoming package renewal')}
                        </p>
                      </div>
                    </div>

                    {!isEnabling && (
                      <div className="copilot-ca-card-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="copilot-ca-btn-enable"
                          onClick={() => startEnabling(auto)}
                        >
                          Enable
                        </button>
                      </div>
                    )}

                    {/* ENABLE CONFIRMATION STATE */}
                    {isEnabling && (
                      <div className="copilot-ca-inline-config animate-fadeIn">
                        <p className="copilot-ca-enable-title">Enable {auto.name}?</p>
                        <p className="copilot-ca-enable-desc">
                          Reminder will be sent as scheduled for this client.
                        </p>

                        <div className="copilot-ca-config-actions" style={{ marginTop: 8 }}>
                          <button
                            type="button"
                            className="copilot-ca-btn-cancel"
                            onClick={() => setEnablingId(null)}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="copilot-ca-btn-save"
                            onClick={() => handleEnableAutomation(auto)}
                          >
                            Enable Automation
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>

      {/* Bottom Link for Full Page Management */}
      <div className="copilot-ca-contained-ft">
        <button
          type="button"
          className="copilot-ca-manage-full-link"
          onClick={() => {
            onClose()
            if (onOpenFullManagement) onOpenFullManagement()
          }}
        >
          <span>Manage automations →</span>
        </button>
      </div>
    </div>
  )
}

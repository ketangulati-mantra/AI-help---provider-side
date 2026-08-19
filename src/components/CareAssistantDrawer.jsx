import React, { useState } from 'react'
import { X, Clock, Check, Sparkles } from 'lucide-react'

export default function CareAssistantDrawer({
  automations,
  onSaveAutomation,
  onToggleStatus,
  onClose
}) {
  const [editingId, setEditingId] = useState(null)
  
  // Form state for in-drawer configuration
  const [freq, setFreq] = useState('Daily')
  const [time, setTime] = useState('08:00 AM')
  const [showToast, setShowToast] = useState(false)

  const activeAutos = automations.filter(a => a.status === 'Active' || a.status === 'Paused')
  const availableAutos = automations.filter(a => a.status === 'Off' || !a.status)

  const startConfiguring = (auto) => {
    setEditingId(auto.id)
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

  const handleSaveInDrawer = (auto) => {
    const computed = `${freq} • ${time}`
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
      setShowToast(false)
    }, 400)
  }

  return (
    <div className="cad-overlay animate-fadeIn" onClick={onClose}>
      <div className="cad-drawer animate-slideLeft" onClick={e => e.stopPropagation()}>
        
        {/* Save Toast Notification */}
        {showToast && (
          <div className="cad-toast animate-fadeIn">
            <Check size={15} />
            <span>Changes saved successfully</span>
          </div>
        )}

        {/* Drawer Header */}
        <div className="cad-header">
          <div>
            <div className="cad-title-row">
              <span className="cad-sparkle-icon">✨</span>
              <h3 className="cad-title">Care Assistant</h3>
            </div>
            <p className="cad-subtitle">Automated follow-ups for this client</p>
          </div>
          <button type="button" className="cad-close-btn" onClick={onClose} aria-label="Close drawer">
            <X size={18} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="cad-body">
          
          {/* ACTIVE SECTION */}
          <div className="cad-section">
            <div className="cad-section-hd">
              <span className="cad-section-title">ACTIVE</span>
              <span className="cad-section-running-count">
                {activeAutos.filter(a => a.status === 'Active').length} running
              </span>
            </div>

            {activeAutos.length === 0 ? (
              <p className="cad-empty-text">No active follow-ups currently running.</p>
            ) : (
              <div className="cad-list">
                {activeAutos.map(auto => {
                  const isEditing = editingId === auto.id
                  const isActive = auto.status === 'Active'

                  return (
                    <div key={auto.id} className={`cad-card ${isEditing ? 'is-editing' : ''}`}>
                      <div className="cad-card-top">
                        <div className="cad-card-main-info">
                          <div className="cad-card-name-row">
                            <span className="cad-card-name">{auto.name}</span>
                            <span className={`cad-badge cad-badge--${auto.status.toLowerCase()}`}>
                              {auto.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="cad-card-schedule">
                            <Clock size={12} />
                            <span>{auto.frequency || auto.schedule}</span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Action buttons */}
                      {!isEditing && (
                        <div className="cad-card-actions-row">
                          <button
                            type="button"
                            className="cad-action-link"
                            onClick={() => startConfiguring(auto)}
                          >
                            Configure
                          </button>
                          <button
                            type="button"
                            className={`cad-action-link ${isActive ? 'cad-action-link--pause' : 'cad-action-link--resume'}`}
                            onClick={() => onToggleStatus(auto.id, isActive ? 'Paused' : 'Active')}
                          >
                            {isActive ? 'Pause' : 'Resume'}
                          </button>
                        </div>
                      )}

                      {/* IN-DRAWER CONFIGURATION PANEL */}
                      {isEditing && (
                        <div className="cad-inline-config animate-fadeIn">
                          <div className="cad-config-field">
                            <label className="cad-config-label">Status</label>
                            <div className="cad-status-toggle">
                              <button
                                type="button"
                                className={`cad-status-opt ${auto.status === 'Active' ? 'active' : ''}`}
                                onClick={() => onToggleStatus(auto.id, 'Active')}
                              >
                                Enabled
                              </button>
                              <button
                                type="button"
                                className={`cad-status-opt ${auto.status === 'Paused' ? 'paused' : ''}`}
                                onClick={() => onToggleStatus(auto.id, 'Paused')}
                              >
                                Pause
                              </button>
                              <button
                                type="button"
                                className={`cad-status-opt ${auto.status === 'Off' ? 'off' : ''}`}
                                onClick={() => onToggleStatus(auto.id, 'Off')}
                              >
                                Off
                              </button>
                            </div>
                          </div>

                          <div className="cad-config-field">
                            <label className="cad-config-label">Schedule</label>
                            <div className="cad-schedule-selects">
                              <select
                                className="cad-select"
                                value={freq}
                                onChange={e => setFreq(e.target.value)}
                              >
                                <option value="Daily">Every day</option>
                                <option value="Every evening">Every evening</option>
                                <option value="Weekly">Weekly</option>
                              </select>

                              <input
                                type="text"
                                className="cad-input"
                                value={time}
                                onChange={e => setTime(e.target.value)}
                                placeholder="08:00 AM"
                              />
                            </div>
                          </div>

                          <div className="cad-config-actions">
                            <button
                              type="button"
                              className="cad-btn-cancel"
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              className="cad-btn-save"
                              onClick={() => handleSaveInDrawer(auto)}
                            >
                              Save changes
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

          {/* AVAILABLE FOLLOW-UPS SECTION */}
          {availableAutos.length > 0 && (
            <div className="cad-section" style={{ marginTop: 12 }}>
              <div className="cad-section-hd">
                <span className="cad-section-title">AVAILABLE FOLLOW-UPS</span>
              </div>

              <div className="cad-list">
                {availableAutos.map(auto => {
                  const isEditing = editingId === auto.id

                  return (
                    <div key={auto.id} className={`cad-card cad-card--available ${isEditing ? 'is-editing' : ''}`}>
                      <div className="cad-card-top">
                        <div className="cad-card-main-info">
                          <div className="cad-card-name-row">
                            <span className="cad-card-name">{auto.name}</span>
                            <span className="cad-badge cad-badge--off">OFF</span>
                          </div>
                          <p className="cad-card-desc">
                            {auto.purpose || (auto.id === 3 ? 'Send automated session preparation prompts before appointments.' : 'Notify the client about upcoming payment or renewal deadlines.')}
                          </p>
                        </div>
                      </div>

                      {!isEditing && (
                        <div className="cad-card-actions-row" style={{ justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="cad-btn-enable"
                            onClick={() => {
                              onToggleStatus(auto.id, 'Active')
                              startConfiguring(auto)
                            }}
                          >
                            Enable
                          </button>
                        </div>
                      )}

                      {/* IN-DRAWER CONFIGURATION PANEL FOR AVAILABLE ITEM */}
                      {isEditing && (
                        <div className="cad-inline-config animate-fadeIn">
                          <div className="cad-config-field">
                            <label className="cad-config-label">Schedule</label>
                            <div className="cad-schedule-selects">
                              <select
                                className="cad-select"
                                value={freq}
                                onChange={e => setFreq(e.target.value)}
                              >
                                <option value="Daily">Every day</option>
                                <option value="Every evening">Every evening</option>
                              </select>

                              <input
                                type="text"
                                className="cad-input"
                                value={time}
                                onChange={e => setTime(e.target.value)}
                                placeholder="08:00 AM"
                              />
                            </div>
                          </div>

                          <div className="cad-config-actions">
                            <button
                              type="button"
                              className="cad-btn-cancel"
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              className="cad-btn-save"
                              onClick={() => handleSaveInDrawer(auto)}
                            >
                              Save & Enable
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
      </div>
    </div>
  )
}

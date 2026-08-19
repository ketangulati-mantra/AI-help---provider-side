import React, { useState } from 'react'
import { Clock, Check } from 'lucide-react'

export default function CareAssistantInline({
  automations = [],
  onUpdateAutomation
}) {
  const [careAssistantOpen, setCareAssistantOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [enablingId, setEnablingId] = useState(null)

  // Configure form states
  const [configFreq, setConfigFreq] = useState('Every day')
  const [configTime, setConfigTime] = useState('8:00 AM')
  const [configDuration, setConfigDuration] = useState('Until disabled')

  // Enable form states
  const [enableTiming, setEnableTiming] = useState('24 hours before plan expiry')

  const [toastMsg, setToastMsg] = useState(null)

  const showFeedback = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 1200)
  }

  const activeCount = automations.filter(a => a.status === 'Active').length

  const activeAutomations = automations.filter(a => a.status === 'Active' || a.status === 'Paused')
  const availableAutomations = automations.filter(a => a.status === 'Off' || !a.status)

  const handleStartConfigure = (auto) => {
    setEditingId(auto.id)
    setEnablingId(null)
    if (auto.frequency?.includes('evening') || auto.frequency?.includes('8:00 PM')) {
      setConfigFreq('Every evening')
      setConfigTime('8:00 PM')
    } else {
      setConfigFreq('Every day')
      setConfigTime('8:00 AM')
    }
    setConfigDuration('Until disabled')
  }

  const handleSaveConfigure = (auto) => {
    const computed = `${configFreq} • ${configTime}`
    onUpdateAutomation({
      ...auto,
      frequency: computed,
      schedule: computed
    })
    setEditingId(null)
    showFeedback('Schedule updated')
  }

  const handleStartEnable = (auto) => {
    setEnablingId(auto.id)
    setEditingId(null)
    if (auto.id === 3) {
      setEnableTiming('24 hours before session')
    } else {
      setEnableTiming('24 hours before plan expiry')
    }
  }

  const handleConfirmEnable = (auto) => {
    onUpdateAutomation({
      ...auto,
      status: 'Active',
      frequency: enableTiming,
      schedule: enableTiming
    })
    setEnablingId(null)
    showFeedback(`${auto.name} enabled`)
  }

  const handleTogglePauseResume = (auto) => {
    const newStatus = auto.status === 'Active' ? 'Paused' : 'Active'
    onUpdateAutomation({
      ...auto,
      status: newStatus
    })
    showFeedback(newStatus === 'Active' ? 'Automation resumed' : 'Automation paused')
  }

  return (
    <div className="care-assistant-area">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="ca-inline-toast animate-fadeIn">
          <Check size={13} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* EXPANDED INLINE PANEL (takes natural space in flow, max-height 260px) */}
      {careAssistantOpen && (
        <div className="care-assistant-inline-panel animate-fadeIn">
          {/* Panel Header */}
          <div className="ca-panel-header">
            <div className="ca-panel-header-title-row">
              <span className="ca-panel-sparkle">✨</span>
              <span className="ca-panel-title">CARE ASSISTANT</span>
            </div>
            <span className="ca-panel-active-badge">{activeCount} active</span>
          </div>
          <div className="ca-panel-subtitle">Automated follow-ups for this client</div>

          {/* Panel Scrollable Content Area */}
          <div className="ca-panel-content">
            {/* ACTIVE SECTION */}
            <div className="ca-panel-section">
              <div className="ca-panel-section-title">ACTIVE</div>
              {activeAutomations.length === 0 ? (
                <div className="ca-panel-empty">No active automations. Enable one below.</div>
              ) : (
                <div className="ca-panel-list">
                  {activeAutomations.map(auto => {
                    const isEditing = editingId === auto.id
                    const isActive = auto.status === 'Active'

                    return (
                      <div key={auto.id} className="ca-panel-card">
                        <div className="ca-panel-card-row">
                          <div className="ca-panel-card-info">
                            <span className="ca-panel-card-name">{auto.name}</span>
                            <span className={`ca-status-badge ca-status-badge--${auto.status.toLowerCase()}`}>
                              {auto.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="ca-panel-card-actions">
                            <button
                              type="button"
                              className="ca-action-text-btn"
                              onClick={() => (isEditing ? setEditingId(null) : handleStartConfigure(auto))}
                            >
                              {isEditing ? 'Cancel' : 'Configure'}
                            </button>
                            <button
                              type="button"
                              className={`ca-action-text-btn ${isActive ? 'ca-action-text-btn--pause' : 'ca-action-text-btn--resume'}`}
                              onClick={() => handleTogglePauseResume(auto)}
                            >
                              {isActive ? 'Pause' : 'Resume'}
                            </button>
                          </div>
                        </div>

                        <div className="ca-panel-card-schedule">
                          <Clock size={11} />
                          <span>{auto.frequency || auto.schedule}</span>
                        </div>

                        {/* Inline Configure Form */}
                        {isEditing && (
                          <div className="ca-panel-inline-config animate-fadeIn">
                            <div className="ca-config-form-group">
                              <label className="ca-config-label">Schedule</label>
                              <div className="ca-config-inputs-row">
                                <select
                                  className="ca-config-select"
                                  value={configFreq}
                                  onChange={e => setConfigFreq(e.target.value)}
                                >
                                  <option value="Every day">Every day</option>
                                  <option value="Every evening">Every evening</option>
                                  <option value="Weekly on Monday">Weekly on Monday</option>
                                </select>
                                <select
                                  className="ca-config-select"
                                  value={configTime}
                                  onChange={e => setConfigTime(e.target.value)}
                                >
                                  <option value="8:00 AM">8:00 AM</option>
                                  <option value="12:00 PM">12:00 PM</option>
                                  <option value="6:00 PM">6:00 PM</option>
                                  <option value="8:00 PM">8:00 PM</option>
                                </select>
                              </div>
                            </div>

                            <div className="ca-config-form-group">
                              <label className="ca-config-label">Duration</label>
                              <select
                                className="ca-config-select"
                                value={configDuration}
                                onChange={e => setConfigDuration(e.target.value)}
                              >
                                <option value="Until disabled">Until disabled</option>
                                <option value="For 4 weeks">For 4 weeks</option>
                                <option value="For 8 weeks">For 8 weeks</option>
                              </select>
                            </div>

                            <div className="ca-config-btn-row">
                              <button
                                type="button"
                                className="ca-btn-cancel"
                                onClick={() => setEditingId(null)}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className="ca-btn-save"
                                onClick={() => handleSaveConfigure(auto)}
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

            {/* AVAILABLE SECTION */}
            {availableAutomations.length > 0 && (
              <div className="ca-panel-section" style={{ marginTop: 10 }}>
                <div className="ca-panel-section-title">AVAILABLE</div>
                <div className="ca-panel-list">
                  {availableAutomations.map(auto => {
                    const isEnabling = enablingId === auto.id

                    return (
                      <div key={auto.id} className="ca-panel-card ca-panel-card--available">
                        <div className="ca-panel-card-row">
                          <div className="ca-panel-card-info">
                            <span className="ca-panel-card-name">{auto.name}</span>
                            <span className="ca-status-badge ca-status-badge--off">OFF</span>
                          </div>
                          {!isEnabling && (
                            <button
                              type="button"
                              className="ca-btn-enable"
                              onClick={() => handleStartEnable(auto)}
                            >
                              Enable
                            </button>
                          )}
                        </div>

                        <div className="ca-panel-card-desc">
                          {auto.id === 3 ? 'Before upcoming sessions' : 'Before plan expiry'}
                        </div>

                        {/* Inline Enable Form */}
                        {isEnabling && (
                          <div className="ca-panel-inline-config animate-fadeIn">
                            <div className="ca-config-form-group">
                              <label className="ca-config-label">Remind client:</label>
                              <select
                                className="ca-config-select"
                                value={enableTiming}
                                onChange={e => setEnableTiming(e.target.value)}
                              >
                                {auto.id === 3 ? (
                                  <>
                                    <option value="24 hours before session">24 hours before session</option>
                                    <option value="2 hours before session">2 hours before session</option>
                                    <option value="Day of appointment (morning)">Day of appointment (morning)</option>
                                  </>
                                ) : (
                                  <>
                                    <option value="24 hours before plan expiry">24 hours before plan expiry</option>
                                    <option value="3 days before plan expiry">3 days before plan expiry</option>
                                    <option value="7 days before plan expiry">7 days before plan expiry</option>
                                  </>
                                )}
                              </select>
                            </div>

                            <div className="ca-config-btn-row">
                              <button
                                type="button"
                                className="ca-btn-cancel"
                                onClick={() => setEnablingId(null)}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className="ca-btn-save"
                                onClick={() => handleConfirmEnable(auto)}
                              >
                                Enable
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
      )}

      {/* COMPACT TRIGGER (Rendered directly in the flow) */}
      <div className="ca-trigger-wrapper">
        <button
          type="button"
          className={`care-assistant-trigger-btn ${careAssistantOpen ? 'expanded' : ''}`}
          onClick={() => setCareAssistantOpen(prev => !prev)}
        >
          <span className="ca-trigger-sparkle">✨</span>
          <span>Care Assistant</span>
          <span className="ca-trigger-dot">•</span>
          <span className="ca-trigger-count">{activeCount} active</span>
          <span className="ca-trigger-arrow">{careAssistantOpen ? '↑' : '→'}</span>
        </button>
      </div>
    </div>
  )
}

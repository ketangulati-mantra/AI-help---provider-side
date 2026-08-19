import React, { useState } from 'react'
import { X, Clock, Check, ArrowLeft } from 'lucide-react'

export default function CareAssistantModal({
  automations,
  onSaveAutomation,
  onToggleStatus,
  onClose
}) {
  const [editingAuto, setEditingAuto] = useState(null)
  const [enablingAuto, setEnablingAuto] = useState(null)
  const [freq, setFreq] = useState('Daily')
  const [time, setTime] = useState('8:00 AM')
  const [showToast, setShowToast] = useState(false)

  const activeAutos = automations.filter(a => a.status === 'Active' || a.status === 'Paused')
  const availableAutos = automations.filter(a => a.status === 'Off' || !a.status)

  const startConfiguring = (auto) => {
    setEditingAuto(auto)
    setEnablingAuto(null)
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

  const startEnabling = (auto) => {
    setEnablingAuto(auto)
    setEditingAuto(null)
    if (auto.id === 3) {
      setFreq('24 hours before session')
      setTime('')
    } else {
      setFreq('3 days before plan expiry')
      setTime('')
    }
  }

  const handleSaveConfig = () => {
    if (!editingAuto) return
    const computed = `${freq} · ${time}`
    onSaveAutomation({
      ...editingAuto,
      frequency: computed,
      schedule: computed
    })
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
      setEditingAuto(null)
    }, 350)
  }

  const handleConfirmEnable = () => {
    if (!enablingAuto) return
    const computed = freq
    onSaveAutomation({
      ...enablingAuto,
      status: 'Active',
      frequency: computed,
      schedule: computed
    })
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
      setEnablingAuto(null)
    }, 350)
  }

  return (
    <div className="ca-modal-overlay animate-fadeIn" onClick={onClose}>
      <div className="ca-modal-dialog animate-scaleUp" onClick={e => e.stopPropagation()}>
        
        {/* Toast Alert */}
        {showToast && (
          <div className="ca-modal-toast animate-fadeIn">
            <Check size={14} />
            <span>Settings saved successfully</span>
          </div>
        )}

        {/* Header */}
        <div className="ca-modal-header">
          {editingAuto ? (
            <div className="ca-modal-header-nav">
              <button className="ca-modal-back-btn" onClick={() => setEditingAuto(null)}>
                <ArrowLeft size={16} />
                <span>{editingAuto.name}</span>
              </button>
            </div>
          ) : enablingAuto ? (
            <div className="ca-modal-header-nav">
              <button className="ca-modal-back-btn" onClick={() => setEnablingAuto(null)}>
                <ArrowLeft size={16} />
                <span>Enable {enablingAuto.name}</span>
              </button>
            </div>
          ) : (
            <div>
              <div className="ca-modal-title-row">
                <span className="ca-modal-sparkle">✨</span>
                <h3 className="ca-modal-title">Care Assistant</h3>
              </div>
              <p className="ca-modal-subtitle">Automated follow-ups for this client</p>
            </div>
          )}

          <button className="ca-modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="ca-modal-body">
          {editingAuto ? (
            /* Configure State */
            <div className="ca-modal-form-view animate-fadeIn">
              <div className="ca-modal-field-group">
                <label className="ca-modal-field-label">When should this reminder run?</label>
                <select className="ca-modal-select" value={freq} onChange={e => setFreq(e.target.value)}>
                  <option value="Daily">Every day</option>
                  <option value="Every evening">Every evening</option>
                  <option value="Weekly on Monday">Weekly on Monday</option>
                </select>
              </div>

              <div className="ca-modal-field-group">
                <label className="ca-modal-field-label">Preferred time</label>
                <select className="ca-modal-select" value={time} onChange={e => setTime(e.target.value)}>
                  <option value="8:00 AM">8:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="6:00 PM">6:00 PM</option>
                  <option value="8:00 PM">8:00 PM</option>
                </select>
              </div>

              <div className="ca-modal-field-group">
                <label className="ca-modal-field-label">Client message preview</label>
                <div className="ca-modal-msg-box">
                  {editingAuto.id === 1 && '"Reminder: please take your prescribed medication as scheduled."'}
                  {editingAuto.id === 2 && '"Hi! How are you feeling today? Take a moment to log your daily mood check-in."'}
                  {editingAuto.id === 3 && '"Friendly reminder about your upcoming therapy session tomorrow."'}
                  {editingAuto.id === 4 && '"Reminder: your care plan package renewal is approaching."'}
                </div>
              </div>

              <div className="ca-modal-form-actions">
                <button className="ca-modal-btn-cancel" onClick={() => setEditingAuto(null)}>Cancel</button>
                <button className="ca-modal-btn-primary" onClick={handleSaveConfig}>Save</button>
              </div>
            </div>
          ) : enablingAuto ? (
            /* Enable State */
            <div className="ca-modal-form-view animate-fadeIn">
              <div className="ca-modal-field-group">
                <label className="ca-modal-field-label">When should we remind the client?</label>
                <select className="ca-modal-select" value={freq} onChange={e => setFreq(e.target.value)}>
                  {enablingAuto.id === 3 ? (
                    <>
                      <option value="24 hours before session">24 hours before session</option>
                      <option value="2 hours before session">2 hours before session</option>
                      <option value="Day of appointment (morning)">Day of appointment (morning)</option>
                    </>
                  ) : (
                    <>
                      <option value="3 days before plan expiry">3 days before plan expiry</option>
                      <option value="7 days before plan expiry">7 days before plan expiry</option>
                      <option value="On expiry date">On expiry date</option>
                    </>
                  )}
                </select>
              </div>

              <div className="ca-modal-field-group">
                <label className="ca-modal-field-label">Client message preview</label>
                <div className="ca-modal-msg-box">
                  {enablingAuto.id === 3
                    ? '"Friendly reminder about your upcoming therapy session tomorrow."'
                    : '"Reminder: your care plan package renewal is approaching."'}
                </div>
              </div>

              <div className="ca-modal-form-actions">
                <button className="ca-modal-btn-cancel" onClick={() => setEnablingAuto(null)}>Cancel</button>
                <button className="ca-modal-btn-primary" onClick={handleConfirmEnable}>Enable</button>
              </div>
            </div>
          ) : (
            /* Main Overview List */
            <>
              {/* Summary Pill */}
              <div className="ca-modal-summary-row">
                <span className="ca-modal-summary-pill">
                  {activeAutos.filter(a => a.status === 'Active').length} active · {availableAutos.length} available
                </span>
              </div>

              {/* Active Section */}
              <div className="ca-modal-sec">
                <div className="ca-modal-sec-header">ACTIVE FOLLOW-UPS</div>
                {activeAutos.length === 0 ? (
                  <div className="ca-modal-empty-state">No active follow-ups. Enable one from the available list below.</div>
                ) : (
                  <div className="ca-modal-items-list">
                    {activeAutos.map(auto => {
                      const isActive = auto.status === 'Active'
                      return (
                        <div key={auto.id} className="ca-modal-row">
                          <div className="ca-modal-row-main">
                            <div className="ca-modal-row-title-row">
                              <span className="ca-modal-row-name">{auto.name}</span>
                              <span className={`ca-badge ca-badge--${auto.status.toLowerCase()}`}>
                                {auto.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="ca-modal-row-sched">
                              <Clock size={12} />
                              <span>{auto.frequency || auto.schedule}</span>
                            </div>
                          </div>
                          <div className="ca-modal-row-actions">
                            <button className="ca-action-btn" onClick={() => startConfiguring(auto)}>Configure</button>
                            <button
                              className={`ca-action-btn ${isActive ? 'ca-action-btn--pause' : 'ca-action-btn--resume'}`}
                              onClick={() => onToggleStatus(auto.id, isActive ? 'Paused' : 'Active')}
                            >
                              {isActive ? 'Pause' : 'Resume'}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Available Section */}
              {availableAutos.length > 0 && (
                <div className="ca-modal-sec" style={{ marginTop: 18 }}>
                  <div className="ca-modal-sec-header">AVAILABLE FOR THIS SERVICE</div>
                  <div className="ca-modal-items-list">
                    {availableAutos.map(auto => (
                      <div key={auto.id} className="ca-modal-row ca-modal-row--avail">
                        <div className="ca-modal-row-main">
                          <div className="ca-modal-row-name">{auto.name}</div>
                          <div className="ca-modal-avail-desc">
                            {auto.id === 3 ? 'Before upcoming appointments' : 'Before plan expiry'}
                          </div>
                        </div>
                        <button className="ca-btn-enable" onClick={() => startEnabling(auto)}>
                          Enable
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!editingAuto && !enablingAuto && (
          <div className="ca-modal-footer">
            <span className="ca-modal-footer-note">All changes are saved to this client's Care Assistant settings.</span>
            <button className="ca-modal-btn-done" onClick={onClose}>Done</button>
          </div>
        )}

      </div>
    </div>
  )
}

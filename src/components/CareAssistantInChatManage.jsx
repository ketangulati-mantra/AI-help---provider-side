import React, { useState } from 'react'
import { ArrowLeft, Clock, Check } from 'lucide-react'

export default function CareAssistantInChatManage({
  automations,
  onSaveAutomation,
  onToggleStatus,
  onBackToChat
}) {
  const [editingId, setEditingId] = useState(null)
  const [freq, setFreq] = useState('Daily')
  const [time, setTime] = useState('8:00 AM')
  const [showToast, setShowToast] = useState(false)

  const activeAutos = automations.filter(a => a.status === 'Active' || a.status === 'Paused')
  const availableAutos = automations.filter(a => a.status === 'Off' || !a.status)

  const startConfiguring = (auto) => {
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

  const handleSaveConfig = (auto) => {
    const computed = `${freq} · ${time}`
    onSaveAutomation({
      ...auto,
      frequency: computed,
      schedule: computed
    })
    setShowToast(true)
    setTimeout(() => {
      setEditingId(null)
      setShowToast(false)
    }, 400)
  }

  return (
    <div className="ca-inchat-manage-container animate-fadeIn">
      {showToast && (
        <div className="ca-popover-toast" style={{ position: 'fixed', top: 20, right: 30, zIndex: 100 }}>
          <Check size={14} />
          <span>Automation updated</span>
        </div>
      )}

      {/* Top Back Action Bar */}
      <div className="ca-inchat-manage-topbar">
        <button className="ca-inchat-back-btn" onClick={onBackToChat}>
          <ArrowLeft size={16} />
          <span>Back to AI Chat</span>
        </button>
      </div>

      <div className="ca-inchat-manage-scrollable">
        {/* Header */}
        <div className="ca-inchat-header">
          <div className="ca-inchat-title-row">
            <span className="ca-popover-sparkle">✨</span>
            <h2 className="ca-inchat-title">CARE ASSISTANT</h2>
          </div>
          <p className="ca-inchat-subtitle">Automated follow-ups for this client</p>
          <div className="ca-inchat-summary-pill">
            {activeAutos.filter(a => a.status === 'Active').length} active · {availableAutos.length} available
          </div>
        </div>

        {/* Active Section */}
        <div className="ca-inchat-sec">
          <h3 className="ca-inchat-sec-title">ACTIVE AUTOMATIONS</h3>
          {activeAutos.length === 0 ? (
            <div className="ca-inchat-empty">No active follow-ups. Enable one from the available list below.</div>
          ) : (
            <div className="ca-inchat-grid">
              {activeAutos.map(auto => {
                const isEditing = editingId === auto.id
                const isActive = auto.status === 'Active'
                return (
                  <div key={auto.id} className={`ca-inchat-card ${isEditing ? 'is-editing' : ''}`}>
                    <div className="ca-inchat-card-hd">
                      <div className="ca-inchat-card-name">{auto.name}</div>
                      <span className={`ca-status-badge ca-status-badge--${auto.status.toLowerCase()}`}>
                        {auto.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="ca-inchat-card-sched">
                      <Clock size={12} />
                      <span>{auto.frequency || auto.schedule}</span>
                    </div>

                    {!isEditing ? (
                      <div className="ca-inchat-card-actions">
                        <button className="ca-row-link" onClick={() => startConfiguring(auto)}>Configure</button>
                        <button
                          className={`ca-row-link ${isActive ? 'ca-row-link--pause' : 'ca-row-link--resume'}`}
                          onClick={() => onToggleStatus(auto.id, isActive ? 'Paused' : 'Active')}
                        >
                          {isActive ? 'Pause' : 'Resume'}
                        </button>
                      </div>
                    ) : (
                      <div className="ca-inchat-card-inline-form animate-fadeIn">
                        <div className="ca-config-row">
                          <label className="ca-config-lbl">Schedule</label>
                          <select className="ca-config-select" value={freq} onChange={e => setFreq(e.target.value)}>
                            <option value="Daily">Daily</option>
                            <option value="Every evening">Every evening</option>
                            <option value="Weekly">Weekly</option>
                          </select>
                        </div>
                        <div className="ca-config-row">
                          <label className="ca-config-lbl">Time</label>
                          <select className="ca-config-select" value={time} onChange={e => setTime(e.target.value)}>
                            <option value="8:00 AM">8:00 AM</option>
                            <option value="12:00 PM">12:00 PM</option>
                            <option value="6:00 PM">6:00 PM</option>
                            <option value="8:00 PM">8:00 PM</option>
                          </select>
                        </div>
                        <div className="ca-config-footer-actions">
                          <button className="ca-btn-text" onClick={() => setEditingId(null)}>Cancel</button>
                          <button className="ca-btn-save" onClick={() => handleSaveConfig(auto)}>Save</button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Available Section */}
        {availableAutos.length > 0 && (
          <div className="ca-inchat-sec" style={{ marginTop: 24 }}>
            <h3 className="ca-inchat-sec-title">AVAILABLE FOR THIS SERVICE</h3>
            <div className="ca-inchat-grid">
              {availableAutos.map(auto => (
                <div key={auto.id} className="ca-inchat-card ca-inchat-card--avail">
                  <div className="ca-inchat-card-hd">
                    <div className="ca-inchat-card-name">{auto.name}</div>
                    <button
                      className="ca-btn-enable"
                      onClick={() => onToggleStatus(auto.id, 'Active')}
                    >
                      Enable
                    </button>
                  </div>
                  <p className="ca-inchat-avail-desc">
                    {auto.id === 3 ? 'Send automated preparation prompts before upcoming appointments' : 'Notify client about upcoming care plan renewal'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

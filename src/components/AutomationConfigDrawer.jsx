import React, { useState, useEffect } from 'react'
import { X, Clock, Calendar, Shield, Check, AlertCircle, ChevronDown, ChevronUp, Bell, Power } from 'lucide-react'

export default function AutomationConfigDrawer({
  automation,
  onSave,
  onClose,
  onDisable
}) {
  if (!automation) return null

  const [status, setStatus] = useState(automation.status || 'Active')
  const [frequency, setFrequency] = useState(automation.frequencyType || 'Daily')
  const [time, setTime] = useState(automation.time || '08:00')
  const [selectedDays, setSelectedDays] = useState(automation.days || {
    Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false
  })
  const [customNote, setCustomNote] = useState(automation.customNote || '')
  const [advanceNotice, setAdvanceNotice] = useState(automation.advanceNotice || '24 hours before')
  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [showDisableConfirm, setShowDisableConfirm] = useState(false)

  useEffect(() => {
    setStatus(automation.status || 'Active')
    setFrequency(automation.frequencyType || 'Daily')
    setTime(automation.time || '08:00')
    setCustomNote(automation.customNote || '')
  }, [automation])

  const toggleDay = (day) => {
    setSelectedDays(prev => ({ ...prev, [day]: !prev[day] }))
  }

  const handleSave = () => {
    let computedSchedule = `${frequency} • ${time}`
    if (frequency === 'Daily') {
      computedSchedule = `Daily • ${time}`
    } else if (frequency === 'Weekly') {
      const activeDaysList = Object.keys(selectedDays).filter(d => selectedDays[d]).join(', ')
      computedSchedule = `Weekly (${activeDaysList}) • ${time}`
    }

    const updatedAutomation = {
      ...automation,
      status,
      schedule: computedSchedule,
      frequency: computedSchedule,
      frequencyType: frequency,
      time,
      days: selectedDays,
      customNote,
      advanceNotice
    }

    setShowToast(true)
    setTimeout(() => {
      onSave(updatedAutomation)
    }, 400)
  }

  const handleDisableConfirm = () => {
    if (onDisable) {
      onDisable(automation.id)
    }
  }

  return (
    <div className="acd-overlay animate-fadeIn" onClick={onClose}>
      <div className="acd-drawer animate-slideLeft" onClick={e => e.stopPropagation()}>
        
        {/* Toast Notification */}
        {showToast && (
          <div className="acd-toast animate-fadeIn">
            <Check size={16} className="acd-toast-icon" />
            <span>Automation configuration saved successfully</span>
          </div>
        )}

        {/* Drawer Header */}
        <div className="acd-header">
          <div className="acd-header-title-box">
            <h3 className="acd-title">{automation.name}</h3>
            <p className="acd-subtitle">{automation.purpose || 'Configure AI follow-up schedule and automation settings.'}</p>
          </div>
          <button type="button" className="acd-close-btn" onClick={onClose} aria-label="Close configuration">
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="acd-body">
          
          {/* Status Section */}
          <div className="acd-section">
            <label className="acd-section-label">STATUS</label>
            <div className="acd-status-toggle-row">
              <button
                type="button"
                className={`acd-status-btn ${status === 'Active' ? 'is-active' : ''}`}
                onClick={() => setStatus('Active')}
              >
                <span className="acd-dot dot-active" />
                Active
              </button>

              <button
                type="button"
                className={`acd-status-btn ${status === 'Paused' ? 'is-paused' : ''}`}
                onClick={() => setStatus('Paused')}
              >
                <span className="acd-dot dot-paused" />
                Paused
              </button>

              <button
                type="button"
                className={`acd-status-btn ${status === 'Off' ? 'is-off' : ''}`}
                onClick={() => setStatus('Off')}
              >
                <span className="acd-dot dot-off" />
                Disabled
              </button>
            </div>
          </div>

          {/* Schedule Section */}
          <div className="acd-section">
            <label className="acd-section-label">SCHEDULE</label>
            
            <div className="acd-field-group">
              <span className="acd-field-title">Frequency</span>
              <div className="acd-freq-selector">
                {['Daily', 'Weekly', 'Custom'].map(f => (
                  <button
                    key={f}
                    type="button"
                    className={`acd-freq-opt ${frequency === f ? 'selected' : ''}`}
                    onClick={() => setFrequency(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {frequency === 'Weekly' && (
              <div className="acd-field-group">
                <span className="acd-field-title">Repeat Days</span>
                <div className="acd-days-row">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <button
                      key={day}
                      type="button"
                      className={`acd-day-chip ${selectedDays[day] ? 'active' : ''}`}
                      onClick={() => toggleDay(day)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="acd-field-group">
              <span className="acd-field-title">Time</span>
              <div className="acd-time-input-wrapper">
                <Clock size={15} className="acd-input-icon" />
                <input
                  type="text"
                  className="acd-text-input"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  placeholder="e.g. 08:00 AM"
                />
              </div>
            </div>
          </div>

          {/* Supported Automation Customizations */}
          <div className="acd-section">
            <label className="acd-section-label">AUTOMATION SETTINGS</label>
            
            <div className="acd-field-group">
              <span className="acd-field-title">Advance Notice Window</span>
              <select
                className="acd-select-input"
                value={advanceNotice}
                onChange={e => setAdvanceNotice(e.target.value)}
              >
                <option value="12 hours before">12 hours before</option>
                <option value="24 hours before">24 hours before</option>
                <option value="48 hours before">48 hours before</option>
                <option value="At exact scheduled time">At exact scheduled time</option>
              </select>
            </div>

            {/* Progressive Disclosure — More Options */}
            <div className="acd-more-accordion">
              <button
                type="button"
                className="acd-accordion-toggle"
                onClick={() => setShowMoreOptions(!showMoreOptions)}
              >
                <span>More options</span>
                {showMoreOptions ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>

              {showMoreOptions && (
                <div className="acd-accordion-content animate-fadeIn">
                  <div className="acd-field-group">
                    <span className="acd-field-title">Client-facing note / instructions</span>
                    <textarea
                      className="acd-textarea-input"
                      rows={2}
                      value={customNote}
                      onChange={e => setCustomNote(e.target.value)}
                      placeholder="Add custom therapist instructions or notes for this client..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Soft Confirmation for Disabling */}
          {showDisableConfirm && (
            <div className="acd-confirm-banner animate-fadeIn">
              <AlertCircle size={16} className="acd-banner-icon" />
              <div className="acd-banner-text">
                <strong>Disable this automation?</strong>
                <span>The client will no longer receive automated follow-ups for {automation.name}.</span>
              </div>
              <div className="acd-banner-actions">
                <button type="button" className="acd-btn-banner-cancel" onClick={() => setShowDisableConfirm(false)}>Cancel</button>
                <button type="button" className="acd-btn-banner-confirm" onClick={handleDisableConfirm}>Confirm Disable</button>
              </div>
            </div>
          )}

        </div>

        {/* Drawer Footer */}
        <div className="acd-footer">
          {status !== 'Off' && !showDisableConfirm && (
            <button
              type="button"
              className="acd-btn-ghost-danger"
              onClick={() => setShowDisableConfirm(true)}
            >
              <Power size={13} />
              <span>Disable</span>
            </button>
          )}

          <div className="acd-footer-right">
            <button type="button" className="acd-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="acd-btn-primary" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

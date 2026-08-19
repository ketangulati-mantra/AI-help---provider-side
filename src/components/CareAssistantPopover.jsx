import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Check, ChevronRight, Plus } from 'lucide-react'

export default function CareAssistantPopover({
  automations = [],
  onUpdateAutomation
}) {
  const [open, setOpen] = useState(false)
  // Views: 'overview' | 'manage' | 'add' | 'configure'
  const [currentView, setCurrentView] = useState('overview')
  const [selectedAuto, setSelectedAuto] = useState(null)

  // Configure Form State
  const [freq, setFreq] = useState('Every day')
  const [time, setTime] = useState('8:00 AM')

  // Enable Form State
  const [enableSchedule, setEnableSchedule] = useState('24 hours before session')

  const [toastMsg, setToastMsg] = useState(null)
  const popoverRef = useRef(null)
  const triggerRef = useRef(null)

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 1200)
  }

  // Outside click to close
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        open &&
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setOpen(false)
        setCurrentView('overview')
        setSelectedAuto(null)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [open])

  const activeAutomations = automations.filter(a => a.status === 'Active' || a.status === 'Paused')
  const availableAutomations = automations.filter(a => a.status === 'Off' || !a.status)
  const activeCount = automations.filter(a => a.status === 'Active').length

  const handleStartConfigure = (auto) => {
    setSelectedAuto(auto)
    if (auto.frequency?.includes('evening') || auto.frequency?.includes('8:00 PM')) {
      setFreq('Every evening')
      setTime('8:00 PM')
    } else {
      setFreq('Every day')
      setTime('8:00 AM')
    }
    setCurrentView('configure')
  }

  const handleSaveConfigure = () => {
    if (!selectedAuto) return
    const computed = `${freq} · ${time}`
    onUpdateAutomation({
      ...selectedAuto,
      frequency: computed,
      schedule: computed
    })
    setCurrentView('manage')
    showToast('Schedule updated')
  }

  const handleStartAdd = (auto) => {
    setSelectedAuto(auto)
    if (auto.id === 3) {
      setEnableSchedule('24 hours before session')
    } else {
      setEnableSchedule('Before plan expiry')
    }
  }

  const handleConfirmEnable = (auto) => {
    onUpdateAutomation({
      ...auto,
      status: 'Active',
      frequency: enableSchedule,
      schedule: enableSchedule
    })
    setSelectedAuto(null)
    setCurrentView('overview')
    showToast(`${auto.name} activated`)
  }

  const handleTogglePause = (auto) => {
    const newStatus = auto.status === 'Active' ? 'Paused' : 'Active'
    onUpdateAutomation({
      ...auto,
      status: newStatus
    })
    showToast(newStatus === 'Active' ? 'Resumed' : 'Paused')
  }

  return (
    <div className="calm-ca-wrapper">
      {/* Toast */}
      {toastMsg && (
        <div className="calm-ca-toast animate-fadeIn">
          <Check size={12} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ANCHORED CALM POPOVER */}
      {open && (
        <div className="calm-ca-popover animate-popoverIn" ref={popoverRef}>
          
          {/* ─────────────────────────────────────────────────────────────
              VIEW 1: DEFAULT OVERVIEW (Calm, minimal list of active only)
             ───────────────────────────────────────────────────────────── */}
          {currentView === 'overview' && (
            <div className="calm-ca-view">
              <div className="calm-ca-header">
                <div>
                  <div className="calm-ca-title">
                    <span>✨ Care Assistant</span>
                  </div>
                  <div className="calm-ca-subtitle">
                    {activeCount} {activeCount === 1 ? 'automation' : 'automations'} active
                  </div>
                </div>
              </div>

              <div className="calm-ca-body">
                {activeAutomations.length === 0 ? (
                  <div className="calm-ca-empty">No active automations for this client.</div>
                ) : (
                  <div className="calm-ca-list">
                    {activeAutomations.map(auto => (
                      <div key={auto.id} className="calm-ca-item">
                        <div className="calm-ca-item-hd">
                          <span className="calm-ca-item-name">{auto.name}</span>
                          <span className={`calm-ca-status-dot ${auto.status === 'Active' ? 'is-active' : 'is-paused'}`}>
                            {auto.status}
                          </span>
                        </div>
                        <div className="calm-ca-item-sub">
                          {auto.frequency || auto.schedule}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="calm-ca-footer">
                <button
                  type="button"
                  className="calm-ca-btn-add"
                  onClick={() => setCurrentView('add')}
                >
                  <Plus size={13} />
                  <span>Add automation</span>
                </button>

                <button
                  type="button"
                  className="calm-ca-btn-manage"
                  onClick={() => setCurrentView('manage')}
                >
                  Manage automations →
                </button>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              VIEW 2: MANAGE VIEW (Quiet Configure · Pause text actions)
             ───────────────────────────────────────────────────────────── */}
          {currentView === 'manage' && (
            <div className="calm-ca-view">
              <div className="calm-ca-header">
                <button
                  type="button"
                  className="calm-ca-back-btn"
                  onClick={() => setCurrentView('overview')}
                >
                  <ArrowLeft size={14} />
                  <span>Care Assistant</span>
                </button>
              </div>

              <div className="calm-ca-body">
                <div className="calm-ca-section-label">ACTIVE AUTOMATIONS</div>
                <div className="calm-ca-list">
                  {activeAutomations.map(auto => {
                    const isActive = auto.status === 'Active'
                    return (
                      <div key={auto.id} className="calm-ca-item">
                        <div className="calm-ca-item-hd">
                          <span className="calm-ca-item-name">{auto.name}</span>
                          <span className={`calm-ca-status-dot ${isActive ? 'is-active' : 'is-paused'}`}>
                            {auto.status}
                          </span>
                        </div>
                        <div className="calm-ca-item-sub">
                          {auto.frequency || auto.schedule}
                        </div>
                        <div className="calm-ca-actions-row">
                          <button
                            type="button"
                            className="calm-ca-text-btn"
                            onClick={() => handleStartConfigure(auto)}
                          >
                            Configure
                          </button>
                          <span className="calm-ca-sep">·</span>
                          <button
                            type="button"
                            className={`calm-ca-text-btn ${isActive ? 'is-pause' : 'is-resume'}`}
                            onClick={() => handleTogglePause(auto)}
                          >
                            {isActive ? 'Pause' : 'Resume'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="calm-ca-footer" style={{ justifyContent: 'flex-start' }}>
                <button
                  type="button"
                  className="calm-ca-btn-add"
                  onClick={() => setCurrentView('add')}
                >
                  <Plus size={13} />
                  <span>Add automation</span>
                </button>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              VIEW 3: ADD AUTOMATION (Progressive disclosure of available)
             ───────────────────────────────────────────────────────────── */}
          {currentView === 'add' && (
            <div className="calm-ca-view">
              <div className="calm-ca-header">
                <button
                  type="button"
                  className="calm-ca-back-btn"
                  onClick={() => {
                    setSelectedAuto(null)
                    setCurrentView('overview')
                  }}
                >
                  <ArrowLeft size={14} />
                  <span>Add an automation</span>
                </button>
              </div>

              <div className="calm-ca-body">
                <div className="calm-ca-section-label">RECOMMENDED FOR THIS SERVICE</div>
                {availableAutomations.length === 0 ? (
                  <div className="calm-ca-empty">All available automations are active.</div>
                ) : (
                  <div className="calm-ca-list">
                    {availableAutomations.map(auto => {
                      const isSelected = selectedAuto?.id === auto.id

                      return (
                        <div key={auto.id} className="calm-ca-item calm-ca-item--avail">
                          <div className="calm-ca-item-hd">
                            <div>
                              <div className="calm-ca-item-name">{auto.name}</div>
                              <div className="calm-ca-item-sub">
                                {auto.id === 3 ? 'Before upcoming appointments' : 'Upcoming package renewal'}
                              </div>
                            </div>
                            {!isSelected && (
                              <button
                                type="button"
                                className="calm-ca-btn-enable"
                                onClick={() => handleStartAdd(auto)}
                              >
                                Enable
                              </button>
                            )}
                          </div>

                          {/* Inline Enable Timing Form */}
                          {isSelected && (
                            <div className="calm-ca-inline-form animate-fadeIn">
                              <div className="calm-ca-form-lbl">When should the reminder be sent?</div>
                              <select
                                className="calm-ca-select"
                                value={enableSchedule}
                                onChange={e => setEnableSchedule(e.target.value)}
                              >
                                {auto.id === 3 ? (
                                  <>
                                    <option value="24 hours before session">24 hours before session</option>
                                    <option value="2 hours before session">2 hours before session</option>
                                    <option value="Day of appointment">Day of appointment</option>
                                  </>
                                ) : (
                                  <>
                                    <option value="Before plan expiry">Before plan expiry</option>
                                    <option value="3 days before plan expiry">3 days before plan expiry</option>
                                    <option value="7 days before plan expiry">7 days before plan expiry</option>
                                  </>
                                )}
                              </select>

                              <div className="calm-ca-form-btns">
                                <button
                                  type="button"
                                  className="calm-ca-cancel-btn"
                                  onClick={() => setSelectedAuto(null)}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  className="calm-ca-save-btn"
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
                )}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              VIEW 4: CONFIGURE AUTOMATION (Low-cognitive-load settings)
             ───────────────────────────────────────────────────────────── */}
          {currentView === 'configure' && selectedAuto && (
            <div className="calm-ca-view">
              <div className="calm-ca-header">
                <button
                  type="button"
                  className="calm-ca-back-btn"
                  onClick={() => setCurrentView('manage')}
                >
                  <ArrowLeft size={14} />
                  <span>{selectedAuto.name}</span>
                </button>
              </div>

              <div className="calm-ca-body">
                <div className="calm-ca-form-group">
                  <label className="calm-ca-form-lbl">How often?</label>
                  <select
                    className="calm-ca-select"
                    value={freq}
                    onChange={e => setFreq(e.target.value)}
                  >
                    <option value="Every day">Every day</option>
                    <option value="Every evening">Every evening</option>
                    <option value="Weekly on Monday">Weekly on Monday</option>
                  </select>
                </div>

                <div className="calm-ca-form-group">
                  <label className="calm-ca-form-lbl">Time</label>
                  <select
                    className="calm-ca-select"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                  >
                    <option value="8:00 AM">8:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="6:00 PM">6:00 PM</option>
                    <option value="8:00 PM">8:00 PM</option>
                  </select>
                </div>

                <div className="calm-ca-form-btns" style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    className="calm-ca-cancel-btn"
                    onClick={() => setCurrentView('manage')}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="calm-ca-save-btn"
                    onClick={handleSaveConfigure}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          COLLAPSED PILL TRIGGER (The ONLY persistent UI element)
         ───────────────────────────────────────────────────────────── */}
      <div className="calm-ca-trigger-container" ref={triggerRef}>
        <button
          type="button"
          className={`calm-ca-pill-btn ${open ? 'is-open' : ''}`}
          onClick={() => {
            setOpen(prev => !prev)
            if (!open) {
              setCurrentView('overview')
              setSelectedAuto(null)
            }
          }}
          title="Care Assistant follow-ups"
        >
          <span className="calm-ca-pill-sparkle">✨</span>
          <span className="calm-ca-pill-title">Care Assistant</span>
          <span className="calm-ca-pill-dot">•</span>
          <span className="calm-ca-pill-count">{activeCount} active</span>
          <ChevronRight size={13} className="calm-ca-pill-chevron" />
        </button>
      </div>
    </div>
  )
}

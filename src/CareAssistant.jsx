import React, { useState } from 'react'
import {
  Bot, MessageSquare, Calendar, Clock, ChevronDown, ChevronUp,
  X, Zap, RefreshCw, ToggleLeft, ToggleRight,
  Shield, Check, Play, Pause, Settings, FileText
} from 'lucide-react'

// Predefined AI coaches
const ALL_COACHES = [
  { id: 'wc',  name: 'Wellness Coach',       service: 'Wellness' },
  { id: 'fc1', name: 'Fitness Coach',         service: 'Fitness' },
  { id: 'nc',  name: 'Nutrition Coach',       service: 'Nutrition' },
  { id: 'pc',  name: 'Physio Coach',          service: 'Physio' },
  { id: 'wh',  name: "Women's Health Coach",  service: "Women's Health" },
]

const SERVICE_BADGE_STYLE = {
  Wellness:       { bg: 'rgba(99,102,241,0.08)',  color: '#818cf8' },
  Fitness:        { bg: 'rgba(16,185,129,0.08)',  color: '#34d399' },
  Nutrition:      { bg: 'rgba(245,158,11,0.08)',  color: '#fbbf24' },
  Physio:         { bg: 'rgba(59,130,246,0.08)',  color: '#60a5fa' },
  "Women's Health":{ bg: 'rgba(236,72,153,0.08)', color: '#f472b6' },
}

const MOCK_CONV = [
  { sender: 'ai',     text: "Hello! I'm your Wellness Coach. How are you feeling today?" },
  { sender: 'client', text: "I've been feeling a bit anxious about work lately." },
  { sender: 'ai',     text: "I understand. Work-related anxiety is very common. Can you tell me more about what's triggering it?" },
  { sender: 'client', text: "Mostly the deadlines and the pressure to perform. I haven't been sleeping well." },
  { sender: 'ai',     text: "Sleep and anxiety often go hand in hand. Let's try a quick breathing exercise together — inhale 4, hold 4, exhale 6." },
  { sender: 'client', text: "Yes, that sounds helpful." },
  { sender: 'ai',     text: "Practice this three times before bed. I'll check in tomorrow morning. You're doing really well!" },
]

// Predefined automations
const DEFAULT_AUTOMATIONS = [
  { id: 1, name: 'Medication Reminder',         frequency: 'Daily • 8:00 AM',                 status: 'Active' },
  { id: 2, name: 'Daily Mood Check-in',         frequency: 'Every evening',                   status: 'Active' },
  { id: 3, name: 'Payment & Renewal Reminder',  frequency: '24 hours before plan expiration', status: 'Paused' },
]

// Conversation viewer dialog modal
function ConversationModal({ coach, onClose }) {
  return (
    <div className="ca-modal-overlay" onClick={onClose}>
      <div className="ca-modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="ca-modal-header">
          <div className="ca-modal-title">
            <Bot size={18} className="ca-modal-icon" />
            <div>
              <div className="ca-modal-name">{coach.name}</div>
              <div className="ca-modal-sub">{coach.service} Coach Conversation log</div>
            </div>
          </div>
          <button className="ca-close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="ca-modal-body">
          {MOCK_CONV.map((m, i) => (
            <div key={i} className={`ca-modal-bubble-row ${m.sender}`}>
              <div className="ca-modal-bubble">
                <div className="ca-modal-bubble-sender">{m.sender === 'ai' ? coach.name : 'Client'}</div>
                <div className="ca-modal-bubble-text">{m.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Proper automation configuration dialog modal
function EditScheduleModal({ automation, onSave, onClose }) {
  const isPaymentReminder = automation.name === 'Payment & Renewal Reminder'

  const [freq, setFreq] = useState(() => {
    if (automation.frequency.toLowerCase().includes('daily')) return 'Daily'
    if (automation.frequency.toLowerCase().includes('week') || automation.frequency.toLowerCase().includes('evening')) return 'Every Week'
    return 'Daily'
  })
  
  const [runTime, setRunTime] = useState('08:00')
  const [selectedDays, setSelectedDays] = useState({
    Monday: true, Tuesday: true, Wednesday: true, Thursday: true, Friday: true, Saturday: false, Sunday: false
  })
  
  const [duration, setDuration] = useState('Until Disabled')
  const [customEndDate, setCustomEndDate] = useState('')
  const [startDate, setStartDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [notes, setNotes] = useState('')

  const [reminderDays, setReminderDays] = useState('24 hours before plan expiry')
  const [maxReminders, setMaxReminders] = useState('3')

  const applyQuickOption = (type) => {
    const nextDays = {
      Monday: false, Tuesday: false, Wednesday: false, Thursday: false, Friday: false, Saturday: false, Sunday: false
    }
    if (type === 'everyday') {
      Object.keys(nextDays).forEach(k => nextDays[k] = true)
    } else if (type === 'weekdays') {
      ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(k => nextDays[k] = true)
    } else if (type === 'weekends') {
      ['Saturday', 'Sunday'].forEach(k => nextDays[k] = true)
    }
    setSelectedDays(nextDays)
  }

  const toggleDay = (day) => {
    setSelectedDays(prev => ({ ...prev, [day]: !prev[day] }))
  }

  const handleSave = () => {
    if (isPaymentReminder) {
      const compiled = `${reminderDays} (Max ${maxReminders} reminders)`
      onSave(automation.id, compiled)
      return
    }

    let compiled = freq
    const getFormattedTime = (timeStr) => {
      if (!timeStr) return ''
      const [h, m] = timeStr.split(':')
      const hour = parseInt(h, 10)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const formattedHour = hour % 12 || 12
      return `${formattedHour}:${m} ${ampm}`
    }

    const timeFormatted = getFormattedTime(runTime)

    if (freq === 'Daily' || freq === 'Every Week') {
      const activeDays = Object.entries(selectedDays)
        .filter(([_, active]) => active)
        .map(([day]) => day.substring(0, 3))
      
      const daysStr = activeDays.length === 7 ? 'Every Day' : activeDays.join(', ')
      
      if (freq === 'Daily') {
        compiled = `Daily • ${timeFormatted}`
      } else {
        compiled = `Weekly (${daysStr}) • ${timeFormatted}`
      }
    } else if (freq.includes('hour')) {
      compiled = `${freq} • ${timeFormatted}`
    }

    onSave(automation.id, compiled)
  }

  const showTime = !['Before every session', 'After every session'].includes(freq)
  const showDays = ['Daily', 'Every Week'].includes(freq)

  if (isPaymentReminder) {
    return (
      <div className="ca-modal-overlay" onClick={onClose}>
        <div className="ca-modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px' }}>
          <div className="ca-modal-header">
            <div className="ca-modal-title">
              <Settings size={18} className="ca-modal-icon" />
              <div>
                <div className="ca-modal-name">Configure Automation</div>
                <div className="ca-modal-sub">Payment & Renewal Reminder</div>
              </div>
            </div>
            <button className="ca-close-btn" onClick={onClose}><X size={18} /></button>
          </div>

          <div className="ca-modal-body" style={{ gap: '16px' }}>
            <div className="ca-form-row">
              <label className="ca-form-label" style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>
                When should Mantra AI remind the client?
              </label>
              
              <div className="ca-radio-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  '7 days before plan expiry',
                  '3 days before plan expiry',
                  '24 hours before plan expiry',
                  'On the day of expiry',
                  '3 days after expiry',
                  '7 days after expiry (final reminder)'
                ].map(opt => (
                  <label key={opt} className="ca-radio-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="reminderDays"
                      checked={reminderDays === opt}
                      onChange={() => setReminderDays(opt)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="ca-form-row" style={{ marginTop: '4px' }}>
              <label className="ca-form-label" style={{ marginBottom: '4px' }}>Maximum reminders</label>
              <select 
                className="ca-form-select" 
                value={maxReminders} 
                onChange={e => setMaxReminders(e.target.value)}
                style={{ maxWidth: '120px' }}
              >
                <option>1</option>
                <option>2</option>
                <option>3</option>
              </select>
            </div>

            <div className="ca-form-actions" style={{ marginTop: '12px' }}>
              <button className="ca-action-btn-secondary" onClick={onClose}>Cancel</button>
              <button className="ca-action-btn-primary" onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ca-modal-overlay" onClick={onClose}>
      <div className="ca-modal-dialog ca-modal-dialog--wide" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        <div className="ca-modal-header">
          <div className="ca-modal-title">
            <Settings size={18} className="ca-modal-icon" />
            <div>
              <div className="ca-modal-name">Configure Automation</div>
              <div className="ca-modal-sub">{automation.name}</div>
            </div>
          </div>
          <button className="ca-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="ca-modal-body" style={{ gap: '18px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
            Customize when and how this automation should run for this client.
          </p>

          <div className="ca-form-row">
            <label className="ca-form-label">Run Frequency</label>
            <select className="ca-form-select" value={freq} onChange={e => setFreq(e.target.value)}>
              <option>Every 2 hours</option>
              <option>Every 4 hours</option>
              <option>Every 6 hours</option>
              <option>Every 8 hours</option>
              <option>Every 12 hours</option>
              <option>Daily</option>
              <option>Every Week</option>
              <option>Before every session</option>
              <option>After every session</option>
              <option>Custom</option>
            </select>
          </div>

          {showTime && (
            <div className="ca-form-row">
              <label className="ca-form-label">Run Time</label>
              <input className="ca-form-input" type="time" value={runTime} onChange={e => setRunTime(e.target.value)} />
            </div>
          )}

          {showDays && (
            <div className="ca-form-row">
              <label className="ca-form-label" style={{ marginBottom: '4px' }}>Active Days</label>
              <div className="ca-days-quick-row" style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <button type="button" className="ca-quick-day-btn" onClick={() => applyQuickOption('weekdays')}>Weekdays</button>
                <button type="button" className="ca-quick-day-btn" onClick={() => applyQuickOption('weekends')}>Weekends</button>
                <button type="button" className="ca-quick-day-btn" onClick={() => applyQuickOption('everyday')}>Every Day</button>
              </div>
              <div className="ca-days-checkboxes-grid">
                {Object.keys(selectedDays).map(day => (
                  <label key={day} className="ca-day-checkbox-label">
                    <input type="checkbox" checked={selectedDays[day]} onChange={() => toggleDay(day)} />
                    <span>{day.substring(0, 3)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="ca-form-cols" style={{ display: 'flex', gap: '12px' }}>
            <div className="ca-form-row" style={{ flex: 1 }}>
              <label className="ca-form-label">Automation Duration</label>
              <select className="ca-form-select" value={duration} onChange={e => setDuration(e.target.value)}>
                <option>Until Disabled</option>
                <option>1 Week</option>
                <option>2 Weeks</option>
                <option>1 Month</option>
                <option>3 Months</option>
                <option>6 Months</option>
                <option>Until Treatment Ends</option>
                <option>Custom End Date</option>
              </select>
            </div>
            <div className="ca-form-row" style={{ flex: 1 }}>
              <label className="ca-form-label">Start Date</label>
              <input className="ca-form-input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
          </div>

          {duration === 'Custom End Date' && (
            <div className="ca-form-row">
              <label className="ca-form-label">End Date</label>
              <input className="ca-form-input" type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} />
            </div>
          )}

          <div className="ca-form-row">
            <label className="ca-form-label">Provider Instructions (Optional)</label>
            <textarea
              className="ca-form-textarea"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Only remind after 9 AM. Skip reminders on weekends. Encourage medication adherence."
              rows={3}
              style={{ fontSize: '0.8rem', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
            />
            <span className="ca-form-helper-text" style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              These instructions will be used by Mantra AI while performing this automation.
            </span>
          </div>

          <div className="ca-form-actions" style={{ marginTop: '10px' }}>
            <button className="ca-action-btn-secondary" onClick={onClose}>Cancel</button>
            <button className="ca-action-btn-primary" onClick={handleSave}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Skeleton pulse animation component
function CareAssistantSkeleton() {
  return (
    <div className="ca-skeleton-container">
      {/* Overview Skeleton */}
      <div className="ca-settings-section">
        <h3 className="ca-settings-section-title">📊 Assistant Overview</h3>
        <p className="ca-settings-section-desc">A quick summary of your AI assistant's activity for this client.</p>
        <div className="ca-settings-overview-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="ca-settings-overview-card ca-skeleton-card">
              <div className="ca-skeleton-line short animate-pulse" />
              <div className="ca-skeleton-val animate-pulse" />
              <div className="ca-skeleton-line animate-pulse" style={{ marginTop: '8px' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Active Automations Skeleton */}
      <div className="ca-settings-section">
        <h3 className="ca-settings-section-title">⚡ Active Automations</h3>
        <p className="ca-settings-section-desc">Choose which Mantra AI automations should run for this client.</p>
        <div className="ca-settings-list">
          {[1, 2, 3].map(i => (
            <div key={i} className="ca-settings-row ca-skeleton-row" style={{ minHeight: '66px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="ca-settings-row-main" style={{ flexDirection: 'column', gap: '8px', alignItems: 'flex-start', flex: 1 }}>
                <div className="ca-skeleton-line medium animate-pulse" />
                <div className="ca-skeleton-line short animate-pulse" style={{ marginTop: '4px' }} />
              </div>
              <div className="ca-skeleton-btn animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CareAssistant({ clientName }) {
  const [enabled, setEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [viewingCoach, setViewingCoach] = useState(null)
  const [editingAuto, setEditingAuto] = useState(null)
  const [automations, setAutomations] = useState(DEFAULT_AUTOMATIONS)

  const [showAllAutos, setShowAllAutos] = useState(false)
  const [showAllConvs, setShowAllConvs] = useState(false)

  const handleToggle = () => {
    if (enabled) {
      setEnabled(false)
      setIsLoading(false)
    } else {
      setEnabled(true)
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
      }, 700) // simulated load time (700ms)
    }
  }

  const toggleStatus = (id) => {
    setAutomations(prev => prev.map(a => {
      if (a.id === id) {
        const nextStatus = a.status === 'Active' ? 'Paused' : 'Active'
        return { ...a, status: nextStatus }
      }
      return a
    }))
  }

  const toggleEnabledDisabled = (id) => {
    setAutomations(prev => prev.map(a => {
      if (a.id === id) {
        const nextStatus = a.status === 'Disabled' ? 'Active' : 'Disabled'
        return { ...a, status: nextStatus }
      }
      return a
    }))
  }

  const saveSchedule = (id, newFreq) => {
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, frequency: newFreq } : a))
    setEditingAuto(null)
  }

  const activeConversationsCount = ALL_COACHES.length
  const runningAutomationsCount = automations.filter(a => a.status === 'Active').length
  const assistantStatusText = enabled ? 'Monitoring active' : 'Disabled'

  const visibleAutos = showAllAutos ? automations : automations.slice(0, 3)
  const visibleConvs = showAllConvs ? ALL_COACHES : ALL_COACHES.slice(0, 3)

  return (
    <div className="ca-settings-layout">
      {/* HEADER - Static Height, upper section remains stationary */}
      <div className="ca-settings-header">
        <div className="ca-settings-header-top">
          <div className="ca-settings-title-group">
            <h2 className="ca-settings-title">Care Assistant</h2>
            <p className="ca-settings-subtitle">Manage AI follow-ups and review AI coach conversations for this client.</p>
          </div>
          <div className="ca-settings-toggle-container">
            <button className={`ca-toggle-btn ${enabled ? 'enabled' : ''}`} onClick={handleToggle}>
              {enabled ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
              <span>{enabled ? 'Enabled' : 'Disabled'}</span>
            </button>
          </div>
        </div>
        <p className="ca-settings-header-helper">
          When enabled, AI can perform delegated follow-up tasks while keeping you informed of important events.
        </p>
      </div>

      {/* PERSISTENT LOWER CONTENT CONTAINER WRAPPER */}
      <div className={`ca-lower-content-wrapper ${enabled ? 'expanded' : 'collapsed'}`}>
        <div className={`ca-lower-content-inner ${isLoading ? 'loading' : 'loaded'}`}>
          {isLoading ? (
            <CareAssistantSkeleton />
          ) : (
            <div className="ca-loaded-content">
              {/* OVERVIEW */}
              <div className="ca-settings-section">
                <h3 className="ca-settings-section-title">📊 Assistant Overview</h3>
                <p className="ca-settings-section-desc">A quick summary of your AI assistant's activity for this client.</p>
                
                <div className="ca-settings-overview-grid">
                  <div className="ca-settings-overview-card">
                    <span className="ca-overview-label">Active AI Conversations</span>
                    <span className="ca-overview-val">{activeConversationsCount}</span>
                    <span className="ca-overview-sub">AI coaches actively interacting with client.</span>
                  </div>
                  <div className="ca-settings-overview-card">
                    <span className="ca-overview-label">Running Automations</span>
                    <span className="ca-overview-val">{runningAutomationsCount}</span>
                    <span className="ca-overview-sub">AI is currently managing {runningAutomationsCount} follow-up tasks.</span>
                  </div>
                  <div className="ca-settings-overview-card">
                    <span className="ca-overview-label">Assistant Status</span>
                    <span className="ca-overview-val ca-overview-val--status">{assistantStatusText}</span>
                    <span className="ca-overview-sub">Status of overall Care Assistant system.</span>
                  </div>
                </div>
              </div>

              {/* ACTIVE AUTOMATIONS */}
              <div className="ca-settings-section">
                <h3 className="ca-settings-section-title">⚡ Active Automations</h3>
                <p className="ca-settings-section-desc">Choose which Mantra AI automations should run for this client.</p>

                <div className="ca-settings-list">
                  {visibleAutos.map(auto => {
                    const isAutoDisabled = auto.status === 'Disabled'
                    return (
                      <div key={auto.id} className="ca-settings-row">
                        <div className="ca-settings-row-main">
                          <div className="ca-settings-row-info">
                            <span className={`ca-settings-row-name ${isAutoDisabled ? 'disabled' : ''}`}>
                              {auto.name}
                            </span>
                            <span className="ca-settings-row-freq">{auto.frequency}</span>
                          </div>
                          <span className={`ca-settings-badge ca-settings-badge--${auto.status.toLowerCase()}`}>
                            {auto.status}
                          </span>
                        </div>
                        <div className="ca-settings-row-actions">
                          <button className="ca-link-action" onClick={() => setEditingAuto(auto)}>
                            Configure Schedule
                          </button>
                          {auto.status !== 'Disabled' && (
                            <button className="ca-link-action" onClick={() => toggleStatus(auto.id)}>
                              {auto.status === 'Active' ? 'Pause' : 'Resume'}
                            </button>
                          )}
                          <button className="ca-link-action" onClick={() => toggleEnabledDisabled(auto.id)}>
                            {isAutoDisabled ? 'Enable' : 'Disable'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {automations.length > 3 && (
                  <button className="ca-simple-text-link" onClick={() => setShowAllAutos(v => !v)}>
                    {showAllAutos ? 'Show fewer automations' : 'View all automations'}
                  </button>
                )}
              </div>

              {/* AI COACH CONVERSATIONS */}
              <div className="ca-settings-section">
                <h3 className="ca-settings-section-title">💬 AI Coach Conversations</h3>
                <p className="ca-settings-section-desc">Review conversations between this client and Mantra AI coaches.</p>

                <div className="ca-settings-list">
                  {visibleConvs.map(coach => {
                    const style = SERVICE_BADGE_STYLE[coach.service] || { bg: '#eee', color: '#333' }
                    return (
                      <div key={coach.id} className="ca-settings-row">
                        <div className="ca-settings-row-main">
                          <div className="ca-coach-avatar">
                            <Bot size={15} />
                          </div>
                          <span className="ca-coach-name">{coach.name}</span>
                          <span className="ca-coach-badge" style={{ background: style.bg, color: style.color }}>
                            {coach.service}
                          </span>
                        </div>
                        <button className="ca-simple-text-link" onClick={() => setViewingCoach(coach)}>
                          View Conversation →
                        </button>
                      </div>
                    )
                  })}
                </div>

                {ALL_COACHES.length > 3 && (
                  <button className="ca-simple-text-link" onClick={() => setShowAllConvs(v => !v)}>
                    {showAllConvs ? 'Show fewer conversations' : 'View all conversations'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {viewingCoach && <ConversationModal coach={viewingCoach} onClose={() => setViewingCoach(null)} />}
      {editingAuto && (
        <EditScheduleModal
          automation={editingAuto}
          onSave={saveSchedule}
          onClose={() => setEditingAuto(null)}
        />
      )}
    </div>
  )
}

export default CareAssistant

import React, { useState } from 'react'
import { Bot, MessageSquare, Clock, X, Zap, SlidersHorizontal } from 'lucide-react'
import AutomationCard from './components/AutomationCard'
import AutomationConfigDrawer from './components/AutomationConfigDrawer'

// Fixed Service Automations Catalog
export const DEFAULT_SERVICE_AUTOMATIONS = [
  {
    id: 'med-reminder',
    name: 'Medication Reminder',
    purpose: 'Help the client stay consistent with their prescribed medication schedule.',
    schedule: 'Daily • 8:00 AM',
    frequency: 'Daily • 8:00 AM',
    frequencyType: 'Daily',
    time: '08:00 AM',
    status: 'Active',
    category: 'Clinical'
  },
  {
    id: 'mood-checkin',
    name: 'Daily Mood Check-in',
    purpose: 'Gather daily emotional state, mood trends, and stress markers between sessions.',
    schedule: 'Every evening • 8:00 PM',
    frequency: 'Every evening • 8:00 PM',
    frequencyType: 'Daily',
    time: '08:00 PM',
    status: 'Active',
    category: 'Engagement'
  },
  {
    id: 'session-reminder',
    name: 'Session Reminder',
    purpose: 'Send automated session preparation prompts and time alerts before appointments.',
    schedule: '24 hours before session',
    frequency: '24 hours before session',
    frequencyType: 'Custom',
    time: '09:00 AM',
    status: 'Off',
    category: 'Operational'
  },
  {
    id: 'payment-reminder',
    name: 'Payment & Renewal Reminder',
    purpose: 'Notify client of upcoming package renewal, payment deadlines, or invoice updates.',
    schedule: '3 days before plan expiry',
    frequency: '3 days before plan expiry',
    frequencyType: 'Custom',
    time: '10:00 AM',
    status: 'Off',
    category: 'Operational'
  }
]

// Assigned AI Coaches
export const ALL_COACHES = [
  { id: 'wc',  name: 'Wellness Coach',       service: 'Wellness', lastMsg: 'Practiced 4-7-8 breathing exercise before bed.' },
  { id: 'fc1', name: 'Fitness Coach',         service: 'Fitness',  lastMsg: 'Completed 20 min morning mobility routine.' },
  { id: 'nc',  name: 'Nutrition Coach',       service: 'Nutrition',lastMsg: 'Logged hydration and daily meal notes.' },
]

const MOCK_CONV = [
  { sender: 'ai',     text: "Hello! I'm your AI Care Coach. How are you feeling today?" },
  { sender: 'client', text: "I've been feeling a bit anxious about work deadlines." },
  { sender: 'ai',     text: "I understand. Work pressure can be challenging. Let's try a quick mindfulness exercise together." },
  { sender: 'client', text: "Yes, that sounds helpful." },
  { sender: 'ai',     text: "Practice 4-7-8 breathing 3 times tonight. I'll check in tomorrow morning!" },
]

function ConversationModal({ coach, onClose }) {
  return (
    <div className="ca-modal-overlay animate-fadeIn" onClick={onClose}>
      <div className="ca-modal-dialog animate-slideUp" onClick={e => e.stopPropagation()}>
        <div className="ca-modal-header">
          <div className="ca-modal-title">
            <Bot size={18} className="ca-modal-icon" />
            <div>
              <div className="ca-modal-name">{coach.name}</div>
              <div className="ca-modal-sub">{coach.service} AI Coach Conversation Log</div>
            </div>
          </div>
          <button type="button" className="ca-close-btn" onClick={onClose}><X size={18} /></button>
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

export default function CareAssistant({
  clientName = 'Sarah Jenkins',
  automations = DEFAULT_SERVICE_AUTOMATIONS,
  onUpdateAutomation,
  onToggleStatus
}) {
  const [selectedCoach, setSelectedCoach] = useState(null)
  const [configuringAuto, setConfiguringAuto] = useState(null)

  const activeAutomations = automations.filter(a => a.status === 'Active' || a.status === 'Paused')
  const availableAutomations = automations.filter(a => a.status === 'Off' || !a.status)

  const handleSaveConfiguration = (updated) => {
    if (onUpdateAutomation) {
      onUpdateAutomation(updated)
    }
    setConfiguringAuto(null)
  }

  const handleDisableAutomation = (id) => {
    if (onToggleStatus) {
      onToggleStatus(id, 'Off')
    }
    setConfiguringAuto(null)
  }

  return (
    <div className="ca-redesign-container animate-fadeIn">
      
      {/* Header */}
      <div className="ca-redesign-header">
        <div className="ca-redesign-title-row">
          <h2 className="ca-redesign-title">CARE ASSISTANT</h2>
        </div>
        <p className="ca-redesign-subtitle">
          AI-powered follow-ups for {clientName}. Configure which supported follow-ups should run and when they should run.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="ca-redesign-content">
        
        {/* Section 1: Active Follow-ups */}
        <div className="ca-redesign-section">
          <div className="ca-section-header">
            <h3 className="ca-section-title">ACTIVE FOLLOW-UPS</h3>
            <span className="ca-section-badge">{activeAutomations.length} Running</span>
          </div>

          {activeAutomations.length === 0 ? (
            <div className="ca-empty-state">
              <p>No active follow-ups running for this client.</p>
            </div>
          ) : (
            <div className="ca-cards-grid">
              {activeAutomations.map(auto => (
                <AutomationCard
                  key={auto.id}
                  automation={auto}
                  onConfigure={auto => setConfiguringAuto(auto)}
                  onToggleStatus={(id, status) => onToggleStatus && onToggleStatus(id, status)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Available Follow-ups */}
        {availableAutomations.length > 0 && (
          <div className="ca-redesign-section">
            <div className="ca-section-header">
              <h3 className="ca-section-title">AVAILABLE FOLLOW-UPS</h3>
            </div>
            <div className="ca-cards-grid">
              {availableAutomations.map(auto => (
                <AutomationCard
                  key={auto.id}
                  automation={auto}
                  onConfigure={auto => setConfiguringAuto(auto)}
                  onToggleStatus={(id, status) => onToggleStatus && onToggleStatus(id, status)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Recent AI Coach Conversations */}
        <div className="ca-redesign-section">
          <div className="ca-section-header">
            <h3 className="ca-section-title">RECENT AI COACH CONVERSATIONS</h3>
          </div>

          <div className="ca-coach-list">
            {ALL_COACHES.map(coach => (
              <div key={coach.id} className="ca-coach-row">
                <div className="ca-coach-avatar">
                  <Bot size={16} />
                </div>
                <div className="ca-coach-info">
                  <div className="ca-coach-name">{coach.name}</div>
                  <div className="ca-coach-msg">{coach.lastMsg}</div>
                </div>
                <button
                  type="button"
                  className="ca-btn-view-conv"
                  onClick={() => setSelectedCoach(coach)}
                >
                  <MessageSquare size={13} />
                  <span>View</span>
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Drawer / Modals */}
      {configuringAuto && (
        <AutomationConfigDrawer
          automation={configuringAuto}
          onSave={handleSaveConfiguration}
          onClose={() => setConfiguringAuto(null)}
          onDisable={handleDisableAutomation}
        />
      )}

      {selectedCoach && (
        <ConversationModal
          coach={selectedCoach}
          onClose={() => setSelectedCoach(null)}
        />
      )}

    </div>
  )
}

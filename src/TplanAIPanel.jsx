import React, { useState, useRef, useEffect } from 'react'
import { Sparkles, Send, ChevronRight } from 'lucide-react'

const SUGGESTED_IMPROVEMENTS = [
  { id: 's1', label: 'Improve empathy tone' },
  { id: 's2', label: 'Expand treatment goals' },
  { id: 's3', label: 'Include ERP techniques' },
  { id: 's4', label: 'Include mindfulness elements' },
  { id: 's5', label: 'Add sleep CBT module' },
  { id: 's6', label: 'Generate Hindi version' },
  { id: 's7', label: 'Generate Spanish version' },
]

const CANNED_RESPONSES = {
  default: "I've reviewed the document. I can update any specific section — try asking me to adjust the goals, shorten the roadmap, or add a specific therapy technique.",
  cbt: "Added CBT-focused exercises to the Recommended Activities and noted the technique in your Provider Notes. Homework section has been updated with a thought record task.",
  short: "I've condensed the roadmap to 8 weeks total by merging Phases 3 and 4. The core goals and activities remain unchanged.",
  goals: "I've added two new therapy goals focused on building emotional regulation skills and increasing social confidence over the 12-week program.",
  empathy: "The Concerns section and Goals have been rewritten with a warmer, more empathetic tone. Clinical accuracy is preserved.",
  hindi: "A Hindi translation of the client-facing sections (Concerns, Goals, Activities, Homework) has been prepared. Provider Notes remain in English.",
}

function getResponse(message) {
  const m = message.toLowerCase()
  if (m.includes('cbt') || m.includes('exercise')) return CANNED_RESPONSES.cbt
  if (m.includes('short') || m.includes('week') || m.includes('reduce')) return CANNED_RESPONSES.short
  if (m.includes('goal')) return CANNED_RESPONSES.goals
  if (m.includes('empathy') || m.includes('tone') || m.includes('warm')) return CANNED_RESPONSES.empathy
  if (m.includes('hindi') || m.includes('translate')) return CANNED_RESPONSES.hindi
  return CANNED_RESPONSES.default
}

function TplanAIPanel({ plan, onApplySuggestion, onPlanChange }) {
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: "I've analyzed this treatment plan. I can help you refine any section — just describe what you'd like to change." }
  ])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isThinking])

  const sendMessage = () => {
    const text = input.trim()
    if (!text || isThinking) return
    setInput('')
    setChatMessages(prev => [...prev, { role: 'user', text }])
    setIsThinking(true)
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'ai', text: getResponse(text) }])
      setIsThinking(false)
    }, 1100)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleSuggestion = (suggestion) => {
    setChatMessages(prev => [...prev, { role: 'user', text: suggestion.label }])
    setIsThinking(true)
    onApplySuggestion(suggestion.label)
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'ai', text: getResponse(suggestion.label) }])
      setIsThinking(false)
    }, 1100)
  }

  return (
    <div className="tps-ai-panel">
      {/* Header */}
      <div className="tps-ai-panel-header">
        <div className="tps-ai-panel-header-icon">
          <Sparkles size={13} />
        </div>
        <span className="tps-ai-panel-title">AI Refinement</span>
      </div>

      {/* Suggested improvements */}
      <div className="tps-ai-suggestions">
        <p className="tps-ai-suggestions-label">Suggested improvements</p>
        <div className="tps-ai-suggestions-list">
          {SUGGESTED_IMPROVEMENTS.map(s => (
            <button
              key={s.id}
              className="tps-ai-suggestion-chip"
              onClick={() => handleSuggestion(s)}
            >
              <ChevronRight size={11} />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="tps-ai-panel-divider" />

      {/* Chat area */}
      <div className="tps-ai-chat">
        <p className="tps-ai-suggestions-label">Refine with AI</p>
        <div className="tps-ai-chat-messages">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`tps-ai-msg tps-ai-msg--${msg.role}`}>
              {msg.text}
            </div>
          ))}
          {isThinking && (
            <div className="tps-ai-msg tps-ai-msg--ai tps-ai-msg--thinking">
              <span className="tps-ai-thinking-dot" />
              <span className="tps-ai-thinking-dot" />
              <span className="tps-ai-thinking-dot" />
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="tps-ai-chat-input-row">
          <textarea
            className="tps-ai-chat-input"
            placeholder="Ask AI to refine a section…"
            value={input}
            rows={1}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="tps-ai-chat-send"
            onClick={sendMessage}
            disabled={!input.trim() || isThinking}
            title="Send"
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default TplanAIPanel

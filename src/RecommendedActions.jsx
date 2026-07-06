import React, { useState } from 'react'
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clipboard,
  Activity,
  Heart,
  Shield,
  FileText
} from 'lucide-react'

const ICON_MAP = {
  yoga: Activity,
  ocd: Clipboard,
  anxiety: Heart,
  psych: Shield,
  homework: FileText,
}

function RecommendedActions({ onCopilotChatSubmit, onSendRecommendation }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHidden, setIsHidden] = useState(true)  // collapsed by default

  const recommendations = [
    { type: 'ocd', title: 'OCD Assessment', explanation: 'Symptoms have changed since the previous assessment.', confidence: 'High', actionText: 'Send Assessment' },
    { type: 'yoga', title: 'Yoga Program', explanation: 'Reduce physical tension and improve sleep quality.', confidence: 'High', actionText: 'Recommend' },
    { type: 'anxiety', title: 'Anxiety Assessment (GAD-7)', explanation: 'Recommended before next therapy session.', confidence: 'Med', actionText: 'Send Assessment' },
    { type: 'psych', title: 'Psychiatry Consultation', explanation: 'Medication review if symptoms continue over next weeks.', confidence: 'Med', actionText: 'Refer' },
    { type: 'homework', title: 'CBT Homework Assignment', explanation: 'Assign exposure hierarchy worksheet for next session.', confidence: 'Med', actionText: 'Assign' },
  ]

  if (isHidden) {
    return (
      <div className="rec-actions-collapsed-bar">
        <button
          className="rec-actions-show-btn"
          onClick={() => setIsHidden(false)}
        >
          <Sparkles size={13} />
          Show Recommended Actions ({recommendations.length})
        </button>
      </div>
    )
  }

  const visibleRecs = isExpanded ? recommendations : recommendations.slice(0, 2)
  const remainingCount = recommendations.length - 2

  return (
    <div className="rec-actions-container">
      {/* Header */}
      <div className="rec-actions-header">
        <div className="rec-actions-header-left">
          <Sparkles size={14} className="rec-actions-icon" />
          <div className="rec-actions-header-text">
            <span className="rec-actions-title">Recommended Actions</span>
            <span className="rec-actions-subtitle">AI-generated interventions based on the client's latest clinical data.</span>
          </div>
        </div>
        <button className="rec-actions-hide-btn" onClick={() => setIsHidden(true)}>
          Hide
        </button>
      </div>

      {/* Recommendation Rows */}
      <div className="rec-actions-list">
        {visibleRecs.map((rec, idx) => {
          const IconComponent = ICON_MAP[rec.type] || Clipboard
          return (
            <div
              key={idx}
              className="rec-actions-row"
              style={{
                animationDelay: `${idx * 40}ms`
              }}
            >
              <div className="rec-actions-row-icon">
                <IconComponent size={16} />
              </div>
              <div className="rec-actions-row-text">
                <span className="rec-actions-row-title">{rec.title}</span>
                <span className="rec-actions-row-desc">{rec.explanation}</span>
              </div>
              <span className={`rec-actions-confidence ${rec.confidence.toLowerCase()}`}>
                {rec.confidence === 'High' ? 'High' : 'Medium'}
              </span>
              <button
                className="rec-actions-why-btn"
                onClick={() => onCopilotChatSubmit(`Why is "${rec.title}" recommended for this client?`)}
              >
                Why?
              </button>
              <button
                className="rec-actions-primary-btn"
                onClick={() => onSendRecommendation(rec.type, rec.title)}
              >
                {rec.actionText}
              </button>
            </div>
          )
        })}
      </div>

      {/* View More / View Less */}
      {recommendations.length > 2 && (
        <button
          className="rec-actions-toggle-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <ChevronUp size={14} />
              Show less
            </>
          ) : (
            <>
              <ChevronDown size={14} />
              View all recommendations ({recommendations.length})
            </>
          )}
        </button>
      )}
    </div>
  )
}

export default RecommendedActions

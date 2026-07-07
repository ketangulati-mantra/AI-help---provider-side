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
  yoga:     Activity,
  ocd:      Clipboard,
  anxiety:  Heart,
  psych:    Shield,
  homework: FileText,
}

const CONFIDENCE_LABEL = { High: 'High', Med: 'Medium' }

function RecommendedActions({ onCopilotChatSubmit, onSendRecommendation }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const recommendations = [
    { type: 'ocd',      title: 'OCD Assessment',            explanation: 'Symptoms have changed since the previous assessment.',  confidence: 'High', actionText: 'Send Assessment' },
    { type: 'yoga',     title: 'Yoga Program',               explanation: 'Reduce physical tension and improve sleep quality.',    confidence: 'High', actionText: 'Recommend'       },
    { type: 'anxiety',  title: 'Anxiety Assessment (GAD-7)', explanation: 'Recommended before next therapy session.',              confidence: 'Med',  actionText: 'Send Assessment' },
    { type: 'psych',    title: 'Psychiatry Consultation',   explanation: 'Medication review if symptoms continue over next weeks.', confidence: 'Med', actionText: 'Refer'           },
    { type: 'homework', title: 'CBT Homework Assignment',   explanation: 'Assign exposure hierarchy worksheet for next session.',  confidence: 'Med',  actionText: 'Assign'          },
  ]

  const visibleRecs = isExpanded ? recommendations : recommendations.slice(0, 2)
  const hiddenCount = recommendations.length - 2

  return (
    <div className="snapshot-section-card snapshot-section-card--amber rec-actions-section">

      {/* Section header */}
      <div className="snapshot-section-hd">
        <Sparkles size={13} className="snapshot-section-icon accent" />
        <div className="snapshot-section-hd-text">
          <div className="snapshot-section-title-row">
            <span className="snapshot-section-title">Recommended Actions</span>
            <span className="snapshot-section-badge">{recommendations.length}</span>
          </div>
          <span className="snapshot-section-subtitle">Based on recent clinical insights and client activity.</span>
        </div>
      </div>

      {/* Recommendation rows */}
      <div className="rec-actions-list">
        {visibleRecs.map((rec, idx) => {
          const IconComponent = ICON_MAP[rec.type] || Clipboard
          return (
            <div
              key={idx}
              className="rec-actions-row"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <div className="rec-actions-row-icon">
                <IconComponent size={15} />
              </div>
              <div className="rec-actions-row-text">
                <span className="rec-actions-row-title">{rec.title}</span>
                <span className="rec-actions-row-desc">{rec.explanation}</span>
              </div>
              <span className={`rec-actions-confidence ${rec.confidence.toLowerCase()}`}>
                {CONFIDENCE_LABEL[rec.confidence] ?? rec.confidence}
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

      {/* Expand / collapse */}
      {hiddenCount > 0 && (
        <button
          className="rec-actions-toggle-btn"
          onClick={() => setIsExpanded(v => !v)}
        >
          {isExpanded
            ? <><ChevronUp size={13} /> Show less</>
            : <><ChevronDown size={13} /> View all recommendations ({recommendations.length})</>
          }
        </button>
      )}

    </div>
  )
}

export default RecommendedActions

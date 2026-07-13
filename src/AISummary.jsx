import React, { useState, useRef, useCallback, useEffect } from 'react'
import { ChevronRight, ChevronLeft, TrendingUp, AlertCircle, Moon, Target } from 'lucide-react'

const SNAPSHOT_MIN_WIDTH = 240
const SNAPSHOT_MAX_WIDTH = 380
const SNAPSHOT_DEFAULT_WIDTH = 300

function AISummary({
  isSummaryExpanded,
  setIsSummaryExpanded,
  onCopilotChatSubmit,
  fullWidth,
  children,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [panelWidth, setPanelWidth] = useState(SNAPSHOT_DEFAULT_WIDTH)
  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(SNAPSHOT_DEFAULT_WIDTH)

  // Draggable divider handlers
  const handleDividerMouseDown = useCallback((e) => {
    e.preventDefault()
    isDraggingRef.current = true
    startXRef.current = e.clientX
    startWidthRef.current = panelWidth
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [panelWidth])

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return
      const delta = e.clientX - startXRef.current
      const newWidth = Math.min(SNAPSHOT_MAX_WIDTH, Math.max(SNAPSHOT_MIN_WIDTH, startWidthRef.current + delta))
      setPanelWidth(newWidth)
    }

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  // Insights data — using Lucide icons instead of emojis
  const insights = [
    { Icon: TrendingUp, title: 'Progress improving', text: 'Client has become more engaged.' },
    { Icon: AlertCircle, title: 'Anxiety elevation', text: 'Mild increase in work-related anxiety.' },
    { Icon: Moon, title: 'Sleep consistency', text: 'Sleep patterns are gradually improving.' },
    { Icon: Target, title: 'Next session target', text: 'Focus today\'s discussion on work avoidance.' }
  ]

  // COLLAPSED STATE: slim sidebar with single chevron
  if (isCollapsed) {
    return (
      <>
        <div className="copilot-workspace-left collapsed">
          <div className="collapsed-snapshot-sidebar">
            <button
              className="collapsed-expand-btn"
              onClick={() => setIsCollapsed(false)}
              aria-label="Expand AI Summary"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
        {/* Divider hidden when collapsed */}
      </>
    )
  }

  // EXPANDED STATE
  return (
    <>
      <div
        className="copilot-workspace-left expanded"
        style={fullWidth ? {} : { width: panelWidth, minWidth: panelWidth }}
      >
        {/* STICKY HEADER — hidden in fullWidth/tab mode */}
        <div className={`snapshot-expanded-header snapshot-sticky-header${fullWidth ? ' snapshot-sticky-header--hidden' : ''}`}>
          <span className="snapshot-expanded-title">AI Summary</span>
          {!fullWidth && (
            <button
              className="snapshot-collapse-btn"
              onClick={() => setIsCollapsed(true)}
              aria-label="Collapse AI Summary"
            >
              <ChevronLeft size={14} />
            </button>
          )}
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="snapshot-scrollable-content">

          {/* ── AI SUMMARY CARD ── */}
          <div className="snapshot-section-card snapshot-section-card--blue">
            <div className="snapshot-section-hd">
              <span className="snapshot-section-title">AI Summary</span>
            </div>
            <div className={`summary-paragraph-text ${isSummaryExpanded ? 'expanded' : 'collapsed'}`}>
              The client has remained engaged with therapy and has shown gradual improvement over the past few weeks. <span className="summary-highlight">Anxiety before work</span> appears to spike, while mood has remained relatively stable. <span className="summary-highlight">Sleep consistency is improving</span>, though <span className="summary-highlight">activity completion is declining</span> slightly. Based on recent AI conversations, the client responds well to structured guidance and mindfulness exercises.
              {isSummaryExpanded ? (
                <button
                  className="summary-toggle-link inline"
                  onClick={() => setIsSummaryExpanded(false)}
                >
                  [Read less]
                </button>
              ) : (
                <button
                  className="summary-toggle-link absolute"
                  onClick={() => setIsSummaryExpanded(true)}
                >
                  Read more →
                </button>
              )}
            </div>
          </div>

          {/* ── KEY INSIGHTS CARD ── */}
          <div className="snapshot-section-card snapshot-section-card--neutral">
            <div className="snapshot-section-hd">
              <span className="snapshot-section-title">Key Insights</span>
              <span className="snapshot-section-badge">{insights.length}</span>
            </div>
            <div className="insights-snapshot-list compact">
              {insights.map((item, idx) => {
                const IconComp = item.Icon
                return (
                  <div key={idx} className="ik-card">
                    <div className="ik-card-body">
                      <span className="ik-icon">
                        <IconComp size={14} />
                      </span>
                      <div className="ik-text">
                        <div className="ik-title">{item.title}</div>
                        <div className="ik-desc">{item.text}</div>
                      </div>
                    </div>
                    <button
                      className="ik-pill"
                      onClick={() => onCopilotChatSubmit(`Explain the insight: "${item.title} - ${item.text}"`)}
                    >
                      Ask Copilot →
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {children}

        </div>
      </div>

      {/* DRAGGABLE DIVIDER — hidden in fullWidth/tab mode */}
      {!fullWidth && (
        <div
          className="snapshot-resize-divider"
          onMouseDown={handleDividerMouseDown}
          title="Drag to resize"
        >
          <div className="snapshot-resize-divider-line" />
        </div>
      )}
    </>
  )
}

export default AISummary

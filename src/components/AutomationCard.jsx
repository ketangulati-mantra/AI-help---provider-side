import React from 'react'
import { Clock, Play, Pause, Settings, Check, Zap, SlidersHorizontal, ChevronRight } from 'lucide-react'

export default function AutomationCard({
  automation,
  onConfigure,
  onToggleStatus,
  compact = false
}) {
  const isActive = automation.status === 'Active'
  const isPaused = automation.status === 'Paused'
  const isOff = automation.status === 'Off' || !automation.status

  const getStatusBadge = () => {
    if (isActive) {
      return <span className="ac-status-badge ac-status-badge--active"><span className="ac-status-dot" />ACTIVE</span>
    }
    if (isPaused) {
      return <span className="ac-status-badge ac-status-badge--paused">PAUSED</span>
    }
    return <span className="ac-status-badge ac-status-badge--off">OFF</span>
  }

  if (compact) {
    return (
      <div className={`ac-compact-card ${isActive ? 'is-active' : ''}`}>
        <div className="ac-compact-left">
          <div className="ac-compact-title-row">
            <span className="ac-compact-name">{automation.name}</span>
            {getStatusBadge()}
          </div>
          <div className="ac-compact-schedule">
            <Clock size={12} className="ac-icon-muted" />
            <span>{automation.frequency || automation.schedule}</span>
          </div>
        </div>
        <div className="ac-compact-actions">
          <button
            type="button"
            className="ac-btn-subtle"
            onClick={() => onConfigure && onConfigure(automation)}
          >
            <SlidersHorizontal size={13} />
            <span>Manage</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`ac-card ${isActive ? 'is-active' : isPaused ? 'is-paused' : 'is-off'}`}>
      <div className="ac-card-header">
        <div className="ac-card-title-group">
          <div className="ac-card-name-row">
            <h4 className="ac-card-name">{automation.name}</h4>
            {getStatusBadge()}
          </div>
          {automation.purpose && (
            <p className="ac-card-purpose">{automation.purpose}</p>
          )}
        </div>
      </div>

      <div className="ac-card-body">
        <div className="ac-schedule-row">
          <Clock size={14} className="ac-schedule-icon" />
          <span className="ac-schedule-text">{automation.frequency || automation.schedule}</span>
        </div>

        <div className="ac-card-footer-actions">
          {isOff ? (
            <button
              type="button"
              className="ac-btn ac-btn-primary"
              onClick={() => onConfigure && onConfigure(automation)}
            >
              <Zap size={13} />
              <span>Enable</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                className="ac-btn ac-btn-secondary"
                onClick={() => onConfigure && onConfigure(automation)}
              >
                <Settings size={13} />
                <span>Configure</span>
              </button>

              <button
                type="button"
                className={`ac-btn ${isActive ? 'ac-btn-ghost-warning' : 'ac-btn-ghost-success'}`}
                onClick={() => onToggleStatus && onToggleStatus(automation.id, isActive ? 'Paused' : 'Active')}
              >
                {isActive ? <Pause size={13} /> : <Play size={13} />}
                <span>{isActive ? 'Pause' : 'Resume'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

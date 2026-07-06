import React from 'react'
import { FileText } from 'lucide-react'

function TplanDocNav({ sections, activeSection, onSectionClick }) {
  return (
    <div className="tps-nav">
      <div className="tps-nav-header">
        <FileText size={13} />
        <span>Document</span>
      </div>
      <nav className="tps-nav-list">
        {sections.map((section, idx) => (
          <button
            key={section.id}
            className={`tps-nav-item ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => onSectionClick(section.id)}
          >
            <span className="tps-nav-number">{idx + 1}</span>
            <span className="tps-nav-label">{section.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

export default TplanDocNav

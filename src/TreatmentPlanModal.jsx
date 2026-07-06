import React from 'react'
import TreatmentPlanStudio from './TreatmentPlanStudio'

// Opens Treatment Plan Studio immediately — no loading screen.
function TreatmentPlanModal({ onClose, onSendToClient }) {
  return (
    <div className="tplan-overlay">
      <div className="tplan-modal tplan-modal--studio">
        <TreatmentPlanStudio onClose={onClose} onSendToClient={onSendToClient} />
      </div>
    </div>
  )
}

export default TreatmentPlanModal

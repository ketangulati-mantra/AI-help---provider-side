import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Download, Eye, Send, Loader2, Check, X, FileText } from 'lucide-react'
import TplanDocEditor from './TplanDocEditor'
import TplanToolbox from './TplanToolbox'
import TplanPreviewModal from './TplanPreviewModal'

// ─── Pills defaults ───────────────────────────────────────────────────────────
const DEFAULT_SERVICES_PILLS = {
  options: [
    'Individual Therapy', 'Psychiatry', 'Yoga', 'Meditation', 'Dietician',
    'Life Coaching', 'Family Therapy', 'Couples Therapy', 'Support Groups',
    'Mindfulness', 'Group Therapy',
  ],
  selected: ['Individual Therapy', 'Yoga', 'Meditation'],
}

const DEFAULT_ASSESSMENTS_PILLS = {
  options: [
    'PHQ-9', 'GAD-7', 'OCD Assessment', 'Stress Assessment',
    'Sleep Assessment', 'Burnout Assessment', 'Lifestyle Assessment', 'Wellbeing Assessment',
  ],
  selected: ['PHQ-9', 'GAD-7'],
}

// ─── Shared client info field schema ──────────────────────────────────────────
const PLAN_TYPE_OPTIONS = ['Individual Therapy', 'Couples Therapy', 'Family Therapy', 'Group Therapy', 'Online Therapy', 'Intensive Outpatient', 'Other']
const DURATION_OPTIONS = ['4 Weeks', '6 Weeks', '8 Weeks', '10 Weeks', '12 Weeks', '16 Weeks', '6 Months', '12 Months', 'Ongoing', 'Custom']

function defaultClientFields(planType = 'Individual Therapy') {
  return [
    { id: 'f1', label: 'Client Name', value: 'Ketan Gulati', type: 'text' },
    { id: 'f2', label: 'Provider', value: 'Dr. Sarah Matthews', type: 'text' },
    { id: 'f3', label: 'Plan Date', value: new Date().toLocaleDateString('en-GB'), type: 'text' },
    { id: 'f4', label: 'Treatment Type', value: planType, type: 'select', options: PLAN_TYPE_OPTIONS },
    { id: 'f5', label: 'Duration', value: '12 Weeks', type: 'select', options: DURATION_OPTIONS },
    { id: 'f6', label: 'Start Date', value: '', type: 'text' },
    { id: 'f7', label: 'Next Review Date', value: '', type: 'text' },
  ]
}

// ─── Default template ─────────────────────────────────────────────────────────
function createInitialSections() {
  return [
    {
      id: 'ci_1', type: 'client_info', title: 'Client Information', expanded: true,
      data: { fields: defaultClientFields() }
    },
    {
      id: 'pc_1', type: 'rich_text', title: 'Presenting Concerns', expanded: true,
      data: { html: 'The client presents with work-related anxiety, disrupted sleep, and gradual social withdrawal over the past three months. These concerns appear to be interconnected, with occupational stress serving as the primary trigger.' }
    },
    {
      id: 'tg_1', type: 'checklist', title: 'Treatment Goals', expanded: true,
      data: {
        items: [
          { id: 'g1', text: 'Reduce work-related anxiety to manageable levels within 8 weeks' },
          { id: 'g2', text: 'Establish consistent sleep hygiene and achieve 7+ hours nightly' },
          { id: 'g3', text: 'Re-engage with 2–3 social activities per month' },
          { id: 'g4', text: 'Develop and practice 3 evidence-based coping strategies' },
          { id: 'g5', text: 'Improve emotional regulation through regular journaling practice' },
        ]
      }
    },
    {
      id: 'tr_1', type: 'timeline', title: 'Treatment Roadmap', expanded: true,
      data: {
        phases: [
          { id: 'p1', label: 'Phase 1', duration: 'Weeks 1–2', title: 'Assessment & Foundation', description: 'Complete baseline assessments, establish therapeutic alliance, and introduce psychoeducation about anxiety.', collapsed: false },
          { id: 'p2', label: 'Phase 2', duration: 'Weeks 3–5', title: 'Skill Building', description: 'Introduce CBT techniques, breathing exercises, and sleep hygiene protocols. Identify cognitive distortions.', collapsed: false },
          { id: 'p3', label: 'Phase 3', duration: 'Weeks 6–8', title: 'Application & Practice', description: 'Apply learned skills to real-world situations. Conduct behavioral experiments for work-related anxiety.', collapsed: false },
          { id: 'p4', label: 'Phase 4', duration: 'Weeks 9–12', title: 'Consolidation', description: 'Review progress and develop a personalized relapse prevention plan for long-term wellbeing.', collapsed: false },
        ]
      }
    },
    {
      id: 'rs_1', type: 'pills', title: 'Services Included', expanded: true,
      data: { ...DEFAULT_SERVICES_PILLS }
    },
    {
      id: 'ra_1', type: 'pills', title: 'Assessments Included', expanded: true,
      data: { ...DEFAULT_ASSESSMENTS_PILLS }
    },
    {
      id: 'hw_1', type: 'checklist', title: 'Homework Between Sessions', expanded: true,
      data: {
        items: [
          { id: 'h1', text: 'Complete daily mood tracking using the provided journal template' },
          { id: 'h2', text: 'Practice 4-7-8 breathing exercise for 5 minutes before bed' },
          { id: 'h3', text: 'Identify and log 3 work-related anxiety triggers this week' },
          { id: 'h4', text: 'Attempt one social activity before the next session' },
        ]
      }
    },
    {
      id: 'lr_1', type: 'lifestyle', title: 'Lifestyle Recommendations', expanded: true,
      data: {
        items: [
          { id: 'l1', text: 'Maintain consistent sleep and wake times (10 PM – 6 AM)' },
          { id: 'l2', text: 'Limit screen time to 30 minutes before bed' },
          { id: 'l3', text: 'Exercise for 30 minutes at least 3× per week' },
          { id: 'l4', text: 'Reduce caffeine intake after 2 PM' },
          { id: 'l5', text: 'Schedule one relaxing personal activity each day' },
        ]
      }
    },
    {
      id: 'sf_1', type: 'dropdown', title: 'Session Frequency', expanded: true,
      data: { options: ['Weekly', 'Bi-weekly', 'Monthly', 'Custom'], selected: 'Weekly', customNote: '' }
    },
    {
      id: 'eo_1', type: 'rich_text', title: 'Expected Outcomes', expanded: true,
      data: { html: 'With consistent engagement in therapy and implementation of the recommended strategies, the client is expected to demonstrate significant reduction in anxiety symptoms, improved sleep quality, and increased social participation within the 12-week program.' }
    },
    {
      id: 'ns_1', type: 'checklist', title: 'Next Steps', expanded: true,
      data: {
        items: [
          { id: 'ns1', text: 'Complete PHQ-9 and GAD-7 baseline assessments before next session' },
          { id: 'ns2', text: 'Review and sign treatment plan agreement' },
          { id: 'ns3', text: 'Schedule 12-week appointment calendar with provider' },
          { id: 'ns4', text: 'Download therapy journal template from client portal' },
        ]
      }
    },
  ]
}

// ─── Template library ─────────────────────────────────────────────────────────
function createTemplate(templateName) {
  const base = (planType, concerns, goals, phases) => [
    {
      id: 'ci_1', type: 'client_info', title: 'Client Information', expanded: true,
      data: { fields: defaultClientFields(planType) }
    },
    { id: 'pc_1', type: 'rich_text', title: 'Presenting Concerns', expanded: true, data: { html: concerns } },
    {
      id: 'tg_1', type: 'checklist', title: 'Treatment Goals', expanded: true,
      data: { items: goals.map((t, i) => ({ id: `g${i}`, text: t })) }
    },
    {
      id: 'tr_1', type: 'timeline', title: 'Treatment Roadmap', expanded: true,
      data: { phases: phases.map((p, i) => ({ ...p, id: `p${i}`, collapsed: false })) }
    },
    {
      id: 'rs_1', type: 'pills', title: 'Services Included', expanded: true,
      data: { ...DEFAULT_SERVICES_PILLS }
    },
    {
      id: 'ra_1', type: 'pills', title: 'Assessments Included', expanded: true,
      data: { ...DEFAULT_ASSESSMENTS_PILLS }
    },
    {
      id: 'hw_1', type: 'checklist', title: 'Homework Between Sessions', expanded: true,
      data: { items: [{ id: 'h1', text: '' }] }
    },
    {
      id: 'sf_1', type: 'dropdown', title: 'Session Frequency', expanded: true,
      data: { options: ['Weekly', 'Bi-weekly', 'Monthly', 'Custom'], selected: 'Weekly', customNote: '' }
    },
    { id: 'eo_1', type: 'rich_text', title: 'Expected Outcomes', expanded: true, data: { html: '' } },
    {
      id: 'ns_1', type: 'checklist', title: 'Next Steps', expanded: true,
      data: { items: [{ id: 'ns1', text: 'Schedule initial session and complete baseline assessments' }] }
    },
  ]

  switch (templateName) {
    case 'Blank Template':
      return [
        {
          id: 'ci_1', type: 'client_info', title: 'Client Information', expanded: true,
          data: {
            fields: defaultClientFields('').map(f =>
              f.id === 'f1' || f.id === 'f2' || f.id === 'f6' || f.id === 'f7'
                ? { ...f, value: '' } : f
            )
          }
        },
        { id: 'pc_1', type: 'rich_text', title: 'Presenting Concerns', expanded: true, data: { html: '' } },
        { id: 'tg_1', type: 'checklist', title: 'Treatment Goals', expanded: true, data: { items: [{ id: 'g1', text: '' }] } },
        { id: 'ns_1', type: 'checklist', title: 'Next Steps', expanded: true, data: { items: [{ id: 'ns1', text: '' }] } },
      ]
    case 'Anxiety':
      return base('Individual Therapy',
        'Client presents with generalized anxiety, panic episodes, and avoidance behaviors.',
        ['Reduce frequency of anxiety episodes using CBT techniques', 'Develop a personalized anxiety management toolkit', 'Practice exposure exercises for avoided situations', 'Establish daily mindfulness and grounding routines'],
        [{ label: 'Phase 1', duration: 'Weeks 1–2', title: 'Psychoeducation', description: 'Understand anxiety mechanisms, triggers, and the CBT model.' },
        { label: 'Phase 2', duration: 'Weeks 3–6', title: 'Skill Development', description: 'Breathing exercises, cognitive restructuring, and worry time techniques.' },
        { label: 'Phase 3', duration: 'Weeks 7–10', title: 'Exposure & Practice', description: 'Graduated exposure to feared situations, behavioral experiments.' },
        { label: 'Phase 4', duration: 'Weeks 11–12', title: 'Relapse Prevention', description: 'Build maintenance plan, identify early warning signs.' }])
    case 'Depression':
      return base('Individual Therapy',
        'Client presents with persistent low mood, loss of interest, fatigue and withdrawal from daily activities.',
        ['Increase behavioral activation and daily engagement', 'Reduce negative cognitive patterns and self-criticism', 'Establish and maintain healthy daily routines', 'Improve social connection and support network'],
        [{ label: 'Phase 1', duration: 'Weeks 1–2', title: 'Assessment & Safety', description: 'Baseline assessment, safety planning, and psychoeducation about depression.' },
        { label: 'Phase 2', duration: 'Weeks 3–5', title: 'Behavioral Activation', description: 'Activity scheduling, pleasure and achievement tracking, routine building.' },
        { label: 'Phase 3', duration: 'Weeks 6–9', title: 'Cognitive Restructuring', description: 'Identifying and challenging negative thought patterns and core beliefs.' },
        { label: 'Phase 4', duration: 'Weeks 10–12', title: 'Maintenance', description: 'Relapse prevention, self-compassion, and long-term wellbeing planning.' }])
    case 'OCD':
      return base('Individual Therapy',
        'Client presents with intrusive thoughts and compulsive behaviors interfering with daily functioning.',
        ['Understand the OCD cycle and ERP principles', 'Reduce compulsion frequency through graduated ERP', 'Develop tolerance for uncertainty and distress', 'Build a relapse prevention plan and long-term coping tools'],
        [{ label: 'Phase 1', duration: 'Weeks 1–2', title: 'Psychoeducation & Assessment', description: 'OCD model, symptom hierarchy, and treatment rationale for ERP.' },
        { label: 'Phase 2', duration: 'Weeks 3–8', title: 'ERP Exercises', description: 'Graduated exposure exercises from low to high on the hierarchy. Response prevention.' },
        { label: 'Phase 3', duration: 'Weeks 9–11', title: 'Generalization', description: 'Apply ERP skills to new situations, reduce accommodations.' },
        { label: 'Phase 4', duration: 'Week 12', title: 'Relapse Prevention', description: 'Warning sign identification, self-directed ERP, and booster session planning.' }])
    case 'Stress & Burnout':
      return base('Individual Therapy',
        'Client presents with chronic occupational stress, emotional exhaustion, and reduced sense of accomplishment.',
        ['Identify primary sources of occupational and personal stress', 'Develop effective boundary-setting skills at work and home', 'Restore energy through structured rest and self-care', 'Build long-term stress resilience and work-life balance'],
        [{ label: 'Phase 1', duration: 'Weeks 1–2', title: 'Assessment & Awareness', description: 'Burnout indicators, stress triggers, and lifestyle audit.' },
        { label: 'Phase 2', duration: 'Weeks 3–5', title: 'Stabilization', description: 'Sleep hygiene, energy management, and immediate stress reduction techniques.' },
        { label: 'Phase 3', duration: 'Weeks 6–9', title: 'Skill Building', description: 'Boundary setting, cognitive reframing, assertiveness training.' },
        { label: 'Phase 4', duration: 'Weeks 10–12', title: 'Sustainability', description: 'Long-term habits, recovery routines, and preventive planning.' }])
    case 'Couples Therapy':
      return base('Couples Therapy',
        'Couple presents with communication difficulties, recurring conflict patterns, and reduced emotional intimacy.',
        ['Establish safe and respectful communication patterns', 'Identify and interrupt destructive conflict cycles', 'Deepen emotional understanding and empathy between partners', 'Rebuild trust and shared goals for the relationship'],
        [{ label: 'Phase 1', duration: 'Sessions 1–3', title: 'Assessment & Goals', description: 'Relationship history, individual perspectives, and shared therapy goals.' },
        { label: 'Phase 2', duration: 'Sessions 4–8', title: 'Communication Skills', description: 'Active listening, Gottman techniques, and non-violent communication.' },
        { label: 'Phase 3', duration: 'Sessions 9–12', title: 'Conflict Resolution', description: 'Identifying patterns, de-escalation strategies, and repair attempts.' },
        { label: 'Phase 4', duration: 'Sessions 13–16', title: 'Connection & Maintenance', description: 'Rebuilding intimacy, shared vision, and relapse prevention.' }])
    case 'Family Therapy':
      return base('Family Therapy',
        'Family presents with communication breakdown, role conflicts, and difficulty supporting a member with mental health challenges.',
        ['Improve communication and listening across all family members', 'Clarify roles, expectations, and boundaries within the family system', 'Develop a shared understanding of the presenting mental health concern', 'Build a sustainable family support plan'],
        [{ label: 'Phase 1', duration: 'Sessions 1–3', title: 'Systemic Assessment', description: 'Family history, relationship dynamics, and presenting issue in context.' },
        { label: 'Phase 2', duration: 'Sessions 4–7', title: 'Skill Development', description: 'Communication tools, conflict de-escalation, and psychoeducation.' },
        { label: 'Phase 3', duration: 'Sessions 8–11', title: 'Structural Change', description: 'Role clarity, boundary work, and new behavioral patterns.' },
        { label: 'Phase 4', duration: 'Sessions 12–14', title: 'Consolidation', description: 'Maintenance plan, follow-up schedule, and crisis contacts.' }])
    case 'Sleep Improvement':
      return base('Individual Therapy',
        'Client presents with chronic insomnia, irregular sleep patterns, and daytime fatigue affecting work and relationships.',
        ['Establish consistent sleep and wake schedule within 3 weeks', 'Reduce sleep-disruptive behaviors and pre-sleep anxiety', 'Apply CBT-I techniques to break the insomnia cycle', 'Achieve 7–8 hours of restorative sleep consistently'],
        [{ label: 'Phase 1', duration: 'Weeks 1–2', title: 'Sleep Audit & Education', description: 'Sleep diary, CBT-I principles, and sleep hygiene assessment.' },
        { label: 'Phase 2', duration: 'Weeks 3–5', title: 'Sleep Restriction & Control', description: 'Stimulus control, sleep restriction therapy, relaxation techniques.' },
        { label: 'Phase 3', duration: 'Weeks 6–8', title: 'Cognitive Work', description: 'Addressing hyperarousal, sleep-related worry, and unhelpful beliefs.' },
        { label: 'Phase 4', duration: 'Weeks 9–10', title: 'Consolidation', description: 'Fading sleep restriction, maintenance habits, relapse prevention.' }])
    default: // General Therapy
      return createInitialSections()
  }
}

export { createTemplate }

// ─── Main Studio ──────────────────────────────────────────────────────────────
function TreatmentPlanStudio({ onClose, onSendToClient }) {
  const [sections, setSections] = useState(createInitialSections)
  const [saveStatus, setSaveStatus] = useState('saved')
  const [activeSection, setActiveSection] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [autoDownload, setAutoDownload] = useState(false)
  const sectionRefs = useRef({})
  const docColRef = useRef(null)
  const saveTimer = useRef(null)

  // "Download PDF" without opening preview: open preview modal flagged to auto-download
  const handleDirectDownload = useCallback(() => {
    setAutoDownload(true)
    setShowPreview(true)
  }, [])

  useEffect(() => {
    setSaveStatus('saving')
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => setSaveStatus('saved'), 1100)
    return () => clearTimeout(saveTimer.current)
  }, [sections])

  const handleDocScroll = useCallback(() => {
    const container = docColRef.current
    if (!container) return
    const scrollTop = container.scrollTop + 90
    let current = null
    for (const section of sections) {
      const el = sectionRefs.current[section.id]
      if (el && el.offsetTop <= scrollTop) current = section.id
    }
    if (current) setActiveSection(current)
  }, [sections])

  const scrollToSection = useCallback((id) => {
    const el = sectionRefs.current[id]
    const container = docColRef.current
    if (el && container) container.scrollTo({ top: el.offsetTop - 16, behavior: 'smooth' })
    setActiveSection(id)
  }, [])

  const updateSection = useCallback((id, field, value) => setSections(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s)), [])
  const moveSection = useCallback((id, dir) => setSections(prev => {
    const idx = prev.findIndex(s => s.id === id), t = idx + dir
    if (t < 0 || t >= prev.length) return prev
    const a = [...prev];[a[idx], a[t]] = [a[t], a[idx]]; return a
  }), [])
  const deleteSection = useCallback((id) => setSections(prev => prev.filter(s => s.id !== id)), [])
  const duplicateSection = useCallback((id) => setSections(prev => {
    const idx = prev.findIndex(s => s.id === id), orig = prev[idx]
    const copy = { ...orig, id: `${orig.type}_${Date.now()}`, title: `${orig.title} (Copy)` }
    const a = [...prev]; a.splice(idx + 1, 0, copy); return a
  }), [])
  const addSection = useCallback((template) => setSections(prev => [...prev, { ...template, id: `${template.type}_${Date.now()}` }]), [])
  const applyTemplate = useCallback((templateName) => {
    if (window.confirm(`Replace the current document with the "${templateName}" template? This cannot be undone.`)) {
      setSections(createTemplate(templateName))
    }
  }, [])

  // Pull live client name and provider from sections for compact meta
  const ciSection = sections.find(s => s.type === 'client_info')
  const getField = (label) => ciSection?.data?.fields?.find(f => f.label === label)?.value || '—'

  return (
    <div className="tps-studio">
      {/* ── Preview modal ─────────────────────────────────────── */}
      {showPreview && (
        <TplanPreviewModal
          sections={sections}
          autoDownload={autoDownload}
          onClose={() => { setShowPreview(false); setAutoDownload(false) }}
        />
      )}

      {/* ── Compact Top Bar ───────────────────────────────────── */}
      <div className="tps-studio-topbar">
        <div className="tps-studio-topbar-left">
          <div className="tps-studio-meta">
            <div className="tps-studio-meta-title">
              <FileText size={14} className="tps-studio-meta-icon" />
              <span>Treatment Plan</span>
              <span className="tps-studio-meta-tag">Draft</span>
            </div>
            <div className="tps-studio-meta-row">
              <span>{getField('Client Name')}</span>
              <span className="tps-meta-sep">·</span>
              <span>{getField('Provider')}</span>
              <span className="tps-meta-sep">·</span>
              <span className="tps-save-indicator">
                {saveStatus === 'saving'
                  ? <><Loader2 size={11} className="tps-saving-spin" /> Saving…</>
                  : <><Check size={11} /> Saved</>}
              </span>
            </div>
          </div>
        </div>
        <div className="tps-studio-topbar-actions">
          <button className="tps-btn tps-btn--secondary" onClick={() => setShowPreview(true)}><Eye size={13} /> Preview</button>
          <button className="tps-btn tps-btn--secondary" onClick={handleDirectDownload}>
            <Download size={13} /> Download PDF
          </button>
          <button className="tps-btn tps-btn--secondary" onClick={() => onSendToClient?.()}><Send size={13} /> Send to Client</button>
          <button className="tps-topbar-close" onClick={onClose} aria-label="Close"><X size={15} /></button>
        </div>
      </div>

      {/* ── Body: 2 columns ───────────────────────────────────── */}
      <div className="tps-studio-body">
        <div className="tps-doc-col" ref={docColRef} onScroll={handleDocScroll}>
          <TplanDocEditor
            sections={sections}
            onUpdate={updateSection}
            onMove={moveSection}
            onDelete={deleteSection}
            onDuplicate={duplicateSection}
            sectionRefs={sectionRefs}
          />
        </div>
        <div className="tps-tool-col">
          <TplanToolbox
            sections={sections}
            activeSection={activeSection}
            onAddSection={addSection}
            onScrollTo={scrollToSection}
            onApplyTemplate={applyTemplate}
          />
        </div>
      </div>
    </div>
  )
}

export default TreatmentPlanStudio

import React, { useState, useEffect, useRef } from 'react'
import {
  MessageSquare,
  Calendar,
  Video,
  MoreVertical,
  Search,
  Paperclip,
  Send,
  Home,
  Users,
  CreditCard,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Check,
  AlertCircle,
  CalendarRange,
  Clock,
  VideoOff,
  Mic,
  MicOff,
  Sun,
  Moon,
  Menu,
  Settings,
  LogOut,
  Command,
  Star,
  Award,
  MapPin,
  Sparkles,
  Brain,
  Loader2,
  FileText,
  Download,
  Eye,
} from 'lucide-react'
import AISummary from './AISummary'
import RecommendedActions from './RecommendedActions'
import TreatmentPlanModal from './TreatmentPlanModal'
import TreatmentPlanStudio from './TreatmentPlanStudio'
import TplanPreviewModal from './TplanPreviewModal'
import Automations from './Automations'
import './App.css'

const LockIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ca-lock-svg" aria-label="Locked" role="img">
    <title>Locked</title>
    <defs>
      <linearGradient id="ca-lock-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
    </defs>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="url(#ca-lock-grad)" fill="none" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="url(#ca-lock-grad)" fill="none" />
  </svg>
)

function App() {
  // Theme state
  const [darkTheme, setDarkTheme] = useState(false)

  // Sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Active navigation tab
  const [activeNav, setActiveNav] = useState('Messages')

  // Chat tab: 'active' | 'inactive'
  const [chatTab, setChatTab] = useState('active')

  // Search filter
  const [searchQuery, setSearchQuery] = useState('')

  // Selected chat ID
  const [selectedChatId, setSelectedChatId] = useState(1)

  // Command palette state
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false)
  const [cmdSearch, setCmdSearch] = useState('')

  // Modal states
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [selectedAppt, setSelectedAppt] = useState(null) // for viewing appointment card details
  const [videoCallOpen, setVideoCallOpen] = useState(false)
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [copilotTab, setCopilotTab] = useState('ai-summary')  // 'ai-summary' | 'automations' | 'ask-ai' | 'treatment-plans'
  const [isPremium, setIsPremium] = useState(true) // Premium toggle state
  const [upsellModalOpen, setUpsellModalOpen] = useState(false) // Premium upsell modal state
  const [pendingTab, setPendingTab] = useState(null) // Target tab clicked by Free user
  const [copilotLoading, setCopilotLoading] = useState(false)
  const [copilotMsgIndex, setCopilotMsgIndex] = useState(0)
  const [copilotQuery, setCopilotQuery] = useState('')
  const [copilotChat, setCopilotChat] = useState([])
  const [isCopilotThinking, setIsCopilotThinking] = useState(false)
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [successToast, setSuccessToast] = useState(null)
  const [treatmentPlanOpen, setTreatmentPlanOpen] = useState(false)
  const [sentPlanSections, setSentPlanSections] = useState(null)
  const [sentPlanPreviewOpen, setSentPlanPreviewOpen] = useState(false)

  // Send treatment plan to active chat — stores sections for PDF view
  const handleSendTreatmentPlan = (sections) => {
    const msg = {
      id: `tplan-${Date.now()}`,
      type: 'treatment-plan',
      sender: 'provider',
      timestamp: 'Sent just now',
    }
    setSentPlanSections(sections || null)
    setChats(prev => prev.map(c =>
      c.id === selectedChatId ? { ...c, history: [...c.history, msg] } : c
    ))
    setTreatmentPlanOpen(false)
    setActiveNav('Messages')
  }

  const copilotMessages = [
    "Understanding the client's journey...",
    "Reviewing recent progress...",
    "Identifying meaningful patterns...",
    "Preparing personalized recommendations...",
    "Generating clinical insights...",
    "Almost ready..."
  ]

  // Message Typing State
  const [typedMessage, setTypedMessage] = useState('')
  const [attachedFile, setAttachedFile] = useState(null)

  // File upload input ref
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Video call active state
  const [videoTimer, setVideoTimer] = useState(0)
  const [videoMuted, setVideoMuted] = useState(false)
  const [cameraOff, setCameraOff] = useState(false)
  const videoIntervalRef = useRef(null)

  // Initial Mock Database
  const [chats, setChats] = useState([
    {
      id: 1,
      name: 'Ketan',
      role: 'Therapy',
      avatarColor: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      status: 'online',
      subtitle: '0 sessions till Jul 4, 2026',
      tab: 'active',
      unreadCount: 0,
      history: [
        {
          id: 'welcome',
          type: 'welcome-banner',
          text: "I'm Ketan, a licensed therapist here to support you with confidential counseling. Please book a 1-1 session with me."
        },
        {
          id: 'appt-1',
          type: 'appointment-card',
          title: 'Ketan requested an appointment.',
          status: 'requested', // 'requested' | 'confirmed' | 'cancelled'
          date: '2026-06-28',
          time: '10:00 AM',
          sessionType: 'Therapy Session',
          price: '$120.00'
        },
        {
          id: 'appt-2',
          type: 'appointment-card',
          title: 'Hi Ketan — your appointment with Ketan is confirmed.',
          status: 'confirmed',
          date: '2026-06-28',
          time: '10:00 AM',
          sessionType: 'Therapy Session',
          price: '$120.00'
        },
        {
          id: 'appt-3',
          type: 'appointment-card',
          title: 'Hi Ketan — your appointment with Ketan is cancelled.',
          status: 'cancelled',
          date: '2026-06-28',
          time: '10:00 AM',
          sessionType: 'Therapy Session',
          price: '$120.00'
        },
        {
          id: 'appt-4',
          type: 'appointment-card',
          title: 'Ketan requested an appointment.',
          status: 'requested',
          date: '2026-07-02',
          time: '03:00 PM',
          sessionType: 'Therapy Session',
          price: '$120.00'
        },
        {
          id: 'appt-5',
          type: 'appointment-card',
          title: 'Hi Ketan — your appointment with Ketan is confirmed.',
          status: 'confirmed',
          date: '2026-07-02',
          time: '03:00 PM',
          sessionType: 'Therapy Session',
          price: '$120.00'
        },
        {
          id: 'msg-1',
          type: 'text',
          sender: 'provider',
          text: 'hi',
          timestamp: '24 Jun at 13:21'
        },
        {
          id: 'cta-ocd',
          type: 'consultation-cta',
          title: 'Consult an OCD Specialist',
          text: 'Hi, you may consider consulting an OCD Therapist for your condition'
        }
      ]
    },
    {
      id: 2,
      name: 'Sarah Connor',
      role: 'Consultation',
      avatarColor: 'linear-gradient(135deg, #10b981, #047857)',
      status: 'offline',
      subtitle: 'Last session: 1 week ago',
      tab: 'active',
      unreadCount: 0,
      history: [
        {
          id: 'sc-msg-1',
          type: 'text',
          sender: 'provider',
          text: "Let's catch up next week for our regular consultation. Let me know what time works best for you.",
          timestamp: 'Yesterday at 15:40'
        },
        {
          id: 'sc-msg-2',
          type: 'text',
          sender: 'user',
          text: 'Sounds great, Sarah. Wednesday afternoon works fine for me. Let me check my calendar.',
          timestamp: 'Yesterday at 16:15'
        }
      ]
    },
    {
      id: 3,
      name: 'James Smith',
      role: 'Therapy',
      avatarColor: 'linear-gradient(135deg, #f59e0b, #b45309)',
      status: 'offline',
      subtitle: 'Completed 12 sessions',
      tab: 'inactive',
      unreadCount: 0,
      history: [
        {
          id: 'js-msg-1',
          type: 'text',
          sender: 'provider',
          text: 'The strategies we discussed are working very well! I feel much more in control of my daily routines.',
          timestamp: '12 May 2026'
        },
        {
          id: 'js-msg-2',
          type: 'text',
          sender: 'user',
          text: "I'm so glad to hear that, James. You've made incredible progress over the last few months. Keep practicing!",
          timestamp: '12 May 2026'
        }
      ]
    },
    {
      id: 4,
      name: 'Emily Davis',
      role: 'Consultation',
      avatarColor: 'linear-gradient(135deg, #ec4899, #be185d)',
      status: 'offline',
      subtitle: 'No sessions scheduled',
      tab: 'inactive',
      unreadCount: 0,
      history: [
        {
          id: 'ed-msg-1',
          type: 'text',
          sender: 'provider',
          text: 'Can we schedule a call later? I have a few questions about my billing breakdown from last month.',
          timestamp: '08 Apr 2026'
        },
        {
          id: 'ed-msg-2',
          type: 'text',
          sender: 'user',
          text: 'Sure Emily! Feel free to request a slot using the calendar, and I will review your invoice.',
          timestamp: '08 Apr 2026'
        }
      ]
    }
  ])

  // Get currently selected chat data
  const currentChat = chats.find(c => c.id === selectedChatId) || chats[0]

  // Auto-scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentChat.history, selectedChatId])

  // Handle dark mode side-effect
  useEffect(() => {
    const rootClass = document.documentElement.classList
    if (darkTheme) {
      rootClass.add('dark-theme')
    } else {
      rootClass.remove('dark-theme')
    }
  }, [darkTheme])

  // Listener for command palette keyboard shortcut (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setCmdPaletteOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Timer logic for simulated video session
  useEffect(() => {
    if (videoCallOpen) {
      videoIntervalRef.current = setInterval(() => {
        setVideoTimer(prev => prev + 1)
      }, 1000)
    } else {
      clearInterval(videoIntervalRef.current)
      setVideoTimer(0)
    }
    return () => clearInterval(videoIntervalRef.current)
  }, [videoCallOpen])

  // Trigger AI Copilot loading message rotation
  useEffect(() => {
    if (copilotOpen) {
      setCopilotLoading(true)
      setCopilotMsgIndex(0)
      setCopilotTab('ai-summary')  // always start on AI Summary
      setCopilotChat([
        {
          id: 'welcome',
          sender: 'ai',
          text: `Hello. I've analyzed this client's records.\n\nAsk me anything about this client or use one of the suggested actions below.`,
          time: 'Just now',
        }
      ])

      const interval = setInterval(() => {
        setCopilotMsgIndex(prev => {
          if (prev < copilotMessages.length - 1) {
            return prev + 1
          } else {
            clearInterval(interval)
            setTimeout(() => {
              setCopilotLoading(false)
            }, 1000)
            return prev
          }
        })
      }, 1000)

      return () => {
        clearInterval(interval)
      }
    }
  }, [copilotOpen])

  const copilotEndRef = useRef(null)

  useEffect(() => {
    copilotEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [copilotChat, isCopilotThinking])

  // Format video duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Get active time stamp string
  const getCurrentTimestamp = () => {
    const now = new Date()
    const options = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }
    return now.toLocaleDateString('en-US', options).replace(',', ' at')
  }

  // Trigger Mock File Attachment
  const handleAttachmentClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAttachedFile({
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`
      })
    }
  }

  // Send a text message
  const handleSendMessage = (textToSend = typedMessage) => {
    if (!textToSend.trim() && !attachedFile) return

    const newMsg = {
      id: `msg-${Date.now()}`,
      type: 'text',
      sender: 'user',
      text: textToSend,
      timestamp: getCurrentTimestamp(),
      file: attachedFile ? { ...attachedFile } : null
    }

    // Append to current chat history
    setChats(prevChats => prevChats.map(c => {
      if (c.id === selectedChatId) {
        return {
          ...c,
          history: [...c.history, newMsg]
        }
      }
      return c
    }))

    // Reset inputs
    setTypedMessage('')
    setAttachedFile(null)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Helper to parse simple markdown to React components
  const renderMarkdown = (text) => {
    if (!text) return null
    const lines = text.split('\n')
    let insideTable = false
    let tableHeaders = []
    let tableRows = []
    let elements = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Table parsing
      if (line.startsWith('|')) {
        insideTable = true
        const cols = line.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1)

        // Skip separator line e.g. | :--- | :--- |
        if (line.includes(':---') || line.includes('---:')) {
          continue
        }

        if (tableHeaders.length === 0) {
          tableHeaders = cols
        } else {
          tableRows.push(cols)
        }
        continue
      } else if (insideTable) {
        // Table finished, push the table element
        elements.push(
          <div className="md-table-wrapper" key={`table-${i}`}>
            <table className="md-table">
              <thead>
                <tr>
                  {tableHeaders.map((h, hIdx) => <th key={hIdx}>{parseInlineStyles(h)}</th>)}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => <td key={cIdx}>{parseInlineStyles(cell)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
        insideTable = false
        tableHeaders = []
        tableRows = []
      }

      // Empty line
      if (line === '') {
        continue
      }

      // Blockquote
      if (line.startsWith('>')) {
        elements.push(<blockquote key={i} className="md-blockquote">{parseInlineStyles(line.slice(1).trim())}</blockquote>)
        continue
      }

      // Headers
      if (line.startsWith('###')) {
        elements.push(<h5 key={i} className="md-h5">{parseInlineStyles(line.slice(3).trim())}</h5>)
        continue
      }
      if (line.startsWith('##')) {
        elements.push(<h4 key={i} className="md-h4">{parseInlineStyles(line.slice(2).trim())}</h4>)
        continue
      }

      // Unordered list
      if (line.startsWith('*')) {
        elements.push(<li key={i} className="md-li">{parseInlineStyles(line.slice(1).trim())}</li>)
        continue
      }

      // Ordered list
      if (/^\d+\./.test(line)) {
        const cleanLine = line.replace(/^\d+\./, '').trim()
        elements.push(<li key={i} className="md-ol-li">{parseInlineStyles(cleanLine)}</li>)
        continue
      }

      // Regular paragraph
      elements.push(<p key={i} className="md-p">{parseInlineStyles(line)}</p>)
    }

    // In case table was at the end of the text
    if (insideTable && tableHeaders.length > 0) {
      elements.push(
        <div className="md-table-wrapper" key="table-end">
          <table className="md-table">
            <thead>
              <tr>
                {tableHeaders.map((h, hIdx) => <th key={hIdx}>{parseInlineStyles(h)}</th>)}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => <td key={cIdx}>{parseInlineStyles(cell)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    return elements
  }

  // Parse inline bold styles e.g. **bold**
  const parseInlineStyles = (str) => {
    const parts = str.split('**')
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return <strong key={idx}>{part}</strong>
      }
      return part
    })
  }

  // Stream AI reply word-by-word
  const streamAIResponse = (fullText, actions = null) => {
    setIsCopilotThinking(false)
    let currentText = ''
    const words = fullText.split(' ')
    let wordIndex = 0

    const streamMsgId = `stream-${Date.now()}`
    const initialMsg = { id: streamMsgId, sender: 'ai', text: '', time: 'Just now', actions }
    setCopilotChat(prev => [...prev, initialMsg])

    const interval = setInterval(() => {
      if (wordIndex < words.length) {
        currentText += (wordIndex === 0 ? '' : ' ') + words[wordIndex]
        setCopilotChat(prev => prev.map(m => {
          if (m.id === streamMsgId) {
            return { ...m, text: currentText }
          }
          return m
        }))
        wordIndex++
      } else {
        clearInterval(interval)
      }
    }, 30) // fast 30ms stream tick
  }

  // Action Center executor
  const handleExecuteAction = (action) => {
    const systemMsg = {
      id: `sys-${Date.now()}`,
      type: 'text',
      sender: 'system',
      text: `📋 Action Completed: Sent "${action.title}" to ${currentChat.name}'s feed.`,
      timestamp: getCurrentTimestamp()
    }

    setChats(prevChats => prevChats.map(c => {
      if (c.id === selectedChatId) {
        return {
          ...c,
          history: [...c.history, systemMsg]
        }
      }
      return c
    }))

    setSuccessToast(`✓ ${action.title} sent successfully.`)
    setTimeout(() => {
      setSuccessToast(null)
    }, 2500)

    setConfirmAction(null)

    setIsCopilotThinking(true)
    setTimeout(() => {
      const followUpText = `I've sent the ${action.title} to the client. I'll also monitor the results and notify you if any significant changes are detected.`
      streamAIResponse(followUpText)
    }, 1200)
  }

  // Clinical Recommendation click event
  const handleSendRecommendation = (type, title) => {
    const systemMsg = {
      id: `sys-${Date.now()}`,
      type: 'text',
      sender: 'system',
      text: `📋 Copilot Action: Sent recommendation for "${title}" to ${currentChat.name}`,
      timestamp: getCurrentTimestamp()
    }

    setChats(prevChats => prevChats.map(c => {
      if (c.id === selectedChatId) {
        return {
          ...c,
          history: [...c.history, systemMsg]
        }
      }
      return c
    }))

    alert(`Success: The "${title}" has been sent directly to ${currentChat.name}'s chat.`)
    setCopilotOpen(false) // close modal after action
  }

  // Handle Copilot Chat Submit
  const handleCopilotChatSubmit = (text) => {
    if (!text.trim()) return

    // Add user message
    const userMsg = { sender: 'user', text, time: 'Just now' }
    setCopilotChat(prev => [...prev, userMsg])
    setCopilotQuery('')
    setIsCopilotThinking(true)

    setTimeout(() => {
      let reply = `Based on my review of ${currentChat.name}'s therapy logs, they have shown consistent compliance with assignments. No cognitive warning flags have been detected, and they are progressing well in clinical sessions.`
      let actions = null

      const textLower = text.toLowerCase()
      if (textLower.includes('why is "yoga') || textLower.includes('why is yoga')) {
        reply = `### Rationale for Yoga Recommendation\n\nYoga practice acts as a **somatic regulator** to lower heart-rate variability (HRV) and induce sleep readiness.\n\n* **Primary Indicator:** Client reported somatic OCD tightness.\n* **Secondary Indicator:** Decline in sleep scores over the mid-week period.\n* **Clinical Outcome:** Mitigates avoidance behaviors caused by somatic panic.`
        actions = [
          { id: `act-${Date.now()}-yoga`, icon: '🧘', title: 'Yoga Program', reason: 'AI believes yoga may help reduce anxiety and improve sleep quality.', confidence: 'High', actionText: 'Recommend to Client', type: 'yoga' }
        ]
      } else if (textLower.includes('why is "ocd') || textLower.includes('why is ocd')) {
        reply = `### Assessment Rationale: OCD Assessment\n\nThe client's recent text entries indicate shift patterns from standard contamination anxieties to checking rituals.\n\n> **Clinician Note:** Verifying ritual shifts is critical before adjusting exposure hierarchy layers to prevent regression.\n\n* **Reason:** Verifying shift vectors is necessary to modify active exposure therapy hierarchy.\n* **Clinical Standard:** Diagnostic verification prevents exposure regression.`
        actions = [
          { id: `act-${Date.now()}-ocd`, icon: '📋', title: 'OCD Assessment', reason: "Recommended because the client's responses indicate changing symptom severity.", confidence: 'High', actionText: 'Send Assessment', type: 'ocd' }
        ]
      } else if (textLower.includes('why is "anxiety') || textLower.includes('why is anxiety')) {
        reply = `### Assessment Rationale: GAD-7 Anxiety Assessment\n\nRecommended to measure generalized anxiety spike thresholds before today's work-stress hierarchy exposure mapping.\n\n* **Reason:** Pre-session GAD ratings map active somatic load baseline.`
        actions = [
          { id: `act-${Date.now()}-anxiety`, icon: '🧠', title: 'Anxiety Assessment', reason: 'Suggested before the next therapy session.', confidence: 'Med', actionText: 'Send', type: 'anxiety' }
        ]
      } else if (textLower.includes('why is "psych') || textLower.includes('why is psych')) {
        reply = `### Consultation Rationale: Psychiatry Referral\n\nSuggested if OCD ritual checking continues to disrupt sleep cycles after 2 weeks of exposures.\n\n* **Reason:** Ensures medication compatibility evaluations run concurrently with CBT.`
        actions = [
          { id: `act-${Date.now()}-psych`, icon: '👨‍⚕️', title: 'Psychiatry Consultation', reason: 'Medication review may be beneficial.', confidence: 'Med', actionText: 'Recommend', type: 'psych' }
        ]
      } else if (textLower.includes('explain the insight: "progress') || textLower.includes('progress improving')) {
        reply = `### Progress Evaluation Rationale\n\nCompliance records show the client completed **78% of exposure logs** this week compared to only 60% during week 2, indicating stable compliance improvements.`
      } else if (textLower.includes('explain the insight: "anxiety') || textLower.includes('anxiety elevation')) {
        reply = `### Anxiety Spike Triggers\n\nClient conversation notes include sentences such as *"worrying about contamination spikes on the train commute"*, showing active transportation triggers.\n\n\`\`\`\nTrigger: Public Transit Commute\nContext: Contamination Anxiety Spike\nFrequency: 3x/week\n\`\`\``
      } else if (textLower.includes('explain the insight: "sleep') || textLower.includes('sleep consistency')) {
        reply = `### Sleep Quality Improvement Analysis\n\nAverage sleep metrics rose from 5.4 hours to 6.8 hours over 7 days. Standard sleep consistency indicators indicate fewer mid-night wakes.`
      } else if (textLower.includes('explain the insight: "next session') || textLower.includes('next session target')) {
        reply = `### Recommended Next Session Focus\n\nERP exposure drills should focus on travel avoidances. Practice riding transit exposure items during session simulations.`
      } else if (textLower.includes('soap')) {
        reply = `Here is the drafted SOAP note outline:\n\n| Section | Findings & Target Details |\n| :--- | :--- |\n| **S (Subjective)** | Client reports anxiety triggers before work-related situations. |\n| **O (Objective)** | Homework compliance has improved; active dialogue participant. |\n| **A (Assessment)** | Stable progress since previous assessment; mild avoidance observed. |\n| **P (Plan)** | Target anxiety triggers in the upcoming therapy session. |\n\n**Next Action Steps:**\n* Practice ERP hierarchy step 3.\n* Log 3 mood entries before Tuesday.`
        actions = [
          { id: `act-${Date.now()}-anxiety`, icon: '🧠', title: 'Anxiety Assessment', reason: 'Suggested before the next therapy session.', confidence: 'Med', actionText: 'Send', type: 'anxiety' }
        ]
      } else if (textLower.includes('session')) {
        reply = `Here is a structured CBT/mindfulness-focused session plan:\n\n1. **Homework Check-in (10 min):**\n   * Review the client's exposure homework tasks.\n   * Address contamination/avoidance triggers reported.\n2. **Active Exercise (15 min):**\n   * Complete a guided mindfulness deep breathing exercise.\n   * Focus on somatic calm triggers.\n3. **Exposure Hierarchy Development (20 min):**\n   * Map out exposure steps related to work stress.\n   * Set homework for next week.`
        actions = [
          { id: `act-${Date.now()}-homework`, icon: '📖', title: 'Homework Activity', reason: "Assign today's CBT worksheet.", confidence: 'High', actionText: 'Assign', type: 'homework' }
        ]
      } else if (textLower.includes('follow-up')) {
        reply = `**Drafted Follow-up Message:**\n\n> "Hi ${currentChat.name}, fantastic effort in today's session. Don't forget to practice your 10-minute mindfulness breathing exercise before sleep this week. Looking forward to our next talk!"`
        actions = [
          { id: `act-${Date.now()}-followup`, icon: '💬', title: 'Follow-up Message', reason: 'Draft and send an encouraging message.', confidence: 'High', actionText: 'Send', hasPreview: true, previewText: `"Hi ${currentChat.name}, fantastic effort in today's session. Don't forget to practice your 10-minute mindfulness breathing exercise before sleep this week. Looking forward to our next talk!"`, type: 'followup' }
        ]
      } else if (textLower.includes('progress') || textLower.includes('explain') || textLower.includes('summarize')) {
        reply = `### Progress Report for ${currentChat.name}\n\n* **Compliance Rate:** Risen from 60% to 80% over 3 weeks.\n* **Symptom Reduction:** 15% reduction in daily self-reported avoidance frequency.\n* **Assessment Data:** Shows stable scores with steady improvement since client intake.`
        actions = [
          { id: `act-${Date.now()}-homework`, icon: '📖', title: 'Homework Activity', reason: "Assign today's CBT worksheet.", confidence: 'High', actionText: 'Assign', type: 'homework' },
          { id: `act-${Date.now()}-psych`, icon: '👨‍⚕️', title: 'Psychiatry Consultation', reason: 'Medication review may be beneficial.', confidence: 'Med', actionText: 'Recommend', type: 'psych' }
        ]
      } else if (textLower.includes('conversation')) {
        reply = `### Key AI Conversation Highlights\n\n* **Topic 1:** Expressed significant work stress causing avoidance behaviors.\n* **Topic 2:** Shared positive reactions to breathing and grounding guides.\n* **Topic 3:** Indicated slight sleep disruptions during mid-week spikes.`
      } else if (textLower.includes('risk') || textLower.includes('predict')) {
        reply = `### Predictive Risk Analysis\n\n* **Overall Risk Profile:** **LOW**\n* **Trigger Points:** Heavy workload or sudden schedule shifts.\n* **Suggested Prevention:** Send a supportive text mid-week to reinforce exposure tasks.`
      }

      streamAIResponse(reply, actions)
    }, 800)
  }

  const handleCopilotQuickAction = (prompt) => {
    handleCopilotChatSubmit(prompt)
  }

  // Action: Create dynamic appointment booking from form
  const handleCreateAppointment = (formData) => {
    const newApptCard = {
      id: `appt-${Date.now()}`,
      type: 'appointment-card',
      title: `${currentChat.name} requested an appointment.`,
      status: 'requested',
      date: formData.date,
      time: formData.time,
      sessionType: formData.sessionType,
      price: '$120.00'
    }

    setChats(prevChats => prevChats.map(c => {
      if (c.id === selectedChatId) {
        return {
          ...c,
          history: [...c.history, newApptCard]
        }
      }
      return c
    }))

    setBookingModalOpen(false)
  }

  // Action: Modify appointment status (Confirm or Cancel)
  const handleUpdateApptStatus = (apptId, newStatus) => {
    setChats(prevChats => prevChats.map(c => {
      if (c.id === selectedChatId) {
        const updatedHistory = c.history.map(item => {
          if (item.id === apptId) {
            let newTitle = item.title
            if (newStatus === 'confirmed') {
              newTitle = `Hi ${currentChat.name} — your appointment with ${currentChat.name} is confirmed.`
            } else if (newStatus === 'cancelled') {
              newTitle = `Hi ${currentChat.name} — your appointment with ${currentChat.name} is cancelled.`
            }
            return {
              ...item,
              status: newStatus,
              title: newTitle
            }
          }
          return item
        })
        return {
          ...c,
          history: updatedHistory
        }
      }
      return c
    }))

    // Update viewing modal state if open
    if (selectedAppt && selectedAppt.id === apptId) {
      setSelectedAppt(prev => ({
        ...prev,
        status: newStatus,
        title: newStatus === 'confirmed'
          ? `Hi ${currentChat.name} — your appointment with ${currentChat.name} is confirmed.`
          : `Hi ${currentChat.name} — your appointment with ${currentChat.name} is cancelled.`
      }))
    }
  }

  // Action: Start Mock Video Call
  const startVideoCall = () => {
    setVideoCallOpen(true)
  }

  // Action: End Video Call
  const endVideoCall = () => {
    // Append a completion status log message inside chat history
    const callDurationText = formatDuration(videoTimer)
    const callSummaryMsg = {
      id: `sys-${Date.now()}`,
      type: 'text',
      sender: 'system',
      text: `🎥 Video session completed. Duration: ${callDurationText}.`,
      timestamp: getCurrentTimestamp(),
      isSystemMessage: true
    }

    setChats(prevChats => prevChats.map(c => {
      if (c.id === selectedChatId) {
        return {
          ...c,
          history: [...c.history, callSummaryMsg]
        }
      }
      return c
    }))

    setVideoCallOpen(false)
  }

  // Filter conversations
  const filteredChats = chats.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = c.tab === chatTab
    return matchesSearch && matchesTab
  })

  // Command Palette execution
  const executeCommand = (cmd) => {
    setCmdPaletteOpen(false)
    setCmdSearch('')
    if (cmd === 'theme') {
      setDarkTheme(!darkTheme)
    } else if (cmd === 'profile') {
      setProfileModalOpen(true)
    } else if (cmd === 'book') {
      setBookingModalOpen(true)
    } else if (cmd === 'video') {
      startVideoCall()
    } else if (cmd === 'clear') {
      // Clear current chat logs except welcome
      setChats(prevChats => prevChats.map(c => {
        if (c.id === selectedChatId) {
          const welcome = c.history.find(h => h.id === 'welcome')
          return {
            ...c,
            history: welcome ? [welcome] : []
          }
        }
        return c
      }))
    } else if (cmd === 'copilot') {
      setCopilotOpen(true)
    }
  }

  // Navigation Options
  const navOptions = [
    { name: 'Home', icon: Home },
    { name: 'Clients', icon: Users },
    { name: 'Billing', icon: CreditCard },
    { name: 'Messages', icon: MessageSquare },
    { name: 'Appointments', icon: CalendarRange },
    { name: 'For Mantra Provider', icon: Sparkles, hasDropdown: true },
    { name: 'Refer and Earn', icon: Star },
    { name: 'Settings', icon: Settings }
  ]

  return (
    <div className={`app-container ${darkTheme ? 'dark-theme' : ''}`}>
      {/* MOBILE TOP NAVIGATION BAR */}
      <div className="mobile-nav-bar">
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          aria-label="Open Sidebar"
        >
          <Menu size={20} />
        </button>
        <img src="/mantra_logo.png" alt="Mantra" className="mobile-brand-logo" />
        <button
          className="theme-toggle-btn"
          onClick={() => setDarkTheme(!darkTheme)}
          aria-label="Toggle Theme"
        >
          {darkTheme ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* MOBILE BACKDROP FOR DRAWER */}
      {mobileSidebarOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 9 }}
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <img src="/mantra_logo.png" alt="Mantra" className="sidebar-brand-logo" />
          </div>

          {/* Desktop Sidebar Collapse Toggle */}
          <button
            className="collapse-toggle-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navOptions.map((opt) => {
            const Icon = opt.icon
            return (
              <button
                key={opt.name}
                className={`nav-item ${activeNav === opt.name ? 'active' : ''}`}
                onClick={() => {
                  setActiveNav(opt.name)
                  setMobileSidebarOpen(false)
                }}
              >
                <Icon className="nav-icon" />
                <span className="nav-label">{opt.name}</span>
                {opt.hasDropdown && !sidebarCollapsed && (
                  <ChevronDown size={14} style={{ marginLeft: 'auto', opacity: 0.7 }} />
                )}
              </button>
            )
          })}
        </nav>

        {/* Sidebar Footer User Card */}
        <div className="sidebar-footer">
          <div className="user-profile" onClick={() => setProfileModalOpen(true)}>
            <div className="avatar-wrapper">
              <div className="avatar">
                {currentChat.name.substring(0, 1)}
              </div>
              <div className="status-indicator" />
            </div>
            <div className="user-info">
              <span className="user-name">{currentChat.name}</span>
              <span className="user-role">{currentChat.role} Provider</span>
            </div>
          </div>

          {/* Quick theme toggle inside footer */}
          {!sidebarCollapsed && (
            <button
              className="action-icon-btn"
              style={{ marginLeft: 'auto', padding: 6 }}
              onClick={(e) => {
                e.stopPropagation()
                setDarkTheme(!darkTheme)
              }}
              title="Toggle Light/Dark Theme"
            >
              {darkTheme ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}
        </div>
      </aside>

      {/* CHAT LIST PANEL */}
      <section className="chat-panel">
        <div className="chat-panel-header">
          <div className="chat-title-row">
            <MessageSquare size={20} className="chat-title-icon" />
            <h2>Chats</h2>
          </div>

          <div className="search-wrapper">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="search-shortcut" onClick={() => setCmdPaletteOpen(true)} style={{ cursor: 'pointer' }}>
              <Command size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />K
            </span>
          </div>
        </div>

        {/* Sliding Pill Tab Selectors */}
        <div className="tabs-container">
          <button
            className={`tab-btn ${chatTab === 'active' ? 'active' : ''}`}
            onClick={() => setChatTab('active')}
          >
            Active
          </button>
          <button
            className={`tab-btn ${chatTab === 'inactive' ? 'active' : ''}`}
            onClick={() => setChatTab('inactive')}
          >
            Inactive
          </button>
          <div className={`tab-slider ${chatTab === 'inactive' ? 'inactive' : ''}`} />
        </div>

        {/* Scrollable list */}
        <div className="chats-scroll-list">
          {filteredChats.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem', marginTop: 32 }}>
              No conversations found
            </div>
          ) : (
            filteredChats.map((chat) => {
              // Find latest message for preview
              const textHistory = chat.history.filter(h => h.type === 'text')
              const latestMsg = textHistory[textHistory.length - 1]
              const previewText = latestMsg ? latestMsg.text : 'No messages yet'
              const previewTime = latestMsg ? latestMsg.timestamp.split(' at ')[0] : '24/6/2026'

              return (
                <button
                  key={chat.id}
                  className={`chat-item ${selectedChatId === chat.id ? 'active' : ''}`}
                  onClick={() => setSelectedChatId(chat.id)}
                >
                  <div className="avatar-wrapper">
                    <div className="avatar" style={{ background: chat.avatarColor, color: '#fff', border: 'none' }}>
                      {chat.name.substring(0, 1)}
                    </div>
                    {chat.status === 'online' && <div className="status-indicator" />}
                  </div>
                  <div className="chat-item-content">
                    <div className="chat-item-header">
                      <span className="chat-item-name">{chat.name}</span>
                      <span className="chat-item-meta">{previewTime}</span>
                    </div>
                    <span className="chat-item-preview">{previewText}</span>
                  </div>
                  {chat.unreadCount > 0 && (
                    <span className="unread-badge">{chat.unreadCount}</span>
                  )}
                </button>
              )
            })
          )}
        </div>
      </section>

      {/* MAIN CONVERSATION PANEL */}
      <section className="conversation-container">
        {/* Provider Profile Header */}
        <header className="conversation-header">
          <div className="header-profile-section">
            <div className="avatar-wrapper">
              <div className="avatar" style={{ background: currentChat.avatarColor, color: '#fff', border: 'none' }}>
                {currentChat.name.substring(0, 1)}
              </div>
              {currentChat.status === 'online' && <div className="status-indicator" />}
            </div>
            <div className="header-profile-info">
              <div className="header-name-row">
                <span className="header-name">{currentChat.name}</span>
                <button className="view-profile-link" onClick={() => setProfileModalOpen(true)}>
                  View Profile
                </button>
              </div>
              <span className="header-sessions">{currentChat.subtitle}</span>
            </div>
          </div>

          <div className="header-actions-section">
            {/* AI Copilot Primary Action Button */}
            <button
              className="copilot-action-btn"
              onClick={() => setCopilotOpen(true)}
              title="Open AI Copilot Helper"
            >
              <Brain size={16} className="copilot-btn-icon" />
              <span>AI Copilot</span>
            </button>

            <button
              className="action-icon-btn accent"
              onClick={() => setBookingModalOpen(true)}
              title="Schedule Appointment"
            >
              <Calendar size={18} />
            </button>
            <button
              className="action-icon-btn accent"
              onClick={startVideoCall}
              title="Start Video Session"
            >
              <Video size={18} />
            </button>
            <button className="action-icon-btn" title="More options">
              <MoreVertical size={18} />
            </button>
          </div>
        </header>

        {/* Scrollable Conversation area */}
        <div className="messages-scroll-area">
          {currentChat.history.map((item, index) => {
            if (item.type === 'welcome-banner') {
              return (
                <div key={item.id || index} className="welcome-system-banner">
                  <p className="welcome-banner-text">{item.text}</p>
                  <button className="welcome-banner-btn" onClick={() => setBookingModalOpen(true)}>
                    Book Now
                  </button>
                </div>
              )
            }

            if (item.type === 'appointment-card') {
              let statusBadgeClass = 'primary'
              if (item.status === 'confirmed') statusBadgeClass = 'success'
              if (item.status === 'cancelled') statusBadgeClass = 'danger'

              return (
                <div key={item.id} className={`cta-card ${item.status}`}>
                  <div className="cta-card-header">
                    <span className="cta-card-title">{item.title}</span>
                    <span className={`cta-badge ${statusBadgeClass}`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="appt-details-grid">
                    <div className="appt-grid-item">
                      <span className="appt-grid-label">Date</span>
                      <span className="appt-grid-value">{item.date}</span>
                    </div>
                    <div className="appt-grid-item">
                      <span className="appt-grid-label">Time Slot</span>
                      <span className="appt-grid-value">{item.time}</span>
                    </div>
                  </div>
                  <div className="cta-card-actions">
                    <button className="cta-btn secondary" onClick={() => setSelectedAppt(item)}>
                      View details
                    </button>
                    {item.status === 'requested' && (
                      <>
                        <button
                          className="cta-btn primary"
                          onClick={() => handleUpdateApptStatus(item.id, 'confirmed')}
                        >
                          Confirm
                        </button>
                        <button
                          className="cta-btn secondary"
                          style={{ color: 'var(--danger-color)' }}
                          onClick={() => handleUpdateApptStatus(item.id, 'cancelled')}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            }

            if (item.type === 'consultation-cta') {
              return (
                <div key={item.id || index} className="cta-card warning" style={{ margin: '16px auto', width: '90%' }}>
                  <div className="cta-card-header">
                    <span className="cta-card-title">{item.title}</span>
                    <span className="cta-badge warning">SUGGESTION</span>
                  </div>
                  <p className="cta-card-desc">{item.text}</p>
                  <div className="cta-card-actions">
                    <button
                      className="cta-btn primary"
                      onClick={() => handleSendMessage("Let's consult an OCD specialist. I would like to set up a consultation.")}
                    >
                      Consult an OCD Therapist
                    </button>
                  </div>
                </div>
              )
            }

            if (item.type === 'text') {
              // Custom text message bubbles
              if (item.isSystemMessage) {
                return (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'center', margin: '8px 0', flexShrink: 0 }}>
                    <div style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      <Clock size={12} />
                      {item.text}
                    </div>
                  </div>
                )
              }

              const isUser = item.sender === 'user'
              return (
                <div key={item.id} className={`message-row ${isUser ? 'sent' : 'received'}`}>
                  <div className="message-bubble">
                    {item.text && <p>{item.text}</p>}

                    {/* Render attachment UI if present */}
                    {item.file && (
                      <div style={{
                        marginTop: 6,
                        padding: 8,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isUser ? 'rgba(255, 255, 255, 0.15)' : 'var(--bg-secondary)',
                        border: '1px solid ' + (isUser ? 'rgba(255, 255, 255, 0.2)' : 'var(--border-color)'),
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: '0.8rem',
                        maxWidth: '220px'
                      }}>
                        <Paperclip size={14} />
                        <span style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontWeight: 500
                        }}>
                          {item.file.name}
                        </span>
                        <span style={{ opacity: 0.7, fontSize: '0.7rem' }}>{item.file.size}</span>
                      </div>
                    )}
                  </div>
                  <span className="message-meta">{item.timestamp}</span>
                </div>
              )
            }

            if (item.type === 'treatment-plan') {
              return (
                <div key={item.id} className="message-row sent" style={{ alignItems: 'flex-end' }}>
                  <div className="tplan-chat-card">

                    {/* Header */}
                    <div className="tplan-chat-card-hd">
                      <div className="tplan-chat-card-icon-wrap">
                        <FileText size={16} />
                      </div>
                      <div className="tplan-chat-card-title">Your Personalized Plan is Ready</div>
                    </div>

                    {/* Body */}
                    <p className="tplan-chat-card-body">
                      Your provider has prepared a personalized plan based on your recent consultation.
                    </p>
                    <div className="tplan-chat-card-list">
                      <div className="tplan-chat-card-list-item">📝 Personalized recommendations</div>
                      <div className="tplan-chat-card-list-item">🎯 Clear next steps</div>
                      <div className="tplan-chat-card-list-item">📅 Guidance for your upcoming journey</div>
                      <div className="tplan-chat-card-list-item">📌 A document you can refer to anytime</div>
                    </div>
                    <p className="tplan-chat-card-note">Take a few minutes to review it at your convenience.</p>

                    {/* CTA */}
                    <button
                      type="button"
                      className="tplan-chat-card-cta"
                      onClick={() => setSentPlanPreviewOpen(true)}
                    >
                      View Plan
                    </button>

                    {/* PDF attachment badge */}
                    <div className="tplan-chat-card-pdf">
                      <FileText size={12} />
                      <span className="tplan-chat-card-pdf-name">TreatmentPlan.pdf</span>
                    </div>

                    {/* Footer */}
                    <div className="tplan-chat-card-footer">
                      Prepared by your provider&nbsp;•&nbsp;{item.timestamp}
                    </div>

                  </div>
                </div>
              )
            }

            return null
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* BOTTOM MESSAGE INPUT BAR */}
        <footer className="message-input-area">
          <div className="input-card">

            {/* Attachment Toast */}
            {attachedFile && (
              <div className="attachment-toast">
                <Paperclip size={12} className="text-accent" />
                <span style={{ fontWeight: 500 }}>{attachedFile.name}</span>
                <span>({attachedFile.size})</span>
                <button className="toast-close-btn" onClick={() => setAttachedFile(null)}>
                  <X size={12} />
                </button>
              </div>
            )}

            {/* Attach Icon Trigger */}
            <button className="attachment-trigger" onClick={handleAttachmentClick} title="Attach file">
              <Paperclip size={18} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {/* Message input field */}
            <input
              type="text"
              placeholder="Type your message..."
              className="text-input-field"
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              onKeyDown={handleKeyPress}
            />

            {/* Send trigger */}
            <button
              className="send-trigger"
              onClick={() => handleSendMessage()}
              disabled={!typedMessage.trim() && !attachedFile}
              title="Send Message"
            >
              <Send size={16} />
            </button>
          </div>
        </footer>
      </section>

      {/* 1. MOCK VIDEO CALL FULL-SCREEN SIMULATION */}
      {videoCallOpen && (
        <div className="modal-overlay" style={{ zIndex: 200 }}>
          <div className="modal-content video-modal-content">
            <header className="modal-header video-modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'red', display: 'inline-block' }} />
                Live Video Session with {currentChat.name}
              </h3>
              <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                Duration: {formatDuration(videoTimer)}
              </span>
            </header>

            <div className="video-grid">

              {/* Left Column: Therapist Feed */}
              <div className="video-feed">
                {!cameraOff ? (
                  <div className="video-avatar-large video-avatar-pulse">
                    {currentChat.name.substring(0, 1)}
                  </div>
                ) : (
                  <div style={{ color: '#64748b' }}>Camera Muted</div>
                )}
                <span className="video-feed-label">{currentChat.name} (Therapist)</span>
              </div>

              {/* Right Column: User Self Feed */}
              <div className="video-feed" style={{ backgroundColor: '#1e293b' }}>
                <div className="video-avatar-large" style={{ background: '#10b981' }}>
                  SC
                </div>
                <span className="video-feed-label">You (Client)</span>
              </div>

              {/* Self feed thumbnail if single screen on mobile */}
              <div className="video-self-overlay">
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Self Feed</span>
                </div>
              </div>
            </div>

            {/* Call Control Center */}
            <div className="video-controls-bar">
              <button
                className={`control-btn ${!videoMuted ? 'active' : ''}`}
                onClick={() => setVideoMuted(!videoMuted)}
                title={videoMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {!videoMuted ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              <button
                className={`control-btn ${!cameraOff ? 'active' : ''}`}
                onClick={() => setCameraOff(!cameraOff)}
                title={cameraOff ? "Turn Video On" : "Turn Video Off"}
              >
                {!cameraOff ? <Video size={20} /> : <VideoOff size={20} />}
              </button>
              <button className="control-btn danger" onClick={endVideoCall} title="End Session">
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. PROVIDER PROFILE INFORMATION CARD MODAL */}
      {profileModalOpen && (
        <div className="modal-overlay" onClick={() => setProfileModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h3>Provider Profile Summary</h3>
              <button className="modal-close-btn" onClick={() => setProfileModalOpen(false)}>
                <X size={16} />
              </button>
            </header>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <div className="profile-modal-avatar">
                {currentChat.name.substring(0, 1)}
              </div>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>{currentChat.name}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>
                Licensed Clinical {currentChat.role} Specialist
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 4, margin: '8px 0', color: '#fbbf24' }}>
                <Star size={14} fill="#fbbf24" />
                <Star size={14} fill="#fbbf24" />
                <Star size={14} fill="#fbbf24" />
                <Star size={14} fill="#fbbf24" />
                <Star size={14} fill="#fbbf24" />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: 4, fontWeight: 600 }}>4.9 (124 reviews)</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left', marginTop: 16 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <Award size={16} className="text-accent" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Licensed Practitioner (ID: 948271) • Specializes in Cognitive Behavioral Therapy (CBT) & OCD therapy models.
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <MapPin size={16} className="text-accent" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    San Francisco, California Workspace (Remote Support)
                  </span>
                </div>
              </div>

              <div className="profile-meta-grid">
                <div className="profile-meta-card">
                  <div className="profile-meta-val">12+</div>
                  <div className="profile-meta-lbl">Completed Sessions</div>
                </div>
                <div className="profile-meta-card">
                  <div className="profile-meta-val">100%</div>
                  <div className="profile-meta-lbl">Client Rating</div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cta-btn secondary" onClick={() => setProfileModalOpen(false)}>
                Close
              </button>
              <button
                className="cta-btn primary"
                onClick={() => {
                  setProfileModalOpen(false)
                  setBookingModalOpen(true)
                }}
              >
                Schedule Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. APPOINTMENT SCHEDULER BOOKING MODAL */}
      {bookingModalOpen && (
        <div className="modal-overlay" onClick={() => setBookingModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h3>Schedule 1-1 session with {currentChat.name}</h3>
              <button className="modal-close-btn" onClick={() => setBookingModalOpen(false)}>
                <X size={16} />
              </button>
            </header>

            {/* Action form */}
            <form onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.target)
              handleCreateAppointment({
                date: fd.get('date'),
                time: fd.get('time'),
                sessionType: fd.get('type')
              })
            }} className="booking-form">
              <div className="modal-body">
                <div className="booking-form">
                  <div className="form-group">
                    <label htmlFor="date">Appointment Date</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      className="form-input"
                      defaultValue="2026-07-04"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="time">Preferred Time Slot</label>
                    <select id="time" name="time" className="form-select" required>
                      <option value="09:00 AM">09:00 AM PST</option>
                      <option value="10:30 AM">10:30 AM PST</option>
                      <option value="01:00 PM">01:00 PM PST</option>
                      <option value="03:00 PM">03:00 PM PST</option>
                      <option value="04:30 PM">04:30 PM PST</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="type">Session Category</label>
                    <select id="type" name="type" className="form-select" required>
                      <option value="Therapy Session">Cognitive Behavioral Therapy (CBT)</option>
                      <option value="Therapy Session">OCD Targeted Consultation</option>
                      <option value="Consultation">General Wellness Check-in</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cta-btn secondary" onClick={() => setBookingModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="cta-btn primary">
                  Schedule Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. VIEW APPOINTMENT DETAILS CARD MODAL */}
      {selectedAppt && (
        <div className="modal-overlay" onClick={() => setSelectedAppt(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
              <h3>Appointment Session Details</h3>
              <button className="modal-close-btn" onClick={() => setSelectedAppt(null)}>
                <X size={16} />
              </button>
            </header>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status:</span>
                  <span className={`cta-badge ${selectedAppt.status === 'confirmed' ? 'success' : selectedAppt.status === 'cancelled' ? 'danger' : 'primary'}`} style={{ marginLeft: 'auto' }}>
                    {selectedAppt.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 12, backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Client Name:</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{currentChat.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Consultant:</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Mantra Provider Portal</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Category:</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{selectedAppt.sessionType || 'Therapy'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Pricing:</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{selectedAppt.price || '$120.00'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <Clock size={16} className="text-accent" style={{ marginTop: 2 }} />
                  <div>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Scheduled Time Slot</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {selectedAppt.date} • {selectedAppt.time} (PST)
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <AlertCircle size={16} className="text-accent" style={{ marginTop: 2 }} />
                  <div>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Cancellation Policy</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Free cancellations up to 24 hours before the session. Cancelled appointments trigger immediate notifications.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {selectedAppt.status === 'requested' && (
                <>
                  <button
                    className="cta-btn primary"
                    onClick={() => {
                      handleUpdateApptStatus(selectedAppt.id, 'confirmed')
                    }}
                  >
                    Confirm Session
                  </button>
                  <button
                    className="cta-btn secondary"
                    style={{ color: 'var(--danger-color)' }}
                    onClick={() => {
                      handleUpdateApptStatus(selectedAppt.id, 'cancelled')
                    }}
                  >
                    Cancel Session
                  </button>
                </>
              )}
              {selectedAppt.status === 'confirmed' && (
                <button
                  className="cta-btn secondary"
                  style={{ color: 'var(--danger-color)' }}
                  onClick={() => {
                    handleUpdateApptStatus(selectedAppt.id, 'cancelled')
                  }}
                >
                  Cancel Appointment
                </button>
              )}
              <button className="cta-btn secondary" onClick={() => setSelectedAppt(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. COMMAND PALETTE MODAL OVERLAY (Ctrl+K) */}
      {cmdPaletteOpen && (
        <div className="modal-overlay" onClick={() => setCmdPaletteOpen(false)}>
          <div className="modal-content cmd-palette-content" onClick={(e) => e.stopPropagation()}>
            <div className="cmd-search-input-row">
              <Command size={18} className="text-secondary" />
              <input
                type="text"
                placeholder="Type a command or search..."
                className="cmd-search-input"
                autoFocus
                value={cmdSearch}
                onChange={(e) => setCmdSearch(e.target.value)}
              />
              <span className="search-shortcut" style={{ top: 'auto', right: 18 }}>ESC</span>
            </div>

            <div className="cmd-list">
              {[
                { name: 'Toggle Light/Dark Theme', cmd: 'theme', shortcut: 'T', icon: Sun },
                { name: `View ${currentChat.name}'s Provider Profile`, cmd: 'profile', shortcut: 'P', icon: Users },
                { name: 'Schedule New Session Slot', cmd: 'book', shortcut: 'B', icon: Calendar },
                { name: 'Initiate Simulated Video Session', cmd: 'video', shortcut: 'V', icon: Video },
                { name: 'Open AI Copilot Helper', cmd: 'copilot', shortcut: 'A', icon: Brain },
                { name: 'Clear Active Chat Logs', cmd: 'clear', shortcut: 'C', icon: X }
              ]
                .filter(i => i.name.toLowerCase().includes(cmdSearch.toLowerCase()))
                .map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.cmd}
                      className="cmd-item"
                      onClick={() => executeCommand(item.cmd)}
                    >
                      <div className="cmd-item-left">
                        <Icon size={16} className="text-secondary" />
                        <span>{item.name}</span>
                      </div>
                      <span className="cmd-item-right">⌘{item.shortcut}</span>
                    </button>
                  )
                })}
            </div>
          </div>
        </div>
      )}

      {/* 6. AI COPILOT CENTERED MODAL */}
      {copilotOpen && (
        <div className="copilot-modal-overlay" onClick={() => setCopilotOpen(false)}>
          <div className="copilot-modal" onClick={(e) => e.stopPropagation()}>
            {/* GLASSMORPHISM HEADER */}
            <header className="copilot-modal-header glassmorphism">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="modal-header-icon-wrap">
                  <Sparkles size={18} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600, letterSpacing: '-0.01em' }}>
                    AI Clinical Copilot
                  </h3>
                  <span className="modal-header-subtitle">
                    Clinical decision support
                  </span>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setCopilotOpen(false)} aria-label="Close Copilot">
                <X size={16} />
              </button>
            </header>

            <div className="copilot-modal-body">
              {copilotLoading ? (
                <div className="copilot-minimal-analysis-layout">
                  {/* Central glowing gradient orb */}
                  <div className="copilot-minimal-orb-container">
                    <div className="minimal-orb-glow-back" />
                    <div className="minimal-orb-core" />
                  </div>

                  {/* Single changing status message */}
                  <div className="copilot-minimal-status-message-wrapper">
                    <div key={copilotMsgIndex} className="copilot-minimal-status-message">
                      {copilotMessages[copilotMsgIndex]}
                    </div>
                  </div>

                  {/* Thin animated indeterminate loading bar (bottom) */}
                  <div className="copilot-minimal-loading-bar-wrapper">
                    <div className="copilot-minimal-loading-bar-track">
                      <div className="copilot-minimal-loading-bar-fill-sliding" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="copilot-tabbed-layout animate-fadeIn">

                  {/* ── Tab bar ── */}
                  <div className="copilot-tabs-bar" role="tablist">
                    <div className="copilot-tabs-list-wrapper">
                      <button role="tab" className={`copilot-tab-btn ${copilotTab === 'ai-summary' ? 'active' : ''}`} onClick={() => setCopilotTab('ai-summary')}>AI Summary</button>
                      <button
                        role="tab"
                        className={`copilot-tab-btn ${copilotTab === 'automations' ? 'active' : ''}`}
                        onClick={() => setCopilotTab('automations')}
                      >
                        Automations
                      </button>
                      <button
                        role="tab"
                        className={`copilot-tab-btn ${copilotTab === 'ask-ai' ? 'active' : ''}`}
                        onClick={() => {
                          if (isPremium) {
                            setCopilotTab('ask-ai');
                          } else {
                            setPendingTab('ask-ai');
                            setUpsellModalOpen(true);
                          }
                        }}
                      >
                        Ask AI {!isPremium && <LockIcon />}
                      </button>
                      <button
                        role="tab"
                        className={`copilot-tab-btn ${copilotTab === 'treatment-plans' ? 'active' : ''}`}
                        onClick={() => {
                          if (isPremium) {
                            setCopilotTab('treatment-plans');
                          } else {
                            setPendingTab('treatment-plans');
                            setUpsellModalOpen(true);
                          }
                        }}
                      >
                        Treatment Plans {!isPremium && <LockIcon />}
                      </button>
                    </div>

                    {/* Demo/Testing Provider Type toggle */}
                    <div className="demo-provider-type-toggle">
                      <span className="demo-toggle-label">Provider Type:</span>
                      <button
                        type="button"
                        className={`demo-toggle-opt ${!isPremium ? 'active' : ''}`}
                        onClick={() => setIsPremium(false)}
                      >
                        Free
                      </button>
                      <button
                        type="button"
                        className={`demo-toggle-opt ${isPremium ? 'active' : ''}`}
                        onClick={() => setIsPremium(true)}
                      >
                        Premium
                      </button>
                    </div>
                  </div>

                  {/* ── AI SUMMARY TAB ── */}
                  {copilotTab === 'ai-summary' && (
                    <div className="copilot-tab-panel copilot-overview-panel" role="tabpanel">
                      <AISummary
                        isSummaryExpanded={isSummaryExpanded}
                        setIsSummaryExpanded={setIsSummaryExpanded}
                        onCopilotChatSubmit={(q) => { setCopilotTab('ask-ai'); handleCopilotChatSubmit(q) }}
                        fullWidth
                      >
                        <RecommendedActions
                          onCopilotChatSubmit={handleCopilotChatSubmit}
                          onSendRecommendation={handleSendRecommendation}
                        />
                      </AISummary>
                    </div>
                  )}

                  {/* ── ASK AI TAB ── */}
                  {copilotTab === 'ask-ai' && (
                    <div className="copilot-tab-panel copilot-ask-ai-panel" role="tabpanel">

                      {/* Chat log */}
                      <div className="copilot-workspace-chat-log">
                        {copilotChat.map((msg) => (
                          <div key={msg.id || msg.text} className={`copilot-bubble-row ${msg.sender}`}>
                            <div className="copilot-chat-bubble-content">
                              {msg.sender === 'ai' ? (
                                <div className="bubble-markdown-rendered">
                                  {renderMarkdown(msg.text)}
                                </div>
                              ) : (
                                <div className="bubble-text">{msg.text}</div>
                              )}
                              <span className="bubble-time-stamp">{msg.time}</span>
                            </div>
                          </div>
                        ))}
                        {isCopilotThinking && (
                          <div className="copilot-bubble-row ai thinking">
                            <div className="copilot-chat-bubble-content">
                              <div className="claude-typing-indicator">
                                <span className="dot" />
                                <span className="dot" />
                                <span className="dot" />
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={copilotEndRef} />
                      </div>

                      {/* Chips + input */}
                      <div className="copilot-workspace-input-controls">
                        {/* Suggested prompt chips */}
                        <div className="suggested-prompts-row-wrapper">
                          <div className="suggested-prompts-scroller">
                            <button
                              className="suggested-prompt-chip suggested-prompt-chip--accent"
                              onClick={() => setTreatmentPlanOpen(true)}
                            >
                              ✨ Generate Treatment Plan
                            </button>
                            {[
                              'Generate SOAP Notes',
                              'Prepare Session Plan',
                              'Summarize Client',
                              'Draft Follow-up',
                              'Recommend Activities',
                            ].map((chipText) => (
                              <button
                                key={chipText}
                                className="suggested-prompt-chip"
                                onClick={() => handleCopilotQuickAction(chipText)}
                              >
                                {chipText}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Input bar */}
                        <div className="copilot-chat-input-bar">
                          <button className="input-accessory-btn" title="Attach file">
                            <Paperclip size={16} />
                          </button>
                          <textarea
                            placeholder="Ask anything about this client..."
                            className="copilot-chat-textbox"
                            rows={1}
                            value={copilotQuery}
                            onChange={(e) => setCopilotQuery(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleCopilotChatSubmit(copilotQuery)
                              }
                            }}
                          />
                          <button className="input-accessory-btn" style={{ marginRight: 4 }} title="Voice input">
                            <Mic size={16} />
                          </button>
                          <button
                            className="copilot-send-trigger-btn"
                            disabled={!copilotQuery.trim()}
                            onClick={() => handleCopilotChatSubmit(copilotQuery)}
                            title="Send prompt"
                          >
                            <Send size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Confirmation overlay */}
                      {confirmAction && (
                        <div className="action-confirm-overlay">
                          <div className="action-confirm-card">
                            <h4 className="action-confirm-title">
                              {confirmAction.title === 'Follow-up Message' ? 'Send Follow-up Message?' : `Send ${confirmAction.title}?`}
                            </h4>
                            <p className="action-confirm-desc">The client will receive:</p>
                            <div className="action-confirm-message-box">
                              {confirmAction.type === 'yoga' && '"Your therapist has recommended completing a Yoga Program to help reduce anxiety and improve sleep."'}
                              {confirmAction.type === 'ocd' && '"Your therapist has recommended completing an updated OCD Assessment before your next session."'}
                              {confirmAction.type === 'anxiety' && '"Your therapist has recommended completing an updated Anxiety Assessment before your next session."'}
                              {confirmAction.type === 'psych' && '"Your therapist has recommended a Psychiatry Consultation medication review."'}
                              {confirmAction.type === 'homework' && '"Your therapist has assigned today\'s CBT Worksheet homework activity."'}
                              {confirmAction.type === 'followup' && confirmAction.previewText}
                            </div>
                            <div className="action-confirm-buttons">
                              <button className="confirm-btn cancel" onClick={() => setConfirmAction(null)}>Cancel</button>
                              <button className="confirm-btn send" onClick={() => handleExecuteAction(confirmAction)}>Send</button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Success toast */}
                      {successToast && (
                        <div className="action-success-toast">
                          <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>✓</span>
                          <span>{successToast}</span>
                        </div>
                      )}

                    </div>
                  )}

                  {/* ── TREATMENT PLANS TAB ── */}
                  {copilotTab === 'treatment-plans' && (
                    <div className="copilot-tab-panel copilot-care-plan-panel" role="tabpanel">
                      <TreatmentPlanStudio
                        onClose={() => setCopilotTab('ai-summary')}
                        onSendToClient={handleSendTreatmentPlan}
                      />
                    </div>
                  )}

                  {/* ── AUTOMATIONS TAB ── */}
                  {copilotTab === 'automations' && (
                    <div className="copilot-tab-panel copilot-care-assistant-panel" role="tabpanel">
                      <Automations clientName={currentChat?.name} />
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Treatment Plan Modal — rendered at app root, above everything */}
      {treatmentPlanOpen && (
        <TreatmentPlanModal
          onClose={() => setTreatmentPlanOpen(false)}
          onSendToClient={handleSendTreatmentPlan}
        />
      )}

      {/* PDF-only view — opened from chat card "View Treatment Plan" */}
      {sentPlanPreviewOpen && sentPlanSections && (
        <TplanPreviewModal
          sections={sentPlanSections}
          onClose={() => setSentPlanPreviewOpen(false)}
        />
      )}

      {/* PREMIUM UPSELL MODAL */}
      {upsellModalOpen && (
        <div className="ca-upsell-modal-overlay" onClick={() => setUpsellModalOpen(false)}>
          <div className="ca-upsell-modal-dialog" onClick={e => e.stopPropagation()}>
            <button className="ca-upsell-close-btn" onClick={() => setUpsellModalOpen(false)}>
              <X size={18} />
            </button>

            <div className="ca-upsell-icon-header">
              <div className="ca-upsell-sparkle-orb">
                <Sparkles size={28} className="ca-upsell-sparkle-icon" />
              </div>
            </div>

            <div className="ca-upsell-title-row" style={{ flexDirection: 'column', gap: '4px' }}>
              <h2 className="ca-upsell-title">Unlock AI Clinical Intelligence</h2>
              <p className="ca-upsell-subtitle" style={{ marginTop: '0px' }}>
                Upgrade to Premium to access AI-powered clinical tools.
              </p>
            </div>

            <div className="ca-premium-features-list">
              <div className="ca-premium-feature-item">
                <Check size={16} className="ca-premium-check" />
                <span>Ask clinical questions instantly</span>
              </div>
              <div className="ca-premium-feature-item">
                <Check size={16} className="ca-premium-check" />
                <span>Generate SOAP Notes</span>
              </div>
              <div className="ca-premium-feature-item">
                <Check size={16} className="ca-premium-check" />
                <span>Create professional care plans</span>
              </div>
              <div className="ca-premium-feature-item">
                <Check size={16} className="ca-premium-check" />
                <span>Faster documentation</span>
              </div>
              <div className="ca-premium-feature-item">
                <Check size={16} className="ca-premium-check" />
                <span>Better clinical decisions</span>
              </div>
              <div className="ca-premium-feature-item">
                <Check size={16} className="ca-premium-check" />
                <span>Save hours every week</span>
              </div>
            </div>

            <div className="ca-upsell-actions-section" style={{ marginTop: '24px' }}>
              <button
                className="ca-upsell-btn-primary"
                onClick={() => {
                  setIsPremium(true);
                  setUpsellModalOpen(false);
                  if (pendingTab) setCopilotTab(pendingTab);
                  setPendingTab(null);
                }}
              >
                Upgrade to Premium
              </button>
              <button className="ca-upsell-btn-secondary" onClick={() => setUpsellModalOpen(false)}>
                Maybe Later
              </button>
              <div className="ca-upsell-footer-note">Included in Premium Provider plans.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

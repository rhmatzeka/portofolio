// @ts-nocheck
import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import killuaIdleSprite from '../assets/killua-ai/killua-idle.png'
import killuaDizzySprite from '../assets/killua-ai/killua-dizzy.png'
import './AiAssistant.css'

const initialMessages = [
  {
    role: 'assistant',
    content: 'Hey, I am RahmatDev Assistant, an AI built by Rahmat. Ask me about his projects, tech stack, or how to contact him.'
  }
]

const suggestions = [
  'What projects has Rahmat built?',
  'What is Rahmat good at?',
  'How can I contact Rahmat?'
]

const DIZZY_DURATION_MS = 2300
const SHAKE_RESET_MS = 520

const AssistantMark = ({ compact = false, isDizzy = false }) => (
  <span
    className={`ai-mark killua-ai-mark ${compact ? 'compact' : ''} ${isDizzy ? 'is-dizzy' : 'is-idle'}`}
    style={{
      '--killua-idle-sheet': `url(${killuaIdleSprite})`,
      '--killua-dizzy-sheet': `url(${killuaDizzySprite})`
    }}
    aria-hidden="true"
  >
    <span className="killua-sprite" />
  </span>
)

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M21 3 10.5 13.5M21 3l-6.7 18-3.8-7.5L3 9.7 21 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const cleanAssistantText = (value) => (
  value
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
)

const AiAssistant = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDizzy, setIsDizzy] = useState(false)
  const inputRef = useRef(null)
  const shakeRef = useRef({
    lastX: null,
    lastY: null,
    lastAxis: 0,
    turns: 0,
    travel: 0,
    resetTimeout: null,
    dizzyTimeout: null,
    blockClick: false,
    blockClickTimeout: null
  })

  const resetShakeTracker = () => {
    const tracker = shakeRef.current
    tracker.lastX = null
    tracker.lastY = null
    tracker.lastAxis = 0
    tracker.turns = 0
    tracker.travel = 0

    if (tracker.resetTimeout) {
      window.clearTimeout(tracker.resetTimeout)
      tracker.resetTimeout = null
    }
  }

  const triggerDizzy = () => {
    const tracker = shakeRef.current
    resetShakeTracker()
    tracker.blockClick = true

    if (tracker.blockClickTimeout) window.clearTimeout(tracker.blockClickTimeout)
    tracker.blockClickTimeout = window.setTimeout(() => {
      tracker.blockClick = false
    }, 420)

    setIsDizzy(true)

    if (tracker.dizzyTimeout) window.clearTimeout(tracker.dizzyTimeout)
    tracker.dizzyTimeout = window.setTimeout(() => {
      setIsDizzy(false)
      tracker.dizzyTimeout = null
    }, DIZZY_DURATION_MS)
  }

  const handleShakePointerDown = (event) => {
    resetShakeTracker()
    shakeRef.current.lastX = event.clientX
    shakeRef.current.lastY = event.clientY
  }

  const handleShakePointerMove = (event) => {
    const tracker = shakeRef.current

    if (tracker.lastX === null || tracker.lastY === null) {
      tracker.lastX = event.clientX
      tracker.lastY = event.clientY
      return
    }

    const dx = event.clientX - tracker.lastX
    const dy = event.clientY - tracker.lastY
    const distance = Math.hypot(dx, dy)

    if (distance < 3) return

    const axis = Math.abs(dx) >= Math.abs(dy) ? Math.sign(dx) : Math.sign(dy)
    if (axis && tracker.lastAxis && axis !== tracker.lastAxis && distance > 4) {
      tracker.turns += 1
    }

    tracker.lastAxis = axis || tracker.lastAxis
    tracker.travel += distance
    tracker.lastX = event.clientX
    tracker.lastY = event.clientY

    if (tracker.resetTimeout) window.clearTimeout(tracker.resetTimeout)
    tracker.resetTimeout = window.setTimeout(resetShakeTracker, SHAKE_RESET_MS)

    if ((tracker.turns >= 3 && tracker.travel > 42) || (tracker.turns >= 2 && tracker.travel > 88)) {
      triggerDizzy()
    }
  }

  const handleToggleClick = (event) => {
    if (shakeRef.current.blockClick) {
      event.preventDefault()
      shakeRef.current.blockClick = false
      return
    }

    openAssistant()
  }

  useEffect(() => () => {
    const tracker = shakeRef.current
    if (tracker.resetTimeout) window.clearTimeout(tracker.resetTimeout)
    if (tracker.dizzyTimeout) window.clearTimeout(tracker.dizzyTimeout)
    if (tracker.blockClickTimeout) window.clearTimeout(tracker.blockClickTimeout)
  }, [])

  useEffect(() => {
    if (!isOpen) return undefined

    const viewport = window.visualViewport
    const setViewportHeight = () => {
      const height = viewport?.height || window.innerHeight
      document.documentElement.style.setProperty('--ai-viewport-height', `${height}px`)
    }

    setViewportHeight()
    viewport?.addEventListener('resize', setViewportHeight)
    viewport?.addEventListener('scroll', setViewportHeight)
    window.addEventListener('resize', setViewportHeight)

    return () => {
      viewport?.removeEventListener('resize', setViewportHeight)
      viewport?.removeEventListener('scroll', setViewportHeight)
      window.removeEventListener('resize', setViewportHeight)
      document.documentElement.style.removeProperty('--ai-viewport-height')
    }
  }, [isOpen])

  const visibleMessages = useMemo(() => (
    messages.filter((message) => message.role === 'user' || message.role === 'assistant')
  ), [messages])

  const openAssistant = () => {
    setIsOpen(true)
    window.setTimeout(() => inputRef.current?.focus(), 120)
  }

  const closeAssistant = () => {
    setIsOpen(false)
  }

  const sendMessage = async (content) => {
    const trimmed = content.trim()
    if (!trimmed || isLoading) return

    const nextMessages = [...messages, { role: 'user', content: trimmed }]
    setMessages(nextMessages)
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.slice(-8).map(({ role, content: messageContent }) => ({
            role,
            content: messageContent
          }))
        })
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || 'Assistant request failed.')
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        { role: 'assistant', content: data.reply }
      ])
    } catch (error) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: 'assistant',
          content: error.message || 'Sorry, the assistant is temporarily unavailable.'
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    sendMessage(input)
  }

  return (
    <div className={`ai-assistant ${isOpen ? 'is-open' : ''}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="ai-panel"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div className="ai-panel-header">
              <AssistantMark compact isDizzy={isDizzy} />
              <div>
                <h2>RahmatDev Assistant</h2>
              </div>
              <button className="ai-icon-btn" type="button" onClick={closeAssistant} aria-label="Close assistant">
                <CloseIcon />
              </button>
            </div>

            <div className="ai-messages" aria-live="polite">
              {visibleMessages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`ai-message ${message.role}`}>
                  {message.role === 'assistant' ? cleanAssistantText(message.content) : message.content}
                </div>
              ))}

              {isLoading && (
                <div className="ai-message assistant loading">
                  <span />
                  <span />
                  <span />
                </div>
              )}
            </div>

            {messages.length === 1 && (
              <div className="ai-suggestions">
                {suggestions.map((suggestion) => (
                  <button key={suggestion} type="button" onClick={() => sendMessage(suggestion)}>
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            <form className="ai-input-row" onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about Rahmat..."
                maxLength={900}
                disabled={isLoading}
              />
              <button type="submit" disabled={!input.trim() || isLoading} aria-label="Send message">
                <SendIcon />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="ai-toggle"
        type="button"
        onClick={handleToggleClick}
        onPointerDown={handleShakePointerDown}
        onPointerMove={handleShakePointerMove}
        onPointerLeave={resetShakeTracker}
        whileTap={{ scale: 0.95 }}
        aria-label="Open AI assistant"
      >
        <AssistantMark isDizzy={isDizzy} />
        <span className="ai-toggle-label">Ask AI</span>
      </motion.button>
    </div>
  )
}

export default AiAssistant

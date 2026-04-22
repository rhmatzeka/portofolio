import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './AiAssistant.css'

const initialMessages = [
  {
    role: 'assistant',
    content: 'Yo, gue RahmatDev Assistant, AI bikinan Rahmat. Tanya aja soal project, tech stack, atau cara ngontak dia.'
  }
]

const suggestions = [
  'Project Rahmat apa aja?',
  'Rahmat jago di bidang apa?',
  'Cara contact Rahmat gimana?'
]

const AssistantMark = ({ compact = false }) => (
  <span className={`ai-mark ${compact ? 'compact' : ''}`} aria-hidden="true">
    <svg viewBox="0 0 48 48" fill="none">
      <path d="M24 5 40.5 14.5v19L24 43 7.5 33.5v-19L24 5Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round"/>
      <path d="M17 31V18.8c0-1 .8-1.8 1.8-1.8h10.4c1 0 1.8.8 1.8 1.8V31M17 25h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/>
      <path d="M14 14.5 9.5 12M34 14.5l4.5-2.5M14 33.5 9.5 36M34 33.5l4.5 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
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

const AiAssistant = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef(null)

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
              <AssistantMark compact />
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
                  {message.content}
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
        onClick={openAssistant}
        whileTap={{ scale: 0.95 }}
        aria-label="Open AI assistant"
      >
        <AssistantMark />
        <span>Ask AI</span>
      </motion.button>
    </div>
  )
}

export default AiAssistant

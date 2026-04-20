import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './AiAssistant.css'

const initialMessages = [
  {
    role: 'assistant',
    content: 'Hi, I am RahmatDev Assistant. Ask me about Rahmat, his projects, tech stack, or contact info.'
  }
]

const suggestions = [
  'What projects has Rahmat built?',
  'What is Rahmat good at?',
  'How can I contact Rahmat?'
]

const ChatIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 7.8C5 5.7 6.7 4 8.8 4h6.4C17.3 4 19 5.7 19 7.8v3.7c0 2.1-1.7 3.8-3.8 3.8h-2.5l-3.4 3.1c-.6.5-1.5.1-1.5-.7v-2.5C6.2 14.8 5 13.3 5 11.5V7.8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M9 8.7h6M9 11.4h3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
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

  const visibleMessages = useMemo(() => (
    messages.filter((message) => message.role === 'user' || message.role === 'assistant')
  ), [messages])

  const openAssistant = () => {
    setIsOpen(true)
    window.setTimeout(() => inputRef.current?.focus(), 120)
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
    <div className="ai-assistant">
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
              <div>
                <span className="ai-kicker">Groq powered</span>
                <h2>RahmatDev Assistant</h2>
              </div>
              <button className="ai-icon-btn" type="button" onClick={() => setIsOpen(false)} aria-label="Close assistant">
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

      <button className="ai-toggle" type="button" onClick={openAssistant} aria-label="Open AI assistant">
        <ChatIcon />
        <span>AI</span>
      </button>
    </div>
  )
}

export default AiAssistant

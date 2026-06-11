// @ts-nocheck
import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import killuaIdleOpen from '../assets/killua-ai/killua-idle-still.png'
import killuaIdleBlink from '../assets/killua-ai/killua-idle-blink.png'
import killuaFloatSprite from '../assets/killua-ai/killua-float-stable.png'
import killuaWalkSprite from '../assets/killua-ai/killua-walk-stable.png'
import killuaDizzySprite from '../assets/killua-ai/killua-dizzy-stable.png'
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

const DIZZY_DURATION_MS = 3600
const SHAKE_RESET_MS = 700
const SHAKE_REQUIRED_TURNS = 5
const SHAKE_REQUIRED_TRAVEL = 170
const SHAKE_REQUIRED_SAMPLES = 6
const DRAG_START_DISTANCE = 6
const LAUNCHER_GRAVITY = 2200
const LAUNCHER_WALK_SPEED = 45
const LAUNCHER_WALK_EDGE_GAP = 14
const LAUNCHER_ROAM_PAUSE_MIN_MS = 1150
const LAUNCHER_ROAM_PAUSE_MAX_MS = 2200
const LAUNCHER_ROAM_RESUME_PAUSE_MS = 700
const LAUNCHER_ROAM_MIN_TRAVEL = 82
const LAUNCHER_ROAM_MAX_DURATION = 42000
const LAUNCHER_ROAM_TARGET_RATIOS = [0.86, 0.48, 0.72, 0.18, 0.94, 0.34, 0.58, 0.08]

const AssistantMark = ({ compact = false, isDizzy = false, isFloating = false, isWalking = false, walkDirection = 'right' }) => (
  <span
    className={`ai-mark killua-ai-mark ${compact ? 'compact' : ''} ${isDizzy ? 'is-dizzy' : 'is-idle'} ${isFloating ? 'is-floating' : ''} ${isWalking ? 'is-walking' : ''} ${walkDirection === 'left' ? 'is-walking-left' : ''}`}
    style={{
      '--killua-idle-open': `url(${killuaIdleOpen})`,
      '--killua-idle-blink': `url(${killuaIdleBlink})`,
      '--killua-float-sheet': `url(${killuaFloatSprite})`,
      '--killua-walk-sheet': `url(${killuaWalkSprite})`,
      '--killua-dizzy-sheet': `url(${killuaDizzySprite})`
    }}
    aria-hidden="true"
  >
    <span className="killua-sprite killua-sprite-idle" />
    <span className="killua-sprite killua-sprite-blink" />
    <span className="killua-sprite killua-sprite-float" />
    <span className="killua-sprite killua-sprite-walk" />
    <span className="killua-sprite killua-sprite-dizzy" />
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

const ChatIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5.3 18.5 4 22l4.2-2.1c1.1.4 2.4.6 3.8.6 5 0 9-3.1 9-7s-4-7-9-7-9 3.1-9 7c0 1.9.9 3.6 2.3 4.9Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.2 13h.1M12 13h.1M15.8 13h.1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
)

const WalkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M14.1 4.9a2.05 2.05 0 1 1-4.1 0 2.05 2.05 0 0 1 4.1 0Z" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11.6 8.2 9.2 11.6l3.3 2.15 3-1.8" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.2 11.6 6.7 13.1M12.6 13.9l-1.9 4.4-3.35 1.25M13.2 14l3.1 3.7 2.75 1.25" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 18.9c.55-.45 1.25-.78 2.05-.96M16.7 20.35c1.05.14 1.88.05 2.55-.27" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" opacity="0.62"/>
  </svg>
)

const HomeIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 11.4 12 4l8 7.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.8 10.3V20h10.4v-9.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 20v-5.2h4V20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
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
  const [isRoaming, setIsRoaming] = useState(false)
  const [launcherOffset, setLauncherOffsetState] = useState({ x: 0, y: 0 })
  const [launcherPhase, setLauncherPhase] = useState('idle')
  const [walkDirection, setWalkDirection] = useState('right')
  const inputRef = useRef(null)
  const isDizzyRef = useRef(false)
  const launcherPhaseRef = useRef('idle')
  const launcherOffsetRef = useRef({ x: 0, y: 0 })
  const isRoamingRef = useRef(false)
  const dropAnimationRef = useRef(null)
  const roamTimeoutRef = useRef(null)
  const roamTargetIndexRef = useRef(0)
  const pendingWalkHomeRef = useRef(false)
  const pendingResumeRoamingRef = useRef(false)
  const dragRef = useRef({
    pointerId: null,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    lastOffsetX: 0,
    lastOffsetY: 0,
    lastTime: 0,
    vx: 0,
    vy: 0,
    hasDragged: false,
    resumeRoamingAfterDrop: false
  })
  const shakeRef = useRef({
    lastX: null,
    lastY: null,
    lastAxis: 0,
    turns: 0,
    travel: 0,
    samples: 0,
    resetTimeout: null,
    dizzyTimeout: null,
    blockClick: false,
    blockClickTimeout: null
  })

  const setDizzyState = (nextIsDizzy) => {
    isDizzyRef.current = nextIsDizzy
    setIsDizzy(nextIsDizzy)
  }

  const setLauncherPhaseState = (nextPhase) => {
    launcherPhaseRef.current = nextPhase
    setLauncherPhase(nextPhase)
  }

  const setRoamingState = (nextIsRoaming) => {
    isRoamingRef.current = nextIsRoaming
    setIsRoaming(nextIsRoaming)
  }

  const stopRoaming = () => {
    setRoamingState(false)

    if (roamTimeoutRef.current) {
      window.clearTimeout(roamTimeoutRef.current)
      roamTimeoutRef.current = null
    }
  }

  const clampLauncherOffset = (x, y) => {
    const viewportWidth = window.innerWidth || 1024
    const viewportHeight = window.innerHeight || 768
    const maxLeft = Math.max(0, viewportWidth - 132)
    const maxUp = Math.max(0, viewportHeight - 172)

    return {
      x: Math.min(16, Math.max(-maxLeft, x)),
      y: Math.min(22, Math.max(-maxUp, y))
    }
  }

  const setLauncherOffset = (nextOffset) => {
    const roundedOffset = {
      x: Math.round(nextOffset.x),
      y: Math.round(nextOffset.y)
    }

    launcherOffsetRef.current = roundedOffset
    setLauncherOffsetState(roundedOffset)
  }

  const cancelLauncherAnimation = () => {
    if (roamTimeoutRef.current) {
      window.clearTimeout(roamTimeoutRef.current)
      roamTimeoutRef.current = null
    }

    if (!dropAnimationRef.current) return

    window.cancelAnimationFrame(dropAnimationRef.current)
    dropAnimationRef.current = null
  }

  const blockNextClick = (duration = 420) => {
    const tracker = shakeRef.current
    tracker.blockClick = true

    if (tracker.blockClickTimeout) window.clearTimeout(tracker.blockClickTimeout)
    tracker.blockClickTimeout = window.setTimeout(() => {
      tracker.blockClick = false
    }, duration)
  }

  const getRoamLeftEdge = () => {
    const viewportWidth = window.innerWidth || 1024
    const maxLeft = Math.max(0, viewportWidth - 132)
    return -Math.max(0, maxLeft - LAUNCHER_WALK_EDGE_GAP)
  }

  const getRoamPauseDuration = () => (
    Math.round(
      LAUNCHER_ROAM_PAUSE_MIN_MS +
        Math.random() * (LAUNCHER_ROAM_PAUSE_MAX_MS - LAUNCHER_ROAM_PAUSE_MIN_MS)
    )
  )

  const getNextRoamTargetX = () => {
    const leftEdge = getRoamLeftEdge()
    const currentX = launcherOffsetRef.current.x
    const minimumTravel = Math.min(LAUNCHER_ROAM_MIN_TRAVEL, Math.abs(leftEdge) * 0.32)

    if (Math.abs(leftEdge) < LAUNCHER_ROAM_MIN_TRAVEL) return 0

    for (let attempt = 0; attempt < LAUNCHER_ROAM_TARGET_RATIOS.length; attempt += 1) {
      const ratio = LAUNCHER_ROAM_TARGET_RATIOS[roamTargetIndexRef.current % LAUNCHER_ROAM_TARGET_RATIOS.length]
      roamTargetIndexRef.current += 1

      const targetX = Math.round(leftEdge * ratio)
      if (Math.abs(targetX - currentX) >= minimumTravel) return targetX
    }

    return currentX < leftEdge * 0.5 ? Math.round(leftEdge * 0.12) : Math.round(leftEdge * 0.88)
  }

  const startWalkTo = (targetX, { minDuration = 2200, maxDuration = 9000, onComplete } = {}) => {
    cancelLauncherAnimation()

    const startX = launcherOffsetRef.current.x
    const clampedTarget = clampLauncherOffset(targetX, 0)
    const endX = clampedTarget.x
    const distance = Math.abs(endX - startX)

    if (distance < 1) {
      setLauncherOffset({ x: endX, y: 0 })
      dropAnimationRef.current = null
      onComplete?.()
      return
    }

    const duration = Math.min(maxDuration, Math.max(minDuration, (distance / LAUNCHER_WALK_SPEED) * 1000))
    const startTime = performance.now()

    setWalkDirection(endX < startX ? 'left' : 'right')
    setLauncherPhaseState('walking')

    const step = (time) => {
      const progress = Math.min(1, (time - startTime) / duration)
      const x = startX + (endX - startX) * progress

      setLauncherOffset({ x, y: 0 })

      if (progress >= 1) {
        setLauncherOffset({ x: endX, y: 0 })
        dropAnimationRef.current = null
        onComplete?.()
        return
      }

      dropAnimationRef.current = window.requestAnimationFrame(step)
    }

    dropAnimationRef.current = window.requestAnimationFrame(step)
  }

  const startWalkHome = () => {
    stopRoaming()
    pendingResumeRoamingRef.current = false

    const startX = launcherOffsetRef.current.x

    if (isDizzyRef.current) {
      pendingWalkHomeRef.current = Math.abs(startX) >= 1
      setLauncherOffset({ x: startX, y: 0 })
      setLauncherPhaseState('dizzy')
      return
    }

    pendingWalkHomeRef.current = false

    if (Math.abs(startX) < 1) {
      setLauncherOffset({ x: 0, y: 0 })
      setLauncherPhaseState('idle')
      return
    }

    startWalkTo(0, {
      minDuration: 2600,
      maxDuration: 9000,
      onComplete: () => setLauncherPhaseState('idle')
    })
  }

  const startRoamWalk = () => {
    if (isDizzyRef.current || dragRef.current.pointerId !== null) return
    if (isRoamingRef.current) return

    pendingWalkHomeRef.current = false
    pendingResumeRoamingRef.current = false
    resetShakeTracker()
    cancelLauncherAnimation()
    setLauncherOffset({ x: launcherOffsetRef.current.x, y: 0 })
    setRoamingState(true)

    const startNextRoamLeg = () => {
      if (!isRoamingRef.current || isDizzyRef.current || dragRef.current.pointerId !== null) return

      const targetX = getNextRoamTargetX()
      if (Math.abs(targetX - launcherOffsetRef.current.x) < 1) {
        stopRoaming()
        setLauncherPhaseState('idle')
        return
      }

      startWalkTo(targetX, {
        minDuration: 2400,
        maxDuration: LAUNCHER_ROAM_MAX_DURATION,
        onComplete: () => {
          if (!isRoamingRef.current) return

          setLauncherPhaseState('idle')
          roamTimeoutRef.current = window.setTimeout(startNextRoamLeg, getRoamPauseDuration())
        }
      })
    }

    if (Math.abs(getRoamLeftEdge()) < 1) {
      stopRoaming()
      setLauncherPhaseState('idle')
      return
    }

    startNextRoamLeg()
  }

  const resumeRoamingFromLanding = () => {
    if (roamTimeoutRef.current) window.clearTimeout(roamTimeoutRef.current)

    roamTimeoutRef.current = window.setTimeout(() => {
      roamTimeoutRef.current = null

      if (isDizzyRef.current || dragRef.current.pointerId !== null) return
      startRoamWalk()
    }, LAUNCHER_ROAM_RESUME_PAUSE_MS)
  }

  const finishLauncherLanding = (landingX, { resumeRoaming = false } = {}) => {
    const x = clampLauncherOffset(landingX, 0).x

    setLauncherOffset({ x, y: 0 })
    dropAnimationRef.current = null

    if (isDizzyRef.current) {
      pendingResumeRoamingRef.current = resumeRoaming
      pendingWalkHomeRef.current = !resumeRoaming && Math.abs(x) >= 1
      setLauncherPhaseState('dizzy')
      return
    }

    pendingWalkHomeRef.current = false
    pendingResumeRoamingRef.current = false
    setLauncherPhaseState('idle')

    if (resumeRoaming) resumeRoamingFromLanding()
  }

  const startDropAnimation = ({ vy = 0, resumeRoaming = false } = {}) => {
    cancelLauncherAnimation()

    let x = launcherOffsetRef.current.x
    let y = launcherOffsetRef.current.y
    let velocityY = Math.max(-1600, Math.min(1600, vy))
    let previousTime = performance.now()

    setLauncherPhaseState('falling')

    if (y >= 0) {
      finishLauncherLanding(x, { resumeRoaming })
      return
    }

    const step = (time) => {
      const deltaSeconds = Math.min(0.032, Math.max(0.001, (time - previousTime) / 1000))
      previousTime = time

      velocityY += LAUNCHER_GRAVITY * deltaSeconds
      y += velocityY * deltaSeconds

      if (y >= 0) {
        y = 0
        finishLauncherLanding(x, { resumeRoaming })
        return
      }

      const clampedOffset = clampLauncherOffset(x, y)
      if (clampedOffset.y !== y && clampedOffset.y < 0) velocityY = 0
      x = clampedOffset.x
      y = clampedOffset.y

      setLauncherOffset({ x, y })
      dropAnimationRef.current = window.requestAnimationFrame(step)
    }

    dropAnimationRef.current = window.requestAnimationFrame(step)
  }

  const resetShakeTracker = () => {
    const tracker = shakeRef.current
    tracker.lastX = null
    tracker.lastY = null
    tracker.lastAxis = 0
    tracker.turns = 0
    tracker.travel = 0
    tracker.samples = 0

    if (tracker.resetTimeout) {
      window.clearTimeout(tracker.resetTimeout)
      tracker.resetTimeout = null
    }
  }

  const triggerDizzy = () => {
    const tracker = shakeRef.current
    resetShakeTracker()
    if (isDizzyRef.current) return

    stopRoaming()
    blockNextClick()

    setDizzyState(true)

    if (tracker.dizzyTimeout) window.clearTimeout(tracker.dizzyTimeout)
    tracker.dizzyTimeout = window.setTimeout(() => {
      setDizzyState(false)
      tracker.dizzyTimeout = null

      const shouldWalkHome = pendingWalkHomeRef.current
      const shouldResumeRoaming = pendingResumeRoamingRef.current
      pendingWalkHomeRef.current = false
      pendingResumeRoamingRef.current = false

      if (shouldResumeRoaming && dragRef.current.pointerId === null) {
        setLauncherPhaseState('idle')
        resumeRoamingFromLanding()
        return
      }

      if (shouldWalkHome && dragRef.current.pointerId === null) {
        startWalkHome()
        return
      }

      if (launcherPhaseRef.current === 'dizzy') {
        setLauncherPhaseState('idle')
      }
    }, DIZZY_DURATION_MS)
  }

  const handleShakePointerMove = (event) => {
    const tracker = shakeRef.current

    if (isDizzyRef.current) {
      resetShakeTracker()
      return
    }

    if (tracker.lastX === null || tracker.lastY === null) {
      tracker.lastX = event.clientX
      tracker.lastY = event.clientY
      return
    }

    const dx = event.clientX - tracker.lastX
    const dy = event.clientY - tracker.lastY
    const distance = Math.hypot(dx, dy)

    if (distance < 3) return

    tracker.lastX = event.clientX
    tracker.lastY = event.clientY

    const horizontalDistance = Math.abs(dx)
    if (horizontalDistance < 4 || horizontalDistance < Math.abs(dy) * 0.65) return

    const axis = Math.sign(dx)
    if (axis && tracker.lastAxis && axis !== tracker.lastAxis && horizontalDistance > 5) {
      tracker.turns += 1
    }

    tracker.lastAxis = axis || tracker.lastAxis
    tracker.travel += horizontalDistance
    tracker.samples += 1

    if (tracker.resetTimeout) window.clearTimeout(tracker.resetTimeout)
    tracker.resetTimeout = window.setTimeout(resetShakeTracker, SHAKE_RESET_MS)

    if (
      tracker.turns >= SHAKE_REQUIRED_TURNS &&
      tracker.travel >= SHAKE_REQUIRED_TRAVEL &&
      tracker.samples >= SHAKE_REQUIRED_SAMPLES
    ) {
      triggerDizzy()
    }
  }

  const handleLauncherPointerDown = (event) => {
    const shouldResumeRoamingAfterDrop = isRoamingRef.current

    stopRoaming()
    cancelLauncherAnimation()
    pendingWalkHomeRef.current = false
    resetShakeTracker()
    setLauncherPhaseState(isDizzyRef.current ? 'dizzy' : 'idle')

    const drag = dragRef.current
    const offset = launcherOffsetRef.current
    drag.pointerId = event.pointerId
    drag.startX = event.clientX
    drag.startY = event.clientY
    drag.originX = offset.x
    drag.originY = offset.y
    drag.lastOffsetX = offset.x
    drag.lastOffsetY = offset.y
    drag.lastTime = performance.now()
    drag.vx = 0
    drag.vy = 0
    drag.hasDragged = false
    drag.resumeRoamingAfterDrop = shouldResumeRoamingAfterDrop

    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handleLauncherPointerMove = (event) => {
    const drag = dragRef.current
    if (drag.pointerId !== event.pointerId) return

    const pointerDx = event.clientX - drag.startX
    const pointerDy = event.clientY - drag.startY

    if (!drag.hasDragged && Math.hypot(pointerDx, pointerDy) > DRAG_START_DISTANCE) {
      drag.hasDragged = true
      resetShakeTracker()
      shakeRef.current.lastX = event.clientX
      shakeRef.current.lastY = event.clientY
      setLauncherPhaseState('grabbed')
    }

    if (!drag.hasDragged) return

    event.preventDefault()
    handleShakePointerMove(event)

    const nextOffset = clampLauncherOffset(drag.originX + pointerDx, drag.originY + pointerDy)
    const now = performance.now()
    const deltaSeconds = Math.min(0.05, Math.max(0.001, (now - drag.lastTime) / 1000))

    drag.vx = (nextOffset.x - drag.lastOffsetX) / deltaSeconds
    drag.vy = (nextOffset.y - drag.lastOffsetY) / deltaSeconds
    drag.lastOffsetX = nextOffset.x
    drag.lastOffsetY = nextOffset.y
    drag.lastTime = now

    setLauncherOffset(nextOffset)
  }

  const handleLauncherPointerEnd = (event) => {
    const drag = dragRef.current
    const wasDragged = drag.pointerId === event.pointerId && drag.hasDragged
    const shouldResumeRoaming = wasDragged && drag.resumeRoamingAfterDrop

    if (drag.pointerId === event.pointerId) {
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture?.(event.pointerId)
      }
      drag.pointerId = null
    }

    resetShakeTracker()

    if (wasDragged) {
      blockNextClick(520)
      startDropAnimation({ vy: drag.vy, resumeRoaming: shouldResumeRoaming })
    } else {
      setLauncherPhaseState(isDizzyRef.current ? 'dizzy' : 'idle')
    }

    drag.hasDragged = false
    drag.resumeRoamingAfterDrop = false
  }

  const handleLauncherPointerLeave = () => {
    if (dragRef.current.pointerId === null) resetShakeTracker()
  }

  const handleToggleClick = (event) => {
    if (shakeRef.current.blockClick) {
      event.preventDefault()
      shakeRef.current.blockClick = false
      return
    }

    openAssistant()
  }

  const handleBubbleClick = (event) => {
    event.preventDefault()
    event.stopPropagation()
    openAssistant()
  }

  const handleRoamClick = (event) => {
    event.preventDefault()
    event.stopPropagation()
    startRoamWalk()
  }

  const handleHomeControlClick = (event) => {
    event.preventDefault()
    event.stopPropagation()
    resetShakeTracker()
    startWalkHome()
  }

  useEffect(() => () => {
    const tracker = shakeRef.current
    if (tracker.resetTimeout) window.clearTimeout(tracker.resetTimeout)
    if (tracker.dizzyTimeout) window.clearTimeout(tracker.dizzyTimeout)
    if (tracker.blockClickTimeout) window.clearTimeout(tracker.blockClickTimeout)
    if (roamTimeoutRef.current) window.clearTimeout(roamTimeoutRef.current)
    if (dropAnimationRef.current) window.cancelAnimationFrame(dropAnimationRef.current)
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

      <div
        className={`ai-launcher-rig ${isRoaming ? 'is-roaming' : ''}`}
        style={{ transform: `translate3d(${launcherOffset.x}px, ${launcherOffset.y}px, 0)` }}
      >
        <div className="ai-character-controls" aria-label="AI assistant controls">
          <button className="ai-character-action" type="button" onClick={handleBubbleClick} title="Chat" aria-label="Open chat">
            <ChatIcon />
          </button>
          <button
            className={`ai-character-action ai-walk-action ${isRoaming || launcherPhase === 'walking' ? 'is-active' : ''}`}
            type="button"
            onClick={handleRoamClick}
            title={isRoaming ? 'Roaming' : 'Walk'}
            aria-label={isRoaming ? 'Character is walking around' : 'Make character walk around'}
            disabled={isDizzy || launcherPhase === 'grabbed' || launcherPhase === 'falling'}
          >
            <WalkIcon />
          </button>
          <button
            className="ai-character-action"
            type="button"
            onClick={handleHomeControlClick}
            title="Home"
            aria-label="Return character home"
            disabled={launcherPhase === 'grabbed' || launcherPhase === 'falling'}
          >
            <HomeIcon />
          </button>
        </div>

        <button
          className={`ai-toggle ${launcherPhase === 'grabbed' ? 'is-grabbed' : ''} ${launcherPhase === 'falling' || launcherOffset.y < -8 ? 'is-lifted' : ''} ${launcherPhase === 'walking' ? 'is-walking-back' : ''}`}
          type="button"
          onClick={handleToggleClick}
          onPointerDown={handleLauncherPointerDown}
          onPointerMove={handleLauncherPointerMove}
          onPointerUp={handleLauncherPointerEnd}
          onPointerCancel={handleLauncherPointerEnd}
          onPointerLeave={handleLauncherPointerLeave}
          aria-label="Open AI assistant"
        >
          <AssistantMark
            isDizzy={isDizzy}
            isFloating={launcherPhase === 'grabbed' || launcherPhase === 'falling' || launcherOffset.y < -8}
            isWalking={launcherPhase === 'walking'}
            walkDirection={walkDirection}
          />
        </button>
      </div>
    </div>
  )
}

export default AiAssistant

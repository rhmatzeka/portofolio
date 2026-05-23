// @ts-nocheck
import { useEffect, useRef, useState } from 'react'
import killuaCard from '../assets/kiluaanimated/ezgif-frame-017.png'
import './Lanyard.css'

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

const getCordPath = ({ x, y }) => {
  const anchorX = 280
  const anchorY = 0
  const attachX = 280 + x
  const attachY = 292 + y
  const curvePull = clamp(x * 0.5, -90, 90)

  return `M ${anchorX} ${anchorY} C ${anchorX + curvePull} ${anchorY + 145}, ${attachX - curvePull} ${attachY - 145}, ${attachX} ${attachY}`
}

export default function Lanyard() {
  const frameRef = useRef(null)
  const dragStart = useRef(null)
  const positionRef = useRef({ x: 0, y: 0 })
  const velocityRef = useRef({ x: 0, y: 0 })
  const lastPointerRef = useRef(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)

  const syncPosition = (nextPosition) => {
    positionRef.current = nextPosition
    setPosition(nextPosition)
  }

  const stopSpring = () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }

  const startSpring = () => {
    stopSpring()

    let previousTime = performance.now()

    const tick = (time) => {
      const delta = Math.min((time - previousTime) / 16.67, 2)
      previousTime = time

      const current = positionRef.current
      const velocity = velocityRef.current
      const stiffness = 0.08
      const damping = 0.84

      velocity.x = (velocity.x - current.x * stiffness * delta) * damping
      velocity.y = (velocity.y - current.y * stiffness * delta) * damping

      const next = {
        x: current.x + velocity.x * delta,
        y: current.y + velocity.y * delta
      }

      syncPosition(next)

      if (Math.abs(next.x) > 0.35 || Math.abs(next.y) > 0.35 || Math.abs(velocity.x) > 0.35 || Math.abs(velocity.y) > 0.35) {
        frameRef.current = requestAnimationFrame(tick)
      } else {
        velocityRef.current = { x: 0, y: 0 }
        syncPosition({ x: 0, y: 0 })
        frameRef.current = null
      }
    }

    frameRef.current = requestAnimationFrame(tick)
  }

  const handlePointerDown = (event) => {
    stopSpring()
    event.currentTarget.setPointerCapture(event.pointerId)
    const now = performance.now()

    dragStart.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      x: positionRef.current.x,
      y: positionRef.current.y
    }
    lastPointerRef.current = {
      x: event.clientX,
      y: event.clientY,
      time: now
    }
    velocityRef.current = { x: 0, y: 0 }
    setDragging(true)
  }

  const handlePointerMove = (event) => {
    if (!dragStart.current) return

    const now = performance.now()
    const nextPosition = {
      x: clamp(dragStart.current.x + event.clientX - dragStart.current.pointerX, -260, 260),
      y: clamp(dragStart.current.y + event.clientY - dragStart.current.pointerY, -170, 230)
    }

    const lastPointer = lastPointerRef.current
    if (lastPointer) {
      const deltaTime = Math.max(now - lastPointer.time, 16)
      velocityRef.current = {
        x: clamp(((event.clientX - lastPointer.x) / deltaTime) * 10, -32, 32),
        y: clamp(((event.clientY - lastPointer.y) / deltaTime) * 10, -32, 32)
      }
    }

    lastPointerRef.current = {
      x: event.clientX,
      y: event.clientY,
      time: now
    }
    syncPosition(nextPosition)
  }

  const stopDragging = (event) => {
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    dragStart.current = null
    lastPointerRef.current = null
    setDragging(false)
    startSpring()
  }

  useEffect(() => () => stopSpring(), [])

  const tilt = clamp(position.x / 14, -16, 16)
  const cordPath = getCordPath(position)

  return (
    <div className="lanyard-wrapper">
      <div className={`lanyard-rig${dragging ? ' is-dragging' : ''}`}>
        <svg className="lanyard-cord-svg" viewBox="0 0 560 760" aria-hidden="true">
          <path className="lanyard-cord-shadow" d={cordPath} />
          <path className="lanyard-cord-main" d={cordPath} />
        </svg>

        <div className="lanyard-anchor" />

        <div
          className="lanyard-card-group"
          style={{
            '--lanyard-x': `${position.x}px`,
            '--lanyard-y': `${position.y}px`,
            '--lanyard-tilt': `${tilt}deg`
          }}
        >
          <div className="lanyard-clip" />
          <div className="lanyard-strap" />
          <div
            className="lanyard-card"
            role="img"
            aria-label="Killua lanyard card"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
          >
            <img src={killuaCard} alt="" draggable="false" />
            <div className="lanyard-card-shine" />
          </div>
        </div>
      </div>
    </div>
  )
}

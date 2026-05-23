// @ts-nocheck
import { useRef, useState } from 'react'
import killuaAvatar from '../assets/images/kiluatitle.png'
import './Lanyard.css'

export default function Lanyard() {
  const dragStart = useRef(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)

  const handlePointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    dragStart.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      x: offset.x,
      y: offset.y
    }
    setDragging(true)
  }

  const handlePointerMove = (event) => {
    if (!dragStart.current) return

    const nextX = dragStart.current.x + event.clientX - dragStart.current.pointerX
    const nextY = dragStart.current.y + event.clientY - dragStart.current.pointerY

    setOffset({
      x: Math.max(-260, Math.min(260, nextX)),
      y: Math.max(-180, Math.min(220, nextY))
    })
  }

  const stopDragging = (event) => {
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    dragStart.current = null
    setDragging(false)
  }

  return (
    <div className="lanyard-wrapper">
      <div
        className={`lanyard-rig${dragging ? ' is-dragging' : ''}`}
        style={{
          '--lanyard-x': `${offset.x}px`,
          '--lanyard-y': `${offset.y}px`
        }}
      >
        <div className="lanyard-loop" />
        <div className="lanyard-cord" />
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
          <div className="lanyard-card-glow" />
          <img src={killuaAvatar} alt="" draggable="false" />
        </div>
      </div>
    </div>
  )
}

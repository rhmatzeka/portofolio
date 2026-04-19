import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import './ScrollFrameScene.css'

const frameModules = import.meta.glob('../assets/kiluaanimated/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default'
})

const ScrollFrameScene = () => {
  const sectionRef = useRef(null)
  const rafRef = useRef(null)
  const progressRef = useRef(0)
  const lastScrollYRef = useRef(typeof window === 'undefined' ? 0 : window.scrollY)
  const [frameIndex, setFrameIndex] = useState(0)
  const [isReady, setIsReady] = useState(false)

  const frames = useMemo(() => (
    Object.entries(frameModules)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, src]) => src)
  ), [])

  useEffect(() => {
    if (!frames.length) return undefined

    frames.forEach((src) => {
      const image = new Image()
      image.src = src
    })
  }, [frames])

  useEffect(() => {
    if (!frames.length) return undefined

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const updateFrame = () => {
      rafRef.current = null
      if (!sectionRef.current) return

      if (reducedMotion.matches) {
        setFrameIndex(Math.floor(frames.length / 2))
        return
      }

      const rect = sectionRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight
      const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0)
      const visibleRatio = Math.max(visibleHeight, 0) / Math.min(rect.height, viewportHeight)
      const currentScrollY = window.scrollY
      const scrollDelta = currentScrollY - lastScrollYRef.current

      lastScrollYRef.current = currentScrollY

      if (rect.top > viewportHeight * 0.55) {
        progressRef.current = 0
      } else if (rect.bottom < viewportHeight * 0.45) {
        progressRef.current = frames.length - 1
      } else if (visibleRatio >= 0.5 && scrollDelta !== 0) {
        progressRef.current = Math.min(
          Math.max(progressRef.current + (scrollDelta / 18), 0),
          frames.length - 1
        )
      }

      const nextFrame = Math.round(progressRef.current)

      setFrameIndex((currentFrame) => (
        currentFrame === nextFrame ? currentFrame : nextFrame
      ))
    }

    const requestUpdate = () => {
      if (rafRef.current) return
      rafRef.current = window.requestAnimationFrame(updateFrame)
    }

    requestUpdate()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    const handleMotionChange = () => {
      if (reducedMotion.matches) {
        setFrameIndex(Math.floor(frames.length / 2))
      } else {
        requestUpdate()
      }
    }

    reducedMotion.addEventListener('change', handleMotionChange)

    return () => {
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      reducedMotion.removeEventListener('change', handleMotionChange)
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
    }
  }, [frames])

  if (!frames.length) return null

  return (
    <motion.div
      ref={sectionRef}
      className="scroll-frame-section"
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      aria-hidden="true"
    >
      <div className="scroll-frame-scene">
        <div className="scroll-frame-orbit" />
        <img
          src={frames[frameIndex]}
          alt=""
          className={`scroll-frame-image ${isReady ? 'is-ready' : ''}`}
          onLoad={() => setIsReady(true)}
          draggable="false"
        />
      </div>
    </motion.div>
  )
}

export default ScrollFrameScene

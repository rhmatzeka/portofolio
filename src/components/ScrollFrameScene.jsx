import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { KILUA_FRAME_ASPECT_RATIO, ensureKiluaFramesPreloaded } from '../utils/kiluaFrames'
import './ScrollFrameScene.css'

gsap.registerPlugin(ScrollTrigger)

const ScrollFrameScene = () => {
  const sectionRef = useRef(null)
  const imageRef = useRef(null)
  const lastFrameRef = useRef(-1)
  const [frames, setFrames] = useState([])
  const [frameIndex, setFrameIndex] = useState(0)

  useEffect(() => {
    let isCancelled = false

    const loadFrames = async () => {
      const sources = await ensureKiluaFramesPreloaded()
      if (isCancelled) return
      lastFrameRef.current = -1
      setFrameIndex(0)
      setFrames(sources)
    }

    loadFrames()

    return () => {
      isCancelled = true
    }
  }, [])

  useEffect(() => {
    if (!frames.length) return undefined
    if (!sectionRef.current || !imageRef.current) return undefined

    const updateFrame = (progress) => {
      const nextFrame = Math.round(progress * (frames.length - 1))
      if (lastFrameRef.current !== nextFrame) {
        lastFrameRef.current = nextFrame
        imageRef.current.src = frames[nextFrame]
        setFrameIndex(nextFrame)
      }
    }

    updateFrame(0)

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 50%',
      end: 'bottom 35%',
      scrub: 0.16,
      invalidateOnRefresh: true,
      onUpdate: (self) => updateFrame(self.progress),
      onRefresh: (self) => updateFrame(self.progress)
    })

    ScrollTrigger.refresh()

    return () => {
      trigger.kill()
    }
  }, [frames])

  return (
    <div
      ref={sectionRef}
      className="scroll-frame-section"
      style={{ '--frame-aspect-ratio': KILUA_FRAME_ASPECT_RATIO }}
      aria-hidden="true"
    >
      <div className="scroll-frame-scene">
        <div className="scroll-frame-orbit" />
        {frames.length > 0 && (
          <img
            ref={imageRef}
            src={frames[frameIndex]}
            alt=""
            className="scroll-frame-image is-ready"
            draggable="false"
          />
        )}
      </div>
    </div>
  )
}

export default ScrollFrameScene

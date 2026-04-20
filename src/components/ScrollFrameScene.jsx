import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './ScrollFrameScene.css'

gsap.registerPlugin(ScrollTrigger)

const frameModules = import.meta.glob('../assets/kiluaanimated/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default'
})

const ScrollFrameScene = () => {
  const sectionRef = useRef(null)
  const imageRef = useRef(null)
  const lastFrameRef = useRef(-1)
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

  if (!frames.length) return null

  return (
    <div
      ref={sectionRef}
      className="scroll-frame-section"
      aria-hidden="true"
    >
      <div className="scroll-frame-scene">
        <div className="scroll-frame-orbit" />
        <img
          ref={imageRef}
          src={frames[frameIndex]}
          alt=""
          className={`scroll-frame-image ${isReady ? 'is-ready' : ''}`}
          onLoad={() => setIsReady(true)}
          draggable="false"
        />
      </div>
    </div>
  )
}

export default ScrollFrameScene

import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './ScrollFrameScene.css'

gsap.registerPlugin(ScrollTrigger)

const frameModules = import.meta.glob('../assets/kiluaanimated/*.jpg', {
  query: '?url',
  import: 'default'
})

const ScrollFrameScene = () => {
  const sectionRef = useRef(null)
  const imageRef = useRef(null)
  const lastFrameRef = useRef(-1)
  const hasLoadedFramesRef = useRef(false)
  const [frames, setFrames] = useState([])
  const [frameIndex, setFrameIndex] = useState(0)
  const [isReady, setIsReady] = useState(false)

  const frameLoaders = useMemo(() => (
    Object.entries(frameModules)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, loadFrame]) => loadFrame)
  ), [])

  useEffect(() => {
    if (!sectionRef.current || hasLoadedFramesRef.current) return undefined

    const loadFrames = async () => {
      if (hasLoadedFramesRef.current) return
      hasLoadedFramesRef.current = true
      const sources = await Promise.all(frameLoaders.map((loadFrame) => loadFrame()))
      setFrames(sources)
    }

    if (!('IntersectionObserver' in window)) {
      loadFrames()
      return undefined
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadFrames()
        observer.disconnect()
      }
    }, {
      rootMargin: '420px 0px'
    })

    observer.observe(sectionRef.current)

    return () => observer.disconnect()
  }, [frameLoaders])

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
      aria-hidden="true"
    >
      {frames.length > 0 && (
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
      )}
    </div>
  )
}

export default ScrollFrameScene

import { useState, useEffect, lazy, Suspense } from 'react'
import Hero from './components/Hero'
import Navbar from './components/Navbar'
import Loading from './components/Loading'
import './App.css'

// Lazy load components that are below the fold
const About = lazy(() => import('./components/About'))
const Cases = lazy(() => import('./components/Cases'))
const Contact = lazy(() => import('./components/Contact'))
const Footer = lazy(() => import('./components/Footer'))
const AiAssistant = lazy(() => import('./components/AiAssistant'))

function App() {
  const [pageLoading, setPageLoading] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showSpline, setShowSpline] = useState(false)
  const [showAssistant, setShowAssistant] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false)
    }, 320)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const desktop = window.matchMedia('(min-width: 769px)')

    const scheduleSpline = () => {
      setShowSpline(false)

      const saveData = navigator.connection?.saveData
      if (reducedMotion.matches || !desktop.matches || saveData) return undefined

      const load = () => setShowSpline(true)
      const timeout = 1600
      const idleId = 'requestIdleCallback' in window
        ? window.requestIdleCallback(load, { timeout })
        : window.setTimeout(load, timeout)

      return () => {
        if ('cancelIdleCallback' in window) {
          window.cancelIdleCallback(idleId)
        } else {
          window.clearTimeout(idleId)
        }
      }
    }

    let cancelLoad = scheduleSpline()
    const handleChange = () => {
      if (cancelLoad) cancelLoad()
      cancelLoad = scheduleSpline()
    }

    desktop.addEventListener('change', handleChange)
    reducedMotion.addEventListener('change', handleChange)

    return () => {
      if (cancelLoad) cancelLoad()
      desktop.removeEventListener('change', handleChange)
      reducedMotion.removeEventListener('change', handleChange)
    }
  }, [])

  useEffect(() => {
    let didMount = false
    const mountAssistant = () => {
      if (didMount) return
      didMount = true
      setShowAssistant(true)
    }
    const idleId = 'requestIdleCallback' in window
      ? window.requestIdleCallback(mountAssistant, { timeout: 2600 })
      : window.setTimeout(mountAssistant, 2600)
    const events = ['pointerdown', 'keydown', 'touchstart']

    events.forEach((eventName) => {
      window.addEventListener(eventName, mountAssistant, { once: true, passive: true })
    })

    return () => {
      if ('cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId)
      } else {
        window.clearTimeout(idleId)
      }
      events.forEach((eventName) => {
        window.removeEventListener(eventName, mountAssistant)
      })
    }
  }, [])

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      const elements = Array.from(document.querySelectorAll('.reveal-on-scroll'))
      elements.forEach((element) => element.classList.add('is-visible'))
      return undefined
    }

    const watchedElements = new WeakSet()
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -10% 0px'
    })

    const watchRevealElements = () => {
      document.querySelectorAll('.reveal-on-scroll').forEach((element) => {
        if (watchedElements.has(element)) return
        watchedElements.add(element)
        observer.observe(element)
      })
    }

    watchRevealElements()
    const mutationObserver = new MutationObserver(watchRevealElements)
    mutationObserver.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mutationObserver.disconnect()
    }
  }, [pageLoading])

  useEffect(() => {
    let rafId = null

    const handleScroll = () => {
      if (rafId) return
      rafId = window.requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 80)
        rafId = null
      })
    }

    setIsScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div className="app">
      {pageLoading && <Loading />}
      
      <Navbar isScrolled={isScrolled} />
      
      <div className="page-container">
        <section id="home" className="full-section hero-section">
          {showSpline && (
            <iframe
              src="https://my.spline.design/boxeshover-Lw87Wz6KymIMZ7hVhu7wmUyQ/"
              frameBorder="0"
              className="spline-iframe"
              allow="fullscreen"
              loading="lazy"
              title="3D Background Animation"
            />
          )}
          <div className="section-content reveal-on-scroll">
            <Hero />
          </div>
        </section>
        
        <Suspense fallback={<div className="loading-section">Loading...</div>}>
          <section id="about" className="full-section">
            <div className="section-content reveal-on-scroll">
              <About />
            </div>
          </section>
          
          <section id="projects" className="full-section">
            <div className="section-content reveal-on-scroll">
              <Cases />
            </div>
          </section>
          
          <section id="contact" className="full-section">
            <div className="section-content reveal-on-scroll">
              <Contact />
            </div>
          </section>
          
          <Footer />
        </Suspense>
      </div>

      {showAssistant && (
        <Suspense fallback={null}>
          <AiAssistant />
        </Suspense>
      )}
    </div>
  )
}

export default App

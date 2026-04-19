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

function App() {
  const [pageLoading, setPageLoading] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showSpline, setShowSpline] = useState(false)

  useEffect(() => {
    // Simulate initial page load
    const timer = setTimeout(() => {
      setPageLoading(false)
    }, 700)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const desktop = window.matchMedia('(min-width: 769px)')

    const scheduleSpline = () => {
      setShowSpline(false)

      if (reducedMotion.matches) return undefined

      const load = () => setShowSpline(true)
      const timeout = desktop.matches ? 1200 : 800
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
          <div className="section-content">
            <Hero />
          </div>
        </section>
        
        <Suspense fallback={<div className="loading-section">Loading...</div>}>
          <section id="about" className="full-section">
            <div className="section-content">
              <About />
            </div>
          </section>
          
          <section id="projects" className="full-section">
            <div className="section-content">
              <Cases />
            </div>
          </section>
          
          <section id="contact" className="full-section">
            <div className="section-content">
              <Contact />
            </div>
          </section>
          
          <Footer />
        </Suspense>
      </div>
    </div>
  )
}

export default App

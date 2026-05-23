// @ts-nocheck
import { useState, useEffect, lazy, Suspense } from 'react'
import Hero from './components/Hero'
import Navbar from './components/Navbar'
import Loading from './components/Loading'
import { getAdminContent } from './utils/portfolioContent'
import './App.css'

// Lazy load components that are below the fold
const AdminPage = lazy(() => import('./components/AdminPage'))
const About = lazy(() => import('./components/About'))
const Cases = lazy(() => import('./components/Cases'))
const Certificates = lazy(() => import('./components/Certificates'))
const Contact = lazy(() => import('./components/Contact'))
const Footer = lazy(() => import('./components/Footer'))
const AiAssistant = lazy(() => import('./components/AiAssistant'))

const getProjectOrder = (project, fallbackIndex = 0) => {
  const order = Number(project?.order)
  return Number.isFinite(order) && order > 0 ? order : fallbackIndex + 1
}

const sortPortfolioProjects = (projects = []) => (
  [...projects].sort((firstProject, secondProject) => {
    const firstOrder = getProjectOrder(firstProject, projects.indexOf(firstProject))
    const secondOrder = getProjectOrder(secondProject, projects.indexOf(secondProject))
    if (firstOrder !== secondOrder) return firstOrder - secondOrder
    return String(firstProject.title || '').localeCompare(String(secondProject.title || ''))
  })
)

function App() {
  const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')
  const [pageLoading, setPageLoading] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showSpline, setShowSpline] = useState(false)
  const [showAssistant, setShowAssistant] = useState(false)
  const [adminContent, setAdminContent] = useState({ projects: [], certificates: [] })

  useEffect(() => {
    if (isAdminRoute) return undefined

    let isMounted = true
    getAdminContent()
      .then((content) => {
        if (isMounted) setAdminContent(content)
      })
      .catch(() => undefined)

    return () => {
      isMounted = false
    }
  }, [isAdminRoute])

  useEffect(() => {
    if (isAdminRoute) {
      setPageLoading(false)
      return undefined
    }

    let isMounted = true
    const minimumDelay = new Promise((resolve) => window.setTimeout(resolve, 320))

    minimumDelay.then(() => {
      if (isMounted) setPageLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [isAdminRoute])

  useEffect(() => {
    if (isAdminRoute) return undefined

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
  }, [isAdminRoute])

  useEffect(() => {
    if (isAdminRoute) return undefined

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
  }, [isAdminRoute])

  useEffect(() => {
    if (isAdminRoute) return undefined

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
  }, [pageLoading, isAdminRoute])

  useEffect(() => {
    if (isAdminRoute) return undefined

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
  }, [isAdminRoute])

  if (isAdminRoute) {
    return (
      <Suspense fallback={<div className="loading-section">Loading...</div>}>
        <AdminPage />
      </Suspense>
    )
  }

  const portfolioProjects = sortPortfolioProjects(adminContent.projects)
  const hasProjects = portfolioProjects.length > 0
  const hasCertificates = adminContent.certificates.length > 0

  return (
    <div className="app">
      {pageLoading && <Loading />}
      
      <Navbar isScrolled={isScrolled} hasProjects={hasProjects} />
      
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
            <Hero hasProjects={hasProjects} />
          </div>
        </section>
        
        <Suspense fallback={<div className="loading-section">Loading...</div>}>
          <section id="about" className="full-section">
            <div className="section-content reveal-on-scroll">
              <About />
            </div>
          </section>
          
          {hasProjects && (
            <section id="projects" className="full-section">
              <div className="section-content reveal-on-scroll">
                <Cases projects={portfolioProjects} />
              </div>
            </section>
          )}

          {hasCertificates && (
            <section id="certificates" className="full-section">
              <div className="section-content reveal-on-scroll">
                <Certificates certificates={adminContent.certificates} />
              </div>
            </section>
          )}
          
          <section id="contact" className="full-section">
            <div className="section-content reveal-on-scroll">
              <Contact />
            </div>
          </section>
          
          <Footer hasProjects={hasProjects} />
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

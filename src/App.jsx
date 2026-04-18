import { useState, useEffect, lazy, Suspense } from 'react'
import Hero from './components/Hero'
import Navbar from './components/Navbar'
import './App.css'

// Lazy load components that are below the fold
const About = lazy(() => import('./components/About'))
const Cases = lazy(() => import('./components/Cases'))
const Contact = lazy(() => import('./components/Contact'))
const Footer = lazy(() => import('./components/Footer'))

function App() {
  const [loading, setLoading] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    let ticking = false
    let lastScrollY = 0
    
    const handleScroll = () => {
      const scrollY = window.scrollY
      
      // Only update if scroll position changed significantly (reduces re-renders)
      if (Math.abs(scrollY - lastScrollY) < 10) return
      
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(scrollY > 100)
          lastScrollY = scrollY
          ticking = false
        })
        ticking = true
      }
    }

    // Check on mount
    setIsScrolled(window.scrollY > 100)

    // Add listener with passive for better performance
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="app">
      <Navbar isScrolled={isScrolled} />
      
      <div className="page-container">
        <section id="home" className="full-section hero-section">
          <iframe 
            src='https://my.spline.design/boxeshover-Lw87Wz6KymIMZ7hVhu7wmUyQ/' 
            frameBorder='0' 
            className="spline-iframe"
            onLoad={() => setLoading(false)}
            allow="fullscreen"
            loading="lazy"
            title="3D Background Animation"
          />
          {loading && (
            <div className="loading">
              <p>Loading 3D Scene...</p>
            </div>
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

import { useState, useEffect } from 'react'
import Hero from './components/Hero'
import About from './components/About'
import Cases from './components/Cases'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import './App.css'

function App() {
  const [loading, setLoading] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      console.log('Scroll Y:', scrollPosition)
      
      if (scrollPosition > 100) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    // Check on mount
    handleScroll()

    // Add listener
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
      </div>
      
      <Footer />
    </div>
  )
}

export default App

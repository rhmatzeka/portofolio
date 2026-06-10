// @ts-nocheck
import { motion } from 'framer-motion'
import { memo } from 'react'
import './Hero.css'

const containerVariants = {
  initial: { opacity: 0 },
  in: { 
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 }
  },
  out: { opacity: 0, transition: { duration: 0.3 } }
}

const itemLeft = {
  initial: { opacity: 0, y: 34, scale: 0.98 },
  in: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.72, ease: [0.16, 1, 0.3, 1] } }
}

const itemRight = {
  initial: { opacity: 0, y: 26, scale: 0.98 },
  in: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.68, ease: [0.16, 1, 0.3, 1] } }
}

const Hero = memo(({ hasProjects = true }) => {
  return (
    <motion.div 
      className="hero-wrapper"
      variants={containerVariants}
      initial="initial"
      animate="in"
      exit="out"
    >
      <div className="hero-left">
        <motion.h1 variants={itemLeft} className="hero-title">
          Hi, I'm <span className="gradient-text">Rahmat</span><br/>
          Eka Satria
        </motion.h1>
        
        <motion.div variants={itemLeft} className="hero-tags">
          <span className="tag">WEB3 DEVELOPER</span> <span className="sep">\</span>
          <span className="tag">UI/UX</span>
        </motion.div>
      </div>

      <div className="hero-right">
        <motion.div variants={itemRight} className="hero-actions">
          {hasProjects && <a href="#projects" className="btn-ghost">View Projects</a>}
          <a
            href="https://cv.rahmateka.my.id"
            className="btn-glow"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Rahmat Eka Satria CV"
          >
            View CV
            <span className="cv-circle" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"></path>
                <path d="M14 3v5h5"></path>
                <path d="M9 15h4"></path>
                <path d="M9 11h2"></path>
                <path d="M15 14.5 18 12l-3-2.5"></path>
              </svg>
            </span>
          </a>
        </motion.div>
      </div>
    </motion.div>
  )
})

Hero.displayName = 'Hero'

export default Hero

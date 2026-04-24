import { motion } from 'framer-motion'
import { memo } from 'react'
import LivePresence from './LivePresence'
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

const Hero = memo(() => {
  return (
    <motion.div 
      className="hero-wrapper"
      variants={containerVariants}
      initial="initial"
      animate="in"
      exit="out"
    >
      <div className="hero-left">
        <motion.div variants={itemLeft} className="hero-presence">
          <LivePresence />
        </motion.div>

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
          <a href="#projects" className="btn-ghost">View Projects</a>
          <a href="#contact" className="btn-glow">
            Let's Talk
            <span className="plus-circle">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
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

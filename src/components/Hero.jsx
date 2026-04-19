import { motion } from 'framer-motion'
import { memo } from 'react'
import './Hero.css'

const containerVariants = {
  initial: { opacity: 0 },
  in: { 
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  },
  out: { opacity: 0, transition: { duration: 0.3 } }
}

const itemLeft = {
  initial: { opacity: 0, x: -50 },
  in: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
}

const itemRight = {
  initial: { opacity: 0, x: 50 },
  in: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
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
        <motion.h1 variants={itemLeft} className="hero-title">
          Hi, I'm <span className="gradient-text">Rahmat</span><br/>
          Eka Satria
        </motion.h1>
        
        <motion.div variants={itemLeft} className="hero-tags">
          <span className="tag">BLOCKCHAIN</span> <span className="sep">\</span>
          <span className="tag">WEB DEV</span> <span className="sep">\</span>
          <span className="tag">UI/UX</span> <span className="sep">\</span>
          <span className="tag">AI</span>
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

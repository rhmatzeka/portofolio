import { motion } from 'framer-motion'
import './Cases.css'

const containerVariants = {
  initial: { opacity: 0 },
  in: { 
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  },
  out: { opacity: 0, transition: { duration: 0.3 } }
}

const itemUp = {
  initial: { opacity: 0, y: 30 },
  in: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const projects = [
  { 
    id: 1, 
    title: 'NeoBank UI', 
    tech: 'REACT \\ 3D', 
    desc: 'A futuristic banking interface with interactive 3D elements bridging finance and modern design.',
    stack: ['React', 'Three.js', 'Framer Motion'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    github: '#',
    demo: '#'
  },
  { 
    id: 2, 
    title: 'Web3 Marketplace', 
    tech: 'NEXTJS \\ ETH', 
    desc: 'A decentralized platform for trading digital assets effortlessly with secure smart contracts.',
    stack: ['Next.js', 'Solidity', 'Ethers.js'],
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80',
    github: '#',
    demo: '#'
  },
  { 
    id: 3, 
    title: 'Motion Agency', 
    tech: 'FRAMER \\ GSAP', 
    desc: 'Award-winning landing page featuring complex physics animations and interactive storytelling.',
    stack: ['React', 'GSAP', 'Tailwind'],
    image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&q=80',
    github: '#',
    demo: '#'
  },
  { 
    id: 4, 
    title: 'DeFi Dashboard', 
    tech: 'REACT \\ WEB3', 
    desc: 'Real-time crypto portfolio tracker with advanced analytics and multi-chain support.',
    stack: ['React', 'Web3.js', 'Chart.js'],
    image: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&q=80',
    github: '#',
    demo: '#'
  }
]

const Cases = () => {
  return (
    <motion.div 
      className="cases-container"
      variants={containerVariants}
      initial="initial"
      whileInView="in"
      viewport={{ once: true, amount: 0.3 }}
      exit="out"
    >
      <div className="cases-header">
        <motion.h1 variants={itemUp} className="section-title">Projects</motion.h1>
        <motion.p variants={itemUp} className="section-subtitle">A glimpse into my recent digital experiences.</motion.p>
      </div>

      <motion.div className="cases-grid" variants={containerVariants}>
        {projects.map((project) => (
          <motion.div key={project.id} className="case-card" variants={itemUp}>
            <div className="case-image">
              <img src={project.image} alt={project.title} />
              <div className="case-overlay"></div>
            </div>
            
            <div className="case-card-content">
              <div className="case-header-section">
                <h3>{project.title}</h3>
                <span className="case-tech">{project.tech}</span>
              </div>
              
              <p>{project.desc}</p>
              
              <div className="case-stack">
                {project.stack.map((tech, idx) => (
                  <span key={idx} className="stack-badge">{tech}</span>
                ))}
              </div>
              
              <div className="case-links">
                <a href={project.github} className="case-link-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                  </svg>
                  Code
                </a>
                <a href={project.demo} className="case-link-btn primary">
                  Live Demo
                  <span className="arrow">↗</span>
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={itemUp} className="view-all-container">
        <a href="#" className="view-all-btn">
          View All Projects
          <span className="arrow">→</span>
        </a>
      </motion.div>
    </motion.div>
  )
}

export default Cases

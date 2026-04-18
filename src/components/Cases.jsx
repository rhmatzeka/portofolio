import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
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

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    transition: { duration: 0.2 }
  }
}

const projects = [
  { 
    id: 1, 
    title: 'NationChain', 
    tech: 'BLOCKCHAIN \\ WEB3', 
    desc: 'A decentralized blockchain platform for national identity and governance systems with secure smart contracts.',
    fullDesc: 'NationChain is a comprehensive blockchain solution designed for national-level identity management and governance. Built with Solidity smart contracts, it provides secure, transparent, and immutable record-keeping for government services. The platform features decentralized identity verification, voting systems, and document management with end-to-end encryption.',
    stack: ['Solidity', 'Web3.js', 'React'],
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80',
    github: 'https://github.com/rhmatzeka/nationchain',
    demo: '#'
  },
  { 
    id: 2, 
    title: 'Mobile Wallet Ethereum', 
    tech: 'MOBILE \\ ETH', 
    desc: 'Mobile cryptocurrency wallet app for Ethereum with secure transaction management and multi-chain support.',
    fullDesc: 'A feature-rich mobile wallet application built with React Native for managing Ethereum and ERC-20 tokens. Includes biometric authentication, QR code scanning, transaction history, real-time price tracking, and support for multiple networks including mainnet and testnets. Implements secure key storage using device encryption.',
    stack: ['React Native', 'Ethers.js', 'TypeScript'],
    image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&q=80',
    github: 'https://github.com/rhmatzeka/MobileAppsWalletEthereum',
    demo: '#'
  },
  { 
    id: 3, 
    title: 'KPBanbuk Store', 
    tech: 'FULLSTACK \\ ECOMMERCE', 
    desc: 'Modern e-commerce platform with inventory management, payment gateway integration, and admin dashboard.',
    fullDesc: 'Full-stack e-commerce solution built with Next.js and Node.js. Features include product catalog with search and filters, shopping cart, secure checkout with multiple payment options, order tracking, inventory management, and comprehensive admin dashboard with analytics. Optimized for SEO and performance.',
    stack: ['Next.js', 'Node.js', 'PostgreSQL'],
    image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80',
    github: 'https://github.com/rhmatzeka/KPBanbukStore',
    demo: '#'
  },
  { 
    id: 4, 
    title: 'CVBanbuk Store', 
    tech: 'WEB \\ ECOMMERCE', 
    desc: 'Company profile and online store for CVBanbuk with product catalog and order management system.',
    fullDesc: 'Corporate website and e-commerce platform for CVBanbuk company. Combines company profile, product showcase, and online ordering system. Built with React frontend and PHP backend with MySQL database. Features responsive design, product categories, customer reviews, and admin panel for content management.',
    stack: ['React', 'MySQL', 'PHP'],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    github: 'https://github.com/rhmatzeka/CVBanbukStore',
    demo: '#'
  }
]

const Cases = () => {
  const [selectedProject, setSelectedProject] = useState(null)

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [selectedProject])

  return (
    <>
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
            <motion.div 
              key={project.id} 
              className="case-card" 
              variants={itemUp}
              onClick={() => setSelectedProject(project)}
            >
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
                  <a 
                    href={project.github} 
                    className="case-link-btn"
                    onClick={(e) => e.stopPropagation()}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                    </svg>
                    Code
                  </a>
                  <a 
                    href={project.demo} 
                    className="case-link-btn primary"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Live Demo
                    <span className="arrow">↗</span>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={itemUp} className="view-all-container">
          <a href="https://github.com/rhmatzeka" target="_blank" rel="noopener noreferrer" className="view-all-btn">
            View All Projects
            <span className="arrow">→</span>
          </a>
        </motion.div>
      </motion.div>

      {/* Project Detail Modal */}
      {selectedProject && createPortal(
        <AnimatePresence>
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
          >
            <motion.div 
              className="modal-content"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setSelectedProject(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              <div className="modal-image">
                <img src={selectedProject.image} alt={selectedProject.title} />
              </div>

              <div className="modal-body">
                <span className="modal-tech">{selectedProject.tech}</span>
                <h2 className="modal-title">{selectedProject.title}</h2>
                <p className="modal-description">{selectedProject.fullDesc}</p>

                <div className="modal-stack">
                  <h3>Tech Stack</h3>
                  <div className="modal-stack-tags">
                    {selectedProject.stack.map((tech, idx) => (
                      <span key={idx} className="modal-stack-badge">{tech}</span>
                    ))}
                  </div>
                </div>

                <div className="modal-actions">
                  <a 
                    href={selectedProject.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="modal-btn"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                    </svg>
                    View on GitHub
                  </a>
                  <a 
                    href={selectedProject.demo}
                    className="modal-btn primary"
                  >
                    Live Demo
                    <span className="arrow">↗</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}

export default Cases

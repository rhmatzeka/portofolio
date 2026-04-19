import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, memo } from 'react'
import { createPortal } from 'react-dom'
import nationchainImage from '../assets/images/nationchain-preview.jpg'
import walletEthereumImage from '../assets/images/WalletEthereum.jpeg'
import simRestoImage from '../assets/images/arjiresto-preview.jpg'
import banbukStoreImage from '../assets/images/banbukstore-preview.jpg'
import './Cases.css'

const containerVariants = {
  initial: { opacity: 0 },
  in: { 
    opacity: 1,
    transition: { staggerChildren: 0.14, delayChildren: 0.12 }
  },
  out: { opacity: 0, transition: { duration: 0.3 } }
}

const itemUp = {
  initial: { opacity: 0, y: 44, scale: 0.96, filter: 'blur(8px)' },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.72, ease: [0.16, 1, 0.3, 1] }
  }
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 24, filter: 'blur(8px)' },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.36, ease: [0.16, 1, 0.3, 1] }
  },
  exit: { 
    opacity: 0, 
    scale: 0.96,
    y: 16,
    filter: 'blur(6px)',
    transition: { duration: 0.2 }
  }
}

const stackIcons = {
  CSS: 'https://cdn.simpleicons.org/css/663399',
  Ethers: 'https://cdn.simpleicons.org/ethereum/627EEA',
  'Ethers.js': 'https://cdn.simpleicons.org/ethereum/627EEA',
  JavaScript: 'https://cdn.simpleicons.org/javascript/F7DF1E',
  MySQL: 'https://cdn.simpleicons.org/mysql/4479A1',
  PHP: 'https://cdn.simpleicons.org/php/777BB4',
  React: 'https://cdn.simpleicons.org/react/61DAFB',
  'React Native': 'https://cdn.simpleicons.org/react/61DAFB',
  Solidity: 'https://cdn.simpleicons.org/solidity/FFFFFF',
  TypeScript: 'https://cdn.simpleicons.org/typescript/3178C6',
  'Web3.js': 'https://cdn.simpleicons.org/web3dotjs/F16822'
}

const StackBadge = ({ tech, className = '' }) => (
  <span className={`stack-badge ${className}`}>
    {stackIcons[tech] && (
      <span className="stack-badge-icon">
        <img src={stackIcons[tech]} alt="" loading="lazy" />
      </span>
    )}
    {tech}
  </span>
)

const projects = [
  { 
    id: 1, 
    title: 'NationChain', 
    tech: 'BLOCKCHAIN \\ WEB3', 
    desc: 'A decentralized blockchain platform for national identity and governance systems with secure smart contracts.',
    fullDesc: 'NationChain is a comprehensive blockchain solution designed for national-level identity management and governance. Built with Solidity smart contracts, it provides secure, transparent, and immutable record-keeping for government services. The platform features decentralized identity verification, voting systems, and document management with end-to-end encryption.',
    stack: ['Solidity', 'Web3.js', 'React'],
    image: nationchainImage,
    imageVariant: 'desktop-shot',
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
    image: walletEthereumImage,
    imageVariant: 'phone-shot',
    github: 'https://github.com/rhmatzeka/MobileAppsWalletEthereum',
    demo: '#'
  },
  { 
    id: 3, 
    title: 'Arji Resto', 
    tech: 'WEB \\ RESTAURANT', 
    desc: 'Restaurant website with menu browsing, location info, contact flow, and reservation-focused landing experience.',
    fullDesc: 'Arji Resto is a modern restaurant website designed to showcase food and beverage offerings with a clean landing page, menu navigation, location details, contact access, and reservation entry points. The interface focuses on strong food visuals, simple navigation, and a polished customer-facing experience.',
    stack: ['React', 'CSS', 'JavaScript'],
    image: simRestoImage,
    imageVariant: 'desktop-shot',
    github: 'https://github.com/rhmatzeka/SIMResto.git',
    demo: '#'
  },
  { 
    id: 4, 
    title: 'Banbuk Store', 
    tech: 'WEB \\ CATALOG', 
    desc: 'Product catalog platform for CV Banbuk Mandiri Jaya with inquiry and payment-ready customer flow.',
    fullDesc: 'Banbuk Store is a company profile and product catalog platform for CV Banbuk Mandiri Jaya. It presents the business with a polished landing page, catalog browsing flow, inquiry entry points, and payment-ready interactions for a professional customer experience.',
    stack: ['React', 'MySQL', 'PHP'],
    image: banbukStoreImage,
    imageVariant: 'desktop-shot',
    github: 'https://github.com/rhmatzeka/CVBanbukStore',
    demo: '#'
  }
]

const ProjectCard = memo(({ project, onClick }) => (
  <motion.div 
    className="case-card" 
    variants={itemUp}
    onClick={onClick}
  >
    <div className={`case-image ${project.imageVariant || ''}`}>
      <img
        src={project.image}
        alt=""
        className="case-image-backdrop"
        aria-hidden="true"
        loading="lazy"
        decoding="async"
      />
      <img 
        src={project.image} 
        alt={project.title}
        className="case-image-main"
        loading="lazy"
        decoding="async"
      />
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
          <StackBadge key={idx} tech={tech} />
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
))

ProjectCard.displayName = 'ProjectCard'

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
        animate="in"
        exit="out"
      >
        <div className="cases-header">
          <motion.h1 variants={itemUp} className="section-title">Projects</motion.h1>
          <motion.p variants={itemUp} className="section-subtitle">A glimpse into my recent digital experiences.</motion.p>
        </div>

        <motion.div className="cases-grid" variants={containerVariants}>
          {projects.map((project) => (
            <ProjectCard 
              key={project.id}
              project={project}
              onClick={() => setSelectedProject(project)}
            />
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

              <div className={`modal-image ${selectedProject.imageVariant || ''}`}>
                <img
                  src={selectedProject.image}
                  alt=""
                  className="modal-image-backdrop"
                  aria-hidden="true"
                  loading="eager"
                  decoding="async"
                />
                <img 
                  src={selectedProject.image} 
                  alt={selectedProject.title}
                  className="modal-image-main"
                  loading="eager"
                  decoding="async"
                />
              </div>

              <div className="modal-body">
                <span className="modal-tech">{selectedProject.tech}</span>
                <h2 className="modal-title">{selectedProject.title}</h2>
                <p className="modal-description">{selectedProject.fullDesc}</p>

                <div className="modal-stack">
                  <h3>Tech Stack</h3>
                  <div className="modal-stack-tags">
                    {selectedProject.stack.map((tech, idx) => (
                      <StackBadge key={idx} tech={tech} className="modal-stack-badge" />
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

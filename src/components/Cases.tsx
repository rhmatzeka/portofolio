// @ts-nocheck
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, memo } from 'react'
import { createPortal } from 'react-dom'
import { getCanonicalStackName, getStackIcon } from '../data/projects'
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
  initial: { opacity: 0, y: 34, scale: 0.97 },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.62, ease: [0.16, 1, 0.3, 1] }
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

export const StackBadge = ({ tech, className = '' }) => (
  <span className={`stack-badge ${className}`}>
    {getStackIcon(tech) && (
      <span className="stack-badge-icon">
        <img src={getStackIcon(tech)} alt="" loading="lazy" />
      </span>
    )}
    {getCanonicalStackName(tech)}
  </span>
)

const getProjectMedia = (project) => ({
  type: project.mediaType === 'video' ? 'video' : 'image',
  url: project.mediaUrl || project.image || ''
})

const ProjectMedia = ({ project, context = 'card' }) => {
  const media = getProjectMedia(project)
  const isModal = context === 'modal'
  const [mediaFailed, setMediaFailed] = useState(false)

  useEffect(() => {
    setMediaFailed(false)
  }, [media.url])

  if (!media.url || mediaFailed) {
    return (
      <div className={`${context === 'modal' ? 'modal-image-placeholder' : 'case-image-placeholder'}`}>
        <span>{project.title?.slice(0, 1) || 'P'}</span>
      </div>
    )
  }

  if (media.type === 'video') {
    return (
      <>
        <video
          src={media.url}
          className={`${context === 'modal' ? 'modal-image-backdrop' : 'case-image-backdrop'} media-video`}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
        <video
          src={media.url}
          className={`${context === 'modal' ? 'modal-image-main' : 'case-image-main'} media-video`}
          controls={isModal}
          muted={!isModal}
          loop={!isModal}
          playsInline
          preload={isModal ? 'metadata' : 'none'}
          aria-label={`${project.title} video preview`}
          onError={() => setMediaFailed(true)}
        />
        {!isModal && <span className="case-media-badge">Video</span>}
      </>
    )
  }

  return (
    <>
      <img
        src={media.url}
        alt=""
        className={context === 'modal' ? 'modal-image-backdrop' : 'case-image-backdrop'}
        aria-hidden="true"
        loading={isModal ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => setMediaFailed(true)}
      />
      <img
        src={media.url}
        alt={project.title}
        className={context === 'modal' ? 'modal-image-main' : 'case-image-main'}
        loading={isModal ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => setMediaFailed(true)}
      />
      {String(media.url).toLowerCase().includes('.gif') && !isModal && (
        <span className="case-media-badge">GIF</span>
      )}
    </>
  )
}

export const ProjectCard = memo(({ project, onClick }) => (
  <motion.div
    className="case-card"
    variants={itemUp}
    onClick={onClick}
  >
    <div className={`case-image ${project.imageVariant || ''}`}>
      <ProjectMedia project={project} />
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
        {project.github && project.github !== '#' && (
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
        )}
        {project.demo && project.demo !== '#' && (
          <a
            href={project.demo}
            className="case-link-btn primary"
            onClick={(e) => e.stopPropagation()}
            target="_blank"
            rel="noopener noreferrer"
          >
            Live Demo
            <span className="arrow">↗</span>
          </a>
        )}
      </div>
    </div>
  </motion.div>
))

ProjectCard.displayName = 'ProjectCard'

const Cases = ({ projects = [] }) => {
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

  const handleViewAll = (e) => {
    e.preventDefault()
    window.history.pushState({}, '', '/projects')
    window.dispatchEvent(new Event('popstate'))
  }

  if (!projects.length) return null

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
          <a href="/projects" onClick={handleViewAll} className="view-all-btn">
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
                <ProjectMedia project={selectedProject} context="modal" />
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

                {((selectedProject.github && selectedProject.github !== '#') || (selectedProject.demo && selectedProject.demo !== '#')) && (
                  <div className="modal-actions">
                  {selectedProject.github && selectedProject.github !== '#' && (
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
                  )}
                  {selectedProject.demo && selectedProject.demo !== '#' && (
                    <a
                      href={selectedProject.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="modal-btn primary"
                    >
                      Live Demo
                      <span className="arrow">↗</span>
                    </a>
                  )}
                  </div>
                )}
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

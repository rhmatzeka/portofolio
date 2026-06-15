// @ts-nocheck
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { ProjectCard, StackBadge } from './Cases'
import './AllProjectsPage.css'

const containerVariants = {
  initial: { opacity: 0 },
  in: { 
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 }
  },
  out: { opacity: 0, transition: { duration: 0.25 } }
}

const itemUp = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
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

const getProjectMedia = (project) => ({
  type: project.mediaType === 'video' ? 'video' : 'image',
  url: project.mediaUrl || project.image || ''
})

const ProjectMediaModal = ({ project }) => {
  const media = getProjectMedia(project)
  const [mediaFailed, setMediaFailed] = useState(false)

  if (!media.url || mediaFailed) {
    return (
      <div className="modal-image-placeholder">
        <span>{project.title?.slice(0, 1) || 'P'}</span>
      </div>
    )
  }

  if (media.type === 'video') {
    return (
      <>
        <video
          src={media.url}
          className="modal-image-backdrop media-video"
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
        <video
          src={media.url}
          className="modal-image-main media-video"
          controls
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={`${project.title} video preview`}
          onError={() => setMediaFailed(true)}
        />
      </>
    )
  }

  return (
    <>
      <img
        src={media.url}
        alt=""
        className="modal-image-backdrop"
        aria-hidden="true"
        loading="eager"
        onError={() => setMediaFailed(true)}
      />
      <img
        src={media.url}
        alt={project.title}
        className="modal-image-main"
        loading="eager"
        onError={() => setMediaFailed(true)}
      />
    </>
  )
}

const AllProjectsPage = ({ projects = [] }) => {
  const [selectedProject, setSelectedProject] = useState(null)
  const [activeFilter, setActiveFilter] = useState('ALL')

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

  // Extract all categories dynamically and clean them
  const filters = ['ALL', ...new Set(projects.flatMap(p => {
    if (!p.tech) return []
    // Split "WEB3 \\ GAME" into ["WEB3", "GAME"] and trim
    return p.tech.split(/\\|\//).map(cat => cat.trim().toUpperCase())
  }))]

  const filteredProjects = activeFilter === 'ALL' 
    ? projects
    : projects.filter(p => {
        if (!p.tech) return false
        const projectCats = p.tech.split(/\\|\//).map(cat => cat.trim().toUpperCase())
        return projectCats.includes(activeFilter)
      })

  const handleBackToHome = (e) => {
    e.preventDefault()
    window.history.pushState({}, '', '/')
    window.dispatchEvent(new Event('popstate'))
  }

  return (
    <div className="all-projects-page">
      <div className="all-projects-background" />
      
      <div className="all-projects-container">
        {/* Navigation / Header */}
        <header className="all-projects-header">
          <a href="/" onClick={handleBackToHome} className="back-home-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Home
          </a>
          
          <h1 className="all-projects-title">All Works</h1>
          <p className="all-projects-subtitle">A complete archive of my web3, mobile, and full-stack development journey.</p>
        </header>

        {/* Categories Filter Pills */}
        <div className="filter-pills-container">
          {filters.map(filter => (
            <button
              key={filter}
              className={`filter-pill ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Grid of Projects */}
        <motion.div 
          className="all-projects-grid"
          variants={containerVariants}
          initial="initial"
          animate="in"
          key={activeFilter} // Re-animate when filter changes
        >
          {filteredProjects.map((project) => (
            <ProjectCard 
              key={project.id}
              project={project}
              onClick={() => setSelectedProject(project)}
            />
          ))}
        </motion.div>

        {filteredProjects.length === 0 && (
          <div className="no-projects-found">
            <p>No projects found in this category.</p>
          </div>
        )}
      </div>

      {/* Project Detail Modal (same logic as main page) */}
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
                <ProjectMediaModal project={selectedProject} />
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
    </div>
  )
}

export default AllProjectsPage

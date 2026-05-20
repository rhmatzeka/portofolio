import { useEffect, useMemo, useRef, useState } from 'react'
import { getCanonicalStackName, getStackIcon } from '../data/projects'
import { fileToDataUrl, getAdminContent, normalizeCsv } from '../utils/portfolioContent'
import './AdminPage.css'

const projectMediaAccept = 'image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,video/ogg'

const emptyProject = {
  order: '',
  title: '',
  tech: '',
  desc: '',
  fullDesc: '',
  stack: '',
  mediaType: 'image',
  mediaUrl: '',
  imageVariant: 'desktop-shot',
  github: '',
  demo: ''
}

const emptyCertificate = {
  title: '',
  issuer: '',
  issuedAt: '',
  description: '',
  skills: '',
  credentialUrl: '',
  imageUrl: ''
}

const getMediaTypeFromUrl = (value) => (
  /\.(mp4|webm|ogv|ogg)(?:[?#].*)?$/i.test(value) ? 'video' : 'image'
)

const getMediaTypeFromFile = (file) => (
  file?.type?.startsWith('video/') ? 'video' : 'image'
)

const getProjectOrder = (project, fallbackIndex = 0) => {
  const order = Number(project?.order)
  return Number.isFinite(order) && order > 0 ? order : fallbackIndex + 1
}

const sortProjects = (projects = []) => (
  [...projects].sort((firstProject, secondProject) => {
    const firstOrder = getProjectOrder(firstProject, projects.indexOf(firstProject))
    const secondOrder = getProjectOrder(secondProject, projects.indexOf(secondProject))
    if (firstOrder !== secondOrder) return firstOrder - secondOrder
    return String(firstProject.title || '').localeCompare(String(secondProject.title || ''))
  })
)

const AdminPage = () => {
  const [password, setPassword] = useState(() => sessionStorage.getItem('rahmat-admin-password') || '')
  const [loginPassword, setLoginPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(sessionStorage.getItem('rahmat-admin-password')))
  const [content, setContent] = useState({ projects: [], certificates: [] })
  const [activeTab, setActiveTab] = useState('projects')
  const [projectView, setProjectView] = useState('form')
  const [certificateView, setCertificateView] = useState('form')
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false)
  const [projectForm, setProjectForm] = useState(emptyProject)
  const [certificateForm, setCertificateForm] = useState(emptyCertificate)
  const [projectMedia, setProjectMedia] = useState(null)
  const [certificateImage, setCertificateImage] = useState(null)
  const [editingItem, setEditingItem] = useState({ collection: '', id: '' })
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isSaving, setIsSaving] = useState(false)
  const projectMediaInputRef = useRef(null)

  const sortedProjects = useMemo(() => sortProjects(content.projects), [content.projects])
  const certificates = useMemo(() => content.certificates || [], [content.certificates])
  const projectStackPreview = useMemo(() => (
    normalizeCsv(projectForm.stack).map((tech) => ({
      name: getCanonicalStackName(tech),
      icon: getStackIcon(tech)
    }))
  ), [projectForm.stack])

  useEffect(() => {
    if (!isAuthenticated) return undefined

    getAdminContent()
      .then(setContent)
      .catch(() => setStatus({ type: 'error', message: 'Failed to load admin content.' }))
  }, [isAuthenticated])

  const updateProjectField = (event) => {
    const { name, value } = event.target
    setProjectForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  const updateCertificateField = (event) => {
    const { name, value } = event.target
    setCertificateForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  const clearEditingItem = () => {
    setEditingItem({ collection: '', id: '' })
  }

  const resetProjectForm = () => {
    setProjectForm(emptyProject)
    clearProjectMedia()
    clearEditingItem()
  }

  const resetCertificateForm = () => {
    setCertificateForm(emptyCertificate)
    setCertificateImage(null)
    clearEditingItem()
  }

  const saveContent = async ({ collection, item }) => {
    if (!password.trim()) {
      setStatus({ type: 'error', message: 'ADMIN_PASSWORD is required.' })
      return null
    }

    setIsSaving(true)
    setStatus({ type: '', message: '' })

    try {
      const response = await fetch('/api/admin-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          collection,
          action: 'upsert',
          item
        })
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error || 'Failed to save content.')

      sessionStorage.setItem('rahmat-admin-password', password)
      setContent(data)
      setStatus({ type: 'success', message: 'Content saved. Refresh the portfolio to see the update.' })
      return data
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to save content.' })
      return null
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogin = async (event) => {
    event.preventDefault()

    if (!loginPassword.trim()) {
      setStatus({ type: 'error', message: 'Enter admin password first.' })
      return
    }

    setIsSaving(true)
    setStatus({ type: '', message: '' })

    try {
      const response = await fetch('/api/admin-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: loginPassword,
          action: 'verify'
        })
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error || 'Login failed.')

      sessionStorage.setItem('rahmat-admin-password', loginPassword)
      setPassword(loginPassword)
      setLoginPassword('')
      setIsAuthenticated(true)
      setStatus({ type: '', message: '' })
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Login failed.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('rahmat-admin-password')
    setPassword('')
    setLoginPassword('')
    setIsAuthenticated(false)
    setContent({ projects: [], certificates: [] })
    resetProjectForm()
    resetCertificateForm()
    setStatus({ type: '', message: '' })
  }

  const setProjectMediaFile = (file) => {
    if (!file) return

    setProjectMedia(file)
    setProjectForm((currentForm) => ({
      ...currentForm,
      mediaType: getMediaTypeFromFile(file)
    }))
  }

  const clearProjectMedia = () => {
    setProjectMedia(null)
    if (projectMediaInputRef.current) {
      projectMediaInputRef.current.value = ''
    }
  }

  const handleProjectMediaPaste = (event) => {
    const files = Array.from(event.clipboardData?.files || [])
    const mediaFile = files.find((file) => file.type.startsWith('image/') || file.type.startsWith('video/'))

    if (mediaFile) {
      event.preventDefault()
      setProjectMediaFile(mediaFile)
      return
    }

    const pastedText = event.clipboardData?.getData('text')?.trim()
    if (!pastedText) return

    event.preventDefault()
    setProjectForm((currentForm) => ({
      ...currentForm,
      mediaUrl: pastedText,
      mediaType: getMediaTypeFromUrl(pastedText)
    }))
  }

  const handleProjectMediaDrop = (event) => {
    event.preventDefault()
    const file = Array.from(event.dataTransfer?.files || [])
      .find((currentFile) => currentFile.type.startsWith('image/') || currentFile.type.startsWith('video/'))

    if (file) setProjectMediaFile(file)
  }

  const handleProjectSubmit = async (event) => {
    event.preventDefault()
    const mediaDataUrl = await fileToDataUrl(projectMedia)
    const saved = await saveContent({
      collection: 'projects',
      item: {
        ...projectForm,
        stack: normalizeCsv(projectForm.stack),
        mediaDataUrl
      }
    })

    if (saved) {
      resetProjectForm()
      setProjectView('library')
      event.currentTarget.reset()
    }
  }

  const handleCertificateSubmit = async (event) => {
    event.preventDefault()
    const imageDataUrl = await fileToDataUrl(certificateImage)
    const saved = await saveContent({
      collection: 'certificates',
      item: {
        ...certificateForm,
        skills: normalizeCsv(certificateForm.skills),
        imageDataUrl
      }
    })

    if (saved) {
      resetCertificateForm()
      setCertificateView('library')
      event.currentTarget.reset()
    }
  }

  const editItem = (collection, item) => {
    setActiveTab(collection)
    setEditingItem({ collection, id: item.id })
    setStatus({ type: '', message: '' })

    if (collection === 'projects') {
      setProjectView('form')
      clearProjectMedia()
      setProjectForm({
        id: item.id,
        order: String(getProjectOrder(item, sortedProjects.findIndex((project) => project.id === item.id))),
        title: item.title || '',
        tech: item.tech || '',
        desc: item.desc || '',
        fullDesc: item.fullDesc || item.desc || '',
        stack: Array.isArray(item.stack) ? item.stack.join(', ') : '',
        mediaType: item.mediaType || getMediaTypeFromUrl(item.mediaUrl || item.image || ''),
        mediaUrl: item.mediaUrl || item.image || '',
        imageVariant: item.imageVariant || 'desktop-shot',
        github: item.github || '',
        demo: item.demo || ''
      })
      return
    }

    setCertificateImage(null)
    setCertificateView('form')
    setCertificateForm({
      id: item.id,
      title: item.title || '',
      issuer: item.issuer || '',
      issuedAt: item.issuedAt || '',
      description: item.description || '',
      skills: Array.isArray(item.skills) ? item.skills.join(', ') : '',
      credentialUrl: item.credentialUrl || '',
      imageUrl: item.image || ''
    })
  }

  const deleteItem = async (collection, id) => {
    if (!password.trim()) {
      setStatus({ type: 'error', message: 'ADMIN_PASSWORD is required.' })
      return
    }

    setIsSaving(true)
    setStatus({ type: '', message: '' })

    try {
      const response = await fetch('/api/admin-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          collection,
          action: 'delete',
          id
        })
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error || 'Failed to delete content.')

      sessionStorage.setItem('rahmat-admin-password', password)
      setContent(data)
      if (editingItem.collection === collection && editingItem.id === id) {
        collection === 'projects' ? resetProjectForm() : resetCertificateForm()
      }
      setStatus({ type: 'success', message: 'Content deleted.' })
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to delete content.' })
    } finally {
      setIsSaving(false)
    }
  }

  const updateProjectOrder = async (project, nextOrder) => {
    const order = String(nextOrder || '').trim()
    if (!order) {
      setStatus({ type: 'error', message: 'Project display order is required.' })
      return
    }

    await saveContent({
      collection: 'projects',
      item: {
        ...project,
        order
      }
    })
  }

  const dashboardTitle = activeTab === 'projects'
    ? projectView === 'library'
      ? 'All Projects'
      : editingItem.collection === 'projects' ? 'Edit Project' : 'Add Project'
    : certificateView === 'library'
      ? 'All Certificates'
      : editingItem.collection === 'certificates' ? 'Edit Certificate' : 'Add Certificate'

  const dashboardDescription = activeTab === 'projects'
    ? projectView === 'library'
      ? 'Review, reorder, edit, or delete projects shown on the public portfolio.'
      : 'Create project entries with media, links, tech stack, and dashboard order.'
    : certificateView === 'library'
      ? 'Review, edit, or delete certificates shown on the public portfolio.'
      : 'Create certificate entries with issuer, skills, credential links, and images.'

  const adminNavLabel = dashboardTitle

  const selectProjectForm = () => {
    setActiveTab('projects')
    setProjectView('form')
    setIsAdminMenuOpen(false)
  }

  const selectProjectLibrary = () => {
    setActiveTab('projects')
    setProjectView('library')
    if (editingItem.collection === 'projects') resetProjectForm()
    setIsAdminMenuOpen(false)
  }

  const selectCertificateForm = () => {
    setActiveTab('certificates')
    setCertificateView('form')
    setIsAdminMenuOpen(false)
  }

  const selectCertificateLibrary = () => {
    setActiveTab('certificates')
    setCertificateView('library')
    if (editingItem.collection === 'certificates') resetCertificateForm()
    setIsAdminMenuOpen(false)
  }

  return (
    <main className={`admin-page ${isAuthenticated ? 'admin-page-dashboard' : 'admin-page-login'}`}>
      {isAuthenticated && (
        <nav className="admin-navbar" aria-label="Admin navigation">
          <a href="/" className="admin-nav-brand">
            <span>RahmatDev</span>
            <strong>Admin</strong>
          </a>

          <button
            type="button"
            className={`admin-nav-menu-toggle ${isAdminMenuOpen ? 'active' : ''}`}
            aria-label={`Toggle admin menu. Current view: ${adminNavLabel}`}
            aria-expanded={isAdminMenuOpen}
            aria-controls="admin-nav-tabs"
            onClick={() => setIsAdminMenuOpen((currentState) => !currentState)}
          >
            <span>Menu</span>
            <i aria-hidden="true" />
          </button>

          <div id="admin-nav-tabs" className={`admin-nav-tabs ${isAdminMenuOpen ? 'open' : ''}`} role="tablist" aria-label="Admin content view">
            <button
              type="button"
              className={activeTab === 'projects' && projectView === 'form' ? 'active' : ''}
              onClick={selectProjectForm}
            >
              {activeTab === 'projects' && editingItem.collection === 'projects' ? 'Edit Project' : 'Add Project'}
            </button>
            <button
              type="button"
              className={activeTab === 'projects' && projectView === 'library' ? 'active' : ''}
              onClick={selectProjectLibrary}
            >
              All Projects
              <span>{sortedProjects.length}</span>
            </button>
            <button
              type="button"
              className={activeTab === 'certificates' && certificateView === 'form' ? 'active' : ''}
              onClick={selectCertificateForm}
            >
              {activeTab === 'certificates' && editingItem.collection === 'certificates' ? 'Edit Certificate' : 'Add Certificate'}
            </button>
            <button
              type="button"
              className={activeTab === 'certificates' && certificateView === 'library' ? 'active' : ''}
              onClick={selectCertificateLibrary}
            >
              All Certificates
              <span>{certificates.length}</span>
            </button>
          </div>

          <div className="admin-nav-actions">
            <a href="/" className="admin-nav-site">Back to site</a>
            <button type="button" className="admin-nav-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </nav>
      )}

      <section className="admin-shell">
        {!isAuthenticated && (
          <header className="admin-header">
            <div>
              <span className="admin-kicker">RahmatDev Admin</span>
              <h1>Portfolio Content</h1>
              <p>Add projects and certificates without editing React files manually.</p>
            </div>
            <a href="/" className="admin-home-link">Back to site</a>
          </header>
        )}

        {!isAuthenticated ? (
          <form className="admin-login-card" onSubmit={handleLogin}>
            <div className="admin-login-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M7 10V8a5 5 0 0 1 10 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M12 14v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="admin-login-copy">
              <h2>Admin Login</h2>
              <p>Manage projects, certificates, and portfolio updates from one private workspace.</p>
            </div>
            <label htmlFor="admin-login-password">
              Password
              <input
                id="admin-login-password"
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </label>
            <button className="admin-submit" type="submit" disabled={isSaving}>
              {isSaving ? 'Checking...' : 'Login'}
            </button>
          </form>
        ) : null}

        {!isAuthenticated && status.message && (
          <div className={`admin-status ${status.type}`}>
            {status.message}
          </div>
        )}

        {!isAuthenticated ? null : (
          <>
        <div className="admin-dashboard-heading">
          <span>Content Manager</span>
          <h1>{dashboardTitle}</h1>
          <p>{dashboardDescription}</p>
        </div>

        {status.message && (
          <div className={`admin-status ${status.type}`}>
            {status.message}
          </div>
        )}

        {activeTab === 'projects' && projectView === 'library' ? (
          <section className="admin-project-library">
            <div className="admin-library-header">
              <div>
                <span className="admin-library-kicker">Dashboard Order</span>
                <h2>All Projects</h2>
                <p>Set the display position for each project on the main portfolio page.</p>
              </div>
              <button type="button" onClick={() => setProjectView('form')}>
                Add New Project
              </button>
            </div>

            {sortedProjects.length ? (
              <div className="admin-project-board">
                {sortedProjects.map((project, index) => (
                  <article key={project.id} className="admin-project-card">
                    <button type="button" className="admin-project-media" onClick={() => editItem('projects', project)} aria-label={`Edit ${project.title}`}>
                      {project.mediaType === 'video' && project.mediaUrl ? (
                        <video src={project.mediaUrl} muted playsInline preload="metadata" aria-hidden="true" />
                      ) : (
                        (project.mediaUrl || project.image) ? (
                          <img src={project.mediaUrl || project.image} alt="" />
                        ) : null
                      )}
                      <span>{project.title?.slice(0, 1) || 'P'}</span>
                    </button>

                    <div className="admin-project-main">
                      <div className="admin-project-copy">
                        <span className="admin-project-rank">#{getProjectOrder(project, index)}</span>
                        <h3>{project.title}</h3>
                        <p>{project.tech || 'WEB PROJECT'}</p>
                      </div>

                      <form className="admin-project-order" onSubmit={(event) => {
                        event.preventDefault()
                        updateProjectOrder(project, event.currentTarget.elements.order.value)
                      }}>
                        <label>
                          Position
                          <input
                            name="order"
                            type="number"
                            min="1"
                            max="999"
                            defaultValue={getProjectOrder(project, index)}
                          />
                        </label>
                        <button type="submit" disabled={isSaving}>Save Order</button>
                      </form>
                    </div>

                    <div className="admin-project-actions">
                      <button type="button" className="admin-edit-btn" onClick={() => editItem('projects', project)} disabled={isSaving}>
                        Edit
                      </button>
                      <button type="button" className="admin-delete-btn" onClick={() => deleteItem('projects', project.id)} disabled={isSaving}>
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="admin-library-empty">
                <h3>No projects yet</h3>
                <p>Add your first project, then manage its display order here.</p>
                <button type="button" onClick={() => setProjectView('form')}>Add Project</button>
              </div>
            )}
          </section>
        ) : activeTab === 'certificates' && certificateView === 'library' ? (
          <section className="admin-project-library">
            <div className="admin-library-header">
              <div>
                <span className="admin-library-kicker">Credentials</span>
                <h2>All Certificates</h2>
                <p>Review certificate details, edit entries, or remove credentials from the portfolio.</p>
              </div>
              <button type="button" onClick={() => setCertificateView('form')}>
                Add New Certificate
              </button>
            </div>

            {certificates.length ? (
              <div className="admin-project-board">
                {certificates.map((certificate) => (
                  <article key={certificate.id} className="admin-project-card admin-certificate-card">
                    <button type="button" className="admin-project-media" onClick={() => editItem('certificates', certificate)} aria-label={`Edit ${certificate.title}`}>
                      {certificate.image ? (
                        <img src={certificate.image} alt="" />
                      ) : null}
                      <span>{certificate.title?.slice(0, 1) || 'C'}</span>
                    </button>

                    <div className="admin-project-main admin-certificate-main">
                      <div className="admin-project-copy">
                        <span className="admin-project-rank">{certificate.issuer || 'Certificate'}</span>
                        <h3>{certificate.title}</h3>
                        <p>{[certificate.issuedAt, ...(certificate.skills || [])].filter(Boolean).join(' / ') || 'Saved credential'}</p>
                      </div>
                    </div>

                    <div className="admin-project-actions">
                      {certificate.credentialUrl && (
                        <a href={certificate.credentialUrl} target="_blank" rel="noopener noreferrer" className="admin-view-btn">
                          View
                        </a>
                      )}
                      <button type="button" className="admin-edit-btn" onClick={() => editItem('certificates', certificate)} disabled={isSaving}>
                        Edit
                      </button>
                      <button type="button" className="admin-delete-btn" onClick={() => deleteItem('certificates', certificate.id)} disabled={isSaving}>
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="admin-library-empty">
                <h3>No certificates yet</h3>
                <p>Add your first certificate, then manage every credential here.</p>
                <button type="button" onClick={() => setCertificateView('form')}>Add Certificate</button>
              </div>
            )}
          </section>
        ) : (
        <div className="admin-single-panel">
          {activeTab === 'projects' ? (
            <form className="admin-form" onSubmit={handleProjectSubmit}>
              <div className="admin-form-title-row">
                <h2>{editingItem.collection === 'projects' ? 'Edit Project' : 'Add Project'}</h2>
                {editingItem.collection === 'projects' && (
                  <button type="button" onClick={resetProjectForm}>Cancel edit</button>
                )}
              </div>
              <div className="admin-two-col">
                <label>
                  Title
                  <input name="title" value={projectForm.title} onChange={updateProjectField} required />
                </label>
                <label>
                  Category
                  <input name="tech" value={projectForm.tech} onChange={updateProjectField} placeholder="WEB \\ DASHBOARD" />
                </label>
              </div>
              <div className="admin-two-col admin-description-grid">
                <label>
                  Short Description
                  <textarea name="desc" value={projectForm.desc} onChange={updateProjectField} rows="3" required />
                </label>
                <label>
                  Full Description
                  <textarea name="fullDesc" value={projectForm.fullDesc} onChange={updateProjectField} rows="3" />
                </label>
              </div>
              <div className="admin-two-col admin-order-stack-row">
                <label>
                  Display Order
                  <input
                    name="order"
                    type="number"
                    min="1"
                    max="999"
                    inputMode="numeric"
                    value={projectForm.order}
                    onChange={updateProjectField}
                    placeholder="1"
                  />
                </label>
                <label>
                  Tech Stack
                  <input name="stack" value={projectForm.stack} onChange={updateProjectField} placeholder="React, Tailwind, Supabase" />
                </label>
              </div>
              {projectStackPreview.length > 0 && (
                <div className="admin-stack-preview" aria-label="Tech stack preview">
                  {projectStackPreview.map((tech) => (
                    <span key={tech.name} className="admin-stack-chip">
                      {tech.icon && (
                        <span className="admin-stack-icon">
                          <img src={tech.icon} alt="" loading="lazy" />
                        </span>
                      )}
                      {tech.name}
                    </span>
                  ))}
                </div>
              )}
              <div className="admin-two-col">
                <label>
                  GitHub URL
                  <input name="github" value={projectForm.github} onChange={updateProjectField} placeholder="https://github.com/..." />
                </label>
                <label>
                  Demo URL
                  <input name="demo" value={projectForm.demo} onChange={updateProjectField} placeholder="https://..." />
                </label>
              </div>
              <div className="admin-two-col">
                <label>
                  Media Type
                  <select name="mediaType" value={projectForm.mediaType} onChange={updateProjectField}>
                    <option value="image">Image / GIF</option>
                    <option value="video">Video</option>
                  </select>
                </label>
                <label>
                  Preview Layout
                  <select name="imageVariant" value={projectForm.imageVariant} onChange={updateProjectField}>
                    <option value="desktop-shot">Desktop</option>
                    <option value="phone-shot">Phone</option>
                  </select>
                </label>
              </div>
              <div className="admin-media-panel">
                <label>
                  Media URL
                  <input
                    name="mediaUrl"
                    value={projectForm.mediaUrl}
                    onChange={updateProjectField}
                    placeholder={projectForm.mediaType === 'video' ? 'https://.../demo.mp4' : '/uploads/screenshot.gif'}
                  />
                </label>
                <p>
                  Use an uploaded file or paste a direct media URL. Videos play in the project modal, GIFs work as animated images.
                </p>
              </div>
              <div
                className="admin-upload-card"
                onPaste={handleProjectMediaPaste}
                onDrop={handleProjectMediaDrop}
                onDragOver={(event) => event.preventDefault()}
                tabIndex="0"
                role="button"
                aria-label="Upload, drop, or paste project media"
              >
                <input
                  ref={projectMediaInputRef}
                  className="admin-file-input"
                  type="file"
                  accept={projectMediaAccept}
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null
                    if (file) setProjectMediaFile(file)
                  }}
                />
                <div className="admin-upload-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 16V4m0 0 4.5 4.5M12 4 7.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5 15.5v1.8A2.7 2.7 0 0 0 7.7 20h8.6a2.7 2.7 0 0 0 2.7-2.7v-1.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="admin-upload-copy">
                  <span>Upload media from device</span>
                  <p>Choose a file, drag it here, or paste a copied image/video/URL.</p>
                  <small>PNG, JPG, WEBP, GIF, MP4, WEBM, or OGG. Max 8MB.</small>
                </div>
                <div className="admin-upload-actions">
                  <button type="button" onClick={() => projectMediaInputRef.current?.click()}>
                    Choose File
                  </button>
                  {projectMedia && (
                    <button type="button" className="admin-upload-clear" onClick={clearProjectMedia}>
                      Clear
                    </button>
                  )}
                </div>
                <div className={`admin-upload-state ${projectMedia ? 'has-file' : ''}`}>
                  {projectMedia ? (
                    <>
                      <span>{projectMedia.name}</span>
                      <small>{getMediaTypeFromFile(projectMedia)} / {(projectMedia.size / (1024 * 1024)).toFixed(2)}MB</small>
                    </>
                  ) : (
                    <>
                      <span>No media selected</span>
                      <small>Paste while this box is focused, or use the Media URL field above.</small>
                    </>
                  )}
                </div>
              </div>
              <button className="admin-submit" type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : editingItem.collection === 'projects' ? 'Update Project' : 'Save Project'}
              </button>
            </form>
          ) : (
            <form className="admin-form" onSubmit={handleCertificateSubmit}>
              <div className="admin-form-title-row">
                <h2>{editingItem.collection === 'certificates' ? 'Edit Certificate' : 'Add Certificate'}</h2>
                {editingItem.collection === 'certificates' && (
                  <button type="button" onClick={resetCertificateForm}>Cancel edit</button>
                )}
              </div>
              <label>
                Title
                <input name="title" value={certificateForm.title} onChange={updateCertificateField} required />
              </label>
              <div className="admin-two-col">
                <label>
                  Issuer
                  <input name="issuer" value={certificateForm.issuer} onChange={updateCertificateField} placeholder="Dicoding, Coursera, Google" />
                </label>
                <label>
                  Issued Date
                  <input name="issuedAt" value={certificateForm.issuedAt} onChange={updateCertificateField} placeholder="Jan 2026" />
                </label>
              </div>
              <label>
                Description
                <textarea name="description" value={certificateForm.description} onChange={updateCertificateField} rows="4" />
              </label>
              <label>
                Skills
                <input name="skills" value={certificateForm.skills} onChange={updateCertificateField} placeholder="React, Web3, UI/UX" />
              </label>
              <label>
                Credential URL
                <input name="credentialUrl" value={certificateForm.credentialUrl} onChange={updateCertificateField} placeholder="https://..." />
              </label>
              <label>
                Image URL
                <input name="imageUrl" value={certificateForm.imageUrl} onChange={updateCertificateField} placeholder="/uploads/certificate.png" />
              </label>
              <label>
                Upload Image (max 8MB)
                <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => setCertificateImage(event.target.files?.[0] || null)} />
              </label>
              <button className="admin-submit" type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : editingItem.collection === 'certificates' ? 'Update Certificate' : 'Save Certificate'}
              </button>
            </form>
          )}
	        </div>
	        )}
          </>
        )}
      </section>
    </main>
  )
}

export default AdminPage

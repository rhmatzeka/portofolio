import { useEffect, useMemo, useState } from 'react'
import { getCanonicalStackName, getStackIcon } from '../data/projects'
import { fileToDataUrl, getAdminContent, normalizeCsv } from '../utils/portfolioContent'
import './AdminPage.css'

const emptyProject = {
  title: '',
  tech: '',
  desc: '',
  fullDesc: '',
  stack: '',
  imageVariant: 'desktop-shot',
  imageUrl: '',
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

const AdminPage = () => {
  const [password, setPassword] = useState(() => sessionStorage.getItem('rahmat-admin-password') || '')
  const [loginPassword, setLoginPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(sessionStorage.getItem('rahmat-admin-password')))
  const [content, setContent] = useState({ projects: [], certificates: [] })
  const [activeTab, setActiveTab] = useState('projects')
  const [projectForm, setProjectForm] = useState(emptyProject)
  const [certificateForm, setCertificateForm] = useState(emptyCertificate)
  const [projectImage, setProjectImage] = useState(null)
  const [certificateImage, setCertificateImage] = useState(null)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isSaving, setIsSaving] = useState(false)

  const visibleItems = useMemo(() => content[activeTab] || [], [activeTab, content])
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
      setStatus({ type: 'success', message: 'Logged in.' })
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
    setStatus({ type: '', message: '' })
  }

  const handleProjectSubmit = async (event) => {
    event.preventDefault()
    const imageDataUrl = await fileToDataUrl(projectImage)
    const saved = await saveContent({
      collection: 'projects',
      item: {
        ...projectForm,
        stack: normalizeCsv(projectForm.stack),
        imageDataUrl
      }
    })

    if (saved) {
      setProjectForm(emptyProject)
      setProjectImage(null)
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
      setCertificateForm(emptyCertificate)
      setCertificateImage(null)
      event.currentTarget.reset()
    }
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
      setStatus({ type: 'success', message: 'Content deleted.' })
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to delete content.' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="admin-page">
      <section className="admin-shell">
        <header className="admin-header">
          <div>
            <span className="admin-kicker">RahmatDev Admin</span>
            <h1>Portfolio Content</h1>
            <p>Add projects and certificates without editing React files manually.</p>
          </div>
          <a href="/" className="admin-home-link">Back to site</a>
        </header>

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
        ) : (
          <div className="admin-session-card">
            <div>
              <span>Logged in</span>
              <p>Admin dashboard is unlocked for this browser session.</p>
            </div>
            <button type="button" onClick={handleLogout}>Logout</button>
          </div>
        )}

        {!isAuthenticated && status.message && (
          <div className={`admin-status ${status.type}`}>
            {status.message}
          </div>
        )}

        {!isAuthenticated ? null : (
          <>

        <div className="admin-tabs" role="tablist" aria-label="Admin content type">
          <button
            type="button"
            className={activeTab === 'projects' ? 'active' : ''}
            onClick={() => setActiveTab('projects')}
          >
            Projects
          </button>
          <button
            type="button"
            className={activeTab === 'certificates' ? 'active' : ''}
            onClick={() => setActiveTab('certificates')}
          >
            Certificates
          </button>
        </div>

        {status.message && (
          <div className={`admin-status ${status.type}`}>
            {status.message}
          </div>
        )}

        <div className="admin-grid">
          {activeTab === 'projects' ? (
            <form className="admin-form" onSubmit={handleProjectSubmit}>
              <h2>Add Project</h2>
              <label>
                Title
                <input name="title" value={projectForm.title} onChange={updateProjectField} required />
              </label>
              <label>
                Category
                <input name="tech" value={projectForm.tech} onChange={updateProjectField} placeholder="WEB \\ DASHBOARD" />
              </label>
              <label>
                Short Description
                <textarea name="desc" value={projectForm.desc} onChange={updateProjectField} rows="3" required />
              </label>
              <label>
                Full Description
                <textarea name="fullDesc" value={projectForm.fullDesc} onChange={updateProjectField} rows="4" />
              </label>
              <label>
                Tech Stack
                <input name="stack" value={projectForm.stack} onChange={updateProjectField} placeholder="React, Tailwind, Supabase" />
              </label>
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
                  Screenshot Type
                  <select name="imageVariant" value={projectForm.imageVariant} onChange={updateProjectField}>
                    <option value="desktop-shot">Desktop</option>
                    <option value="phone-shot">Phone</option>
                  </select>
                </label>
                <label>
                  Image URL
                  <input name="imageUrl" value={projectForm.imageUrl} onChange={updateProjectField} placeholder="/uploads/image.png" />
                </label>
              </div>
              <label>
                Upload Image (max 3MB)
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setProjectImage(event.target.files?.[0] || null)} />
              </label>
              <button className="admin-submit" type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Project'}
              </button>
            </form>
          ) : (
            <form className="admin-form" onSubmit={handleCertificateSubmit}>
              <h2>Add Certificate</h2>
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
                Upload Image (max 3MB)
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setCertificateImage(event.target.files?.[0] || null)} />
              </label>
              <button className="admin-submit" type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Certificate'}
              </button>
            </form>
          )}

          <aside className="admin-list">
            <div className="admin-list-header">
              <h2>Saved {activeTab}</h2>
              <span>{visibleItems.length}</span>
            </div>

            {visibleItems.length ? (
              <div className="admin-list-items">
                {visibleItems.map((item) => (
                  <article key={item.id} className="admin-list-item">
                    {item.image && <img src={item.image} alt="" />}
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.tech || item.issuer || item.issuedAt || 'Saved content'}</p>
                    </div>
                    <button type="button" onClick={() => deleteItem(activeTab, item.id)} disabled={isSaving}>
                      Delete
                    </button>
                  </article>
                ))}
              </div>
            ) : (
            <p className="admin-empty">No admin content saved yet.</p>
            )}
          </aside>
        </div>
          </>
        )}
      </section>
    </main>
  )
}

export default AdminPage

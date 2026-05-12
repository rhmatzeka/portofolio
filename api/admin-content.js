const fs = require('node:fs/promises')
const path = require('node:path')

const CONTENT_REPO_PATH = 'public/content.json'
const CONTENT_PATH = path.join(process.cwd(), CONTENT_REPO_PATH)
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads')
const MAX_BODY_SIZE = 4 * 1024 * 1024
const MAX_FIELD_LENGTH = 4000

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(payload))
}

const getRequestBody = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') return JSON.parse(req.body)

  const chunks = []
  let size = 0

  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_BODY_SIZE) {
      const error = new Error('Request body is too large.')
      error.statusCode = 413
      throw error
    }
    chunks.push(chunk)
  }

  if (!chunks.length) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

const cleanText = (value, fallback = '') => (
  typeof value === 'string' ? value.trim().slice(0, MAX_FIELD_LENGTH) : fallback
)

const cleanList = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => cleanText(item))
      .filter(Boolean)
      .slice(0, 12)
  }

  return cleanText(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12)
}

const STACK_ALIASES = {
  css3: 'CSS',
  eth: 'Ethers.js',
  ethereum: 'Ethers.js',
  ethers: 'Ethers.js',
  ethersjs: 'Ethers.js',
  expressjs: 'Express',
  js: 'JavaScript',
  javascript: 'JavaScript',
  mysql: 'MySQL',
  next: 'Next.js',
  nextjs: 'Next.js',
  node: 'Node.js',
  nodejs: 'Node.js',
  php: 'PHP',
  postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL',
  py: 'Python',
  python: 'Python',
  react: 'React',
  reactjs: 'React',
  reactnative: 'React Native',
  rn: 'React Native',
  solidity: 'Solidity',
  supabase: 'Supabase',
  tailwind: 'Tailwind',
  tailwindcss: 'Tailwind',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  web3: 'Web3.js',
  web3js: 'Web3.js'
}

const normalizeStackList = (value) => cleanList(value).map((item) => {
  const key = item.toLowerCase().replace(/[^a-z0-9]/g, '')
  return STACK_ALIASES[key] || item
})

const slugify = (value) => (
  cleanText(value, 'upload')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'upload'
)

const parseImageDataUrl = (dataUrl) => {
  if (!dataUrl) return null

  const match = /^data:image\/(png|jpe?g|webp);base64,([a-zA-Z0-9+/=]+)$/.exec(dataUrl)
  if (!match) {
    const error = new Error('Image must be PNG, JPG, or WEBP.')
    error.statusCode = 400
    throw error
  }

  const extension = match[1] === 'jpeg' ? 'jpg' : match[1]
  const base64 = match[2]
  const buffer = Buffer.from(base64, 'base64')

  if (buffer.length > 3 * 1024 * 1024) {
    const error = new Error('Image file must be 3MB or smaller.')
    error.statusCode = 413
    throw error
  }

  return { extension, base64, buffer }
}

const getGitHubConfig = () => {
  const repo = cleanText(process.env.GITHUB_REPO)
  const token = cleanText(process.env.GITHUB_TOKEN)
  const branch = cleanText(process.env.GITHUB_BRANCH, 'main')

  if (!repo || !token) return null
  if (!/^[^/\s]+\/[^/\s]+$/.test(repo)) {
    const error = new Error('GITHUB_REPO must use owner/repo format.')
    error.statusCode = 500
    throw error
  }

  return { repo, token, branch }
}

const githubRequest = async (repoPath, options = {}) => {
  const config = getGitHubConfig()
  const response = await fetch(`https://api.github.com/repos/${config.repo}/contents/${repoPath}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers || {})
    }
  })

  if (response.status === 404 && (!options.method || options.method === 'GET')) return null

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const error = new Error(data?.message || 'GitHub content request failed.')
    error.statusCode = response.status
    throw error
  }

  return data
}

const readGitHubFile = async (repoPath) => {
  const config = getGitHubConfig()
  const data = await githubRequest(`${repoPath}?ref=${encodeURIComponent(config.branch)}`)
  if (!data) return null

  return {
    sha: data.sha,
    text: Buffer.from(String(data.content || '').replace(/\n/g, ''), 'base64').toString('utf8')
  }
}

const putGitHubFile = async ({ repoPath, base64Content, message, sha }) => {
  const config = getGitHubConfig()

  return githubRequest(repoPath, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: base64Content,
      branch: config.branch,
      ...(sha ? { sha } : {})
    })
  })
}

const isGitHubStorageEnabled = () => Boolean(process.env.GITHUB_REPO && process.env.GITHUB_TOKEN)

const emptyContent = () => ({ projects: [], certificates: [] })

const normalizeContent = (content) => ({
  projects: Array.isArray(content?.projects) ? content.projects : [],
  certificates: Array.isArray(content?.certificates) ? content.certificates : []
})

const ensureLocalContentFile = async () => {
  await fs.mkdir(path.dirname(CONTENT_PATH), { recursive: true })
  try {
    await fs.access(CONTENT_PATH)
  } catch (error) {
    await fs.writeFile(CONTENT_PATH, JSON.stringify(emptyContent(), null, 2))
  }
}

const readContent = async () => {
  if (isGitHubStorageEnabled()) {
    const file = await readGitHubFile(CONTENT_REPO_PATH)
    if (!file) return emptyContent()
    return normalizeContent(JSON.parse(file.text))
  }

  await ensureLocalContentFile()
  const raw = await fs.readFile(CONTENT_PATH, 'utf8')
  return normalizeContent(JSON.parse(raw))
}

const writeContent = async (content) => {
  const normalizedContent = normalizeContent(content)
  const serialized = `${JSON.stringify(normalizedContent, null, 2)}\n`

  if (isGitHubStorageEnabled()) {
    const file = await readGitHubFile(CONTENT_REPO_PATH)
    await putGitHubFile({
      repoPath: CONTENT_REPO_PATH,
      base64Content: Buffer.from(serialized, 'utf8').toString('base64'),
      message: 'Update portfolio content from admin',
      sha: file?.sha
    })
    return
  }

  await ensureLocalContentFile()
  await fs.writeFile(CONTENT_PATH, serialized)
}

const saveImageDataUrl = async (dataUrl, title) => {
  const parsedImage = parseImageDataUrl(dataUrl)
  if (!parsedImage) return ''

  const filename = `${Date.now()}-${slugify(title)}.${parsedImage.extension}`
  const publicPath = `/uploads/${filename}`

  if (isGitHubStorageEnabled()) {
    await putGitHubFile({
      repoPath: `public${publicPath}`,
      base64Content: parsedImage.base64,
      message: `Upload portfolio image ${filename}`
    })
    return publicPath
  }

  await fs.mkdir(UPLOADS_DIR, { recursive: true })
  await fs.writeFile(path.join(UPLOADS_DIR, filename), parsedImage.buffer)
  return publicPath
}

const normalizeProject = async (item = {}) => {
  const title = cleanText(item.title)
  const image = await saveImageDataUrl(item.imageDataUrl, title)

  if (!title) {
    const error = new Error('Project title is required.')
    error.statusCode = 400
    throw error
  }

  return {
    id: cleanText(item.id) || `admin-project-${Date.now()}`,
    title,
    tech: cleanText(item.tech, 'WEB PROJECT').toUpperCase(),
    desc: cleanText(item.desc),
    fullDesc: cleanText(item.fullDesc || item.desc),
    stack: normalizeStackList(item.stack),
    image: image || cleanText(item.image || item.imageUrl),
    imageVariant: ['desktop-shot', 'phone-shot'].includes(item.imageVariant) ? item.imageVariant : 'desktop-shot',
    github: cleanText(item.github) || '#',
    demo: cleanText(item.demo) || '#'
  }
}

const normalizeCertificate = async (item = {}) => {
  const title = cleanText(item.title)
  const image = await saveImageDataUrl(item.imageDataUrl, title)

  if (!title) {
    const error = new Error('Certificate title is required.')
    error.statusCode = 400
    throw error
  }

  return {
    id: cleanText(item.id) || `admin-certificate-${Date.now()}`,
    title,
    issuer: cleanText(item.issuer),
    issuedAt: cleanText(item.issuedAt),
    description: cleanText(item.description),
    skills: cleanList(item.skills),
    credentialUrl: cleanText(item.credentialUrl),
    image: image || cleanText(item.image || item.imageUrl)
  }
}

const authorize = (password) => {
  const configuredPassword = process.env.ADMIN_PASSWORD
  return Boolean(configuredPassword && password === configuredPassword)
}

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    try {
      sendJson(res, 200, await readContent())
    } catch (error) {
      sendJson(res, 500, { error: error.message || 'Content data is unavailable.' })
    }
    return
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' })
    return
  }

  let body
  try {
    body = await getRequestBody(req)
  } catch (error) {
    sendJson(res, error.statusCode || 400, { error: error.message || 'Invalid JSON body.' })
    return
  }

  if (!authorize(body?.password)) {
    sendJson(res, 401, { error: 'Invalid admin password or ADMIN_PASSWORD is not configured.' })
    return
  }

  if (body?.action === 'verify') {
    sendJson(res, 200, { ok: true })
    return
  }

  const collection = body?.collection
  if (!['projects', 'certificates'].includes(collection)) {
    sendJson(res, 400, { error: 'Unknown content collection.' })
    return
  }

  try {
    const content = await readContent()

    if (body?.action === 'delete') {
      const id = cleanText(body?.id)
      content[collection] = content[collection].filter((item) => item.id !== id)
      await writeContent(content)
      sendJson(res, 200, content)
      return
    }

    const item = collection === 'projects'
      ? await normalizeProject(body?.item)
      : await normalizeCertificate(body?.item)

    const existingIndex = content[collection].findIndex((currentItem) => currentItem.id === item.id)
    if (existingIndex >= 0) {
      content[collection][existingIndex] = item
    } else {
      content[collection] = [item, ...content[collection]]
    }

    await writeContent(content)
    sendJson(res, 200, content)
  } catch (error) {
    sendJson(res, error.statusCode || 500, { error: error.message || 'Failed to save content.' })
  }
}

export const getAdminContent = async () => {
  const response = await fetch('/api/admin-content', {
    headers: { Accept: 'application/json' }
  })

  if (!response.ok) {
    throw new Error('Unable to load portfolio content.')
  }

  const data = await response.json()

  return {
    projects: Array.isArray(data.projects) ? data.projects : [],
    certificates: Array.isArray(data.certificates) ? data.certificates : []
  }
}

export const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  if (!file) {
    resolve('')
    return
  }

  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = () => reject(new Error('Failed to read image file.'))
  reader.readAsDataURL(file)
})

export const normalizeCsv = (value) => (
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
)

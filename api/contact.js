const RESEND_ENDPOINT = 'https://api.resend.com/emails'
const MAX_FIELD_LENGTH = 2000

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

const getRequestBody = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') return JSON.parse(req.body)

  const chunks = []
  for await (const chunk of req) {
    chunks.push(chunk)
  }

  if (!chunks.length) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

const cleanField = (value) => (
  typeof value === 'string' ? value.trim().slice(0, MAX_FIELD_LENGTH) : ''
)

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const escapeHtml = (value) => (
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
)

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    sendJson(res, 500, {
      error: 'Contact form is not configured yet. Add RESEND_API_KEY in Vercel environment variables.'
    })
    return
  }

  let body
  try {
    body = await getRequestBody(req)
  } catch (error) {
    sendJson(res, 400, { error: 'Invalid JSON body.' })
    return
  }

  const name = cleanField(body?.name)
  const email = cleanField(body?.email)
  const message = cleanField(body?.message)
  const website = cleanField(body?.website)

  if (website) {
    sendJson(res, 200, { ok: true })
    return
  }

  if (!name || !email || !message) {
    sendJson(res, 400, { error: 'Please fill in all fields first.' })
    return
  }

  if (!isValidEmail(email)) {
    sendJson(res, 400, { error: 'Please enter a valid email address.' })
    return
  }

  const toEmail = process.env.CONTACT_TO_EMAIL || 'matsganz@gmail.com'
  const fromEmail = process.env.CONTACT_FROM_EMAIL || 'RahmatDev Portfolio <onboarding@resend.dev>'
  const safeName = escapeHtml(name)
  const safeEmail = escapeHtml(email)
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br />')

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject: `Portfolio inquiry from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `
          <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#111827">
            <h2 style="margin:0 0 16px;color:#061014">New portfolio message</h2>
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <div style="margin-top:18px;padding:16px;border-radius:12px;background:#f3f7fa">
              ${safeMessage}
            </div>
          </div>
        `
      })
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      sendJson(res, response.status, {
        error: data?.message || data?.error || 'Failed to send message.'
      })
      return
    }

    sendJson(res, 200, { ok: true, id: data?.id })
  } catch (error) {
    sendJson(res, 500, { error: 'Message service is temporarily unavailable.' })
  }
}

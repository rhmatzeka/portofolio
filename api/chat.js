const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions'
const DEFAULT_MODEL = 'openai/gpt-oss-120b'
const MAX_HISTORY_MESSAGES = 8
const MAX_MESSAGE_LENGTH = 900

const portfolioContext = `
You are RahmatDev Assistant, the AI assistant for Rahmat Eka Satria's portfolio website.
Answer visitors in a helpful, concise, friendly tone. Match the user's language when possible.

Rahmat Eka Satria profile:
- Budding developer focused on Web3, blockchain, frontend, UI/UX, and modern web experiences.
- Enjoys late-night coding, futuristic UI/UX, AI experimentation, and fullstack development.
- Goal: become a fullstack developer at a major tech company.
- Contact email: matsganz@gmail.com
- GitHub: https://github.com/rhmatzeka

Core stack:
- React, Next.js, TypeScript, JavaScript, Python, Solidity, Node.js, Figma
- Docker, CSS, Laravel, Nginx, Supabase, Prisma, Express, Tailwind, Java, PostgreSQL, MySQL
- Web3 tooling: ethers.js, Web3.js, MetaMask integration

Projects:
1. NationChain
   - Blockchain/Web3 platform for national identity and governance systems.
   - Stack: Solidity, Web3.js, React.
   - GitHub: https://github.com/rhmatzeka/nationchain
2. Mobile Wallet Ethereum
   - React Native Ethereum wallet with secure transaction flow and QR features.
   - Stack: React Native, Ethers.js, TypeScript.
   - GitHub: https://github.com/rhmatzeka/MobileAppsWalletEthereum
3. Arji Resto
   - Restaurant website with menu, contact, location, and reservation-oriented experience.
   - Stack: React, CSS, JavaScript.
   - GitHub: https://github.com/rhmatzeka/SIMResto.git
4. Banbuk Store
   - Company profile and product catalog platform for CV Banbuk Mandiri Jaya.
   - Stack: React, MySQL, PHP.
   - GitHub: https://github.com/rhmatzeka/CVBanbukStore

Rules:
- If asked about hiring, collaboration, or contact, point to email and GitHub.
- If you are unsure, say so and suggest contacting Rahmat.
- Do not invent private experience, education, prices, or availability.
- Keep most replies under 120 words unless the user asks for detail.
`

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

const sanitizeMessages = (messages) => {
  if (!Array.isArray(messages)) return []

  return messages
    .filter((message) => (
      message
      && (message.role === 'user' || message.role === 'assistant')
      && typeof message.content === 'string'
      && message.content.trim()
    ))
    .slice(-MAX_HISTORY_MESSAGES)
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, MAX_MESSAGE_LENGTH)
    }))
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

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    sendJson(res, 500, {
      error: 'AI assistant is not configured yet. Add GROQ_API_KEY in Vercel environment variables.'
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

  const userMessages = sanitizeMessages(body?.messages)
  if (!userMessages.length || userMessages[userMessages.length - 1].role !== 'user') {
    sendJson(res, 400, { error: 'Please send a user message.' })
    return
  }

  try {
    const groqResponse = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || DEFAULT_MODEL,
        messages: [
          { role: 'system', content: portfolioContext },
          ...userMessages
        ],
        temperature: 0.55,
        max_completion_tokens: 420
      })
    })

    const data = await groqResponse.json().catch(() => null)

    if (!groqResponse.ok) {
      sendJson(res, groqResponse.status, {
        error: data?.error?.message || 'Groq API request failed.'
      })
      return
    }

    const reply = data?.choices?.[0]?.message?.content?.trim()
    if (!reply) {
      sendJson(res, 502, { error: 'AI returned an empty response.' })
      return
    }

    sendJson(res, 200, { reply })
  } catch (error) {
    sendJson(res, 500, { error: 'AI assistant is temporarily unavailable.' })
  }
}

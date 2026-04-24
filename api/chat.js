const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions'
const DEFAULT_MODEL = 'openai/gpt-oss-120b'
const MAX_HISTORY_MESSAGES = 8
const MAX_MESSAGE_LENGTH = 900
const { fetchPresencePayload, getPresencePromptContext } = require('./_presenceData')

const portfolioContext = `
You are RahmatDev Assistant, the AI assistant for Rahmat Eka Satria's portfolio website.
You were created and integrated by Rahmat for his portfolio website.
Answer visitors in a helpful, concise, confident, modern tone. Match the user's language when possible.
Default vibe:
- Casual, gaul, kekinian, and natural.
- Can be lightly teasing or a tiny bit "toxic" in a playful way when the user is casual too.
- Never become abusive, hateful, degrading, sexually explicit, or hostile.
- Never sound stiff, corporate, or robotic unless the user explicitly wants formal language.
- Keep the energy witty and cool, but still useful.
- You may sprinkle simple text emotes or character-style expressions sometimes, like: :v, :D, wkwk, bro, jir, cuy, bjir, santai, gas.
- Do not overdo emotes. Use them lightly so the reply still feels clean and readable.

Identity rules:
- If someone asks who you are, say you are RahmatDev Assistant, an AI assistant made by Rahmat for this website.
- Do not claim to be ChatGPT, GPT-4, or "OpenAI's assistant" as your identity.
- If asked about the technology behind you, say you are RahmatDev Assistant built by Rahmat and powered by an external AI model.
- Do not say you were "trained by OpenAI" unless the user specifically asks for technical model/provider details.

Rahmat Eka Satria profile:
- Budding developer focused on Web3, blockchain, frontend, UI/UX, and modern web experiences.
- Enjoys late-night coding, futuristic UI/UX, AI experimentation, and fullstack development.
- Goal: become a fullstack developer at a major tech company.
- Contact email: matsganz@gmail.com
- GitHub: https://github.com/rhmatzeka
- Instagram: https://instagram.com/rahmatdev.id
- Twitter/X: https://twitter.com/rahmatdevID

Core stack:
- React, Next.js, TypeScript, JavaScript, Python, Solidity, Node.js, Figma
- Docker, CSS, Laravel, Nginx, Supabase, Prisma, Express, Tailwind, Java, PostgreSQL, MySQL
- Web3 tooling: ethers.js, Web3.js, MetaMask integration

Projects:
1. NationChain
   - Blockchain/Web3 platform for national identity and governance systems.
   - Stack: Solidity, Web3.js, React.
   - GitHub: https://github.com/rhmatzeka/nationchain
2. Ethernest
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
- If asked about hiring, collaboration, or contact, point to email, GitHub, Instagram, and Twitter/X.
- If you are unsure, say so and suggest contacting Rahmat.
- Do not invent private experience, education, prices, or availability.
- Keep most replies under 120 words unless the user asks for detail.
- When the user writes in Indonesian, reply in natural Indonesian. Casual is preferred unless they sound formal.
- When the user writes in English, reply in natural English.
- If the user is playful, you can answer with light banter. Keep it charming, not mean.
- Output plain text only.
- Do not use markdown bold, italics, bullet formatting, or asterisks for emphasis.
- Never wrap words with ** or __.
`

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

const stripMarkdownDecorators = (value) => (
  value
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
)

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
    let livePresenceContext = 'Live activity status: unavailable right now.'

    try {
      const presencePayload = await fetchPresencePayload()
      livePresenceContext = getPresencePromptContext(presencePayload)
    } catch (error) {
      // Keep a soft fallback so chat still works even if presence fetch fails.
    }

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
          { role: 'system', content: livePresenceContext },
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

    const reply = stripMarkdownDecorators(data?.choices?.[0]?.message?.content?.trim() || '')
    if (!reply) {
      sendJson(res, 502, { error: 'AI returned an empty response.' })
      return
    }

    sendJson(res, 200, { reply })
  } catch (error) {
    sendJson(res, 500, { error: 'AI assistant is temporarily unavailable.' })
  }
}

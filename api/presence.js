const { fetchPresencePayload } = require('./_presenceData')

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300')
  res.end(JSON.stringify(payload))
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' })
    return
  }

  try {
    const payload = await fetchPresencePayload()
    sendJson(res, 200, payload)
  } catch (error) {
    sendJson(res, 200, {
      ok: false,
      githubUsername: 'rhmatzeka',
      discordConfigured: Boolean(process.env.DISCORD_USER_ID),
      live: {
        online: false,
        activity: null,
        coding: null,
        music: null,
        status: 'offline'
      },
      lastCoding: null,
      updatedAt: Date.now()
    })
  }
}

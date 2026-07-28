const { fetchPresencePayload } = require('./_presenceData')
const { sendJson } = require('./_http')

const sendPresenceJson = (res, statusCode, payload) => sendJson(res, statusCode, payload, {
  cacheControl: 'public, max-age=0, s-maxage=60, stale-while-revalidate=300'
})

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    sendPresenceJson(res, 405, { error: 'Method not allowed' })
    return
  }

  try {
    const payload = await fetchPresencePayload()
    sendPresenceJson(res, 200, payload)
  } catch (error) {
    sendPresenceJson(res, 200, {
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

const GITHUB_USERNAME = 'rhmatzeka'
const GITHUB_EVENTS_ENDPOINT = `https://api.github.com/users/${GITHUB_USERNAME}/events/public`
const LANYARD_BASE_ENDPOINT = 'https://api.lanyard.rest/v1/users/'
const CODING_ACTIVITY_MATCHERS = [
  'visual studio code',
  'cursor',
  'windsurf',
  'vscodium',
  'webstorm',
  'intellij',
  'neovim',
  'zed',
  'sublime text',
  'android studio'
]

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300')
  res.end(JSON.stringify(payload))
}

const normalizeRepoName = (repoName) => (
  typeof repoName === 'string' ? repoName.replace(`${GITHUB_USERNAME}/`, '') : ''
)

const isCodingActivity = (activity) => {
  const haystack = [
    activity?.name,
    activity?.details,
    activity?.state,
    activity?.assets?.large_text,
    activity?.assets?.small_text
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return CODING_ACTIVITY_MATCHERS.some((matcher) => haystack.includes(matcher))
}

const getCodingPresence = (presence) => {
  const codingActivity = presence?.activities?.find(isCodingActivity)
  if (!codingActivity) return null

  return {
    app: codingActivity.name || 'Coding',
    details: codingActivity.details || codingActivity.state || 'Locked in and shipping',
    startedAt: codingActivity.timestamps?.start || codingActivity.created_at || null
  }
}

const getMusicPresence = (presence) => {
  if (!presence?.listening_to_spotify || !presence?.spotify) return null

  return {
    song: presence.spotify.song,
    artist: presence.spotify.artist,
    album: presence.spotify.album,
    albumArtUrl: presence.spotify.album_art_url,
    startedAt: presence.spotify.timestamps?.start || null,
    endsAt: presence.spotify.timestamps?.end || null
  }
}

const getLastCodingEvent = (events) => {
  if (!Array.isArray(events)) return null

  const latestPush = events.find((event) => event?.type === 'PushEvent')
  if (latestPush) {
    const commitCount = Array.isArray(latestPush.payload?.commits) ? latestPush.payload.commits.length : 0

    return {
      type: 'push',
      repo: normalizeRepoName(latestPush.repo?.name),
      timestamp: latestPush.created_at,
      summary: commitCount > 0
        ? `Pushed ${commitCount} commit${commitCount > 1 ? 's' : ''}`
        : 'Pushed fresh code'
    }
  }

  const latestPullRequest = events.find((event) => event?.type === 'PullRequestEvent')
  if (latestPullRequest) {
    return {
      type: 'pull_request',
      repo: normalizeRepoName(latestPullRequest.repo?.name),
      timestamp: latestPullRequest.created_at,
      summary: 'Touched a pull request'
    }
  }

  const latestCreate = events.find((event) => event?.type === 'CreateEvent')
  if (latestCreate) {
    return {
      type: 'create',
      repo: normalizeRepoName(latestCreate.repo?.name),
      timestamp: latestCreate.created_at,
      summary: 'Created something new'
    }
  }

  return null
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' })
    return
  }

  const discordUserId = process.env.DISCORD_USER_ID

  try {
    const requests = [
      fetch(GITHUB_EVENTS_ENDPOINT, {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'rahmatdev-portfolio'
        }
      })
    ]

    if (discordUserId) {
      requests.push(fetch(`${LANYARD_BASE_ENDPOINT}${discordUserId}`))
    }

    const [githubResponse, lanyardResponse] = await Promise.all(requests)
    const githubEvents = await githubResponse.json().catch(() => [])
    const lanyardPayload = lanyardResponse
      ? await lanyardResponse.json().catch(() => null)
      : null

    const presence = lanyardPayload?.success ? lanyardPayload.data : null

    sendJson(res, 200, {
      ok: true,
      githubUsername: GITHUB_USERNAME,
      discordConfigured: Boolean(discordUserId),
      live: {
        coding: getCodingPresence(presence),
        music: getMusicPresence(presence),
        status: presence?.discord_status || 'offline'
      },
      lastCoding: getLastCodingEvent(githubEvents),
      updatedAt: Date.now()
    })
  } catch (error) {
    sendJson(res, 200, {
      ok: false,
      githubUsername: GITHUB_USERNAME,
      discordConfigured: Boolean(process.env.DISCORD_USER_ID),
      live: {
        coding: null,
        music: null,
        status: 'offline'
      },
      lastCoding: null,
      updatedAt: Date.now()
    })
  }
}

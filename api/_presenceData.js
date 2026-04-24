const GITHUB_USERNAME = 'rhmatzeka'
const GITHUB_EVENTS_ENDPOINT = `https://api.github.com/users/${GITHUB_USERNAME}/events/public`
const LANYARD_BASE_ENDPOINT = 'https://api.lanyard.rest/v1/users/'
const CODING_ACTIVITY_MATCHERS = [
  'code',
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

  const details = codingActivity.details || null
  const state = codingActivity.state || null

  return {
    kind: 'coding',
    app: codingActivity.name || 'Coding',
    details: details || state || 'Locked in and shipping',
    state,
    label: 'Playing',
    name: codingActivity.name || 'Coding',
    largeText: codingActivity.assets?.large_text || null,
    smallText: codingActivity.assets?.small_text || null,
    startedAt: codingActivity.timestamps?.start || codingActivity.created_at || null
  }
}

const getPrimaryActivity = (presence) => {
  if (!presence?.activities?.length) return null

  const codingActivity = getCodingPresence(presence)
  if (codingActivity) return codingActivity

  const activity = presence.activities.find((item) => (
    item
    && item.type !== 2
    && item.type !== 4
    && item.name
  ))

  if (!activity) return null

  const activityLabels = {
    0: 'Playing',
    1: 'Streaming',
    2: 'Listening',
    3: 'Watching',
    5: 'Competing'
  }

  return {
    kind: 'activity',
    app: activity.name,
    details: activity.details || null,
    state: activity.state || null,
    label: activityLabels[activity.type] || 'Active now',
    name: activity.name,
    largeText: activity.assets?.large_text || null,
    smallText: activity.assets?.small_text || null,
    startedAt: activity.timestamps?.start || activity.created_at || null
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

const fetchPresencePayload = async () => {
  const discordUserId = process.env.DISCORD_USER_ID

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

  return {
    ok: true,
    githubUsername: GITHUB_USERNAME,
    discordConfigured: Boolean(discordUserId),
    live: {
      online: Boolean(presence && presence.discord_status && presence.discord_status !== 'offline'),
      activity: getPrimaryActivity(presence),
      coding: getCodingPresence(presence),
      music: getMusicPresence(presence),
      status: presence?.discord_status || 'offline'
    },
    lastCoding: getLastCodingEvent(githubEvents),
    updatedAt: Date.now()
  }
}

const getPresencePromptContext = (payload) => {
  if (!payload?.live) {
    return [
      'Live activity status: unavailable.',
      'If someone asks what Rahmat is doing right now, say the live activity is unavailable at the moment.'
    ].join('\n')
  }

  if (payload.live.music) {
    return [
      'Live activity status:',
      `- Indonesian: Rahmat lagi dengerin lagu nih sekarang: ${payload.live.music.song || 'lagu'}${payload.live.music.artist ? ` by ${payload.live.music.artist}` : ''}.`,
      `- English: Rahmat is listening to ${payload.live.music.song || 'music'}${payload.live.music.artist ? ` by ${payload.live.music.artist}` : ''} right now.`,
      'If someone asks what Rahmat is doing right now, answer using this live status first.'
    ].join('\n')
  }

  if (payload.live.activity) {
    const activity = payload.live.activity
    const detail = activity.details || activity.state || activity.largeText || ''

    if (activity.kind === 'coding') {
      return [
        'Live activity status:',
        `- Indonesian: Rahmat lagi ngoding nih sekarang${activity.app ? ` di ${activity.app}` : ''}${detail ? `, ${detail}` : ''}.`,
        `- English: Rahmat is coding right now${activity.app ? ` in ${activity.app}` : ''}${detail ? `, ${detail}` : ''}.`,
        'If someone asks what Rahmat is doing right now, answer using this live status first.'
      ].join('\n')
    }

    return [
      'Live activity status:',
      `- Indonesian: Rahmat lagi buka ${activity.app || 'aplikasi'} nih sekarang${detail ? `, ${detail}` : ''}.`,
      `- English: Rahmat is using ${activity.app || 'an app'} right now${detail ? `, ${detail}` : ''}.`,
      'If someone asks what Rahmat is doing right now, answer using this live status first.'
    ].join('\n')
  }

  if (payload.live.online) {
    return [
      'Live activity status:',
      '- Indonesian: Rahmat lagi online sekarang, tapi activity detailnya belum kebaca.',
      '- English: Rahmat is online right now, but the detailed activity is not visible yet.',
      'If someone asks what Rahmat is doing right now, answer using this live status first.'
    ].join('\n')
  }

  if (payload.lastCoding) {
    return [
      'Live activity status:',
      `- Indonesian: Rahmat lagi nggak keliatan aktif live sekarang. Aktivitas coding publik terakhir: ${payload.lastCoding.summary}${payload.lastCoding.repo ? ` on ${payload.lastCoding.repo}` : ''}.`,
      `- English: Rahmat does not appear to be live right now. Latest public coding activity: ${payload.lastCoding.summary}${payload.lastCoding.repo ? ` on ${payload.lastCoding.repo}` : ''}.`,
      'If someone asks what Rahmat is doing right now, mention that no live activity is visible and use the latest public activity only as fallback.'
    ].join('\n')
  }

  return [
    'Live activity status:',
    '- Indonesian: Belum ada activity live yang kebaca sekarang.',
    '- English: No live activity is visible right now.',
    'If someone asks what Rahmat is doing right now, say there is no live activity visible at the moment.'
  ].join('\n')
}

module.exports = {
  fetchPresencePayload,
  getPresencePromptContext
}

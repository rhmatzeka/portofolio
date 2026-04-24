import { useEffect, useMemo, useState } from 'react'
import './LivePresence.css'

const POLL_INTERVAL = 60000

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.02c-3.22.7-3.9-1.37-3.9-1.37-.53-1.35-1.29-1.71-1.29-1.71-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.72 1.27 3.38.97.1-.75.41-1.27.75-1.56-2.57-.29-5.27-1.29-5.27-5.74 0-1.27.45-2.3 1.19-3.11-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.19a11 11 0 0 1 5.78 0c2.2-1.5 3.17-1.19 3.17-1.19.64 1.59.24 2.77.12 3.06.74.81 1.19 1.84 1.19 3.11 0 4.46-2.71 5.45-5.3 5.74.42.36.79 1.06.79 2.15v3.19c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
)

const CodeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5 10 19" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const SpotifyIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 1.75A10.25 10.25 0 1 0 22.25 12 10.25 10.25 0 0 0 12 1.75Zm4.76 14.76a.64.64 0 0 1-.88.21 10.45 10.45 0 0 0-10.53-.69.64.64 0 1 1-.55-1.16 11.73 11.73 0 0 1 11.83.78.64.64 0 0 1 .13.86Zm1.26-2.8a.8.8 0 0 1-1.1.26 12.96 12.96 0 0 0-12.95-.84.8.8 0 1 1-.67-1.45 14.56 14.56 0 0 1 14.55.95.8.8 0 0 1 .17 1.08Zm.12-2.92A15.5 15.5 0 0 0 3.8 9.8a.96.96 0 0 1-.8-1.74 17.43 17.43 0 0 1 16.17 1.09.96.96 0 0 1-1.03 1.64Z" />
  </svg>
)

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.54 5.34A16.2 16.2 0 0 0 15.5 4l-.2.4a14.8 14.8 0 0 1 3.65 1.46 13.5 13.5 0 0 0-3.57-1.11 15.87 15.87 0 0 0-6.76 0A13.66 13.66 0 0 0 5.05 5.86 14.85 14.85 0 0 1 8.7 4.4L8.5 4a16.3 16.3 0 0 0-4.05 1.34C1.88 9.1 1.18 12.74 1.53 16.33a16.56 16.56 0 0 0 4.96 2.53l1.2-1.95c-.7-.26-1.37-.57-2-.95.17.12.35.23.53.33a12.16 12.16 0 0 0 11.56 0c.18-.1.36-.21.53-.33-.63.38-1.3.69-2 .95l1.2 1.95a16.47 16.47 0 0 0 4.96-2.53c.41-4.16-.7-7.77-2.93-10.99ZM8.92 14.13c-.97 0-1.76-.89-1.76-1.98s.78-1.98 1.76-1.98c.99 0 1.77.89 1.76 1.98 0 1.09-.78 1.98-1.76 1.98Zm6.16 0c-.97 0-1.76-.89-1.76-1.98s.78-1.98 1.76-1.98 1.77.89 1.76 1.98c0 1.09-.78 1.98-1.76 1.98Z" />
  </svg>
)

const formatRelativeTime = (value) => {
  if (!value) return 'recently'

  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return 'recently'

  const diffMs = timestamp - Date.now()
  const absMs = Math.abs(diffMs)
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  if (absMs < hour) return rtf.format(Math.round(diffMs / minute), 'minute')
  if (absMs < day) return rtf.format(Math.round(diffMs / hour), 'hour')
  return rtf.format(Math.round(diffMs / day), 'day')
}

const formatElapsedTime = (value) => {
  if (!value) return null

  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return null

  const totalSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

const formatStatusLabel = (status) => {
  const labels = {
    online: 'Online',
    idle: 'Idle',
    dnd: 'Do Not Disturb',
    offline: 'Offline'
  }

  return labels[status] || 'Offline'
}

const buildStatusCards = (data) => {
  const cards = []
  const discordStatus = data?.live?.status || 'offline'
  const activeActivity = data?.live?.activity

  if (data?.live?.online && activeActivity) {
    const description = activeActivity.state || activeActivity.largeText || `In ${activeActivity.app}`
    const footerParts = [
      activeActivity.details,
      formatElapsedTime(activeActivity.startedAt)
    ].filter(Boolean)

    cards.push({
      key: 'activity',
      theme: activeActivity.kind === 'coding' ? 'coding' : 'discord',
      eyebrow: activeActivity.label || 'Online',
      label: activeActivity.app || 'Discord',
      meta: description || 'Active on Discord right now',
      footer: footerParts.join('  |  '),
      badge: formatStatusLabel(discordStatus),
      artwork: '',
      status: discordStatus,
      icon: activeActivity.kind === 'coding' ? <CodeIcon /> : <DiscordIcon />
    })
  }

  if (data?.live?.music) {
    cards.push({
      key: 'music',
      theme: 'spotify',
      eyebrow: 'Listening',
      label: data.live.music.song || 'Listening now',
      meta: data.live.music.artist || 'Spotify',
      footer: formatElapsedTime(data.live.music.startedAt),
      badge: 'spotify',
      artwork: data.live.music.albumArtUrl || '',
      status: discordStatus,
      icon: <SpotifyIcon />
    })
  }

  if (!data?.live?.online && data?.live?.coding) {
    cards.push({
      key: 'coding',
      theme: 'coding',
      eyebrow: 'Coding',
      label: data.live.coding.app || 'Coding',
      meta: data.live.coding.state || data.live.coding.details || 'Locked in',
      footer: [
        data.live.coding.details,
        formatElapsedTime(data.live.coding.startedAt)
      ].filter(Boolean).join('  |  '),
      badge: 'Live',
      artwork: '',
      status: discordStatus,
      icon: <CodeIcon />
    })
  }

  if (data?.live?.online && !activeActivity) {
    cards.push({
      key: 'online',
      theme: 'discord',
      eyebrow: 'Discord',
      label: formatStatusLabel(discordStatus),
      meta: 'Online right now',
      footer: data?.discordConfigured
        ? 'Presence feed connected'
        : 'Add DISCORD_USER_ID to enable live activity',
      badge: formatStatusLabel(discordStatus),
      artwork: '',
      status: discordStatus,
      icon: <DiscordIcon />
    })
  }

  if (data?.lastCoding) {
    cards.push({
      key: 'history',
      theme: 'github',
      eyebrow: 'GitHub',
      label: `Last coded ${formatRelativeTime(data.lastCoding.timestamp)}`,
      meta: data.lastCoding.repo
        ? `${data.lastCoding.summary} on ${data.lastCoding.repo}`
        : data.lastCoding.summary,
      footer: data?.live?.online ? `Discord is ${formatStatusLabel(discordStatus).toLowerCase()}` : 'Latest public coding activity',
      badge: 'github',
      artwork: '',
      status: 'offline',
      icon: <GitHubIcon />
    })
  }

  return cards
}

const Visual = ({ card }) => {
  if (card.artwork) {
    return (
      <span className="island-visual artwork">
        <img src={card.artwork} alt="" loading="lazy" />
        {card.status && card.status !== 'offline' && (
          <span className={`presence-dot presence-dot-${card.status}`} aria-hidden="true" />
        )}
      </span>
    )
  }

  return (
    <span className="island-visual icon" aria-hidden="true">
      {card.icon}
      {card.status && card.status !== 'offline' && (
        <span className={`presence-dot presence-dot-${card.status}`} aria-hidden="true" />
      )}
    </span>
  )
}

const LivePresence = () => {
  const [presence, setPresence] = useState(null)

  useEffect(() => {
    let isMounted = true

    const loadPresence = async () => {
      try {
        const response = await fetch('/api/presence')
        const data = await response.json().catch(() => null)
        if (!response.ok || !data || !isMounted) return
        setPresence(data)
      } catch (error) {
        // Let the widget gracefully keep its fallback state.
      }
    }

    loadPresence()
    const intervalId = window.setInterval(loadPresence, POLL_INTERVAL)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
    }
  }, [])

  const cards = useMemo(() => buildStatusCards(presence), [presence])
  const primaryCard = cards[0] || {
    key: 'loading',
    theme: 'neutral',
    eyebrow: 'Presence',
    label: 'Loading live status',
    meta: 'Waking up the feed...',
    footer: '',
    badge: 'sync',
    artwork: '',
    status: 'offline',
    icon: <span className="island-pulse-dot" />
  }
  const secondaryCard = cards[1] || null

  return (
    <div className="live-presence-strip" aria-label="Activity status">
      <div className={`dynamic-island dynamic-island-${primaryCard.theme}`}>
        <div className="dynamic-island-inner">
          <Visual card={primaryCard} />

          <div className="dynamic-island-copy">
            {primaryCard.eyebrow && (
              <span className="dynamic-island-eyebrow">{primaryCard.eyebrow}</span>
            )}
            <span className="dynamic-island-label">{primaryCard.label}</span>
            <span className="dynamic-island-meta">{primaryCard.meta}</span>
            {primaryCard.footer && (
              <span className="dynamic-island-footer">{primaryCard.footer}</span>
            )}
          </div>

          <span className="dynamic-island-badge">{primaryCard.badge}</span>
        </div>

        {secondaryCard && (
          <div className="dynamic-island-mini">
            <Visual card={secondaryCard} />
            <div className="dynamic-island-mini-copy">
              <span className="dynamic-island-mini-text">{secondaryCard.badge}</span>
              <span className="dynamic-island-mini-label">{secondaryCard.label}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LivePresence

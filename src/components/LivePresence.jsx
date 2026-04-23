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

const buildStatusCards = (data) => {
  const cards = []

  if (data?.live?.music) {
    cards.push({
      key: 'music',
      theme: 'spotify',
      label: data.live.music.song || 'Listening now',
      meta: data.live.music.artist || 'Spotify',
      badge: 'spotify',
      artwork: data.live.music.albumArtUrl || '',
      icon: <SpotifyIcon />
    })
  }

  if (data?.live?.coding) {
    cards.push({
      key: 'coding',
      theme: 'coding',
      label: `Coding in ${data.live.coding.app}`,
      meta: data.live.coding.details || 'Locked in',
      badge: 'live',
      artwork: '',
      icon: <CodeIcon />
    })
  }

  if (data?.lastCoding) {
    cards.push({
      key: 'history',
      theme: 'github',
      label: `Last coded ${formatRelativeTime(data.lastCoding.timestamp)}`,
      meta: data.lastCoding.repo
        ? `${data.lastCoding.summary} on ${data.lastCoding.repo}`
        : data.lastCoding.summary,
      badge: 'github',
      artwork: '',
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
      </span>
    )
  }

  return (
    <span className="island-visual icon" aria-hidden="true">
      {card.icon}
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
    label: 'Loading live status',
    meta: 'Waking up the feed...',
    badge: 'sync',
    artwork: '',
    icon: <span className="island-pulse-dot" />
  }
  const secondaryCard = cards[1] || null

  return (
    <div className="live-presence-strip" aria-label="Activity status">
      <div className={`dynamic-island dynamic-island-${primaryCard.theme}`}>
        <div className="dynamic-island-inner">
          <Visual card={primaryCard} />

          <div className="dynamic-island-copy">
            <span className="dynamic-island-label">{primaryCard.label}</span>
            <span className="dynamic-island-meta">{primaryCard.meta}</span>
          </div>

          <span className="dynamic-island-badge">{primaryCard.badge}</span>
        </div>

        {secondaryCard && (
          <div className="dynamic-island-mini">
            <Visual card={secondaryCard} />
            <span className="dynamic-island-mini-text">{secondaryCard.badge}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default LivePresence

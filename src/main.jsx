import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const showConsoleSignature = () => {
  if (typeof window === 'undefined' || window.__RAHMAT_CONSOLE_SIGNATURE__) return
  window.__RAHMAT_CONSOLE_SIGNATURE__ = true

  const banner = String.raw`
██████╗░░█████╗░██╗░░██╗███╗░░░███╗░█████╗░████████╗██████╗░███████╗██╗░░░██╗
██╔══██╗██╔══██╗██║░░██║████╗░████║██╔══██╗╚══██╔══╝██╔══██╗██╔════╝██║░░░██║
██████╔╝███████║███████║██╔████╔██║███████║░░░██║░░░██║░░██║█████╗░░╚██╗░██╔╝
██╔══██╗██╔══██║██╔══██║██║╚██╔╝██║██╔══██║░░░██║░░░██║░░██║██╔══╝░░░╚████╔╝░
██║░░██║██║░░██║██║░░██║██║░╚═╝░██║██║░░██║░░░██║░░░██████╔╝███████╗░░╚██╔╝░░
╚═╝░░╚═╝╚═╝░░╚═╝╚═╝░░╚═╝╚═╝░░░░░╚═╝╚═╝░░╚═╝░░░╚═╝░░░╚═════╝░╚══════╝░░░╚═╝░░░`

  console.log(
    `%c${banner}`,
    [
      'color:#f8fafc',
      'background:#111417',
      'font:700 12px/1.12 Consolas,monospace',
      'letter-spacing:0',
      'text-shadow:0 0 14px rgba(255,255,255,.22),0 0 26px rgba(148,163,184,.24)'
    ].join(';')
  )

  console.log(
    '%cRahmat Eka Satria%c\nEmail  : matsganz@gmail.com\nGitHub : github.com/rhmatzeka',
    'color:#ffffff;font:700 13px Inter,Arial,sans-serif;line-height:1.8;',
    'color:#9fb4bd;font:500 12px Consolas,monospace;line-height:1.8;'
  )

  console.log(
    '%cSecurity note:%c never paste code here unless you know exactly what it does.',
    'color:#ff6b6b;font:700 12px Inter,Arial,sans-serif;',
    'color:#aebdc4;font:500 12px Inter,Arial,sans-serif;'
  )
}

showConsoleSignature()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

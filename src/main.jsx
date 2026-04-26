import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

if (import.meta.env.DEV && typeof window !== 'undefined' && !window.__RAHMAT_CONSOLE_SIGNATURE__) {
  window.__RAHMAT_CONSOLE_SIGNATURE__ = true
  console.log(
    '%cRahmat Eka Satria%c\nGitHub: github.com/rhmatzeka',
    'color:#ffffff;font:700 13px Inter,Arial,sans-serif;line-height:1.8;',
    'color:#9fb4bd;font:500 12px Consolas,monospace;line-height:1.8;'
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

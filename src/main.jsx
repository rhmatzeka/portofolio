import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Console Easter Egg
const art = `
%c
██████╗  █████╗ ██╗  ██╗███╗   ███╗ █████╗ ████████╗
██╔══██╗██╔══██╗██║  ██║████╗ ████║██╔══██╗╚══██╔══╝
██████╔╝███████║███████║██╔████╔██║███████║   ██║   
██╔══██╗██╔══██║██╔══██║██║╚██╔╝██║██╔══██║   ██║   
██║  ██║██║  ██║██║  ██║██║ ╚═╝ ██║██║  ██║   ██║   
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝   

██████╗ ███████╗██╗   ██╗
██╔══██╗██╔════╝██║   ██║
██║  ██║█████╗  ██║   ██║
██║  ██║██╔══╝  ╚██╗ ██╔╝
██████╔╝███████╗ ╚████╔╝ 
╚═════╝ ╚══════╝  ╚═══╝  
`

console.log(
  art,
  'color: #00d1ff; font-family: monospace; font-size: 10px; line-height: 1.2;'
)

console.log(
  '%c Hey there, curious dev!',
  'color: #ffffff; font-size: 16px; font-weight: bold;'
)

console.log(
  '%c Built with React + Vite + Three.js\n Blockchain & Web3 Developer\n matsganz@gmail.com\n github.com/rhmatzeka',
  'color: #00d1ff; font-size: 13px; line-height: 1.8;'
)

console.log(
  '%c Stop! This browser feature is for developers. If someone told you to paste something here, it\'s a scam.',
  'color: #ff4444; font-size: 12px; font-weight: bold;'
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

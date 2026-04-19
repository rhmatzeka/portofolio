import React, { memo } from 'react'
import ConnectWallet from './ConnectWallet'
import './Navbar.css'

const Navbar = memo(({ isScrolled }) => {
  const navItems = ['Home', 'About', 'Projects', 'Contact']
  
  return (
    <nav 
      className="navbar fixed-nav"
      style={isScrolled ? {
        top: '1.2rem',
        left: '50%',
        right: 'auto',
        width: 'fit-content',
        transform: 'translateX(-50%)',
        padding: '0.9rem 2.2rem',
        gap: '2rem',
        background: 'rgba(15, 15, 15, 0.92)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: '50px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
      } : {
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        transform: 'none',
        padding: '2rem 5rem',
        background: 'transparent',
        borderRadius: 0,
        border: '1px solid transparent',
        boxShadow: 'none'
      }}
    >
      <ul className="nav-links">
        {navItems.map(item => (
          <li key={item}>
            <a href={`#${item.toLowerCase()}`} className="nav-link">
              {item}
            </a>
          </li>
        ))}
      </ul>
      <div className="nav-right">
        <ConnectWallet compact />
      </div>
    </nav>
  )
})

Navbar.displayName = 'Navbar'

export default Navbar

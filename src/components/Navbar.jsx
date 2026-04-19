import React, { memo } from 'react'
import ConnectWallet from './ConnectWallet'
import './Navbar.css'

const Navbar = memo(({ isScrolled }) => {
  const navItems = ['Home', 'About', 'Projects', 'Contact']
  
  return (
    <nav className={`navbar fixed-nav ${isScrolled ? 'scrolled' : ''}`}>
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

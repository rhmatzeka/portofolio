import React from 'react'
import './Navbar.css'

const Navbar = ({ isScrolled }) => {
  const navItems = ['Home', 'About', 'Projects', 'Contact']
  
  console.log('Navbar isScrolled:', isScrolled)
  
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
      <a href="#contact" className="nav-button" style={{textDecoration: 'none'}}>Let's Talk!</a>
    </nav>
  )
}

export default Navbar

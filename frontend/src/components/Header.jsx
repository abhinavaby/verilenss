import React from 'react'

export default function Header({ onNavigate }) {
  return (
    <header>
      <div className="header-inner">
        <a href="#" className="logo" onClick={(e) => { e.preventDefault(); onNavigate('HOME'); }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12z"></path>
            <path d="M12 8v4"></path>
            <path d="M12 16h.01"></path>
          </svg>
          VERILENS
        </a>
        <nav className="nav-links">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('HOME'); }}>Home</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('HOW_IT_WORKS'); }}>How It Works</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('ABOUT'); }}>About</a>
        </nav>
      </div>
    </header>
  )
}

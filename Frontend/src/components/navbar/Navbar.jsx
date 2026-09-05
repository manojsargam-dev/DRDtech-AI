import React, { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = ({ onGetStartedClick }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`navbar-header ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container container">
        {/* Brand Logo */}
        <a href="#hero" className="navbar-brand">
          <span className="brand-name">DRDtech AI</span>
        </a>

        {/* Navigation Links */}
        <nav className="navbar-links">
          <a href="#features" className="nav-link">Features</a>
          <a href="#why-us" className="nav-link">Why Us</a>
          <a href="#benefits" className="nav-link">Benefits</a>
          <a href="#team" className="nav-link">Our Team</a>
          <a href="#faq" className="nav-link">FAQ</a>
        </nav>

        {/* CTA Button */}
        <div className="navbar-action">
          <button
            className="btn-get-started"
            onClick={onGetStartedClick || (() => {
              const el = document.getElementById('features');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            })}
          >
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

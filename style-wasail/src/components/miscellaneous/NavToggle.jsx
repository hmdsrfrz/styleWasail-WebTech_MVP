import { motion as Motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavToggle.css';

export default function NavToggle() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isNavHovered, setIsNavHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    
    // Clean up listener
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const navItems = [
    { name: 'Home', path: '/user-home' },
    { name: 'Moodboards', path: '/moodboards' },
    { name: 'Renting Dashboard', path: '/renting' },
    { name: 'Account Settings', path: '/account' }
  ];

  const toggleMenu = () => {
    setIsNavOpen(!isNavOpen);
  };

  const closeMenu = () => {
    if (isMobile) {
      setIsNavOpen(false);
    }
  };

  // Simplified animation variants
  const navVariants = {
    hidden: { x: -280 },
    visible: { x: 0 }
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      {isMobile && (
        <button
          className="menu-toggle"
          onClick={toggleMenu}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            {isNavOpen ? (
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            ) : (
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            )}
          </svg>
        </button>
      )}

      {/* Optimized navbar with CSS-based transitions */}
      <div 
        className={`navbar ${isNavOpen ? 'open' : ''} ${isNavHovered && !isMobile ? 'hovered' : ''}`}
        onMouseEnter={() => !isMobile && setIsNavHovered(true)}
        onMouseLeave={() => !isMobile && setIsNavHovered(false)}
      >
        <h2 className="app-title">
          Style Wasayl
        </h2>

        {navItems.map((item, index) => (
          <div
            key={item.name}
            className="nav-item"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <Link
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={closeMenu}
            >
              {item.name}
            </Link>
          </div>
        ))}
      </div>
    </>
  );
} 
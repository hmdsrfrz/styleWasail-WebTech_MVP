// src/pages/UserHome.jsx
import { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import VantaBackground from '../components/VantaBackground';
import OutfitGrid from '../components/OutfitGrid';
import CreateOutfitModal from '../components/CreateOutfitModal';
import '../components/OutfitGrid.css';

export default function UserHome() {
  const [isNavHovered, setIsNavHovered] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/user-home' },
    { name: 'Moodboards', path: '/moodboards' },
    { name: 'Renting Dashboard', path: '/renting' },
    { name: 'Account Settings', path: '/account' }
  ];

  const handleCreateOutfit = (outfitData) => {
    console.log('New outfit created:', outfitData);
    // In a real app, you would send this to your backend here
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <VantaBackground />

      {/* Hoverable Navbar */}
      <Motion.div
        onHoverStart={() => setIsNavHovered(true)}
        onHoverEnd={() => setIsNavHovered(false)}
        initial={{ x: -280 }}
        animate={{ x: isNavHovered ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100vh',
          width: '300px',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(12px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.3)',
          zIndex: 100,
          padding: '2rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}
      >
        <Motion.h2 
          style={{
            fontFamily: "'Cal Sans', sans-serif",
            fontSize: '1.8rem',
            fontWeight: 700,
            color: 'rgb(94, 9, 65)',
            marginBottom: '2rem',
            paddingLeft: '1rem'
          }}
        >
          Style Wasa'il
        </Motion.h2>

        {navItems.map((item, index) => (
          <Motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.3 }}
          >
            <Link
              to={item.path}
              style={{
                fontFamily: "'Merriweather', serif",
                fontSize: '1.2rem',
                fontWeight: 400,
                color: 'rgb(94, 9, 65)',
                textDecoration: 'none',
                padding: '0.8rem 1rem',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                display: 'block',
                backgroundColor: location.pathname === item.path 
                  ? 'rgba(94, 9, 65, 0.1)' 
                  : 'transparent'
              }}
            >
              {item.name}
            </Link>
          </Motion.div>
        ))}
      </Motion.div>

      {/* Main Content - Outfit Grid */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          marginLeft: '300px',
          padding: '2rem',
          height: '100%',
          overflowY: 'auto'
        }}
      >
        <OutfitGrid />
      </Motion.div>

      {/* Create Outfit Button */}
      <Motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowCreateModal(true)}
        style={{
          position: 'fixed',
          right: '20px',
          bottom: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: 'rgb(94, 9, 65)',
          color: 'white',
          border: 'none',
          fontSize: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 100,
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
        }}
      >
        +
      </Motion.button>

      {/* Create Outfit Modal */}
      {showCreateModal && (
        <CreateOutfitModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateOutfit}
        />
      )}
    </div>
  );
}
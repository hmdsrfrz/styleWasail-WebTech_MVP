import { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import VantaBackground from '../../components/miscellaneous/VantaBackground';
import OutfitGrid from '../../components/outfit/OutfitGrid';
import CreateOutfitModal from '../../components/outfit/CreateOutfitModal';
import '../../components/outfit/OutfitGrid.css';
import './UserHome.css';

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
    <div className="user-home-container">
      <VantaBackground />

      {/* Hoverable Navbar */}
      <Motion.div
        onHoverStart={() => setIsNavHovered(true)}
        onHoverEnd={() => setIsNavHovered(false)}
        initial={{ x: -280 }}
        animate={{ x: isNavHovered ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="navbar"
      >
        <Motion.h2 className="app-title">
          Style Wasayl
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
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
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
        className="main-content"
      >
        <OutfitGrid />
      </Motion.div>

      {/* Create Outfit Button */}
      <Motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowCreateModal(true)}
        className="create-button"
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
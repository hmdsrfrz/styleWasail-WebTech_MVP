import { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import VantaBackground from '../../components/miscellaneous/VantaBackground';
import NavToggle from '../../components/miscellaneous/NavToggle';
import OutfitGrid from '../../components/outfit/OutfitGrid';
import CreateOutfitModal from '../../components/outfit/CreateOutfitModal';
import FilterModal from '../../components/outfit/FilterModal';
import '../../components/outfit/OutfitGrid.css';
import './UserHome.css';

export default function UserHome() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const location = useLocation();

  const handleCreateOutfit = (outfitData) => {
    console.log('New outfit created:', outfitData);
    // In a real app, you would send this to your backend here
  };

  const handleFilter = (tags) => {
    setSelectedTags(tags);
    setShowFilterModal(false);
  };

  return (
    <div className="user-home-container">
      <VantaBackground />
      <NavToggle />

      {/* Main Content - Outfit Grid */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="main-content"
      >
        {/* Header with Logo and Tagline */}
        <div className="home-header">
          <div className="logo-container">
            <svg className="sw-logo" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              {/* Background circle */}
              <circle cx="16" cy="16" r="16" fill="#5E0941"/>
              
              {/* Stylized "S" */}
              <path d="M22 10C22 10 20 8 16 8C12 8 10 10 10 12C10 14 12 15 14 16C16 17 18 18 18 20C18 22 16 24 12 24" 
                    stroke="white" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"/>
              
              {/* Small dot */}
              <circle cx="12" cy="24" r="1" fill="white"/>
            </svg>
          </div>
          <div className="tagline-container">
            <Motion.h1 
              className="tagline"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="highlight">STYLE</span> IT OUT
            </Motion.h1>
            <Motion.p 
              className="subtagline"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Discover, share, and rent the perfect outfits for any occasion
            </Motion.p>
          </div>
        </div>
        
        <OutfitGrid selectedTags={selectedTags} />
      </Motion.div>

      {/* Filter Button */}
      <Motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowFilterModal(true)}
        className="filter-button"
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" fill="currentColor"/>
        </svg>
      </Motion.button>

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

      {/* Filter Modal */}
      {showFilterModal && (
        <FilterModal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          onFilter={handleFilter}
          selectedTags={selectedTags}
        />
      )}
    </div>
  );
}
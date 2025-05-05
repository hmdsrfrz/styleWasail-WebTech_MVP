import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import VantaBackground from '../../components/miscellaneous/VantaBackground';
import Navbar from '../../components/miscellaneous/Navbar';
import { useMoodboards } from '../../context/MoodboardContext';
import './Moodboards.css';

export default function Moodboards() {
  const { moodboards, addMoodboard, isLoading } = useMoodboards();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  
  const handleMoodboardClick = (moodboardId) => {
    navigate(`/moodboards/${moodboardId}`);
  };
  
  const handleCreateNew = () => {
    setIsCreateModalOpen(true);
  };
  
  const handleCreateSubmit = () => {
    if (newBoardName.trim()) {
      const newBoard = addMoodboard(newBoardName);
      setIsCreateModalOpen(false);
      setNewBoardName('');
      navigate(`/moodboards/${newBoard.id}`);
    }
  };

  return (
    <div className="moodboards-container">
      <VantaBackground />
      <Navbar />
      
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="content-wrapper"
      >
        <Motion.h1 className="title">
          Your Moodboards
        </Motion.h1>
        
        {isLoading ? (
          <div className="loading-container">
            <p className="loading-text">Loading your moodboards...</p>
          </div>
        ) : (
          <div className="moodboards-grid">
            {moodboards.map((moodboard) => (
              <Motion.div
                key={moodboard.id}
                whileHover={{ y: -5 }}
                onClick={() => handleMoodboardClick(moodboard.id)}
                className="moodboard-card"
              >
                <h3 className="moodboard-name">{moodboard.name}</h3>
                <p className="outfit-count">{moodboard.outfitCount} saved outfits</p>
              </Motion.div>
            ))}
            
            <Motion.div
              whileHover={{ y: -5, backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
              onClick={handleCreateNew}
              className="new-moodboard-card"
            >
              <div className="add-icon-container">
                <span className="add-icon">+</span>
              </div>
              <h3 className="moodboard-name">Create New</h3>
              <p className="outfit-count">Start a new collection</p>
            </Motion.div>
          </div>
        )}
      </Motion.div>
      
      {/* Create new moodboard modal */}
      {isCreateModalOpen && (
        <Motion.div 
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setIsCreateModalOpen(false)}
        >
          <Motion.div
            className="modal-content"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal-title">
              Create New Moodboard
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input
                type="text"
                placeholder="Moodboard name"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                className="modal-input"
                autoFocus
              />
              
              <div className="button-group">
                <button
                  className="cancel-button"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </button>
                
                <button
                  className="create-button"
                  onClick={handleCreateSubmit}
                  disabled={!newBoardName.trim()}
                >
                  Create
                </button>
              </div>
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </div>
  );
}
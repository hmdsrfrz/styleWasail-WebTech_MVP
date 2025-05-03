// src/pages/Moodboards.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import VantaBackground from '../components/VantaBackground';
import Navbar from '../components/Navbar';
import { useMoodboards } from '../context/MoodboardContext';

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
      
      // Navigate to the newly created moodboard
      navigate(`/moodboards/${newBoard.id}`);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <VantaBackground />
      <Navbar />
      
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          padding: '2rem',
          marginLeft: '300px',
          overflowY: 'auto'
        }}
      >
        <Motion.h1
          style={{
            fontFamily: "'Cal Sans', sans-serif",
            fontSize: '3rem',
            fontWeight: 700,
            color: 'rgb(94, 9, 65)',
            marginBottom: '2rem'
          }}
        >
          Your Moodboards
        </Motion.h1>
        
        {isLoading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '50vh' 
          }}>
            <p style={{ color: 'rgb(94, 9, 65)' }}>Loading your moodboards...</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {moodboards.map((moodboard) => (
              <Motion.div
                key={moodboard.id}
                whileHover={{ y: -5 }}
                onClick={() => handleMoodboardClick(moodboard.id)}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  cursor: 'pointer'
                }}
              >
                <h3 style={{ color: 'rgb(94, 9, 65)', marginBottom: '1rem' }}>{moodboard.name}</h3>
                <p style={{ color: 'rgba(94, 9, 65, 0.8)' }}>{moodboard.outfitCount} saved outfits</p>
              </Motion.div>
            ))}
            
            <Motion.div
              whileHover={{ y: -5, backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
              onClick={handleCreateNew}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                borderRadius: '20px',
                padding: '1.5rem',
                border: '2px dashed rgba(94, 9, 65, 0.3)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div style={{ 
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: 'rgba(94, 9, 65, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <span style={{ fontSize: '2rem', color: 'rgb(94, 9, 65)' }}>+</span>
              </div>
              <h3 style={{ color: 'rgb(94, 9, 65)', marginBottom: '0.5rem' }}>Create New</h3>
              <p style={{ color: 'rgba(94, 9, 65, 0.8)', textAlign: 'center' }}>Start a new collection</p>
            </Motion.div>
          </div>
        )}
      </Motion.div>
      
      {/* Create new moodboard modal */}
      {isCreateModalOpen && (
        <Motion.div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setIsCreateModalOpen(false)}
        >
          <Motion.div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              borderRadius: '24px',
              padding: '30px',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
            }}
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: 'rgb(94, 9, 65)', marginBottom: '20px', fontFamily: "'Cal Sans', sans-serif", fontSize: '24px' }}>
              Create New Moodboard
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input
                type="text"
                placeholder="Moodboard name"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(94, 9, 65, 0.3)',
                  fontSize: '16px',
                  outline: 'none'
                }}
                autoFocus
              />
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  style={{
                    padding: '10px 15px',
                    borderRadius: '8px',
                    backgroundColor: 'transparent',
                    border: '1px solid #ccc',
                    color: '#333',
                    cursor: 'pointer'
                  }}
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </button>
                
                <button
                  style={{
                    padding: '10px 15px',
                    borderRadius: '8px',
                    backgroundColor: 'rgb(94, 9, 65)',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '600',
                    opacity: newBoardName.trim() ? 1 : 0.5
                  }}
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
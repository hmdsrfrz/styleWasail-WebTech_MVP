// src/pages/Moodboards.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import VantaBackground from '../../components/miscellaneous/VantaBackground';
import Navbar from '../../components/miscellaneous/Navbar';
import { useMoodboards } from '../../context/MoodboardContext';
import { useAuth } from '../../context/AuthContext';

export default function Moodboards() {
  const { moodboards, addMoodboard, isLoading, error } = useMoodboards();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [createError, setCreateError] = useState(null);
  
  const handleMoodboardClick = (moodboardId) => {
    navigate(`/moodboards/${moodboardId}`);
  };
  
  const handleCreateNew = () => {
    setIsCreateModalOpen(true);
  };
  
  const handleCreateSubmit = async () => {
    try {
      setCreateError(null);
      if (newBoardName.trim()) {
        const newBoard = await addMoodboard(newBoardName, newBoardDescription, isPublic);
        setIsCreateModalOpen(false);
        setNewBoardName('');
        setNewBoardDescription('');
        setIsPublic(true);
        
        // Navigate to the newly created moodboard
        navigate(`/moodboards/${newBoard._id}`);
      }
    } catch (err) {
      setCreateError('Failed to create moodboard. Please try again.');
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
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '2rem'
          }}
        >
          Your Moodboards
          <button
            onClick={handleCreateNew}
            style={{
              background: 'rgb(94, 9, 65)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '0.75rem 1.5rem',
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(94,9,65,0.12)',
              transition: 'background 0.2s',
              marginLeft: 'auto'
            }}
          >
            + Create Moodboard
          </button>
        </Motion.h1>
        
        {isLoading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '50vh' 
          }}>
            <p style={{ color: 'rgb(94, 9, 65)' }}>Loading your moodboard...</p>
          </div>
        ) : error ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '50vh' 
          }}>
            <p style={{ color: 'rgb(94, 9, 65)' }}>{error}</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {moodboards.map((moodboard) => {
              // Get up to the first 4 outfit images
              const outfitImages = (moodboard.outfits || [])
                .slice(0, 4)
                .map(o => o.outfit?.mainImage)
                .filter(Boolean);
              return (
                <Motion.div
                  key={moodboard._id}
                  whileHover={{ y: -5 }}
                  onClick={() => handleMoodboardClick(moodboard._id)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    cursor: 'pointer',
                    minHeight: '320px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                  }}
                >
                  {/* Collage of up to 4 images or pink background if none */}
                  <div style={{
                    width: '100%',
                    height: '180px',
                    display: 'grid',
                    gridTemplateColumns: outfitImages.length > 1 ? '1fr 1fr' : '1fr',
                    gridTemplateRows: outfitImages.length > 2 ? '1fr 1fr' : '1fr',
                    gap: '4px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: outfitImages.length === 0 ? 'linear-gradient(135deg, #ffb6d5 0%, #fff0f6 100%)' : '#eee',
                    marginBottom: '1rem',
                  }}>
                    {outfitImages.length > 0 ? (
                      outfitImages.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt="Moodboard preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ))
                    ) : null}
                  </div>
                  <h3 style={{ color: 'rgb(94, 9, 65)', marginBottom: '1rem' }}>{moodboard.name}</h3>
                  <p style={{ color: 'rgba(94, 9, 65, 0.8)' }}>
                    {moodboard.outfits?.length || 0} saved outfits
                  </p>
                </Motion.div>
              );
            })}
          </div>
        )}
      </Motion.div>
      
      {/* Create new moodboard modal */}
      {isCreateModalOpen && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
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
            alignItems: 'center'
          }}
        >
          <Motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '2rem',
              width: '90%',
              maxWidth: '500px'
            }}
          >
            <h2 style={{ color: 'rgb(94, 9, 65)', marginBottom: '1.5rem' }}>Create New Moodboard</h2>
            
            {createError && (
              <p style={{ color: 'red', marginBottom: '1rem' }}>{createError}</p>
            )}
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>
                Name
              </label>
              <input
                type="text"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: '1px solid #ccc',
                  fontSize: '1rem'
                }}
                placeholder="Enter moodboard name"
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>
                Description
              </label>
              <textarea
                value={newBoardDescription}
                onChange={(e) => setNewBoardDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: '1px solid #ccc',
                  fontSize: '1rem',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
                placeholder="Describe your moodboard"
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#333' }}>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                Make this moodboard public
              </label>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px',
                  border: '1px solid #ccc',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSubmit}
                disabled={!newBoardName.trim()}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: 'rgb(94, 9, 65)',
                  color: 'white',
                  cursor: 'pointer',
                  opacity: !newBoardName.trim() ? 0.5 : 1
                }}
              >
                Create
              </button>
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </div>
  );
}
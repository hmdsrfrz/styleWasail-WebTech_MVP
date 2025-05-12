// src/pages/Moodboards.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import VantaBackground from '../../components/miscellaneous/VantaBackground';
import NavToggle from '../../components/miscellaneous/NavToggle';
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
    <div style={{ 
      position: 'relative', 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      textRendering: 'optimizeLegibility',
    }}>
      <VantaBackground />
      <NavToggle />
      
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          padding: '2.5rem',
          marginLeft: '300px',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(94, 9, 65, 0.5) transparent'
        }}
      >
        <Motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            marginBottom: '3rem',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Motion.h1
            style={{
              fontFamily: "'Cal Sans', var(--font-primary)",
              fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
              fontWeight: 700,
              color: 'rgb(94, 9, 65)',
              marginBottom: '1rem',
              textAlign: 'center',
              position: 'relative',
              letterSpacing: '-0.02em',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            gap: '2rem'
          }}
        >
          Your Moodboards
          </Motion.h1>
          <div style={{
            height: '3px',
            width: '80px',
            background: 'linear-gradient(to right, transparent, rgb(94, 9, 65), transparent)',
            borderRadius: '4px',
            marginBottom: '2rem'
          }}/>
          <button
            onClick={handleCreateNew}
            style={{
              background: 'linear-gradient(135deg, rgb(94, 9, 65), rgb(74, 9, 55))',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '0.85rem 1.75rem',
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(94,9,65,0.18)',
              transition: 'all 0.3s ease',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(94,9,65,0.25)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(94,9,65,0.18)';
            }}
          >
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>+</span> Create Moodboard
          </button>
        </Motion.div>
        
        {isLoading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '50vh',
            fontSize: '1.1rem',
            fontWeight: 500,
            color: 'rgb(94, 9, 65)',
            letterSpacing: '0.02em'
          }}>
            <p>Loading your moodboards...</p>
          </div>
        ) : error ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '50vh',
            fontSize: '1.1rem',
            color: 'rgb(94, 9, 65)',
            background: 'rgba(255, 255, 255, 0.4)',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px dashed rgba(94, 9, 65, 0.3)',
          }}>
            <p>{error}</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '2.5rem',
            maxWidth: '88%',
            margin: '0 auto'
          }}>
            {moodboards.map((moodboard) => {
              // Get up to the first 4 outfit images with proper null checks
              const outfitImages = (moodboard?.outfits || [])
                .slice(0, 4)
                .map(o => o?.outfit?.mainImage)
                .filter(Boolean);
              return (
                <Motion.div
                  key={moodboard._id}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  onClick={() => handleMoodboardClick(moodboard._id)}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: '20px',
                    padding: '1.75rem',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    cursor: 'pointer',
                    minHeight: '320px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    boxShadow: '0 4px 20px rgba(94, 9, 65, 0.08)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {/* Collage of up to 4 images or pink background if none */}
                  <div style={{
                    width: '100%',
                    height: '200px',
                    display: 'grid',
                    gridTemplateColumns: outfitImages.length > 1 ? '1fr 1fr' : '1fr',
                    gridTemplateRows: outfitImages.length > 2 ? '1fr 1fr' : '1fr',
                    gap: '4px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    background: outfitImages.length === 0 ? 'linear-gradient(135deg, #ffb6d5 0%, #fff0f6 100%)' : '#eee',
                    marginBottom: '1.5rem',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.7)'
                  }}>
                    {outfitImages.length > 0 ? (
                      outfitImages.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt="Moodboard preview"
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            transition: 'transform 0.5s ease' 
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        />
                      ))
                    ) : (
                      <p style={{ 
                        color: 'rgb(94, 9, 65)', 
                        textAlign: 'center',
                        padding: '1rem',
                        fontSize: '0.95rem',
                        fontStyle: 'italic',
                        fontWeight: 500,
                        letterSpacing: '0.01em'
                      }}>
                        No outfits added yet
                      </p>
                    )}
                  </div>
                  <h3 style={{ 
                    color: 'rgb(94, 9, 65)', 
                    marginBottom: '0.75rem',
                    fontSize: '1.35rem',
                    fontWeight: 600,
                    letterSpacing: '-0.01em',
                    position: 'relative',
                    paddingBottom: '8px'
                  }}>
                    {moodboard.name}
                    <span style={{
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      height: '2px',
                      width: '30px',
                      background: 'rgba(94, 9, 65, 0.3)',
                      borderRadius: '2px'
                    }}></span>
                  </h3>
                  <p style={{ 
                    color: 'rgba(94, 9, 65, 0.8)',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'rgb(94, 9, 65)',
                      opacity: 0.6
                    }}></span>
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
            backdropFilter: 'blur(5px)',
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
              background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))',
              borderRadius: '20px',
              padding: '2.5rem',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
            }}
          >
            <h2 style={{ 
              color: 'rgb(94, 9, 65)', 
              marginBottom: '1.75rem',
              fontSize: '1.8rem',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              textAlign: 'center',
              position: 'relative',
              paddingBottom: '12px'
            }}>
              Create New Moodboard
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                height: '3px',
                width: '60px',
                background: 'linear-gradient(to right, transparent, rgb(94, 9, 65), transparent)',
                borderRadius: '3px'
              }}></div>
            </h2>
            
            {createError && (
              <p style={{ 
                color: '#e53935', 
                marginBottom: '1.5rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(229, 57, 53, 0.1)',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 500
              }}>{createError}</p>
            )}
            
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.75rem', 
                color: 'rgb(94, 9, 65)',
                fontSize: '0.95rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                Name
              </label>
              <input
                type="text"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(94, 9, 65, 0.2)',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxShadow: '0 2px 6px rgba(94, 9, 65, 0.05)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(94, 9, 65, 0.5)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(94, 9, 65, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(94, 9, 65, 0.2)';
                  e.target.style.boxShadow = '0 2px 6px rgba(94, 9, 65, 0.05)';
                }}
                placeholder="Enter moodboard name"
              />
            </div>
            
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.75rem', 
                color: 'rgb(94, 9, 65)',
                fontSize: '0.95rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                Description
              </label>
              <textarea
                value={newBoardDescription}
                onChange={(e) => setNewBoardDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(94, 9, 65, 0.2)',
                  fontSize: '1rem',
                  minHeight: '120px',
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxShadow: '0 2px 6px rgba(94, 9, 65, 0.05)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(94, 9, 65, 0.5)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(94, 9, 65, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(94, 9, 65, 0.2)';
                  e.target.style.boxShadow = '0 2px 6px rgba(94, 9, 65, 0.05)';
                }}
                placeholder="Add a description (optional)"
              />
            </div>
            
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center',
                color: 'rgb(94, 9, 65)',
                fontSize: '0.95rem',
                fontWeight: 500,
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                />
                Make this moodboard public
              </label>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(94, 9, 65, 0.3)',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  color: 'rgb(94, 9, 65)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  letterSpacing: '0.03em'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(94, 9, 65, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSubmit}
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, rgb(94, 9, 65), rgb(74, 9, 55))',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(94, 9, 65, 0.15)',
                  letterSpacing: '0.03em'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(94, 9, 65, 0.25)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(94, 9, 65, 0.15)';
                }}
              >
                Create Moodboard
              </button>
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </div>
  );
}
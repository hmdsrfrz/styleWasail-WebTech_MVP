// src/pages/MoodboardDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import VantaBackground from '../../components/miscellaneous/VantaBackground';
import NavToggle from '../../components/miscellaneous/NavToggle';
import OutfitModal from '../../components/outfit/OutfitModal';
import { useMoodboards } from '../../context/MoodboardContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';

export default function MoodboardDetails() {
  const { moodboardId } = useParams();
  const navigate = useNavigate();
  const { moodboards, removeOutfitFromMoodboard, deleteMoodboard, updateMoodboard } = useMoodboards();
  const { user } = useAuth();
  const [moodboard, setMoodboard] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [activeComponent, setActiveComponent] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const foundMoodboard = moodboards.find(board => board._id === moodboardId);
    if (foundMoodboard) {
      setMoodboard(foundMoodboard);
      setEditName(foundMoodboard.name);
      setEditDescription(foundMoodboard.description || '');
    }
  }, [moodboards, moodboardId]);

  const handleDeleteMoodboard = async () => {
    try {
      await deleteMoodboard(moodboardId);
      navigate('/moodboards');
    } catch (err) {
      setError('Failed to delete moodboard');
    }
  };

  const handleRemoveOutfit = async (outfitId) => {
    try {
      await removeOutfitFromMoodboard(moodboardId, outfitId);
    } catch (err) {
      setError('Failed to remove outfit from moodboard');
    }
  };

  const handleSaveEdit = async () => {
    try {
      await updateMoodboard(moodboardId, {
        name: editName,
        description: editDescription
      });
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update moodboard');
    }
  };

  const handleOutfitClick = (outfit) => {
    console.log('Clicked outfit:', outfit);
    setSelectedOutfit(outfit._id);
    setActiveComponent(0);
  };

  if (!moodboard) return null;

  const isCreator = user && moodboard.creator._id === user._id;

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
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem',
          position: 'relative'
        }}>
          {isEditing ? (
            <div style={{ flex: 1, marginRight: '2rem' }}>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(94, 9, 65, 0.2)',
                  fontSize: '1.5rem',
                  marginBottom: '1rem',
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
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(94, 9, 65, 0.2)',
                  fontSize: '1rem',
                  minHeight: '100px',
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
                placeholder="Add a description..."
              />
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  onClick={() => setIsEditing(false)}
                  style={{
                    padding: '0.85rem 1.5rem',
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
                  onClick={handleSaveEdit}
                  style={{
                    padding: '0.85rem 1.5rem',
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
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <Motion.div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '100%'
                }}
              >
                <Motion.h1
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  style={{
                    fontFamily: "'Cal Sans', var(--font-primary)",
                    fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                    fontWeight: 700,
                    color: 'rgb(94, 9, 65)',
                    marginBottom: '0.5rem',
                    textAlign: 'center',
                    position: 'relative',
                    letterSpacing: '-0.02em',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {moodboard.name}
                </Motion.h1>
                <div style={{
                  height: '3px',
                  width: '80px',
                  background: 'linear-gradient(to right, transparent, rgb(94, 9, 65), transparent)',
                  borderRadius: '4px',
                  marginBottom: '1.5rem'
                }}/>
              </Motion.div>
            </>
          )}
          
          {isCreator && !moodboard.isSystem && (
            <div style={{ 
              display: 'flex', 
              gap: '1rem',
              position: 'absolute',
              right: '0',
              top: '0'
            }}>
              <button 
                onClick={() => setIsEditing(true)}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  borderRadius: '12px',
                  padding: '0.6rem 1.2rem',
                  color: 'rgb(94, 9, 65)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  letterSpacing: '0.03em',
                  boxShadow: '0 2px 8px rgba(94, 9, 65, 0.08)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(94, 9, 65, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(94, 9, 65, 0.08)';
                }}
              >
                Edit
              </button>
              <button 
                onClick={() => setIsDeleteModalOpen(true)}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  borderRadius: '12px',
                  padding: '0.6rem 1.2rem',
                  color: 'rgb(94, 9, 65)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  letterSpacing: '0.03em',
                  boxShadow: '0 2px 8px rgba(94, 9, 65, 0.08)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(94, 9, 65, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(94, 9, 65, 0.08)';
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
        
        {moodboard.description && !isEditing && (
          <p style={{ 
            color: 'rgba(94, 9, 65, 0.8)', 
            fontSize: '1.2rem', 
            marginBottom: '2rem',
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 auto 2rem',
            lineHeight: '1.6',
            fontStyle: 'italic',
            fontWeight: '500'
          }}>
            {moodboard.description}
          </p>
        )}
        
        {error && (
          <p style={{ 
            color: 'red', 
            marginBottom: '1rem',
            padding: '1rem',
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            borderRadius: '10px'
          }}>
            {error}
          </p>
        )}
        
        {moodboard.outfits && moodboard.outfits.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '2rem'
          }}>
            {moodboard.outfits.map(({ outfit }) => (
              <Motion.div
                key={outfit._id}
                whileHover={{ y: -5 }}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
              >
                <div 
                  onClick={() => handleOutfitClick(outfit)}
                  style={{ position: 'relative', width: '100%', height: '0', paddingTop: '140%', overflow: 'hidden' }}
                >
                  <img
                    src={outfit.mainImage}
                    alt={outfit.title}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                      transition: 'transform 0.3s ease'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '1rem'
                  }}>
                    <h3 style={{ color: 'white', margin: 0 }}>{outfit.title}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.8)', margin: '0.5rem 0 0' }}>
                      {formatCurrency(outfit.price)}
                    </p>
                  </div>
                </div>
                
                {isCreator && !moodboard.isSystem && (
                  <button
                    onClick={() => handleRemoveOutfit(outfit._id)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      color: 'rgb(94, 9, 65)',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                  >
                    Remove from moodboard
                  </button>
                )}
              </Motion.div>
            ))}
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '50vh',
            color: 'rgba(94, 9, 65, 0.6)'
          }}>
            <p style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No outfits in this moodboard yet</p>
            <p>Start by adding outfits from the home page</p>
          </div>
        )}
      </Motion.div>
      
      {/* Outfit Modal */}
      <AnimatePresence>
        {selectedOutfit && (
          <OutfitModal
            outfit={selectedOutfit}
            activeComponent={activeComponent}
            setActiveComponent={setActiveComponent}
            onClose={() => setSelectedOutfit(null)}
          />
        )}
      </AnimatePresence>
      
      {/* Delete confirmation modal */}
      {isDeleteModalOpen && (
        <Motion.div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Motion.div
            style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '2rem',
              maxWidth: '400px',
              width: '90%'
            }}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <h2 style={{ color: 'rgb(94, 9, 65)', marginBottom: '1rem' }}>Delete Moodboard</h2>
            <p style={{ marginBottom: '2rem' }}>
              Are you sure you want to delete "{moodboard.name}"? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
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
                onClick={handleDeleteMoodboard}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: 'rgb(94, 9, 65)',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </Motion.div>
        </Motion.div>
      )}
    </div>
  );
}
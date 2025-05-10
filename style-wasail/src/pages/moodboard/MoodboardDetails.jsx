// src/pages/MoodboardDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import VantaBackground from '../../components/miscellaneous/VantaBackground';
import Navbar from '../../components/miscellaneous/Navbar';
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          {isEditing ? (
            <div style={{ flex: 1, marginRight: '2rem' }}>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: '1px solid #ccc',
                  fontSize: '1.5rem',
                  marginBottom: '1rem'
                }}
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: '1px solid #ccc',
                  fontSize: '1rem',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
                placeholder="Add a description..."
              />
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  onClick={() => setIsEditing(false)}
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
                  onClick={handleSaveEdit}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: 'rgb(94, 9, 65)',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <Motion.h1
              style={{
                fontFamily: "'Cal Sans', sans-serif",
                fontSize: '3rem',
                fontWeight: 700,
                color: 'rgb(94, 9, 65)'
              }}
            >
              {moodboard.name}
            </Motion.h1>
          )}
          
          {isCreator && !moodboard.isSystem && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setIsEditing(true)}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '10px',
                  padding: '0.5rem 1rem',
                  color: 'rgb(94, 9, 65)',
                  cursor: 'pointer'
                }}
              >
                Edit
              </button>
              <button 
                onClick={() => setIsDeleteModalOpen(true)}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '10px',
                  padding: '0.5rem 1rem',
                  color: 'rgb(94, 9, 65)',
                  cursor: 'pointer'
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
            marginBottom: '2rem' 
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
                  style={{ position: 'relative' }}
                >
                  <img
                    src={outfit.mainImage}
                    alt={outfit.title}
                    style={{
                      width: '100%',
                      height: '300px',
                      objectFit: 'cover'
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
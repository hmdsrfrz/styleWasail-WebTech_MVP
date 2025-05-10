// src/pages/MoodboardDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import VantaBackground from '../../components/miscellaneous/VantaBackground';
import Navbar from '../../components/Miscellaneous/Navbar';
import OutfitModal from '../../components/outfit/OutfitModal';
import { useMoodboards } from '../../context/MoodboardContext';

export default function MoodboardDetails() {
  const { moodboardId } = useParams();
  const navigate = useNavigate();
  const { moodboards, removeOutfitFromMoodboard, deleteMoodboard } = useMoodboards();
  const [moodboard, setMoodboard] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [activeComponent, setActiveComponent] = useState(0);
  const [outfitDetails, setOutfitDetails] = useState([]);

  useEffect(() => {
    const foundMoodboard = moodboards.find(board => board.id === Number(moodboardId));
    if (foundMoodboard) {
      setMoodboard(foundMoodboard);

      // Load outfit details
      if (foundMoodboard.outfits) {
        // In a real app, you would fetch the full outfit details from an API
        // For now, we'll simulate that with some example data
        const simulatedOutfitDetails = foundMoodboard.outfits.map(outfit => ({
          ...outfit,
          user: "StyleShare User",
          price: Math.floor(Math.random() * 30) + 20, // Random price between $20-$50
          description: `A beautiful outfit for any occasion. This is a placeholder description for outfit ID ${outfit.id}.`,
          components: [
            {
              type: "Top",
              description: "Stylish top piece that complements the overall look.",
              image: "https://via.placeholder.com/400x500?text=Outfit+Top"
            },
            {
              type: "Bottom",
              description: "Well-fitted bottom that pairs perfectly with the top.",
              image: "https://via.placeholder.com/400x500?text=Outfit+Bottom"
            },
            {
              type: "Shoes",
              description: "Comfortable yet stylish footwear to complete the look.",
              image: "https://via.placeholder.com/400x500?text=Outfit+Shoes"
            }
          ]
        }));
        setOutfitDetails(simulatedOutfitDetails);
      }
    } else {
      // Redirect to moodboards page if the ID doesn't exist
      navigate('/moodboards');
    }
  }, [moodboardId, moodboards, navigate]);

  const handleRemoveOutfit = (e, outfitId) => {
    e.stopPropagation(); // Prevent triggering the outfit click
    removeOutfitFromMoodboard(Number(moodboardId), outfitId);
  };

  const handleDeleteMoodboard = () => {
    deleteMoodboard(Number(moodboardId));
    navigate('/moodboards');
  };

  const handleOutfitClick = (outfit) => {
    const outfitDetail = outfitDetails.find(detail => detail.id === outfit.id);
    if (outfitDetail) {
      setSelectedOutfit(outfitDetail);
      setActiveComponent(0);
    }
  };

  if (!moodboard) return null;

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
            Delete Moodboard
          </button>
        </div>
        
        <p style={{ 
          color: 'rgba(94, 9, 65, 0.8)', 
          fontSize: '1.2rem', 
          marginBottom: '2rem' 
        }}>
          {moodboard.outfitCount} saved outfits
        </p>
        
        {moodboard.outfits && moodboard.outfits.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {moodboard.outfits.map((outfit) => (
              <Motion.div
                key={outfit.id}
                whileHover={{ y: -5 }}
                onClick={() => handleOutfitClick(outfit)}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  position: 'relative',
                  cursor: 'pointer'
                }}
              >
                <button
                  onClick={(e) => handleRemoveOutfit(e, outfit.id)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer',
                    zIndex: 5
                  }}
                >
                  ✕
                </button>
                <div style={{
                  backgroundColor: 'rgba(94, 9, 65, 0.1)',
                  borderRadius: '10px',
                  height: '200px',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {outfitDetails.find(detail => detail.id === outfit.id)?.components?.[0]?.image ? (
                    <img 
                      src={outfitDetails.find(detail => detail.id === outfit.id)?.components[0].image}
                      alt={outfit.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ color: 'rgb(94, 9, 65)' }}>Outfit Image</span>
                  )}
                </div>
                <h3 style={{ color: 'rgb(94, 9, 65)', marginBottom: '0.5rem' }}>{outfit.title}</h3>
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
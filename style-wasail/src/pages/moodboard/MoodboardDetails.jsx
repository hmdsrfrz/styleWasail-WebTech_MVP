import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import VantaBackground from '../../components/miscellaneous/VantaBackground';
import Navbar from '../../components/miscellaneous/Navbar';
import OutfitModal from '../../components/outfit/OutfitModal';
import { useMoodboards } from '../../context/MoodboardContext';
import './MoodboardDetails.css';

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

      if (foundMoodboard.outfits) {
        const simulatedOutfitDetails = foundMoodboard.outfits.map(outfit => ({
          ...outfit,
          user: "StyleShare User",
          price: Math.floor(Math.random() * 30) + 20,
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
      navigate('/moodboards');
    }
  }, [moodboardId, moodboards, navigate]);

  const handleRemoveOutfit = (e, outfitId) => {
    e.stopPropagation();
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
    <div className="moodboard-details-container">
      <VantaBackground />
      <Navbar />
      
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="content-wrapper"
      >
        <div className="header">
          <Motion.h1 className="title">
            {moodboard.name}
          </Motion.h1>
          
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="delete-button"
          >
            Delete Moodboard
          </button>
        </div>
        
        <p className="outfit-count">
          {moodboard.outfitCount} saved outfits
        </p>
        
        {moodboard.outfits && moodboard.outfits.length > 0 ? (
          <div className="outfits-grid">
            {moodboard.outfits.map((outfit) => (
              <Motion.div
                key={outfit.id}
                whileHover={{ y: -5 }}
                onClick={() => handleOutfitClick(outfit)}
                className="outfit-card"
              >
                <button
                  onClick={(e) => handleRemoveOutfit(e, outfit.id)}
                  className="remove-button"
                >
                  ✕
                </button>
                <div className="outfit-image-container">
                  {outfitDetails.find(detail => detail.id === outfit.id)?.components?.[0]?.image ? (
                    <img 
                      src={outfitDetails.find(detail => detail.id === outfit.id)?.components[0].image}
                      alt={outfit.title}
                      className="outfit-image"
                    />
                  ) : (
                    <span style={{ color: 'rgb(94, 9, 65)' }}>Outfit Image</span>
                  )}
                </div>
                <h3 className="outfit-name">{outfit.title}</h3>
              </Motion.div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p className="empty-text">No outfits in this moodboard yet</p>
            <p>Start by adding outfits from the home page</p>
          </div>
        )}
      </Motion.div>
      
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
      
      {isDeleteModalOpen && (
        <Motion.div
          className="delete-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Motion.div
            className="delete-modal-content"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <h2 className="delete-modal-title">Delete Moodboard</h2>
            <p className="delete-modal-text">
              Are you sure you want to delete "{moodboard.name}"? This action cannot be undone.
            </p>
            <div className="delete-modal-buttons">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="cancel-button"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMoodboard}
                className="confirm-delete-button"
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
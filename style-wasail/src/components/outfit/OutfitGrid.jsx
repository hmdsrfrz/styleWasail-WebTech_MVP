// src/components/OutfitGrid.jsx
import { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import './OutfitGrid.css';
import './MoodboardPrompt.css';
import api from '../../services/api'; // <-- Make sure you have this
import OutfitModal from './OutfitModal';
import MoodboardPrompt from './MoodboardPrompt';

export default function OutfitGrid({ selectedTags = [] }) {
  const [outfits, setOutfits] = useState([]);
  const [filteredOutfits, setFilteredOutfits] = useState([]);
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [activeComponent, setActiveComponent] = useState(0);
  const [likedOutfits, setLikedOutfits] = useState({});
  const [moodboardPrompt, setMoodboardPrompt] = useState({ isOpen: false, outfitId: null, outfitTitle: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likeCounts, setLikeCounts] = useState({});

  // Fetch outfits from backend
  useEffect(() => {
    async function fetchOutfits() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/outfits');
        setOutfits(res.data.data.outfits || []);
      } catch (err) {
        setError('Failed to load outfits');
      } finally {
        setLoading(false);
      }
    }
    fetchOutfits();
  }, []);

  // Filter outfits based on selected tags
  useEffect(() => {
    if (selectedTags.length === 0) {
      setFilteredOutfits(outfits);
    } else {
      const filtered = outfits.filter(outfit => {
        return selectedTags.every(tag => 
          outfit.tags?.includes(tag) || 
          outfit.location === tag ||
          outfit.type === tag
        );
      });
      setFilteredOutfits(filtered);
    }
  }, [selectedTags, outfits]);

  // When outfits are loaded, initialize likeCounts
  useEffect(() => {
    if (outfits.length > 0) {
      setLikeCounts(
        outfits.reduce((acc, outfit) => {
          acc[outfit._id] = outfit.engagement?.likes || 0;
          return acc;
        }, {})
      );
    }
  }, [outfits]);

  const handleHeartClick = (e, outfitId, outfitTitle) => {
    e.stopPropagation();
    setLikedOutfits(prev => {
      const newLiked = { ...prev };
      if (!newLiked[outfitId]) {
        // Only increment if not already liked
        setLikeCounts(likeCounts => ({
          ...likeCounts,
          [outfitId]: (likeCounts[outfitId] || 0) + 1
        }));
      }
      newLiked[outfitId] = !prev[outfitId];
      if (newLiked[outfitId]) {
        setMoodboardPrompt({
          isOpen: true,
          outfitId,
          outfitTitle
        });
      }
      return newLiked;
    });
  };

  const closeMoodboardPrompt = () => {
    setMoodboardPrompt({ isOpen: false, outfitId: null, outfitTitle: '' });
  };

  return (
    <div className="outfit-container">
      {/* Loading and error states */}
      {loading && <div className="loading">Loading outfits...</div>}
      {error && <div className="error-message">{error}</div>}
      {/* Horizontal Row Grid */}
      {!loading && !error && (
        <div className="outfit-grid">
          {filteredOutfits.map((outfit) => (
            <Motion.div
              key={outfit._id}
              className="outfit-card"
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                setSelectedOutfit(outfit);
                setActiveComponent(0);
              }}
            >
              <div className="card-image-container">
                <img src={outfit.mainImage} alt={outfit.title} />
              </div>
              <div className="card-info">
                <h3>{outfit.title}</h3>
                <p className="description">{outfit.description}</p>
                <p className="username">by {outfit.creator?.name || 'Unknown'}</p>
                {/* Like and view counters below title/creator */}
                <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', marginTop: '0.5rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', color: '#5e0941', fontWeight: 500 }}>
                    <svg width="18" height="18" fill="currentColor" style={{ marginRight: 3 }} viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    {likeCounts[outfit._id] || 0}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', color: '#5e0941', fontWeight: 500 }}>
                    <svg width="18" height="18" fill="currentColor" style={{ marginRight: 3 }} viewBox="0 0 24 24"><path d="M12 4.5c-7 0-10 7.61-10 7.61s3 7.39 10 7.39 10-7.39 10-7.39-3-7.61-10-7.61zm0 13c-5.05 0-7.81-4.41-8.74-6 .93-1.59 3.69-6 8.74-6s7.81 4.41 8.74 6c-.93 1.59-3.69 6-8.74 6zm0-9a3 3 0 100 6 3 3 0 000-6z"/></svg>
                    {outfit.engagement?.views || 0}
                  </span>
                </div>
              </div>
            </Motion.div>
          ))}
        </div>
      )}

      {/* Modal for selected outfit */}
      {selectedOutfit && (
        <OutfitModal 
          outfit={selectedOutfit}
          activeComponent={activeComponent}
          setActiveComponent={setActiveComponent}
          onClose={() => setSelectedOutfit(null)}
        />
      )}

      {/* Moodboard Prompt */}
      <MoodboardPrompt 
        isOpen={moodboardPrompt.isOpen}
        onClose={closeMoodboardPrompt}
        outfitId={moodboardPrompt.outfitId}
        outfitTitle={moodboardPrompt.outfitTitle}
      />
    </div>
  );
}
// src/components/outfit/MoodboardPrompt.jsx
import { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import { useMoodboards } from '../../context/MoodboardContext';
import { useAuth } from '../../context/AuthContext';
import './MoodboardPrompt.css';

export default function MoodboardPrompt({ isOpen, onClose, outfitId, outfitTitle }) {
  const { moodboards, addMoodboard, addOutfitToMoodboard } = useMoodboards();
  const { user } = useAuth();
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardDescription, setNewBoardDescription] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [error, setError] = useState(null);
  const [isPublic, setIsPublic] = useState(true);

  // Reset state when prompt opens
  useEffect(() => {
    if (isOpen) {
      setNewBoardName("");
      setNewBoardDescription("");
      setIsCreatingNew(false);
      setSelectedBoard(null);
      setError(null);
      setIsPublic(true);
    }
  }, [isOpen]);

  const handleCreateMoodboard = async () => {
    try {
      setError(null);
      if (newBoardName.trim()) {
        const newBoard = await addMoodboard(newBoardName, newBoardDescription, isPublic);
        await addOutfitToMoodboard(newBoard._id, outfitId);
        onClose();
      }
    } catch (err) {
      setError('Failed to create moodboard');
      console.error('Error creating moodboard:', err);
    }
  };

  const handleAddToExisting = async (moodboardId) => {
    try {
      setError(null);
      await addOutfitToMoodboard(moodboardId, outfitId);
      onClose();
    } catch (err) {
      setError('Failed to add outfit to moodboard');
      console.error('Error adding outfit to moodboard:', err);
    }
  };

  if (!isOpen) return null;

  const systemMoodboard = moodboards.find(board => board.isSystem);
  const customMoodboards = moodboards.filter(board => !board.isSystem);

  return (
    <Motion.div
      className="moodboard-prompt-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Motion.div
        className="moodboard-prompt-content"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <h2>Add to Moodboard</h2>
        <p className="outfit-name">"{outfitTitle}"</p>

        {error && (
          <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>
        )}

        {isCreatingNew ? (
          <div className="create-new-form">
            <input
              type="text"
              placeholder="Moodboard name"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              autoFocus
            />
            <textarea
              placeholder="Description (optional)"
              value={newBoardDescription}
              onChange={(e) => setNewBoardDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '10px',
                border: '1px solid #ccc',
                fontSize: '1rem',
                minHeight: '100px',
                resize: 'vertical',
                marginTop: '1rem'
              }}
            />
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                Make this moodboard public
              </label>
            </div>
            <div className="button-group">
              <button className="cancel-btn" onClick={() => setIsCreatingNew(false)}>
                Cancel
              </button>
              <button 
                className="create-btn"
                onClick={handleCreateMoodboard}
                disabled={!newBoardName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="moodboard-list">
              {/* System Moodboard */}
              {systemMoodboard && (
                <Motion.div
                  key={systemMoodboard._id}
                  className={`moodboard-item ${selectedBoard === systemMoodboard._id ? 'selected' : ''}`}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedBoard(systemMoodboard._id)}
                >
                  <div>
                    <h3>{systemMoodboard.name}</h3>
                    <p>{systemMoodboard.outfits?.length || 0} items</p>
                    <p style={{ 
                      color: 'rgba(94, 9, 65, 0.6)', 
                      fontSize: '0.9rem',
                      marginTop: '0.5rem',
                      fontStyle: 'italic'
                    }}>
                      System Moodboard
                    </p>
                  </div>
                  {selectedBoard === systemMoodboard._id && (
                    <button 
                      className="add-to-board-btn"
                      onClick={() => handleAddToExisting(systemMoodboard._id)}
                    >
                      Add
                    </button>
                  )}
                </Motion.div>
              )}

              {/* Custom Moodboards */}
              {customMoodboards.map(board => (
                <Motion.div
                  key={board._id}
                  className={`moodboard-item ${selectedBoard === board._id ? 'selected' : ''}`}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedBoard(board._id)}
                >
                  <div>
                    <h3>{board.name}</h3>
                    <p>{board.outfits?.length || 0} items</p>
                  </div>
                  {selectedBoard === board._id && (
                    <button 
                      className="add-to-board-btn"
                      onClick={() => handleAddToExisting(board._id)}
                    >
                      Add
                    </button>
                  )}
                </Motion.div>
              ))}
            </div>
            
            {user && (
              <button 
                className="create-new-btn"
                onClick={() => setIsCreatingNew(true)}
              >
                + Create new moodboard
              </button>
            )}
          </>
        )}
      </Motion.div>
    </Motion.div>
  );
}
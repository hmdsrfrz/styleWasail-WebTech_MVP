// src/components/MoodboardPrompt.jsx
import { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';

export default function MoodboardPrompt({ isOpen, onClose, outfitId, outfitTitle }) {
  const [moodboards, setMoodboards] = useState([]);
  const [newBoardName, setNewBoardName] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);

  // Load moodboards from localStorage
  useEffect(() => {
    if (isOpen) {
      const storedMoodboards = localStorage.getItem('moodboards');
      if (storedMoodboards) {
        setMoodboards(JSON.parse(storedMoodboards));
      } else {
        // Default moodboards if none exist
        const defaultMoodboards = [
          { id: 1, name: "Summer Vibes", outfitCount: 12 },
          { id: 2, name: "Office Wear", outfitCount: 8 },
          { id: 3, name: "Evening Outfits", outfitCount: 5 },
        ];
        setMoodboards(defaultMoodboards);
        localStorage.setItem('moodboards', JSON.stringify(defaultMoodboards));
      }
      
      // Reset state when prompt opens
      setNewBoardName("");
      setIsCreatingNew(false);
      setSelectedBoard(null);
    }
  }, [isOpen]);

  const handleCreateMoodboard = () => {
    if (newBoardName.trim()) {
      const newMoodboard = {
        id: Date.now(),
        name: newBoardName.trim(),
        outfitCount: 1,
        outfits: [{ id: outfitId, title: outfitTitle }]
      };
      
      const updatedMoodboards = [...moodboards, newMoodboard];
      setMoodboards(updatedMoodboards);
      
      // Save to localStorage
      localStorage.setItem('moodboards', JSON.stringify(updatedMoodboards));
      
      console.log(`Added outfit ${outfitId} to new moodboard: ${newBoardName}`);
      
      // Close prompt after creating
      onClose();
    }
  };

  const handleAddToExisting = (boardId) => {
    // Find the selected moodboard
    const updatedMoodboards = moodboards.map(board => {
      if (board.id === boardId) {
        // Initialize outfits array if it doesn't exist
        const outfits = board.outfits || [];
        
        // Add the outfit if it doesn't already exist in this moodboard
        if (!outfits.some(outfit => outfit.id === outfitId)) {
          const updatedBoard = {
            ...board,
            outfitCount: (board.outfitCount || 0) + 1,
            outfits: [...outfits, { id: outfitId, title: outfitTitle }]
          };
          return updatedBoard;
        }
      }
      return board;
    });
    
    // Save to localStorage
    localStorage.setItem('moodboards', JSON.stringify(updatedMoodboards));
    
    console.log(`Added outfit ${outfitId} to moodboard ID: ${boardId}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Motion.div
      className="moodboard-prompt-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <Motion.div
        className="moodboard-prompt-content"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Save to Moodboard</h2>
        <p className="outfit-name">"{outfitTitle}"</p>

        {isCreatingNew ? (
          <div className="create-new-form">
            <input
              type="text"
              placeholder="Moodboard name"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              autoFocus
            />
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
              {moodboards.map(board => (
                <Motion.div
                  key={board.id}
                  className={`moodboard-item ${selectedBoard === board.id ? 'selected' : ''}`}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedBoard(board.id)}
                >
                  <div>
                    <h3>{board.name}</h3>
                    <p>{board.outfitCount} items</p>
                  </div>
                  {selectedBoard === board.id && (
                    <button 
                      className="add-to-board-btn"
                      onClick={() => handleAddToExisting(board.id)}
                    >
                      Add
                    </button>
                  )}
                </Motion.div>
              ))}
            </div>
            
            <button 
              className="create-new-btn"
              onClick={() => setIsCreatingNew(true)}
            >
              + Create new moodboard
            </button>
          </>
        )}
      </Motion.div>
    </Motion.div>
  );
}
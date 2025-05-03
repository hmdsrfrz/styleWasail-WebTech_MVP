// src/context/MoodboardContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';

const MoodboardContext = createContext();

export function MoodboardProvider({ children }) {
  const [moodboards, setMoodboards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load moodboards from localStorage on initial render
  useEffect(() => {
    const loadMoodboards = () => {
      setIsLoading(true);
      const storedMoodboards = localStorage.getItem('moodboards');
      
      if (storedMoodboards) {
        setMoodboards(JSON.parse(storedMoodboards));
      } else {
        // Default moodboards if none exist
        const defaultMoodboards = [
          { id: 1, name: "Summer Vibes", outfitCount: 12, outfits: [] },
          { id: 2, name: "Office Wear", outfitCount: 8, outfits: [] },
          { id: 3, name: "Evening Outfits", outfitCount: 5, outfits: [] },
        ];
        setMoodboards(defaultMoodboards);
        localStorage.setItem('moodboards', JSON.stringify(defaultMoodboards));
      }
      
      setIsLoading(false);
    };

    loadMoodboards();
  }, []);

  // Function to add a new moodboard
  const addMoodboard = (name, outfitId = null, outfitTitle = null) => {
    const newMoodboard = {
      id: Date.now(),
      name: name.trim(),
      outfitCount: outfitId ? 1 : 0,
      outfits: outfitId ? [{ id: outfitId, title: outfitTitle }] : []
    };
    
    const updatedMoodboards = [...moodboards, newMoodboard];
    setMoodboards(updatedMoodboards);
    localStorage.setItem('moodboards', JSON.stringify(updatedMoodboards));
    
    return newMoodboard;
  };

  // Function to add an outfit to an existing moodboard
  const addOutfitToMoodboard = (moodboardId, outfitId, outfitTitle) => {
    const updatedMoodboards = moodboards.map(board => {
      if (board.id === moodboardId) {
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
    
    setMoodboards(updatedMoodboards);
    localStorage.setItem('moodboards', JSON.stringify(updatedMoodboards));
  };

  // Function to remove an outfit from a moodboard
  const removeOutfitFromMoodboard = (moodboardId, outfitId) => {
    const updatedMoodboards = moodboards.map(board => {
      if (board.id === moodboardId) {
        const outfits = board.outfits || [];
        const updatedOutfits = outfits.filter(outfit => outfit.id !== outfitId);
        
        return {
          ...board,
          outfitCount: updatedOutfits.length,
          outfits: updatedOutfits
        };
      }
      return board;
    });
    
    setMoodboards(updatedMoodboards);
    localStorage.setItem('moodboards', JSON.stringify(updatedMoodboards));
  };

  // Function to delete a moodboard
  const deleteMoodboard = (moodboardId) => {
    const updatedMoodboards = moodboards.filter(board => board.id !== moodboardId);
    setMoodboards(updatedMoodboards);
    localStorage.setItem('moodboards', JSON.stringify(updatedMoodboards));
  };

  return (
    <MoodboardContext.Provider
      value={{
        moodboards,
        isLoading,
        addMoodboard,
        addOutfitToMoodboard,
        removeOutfitFromMoodboard,
        deleteMoodboard
      }}
    >
      {children}
    </MoodboardContext.Provider>
  );
}

// Custom hook to use the moodboard context
export function useMoodboards() {
  const context = useContext(MoodboardContext);
  if (!context) {
    throw new Error('useMoodboards must be used within a MoodboardProvider');
  }
  return context;
}
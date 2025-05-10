// src/context/MoodboardContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const MoodboardContext = createContext();

export function MoodboardProvider({ children }) {
  const [moodboards, setMoodboards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Create axios instance with base URL
  const api = axios.create({
    baseURL: 'http://localhost:5000/api/v1'
  });

  // Add auth token to requests
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Fetch moodboards from API
  useEffect(() => {
    const fetchMoodboards = async () => {
      try {
        console.log('Fetching moodboards...'); // Debug log
        console.log('Current user:', user); // Debug log
        setIsLoading(true);
        const response = await api.get('/moodboards');
        console.log('Moodboards response:', response.data); // Debug log
        setMoodboards(response.data.data.moodboards);
        setError(null);
      } catch (err) {
        console.error('Error fetching moodboards:', err.response || err); // Enhanced error logging
        setError('Failed to load moodboards');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) { // Only fetch if user is logged in
      fetchMoodboards();
    } else {
      setMoodboards([]);
      setIsLoading(false);
    }
  }, [user]); // Refetch when user changes

  // Function to add a new moodboard
  const addMoodboard = async (name, description = '', isPublic = true) => {
    try {
      const response = await api.post('/moodboards', {
        name,
        description,
        isPublic
      });
      
      setMoodboards(prev => [...prev, response.data.data.moodboard]);
      return response.data.data.moodboard;
    } catch (err) {
      console.error('Error creating moodboard:', err);
      throw new Error('Failed to create moodboard');
    }
  };

  // Function to update a moodboard
  const updateMoodboard = async (id, updates) => {
    try {
      const response = await api.patch(`/moodboards/${id}`, updates);
      setMoodboards(prev => 
        prev.map(board => 
          board._id === id ? response.data.data.moodboard : board
        )
      );
      return response.data.data.moodboard;
    } catch (err) {
      console.error('Error updating moodboard:', err);
      throw new Error('Failed to update moodboard');
    }
  };

  // Function to delete a moodboard
  const deleteMoodboard = async (id) => {
    try {
      await api.delete(`/moodboards/${id}`);
      setMoodboards(prev => prev.filter(board => board._id !== id));
    } catch (err) {
      console.error('Error deleting moodboard:', err);
      throw new Error('Failed to delete moodboard');
    }
  };

  // Function to add an outfit to a moodboard
  const addOutfitToMoodboard = async (moodboardId, outfitId, notes = '') => {
    try {
      const response = await api.post(`/moodboards/${moodboardId}/outfits`, {
        outfitId,
        notes
      });
      
      setMoodboards(prev => 
        prev.map(board => 
          board._id === moodboardId ? response.data.data.moodboard : board
        )
      );
      return response.data.data.moodboard;
    } catch (err) {
      console.error('Error adding outfit to moodboard:', err);
      throw new Error('Failed to add outfit to moodboard');
    }
  };

  // Function to remove an outfit from a moodboard
  const removeOutfitFromMoodboard = async (moodboardId, outfitId) => {
    try {
      const response = await api.delete(`/moodboards/${moodboardId}/outfits/${outfitId}`);
      setMoodboards(prev => 
        prev.map(board => 
          board._id === moodboardId ? response.data.data.moodboard : board
        )
      );
      return response.data.data.moodboard;
    } catch (err) {
      console.error('Error removing outfit from moodboard:', err);
      throw new Error('Failed to remove outfit from moodboard');
    }
  };

  const value = {
    moodboards,
    isLoading,
    error,
    addMoodboard,
    updateMoodboard,
    deleteMoodboard,
    addOutfitToMoodboard,
    removeOutfitFromMoodboard
  };

  return (
    <MoodboardContext.Provider value={value}>
      {children}
    </MoodboardContext.Provider>
  );
}

export const useMoodboards = () => {
  const context = useContext(MoodboardContext);
  if (!context) {
    throw new Error('useMoodboards must be used within a MoodboardProvider');
  }
  return context;
};
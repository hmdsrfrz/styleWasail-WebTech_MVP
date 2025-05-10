import { useState, useEffect } from 'react';
import { outfitAPI } from '../services/api';
import OutfitCard from './OutfitCard';
import './OutfitGrid.css';

const OutfitGrid = ({ filters = {} }) => {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchOutfits = async () => {
    try {
      setLoading(true);
      const response = await outfitAPI.getOutfits({
        page,
        limit: 12,
        ...filters
      });
      
      if (page === 1) {
        setOutfits(response.data.outfits);
      } else {
        setOutfits(prev => [...prev, ...response.data.outfits]);
      }
      
      setHasMore(response.data.outfits.length === 12);
      setError(null);
    } catch (err) {
      setError('Failed to fetch outfits. Please try again later.');
      console.error('Error fetching outfits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchOutfits();
  }, [filters]);

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
    fetchOutfits();
  };

  const handleLike = async (outfitId) => {
    try {
      await outfitAPI.likeOutfit(outfitId);
      setOutfits(prev =>
        prev.map(outfit =>
          outfit._id === outfitId
            ? { ...outfit, likes: outfit.likes + 1 }
            : outfit
        )
      );
    } catch (err) {
      console.error('Error liking outfit:', err);
    }
  };

  if (loading && page === 1) {
    return <div className="loading">Loading outfits...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="outfit-grid">
      {outfits.map(outfit => (
        <OutfitCard
          key={outfit._id}
          outfit={outfit}
          onLike={() => handleLike(outfit._id)}
        />
      ))}
      {hasMore && (
        <button
          className="load-more"
          onClick={handleLoadMore}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
};

export default OutfitGrid; 
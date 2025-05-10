import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './OutfitCard.css';

const OutfitCard = ({ outfit, onLike }) => {
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  const handleLike = (e) => {
    e.preventDefault();
    if (user) {
      onLike();
    }
  };

  return (
    <Link
      to={`/outfits/${outfit._id}`}
      className="outfit-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="outfit-image">
        <img src={outfit.images[0]} alt={outfit.title} />
        {isHovered && (
          <div className="outfit-overlay">
            <button
              className={`like-button ${user ? 'active' : ''}`}
              onClick={handleLike}
              title={user ? 'Like this outfit' : 'Sign in to like'}
            >
              <i className="fas fa-heart"></i>
              <span>{outfit.likes}</span>
            </button>
          </div>
        )}
      </div>
      <div className="outfit-info">
        <h3>{outfit.title}</h3>
        <p className="outfit-price">${outfit.price}/day</p>
        <div className="outfit-meta">
          <span className="outfit-category">{outfit.category}</span>
          <span className="outfit-views">
            <i className="fas fa-eye"></i> {outfit.views}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default OutfitCard; 
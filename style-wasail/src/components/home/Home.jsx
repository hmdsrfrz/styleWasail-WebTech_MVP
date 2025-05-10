import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import './Home.css';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000'
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default function Home() {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOutfits = async () => {
      try {
        const response = await api.get('/api/v1/outfits');
        setOutfits(response.data.data.outfits);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch outfits');
        setLoading(false);
      }
    };

    fetchOutfits();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="home-container">
      <div className="outfits-grid">
        {outfits.map((outfit) => (
          <motion.div
            key={outfit._id}
            className="outfit-card"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="outfit-image-container">
              <img
                src={outfit.mainImage}
                alt={outfit.title}
                className="outfit-image"
              />
              <div className="outfit-stats">
                <div className="outfit-stat">
                  <i className="fas fa-heart"></i>
                  <span>{outfit.engagement?.likes || 0}</span>
                </div>
                <div className="outfit-stat">
                  <i className="fas fa-eye"></i>
                  <span>{outfit.engagement?.views || 0}</span>
                </div>
              </div>
            </div>
            <div className="outfit-info">
              <h3 className="outfit-title">{outfit.title}</h3>
              <p className="outfit-description">{outfit.description}</p>
              <div className="outfit-tags">
                {outfit.tags.map((tag, index) => (
                  <span key={index} className="outfit-tag">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="outfit-creator">
                <img
                  src={outfit.creator?.profilePicture || '/default-avatar.png'}
                  alt={outfit.creator?.name}
                  className="creator-avatar"
                />
                <span className="creator-name">{outfit.creator?.name}</span>
              </div>
              <div className="outfit-price">${outfit.price}/day</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 
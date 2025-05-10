import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { moodboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './MoodboardPrompt.css';

const MoodboardPrompt = ({ onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    theme: '',
    isPublic: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await moodboardAPI.createMoodboard(formData);
      onClose();
      navigate(`/moodboards/${response.data._id}`);
    } catch (err) {
      setError('Failed to create moodboard');
      console.error('Error creating moodboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Create New Moodboard</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter a title for your moodboard"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Describe your moodboard's theme and inspiration"
            />
          </div>

          <div className="form-group">
            <label htmlFor="theme">Theme</label>
            <select
              id="theme"
              name="theme"
              value={formData.theme}
              onChange={handleChange}
              required
            >
              <option value="">Select a theme</option>
              <option value="casual">Casual</option>
              <option value="formal">Formal</option>
              <option value="vintage">Vintage</option>
              <option value="modern">Modern</option>
              <option value="bohemian">Bohemian</option>
              <option value="minimalist">Minimalist</option>
            </select>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
              />
              Make this moodboard public
            </label>
            <p className="help-text">
              Public moodboards can be viewed and shared by other users
            </p>
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Moodboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MoodboardPrompt; 
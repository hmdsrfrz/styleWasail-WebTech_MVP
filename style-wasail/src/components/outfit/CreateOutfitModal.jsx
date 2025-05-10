// src/components/CreateOutfitModal.jsx
import { motion as Motion } from 'framer-motion';
import { useState } from 'react';
import axios from 'axios';
import './CreateOutfitModal.css';

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

// Predefined tags for selection
const AVAILABLE_TAGS = {
  seasons: ['Summer', 'Winter', 'Spring', 'Fall'],
  styles: ['Casual', 'Formal', 'Office', 'Party', 'Rock', 'Vintage', 'Streetwear'],
  occasions: ['Work', 'Party', 'Wedding', 'Beach', 'Travel', 'Sports'],
  components: ['Outfit', 'Top', 'Bottom', 'Shoes', 'Accessories']
};

const LOCATIONS = {
  'Major Cities': [
    'Islamabad',
    'Karachi',
    'Lahore',
    'Peshawar',
    'Quetta',
    'Faisalabad',
    'Multan',
    'Hyderabad',
    'Rawalpindi',
    'Gujranwala'
  ],
  'Universities': [
    'LUMS - Lahore',
    'NUST - Islamabad',
    'FAST - Multiple Cities',
    'COMSATS - Multiple Cities',
    'UET - Lahore',
    'IBA - Karachi',
    'GIKI - Topi',
    'NED - Karachi',
    'PIEAS - Islamabad',
    'UCP - Lahore',
    'BZU - Multan',
    'Punjab University - Lahore',
    'Karachi University',
    'Peshawar University',
    'Quaid-i-Azam University - Islamabad'
  ]
};

export default function CreateOutfitModal({ onClose, onSubmit }) {
  const [step, setStep] = useState(1); // 1: Main Outfit, 2: Components
  const [newOutfit, setNewOutfit] = useState({
    title: '',
    description: '',
    mainImage: null,
    mainImageUrl: '',
    price: '',
    type: '', // Add type field for main outfit
    tags: [],
    components: [],
    location: ''
  });
  const [activeComponentIndex, setActiveComponentIndex] = useState(-1);
  const [uploading, setUploading] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedComponentType, setSelectedComponentType] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOutfit(prev => ({ ...prev, [name]: value }));
  };

  const handleComponentChange = (e, index) => {
    const { name, value } = e.target;
    const updatedComponents = [...newOutfit.components];
    updatedComponents[index] = { ...updatedComponents[index], [name]: value };
    setNewOutfit(prev => ({ ...prev, components: updatedComponents }));
  };

  const handleImageUpload = async (e, isMainImage = false) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post('/api/v1/outfits/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Get the image URL from the response
      const imageUrl = response.data.data.imageUrls?.[0] || response.data.data.imageUrl;
      
      if (!imageUrl) {
        throw new Error('No image URL received from server');
      }

      if (isMainImage) {
        setNewOutfit(prev => ({
          ...prev,
          mainImage: file,
          mainImageUrl: imageUrl
        }));
      } else {
        const updatedComponents = [...newOutfit.components];
        updatedComponents[activeComponentIndex] = {
          ...updatedComponents[activeComponentIndex],
          image: file,
          imageUrl: imageUrl
        };
        setNewOutfit(prev => ({ ...prev, components: updatedComponents }));
      }
    } catch (error) {
      console.error('Error uploading image:', error.response?.data || error.message);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleTagSelection = (tag, category) => {
    if (activeComponentIndex === -1) {
      // For main outfit
      setSelectedTags(prev => {
        if (prev.includes(tag)) {
          return prev.filter(t => t !== tag);
        }
        return [...prev, tag];
      });
    } else {
      // For components
      const updatedComponents = [...newOutfit.components];
      const currentTags = updatedComponents[activeComponentIndex].tags || [];
      updatedComponents[activeComponentIndex].tags = currentTags.includes(tag)
        ? currentTags.filter(t => t !== tag)
        : [...currentTags, tag];
      setNewOutfit(prev => ({ ...prev, components: updatedComponents }));
    }
  };

  const handleAddComponent = () => {
    if (!selectedComponentType) {
      alert('Please select a component type first');
      return;
    }

    setNewOutfit(prev => ({
      ...prev,
      components: [
        ...prev.components,
        {
          type: selectedComponentType,
          description: '',
          image: null,
          imageUrl: '',
          price: '',
          tags: []
        }
      ]
    }));
    setSelectedComponentType('');
  };

  const handleNextStep = () => {
    if (step === 1) {
      setNewOutfit(prev => ({
        ...prev,
        tags: selectedTags
      }));
    }
    setStep(prev => prev + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Log the current state before submission
      console.log('Current outfit state:', newOutfit);
      console.log('Selected tags:', selectedTags);

      // Create the main outfit as a component
      const mainComponent = {
        componentId: `main-${Date.now()}`, // Add unique componentId for main outfit
        type: newOutfit.type || 'Outfit',
        name: newOutfit.type || 'Outfit',
        description: newOutfit.description,
        image: newOutfit.mainImageUrl,
        price: parseFloat(newOutfit.price),
        location: newOutfit.location,
        tags: selectedTags
      };

      // Prepare the outfit data
      const outfitData = {
        title: newOutfit.title,
        description: newOutfit.description,
        mainImage: newOutfit.mainImageUrl,
        price: parseFloat(newOutfit.price),
        type: newOutfit.type || 'Outfit',
        location: newOutfit.location,
        tags: selectedTags,
        components: [mainComponent, ...newOutfit.components.map((comp, index) => ({
          componentId: `comp-${Date.now()}-${index}`, // Add unique componentId for each component
          type: comp.type,
          name: comp.type,
          description: comp.description,
          image: comp.imageUrl,
          price: parseFloat(comp.price),
          location: newOutfit.location,
          tags: comp.tags || []
        }))]
      };

      console.log('Submitting outfit data:', outfitData);

      // Validate required fields before sending
      if (!outfitData.title || !outfitData.description || !outfitData.mainImage || 
          !outfitData.price || !outfitData.type || !outfitData.location) {
        throw new Error('Please fill in all required fields');
      }

      // Send the data to the backend
      const response = await api.post('/api/v1/outfits', outfitData);
      
      console.log('Outfit created successfully:', response.data);
      
      // Call the onSubmit callback with the created outfit
      onSubmit(response.data.data.outfit);
      onClose();
    } catch (error) {
      console.error('Error creating outfit:', error.response?.data || error.message);
      alert(error.response?.data?.error || error.message || 'Failed to create outfit. Please try again.');
    }
  };

  const renderMainOutfitStep = () => (
    <div className="create-outfit-modal-grid">
      <div className="create-outfit-modal-images">
        <div className="create-outfit-modal-main-image-container">
          <h3 className="create-outfit-modal-main-image-title">Main Outfit Image</h3>
          {newOutfit.mainImageUrl ? (
            <img 
              src={newOutfit.mainImageUrl} 
              alt="Main outfit" 
              className="create-outfit-modal-main-image"
            />
          ) : (
            <div className="create-outfit-modal-main-image-placeholder">
              Click to upload main outfit image
              <input
                type="file"
                accept="image/*"
                className="create-outfit-modal-image-upload"
                onChange={(e) => handleImageUpload(e, true)}
                disabled={uploading}
              />
            </div>
          )}
        </div>
      </div>

      <div className="create-outfit-modal-form">
        <div className="create-outfit-modal-form-group">
          <label className="create-outfit-modal-label">Outfit Title</label>
          <input
            type="text"
            name="title"
            value={newOutfit.title}
            onChange={handleInputChange}
            className="create-outfit-modal-input"
            required
          />
        </div>

        <div className="create-outfit-modal-form-group">
          <label className="create-outfit-modal-label">Description</label>
          <textarea
            name="description"
            value={newOutfit.description}
            onChange={handleInputChange}
            className="create-outfit-modal-textarea"
            required
          />
        </div>

        <div className="create-outfit-modal-form-group">
          <label className="create-outfit-modal-label">Price per day (Rs)</label>
          <input
            type="number"
            name="price"
            value={newOutfit.price}
            onChange={handleInputChange}
            className="create-outfit-modal-input"
            required
          />
        </div>

        <div className="create-outfit-modal-form-group">
          <label className="create-outfit-modal-label">Outfit Type</label>
          <div className="create-outfit-modal-tag-list">
            {AVAILABLE_TAGS.components.map(tag => (
              <button
                key={tag}
                type="button"
                className={`create-outfit-modal-tag ${newOutfit.type === tag ? 'selected' : ''}`}
                onClick={() => handleTagSelection(tag, 'components')}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="create-outfit-modal-form-group">
          <label className="create-outfit-modal-label">Location</label>
          <select
            name="location"
            value={newOutfit.location || ''}
            onChange={handleInputChange}
            className="create-outfit-modal-select"
            required
          >
            <option value="">Select a location</option>
            {Object.entries(LOCATIONS).map(([category, locations]) => (
              <optgroup key={category} label={category}>
                {locations.map(location => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="create-outfit-modal-form-group">
          <label className="create-outfit-modal-label">Tags</label>
          <div className="create-outfit-modal-tags">
            {Object.entries(AVAILABLE_TAGS).map(([category, tags]) => (
              <div key={category} className="create-outfit-modal-tag-category">
                <h4>{category}</h4>
                <div className="create-outfit-modal-tag-list">
                  {tags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      className={`create-outfit-modal-tag ${selectedTags.includes(tag) ? 'selected' : ''}`}
                      onClick={() => handleTagSelection(tag, category)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="create-outfit-modal-actions">
          <button
            type="button"
            onClick={onClose}
            className="create-outfit-modal-cancel-btn"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleNextStep}
            className="create-outfit-modal-next-btn"
            disabled={!newOutfit.mainImageUrl || !newOutfit.title || !newOutfit.description || !newOutfit.price}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );

  const renderComponentsStep = () => (
    <div className="create-outfit-modal-grid">
      <div className="create-outfit-modal-images">
        <div className="create-outfit-modal-main-image-container">
          <h3 className="create-outfit-modal-main-image-title">
            {activeComponentIndex === -1 ? 'Main Outfit' : `${newOutfit.components[activeComponentIndex].type} Image`}
          </h3>
          {activeComponentIndex === -1 ? (
            <img 
              src={newOutfit.mainImageUrl} 
              alt="Main outfit" 
              className="create-outfit-modal-main-image"
            />
          ) : (
            newOutfit.components[activeComponentIndex].imageUrl ? (
              <img 
                src={newOutfit.components[activeComponentIndex].imageUrl} 
                alt={newOutfit.components[activeComponentIndex].type}
                className="create-outfit-modal-main-image"
              />
            ) : (
              <div className="create-outfit-modal-main-image-placeholder">
                Click to upload {newOutfit.components[activeComponentIndex].type.toLowerCase()} image
                <input
                  type="file"
                  accept="image/*"
                  className="create-outfit-modal-image-upload"
                  onChange={(e) => handleImageUpload(e)}
                  disabled={uploading}
                />
              </div>
            )
          )}
        </div>

        <div className="create-outfit-modal-thumbnails-container">
          <h3 className="create-outfit-modal-thumbnails-title">Components</h3>
          <div className="create-outfit-modal-thumbnails-grid">
            <div 
              className={`create-outfit-modal-thumbnail ${activeComponentIndex === -1 ? 'active' : ''}`}
              onClick={() => setActiveComponentIndex(-1)}
            >
              {newOutfit.mainImageUrl ? (
                <img 
                  src={newOutfit.mainImageUrl} 
                  alt="Main outfit"
                  className="create-outfit-modal-thumbnail-image"
                />
              ) : (
                <div className="create-outfit-modal-thumbnail-placeholder">
                  Main Outfit
                </div>
              )}
            </div>
            {newOutfit.components.map((comp, index) => (
              <div 
                key={index}
                className={`create-outfit-modal-thumbnail ${activeComponentIndex === index ? 'active' : ''}`}
                onClick={() => setActiveComponentIndex(index)}
              >
                {comp.imageUrl ? (
                  <img 
                    src={comp.imageUrl} 
                    alt={comp.type}
                    className="create-outfit-modal-thumbnail-image"
                  />
                ) : (
                  <div className="create-outfit-modal-thumbnail-placeholder">
                    {comp.type}
                  </div>
                )}
                {uploading && index === activeComponentIndex && (
                  <div className="create-outfit-modal-uploading-overlay">
                    Uploading...
                  </div>
                )}
              </div>
            ))}
            <div className="create-outfit-modal-add-component-container">
              <select
                value={selectedComponentType}
                onChange={(e) => setSelectedComponentType(e.target.value)}
                className="create-outfit-modal-component-select"
              >
                <option value="">Select Component Type</option>
                {AVAILABLE_TAGS.components.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="create-outfit-modal-add-component"
                onClick={handleAddComponent}
                disabled={!selectedComponentType}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="create-outfit-modal-form">
        {activeComponentIndex === -1 ? (
          <>
            <div className="create-outfit-modal-form-group">
              <label className="create-outfit-modal-label">Location</label>
              <select
                name="location"
                value={newOutfit.location || ''}
                onChange={handleInputChange}
                className="create-outfit-modal-select"
                required
              >
                <option value="">Select a location</option>
                {Object.entries(LOCATIONS).map(([category, locations]) => (
                  <optgroup key={category} label={category}>
                    {locations.map(location => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="create-outfit-modal-form-group">
              <label className="create-outfit-modal-label">Tags</label>
              <div className="create-outfit-modal-tags">
                {Object.entries(AVAILABLE_TAGS).map(([category, tags]) => (
                  <div key={category} className="create-outfit-modal-tag-category">
                    <h4>{category}</h4>
                    <div className="create-outfit-modal-tag-list">
                      {tags.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          className={`create-outfit-modal-tag ${selectedTags.includes(tag) ? 'selected' : ''}`}
                          onClick={() => handleTagSelection(tag, category)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="create-outfit-modal-form-group">
              <label className="create-outfit-modal-label">
                {newOutfit.components[activeComponentIndex].type} Description
              </label>
              <textarea
                name="description"
                value={newOutfit.components[activeComponentIndex].description}
                onChange={(e) => handleComponentChange(e, activeComponentIndex)}
                className="create-outfit-modal-textarea"
                required
              />
            </div>
            <div className="create-outfit-modal-form-group">
              <label className="create-outfit-modal-label">
                {newOutfit.components[activeComponentIndex].type} Price per day (Rs)
              </label>
              <input
                type="number"
                name="price"
                value={newOutfit.components[activeComponentIndex].price}
                onChange={(e) => handleComponentChange(e, activeComponentIndex)}
                className="create-outfit-modal-input"
                required
              />
            </div>
            <div className="create-outfit-modal-form-group">
              <label className="create-outfit-modal-label">Location</label>
              <select
                name="location"
                value={newOutfit.location || ''}
                onChange={handleInputChange}
                className="create-outfit-modal-select"
                required
              >
                <option value="">Select a location</option>
                {Object.entries(LOCATIONS).map(([category, locations]) => (
                  <optgroup key={category} label={category}>
                    {locations.map(location => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="create-outfit-modal-form-group">
              <label className="create-outfit-modal-label">Tags</label>
              <div className="create-outfit-modal-tags">
                {Object.entries(AVAILABLE_TAGS).map(([category, tags]) => (
                  <div key={category} className="create-outfit-modal-tag-category">
                    <h4>{category}</h4>
                    <div className="create-outfit-modal-tag-list">
                      {tags.map(tag => {
                        const isSelected = newOutfit.components[activeComponentIndex].tags?.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            className={`create-outfit-modal-tag ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleTagSelection(tag, category)}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="create-outfit-modal-actions">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="create-outfit-modal-back-btn"
          >
            Back
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="create-outfit-modal-submit-btn"
            disabled={!newOutfit.components.every(comp => comp.description && comp.price)}
          >
            Create Outfit
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <Motion.div
      className="create-outfit-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <Motion.div
        className="create-outfit-modal-content"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="create-outfit-modal-title">
          {step === 1 ? 'Create New Outfit' : 'Add Components'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          {step === 1 ? renderMainOutfitStep() : renderComponentsStep()}
        </form>
      </Motion.div>
    </Motion.div>
  );
}
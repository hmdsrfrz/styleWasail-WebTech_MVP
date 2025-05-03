// src/components/CreateOutfitModal.jsx
import { motion as Motion } from 'framer-motion';
import { useState } from 'react';
import './CreateOutfitModal.css';

export default function CreateOutfitModal({ onClose, onSubmit }) {
  const [newOutfit, setNewOutfit] = useState({
    title: '',
    description: '',
    user: 'You',
    price: '',
    location: '',
    components: [
      { type: 'Top', description: '', image: null },
      { type: 'Bottom', description: '', image: null },
      { type: 'Shoes', description: '', image: null }
    ]
  });
  const [activeComponentIndex, setActiveComponentIndex] = useState(0);

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

  const handleImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const updatedComponents = [...newOutfit.components];
        updatedComponents[index] = {
          ...updatedComponents[index],
          image: event.target.result
        };
        setNewOutfit(prev => ({ ...prev, components: updatedComponents }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(newOutfit);
    onClose();
  };

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
        <h2 className="create-outfit-modal-title">Create New Outfit</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="create-outfit-modal-grid">
            {/* Left Side - Images */}
            <div className="create-outfit-modal-images">
              <div className="create-outfit-modal-main-image-container">
                <h3 className="create-outfit-modal-main-image-title">Main Image</h3>
                {newOutfit.components[activeComponentIndex].image ? (
                  <img 
                    src={newOutfit.components[activeComponentIndex].image} 
                    alt="Selected component" 
                    className="create-outfit-modal-main-image"
                  />
                ) : (
                  <div className="create-outfit-modal-main-image-placeholder">
                    No image selected
                  </div>
                )}
              </div>

              <div className="create-outfit-modal-thumbnails-container">
                <h3 className="create-outfit-modal-thumbnails-title">Component Thumbnails</h3>
                <div className="create-outfit-modal-thumbnails-grid">
                  {newOutfit.components.map((comp, index) => (
                    <div 
                      key={index}
                      className={`create-outfit-modal-thumbnail ${activeComponentIndex === index ? 'active' : ''}`}
                      onClick={() => setActiveComponentIndex(index)}
                    >
                      {comp.image ? (
                        <img 
                          src={comp.image} 
                          alt={comp.type}
                          className="create-outfit-modal-thumbnail-image"
                        />
                      ) : (
                        <div className="create-outfit-modal-thumbnail-placeholder">
                          {comp.type}
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="create-outfit-modal-thumbnail-upload"
                        onChange={(e) => handleImageUpload(e, index)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
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
                <label className="create-outfit-modal-label">Price per day ($)</label>
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
                <label className="create-outfit-modal-label">Location</label>
                <input
                  type="text"
                  name="location"
                  value={newOutfit.location}
                  onChange={handleInputChange}
                  className="create-outfit-modal-input"
                  required
                />
              </div>

              <div className="create-outfit-modal-form-group">
                <h3 className="create-outfit-modal-component-title">Component Details</h3>
                <div>
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
                  type="submit"
                  className="create-outfit-modal-submit-btn"
                >
                  Create Outfit
                </button>
              </div>
            </div>
          </div>
        </form>
      </Motion.div>
    </Motion.div>
  );
}
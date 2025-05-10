// src/components/OutfitModal.jsx
import { motion as Motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import RentConfirmationModal from './RentConfirmationModal';
import './OutfitModal.css';

export default function OutfitModal({ outfit, activeComponent, setActiveComponent, onClose }) {
  const navigate = useNavigate();
  const [showRentConfirmation, setShowRentConfirmation] = useState(false);

  const handleRentConfirm = (rentalDetails) => {
    const newRental = {
      id: Date.now(),
      item: outfit.title,
      description: outfit.description,
      components: outfit.components.map(comp => ({
        type: comp.type,
        description: comp.description,
        image: comp.image
      })),
      status: 'Pending',
      price: `$${outfit.price}/day`,
      startDate: rentalDetails.startDate,
      endDate: rentalDetails.endDate,
      specialRequests: rentalDetails.specialRequests
    };

    navigate('/renting', { state: { newRental } });
    onClose();
  };

  return (
    <>
      <Motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <Motion.div
          className="modal-content"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left Side - Images */}
          <div className="modal-images">
            <div className="main-image">
              <img 
                src={outfit.components[activeComponent].image} 
                alt="Main outfit" 
              />
            </div>
            <div className="thumbnail-grid">
              {outfit.components.map((comp, index) => (
                <Motion.div
                  key={index}
                  className={`thumbnail ${activeComponent === index ? 'active' : ''}`}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setActiveComponent(index)}
                  style={{
                    aspectRatio: '1/1',
                    width: '80px',
                    overflow: 'hidden'
                  }}
                >
                  <img 
                    src={comp.image} 
                    alt={comp.type} 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </Motion.div>
              ))}
            </div>
          </div>

          {/* Right Side - Details */}
          <div className="modal-details">
            <h1>{outfit.title}</h1>
            <p className="user">by {outfit.user}</p>
            
            <div className="description-box">
              <h3>Outfit Description</h3>
              <p>{outfit.description}</p>
              
              <h3>Current Component</h3>
              <p>
                <strong>{outfit.components[activeComponent].type}:</strong> {' '}
                {outfit.components[activeComponent].description}
              </p>
            </div>
            
            <button 
              className="rent-button" 
              onClick={() => setShowRentConfirmation(true)}
            >
              Rent This Outfit - ${outfit.price}/day
            </button>
          </div>
        </Motion.div>
      </Motion.div>

      {showRentConfirmation && (
        <RentConfirmationModal
          outfit={outfit}
          onConfirm={handleRentConfirm}
          onCancel={() => setShowRentConfirmation(false)}
        />
      )}
    </>
  );
}
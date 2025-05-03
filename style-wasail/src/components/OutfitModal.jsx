// src/components/OutfitModal.jsx
import { motion as Motion } from 'framer-motion';

export default function OutfitModal({ outfit, activeComponent, setActiveComponent, onClose }) {
  return (
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
              >
                <img src={comp.image} alt={comp.type} />
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
              <strong>{outfit.components[activeComponent].type}:</strong> 
              {outfit.components[activeComponent].description}
            </p>
          </div>
          
          <button className="rent-button">
            Rent This Outfit - ${outfit.price}/day
          </button>
        </div>
      </Motion.div>
    </Motion.div>
  );
}
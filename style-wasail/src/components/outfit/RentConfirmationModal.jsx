// src/components/RentConfirmationModal.jsx
import { motion as Motion } from 'framer-motion';
import { useState } from 'react';
import './RentConfirmationModal.css';

export default function RentConfirmationModal({ 
  outfit, 
  onConfirm, 
  onCancel 
}) {
  const [rentalDetails, setRentalDetails] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    specialRequests: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRentalDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Motion.div
      className="rent-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <Motion.div
        className="rent-modal-content"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="rent-modal-header">Confirm Rental Details</h2>
        <p className="rent-modal-description">You're about to rent: <strong>{outfit.title}</strong></p>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          onConfirm(rentalDetails);
        }}>
          <div className="rent-modal-form-group">
            <label className="rent-modal-label">Start Date:</label>
            <input
              type="date"
              name="startDate"
              value={rentalDetails.startDate}
              onChange={handleChange}
              className="rent-modal-input"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="rent-modal-form-group">
            <label className="rent-modal-label">End Date:</label>
            <input
              type="date"
              name="endDate"
              value={rentalDetails.endDate}
              onChange={handleChange}
              className="rent-modal-input"
              min={rentalDetails.startDate}
              required
            />
          </div>

          <div className="rent-modal-form-group">
            <label className="rent-modal-label">Special Requests (optional):</label>
            <textarea
              name="specialRequests"
              value={rentalDetails.specialRequests}
              onChange={handleChange}
              className="rent-modal-textarea"
              rows="3"
            />
          </div>

          <div className="rent-modal-buttons">
            <button type="button" onClick={onCancel} className="rent-modal-cancel">
              Cancel
            </button>
            <button type="submit" className="rent-modal-confirm">
              Confirm Rental
            </button>
          </div>
        </form>
      </Motion.div>
    </Motion.div>
  );
}
// src/components/OutfitModal.jsx
import { useEffect, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import RentConfirmationModal from './RentConfirmationModal';
import './OutfitModal.css';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DatePicker from 'react-datepicker';
import { formatCurrency } from '../../utils/formatters';

export default function OutfitModal({ outfit, activeComponent, setActiveComponent, onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showRentConfirmation, setShowRentConfirmation] = useState(false);
  const [fullOutfit, setFullOutfit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rentError, setRentError] = useState(null);
  const [rentStartDate, setRentStartDate] = useState(null);
  const [rentEndDate, setRentEndDate] = useState(null);
  const [rentLoading, setRentLoading] = useState(false);
  const [rentSuccess, setRentSuccess] = useState(false);

  useEffect(() => {
    async function fetchOutfit() {
      if (!outfit) {
        setError('No outfit data provided');
        return;
      }

      // If we already have the full outfit data, use it
      if (typeof outfit === 'object' && outfit.components && outfit.description) {
        setFullOutfit(outfit);
        return;
      }

      // Otherwise fetch the full outfit data using the ID
      const outfitId = typeof outfit === 'string' ? outfit : (outfit._id || (outfit.outfit && outfit.outfit._id));
      if (!outfitId) {
        setError('Invalid outfit ID');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        console.log('Fetching outfit with ID:', outfitId);
        const res = await api.get(`/outfits/${outfitId}`);
        console.log('Outfit data received:', res.data);
        setFullOutfit(res.data.data.outfit || res.data.data);
      } catch (err) {
        console.error('Error fetching outfit:', err);
        setError(err.response?.data?.message || 'Failed to load outfit details. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    fetchOutfit();
  }, [outfit]);

  const handleRentConfirm = (rentalDetails) => {
    if (!fullOutfit) return;
    const newRental = {
      id: Date.now(),
      outfitId: fullOutfit._id,
      title: fullOutfit.title,
      description: fullOutfit.description,
      mainImage: fullOutfit.mainImage,
      components: (fullOutfit.components || []).map(comp => ({
        type: comp.type,
        description: comp.description,
        image: comp.image
      })),
      status: 'Pending',
      price: fullOutfit.price,
      startDate: rentalDetails.startDate,
      endDate: rentalDetails.endDate,
      specialRequests: rentalDetails.specialRequests
    };
    navigate('/renting', { state: { newRental } });
    onClose();
  };

  const handleRentClick = () => {
    if (fullOutfit && user && fullOutfit.creator && fullOutfit.creator._id === user._id) {
      setRentError("You can't rent your own outfit.");
      setTimeout(() => setRentError(null), 2500);
      return;
    }
    setShowRentConfirmation(true);
  };

  async function handleRentSubmit(e) {
    e.preventDefault();
    setRentLoading(true);
    setRentError(null);
    try {
      await api.post('/rentals/request', {
        outfitId: fullOutfit._id,
        startDate: rentStartDate,
        endDate: rentEndDate
      });
      setRentSuccess(true);
      setTimeout(() => {
        setRentSuccess(false);
        onClose();
        // Optionally: navigate('/renting');
      }, 1500);
    } catch (err) {
      setRentError(err.response?.data?.message || 'Failed to create rental request.');
    } finally {
      setRentLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="loading">Loading outfit details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="error-message">{error}</div>
          <button onClick={onClose} className="close-button">Close</button>
        </div>
      </div>
    );
  }

  if (!fullOutfit) return null;

  return (
    <>
      <div className="modal-overlay">
        <Motion.div 
          className="modal-content" 
          initial={{ scale: 0.95 }} 
          animate={{ scale: 1 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="close-button" onClick={onClose}>×</button>
          <div className="modal-body">
            {/* Left Side - Images */}
            <div className="modal-images">
              {fullOutfit.mainImage && (
                <div className="main-image-container">
                  <img 
                    src={fullOutfit.mainImage} 
                    alt={fullOutfit.title} 
                    className="main-image" 
                  />
                </div>
              )}
              {/* Thumbnails for components */}
              <div className="thumbnails">
                {(fullOutfit.components || []).map((comp, idx) => (
                  <div
                    key={comp.componentId || idx}
                    className={`thumbnail${activeComponent === idx ? ' active' : ''}`}
                    onClick={() => setActiveComponent(idx)}
                  >
                    <img src={comp.image} alt={comp.type} />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Details */}
            <div className="modal-details">
              <h1>{fullOutfit.title}</h1>
              <p className="user">by {fullOutfit.creator?.name || 'Unknown'}</p>
              
              <div className="description-box">
                <h3>Outfit Description</h3>
                <p>{fullOutfit.description}</p>
                
                {fullOutfit.components && fullOutfit.components[activeComponent] && (
                  <>
                    <h3>Current Component</h3>
                    <p>
                      <strong>{fullOutfit.components[activeComponent].type}:</strong>{' '}
                      {fullOutfit.components[activeComponent].description}
                    </p>
                  </>
                )}

                <div className="outfit-meta">
                  <div className="meta-item">
                    <span className="label">Price:</span>
                    <span className="value">{formatCurrency(fullOutfit.price)}/day</span>
                  </div>
                  {fullOutfit.location && (
                    <div className="meta-item">
                      <span className="label">Location:</span>
                      <span className="value">{fullOutfit.location}</span>
                    </div>
                  )}
                  {fullOutfit.tags && fullOutfit.tags.length > 0 && (
                    <div className="meta-item">
                      <span className="label">Tags:</span>
                      <div className="tags">
                        {fullOutfit.tags.map((tag, idx) => (
                          <span key={idx} className="tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="rent-form-section" style={{ marginTop: '2rem' }}>
                <h3>Rent this Outfit</h3>
                <form onSubmit={handleRentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label>Start Date:</label>
                    <DatePicker
                      selected={rentStartDate}
                      onChange={date => setRentStartDate(date)}
                      minDate={new Date()}
                      selectsStart
                      startDate={rentStartDate}
                      endDate={rentEndDate}
                      className="date-picker"
                      required
                    />
                  </div>
                  <div>
                    <label>End Date:</label>
                    <DatePicker
                      selected={rentEndDate}
                      onChange={date => setRentEndDate(date)}
                      minDate={rentStartDate || new Date()}
                      selectsEnd
                      startDate={rentStartDate}
                      endDate={rentEndDate}
                      className="date-picker"
                      required
                    />
                  </div>
                  {rentError && <div style={{ color: 'red' }}>{rentError}</div>}
                  {rentSuccess && <div style={{ color: 'green' }}>Rental request sent!</div>}
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={!rentStartDate || !rentEndDate || rentLoading}
                  >
                    {rentLoading ? 'Requesting...' : 'Rent this Outfit'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </Motion.div>
      </div>

      {showRentConfirmation && (
        <RentConfirmationModal
          outfit={fullOutfit}
          onConfirm={handleRentConfirm}
          onCancel={() => setShowRentConfirmation(false)}
        />
      )}
    </>
  );
}
import { motion as Motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import axios from 'axios';
import VantaBackground from '../../components/miscellaneous/VantaBackground';
import Navbar from '../../components/miscellaneous/Navbar';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './RentingDashboard.css';
import { useAuth } from '../../context/AuthContext';
import { rentalAPI } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function RentingDashboard() {
  const { user } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [receiptFiles, setReceiptFiles] = useState({});
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [extensionStartDate, setExtensionStartDate] = useState(null);
  const [extensionEndDate, setExtensionEndDate] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [extensionLoading, setExtensionLoading] = useState(false);
  const [extensionError, setExtensionError] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(null);
  const [cancelError, setCancelError] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    fetchRentals();
  }, []);

  async function fetchRentals() {
    setLoading(true);
    setError(null);
    try {
      const res = await rentalAPI.getMyRentals();
      const rentalsArray = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.data)
          ? res.data.data
          : [];
      setRentals(rentalsArray);
      console.log('Rentals API response:', res);
    } catch (err) {
      console.error('Error fetching rentals:', err);
      setError(err.response?.data?.message || 'Failed to load rentals.');
    } finally {
      setLoading(false);
    }
  }

  // Split rentals into renting and lending
  const rentingItems = rentals.filter(r => user && String(r.renter._id) === String(user._id));
  const lendingItems = rentals.filter(r => user && String(r.owner._id) === String(user._id));

  async function handleReceiptUpload(rentalId, file) {
    if (!file) return;
    setUploadLoading(rentalId);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('receipt', file);

      await rentalAPI.uploadReceipt(rentalId, formData);
      await fetchRentals();
    } catch (err) {
      console.error('Receipt upload error:', err);
      setUploadError('Failed to upload receipt. Please try again.');
    } finally {
      setUploadLoading(null);
    }
  }

  function handleExtendClick(rental) {
    setSelectedRental(rental);
    const currentEndDate = new Date(rental.rentalPeriod.endDate);
    const defaultStartDate = new Date(currentEndDate);
    defaultStartDate.setDate(currentEndDate.getDate() + 1);
    const defaultEndDate = new Date(defaultStartDate);
    defaultEndDate.setDate(defaultStartDate.getDate() + 7);
    setExtensionStartDate(defaultStartDate);
    setExtensionEndDate(defaultEndDate);
    setShowExtensionModal(true);
  }

  function formatDate(dateString) {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }

  async function handleApproveRequest(rentalId) {
    setActionLoading(rentalId);
    setActionError(null);
    try {
      const response = await rentalAPI.acceptRental(rentalId);
      await fetchRentals();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to approve request.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeclineRequest(rentalId) {
    setActionLoading(rentalId);
    setActionError(null);
    try {
      await rentalAPI.declineRental(rentalId);
      await fetchRentals();
    } catch (err) {
      setActionError('Failed to decline request.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleExtensionSubmit() {
    if (!selectedRental || !extensionStartDate || !extensionEndDate) return;
    setExtensionLoading(true);
    setExtensionError(null);
    try {
      await rentalAPI.requestExtension(selectedRental._id, {
        startDate: extensionStartDate,
        endDate: extensionEndDate
      });
      setShowExtensionModal(false);
      await fetchRentals();
    } catch (err) {
      setExtensionError('Failed to request extension.');
    } finally {
      setExtensionLoading(false);
    }
  }

  async function handleExtensionReceiptUpload(rentalId, file) {
    if (!file) return;
    setUploadLoading(rentalId);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('receipt', file);

      await rentalAPI.uploadExtensionReceipt(rentalId, formData);
      await fetchRentals();
    } catch (err) {
      console.error('Extension receipt upload error:', err);
      setUploadError('Failed to upload extension receipt. Please try again.');
    } finally {
      setUploadLoading(null);
    }
  }

  async function handleAcceptExtension(rentalId) {
    setActionLoading(rentalId);
    setActionError(null);
    try {
      await rentalAPI.acceptExtension(rentalId);
      await fetchRentals();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to accept extension.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeclineExtension(rentalId) {
    setActionLoading(rentalId);
    setActionError(null);
    try {
      await rentalAPI.declineExtension(rentalId);
      await fetchRentals();
    } catch (err) {
      setActionError('Failed to decline extension.');
    } finally {
      setActionLoading(null);
    }
  }

  function calculateExtensionAmount(rental) {
    if (!rental || !rental.extensionRequest) return 0;
    const days = rental.extensionRequest.endDate && rental.extensionRequest.startDate
      ? Math.ceil((new Date(rental.extensionRequest.endDate) - new Date(rental.extensionRequest.startDate)) / (1000 * 60 * 60 * 24))
      : 0;
    return rental.outfit.dailyPrice * days;
  }

  function calculateTotalAmount(rental) {
    if (!rental) return 0;
    const baseAmount = rental.payment.totalAmount || 0;
    const extensionAmount = calculateExtensionAmount(rental);
    return baseAmount + extensionAmount;
  }

  const WhatsAppButton = () => {
    return (
      <a
        href="https://wa.me/+923355333073"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-button"
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
          alt="WhatsApp"
          className="whatsapp-icon"
        />
      </a>
    );
  };

  if (loading) return <div className="account-content">Loading...</div>;
  if (error) return <div className="account-content" style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="renting-dashboard-container">
      <Navbar />
      <VantaBackground />
      <WhatsAppButton />
      <Motion.div
        className="dashboard-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Motion.h1 className="dashboard-title">Renting Dashboard</Motion.h1>
        {/* Items You're Renting section */}
        <div className="account-section">
          <h2>Items You're Renting</h2>
          <div className="items-list">
            {rentingItems.length === 0 ? (
              <div style={{ color: '#888', padding: '1rem' }}>You are not renting any items right now.</div>
            ) : rentingItems.map(item => (
              <div key={item._id} className={`item-card ${item.status.toLowerCase().replace(/ /g, '-')}`}> 
                <h3>{item.outfit.title}</h3>
                <p>{item.outfit.description}</p>
                <div className="item-details">
                  <p><strong>Status:</strong> <span className="status-badge">{item.status}</span></p>
                  <p><strong>Owner:</strong> {item.owner.name}</p>
                  <p><strong>Period:</strong> {formatDate(item.rentalPeriod.startDate)} to {formatDate(item.rentalPeriod.endDate)}</p>
                  <p><strong>Price:</strong> {formatCurrency(item.outfit.dailyPrice)}/day</p>
                  <p><strong>Total Rent:</strong> {formatCurrency(calculateTotalAmount(item))}</p>
                  
                  {/* Receipt Upload Section for Renters */}
                  {item.status === 'pending' && (
                    <div className="receipt-upload-section">
                      {!item.payment?.receiptImage ? (
                        <>
                          <div className="receipt-upload">
                            <label htmlFor={`upload-receipt-${item._id}`} className="upload-btn">
                              {uploadLoading === item._id ? 'Uploading...' : 'Upload Receipt'}
                              <input
                                id={`upload-receipt-${item._id}`}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={e => handleReceiptUpload(item._id, e.target.files[0])}
                                disabled={uploadLoading === item._id}
                              />
                            </label>
                            <p className="receipt-message" style={{ color: '#ff0000', marginTop: '0.5rem' }}>
                              Please upload a receipt for rental approval
                            </p>
                            {uploadError && uploadLoading === item._id && (
                              <div style={{ color: 'red', marginTop: '0.5rem' }}>{uploadError}</div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="receipt-section">
                          {viewingReceipt === item._id ? (
                            <>
                              <img src={item.payment.receiptImage} alt="Receipt" className="receipt-image" />
                              <button className="close-btn" onClick={() => setViewingReceipt(null)}>Close</button>
                            </>
                          ) : (
                            <button className="see-receipt-btn" onClick={() => setViewingReceipt(item._id)}>See Receipt</button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Extension and Cancel Request buttons for pending/active rentals */}
                  {item.status === 'active' && !item.extensionRequest?.requested && (
                    <button
                      className="extend-button"
                      onClick={() => handleExtendClick(item)}
                    >
                      Request Extension
                    </button>
                  )}
                  {item.status === 'pending' && (
                    <button
                      className="decline-btn"
                      onClick={() => handleCancelRequest(item._id)}
                      disabled={cancelLoading === item._id}
                    >
                      {cancelLoading === item._id ? 'Cancelling...' : 'Cancel Request'}
                    </button>
                  )}
                  {cancelError && cancelLoading === item._id && (
                    <div style={{ color: 'red', marginTop: '0.5rem' }}>{cancelError}</div>
                  )}
                  {item.extensionRequest?.requested && (
                    <div className="extension-status">
                      <p><strong>Extension Status:</strong> {item.extensionRequest.status}</p>
                      <p>Requested: {formatDate(item.extensionRequest.startDate)} to {formatDate(item.extensionRequest.endDate)}</p>
                      <p><strong>Extension Total:</strong> {formatCurrency(calculateExtensionAmount(item))}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Items You're Lending section */}
        <div className="account-section">
          <h2>Items You're Lending</h2>
          <div className="items-list">
            {lendingItems.length === 0 ? (
              <div style={{ color: '#888', padding: '1rem' }}>You are not lending any items right now.</div>
            ) : lendingItems.map(item => (
              <div key={item._id} className={`item-card ${item.status.toLowerCase().replace(/ /g, '-')}`}> 
                <h3>{item.outfit.title}</h3>
                <p>{item.outfit.description}</p>
                <div className="item-details">
                  <p><strong>Status:</strong> <span className="status-badge">{item.status}</span></p>
                  <p><strong>Renter:</strong> {item.renter.name}</p>
                  <p><strong>Period:</strong> {formatDate(item.rentalPeriod.startDate)} to {formatDate(item.rentalPeriod.endDate)}</p>
                  <p><strong>Price:</strong> {formatCurrency(item.outfit.dailyPrice)}/day</p>
                  <p><strong>Total Rent:</strong> {formatCurrency(calculateTotalAmount(item))}</p>
                  
                  {/* Receipt Section for Lenders */}
                  {item.status === 'pending' && (
                    <div className="receipt-section">
                      {!item.payment?.receiptImage ? (
                        <div className="receipt-status">
                          <p className="receipt-message">Waiting for receipt upload</p>
                        </div>
                      ) : (
                        <div className="receipt-view">
                          {viewingReceipt === item._id ? (
                            <>
                              <img src={item.payment.receiptImage} alt="Receipt" className="receipt-image" />
                              <button className="close-btn" onClick={() => setViewingReceipt(null)}>Close</button>
                            </>
                          ) : (
                            <button className="see-receipt-btn" onClick={() => setViewingReceipt(item._id)}>
                              View Receipt
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Only show Approve/Decline for pending rentals */}
                  {item.status === 'pending' && (
                    <div className="request-actions">
                      <button
                        className="approve-btn"
                        onClick={() => handleApproveRequest(item._id)}
                        disabled={actionLoading === item._id || !item.payment?.receiptImage}
                        title={!item.payment?.receiptImage ? "Cannot approve until receipt is uploaded" : ""}
                      >
                        {actionLoading === item._id ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        className="decline-btn"
                        onClick={() => handleDeclineRequest(item._id)}
                        disabled={actionLoading === item._id}
                      >
                        {actionLoading === item._id ? 'Declining...' : 'Decline'}
                      </button>
                      {actionError && actionLoading === item._id && (
                        <div style={{ color: 'red', marginTop: '0.5rem' }}>{actionError}</div>
                      )}
                      {!item.payment?.receiptImage && (
                        <div style={{ color: '#ff9800', marginTop: '0.5rem' }}>
                          Waiting for receipt upload before approval
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Extension Modal */}
        {showExtensionModal && selectedRental && (
          <div className="modal-overlay">
            <Motion.div 
              className="modal-content"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <h2>Request Extension</h2>
              <p>Request to extend rental for: <strong>{selectedRental.outfit.title}</strong></p>
              <div className="date-picker-group">
                <label>Extension Start Date:</label>
                <DatePicker
                  selected={extensionStartDate}
                  onChange={(date) => setExtensionStartDate(date)}
                  minDate={new Date(selectedRental.rentalPeriod.endDate)}
                  selectsStart
                  startDate={extensionStartDate}
                  endDate={extensionEndDate}
                  className="date-picker"
                />
              </div>
              <div className="date-picker-group">
                <label>Extension End Date:</label>
                <DatePicker
                  selected={extensionEndDate}
                  onChange={(date) => setExtensionEndDate(date)}
                  minDate={extensionStartDate}
                  selectsEnd
                  startDate={extensionStartDate}
                  endDate={extensionEndDate}
                  className="date-picker"
                />
              </div>
              {extensionError && <div style={{ color: 'red', marginTop: '0.5rem' }}>{extensionError}</div>}
              <div className="modal-actions">
                <button 
                  className="cancel-button"
                  onClick={() => setShowExtensionModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="submit-button"
                  onClick={handleExtensionSubmit}
                  disabled={!extensionStartDate || !extensionEndDate || extensionLoading}
                >
                  {extensionLoading ? 'Requesting...' : 'Request Extension'}
                </button>
              </div>
            </Motion.div>
          </div>
        )}
      </Motion.div>
    </div>
  );
}
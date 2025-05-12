import { motion as Motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import axios from 'axios';
import VantaBackground from '../../components/miscellaneous/VantaBackground';
import NavToggle from '../../components/miscellaneous/NavToggle';
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
  const [showReceiptUploadModal, setShowReceiptUploadModal] = useState(false);

  useEffect(() => {
    fetchRentals();
  }, []);

  useEffect(() => {
    console.log('Current rentals state:', rentals);
  }, [rentals]);

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
    
    console.log('Uploading receipt for rental:', rentalId, file);
    setUploadLoading(rentalId);
    setUploadError(null);
    
    try {
      const formData = new FormData();
      formData.append('receipt', file);

      const response = await rentalAPI.uploadReceipt(rentalId, formData);
      console.log('Receipt upload response:', response);
      
      // Immediately fetch updated data
      await fetchRentals();
      
      // Reset viewing state
      setViewingReceipt(null);
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
      // Request extension with dates
      await rentalAPI.requestExtension(selectedRental._id, {
        startDate: extensionStartDate,
        endDate: extensionEndDate
      });
      
      // Close the date selection modal
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

      // Use the normal receipt upload API
      await rentalAPI.uploadReceipt(rentalId, formData);
      setShowReceiptUploadModal(false);
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
      console.log('Accepting extension for rental:', rentalId);
      // Explicitly fetch the rental first to check its state
      const rentalResponse = await rentalAPI.getMyRentals();
      const rentals = rentalResponse.data;
      const rental = rentals.find(r => r._id === rentalId);
      
      if (!rental) {
        console.error('Rental not found for ID:', rentalId);
        setActionError('Rental not found');
        return;
      }
      
      console.log('Current rental data before accept:', rental);
      
      if (!rental.extensionRequest?.receiptImage) {
        console.error('Receipt image not found for extension');
        setActionError('Cannot approve extension - receipt image not found');
        return;
      }
      
      try {
        // Now try to accept the extension
        console.log('Sending accept extension request...');
        const response = await rentalAPI.acceptExtension(rentalId);
        console.log('Extension acceptance response:', response);
        
        // On success, refresh the rentals
      await fetchRentals();
      } catch (acceptErr) {
        console.error('Error from accept extension API call:', acceptErr);
        
        // Check if there's a specific error message from the server
        const errorMessage = acceptErr.response?.data?.message || 
                          acceptErr.response?.data?.error || 
                          'Failed to accept extension.';
        
        setActionError(errorMessage);
      }
    } catch (err) {
      console.error('Error in handleAcceptExtension:', err);
      setActionError(err.response?.data?.message || 'Failed to accept extension.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeclineExtension(rentalId) {
    setActionLoading(rentalId);
    setActionError(null);
    try {
      console.log('Declining extension for rental:', rentalId);
      const response = await rentalAPI.declineExtension(rentalId);
      console.log('Extension decline response:', response);
      await fetchRentals();
    } catch (err) {
      console.error('Error declining extension:', err);
      setActionError(err.response?.data?.message || 'Failed to decline extension.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCancelRequest(rentalId) {
    setCancelLoading(rentalId);
    setCancelError(null);
    try {
      await rentalAPI.deleteRental(rentalId);
      await fetchRentals();
    } catch (err) {
      setCancelError(err.response?.data?.message || 'Failed to cancel request.');
    } finally {
      setCancelLoading(null);
    }
  }

  async function handleCancelExtensionRequest(rentalId) {
    setCancelLoading(rentalId);
    setCancelError(null);
    try {
      await rentalAPI.cancelExtensionRequest(rentalId);
      await fetchRentals();
    } catch (err) {
      setCancelError(err.response?.data?.message || 'Failed to cancel extension request.');
    } finally {
      setCancelLoading(null);
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
      <VantaBackground />
      <NavToggle />
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
              <div style={{ color: 'rgba(94, 9, 65, 0.6)', padding: '1rem' }}>You are not renting any items right now.</div>
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

                  {/* Extension Receipt Upload Section for Renters */}
                  {item.extensionRequest?.requested && item.extensionRequest?.status === 'pending' && (
                    <div className="receipt-upload-section">
                      <h4>Extension Request</h4>
                      <p><strong>Extension Period:</strong> {formatDate(item.extensionRequest.startDate)} to {formatDate(item.extensionRequest.endDate)}</p>
                      <p><strong>Extension Amount:</strong> {formatCurrency(calculateExtensionAmount(item))}</p>
                      
                      {/* Debug Info */}
                      <details style={{ fontSize: '12px', marginBottom: '10px', padding: '5px', background: '#f5f5f5', border: '1px solid #ddd' }}>
                        <summary>Debug Info</summary>
                        <pre style={{ whiteSpace: 'pre-wrap', overflow: 'auto' }}>
                          {JSON.stringify({
                            rentalId: item._id,
                            hasReceiptImage: !!item.extensionRequest?.receiptImage,
                            receiptPath: item.extensionRequest?.receiptImage || 'none',
                            uploadLoading: uploadLoading === item._id
                          }, null, 2)}
                        </pre>
                      </details>
                      
                      {!item.extensionRequest?.receiptImage ? (
                        <>
                          <div className="receipt-upload">
                            <label htmlFor={`upload-extension-receipt-${item._id}`} className="upload-btn">
                              {uploadLoading === item._id ? 'Uploading...' : 'Upload Extension Receipt'}
                              <input
                                id={`upload-extension-receipt-${item._id}`}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={e => {
                                  console.log('Selected file for extension receipt:', e.target.files[0]);
                                  handleReceiptUpload(item._id, e.target.files[0]);
                                }}
                                disabled={uploadLoading === item._id}
                              />
                            </label>
                            <p className="receipt-message" style={{ color: '#ff0000', marginTop: '0.5rem' }}>
                              Please upload a receipt for extension approval
                            </p>
                            {uploadError && uploadLoading === item._id && (
                              <div style={{ color: 'red', marginTop: '0.5rem' }}>{uploadError}</div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="receipt-section">
                          <p style={{ color: 'green', fontWeight: 'bold' }}>Receipt uploaded successfully!</p>
                          <button 
                            className="see-receipt-btn" 
                            onClick={() => setViewingReceipt(item._id)}
                          >
                            View Extension Receipt
                          </button>
                          
                          {viewingReceipt === item._id && (
                            <div className="receipt-modal">
                              <img 
                                src={item.extensionRequest.receiptImage} 
                                alt="Extension Receipt" 
                                className="receipt-image" 
                              />
                              <button className="close-btn" onClick={() => setViewingReceipt(null)}>Close</button>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {!item.extensionRequest?.receiptImage && (
                        <button
                          className="decline-btn"
                          onClick={() => handleCancelExtensionRequest(item._id)}
                          disabled={cancelLoading === item._id}
                        >
                          {cancelLoading === item._id ? 'Cancelling...' : 'Cancel Extension Request'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Extension Status (if receipt uploaded) */}
                  {item.extensionRequest?.requested && item.extensionRequest?.receiptImage && (
                    <div className="extension-status">
                      <h4>Extension Request: <span className={`status-badge ${item.extensionRequest.status}`}>{item.extensionRequest.status}</span></h4>
                      <p>Requested: {formatDate(item.extensionRequest.startDate)} to {formatDate(item.extensionRequest.endDate)}</p>
                      <p><strong>Extension Total:</strong> {formatCurrency(calculateExtensionAmount(item))}</p>
                      
                      {/* Status message based on extension status */}
                      {item.extensionRequest.status === 'pending' && (
                        <p className="status-message pending">Waiting for owner approval</p>
                      )}
                      {item.extensionRequest.status === 'accepted' && (
                        <p className="status-message accepted">Extension approved! Your rental has been extended.</p>
                      )}
                      {item.extensionRequest.status === 'declined' && (
                        <p className="status-message declined">Extension declined by the owner.</p>
                      )}
                      
                      {/* Cancel button only for pending extension with receipt */}
                      {item.extensionRequest.status === 'pending' && (
                        <button
                          className="decline-btn"
                          onClick={() => handleCancelExtensionRequest(item._id)}
                          disabled={cancelLoading === item._id}
                        >
                          {cancelLoading === item._id ? 'Cancelling...' : 'Cancel Extension Request'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Extension Request Button */}
                  {item.status === 'active' && !item.extensionRequest?.requested && (
                    <button
                      className="extend-button"
                      onClick={() => handleExtendClick(item)}
                    >
                      Request Extension
                    </button>
                  )}

                  {/* Cancel Rental Request Button */}
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
              <div style={{ color: 'rgba(94, 9, 65, 0.6)', padding: '1rem' }}>You are not lending any items right now.</div>
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

                  {/* Extension Request Actions for Lenders */}
                  {item.extensionRequest?.requested && (
                    <div className="extension-request-section">
                      <h4>Extension Request</h4>
                      <p><strong>Status:</strong> <span className={`status-badge ${item.extensionRequest.status}`}>{item.extensionRequest.status}</span></p>
                      <p><strong>Requested Period:</strong> {formatDate(item.extensionRequest.startDate)} to {formatDate(item.extensionRequest.endDate)}</p>
                      <p><strong>Extension Amount:</strong> {formatCurrency(calculateExtensionAmount(item))}</p>
                      
                      {/* Debug Info */}
                      <details style={{ fontSize: '12px', marginBottom: '10px', padding: '5px', background: '#f5f5f5', border: '1px solid #ddd' }}>
                        <summary>Debug Info</summary>
                        <pre style={{ whiteSpace: 'pre-wrap', overflow: 'auto' }}>
                          {JSON.stringify({
                            rentalId: item._id,
                            hasReceiptImage: !!item.extensionRequest?.receiptImage,
                            receiptPath: item.extensionRequest?.receiptImage || 'none',
                            status: item.extensionRequest?.status
                          }, null, 2)}
                        </pre>
                      </details>
                      
                      {item.extensionRequest?.receiptImage ? (
                        <div className="receipt-view">
                          {viewingReceipt === item._id ? (
                            <>
                              <img src={item.extensionRequest.receiptImage} alt="Extension Receipt" className="receipt-image" />
                              <button className="close-btn" onClick={() => setViewingReceipt(null)}>Close</button>
                            </>
                          ) : (
                            <button className="see-receipt-btn" onClick={() => setViewingReceipt(item._id)}>
                              View Extension Receipt
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="receipt-status">
                          <p className="receipt-message">Waiting for extension receipt upload</p>
                        </div>
                      )}
                      
                      {item.extensionRequest.status === 'pending' && item.extensionRequest?.receiptImage && (
                        <div className="request-actions">
                          <button
                            className="approve-btn"
                            onClick={() => handleAcceptExtension(item._id)}
                            disabled={actionLoading === item._id}
                          >
                            {actionLoading === item._id ? 'Approving...' : 'Approve Extension'}
                          </button>
                          <button
                            className="decline-btn"
                            onClick={() => handleDeclineExtension(item._id)}
                            disabled={actionLoading === item._id}
                          >
                            {actionLoading === item._id ? 'Declining...' : 'Decline Extension'}
                          </button>
                          {actionError && (
                            <div style={{ color: 'red', marginTop: '0.5rem', fontWeight: 'bold' }}>{actionError}</div>
                          )}
                          {/* Direct debug info for action errors */}
                          {actionError && (
                            <details style={{ fontSize: '12px', marginTop: '10px', padding: '5px', background: '#fff4f4', border: '1px solid #ffdddd' }}>
                              <summary>Error Details</summary>
                              <div style={{ color: 'red', padding: '5px' }}>
                                {actionError}
                              </div>
                            </details>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Rental Request Actions */}
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
                      {actionError && (
                        <div style={{ color: 'red', marginTop: '0.5rem', fontWeight: 'bold' }}>{actionError}</div>
                      )}
                      {/* Direct debug info for action errors */}
                      {actionError && (
                        <details style={{ fontSize: '12px', marginTop: '10px', padding: '5px', background: '#fff4f4', border: '1px solid #ffdddd' }}>
                          <summary>Error Details</summary>
                          <div style={{ color: 'red', padding: '5px' }}>
                            {actionError}
                          </div>
                        </details>
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
        {/* Extension Request Modal */}
        {showExtensionModal && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="modal-overlay"
          >
            <Motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="modal-content"
            >
              <h2>Request Extension</h2>
              {extensionError && <p className="error-message">{extensionError}</p>}
              
              <div className="form-group">
                <label>Start Date</label>
                <DatePicker
                  selected={extensionStartDate}
                  onChange={date => setExtensionStartDate(date)}
                  minDate={selectedRental?.rentalPeriod?.endDate}
                  className="date-picker"
                />
              </div>
              
              <div className="form-group">
                <label>End Date</label>
                <DatePicker
                  selected={extensionEndDate}
                  onChange={date => setExtensionEndDate(date)}
                  minDate={extensionStartDate}
                  className="date-picker"
                />
              </div>
              
              {extensionStartDate && extensionEndDate && (
                <div className="amount-preview">
                  <p>Extension Amount: {formatCurrency(calculateExtensionAmount(selectedRental))}</p>
                  <p>Total Amount: {formatCurrency(calculateTotalAmount(selectedRental))}</p>
                </div>
              )}
              
              <div className="modal-actions">
                <button 
                  onClick={() => setShowExtensionModal(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleExtensionSubmit}
                  disabled={!extensionStartDate || !extensionEndDate || extensionLoading}
                  className="submit-button"
                >
                  {extensionLoading ? 'Requesting...' : 'Request Extension'}
                </button>
              </div>
            </Motion.div>
          </Motion.div>
        )}

        {/* Extension Receipt Upload Modal */}
        {showReceiptUploadModal && selectedRental && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="modal-overlay"
          >
            <Motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="modal-content"
            >
              <h2>Upload Extension Receipt</h2>
              {uploadError && <p className="error-message">{uploadError}</p>}
              
              <div className="form-group">
                <label>Receipt Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleExtensionReceiptUpload(selectedRental._id, e.target.files[0])}
                  className="file-input"
                  disabled={uploadLoading === selectedRental._id}
                />
              </div>
              
              <div className="modal-actions">
                <button
                  onClick={() => {
                    setShowReceiptUploadModal(false);
                    handleCancelExtensionRequest(selectedRental._id);
                  }}
                  className="cancel-button"
                  disabled={uploadLoading === selectedRental._id}
                >
                  Cancel Request
                </button>
          </div>
            </Motion.div>
          </Motion.div>
        )}
      </Motion.div>
    </div>
  );
}
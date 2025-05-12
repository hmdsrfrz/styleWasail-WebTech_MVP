import { motion as Motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VantaBackground from '../../components/miscellaneous/VantaBackground';
import NavToggle from '../../components/miscellaneous/NavToggle';
import OutfitModal from '../../components/outfit/OutfitModal';
import './AccountSettings.css';
import { rentalAPI, outfitAPI, authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FaCog, FaMoon, FaSun } from 'react-icons/fa';

export default function AccountSettings() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [outfitLoading, setOutfitLoading] = useState(false);
  const [outfitError, setOutfitError] = useState(null);
  const [activeComponent, setActiveComponent] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [rentalHistory, setRentalHistory] = useState([]);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false);
  const [userSettings, setUserSettings] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profilePicture: user?.profilePicture || ''
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState(null);
  const [stats, setStats] = useState({
    totalRentals: 0,
    activeRentals: 0,
    totalEarned: 0,
    totalSpent: 0,
    upcomingRentals: 0,
    averageRentalDuration: 0,
    mostRentedOutfit: null,
    recentActivity: []
  });

  // Load theme preference from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('styleWasail_darkTheme');
    if (savedTheme) {
      setDarkTheme(savedTheme === 'true');
    }
  }, []);

  // Apply dark theme class to document body when theme changes
  useEffect(() => {
    if (darkTheme) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    
    // Save theme preference to localStorage
    localStorage.setItem('styleWasail_darkTheme', darkTheme);
  }, [darkTheme]);

  // Toggle theme function
  const toggleTheme = () => {
    setDarkTheme(prev => !prev);
  };

  useEffect(() => {
    fetchRentalHistory();
  }, []);

  useEffect(() => {
    if (rentalHistory.length > 0) {
      calculateStats();
    }
  }, [rentalHistory]);

  function calculateStats() {
    const now = new Date();
    const stats = {
      totalRentals: rentalHistory.length,
      activeRentals: 0,
      totalEarned: 0,
      totalSpent: 0,
      upcomingRentals: 0,
      rentalDurations: [],
      mostRentedOutfit: null,
      recentActivity: []
    };

    // Track outfit rental counts
    const outfitRentalCounts = {};

    rentalHistory.forEach(rental => {
      const startDate = new Date(rental.rentalPeriod?.startDate);
      const endDate = new Date(rental.rentalPeriod?.endDate);
      const duration = (endDate - startDate) / (1000 * 60 * 60 * 24); // in days
      
      // Calculate rental duration
      stats.rentalDurations.push(duration);

      // Track outfit rental counts
      if (rental.outfit?._id) {
        outfitRentalCounts[rental.outfit._id] = (outfitRentalCounts[rental.outfit._id] || 0) + 1;
      }

      // Calculate earnings/spending
      if (rental.owner._id === user?._id) {
        stats.totalEarned += rental.payment?.totalAmount || 0;
        if (rental.status === 'active' || rental.status === 'pending') {
          stats.activeRentals++;
        }
      } else {
        stats.totalSpent += rental.payment?.totalAmount || 0;
        if (rental.status === 'active' || rental.status === 'pending') {
          stats.activeRentals++;
        }
      }

      // Check for upcoming rentals
      if (startDate > now && rental.status === 'pending') {
        stats.upcomingRentals++;
      }

      // Add to recent activity
      stats.recentActivity.push({
        type: rental.owner._id === user?._id ? 'earned' : 'spent',
        amount: rental.payment?.totalAmount || 0,
        date: rental.actionDate,
        outfit: rental.outfit?.title
      });
    });

    // Calculate average rental duration
    stats.averageRentalDuration = stats.rentalDurations.length > 0 
      ? stats.rentalDurations.reduce((a, b) => a + b, 0) / stats.rentalDurations.length 
      : 0;

    // Find most rented outfit
    const mostRentedOutfitId = Object.entries(outfitRentalCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0];
    
    if (mostRentedOutfitId) {
      const mostRentedOutfit = rentalHistory.find(r => r.outfit?._id === mostRentedOutfitId)?.outfit;
      stats.mostRentedOutfit = mostRentedOutfit;
    }

    // Sort recent activity by date
    stats.recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
    stats.recentActivity = stats.recentActivity.slice(0, 5); // Keep only 5 most recent

    setStats(stats);
  }

  async function fetchRentalHistory() {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const res = await rentalAPI.getRentalHistory();
      setRentalHistory(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) {
      console.error('Error fetching rental history:', err);
      setHistoryError(err.response?.data?.message || 'Failed to load rental history.');
    } finally {
      setHistoryLoading(false);
    }
  }

  function handleToggleHistory() {
    setShowHistory(v => {
      if (!v) fetchRentalHistory();
      return !v;
    });
  }

  function formatDate(dateString) {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      currencyDisplay: 'symbol'
    }).format(amount).replace('PKR', 'Rs');
  }

  async function handleOutfitClick(outfitId) {
    setOutfitLoading(true);
    setOutfitError(null);
    try {
      console.log('Fetching outfit with ID:', outfitId);
      
      if (!outfitId) {
        throw new Error('Invalid outfit ID');
      }

      const response = await outfitAPI.getOne(outfitId);
      console.log('Outfit response:', response);
      
      if (!response.data) {
        throw new Error('No outfit data received');
      }

      setSelectedOutfit(response.data.data.outfit);
    } catch (err) {
      console.error('Error fetching outfit:', err);
      setOutfitError(err.response?.data?.message || err.message || 'Failed to load outfit details');
    } finally {
      setOutfitLoading(false);
    }
  }

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsError(null);
    try {
      // Only include fields that have been changed
      const updatedFields = {};
      if (userSettings.name !== user?.name) updatedFields.name = userSettings.name;
      if (userSettings.email !== user?.email) updatedFields.email = userSettings.email;
      if (userSettings.phone !== user?.phone) updatedFields.phone = userSettings.phone;

      // Only make API call if there are changes
      if (Object.keys(updatedFields).length > 0) {
        const response = await authAPI.updateDetails(updatedFields);

        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to update user settings');
        }

        // Update the user context with new data
        setUser(response.data.data);
      }
      
      // Close the modal
      setShowSettings(false);
    } catch (err) {
      console.error('Error updating user settings:', err);
      setSettingsError(err.response?.data?.message || err.message || 'Failed to update settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Create form data for file upload
        const formData = new FormData();
        formData.append('profilePicture', file);

        // Upload the file to Cloudinary
        const response = await fetch('/api/v1/users/upload-profile-picture', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error('Failed to upload profile picture');
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to upload profile picture');
        }

        // Update the user settings with the new profile picture URL
        setUserSettings(prev => ({ ...prev, profilePicture: data.data.profilePicture }));
        
        // Update the user context
        setUser(data.data);
      } catch (err) {
        console.error('Error uploading profile picture:', err);
        setSettingsError(err.response?.data?.message || err.message || 'Failed to upload profile picture');
      }
    }
  };

  return (
    <div className={`account-settings-container ${darkTheme ? 'dark-theme' : ''}`}>
      <VantaBackground />
      <NavToggle />

      <Motion.div
        className="account-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="account-header">
          <Motion.h1 className="account-title">
            Welcome, {user?.name}
          </Motion.h1>
          <button 
            className="settings-button"
            onClick={() => setShowSettings(true)}
          >
            <FaCog />
          </button>
        </div>

        {/* User Info Section */}
        <div className="user-info-section" style={{ paddingBottom: '2rem' }}>
          <h3>Account Information</h3>
          <div className="user-info-item">
            <span className="user-info-label">Name:</span>
            <span className="user-info-value">{user?.name || 'Not set'}</span>
          </div>
          <div className="user-info-item">
            <span className="user-info-label">Email:</span>
            <span className="user-info-value">{user?.email || 'Not set'}</span>
          </div>
          <div className="user-info-item">
            <span className="user-info-label">Phone:</span>
            <span className="user-info-value">{user?.phone || 'Not set'}</span>
          </div>
        </div>
        
        <div className="dashboard-grid">
          {/* First row of stats cards */}
          <div className="stats-card">
            <h3>Total Rentals</h3>
            <div className="stat-value">{stats.totalRentals}</div>
            <div className="stat-label">Lifetime Rentals</div>
          </div>

          <div className="stats-card">
            <h3>Active Rentals</h3>
            <div className="stat-value">{stats.activeRentals}</div>
            <div className="stat-label">Currently Active</div>
          </div>

          <div className="stats-card">
            <h3>Total Earnings</h3>
            <div className="stat-value">{formatCurrency(stats.totalEarned)}</div>
            <div className="stat-label">From Lending</div>
          </div>

          <div className="stats-card">
            <h3>Total Spent</h3>
            <div className="stat-value">{formatCurrency(stats.totalSpent)}</div>
            <div className="stat-label">On Rentals</div>
          </div>

          {/* Second row cards - restored */}
          <div className="stats-card">
            <h3>Upcoming Rentals</h3>
            <div className="stat-value">{stats.upcomingRentals}</div>
            <div className="stat-label">Pending</div>
          </div>

        

          {/* Most Rented Outfit */}
          {stats.mostRentedOutfit && (
            <div className="stats-card">
              <h3>Most Rented Outfit</h3>
              <div className="outfit-preview">
                {stats.mostRentedOutfit.images?.[0] && (
                  <img 
                    src={stats.mostRentedOutfit.images[0]} 
                    alt={stats.mostRentedOutfit.title} 
                    className="outfit-thumbnail"
                  />
                )}
                <div 
                  className="outfit-preview-overlay"
                  onClick={() => handleOutfitClick(stats.mostRentedOutfit._id)}
                >
                  <span>Click to view</span>
                </div>
              </div>
              <div className="stat-label">{stats.mostRentedOutfit.title}</div>
            </div>
          )}

          {/* Recent Activity Card - Scrollable */}
          <div className="stats-card recent-activity-card">
            <h3>Recent Activity</h3>
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <div key={index} className={`activity-item ${activity.type}`}>
                  <div className="activity-type">
                    {activity.type === 'earned' ? 'Earned from' : 'Spent on'} {activity.outfit}
                  </div>
                  <div className="activity-amount">{formatCurrency(activity.amount)}</div>
                  <div className="activity-date">{formatDate(activity.date)}</div>
                </div>
              ))
            ) : (
              <div className="empty-state">No recent activity</div>
            )}
          </div>
        </div>

        {/* Rental History Section */}
        <div className="account-section">
          <button className="history-dropdown-btn" onClick={handleToggleHistory}>
            {showHistory ? 'Hide' : 'Show'} Rental History
          </button>
          {showHistory && (
            <div className="history-dropdown-content">
              {historyLoading ? (
                <div>Loading...</div>
              ) : historyError ? (
                <div style={{ color: 'red' }}>{historyError}</div>
              ) : rentalHistory.length === 0 ? (
                <div style={{ color: '#888', padding: '1rem' }}>No rental history yet.</div>
              ) : (
                <div className="items-list">
                  {rentalHistory.map(rental => (
                    <div key={rental._id} className={`item-card ${rental.status.toLowerCase().replace(/ /g, '-')}`}>
                      <div className="outfit-preview">
                        {rental.outfit?.images?.[0] && (
                          <img 
                            src={rental.outfit.images[0]} 
                            alt={rental.outfit.title} 
                            className="outfit-thumbnail"
                          />
                        )}
                        <div 
                          className="outfit-preview-overlay"
                          onClick={() => handleOutfitClick(rental.outfit?._id)}
                        >
                          <span>{outfitLoading ? 'Loading...' : 'Click to view outfit'}</span>
                        </div>
                      </div>
                      <div className="rental-details">
                        <h3>{rental.outfit?.title || 'Outfit'}</h3>
                        <p>{rental.outfit?.description}</p>
                        <div className="item-details">
                          <p><strong>Status:</strong> <span className="status-badge">{rental.status}</span></p>
                          <p><strong>Role:</strong> {rental.owner._id === user?._id ? 'Lender' : 'Renter'}</p>
                          <p><strong>Other Party:</strong> {rental.owner._id === user?._id ? rental.renter.name : rental.owner.name}</p>
                          <p><strong>Period:</strong> {formatDate(rental.rentalPeriod?.startDate)} to {formatDate(rental.rentalPeriod?.endDate)}</p>
                          <p><strong>Total Amount:</strong> {formatCurrency(rental.payment?.totalAmount)}</p>
                          {rental.extensionRequest?.requested && (
                            <div className="extension-info">
                              <p><strong>Extension:</strong> {formatDate(rental.extensionRequest.startDate)} to {formatDate(rental.extensionRequest.endDate)}</p>
                              <p><strong>Extension Amount:</strong> {formatCurrency(rental.extensionRequest.amount)}</p>
                            </div>
                          )}
                          {rental.payment?.receiptImage && (
                            <div className="receipt-section">
                              {viewingReceipt === rental._id ? (
                                <>
                                  <img src={rental.payment.receiptImage} alt="Receipt" className="receipt-image" />
                                  <button className="close-btn" onClick={() => setViewingReceipt(null)}>Close</button>
                                </>
                              ) : (
                                <button className="see-receipt-btn" onClick={() => setViewingReceipt(rental._id)}>
                                  View Receipt
                                </button>
                              )}
                            </div>
                          )}
                          <p><strong>Action Date:</strong> {formatDate(rental.actionDate)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Motion.div>

      {/* Theme toggle button */}
      <button 
        className="theme-toggle" 
        onClick={toggleTheme}
        aria-label={darkTheme ? "Switch to light theme" : "Switch to dark theme"}
      >
        {darkTheme ? <FaSun /> : <FaMoon />}
      </button>

      {/* Settings Modal */}
      {showSettings && (
        <div className="settings-modal-overlay">
          <div className="settings-modal">
            <h2>Account Settings</h2>
            <form onSubmit={handleSettingsSubmit}>
              <div className="profile-picture-section">
                <div className="profile-picture-preview">
                  <img 
                    src={userSettings.profilePicture || '/default-avatar.png'} 
                    alt="Profile" 
                  />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  id="profile-picture"
                  className="profile-picture-input"
                />
                <label htmlFor="profile-picture" className="upload-button">
                  Change Profile Picture
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  value={userSettings.name}
                  onChange={(e) => setUserSettings(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={user?.name || 'Enter your name'}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={userSettings.email}
                  onChange={(e) => setUserSettings(prev => ({ ...prev, email: e.target.value }))}
                  placeholder={user?.email || 'Enter your email'}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  value={userSettings.phone}
                  onChange={(e) => setUserSettings(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                />
              </div>

              {settingsError && (
                <div className="error-message">{settingsError}</div>
              )}

              <div className="settings-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowSettings(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="save-button"
                  disabled={settingsLoading}
                >
                  {settingsLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Outfit Details Modal */}
      {selectedOutfit && (
        <OutfitModal
          outfit={selectedOutfit}
          activeComponent="details"
          setActiveComponent={() => {}}
          onClose={() => setSelectedOutfit(null)}
        />
      )}
    </div>
  );
}
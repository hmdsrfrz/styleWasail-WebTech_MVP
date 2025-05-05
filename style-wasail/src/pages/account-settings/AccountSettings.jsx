import { motion as Motion } from 'framer-motion';
import { useState } from 'react';
import VantaBackground from '../../components/miscellaneous/VantaBackground';
import Navbar from '../../components/miscellaneous/Navbar';
import './AccountSettings.css';

export default function AccountSettings() {
  // Sample data - in a real app, this would come from your backend/context
  const [rentedItems, setRentedItems] = useState([
    {
      id: 1,
      title: 'Designer Dress',
      description: 'Elegant evening dress with sequin details',
      status: 'Active',
      startDate: '05/01/2023',
      endDate: '05/08/2023',
      price: '$15/day',
      owner: 'FashionLover123',
      extensionRequest: null
    },
    {
      id: 2,
      title: 'Vintage Jacket',
      description: 'Leather jacket from the 80s',
      status: 'Pending Approval',
      startDate: '05/10/2023',
      endDate: '05/17/2023',
      price: '$10/day',
      owner: 'VintageCollector'
    }
  ]);

  const [rentingItems, setRentingItems] = useState([
    {
      id: 3,
      title: 'Silk Scarf',
      description: 'Hand-painted silk scarf',
      status: 'Available',
      requests: [
        {
          id: 1,
          renter: 'StyleExplorer',
          startDate: '05/05/2023',
          endDate: '05/12/2023',
          status: 'Pending'
        }
      ]
    },
    {
      id: 4,
      title: 'Designer Handbag',
      description: 'Limited edition luxury handbag',
      status: 'Rented',
      currentRental: {
        renter: 'Fashionista22',
        startDate: '04/20/2023',
        endDate: '04/27/2023'
      }
    }
  ]);

  const handleApproveRequest = (itemId, requestId) => {
    // In a real app, this would call your backend
    setRentingItems(rentingItems.map(item => {
      if (item.id === itemId) {
        const updatedRequests = item.requests?.map(req => {
          if (req.id === requestId) {
            return { ...req, status: 'Approved' };
          }
          return req;
        });
        return {
          ...item,
          status: 'Rented',
          requests: updatedRequests,
          currentRental: item.requests?.find(req => req.id === requestId)
        };
      }
      return item;
    }));
  };

  const handleDeclineRequest = (itemId, requestId) => {
    // In a real app, this would call your backend
    setRentingItems(rentingItems.map(item => {
      if (item.id === itemId) {
        const updatedRequests = item.requests?.filter(req => req.id !== requestId);
        return {
          ...item,
          requests: updatedRequests,
          status: updatedRequests?.length ? 'Available' : item.status
        };
      }
      return item;
    }));
  };

  const handleExtensionResponse = (itemId, approve) => {
    // In a real app, this would call your backend
    setRentedItems(rentedItems.map(item => {
      if (item.id === itemId) {
        if (approve) {
          return {
            ...item,
            endDate: item.extensionRequest.endDate,
            status: 'Active',
            extensionRequest: null
          };
        } else {
          return {
            ...item,
            extensionRequest: null
          };
        }
      }
      return item;
    }));
  };

  return (
    <div className="account-settings-container">
      <VantaBackground />
      <Navbar />

      <Motion.div
        className="account-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Motion.h1 className="account-title">
          Account Settings
        </Motion.h1>
        
        <div className="account-grid">
          {/* Items You're Renting */}
          <div className="account-section">
            <h2>Items You're Renting</h2>
            <div className="items-list">
              {rentedItems.map(item => (
                <div key={item.id} className={`item-card ${item.status.toLowerCase().replace(' ', '-')}`}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <div className="item-details">
                    <p><strong>Status:</strong> <span className="status-badge">{item.status}</span></p>
                    <p><strong>Owner:</strong> {item.owner}</p>
                    <p><strong>Period:</strong> {item.startDate} to {item.endDate}</p>
                    <p><strong>Price:</strong> {item.price}</p>
                  </div>
                  
                  {item.extensionRequest && (
                    <div className="extension-request">
                      <p><strong>Extension Request:</strong> {item.extensionRequest.startDate} to {item.extensionRequest.endDate}</p>
                      <div className="extension-actions">
                        <button 
                          className="approve-btn"
                          onClick={() => handleExtensionResponse(item.id, true)}
                        >
                          Approve
                        </button>
                        <button 
                          className="decline-btn"
                          onClick={() => handleExtensionResponse(item.id, false)}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Items You're Lending */}
          <div className="account-section">
            <h2>Items You're Lending</h2>
            <div className="items-list">
              {rentingItems.map(item => (
                <div key={item.id} className={`item-card ${item.status.toLowerCase()}`}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <div className="item-details">
                    <p><strong>Status:</strong> <span className="status-badge">{item.status}</span></p>
                    
                    {item.currentRental && (
                      <>
                        <p><strong>Rented by:</strong> {item.currentRental.renter}</p>
                        <p><strong>Period:</strong> {item.currentRental.startDate} to {item.currentRental.endDate}</p>
                      </>
                    )}

                    {item.requests?.length > 0 && (
                      <div className="rental-requests">
                        <h4>Pending Requests:</h4>
                        {item.requests.map(request => (
                          <div key={request.id} className="request-item">
                            <p><strong>From:</strong> {request.renter}</p>
                            <p><strong>Dates:</strong> {request.startDate} to {request.endDate}</p>
                            <div className="request-actions">
                              <button 
                                className="approve-btn"
                                onClick={() => handleApproveRequest(item.id, request.id)}
                              >
                                Approve
                              </button>
                              <button 
                                className="decline-btn"
                                onClick={() => handleDeclineRequest(item.id, request.id)}
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Motion.div>
    </div>
  );
}
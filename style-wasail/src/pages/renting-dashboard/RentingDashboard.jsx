import { motion as Motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import VantaBackground from '../../components/miscellaneous/VantaBackground';
import Navbar from '../../components/miscellaneous/Navbar';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './RentingDashboard.css';

export default function RentingDashboard() {
  const location = useLocation();
  const [rentals, setRentals] = useState([
    { 
      id: 1, 
      item: 'Designer Dress', 
      description: 'Elegant evening dress with sequin details',
      components: [
        { type: 'Dress', description: 'Black sequin evening dress' }
      ],
      status: 'Active', 
      price: '$15/day',
      startDate: '05/01/2023',
      endDate: '05/08/2023',
      originalEndDate: '05/08/2023'
    },
    { 
      id: 2, 
      item: 'Vintage Jacket', 
      description: 'Leather jacket from the 80s',
      components: [
        { type: 'Jacket', description: 'Brown leather jacket' }
      ],
      status: 'Pending', 
      price: '$10/day',
      startDate: '05/03/2023',
      endDate: '05/10/2023',
      originalEndDate: '05/10/2023'
    },
    { 
      id: 3, 
      item: 'Silk Scarf', 
      description: 'Hand-painted silk scarf',
      components: [
        { type: 'Scarf', description: 'Blue and gold patterned scarf' }
      ],
      status: 'Completed', 
      price: '$5/day',
      startDate: '04/20/2023',
      endDate: '04/27/2023',
      originalEndDate: '04/27/2023'
    }
  ]);

  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [extensionStartDate, setExtensionStartDate] = useState(null);
  const [extensionEndDate, setExtensionEndDate] = useState(null);

  useEffect(() => {
    if (location.state?.newRental) {
      setRentals([location.state.newRental, ...rentals]);
    }
  }, [location.state]);

  const handleExtendClick = (rental) => {
    setSelectedRental(rental);
    // Set default extension dates (current end date + 1 day to +7 days)
    const currentEndDate = new Date(rental.endDate);
    const defaultStartDate = new Date(currentEndDate);
    defaultStartDate.setDate(currentEndDate.getDate() + 1);
    const defaultEndDate = new Date(defaultStartDate);
    defaultEndDate.setDate(defaultStartDate.getDate() + 7);
    
    setExtensionStartDate(defaultStartDate);
    setExtensionEndDate(defaultEndDate);
    setShowExtensionModal(true);
  };

  const handleExtensionSubmit = () => {
    if (!selectedRental || !extensionStartDate || !extensionEndDate) return;

    const updatedRentals = rentals.map(rental => {
      if (rental.id === selectedRental.id) {
        return {
          ...rental,
          status: 'Pending Extension',
          extensionRequest: {
            startDate: extensionStartDate.toLocaleDateString('en-US'),
            endDate: extensionEndDate.toLocaleDateString('en-US'),
            price: rental.price // In real app, calculate price difference
          }
        };
      }
      return rental;
    });

    setRentals(updatedRentals);
    setShowExtensionModal(false);
    // In real app, you would send this request to the renter/backend
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="renting-dashboard-container">
      <Navbar />
      <VantaBackground />
      
      <Motion.div
        className="dashboard-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Motion.h1 className="dashboard-title">
          Renting Dashboard
        </Motion.h1>
        
        <div className="rentals-table-container">
          <table className="rentals-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Description</th>
                <th>Status</th>
                <th>Rental Period</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map((rental) => (
                <Motion.tr 
                  key={rental.id}
                  className="rental-row"
                  whileHover={{ backgroundColor: 'rgba(94, 9, 65, 0.1)' }}
                >
                  <td>{rental.item}</td>
                  <td>
                    {rental.description}
                    {rental.components && (
                      <div className="components-list">
                        {rental.components.map((comp, i) => (
                          <div key={i}>
                            <strong>{comp.type}:</strong> {comp.description}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${rental.status.toLowerCase().replace(' ', '-')}`}>
                      {rental.status}
                    </span>
                  </td>
                  <td>
                    {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                    {rental.extensionRequest && (
                      <div className="extension-request">
                        <small>Extension requested: {formatDate(rental.extensionRequest.startDate)} to {formatDate(rental.extensionRequest.endDate)}</small>
                      </div>
                    )}
                  </td>
                  <td>{rental.price}</td>
                  <td>
                    {!['Completed', 'Pending', 'Pending Extension'].includes(rental.status) && (
                      <button 
                        className="extend-button"
                        onClick={() => handleExtendClick(rental)}
                      >
                        Extend
                      </button>
                    )}
                  </td>
                </Motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Motion.div>

      {/* Extension Modal */}
      {showExtensionModal && selectedRental && (
        <div className="modal-overlay">
          <Motion.div 
            className="modal-content"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <h2>Extend Rental Period</h2>
            <p>Request to extend rental for: <strong>{selectedRental.item}</strong></p>
            
            <div className="date-picker-group">
              <label>Extension Start Date:</label>
              <DatePicker
                selected={extensionStartDate}
                onChange={(date) => setExtensionStartDate(date)}
                minDate={new Date(selectedRental.endDate)}
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
                disabled={!extensionStartDate || !extensionEndDate}
              >
                Request Extension
              </button>
            </div>
          </Motion.div>
        </div>
      )}
    </div>
  );
}
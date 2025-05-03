import { motion as Motion } from 'framer-motion';
import VantaBackground from '../components/VantaBackground';
import Navbar from '../components/Navbar';

export default function RentingDashboard() {
  const rentals = [
    { id: 1, item: 'Designer Dress', status: 'Active', price: '$15/day' },
    { id: 2, item: 'Vintage Jacket', status: 'Pending', price: '$10/day' },
    { id: 3, item: 'Silk Scarf', status: 'Completed', price: '$5/day' }
  ];

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Navbar />
      <VantaBackground />
      
      
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          padding: '2rem',
          marginLeft: '300px'
        }}
      >
        <Motion.h1
          style={{
            fontFamily: "'Cal Sans', sans-serif",
            fontSize: '3rem',
            fontWeight: 700,
            color: 'rgb(94, 9, 65)',
            marginBottom: '2rem'
          }}
        >
          Renting Dashboard
        </Motion.h1>
        
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(8px)',
          borderRadius: '20px',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(94, 9, 65, 0.3)' }}>
                <th style={{ textAlign: 'left', padding: '1rem', color: 'rgb(94, 9, 65)' }}>Item</th>
                <th style={{ textAlign: 'left', padding: '1rem', color: 'rgb(94, 9, 65)' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '1rem', color: 'rgb(94, 9, 65)' }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map((rental) => (
                <Motion.tr 
                  key={rental.id}
                  whileHover={{ backgroundColor: 'rgba(94, 9, 65, 0.1)' }}
                  style={{ borderBottom: '1px solid rgba(94, 9, 65, 0.1)' }}
                >
                  <td style={{ padding: '1rem', color: 'rgb(94, 9, 65)' }}>{rental.item}</td>
                  <td style={{ padding: '1rem', color: 'rgb(94, 9, 65)' }}>{rental.status}</td>
                  <td style={{ padding: '1rem', color: 'rgb(94, 9, 65)' }}>{rental.price}</td>
                </Motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Motion.div>
    </div>
  );
}
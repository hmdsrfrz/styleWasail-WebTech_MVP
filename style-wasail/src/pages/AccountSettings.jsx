import { motion as Motion } from 'framer-motion';
import VantaBackground from '../components/VantaBackground';
import Navbar from '../components/Navbar';

export default function AccountSettings() {
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <VantaBackground />
      <Navbar />

      
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
          Account Settings
        </Motion.h1>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem'
        }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(8px)',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <h2 style={{ color: 'rgb(94, 9, 65)', marginBottom: '1.5rem' }}>Profile</h2>
            {/* Profile form would go here */}
          </div>
          
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(8px)',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}>
            <h2 style={{ color: 'rgb(94, 9, 65)', marginBottom: '1.5rem' }}>Preferences</h2>
            {/* Preferences would go here */}
          </div>
        </div>
      </Motion.div>
    </div>
  );
}
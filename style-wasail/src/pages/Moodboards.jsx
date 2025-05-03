import { motion as Motion } from 'framer-motion';
import VantaBackground from '../components/VantaBackground';
import Navbar from '../components/Navbar';

export default function Moodboards() {
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
          Your Moodboards
        </Motion.h1>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {[1, 2, 3].map((item) => (
            <Motion.div
              key={item}
              whileHover={{ y: -5 }}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                borderRadius: '20px',
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                cursor: 'pointer'
              }}
            >
              <h3 style={{ color: 'rgb(94, 9, 65)', marginBottom: '1rem' }}>Moodboard {item}</h3>
              <p style={{ color: 'rgba(94, 9, 65, 0.8)' }}>Collection of saved outfits</p>
            </Motion.div>
          ))}
        </div>
      </Motion.div>
    </div>
  );
}
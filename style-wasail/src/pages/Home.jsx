
// src/pages/Home.jsx
import { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import VantaBackground from "../components/VantaBackground";
import HeroText from "../components/HeroText";
import AuthButton from "../components/AuthButton";
import AuthForm from "../components/AuthForm";

export default function Home() {
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  const handleAuthClick = () => {
    setShowAuth(true);
  };

  const handleBackClick = () => {
    setShowAuth(false);
  };

  // Temporary function to simulate successful login
  const handleTempLogin = () => {
    navigate('/user-home');
  };

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden'
    }}>
      <VantaBackground />
      
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <AnimatePresence mode='wait'>
          {!showAuth ? (
            <Motion.div
              key="hero-content"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2rem'
              }}
            >
              <HeroText />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <AuthButton onClick={handleAuthClick} />
                {/* Temporary dev button - remove in production */}
                <Motion.button
                  onClick={handleTempLogin}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: "12px 24px",
                    borderRadius: "12px",
                    border: "2px solid #000",
                    backgroundColor: "rgba(94, 9, 65, 0.8)",
                    color: "white",
                    fontWeight: "600",
                    fontSize: "16px",
                    cursor: "pointer",
                    boxShadow: "4px 4px 0px 0px rgba(0,0,0,0.2)",
                  }}
                >
                  Dev: Go to Dashboard
                </Motion.button>
              </div>
            </Motion.div>
          ) : (
            <AuthForm onBack={handleBackClick} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
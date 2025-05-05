import { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import VantaBackground from "../../components/miscellaneous/VantaBackground";
import HeroText from "../../components/miscellaneous/HeroText";
import AuthButton from "../../components/authform/AuthButton";
import AuthForm from "../../components/authform/AuthForm";
import './Home.css';

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
    <div className="home-container">
      <VantaBackground />
      
      <div className="content-wrapper">
        <AnimatePresence mode='wait'>
          {!showAuth ? (
            <Motion.div
              key="hero-content"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="hero-content"
            >
              <HeroText />
              <div className="auth-buttons">
                <AuthButton onClick={handleAuthClick} />
                {/* Temporary dev button - remove in production */}
                <Motion.button
                  onClick={handleTempLogin}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="dev-button"
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
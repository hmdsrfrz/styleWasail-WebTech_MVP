import { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import VantaBackground from "../../components/miscellaneous/VantaBackground";
import HeroText from "../../components/miscellaneous/HeroText";
import Navbar from "../../components/miscellaneous/Navbar";
import AuthButton from "../../components/authform/AuthButton";
import AuthForm from "../../components/authform/AuthForm";
import './Home.css';

export default function Home() {
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleAuthClick = () => {
    setShowAuth(true);
  };

  const handleBackClick = () => {
    setShowAuth(false);
  };

  const handleTempLogin = async () => {
    try {
      const result = await login({
        email: 'dev@example.com',
        password: 'devpassword'
      });
      if (result.success) {
        navigate('/user-home');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
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
                <button className="dev-button" onClick={handleTempLogin}>
                  Dev: Go to Dashboard
                </button>
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
import { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import VantaBackground from "../../components/miscellaneous/VantaBackground";
import AuthButton from "../../components/authform/AuthButton";
import AuthForm from "../../components/authform/AuthForm";
import './Home.css';

export default function Home() {
  const [showAuth, setShowAuth] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeSection, setActiveSection] = useState("features");
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Add a small delay to make sure animations start after component mounts
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    // Track mouse position for 3D effect
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * -20
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

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

  // Staggered animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 30,
        staggerChildren: 0.1,
        staggerDirection: -1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 24,
      }
    },
    exit: { 
      y: -20, 
      opacity: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 24 
      }
    }
  };

  // Special hover variants
  const buttonHoverVariants = {
    hover: { 
      scale: 1.05,
      y: -5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { 
      scale: 0.98,
      y: 2
    }
  };

  const iconHoverVariants = {
    hover: { 
      scale: 1.2,
      rotate: 5,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 10
      }
    }
  };

  // Key Feature Data
  const features = [
    {
      icon: "👗",
      title: "Outfit Sharing",
      description: "Create and share complete outfit collections with detailed components"
    },
    {
      icon: "💸",
      title: "Affordable Rentals",
      description: "Rent at just 5% of retail price - try luxury without the commitment"
    },
    {
      icon: "🔄",
      title: "Dual Roles",
      description: "Seamlessly switch between renter and lender with one click"
    }
  ];

  // Pages & Features Data
  const appScreens = [
    {
      icon: "🏠",
      title: "User Dashboard",
      description: "Browse trending outfits and collections tailored to your preferences",
      highlight: "Personalized feed with smart recommendations"
    },
    {
      icon: "🖼️",
      title: "Moodboards",
      description: "Create visual collections to plan your perfect style combinations",
      highlight: "Share and collaborate on fashion ideas"
    },
    {
      icon: "📅",
      title: "Rental Management",
      description: "Track all your rentals, bookings and earnings in one place",
      highlight: "Smart calendar and notification system"
    },
    {
      icon: "👤",
      title: "Profile & Settings",
      description: "Manage your preferences, payments and reputation score",
      highlight: "Secure verification system"
    }
  ];

  // Benefits & Advantages
  const benefits = [
    {
      icon: "💰",
      title: "Extra Income",
      description: "Earn money from your existing wardrobe"
    },
    {
      icon: "♻️",
      title: "Sustainability",
      description: "Reduce fashion waste through sharing economy"
    },
    {
      icon: "✨",
      title: "Variety",
      description: "Refresh your style without permanent purchases"
    },
    {
      icon: "📱",
      title: "Convenience",
      description: "Everything managed through a smooth mobile interface"
    },
    {
      icon: "👑",
      title: "Premium Style",
      description: "Access high-end fashion at a fraction of the cost"
    },
    {
      icon: "🔒",
      title: "Security",
      description: "Protected transactions and verified users"
    }
  ];

  return (
    <div className="home-container">
      <VantaBackground intensity={0.6} speed={1.2} />
      
      <div className="content-wrapper">
        <AnimatePresence mode='wait'>
          {!showAuth ? (
            <Motion.div
              key="hero-content"
              variants={containerVariants}
              initial="hidden"
              animate={isLoaded ? "visible" : "hidden"}
              exit="exit"
              className="hero-content"
              style={{
                transform: isLoaded ? `perspective(1000px) rotateX(${mousePosition.y * 0.05}deg) rotateY(${mousePosition.x * 0.05}deg)` : "perspective(1000px)",
                transition: "transform 0.5s ease-out"
              }}
            >
              {/* Brand Header */}
              <div className="brand-header">
                <Motion.div 
                  variants={itemVariants}
                  className="logo-container"
                  whileHover={{ scale: 1.1, rotate: 15, z: 50 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="sw-logo" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    {/* Background circle */}
                    <circle cx="16" cy="16" r="16" fill="#5E0941"/>
                    
                    {/* Stylized "S" */}
                    <path d="M22 10C22 10 20 8 16 8C12 8 10 10 10 12C10 14 12 15 14 16C16 17 18 18 18 20C18 22 16 24 12 24" 
                          stroke="white" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"/>
                    
                    {/* Small dot */}
                    <circle cx="12" cy="24" r="1" fill="white"/>
                  </svg>
                </Motion.div>
                
                <Motion.div 
                  className="title-container"
                  variants={itemVariants}
                >
                  <Motion.h1 
                    className="main-title"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
                  >
                    <span className="highlight">STYLE</span> WASAYL
                  </Motion.h1>
                  <Motion.div 
                    className="tagline"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                  >
                    Fashion Forward. Community Driven.
                  </Motion.div>
                </Motion.div>
              </div>

              {/* Hero Description */}
              <Motion.div 
                className="hero-description"
                variants={itemVariants}
                whileHover={{ scale: 1.03, z: 40 }}
              >
                <p>The ultimate platform for sharing and renting fashion. <strong>Style Wasayl</strong> connects fashion enthusiasts, empowering them to monetize their closets while providing affordable access to premium style.</p>
              </Motion.div>
              
              {/* CTA Buttons */}
              <Motion.div 
                className="auth-buttons"
                variants={itemVariants}
              >
                <Motion.button 
                  className="primary-button"
                  onClick={handleAuthClick}
                  variants={buttonHoverVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Get Started Now
                </Motion.button>
                <Motion.button 
                  className="dev-button" 
                  onClick={handleTempLogin}
                  variants={buttonHoverVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Dev: Go to Dashboard
                </Motion.button>
              </Motion.div>
              
              {/* Section Navigation */}
              <Motion.div 
                className="section-nav"
                variants={itemVariants}
              >
                <Motion.button 
                  className={`nav-button ${activeSection === "features" ? "active" : ""}`}
                  onClick={() => setActiveSection("features")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Key Features
                </Motion.button>
                <Motion.button 
                  className={`nav-button ${activeSection === "pages" ? "active" : ""}`}
                  onClick={() => setActiveSection("pages")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  App Pages
                </Motion.button>
                <Motion.button 
                  className={`nav-button ${activeSection === "benefits" ? "active" : ""}`}
                  onClick={() => setActiveSection("benefits")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Benefits
                </Motion.button>
              </Motion.div>
              
              {/* Feature Cards */}
              <AnimatePresence mode="wait">
                {activeSection === "features" && (
                  <Motion.div 
                    className="features-grid"
                    variants={itemVariants}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    key="features"
                  >
                    {features.map((feature, index) => (
                      <Motion.div 
                        key={index}
                        className="feature-card"
                        whileHover={{ z: 50, scale: 1.05 }}
                        style={{ 
                          transformStyle: "preserve-3d", 
                          transformOrigin: "center center"
                        }}
                      >
                        <Motion.span 
                          className="feature-icon"
                          variants={iconHoverVariants}
                          whileHover="hover"
                        >
                          {feature.icon}
                        </Motion.span>
                        <Motion.h3>{feature.title}</Motion.h3>
                        <Motion.p>{feature.description}</Motion.p>
                      </Motion.div>
                    ))}
                  </Motion.div>
                )}
                
                {activeSection === "pages" && (
                  <Motion.div 
                    className="app-screens-grid"
                    variants={itemVariants}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    key="pages"
                  >
                    {appScreens.map((screen, index) => (
                      <Motion.div 
                        key={index}
                        className="screen-card"
                        whileHover={{ z: 50, scale: 1.05 }}
                        style={{ 
                          transformStyle: "preserve-3d", 
                          transformOrigin: "center center"
                        }}
                      >
                        <Motion.span 
                          className="screen-icon"
                          variants={iconHoverVariants}
                          whileHover="hover"
                        >
                          {screen.icon}
                        </Motion.span>
                        <div className="screen-content">
                          <Motion.h3>{screen.title}</Motion.h3>
                          <Motion.p>{screen.description}</Motion.p>
                          <Motion.span className="highlight-feature">
                            ✓ {screen.highlight}
                          </Motion.span>
                        </div>
                      </Motion.div>
                    ))}
                  </Motion.div>
                )}
                
                {activeSection === "benefits" && (
                  <Motion.div 
                    className="benefits-grid"
                    variants={itemVariants}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    key="benefits"
                  >
                    {benefits.map((benefit, index) => (
                      <Motion.div 
                        key={index}
                        className="benefit-card"
                        whileHover={{ z: 30, scale: 1.05 }}
                        style={{ 
                          transformStyle: "preserve-3d", 
                          transformOrigin: "center center"
                        }}
                      >
                        <Motion.span 
                          className="benefit-icon"
                          variants={iconHoverVariants}
                          whileHover="hover"
                        >
                          {benefit.icon}
                        </Motion.span>
                        <Motion.h3>{benefit.title}</Motion.h3>
                        <Motion.p>{benefit.description}</Motion.p>
                      </Motion.div>
                    ))}
                  </Motion.div>
                )}
              </AnimatePresence>
              
              {/* Footer with Get Started CTA */}
              <Motion.div 
                className="hero-footer"
                variants={itemVariants}
              >
                <div className="stats-row">
                  <div className="stat">
                    <span className="stat-number">200+</span>
                    <span className="stat-label">Active Users</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">500+</span>
                    <span className="stat-label">Outfit Listings</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">95%</span>
                    <span className="stat-label">Satisfaction Rate</span>
                  </div>
              </div>
                <Motion.button 
                  className="cta-button"
                  onClick={handleAuthClick}
                  variants={buttonHoverVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Join Style Wasayl Today
                </Motion.button>
              </Motion.div>
            </Motion.div>
          ) : (
            <AuthForm onBack={handleBackClick} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
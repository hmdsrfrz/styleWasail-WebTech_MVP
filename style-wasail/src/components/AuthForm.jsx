// src/components/AuthForm.jsx
import { useState } from "react";
import { motion as Motion } from "framer-motion";

// Add this CSS directly in your component
const styles = {
    container: {
      width: '100%',
      maxWidth: '1200px',
      height: '900px',
      margin: '0 auto',
      position: 'relative',
      borderRadius: '20px',
      overflow: 'hidden',
    },
    glassBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '20px',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
    },
    content: {
      position: 'relative',
      zIndex: 1,
      padding: '40px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Cal Sans', sans-serif",
    },
    backButton: {
      position: 'absolute',
      top: '20px',
      left: '20px',
      background: 'rgba(255, 255, 255, 0.3)',
      border: 'none',
      borderRadius: '50%',
      padding: '10px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '40px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease',
    },
    heading: {
      textAlign: 'center',
      fontSize: '72px',
      fontWeight: '700',
      marginTop: '60px',
      marginBottom: '0px',
      color: 'rgb(94, 9, 65)',
      letterSpacing: '-0.03em',
    },
    subheading: {
      textAlign: 'center',
      fontSize: '18px',
      color: 'rgb(94, 9, 65)',
      marginBottom: '40px',
      fontWeight: '400',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '25px',
      maxWidth: '400px',
      width: '100%',
      margin: '0 auto',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    label: {
      fontFamily: "Merryweather",
      fontSize: '16px',
      fontWeight: '600',
      color: 'rgb(94, 9, 65)',
    },
    input: {
      padding: '15px 20px',
      borderRadius: '12px',
      border: '2px solid rgba(0, 0, 0, 0.1)',
      fontSize: '16px',
      backgroundColor: 'transparent',
      color: '#000',
      outline: 'none',
      transition: 'all 0.2s ease',
    },
    forgotPassword: {
      fontSize: '14px',
      textAlign: 'right',
      color: 'rgb(196, 3, 99)',
      textDecoration: 'none',
      fontWeight: '500',
    },
    button: {
      backgroundColor: '#000',
      color: '#fff',
      border: 'none',
      borderRadius: '12px',
      padding: '16px',
      fontSize: '18px',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '15px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease',
    },
    linkText: {
      textAlign: 'center',
      fontSize: '16px',
      color: '#333',
      marginTop: '25px',
    },
    link: {
      color: '#3b82f6',
      cursor: 'pointer',
      marginLeft: '5px',
      fontWeight: '600',
    },
    errorMessage: {
      backgroundColor: 'rgba(254, 226, 226, 0.7)',
      color: '#b91c1c',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '14px',
      textAlign: 'center',
      marginBottom: '15px',
      fontWeight: '500',
    },
    successMessage: {
      backgroundColor: 'rgba(220, 252, 231, 0.7)',
      color: '#166534',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '14px',
      textAlign: 'center',
      marginBottom: '15px',
      fontWeight: '500',
    }
  };

export default function AuthForm({ onBack }) {
  const [isLogin, setIsLogin] = useState(true);
  const [users, setUsers] = useState([]);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    confirmPassword: "" 
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    
    const foundUser = users.find(user => 
      user.email === loginData.email && user.password === loginData.password
    );
    
    if (foundUser) {
      setSuccessMsg("Login successful!");
      // Reset form
      setLoginData({ email: "", password: "" });
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        window.location.href = '/user-home'; // This will redirect to the user home page
      }, 1000);
    } else {
      setErrorMsg("Invalid email or password");
    }
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    
    // Validation
    if (signupData.password !== signupData.confirmPassword) {
      setErrorMsg("Passwords don't match");
      return;
    }
    
    if (signupData.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      return;
    }
    
    // Check if email already exists
    if (users.some(user => user.email === signupData.email)) {
      setErrorMsg("Email already registered");
      return;
    }
    
    // Add new user
    const newUser = {
      id: Date.now(),
      name: signupData.name,
      email: signupData.email,
      password: signupData.password
    };
    
    setUsers([...users, newUser]);
    setSuccessMsg("Account created successfully!");
    
    // Reset form
    setSignupData({ name: "", email: "", password: "", confirmPassword: "" });
    
    // Switch to login view after successful signup
    setTimeout(() => {
      setIsLogin(true);
      setSuccessMsg("");
    }, 2000);
  };

  return (
    <Motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={styles.container}
    >
      <div style={styles.glassBackground}></div>
      
      <div style={styles.content}>
        <Motion.button
          onClick={onBack}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          style={styles.backButton}
        >
          ←
        </Motion.button>

        <Motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={styles.heading}
        >
          {isLogin ? "Welcome Back" : "Create Account"}
        </Motion.h2>
        
        <Motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={styles.subheading}
        >
          {isLogin 
            ? "Sign in to access your account" 
            : "Sign up to get started with our services"
          }
        </Motion.p>

        {/* Success/Error messages */}
        {successMsg && (
          <Motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.successMessage}
          >
            {successMsg}
          </Motion.div>
        )}
        
        {errorMsg && (
          <Motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.errorMessage}
          >
            {errorMsg}
          </Motion.div>
        )}

        {/* Login Form */}
        {isLogin && (
          <Motion.form 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            onSubmit={handleLoginSubmit}
            style={styles.form}
          >
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                required
                style={styles.input}
                placeholder="Your email"
              />
            </div>
            
            <div style={styles.formGroup}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <label style={styles.label}>Password</label>
                <a href="#" style={styles.forgotPassword}>Forgot password?</a>
              </div>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                required
                style={styles.input}
                placeholder="Your password"
              />
            </div>
            
            <button
              type="submit"
              style={styles.button}
            >
              Sign In
            </button>
          </Motion.form>
        )}

        {/* Signup Form */}
        {!isLogin && (
          <Motion.form
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
            onSubmit={handleSignupSubmit}
            style={styles.form}
          >
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                value={signupData.name}
                onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                required
                style={styles.input}
                placeholder="Your name"
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={signupData.email}
                onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                required
                style={styles.input}
                placeholder="Your email"
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={signupData.password}
                onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                required
                style={styles.input}
                placeholder="Create a password"
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                value={signupData.confirmPassword}
                onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                required
                style={styles.input}
                placeholder="Confirm your password"
              />
            </div>
            
            <button
              type="submit"
              style={styles.button}
            >
              Create Account
            </button>
          </Motion.form>
        )}

        {/* Toggle between login and signup */}
        <div style={styles.linkText}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMsg("");
              setSuccessMsg("");
            }}
            style={{...styles.link, background: 'none', border: 'none', padding: 0}}
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </div>

        {/* Social login options */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <div style={styles.divider}>
            <div style={styles.dividerLine}></div>
            <span style={styles.dividerText}>Or continue with</span>
            <div style={styles.dividerLine}></div>
          </div>
          
          <div style={styles.socialButtons}>
            <button style={styles.socialButton}>
              <span style={{color: '#4285F4', fontSize: '18px', fontWeight: 'bold'}}>G</span>
            </button>
            
            <button style={styles.socialButton}>
              <span style={{color: '#1877F2', fontSize: '18px', fontWeight: 'bold'}}>f</span>
            </button>
            
            <button style={styles.socialButton}>
              <span style={{color: '#000', fontSize: '18px', fontWeight: 'bold'}}>X</span>
            </button>
          </div>
        </Motion.div>
      </div>
    </Motion.div>
  );
}
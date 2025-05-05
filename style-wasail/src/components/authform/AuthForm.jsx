import { useState } from "react";
import { motion as Motion } from "framer-motion";
import "./AuthForm.css";

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
      setLoginData({ email: "", password: "" });
      setTimeout(() => {
        window.location.href = '/user-home';
      }, 1000);
    } else {
      setErrorMsg("Invalid email or password");
    }
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    
    if (signupData.password !== signupData.confirmPassword) {
      setErrorMsg("Passwords don't match");
      return;
    }
    
    if (signupData.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      return;
    }
    
    if (users.some(user => user.email === signupData.email)) {
      setErrorMsg("Email already registered");
      return;
    }
    
    const newUser = {
      id: Date.now(),
      name: signupData.name,
      email: signupData.email,
      password: signupData.password
    };
    
    setUsers([...users, newUser]);
    setSuccessMsg("Account created successfully!");
    setSignupData({ name: "", email: "", password: "", confirmPassword: "" });
    
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
      className="auth-container"
    >
      <div className="glass-background"></div>
      
      <div className="auth-content">
        <Motion.button
          onClick={onBack}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="back-button"
        >
          ←
        </Motion.button>

        <Motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="auth-heading"
        >
          {isLogin ? "Welcome Back" : "Create Account"}
        </Motion.h2>
        
        <Motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="auth-subheading"
        >
          {isLogin 
            ? "Sign in to access your account" 
            : "Sign up to get started with our services"
          }
        </Motion.p>

        {successMsg && (
          <Motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="success-message"
          >
            {successMsg}
          </Motion.div>
        )}
        
        {errorMsg && (
          <Motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="error-message"
          >
            {errorMsg}
          </Motion.div>
        )}

        {isLogin && (
          <Motion.form 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            onSubmit={handleLoginSubmit}
            className="auth-form"
          >
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                required
                className="form-input"
                placeholder="Your email"
              />
            </div>
            
            <div className="form-group">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <label className="form-label">Password</label>
                <a href="#" className="forgot-password">Forgot password?</a>
              </div>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                required
                className="form-input"
                placeholder="Your password"
              />
            </div>
            
            <button
              type="submit"
              className="submit-button"
            >
              Sign In
            </button>
          </Motion.form>
        )}

        {!isLogin && (
          <Motion.form
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
            onSubmit={handleSignupSubmit}
            className="auth-form"
          >
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                value={signupData.name}
                onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                required
                className="form-input"
                placeholder="Your name"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                value={signupData.email}
                onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                required
                className="form-input"
                placeholder="Your email"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                value={signupData.password}
                onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                required
                className="form-input"
                placeholder="Create a password"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                value={signupData.confirmPassword}
                onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                required
                className="form-input"
                placeholder="Confirm your password"
              />
            </div>
            
            <button
              type="submit"
              className="submit-button"
            >
              Create Account
            </button>
          </Motion.form>
        )}

        <div className="auth-link-text">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className="auth-link"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </div>

        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <div className="divider">
            <div className="divider-line"></div>
            <span className="divider-text">Or continue with</span>
            <div className="divider-line"></div>
          </div>
          
          <div className="social-buttons">
            <button className="social-button">
              <span style={{color: '#4285F4', fontSize: '18px', fontWeight: 'bold'}}>G</span>
            </button>
            
            <button className="social-button">
              <span style={{color: '#1877F2', fontSize: '18px', fontWeight: 'bold'}}>f</span>
            </button>
            
            <button className="social-button">
              <span style={{color: '#000', fontSize: '18px', fontWeight: 'bold'}}>X</span>
            </button>
          </div>
        </Motion.div>
      </div>
    </Motion.div>
  );
}
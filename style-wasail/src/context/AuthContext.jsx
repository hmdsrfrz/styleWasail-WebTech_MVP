import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Checking user with token:', token);
      if (token) {
        const { data } = await authAPI.getMe();
        console.log('User data received:', data);
        setUser(data.data);
      }
    } catch (err) {
      console.error('Error checking user:', err);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      console.log('Registering user:', userData);
      const { data } = await authAPI.register(userData);
      console.log('Registration response:', data);
      localStorage.setItem('token', data.token);
      await checkUser();
      return data;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      console.log('Logging in with:', credentials);
      const { data } = await authAPI.login(credentials);
      console.log('Login response:', data);
      localStorage.setItem('token', data.token);
      await checkUser();
      return data;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  const logout = () => {
    console.log('Logging out');
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUserDetails = async (userData) => {
    try {
      setError(null);
      console.log('Updating user details:', userData);
      const { data } = await authAPI.updateDetails(userData);
      console.log('Update response:', data);
      setUser(data.data);
      return data;
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'Update failed');
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateUserDetails
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 
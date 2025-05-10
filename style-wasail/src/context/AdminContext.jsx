import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const adminToken = localStorage.getItem('adminToken');
        if (adminToken) {
          const response = await api.authAPI.getMe();
          if (response.data.user.role === 'admin') {
            setIsAdmin(true);
            setAdminData(response.data.user);
          } else {
            localStorage.removeItem('adminToken');
            setIsAdmin(false);
            setAdminData(null);
          }
        }
      } catch (err) {
        setError(err.message);
        setIsAdmin(false);
        setAdminData(null);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  const adminLogin = async (credentials) => {
    try {
      setLoading(true);
      const response = await api.authAPI.login(credentials);
      if (response.data.user.role === 'admin') {
        localStorage.setItem('adminToken', response.data.token);
        setIsAdmin(true);
        setAdminData(response.data.user);
        navigate('/admin/dashboard');
        return { success: true };
      } else {
        throw new Error('Unauthorized: Not an admin account');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const adminLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
    setAdminData(null);
    navigate('/');
  };

  const getAllUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/users');
      setUsers(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const getAllTransactions = async () => {
    try {
      const response = await api.adminAPI.getAllTransactions();
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      setLoading(true);
      const { data } = await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(user => user._id === userId ? data.data : user));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    try {
      setLoading(true);
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(user => user._id !== userId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    isAdmin,
    adminData,
    loading,
    error,
    adminLogin,
    adminLogout,
    getAllUsers,
    getAllTransactions,
    updateUserRole,
    deleteUser
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}; 
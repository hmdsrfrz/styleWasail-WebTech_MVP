import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useAdmin } from './context/AdminContext';
import Home from './pages/main/Home.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import UserHome from './pages/user/UserHome.jsx';
import Moodboards from './pages/moodboard/Moodboards.jsx';
import MoodboardDetails from './pages/moodboard/MoodboardDetails.jsx';
import Renting from './pages/renting-dashboard/RentingDashboard.jsx';
import Account from './pages/account-settings/AccountSettings.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAdmin();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected User Routes */}
      <Route
        path="/user-home"
        element={
          <ProtectedRoute>
            <UserHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/moodboards"
        element={
          <ProtectedRoute>
            <Moodboards />
          </ProtectedRoute>
        }
      />
      <Route
        path="/moodboards/:moodboardId"
        element={
          <ProtectedRoute>
            <MoodboardDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/renting"
        element={
          <ProtectedRoute>
            <Renting />
          </ProtectedRoute>
        }
      />
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes; 
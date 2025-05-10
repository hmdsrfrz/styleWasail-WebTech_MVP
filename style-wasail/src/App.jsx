import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { MoodboardProvider } from './context/MoodboardContext';
import AppRoutes from './routes';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
          <MoodboardProvider>
            <AppRoutes />
          </MoodboardProvider>
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
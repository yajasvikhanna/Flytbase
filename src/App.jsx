import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { DroneMissionProvider } from './contexts/DroneMissionContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';
import FleetManagement from './pages/fleet/FleetManagement';
import Fleetlist from './pages/fleet/FleetList'
import MissionPlanning from './pages/missions/MissionPlanning'
import MissionDetail from './pages/missions/MissionDetail';
import ActiveMissions from './pages/missions/ActiveMissions';
import MissionHistory from './pages/missions/MissionHistory';
import Reports from './pages/reports/Reports';
import ReportDetail from './pages/reports/ReportDetail'
import Profile from './pages/user/Profile';
import NotFound from './pages/NotFound';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return (
    <DroneMissionProvider>
      {children}
    </DroneMissionProvider>
  );
};

// Public Route component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (currentUser) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <ToastContainer position="top-center" autoClose={3000} />
      <Route path="/" element={<PublicRoute><Navigate to="/login" /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><AuthLayout><Login /></AuthLayout></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><AuthLayout><Register /></AuthLayout></PublicRoute>} />
      
      {/* Protected Dashboard Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
      <Route path="/fleet" element={<ProtectedRoute><DashboardLayout><FleetManagement /></DashboardLayout></ProtectedRoute>} />
      <Route path="/missions/new" element={<ProtectedRoute><DashboardLayout><MissionPlanning /></DashboardLayout></ProtectedRoute>} />
      <Route path="/missions/active" element={<ProtectedRoute><DashboardLayout><ActiveMissions /></DashboardLayout></ProtectedRoute>} />
      <Route path="/missions/history" element={<ProtectedRoute><DashboardLayout><MissionHistory /></DashboardLayout></ProtectedRoute>} />
      <Route path="/missions/:id" element={<ProtectedRoute><DashboardLayout><MissionDetail /></DashboardLayout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><DashboardLayout><Reports /></DashboardLayout></ProtectedRoute>} />
      <Route path="/reports/:id" element={<ProtectedRoute><DashboardLayout><ReportDetail /></DashboardLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><DashboardLayout><Profile /></DashboardLayout></ProtectedRoute>} />
      
      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
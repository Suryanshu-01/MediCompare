import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
//Browser Router:Enables routing using browser URL
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import { ROUTES } from './utils/constants';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Placeholder pages (create later)
const UserDashboard = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900">User Dashboard</h1>
      <p className="text-gray-600 mt-2">Welcome! Explore hospitals and services.</p>
    </div>
  </div>
);

const HospitalDashboard = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900">Hospital Dashboard</h1>
      <p className="text-gray-600 mt-2">Manage your hospital profile and doctors.</p>
    </div>
  </div>
);

const AdminDashboard = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
      <p className="text-gray-600 mt-2">Verify hospitals and manage platform.</p>
    </div>
  </div>
);


//App Routes


function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.REGISTER} element={<Register />} />

      {/* Protected Routes - User Dashboard */}
      <Route
        path={ROUTES.USER_DASHBOARD}
        element={
          <ProtectedRoute>
            <RoleRoute requiredRole="USER">
              <UserDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - Hospital Dashboard */}
      <Route
        path={ROUTES.HOSPITAL_DASHBOARD}
        element={
          <ProtectedRoute>
            <RoleRoute requiredRole="HOSPITAL">
              <HospitalDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - Admin Dashboard */}
      <Route
        path={ROUTES.ADMIN_DASHBOARD}
        element={
          <ProtectedRoute>
            <RoleRoute requiredRole="ADMIN">
              <AdminDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  );
}

// MAIN APP COMPONENT


export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
//Browser Router:Enables routing using browser URL
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import { ROUTES } from './utils/constants';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AddDoctor from './pages/AddDoctor';
import DoctorList from './pages/DoctorList';
import EditDoctor from './pages/EditDoctor';
import HospitalDashboard from './pages/HospitalDashboard';
import UserDashboard from './pages/UserDashboard';
import HospitalUserDashboard from './pages/HospitalUserDashboard';
import HospitalList from './pages/HospitalList';
import ServicesList from './pages/hospital/Services/ServicesList';
import AddService from './pages/AddService';
import AdminDashboard from './pages/AdminDashboard';
import AdminRejectedHospitals from './pages/AdminRejectedHospitals';


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

      {/* Protected Routes - Add Doctor */}
      <Route
        path="/hospital/doctors/add"
        element={
          <ProtectedRoute>
            <RoleRoute requiredRole="HOSPITAL">
              <AddDoctor />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - Doctor List */}
      <Route
        path="/hospital/doctors"
        element={
          <ProtectedRoute>
            <RoleRoute requiredRole="HOSPITAL">
              <DoctorList />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - Edit Doctor */}
      <Route
        path="/hospital/doctors/:doctorId/edit"
        element={
          <ProtectedRoute>
            <RoleRoute requiredRole="HOSPITAL">
              <EditDoctor />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - Hospital Services */}
      <Route
        path="/hospital/services"
        element={
          <ProtectedRoute>
            <RoleRoute requiredRole="HOSPITAL">
              <ServicesList />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - Add Service */}
      <Route
        path="/hospital/services/add"
        element={
          <ProtectedRoute>
            <RoleRoute requiredRole="HOSPITAL">
              <AddService />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Public Routes - Hospital Details for Users */}
      <Route
        path="/hospital/:hospitalId"
        element={
          <ProtectedRoute>
            <RoleRoute requiredRole="USER">
              <HospitalUserDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Public Routes - Hospital List for Users */}
      <Route
        path="/hospitals"
        element={
          <ProtectedRoute>
            <RoleRoute requiredRole="USER">
              <HospitalList />
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
      {/* Rejected hospitals view */}
      <Route
        path={ROUTES.ADMIN_REJECTED_HOSPITALS}
        element={
          <ProtectedRoute>
            <RoleRoute requiredRole="ADMIN">
              <AdminRejectedHospitals />
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

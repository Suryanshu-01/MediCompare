// ==========================================
// HOSPITAL NAVBAR
// ==========================================
// Navigation bar for hospital dashboard pages

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function HospitalNavbar() {
  const navigate = useNavigate();
  const { hospital, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-8">
            <button
              onClick={() => navigate('/hospital/dashboard')}
              className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition"
            >
              Medi-Compare
            </button>
            
            {/* Navigation Links */}
            <div className="hidden md:flex space-x-6">
              <button
                onClick={() => navigate('/hospital/dashboard')}
                className="text-gray-700 hover:text-blue-600 font-medium transition"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/hospital/doctors')}
                className="text-gray-700 hover:text-blue-600 font-medium transition"
              >
                Doctors
              </button>
              <button
                onClick={() => navigate('/hospital/services')}
                className="text-gray-700 hover:text-blue-600 font-medium transition"
              >
                Services
              </button>
              <button
                onClick={() => navigate('/hospital/services/add')}
                className="text-gray-700 hover:text-blue-600 font-medium transition"
              >
                Add Service
              </button>
              <button
                onClick={() => navigate('/hospital/doctors/add')}
                className="text-gray-700 hover:text-blue-600 font-medium transition"
              >
                Add Doctor
              </button>
            </div>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">
                {hospital?.hospitalName || 'Hospital'}
              </p>
              <p className="text-xs text-gray-500">{hospital?.email || user?.email}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {hospital?.hospitalName?.charAt(0) || 'H'}
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

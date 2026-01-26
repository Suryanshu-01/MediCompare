// ==========================================
// REGISTER PAGE
// ==========================================
// Choice page: User picks between USER or HOSPITAL registration
// Shows toggle at top, then displays appropriate form

import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import UserRegister from './UserRegister';
import HospitalSignup from './HospitalSignup';
import { ROUTES } from '../utils/constants';
import registerImg from '../assets/images/login.png';

// ==========================================
// COMPONENT
// ==========================================
export default function Register() {
  // Toggle between USER and HOSPITAL
  const [userType, setUserType] = useState('USER');

  // ========== RENDER ==========
  return (
    <AuthLayout imageUrl={registerImg}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Medi-Compare</h1>
          <p className="text-gray-600 mt-2">Create your account</p>
        </div>

        {/* Toggle Buttons */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setUserType('USER')}
            className={`flex-1 py-2 px-4 rounded-md font-semibold transition ${
              userType === 'USER'
                ? 'bg-blue-600 text-white'
                : 'bg-transparent text-gray-600 hover:bg-gray-200'
            }`}
          >
            User
          </button>
          <button
            onClick={() => setUserType('HOSPITAL')}
            className={`flex-1 py-2 px-4 rounded-md font-semibold transition ${
              userType === 'HOSPITAL'
                ? 'bg-blue-600 text-white'
                : 'bg-transparent text-gray-600 hover:bg-gray-200'
            }`}
          >
            Hospital
          </button>
        </div>

        {/* Conditional Form */}
        {userType === 'USER' ? <UserRegister /> : <HospitalSignup />}

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="text-blue-600 hover:underline font-semibold">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
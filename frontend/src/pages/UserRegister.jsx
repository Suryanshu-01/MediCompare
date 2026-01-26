// ==========================================
// USER REGISTER FORM
// ==========================================
// Simple user registration form
// Calls auth.service.register() with role='USER'
// Saves token + user to context, redirects to dashboard

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';
import { useAuth } from '../hooks/useAuth';
import {
  validateName,
  validateEmail,
  validatePassword,
  validatePhone,
  validateForm,
} from '../utils/validators';
import { ERROR_MESSAGES, ROUTES } from '../utils/constants';

// ==========================================
// COMPONENT
// ==========================================
export default function UserRegister() {
  // ========== STATE ==========
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // ========== HOOKS ==========
  const navigate = useNavigate();
  const { login } = useAuth();

  // ========== SUBMIT ==========
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setApiError('');

    // Client-side validation
    const validationErrors = validateForm({
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
      phone: validatePhone(phone),
    });

    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }

    // API call
    setLoading(true);
    try {
      const response = await authService.register(name, email, password, phone);
      
      // Save to context + localStorage
      login(response.token, response.user);

      // Redirect to user dashboard
      navigate(ROUTES.USER_DASHBOARD);
    } catch (error) {
      setApiError(error.message || ERROR_MESSAGES.REGISTRATION_FAILED);
    } finally {
      setLoading(false);
    }
  };

  // ========== RENDER ==========
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* API Error */}
      {apiError && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {apiError}
        </div>
      )}

      {/* Name Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Full Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* Email Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
      </div>

      {/* Password Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
      </div>

      {/* Phone Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Phone</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="9876543210"
          className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition"
      >
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>
    </form>
  );
}

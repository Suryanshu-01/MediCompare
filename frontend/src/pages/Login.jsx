import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import loginImg from '../assets/images/login.png';
import authService from '../services/auth.service';
import { useAuth } from '../hooks/useAuth';
import { validateEmail, validatePassword, validateForm } from '../utils/validators';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, ROUTES } from '../utils/constants';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // ========== HOOKS ==========
  const navigate = useNavigate();
  const { login } = useAuth();

  // ========== VALIDATION & SUBMIT ==========
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setApiError('');

    // Client-side validation
    const validationErrors = validateForm({
      email: validateEmail(email),
      password: validatePassword(password),
    });

    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }

    // API call
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      
      // Save to context + localStorage (include hospital data if present)
      login(response.token, response.user, response.hospital);

      // Redirect based on role
      if (response.user.role === 'ADMIN') {
        navigate(ROUTES.ADMIN_DASHBOARD);
      } else if (response.user.role === 'HOSPITAL') {
        navigate(ROUTES.HOSPITAL_DASHBOARD);
      } else {
        navigate(ROUTES.USER_DASHBOARD);
      }
    } catch (error) {
      setApiError(error.message || ERROR_MESSAGES.LOGIN_FAILED);
    } finally {
      setLoading(false);
    }
  };

  // ========== RENDER ==========
  return (
    <AuthLayout imageUrl={loginImg}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Medi-Compare</h1>
          <p className="text-gray-600 mt-2">Login to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* API Error */}
          {apiError && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {apiError}
            </div>
          )}

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-600">
            New user?{' '}
            <Link to={ROUTES.REGISTER} className="text-blue-600 hover:underline font-semibold">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}

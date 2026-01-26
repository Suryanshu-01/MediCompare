import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/constants';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // If user has token + user object, allow access
  if (isAuthenticated) {
    return children;
  }

  return <Navigate to={ROUTES.LOGIN} replace />;
};

export default ProtectedRoute;

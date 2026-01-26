import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/constants';

export const RoleRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth();

  // First check: user must be authenticated
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (user?.role !== requiredRole) {
    if (user?.role === 'ADMIN') {
      return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
    } else if (user?.role === 'HOSPITAL') {
      return <Navigate to={ROUTES.HOSPITAL_DASHBOARD} replace />;
    } else {
      return <Navigate to={ROUTES.USER_DASHBOARD} replace />;
    }
  }

  return children;
};

export default RoleRoute;

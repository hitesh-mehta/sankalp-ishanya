
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, isAdmin } from '@/lib/auth';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requireAdmin?: boolean;
};

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const location = useLocation();
  const authenticated = isAuthenticated();
  const userIsAdmin = isAdmin();
  
  if (!authenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (requireAdmin && !userIsAdmin) {
    // Redirect to home if admin access is required but user is not admin
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;

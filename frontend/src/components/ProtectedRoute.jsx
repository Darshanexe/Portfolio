import { Navigate } from 'react-router-dom';
import { authUtils } from '../utils/auth';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authUtils.isAuthenticated();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

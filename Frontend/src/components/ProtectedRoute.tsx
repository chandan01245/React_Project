import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import axios from 'axios';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Add token to all future axios requests
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  // If we're on the 2FA page, allow access even if 2FA is not completed
  if (window.location.pathname === '/2fa') {
    return <>{children}</>;
  }

  // For all other protected routes, check if 2FA is required and completed
  const is2FARequired = localStorage.getItem('2fa_required') === 'true';
  const is2FACompleted = localStorage.getItem('2fa_completed') === 'true';

  if (is2FARequired && !is2FACompleted) {
    return <Navigate to="/2fa" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
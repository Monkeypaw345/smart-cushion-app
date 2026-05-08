import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowDemo?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowDemo = false }) => {
  const { isAuthenticated, isDemo } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isDemo && !allowDemo) {
    // Redirect to home (live monitor) if demo user tries to access protected page
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

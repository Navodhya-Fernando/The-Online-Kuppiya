import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // 1. Wait until authentication state is resolved
  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading user session...</div>;
  }

  // 2. If not authenticated, redirect to the login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. If authenticated, render the target page
  return children;
};

export default ProtectedRoute;
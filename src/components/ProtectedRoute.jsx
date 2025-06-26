import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user has necessary permissions
    if (!loading && isAuthenticated && user) {
      // Additional role-based checks can be added here if needed
      const role = user.role;
      
      // Redirect if user doesn't have a valid role
      if (!['owner', 'manager', 'captain', 'super_owner', 'admin'].includes(role)) {
        navigate('/login', { replace: true });
      }
    }
  }, [isAuthenticated, loading, user, navigate]);
  
  // Show loading state if authentication is still being checked
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Render children if authenticated
  return children;
} 
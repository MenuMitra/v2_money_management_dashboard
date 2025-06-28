import React, { useEffect, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOutlet } from '../context/OutletContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const { clearCurrentOutlet } = useOutlet();
  const navigate = useNavigate();
  
  // Store the previous user ID to detect changes
  const prevUserIdRef = useRef(null);
  
  useEffect(() => {
    // Check if user has necessary permissions
    if (!loading && isAuthenticated && user) {
      const currentUserId = user.user_id;
      const role = user.role;
      
      // If user ID changed (different user logged in), clear outlet data
      if (prevUserIdRef.current && prevUserIdRef.current !== currentUserId) {
        console.log('User changed in protected route, clearing outlet data');
        clearCurrentOutlet();
        // Dispatch cache:clear event to reset all data
        window.dispatchEvent(new CustomEvent('cache:clear', { detail: null }));
      }
      
      // Update the previous user ID reference
      prevUserIdRef.current = currentUserId;
      
      // Redirect if user doesn't have a valid role
      if (!['owner', 'manager', 'captain', 'super_owner', 'admin'].includes(role)) {
        navigate('/login', { replace: true });
      }
    }
  }, [isAuthenticated, loading, user, navigate, clearCurrentOutlet]);
  
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
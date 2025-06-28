import React, { createContext, useState, useEffect, useContext } from 'react';
import { authApi } from '../api/auth';
import { useNavigate } from 'react-router-dom';

// Create the authentication context
export const AuthContext = createContext();

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        const accessToken = localStorage.getItem('access_token');
        
        if (userId && accessToken) {
          // User is logged in
          const userData = await authApi.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to initialize auth state:', error);
        // Clear potentially invalid auth data
        await logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Send OTP for login
  const login = async (mobile) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await authApi.login(mobile);
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = 
        error.response?.data?.detail || 
        error.message || 
        'Failed to send OTP. Please try again.';
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOtp = async (data) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await authApi.verifyOtp(data);
      
      // Store auth data in localStorage
      const { user_id, name, role, access_token, expires_at } = response;
      
      localStorage.setItem('user_id', user_id);
      localStorage.setItem('user_name', name);
      localStorage.setItem('mobile_number', data.mobile);
      localStorage.setItem('role', role || 'owner');
      localStorage.setItem('access_token', access_token);
      
      if (expires_at) {
        localStorage.setItem('expires_at', expires_at);
      }
      
      // Add timestamp to track when token was saved
      localStorage.setItem('token_timestamp', Date.now().toString());
      
      // Update auth state
      setUser({
        user_id,
        name,
        mobile: data.mobile,
        role: role || 'owner'
      });
      
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      const errorMessage = 
        error.response?.data?.detail || 
        error.message || 
        'Failed to verify OTP. Please try again.';
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const resendOtp = async (mobile) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await authApi.resendOtp(mobile);
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = 
        error.response?.data?.detail || 
        error.message || 
        'Failed to resend OTP. Please try again.';
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    
    try {
      // Call the logout API
      await authApi.logout();
      
      // Clear auth state
      setUser(null);
      setIsAuthenticated(false);
      
      // Dispatch events to reset other components
      window.dispatchEvent(new CustomEvent('outlet:changed', { detail: null }));
      window.dispatchEvent(new CustomEvent('daterange:changed', { detail: { type: 'all' } }));
      window.dispatchEvent(new CustomEvent('cache:clear', { detail: null }));
      
      // Navigate to login
      navigate('/login');
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Generate device ID
  const getOrGenerateDeviceId = () => {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  };

  // Get device information
  const getDeviceInfo = () => {
    const platform = navigator.platform;
    const userAgent = navigator.userAgent.toLowerCase();
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;

    // Determine device type based on platform and user agent
    let deviceType = 'Unknown Device';
    
    if (platform.includes('Mac')) {
      if (userAgent.includes('macbook air')) {
        deviceType = 'MacBook Air';
      } else if (userAgent.includes('macbook pro')) {
        deviceType = 'MacBook Pro';
      } else if (userAgent.includes('macbook')) {
        deviceType = 'MacBook';
      } else {
        deviceType = 'Mac';
      }
    } else if (platform.includes('Win')) {
      if (userAgent.includes('hp')) {
        deviceType = 'HP Laptop';
      } else if (userAgent.includes('lenovo')) {
        deviceType = 'Lenovo Laptop';
      } else if (userAgent.includes('dell')) {
        deviceType = 'Dell Laptop';
      } else {
        deviceType = 'Windows PC';
      }
    } else if (userAgent.includes('iphone')) {
      deviceType = 'iPhone';
    } else if (userAgent.includes('ipad')) {
      deviceType = 'iPad';
    } else if (userAgent.includes('android')) {
      deviceType = 'Android Device';
    }

    // Create device model string with screen resolution
    return `${deviceType} (${screenWidth}x${screenHeight})`;
  };

  // Auth context value
  const authContextValue = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    verifyOtp,
    resendOtp,
    logout,
    getOrGenerateDeviceId,
    getDeviceInfo,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}; 
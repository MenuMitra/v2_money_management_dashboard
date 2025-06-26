import axios from './axios';
import { COMMON_PREFIX } from './axios';

export const authApi = {
  /**
   * Send OTP to a mobile number for login
   * @param {string} mobile - The mobile number to send OTP to
   * @returns {Promise} - API response
   */
  login: async (mobile) => {
    const response = await axios.post(`${COMMON_PREFIX}/login`, { 
      mobile,
      app_source: 'admin' 
    });
    return response.data;
  },
  
  /**
   * Verify OTP sent to the mobile number
   * @param {Object} data - Verification data
   * @param {string} data.mobile - Mobile number
   * @param {string} data.otp - OTP received
   * @param {string} data.device_id - Device identifier
   * @param {string} data.device_model - Device model information
   * @param {string} data.fcm_token - Firebase Cloud Messaging token (optional)
   * @returns {Promise} - API response with tokens
   */
  verifyOtp: async (data) => {
    const response = await axios.post(`${COMMON_PREFIX}/verify_otp`, {
      ...data,
      app_source: 'admin'
    });
    return response.data;
  },
  
  /**
   * Resend OTP to the mobile number
   * @param {string} mobile - Mobile number to resend OTP to
   * @returns {Promise} - API response
   */
  resendOtp: async (mobile) => {
    const response = await axios.post(`${COMMON_PREFIX}/resend_otp`, {
      mobile,
      app_source: 'admin'
    });
    return response.data;
  },
  
  /**
   * Logout the current user
   * @returns {Promise} - API response
   */
  logout: async () => {
    // We may not need an actual API call for logout if we're just clearing local storage
    // but we'll include this for future use
    try {
      const userId = localStorage.getItem('user_id');
      // Make an API call if there's a logout endpoint
      // const response = await axios.post(`${COMMON_PREFIX}/logout`, { user_id: userId });
      
      // Clear all auth-related localStorage items
      localStorage.removeItem('access_token');
      localStorage.removeItem('expires_at');
      localStorage.removeItem('token_timestamp');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_name');
      localStorage.removeItem('mobile_number');
      localStorage.removeItem('role');
      localStorage.removeItem('outlet_id');
      localStorage.removeItem('fcm_token');
      
      return { success: true, message: 'Successfully logged out' };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  /**
   * Get current user's profile information
   * @returns {Promise} - API response with user data
   */
  getCurrentUser: async () => {
    // We can build this when there's a specific endpoint for user profile
    // For now, we'll use localStorage data
    const userData = {
      user_id: localStorage.getItem('user_id'),
      name: localStorage.getItem('user_name'),
      mobile: localStorage.getItem('mobile_number'),
      role: localStorage.getItem('role')
    };
    
    return userData;
  },
}; 
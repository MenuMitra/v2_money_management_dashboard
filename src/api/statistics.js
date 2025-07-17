import axios from './axios';
import { API_PREFIX } from './axios';
import { API_PATHS } from './index';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/react-query/constants';

/**
 * Base function to fetch all statistics data from the API
 * 
 * @param {Object} params - Parameters for the API request
 * @returns {Promise<Object>} - The statistics data
 */
export const getAllStats = async (params = {}) => {
  try {
    // Ensure we have outlet_id in the parameters
    if (!params.outlet_id) {
      const outlet_id = localStorage.getItem('outlet_id');
      if (outlet_id) {
        params.outlet_id = parseInt(outlet_id, 10);
      } else {
        throw new Error('No outlet selected');
      }
    }
    
    // Add user_id from localStorage
    const user_id = localStorage.getItem('user_id');
    if (user_id) {
      params.user_id = parseInt(user_id, 10);
    }

    const response = await axios.post(API_PATHS.getAllStatsWithoutFilter, params);
    
    // Check if response has the expected structure
    if (response.data && response.data.detail) {
      return response.data.detail;
    }
    
    console.error('Unexpected API response format:', response.data);
    return null;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
}; 

/**
 * React Query hook for fetching all statistics
 * @param {Object} params - Query parameters
 * @param {Object} options - Additional query options
 * @returns {UseQueryResult} Query result object
 */
export const useAllStats = (params = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.statistics.all(params),
    queryFn: () => getAllStats(params),
    // The staleTime will be inherited from the global config (1 minute)
    ...options,
  });
}; 
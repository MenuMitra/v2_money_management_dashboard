import { api } from '../lib/react-query/queryClient';
import { API_PATHS } from './index';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/react-query/constants';

/**
 * Base function to fetch all statistics data from the API
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

    const response = await api.post(API_PATHS.getAllStatsWithoutFilter, params);
    
    if (response.data?.detail) {
      return {
        ...response.data.detail,
        outlet_id: params.outlet_id // Include outlet_id in response
      };
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
};

/**
 * Custom hook for fetching and managing statistics data
 */
export const useStatistics = (params = {}, options = {}) => {
  const queryClient = useQueryClient();
  
  // Ensure required parameters
  const queryParams = {
    outlet_id: params.outlet_id || parseInt(localStorage.getItem('outlet_id'), 10),
    user_id: params.user_id || parseInt(localStorage.getItem('user_id'), 10),
    ...params
  };

  // Set up background polling interval
  const defaultOptions = {
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    retry: 2,
    enabled: !!queryParams.outlet_id && !!queryParams.user_id,
    ...options
  };

  // Main statistics query
  const query = useQuery({
    queryKey: queryKeys.statistics.all(queryParams),
    queryFn: () => getAllStats(queryParams),
    ...defaultOptions
  });

  // Helper function for manual refresh
  const refresh = async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.statistics.all(queryParams)
    });
  };

  // Helper function for date range updates
  const updateDateRange = async (startDate, endDate) => {
    const newParams = {
      ...queryParams,
      start_date: startDate,
      end_date: endDate
    };
    
    await queryClient.invalidateQueries({
      queryKey: queryKeys.statistics.all(newParams)
    });
  };

  return {
    ...query,
    refresh,
    updateDateRange
  };
}; 
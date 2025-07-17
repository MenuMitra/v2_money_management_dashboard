import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/react-query/constants';
import { api } from '../../../lib/react-query/queryClient';

/**
 * Hook for fetching statistics data
 * @param {Object} params - Query parameters
 * @param {string} params.outletId - Outlet ID
 * @param {Object} [options] - Additional query options
 * @returns {UseQueryResult} Query result object
 */
export function useStatistics(params, options = {}) {
  return useQuery({
    queryKey: queryKeys.statistics.all(params),
    queryFn: async () => {
      const response = await api.get('/v2/outlet_statistics', { params });
      return response.data;
    },
    enabled: !!params?.outletId,
    ...options,
  });
} 
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/react-query/queryClient';
import { COMMON_PREFIX } from '../../api/axios';

export const outletListKeys = {
  root: ['outlet', 'list'],
  all: (params) => [...outletListKeys.root, 'all', params],
};

/**
 * Hook for fetching outlet list
 * @param {Object} params - Query parameters
 * @param {number} params.owner_id - Owner ID
 * @param {string} [params.app_source] - Application source (defaults to 'admin')
 * @param {number} [params.outlet_id] - Optional outlet ID
 * @param {Object} [options] - Additional query options
 * @returns {UseQueryResult} Query result object
 */
export function useOutletList(params, options = {}) {
  const { owner_id } = params;
  
  return useQuery({
    queryKey: outletListKeys.all({ owner_id }),
    queryFn: async () => {
      // Get current outlet_id from localStorage if not provided
      const outlet_id = params.outlet_id || localStorage.getItem('outlet_id');
      
      const response = await api.post(`${COMMON_PREFIX}/get_outlet_list`, {
        owner_id: Number(owner_id),
        app_source: 'admin',
        outlet_id: outlet_id ? Number(outlet_id) : undefined
      });
      
      // Return outlets array from the response
      return response.data?.outlets || [];
    },
    enabled: Boolean(owner_id),
    staleTime: 15 * 60 * 1000, // 15 minutes cache
    ...options,
  });
} 
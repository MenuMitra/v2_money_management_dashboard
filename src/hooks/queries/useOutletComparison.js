// src/hooks/queries/useOutletComparison.js
import { useQuery } from '@tanstack/react-query';
import { api, API_PATHS } from '../../api';

// Export the keys so they can be used in the component
export const outletCompareKeys = {
  root: ['outlet', 'compare'],
  detail: (params) => [...outletCompareKeys.root, 'detail', params],
  list: () => [...outletCompareKeys.root, 'list'],
};

export function useOutletComparison(params, options = {}) {
  const { user_id, outlet_id } = params;

  return useQuery({
    queryKey: outletCompareKeys.detail({ 
      user_id: Number(user_id), 
      outlet_id: Number(outlet_id) 
    }),
    queryFn: async () => {
      const response = await api.post(API_PATHS.outletCompareDetails, {
        user_id: Number(user_id),
        outlet_id: Number(outlet_id)
      });
      return response.data?.detail || null;
    },
    enabled: Boolean(user_id && outlet_id),
    staleTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
}

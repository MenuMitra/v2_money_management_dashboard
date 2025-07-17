import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/react-query/queryClient';

export function useTestQuery() {
  return useQuery({
    queryKey: ['test'],
    queryFn: async () => {
      const response = await api.get('/v2/outlet_statistics');
      return response.data;
    },
  });
} 
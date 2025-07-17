import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes
      gcTime: 10 * 60 * 1000,    // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    }
  }
});

/**
 * QueryProvider - Wraps the app with React Query context
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
} 
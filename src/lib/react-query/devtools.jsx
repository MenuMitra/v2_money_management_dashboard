import { lazy, Suspense } from 'react';

// Lazy load the devtools in development
const ReactQueryDevtools = lazy(() =>
  import('@tanstack/react-query-devtools').then(d => ({
    default: d.ReactQueryDevtools
  }))
);

export function TanstackQueryDevtools() {
  if (process.env.NODE_ENV === 'development') {
    return (
      <Suspense>
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      </Suspense>
    );
  }

  return null;
} 
'use client';

import { ProgressProvider } from '@bprogress/next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { AuthProvider } from '@/contexts/AuthContext';

function ProgressBootstrap() {
  useEffect(() => {
    const id = setTimeout(() => {
      const el = document.createElement('x');
      document.body.appendChild(el);
      document.body.removeChild(el);
    }, 0);
    return () => clearTimeout(id);
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false, // Prevent refetching when switching tabs
            staleTime: 60 * 1000, // 1 minute before data is considered stale
            retry: 1, // Only retry once on failure
          },
        },
      }),
  );

  return (
    <ProgressProvider height="3px" color="#41b883" options={{ showSpinner: false }} shallowRouting>
      <ProgressBootstrap />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </ProgressProvider>
  );
}

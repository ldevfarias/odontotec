'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/contexts/AuthContext';

interface RouteGuardProps {
  children: React.ReactNode;
}

/**
 * RouteGuard blocks rendering of protected content until auth is verified.
 * Returns null silently — the SubscriptionContext blur overlay covers this transition.
 * Redirects to /login when no token is found.
 */
export function RouteGuard({ children }: RouteGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

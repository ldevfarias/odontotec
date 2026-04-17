'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { LoginFormPanel } from '@/components/auth/LoginFormPanel';
import { LoginMarketingPanel } from '@/components/auth/LoginMarketingPanel';
import { useAuth } from '@/contexts/AuthContext';
import { useLoginForm } from '@/hooks/useLoginForm';

export default function LoginPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { form, isLoading, onSubmit, showPassword, togglePasswordVisibility } = useLoginForm();

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  if (isAuthLoading || isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full font-sans selection:bg-[#41b883]/20">
      <LoginMarketingPanel />
      <LoginFormPanel
        form={form}
        isLoading={isLoading}
        onSubmit={onSubmit}
        showPassword={showPassword}
        togglePasswordVisibility={togglePasswordVisibility}
      />
    </div>
  );
}

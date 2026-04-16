'use client';

import { LoginFormPanel } from '@/components/auth/LoginFormPanel';
import { LoginMarketingPanel } from '@/components/auth/LoginMarketingPanel';
import { useLoginForm } from '@/hooks/useLoginForm';

export default function LoginPage() {
  const { form, isPending, onSubmit, showPassword, togglePasswordVisibility } = useLoginForm();

  return (
    <div className="flex min-h-screen w-full font-sans selection:bg-[#41b883]/20">
      <LoginMarketingPanel />
      <LoginFormPanel
        form={form}
        isPending={isPending}
        onSubmit={onSubmit}
        showPassword={showPassword}
        togglePasswordVisibility={togglePasswordVisibility}
      />
    </div>
  );
}

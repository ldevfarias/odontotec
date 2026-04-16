'use client';

import { CreditCard, ExternalLink, Lock } from 'lucide-react';
import { useEffect } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

export function SubscriptionBlocker() {
  const { isLocked, upgradeToPro, isLoading } = useSubscription();
  const { user } = useAuth();

  // Disable scrolling when locked
  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isLocked]);

  if (!isLocked) return null;

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop with strong blur */}
      <div className="bg-background/60 absolute inset-0 backdrop-blur-xl" />

      {/* Modal Content */}
      <div className="animate-in fade-in zoom-in-95 relative z-10 mx-4 w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-2xl duration-300">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <Lock className="h-8 w-8 text-red-500" />
        </div>

        <h2 className="mb-3 text-2xl font-bold text-gray-900">Acesso Temporariamente Bloqueado</h2>

        <p className="mb-8 leading-relaxed text-gray-600">
          {isAdmin
            ? 'O período de teste gratuito da sua conta expirou. Para continuar acessando o sistema e seus dados, ative sua assinatura.'
            : 'O período de teste desta conta expirou. Entre em contato com o administrador da clínica para regularizar o acesso.'}
        </p>

        {isAdmin ? (
          <div className="space-y-3">
            <button
              onClick={upgradeToPro}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 shadow-primary/20 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white shadow-lg transition-all hover:scale-[1.02]"
            >
              <CreditCard className="h-5 w-5" />
              {isLoading ? 'Processando...' : 'Reativar Assinatura Agora'}
            </button>
            <p className="text-muted-foreground mt-4 text-xs">
              Pagamento seguro e cancelamento a qualquer momento.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600">
              <ExternalLink className="h-4 w-4" />
              Aguardando ativação pelo administrador
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

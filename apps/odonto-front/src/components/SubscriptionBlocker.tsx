'use client';

import { useEffect } from 'react';
import { Lock, CreditCard, ExternalLink } from 'lucide-react';
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
            <div className="absolute inset-0 bg-background/60 backdrop-blur-xl" />

            {/* Modal Content */}
            <div className="relative z-10 w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl border border-gray-100 text-center animate-in fade-in zoom-in-95 duration-300 mx-4">
                <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                    <Lock className="w-8 h-8 text-red-500" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Acesso Temporariamente Bloqueado
                </h2>

                <p className="text-gray-600 mb-8 leading-relaxed">
                    {isAdmin
                        ? 'O período de teste gratuito da sua conta expirou. Para continuar acessando o sistema e seus dados, ative sua assinatura.'
                        : 'O período de teste desta conta expirou. Entre em contato com o administrador da clínica para regularizar o acesso.'}
                </p>

                {isAdmin ? (
                    <div className="space-y-3">
                        <button
                            onClick={upgradeToPro}
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                        >
                            <CreditCard className="w-5 h-5" />
                            {isLoading ? 'Processando...' : 'Reativar Assinatura Agora'}
                        </button>
                        <p className="text-xs text-muted-foreground mt-4">
                            Pagamento seguro e cancelamento a qualquer momento.
                        </p>
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-sm text-gray-600 font-medium flex items-center justify-center gap-2">
                            <ExternalLink className="w-4 h-4" />
                            Aguardando ativação pelo administrador
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

'use client';

import { Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { cn } from '@/lib/utils';

export function UpgradePlanCard({ className }: { className?: string }) {
    const { plan, daysRemaining, upgradeToPro, isLoading, isExpired } = useSubscription();
    const { user } = useAuth();

    if (isLoading || plan === 'PRO') return null;

    const isAdmin = user?.role === 'ADMIN';

    // Different messaging for expired trial
    const title = isExpired ? 'Teste Expirado' : 'Upgrade para PRO';
    const badge = isExpired ? 'Renove agora' : '37% OFF';

    const bgStyle = isExpired
        ? { background: 'linear-gradient(135deg, oklch(0.6 0.18 25) 0%, oklch(0.45 0.18 25) 100%)' } // Destructive Red
        : { background: 'linear-gradient(135deg, #41b883 0%, oklch(0.45 0.14 250) 100%)' }; // Primary Teal to Medical Blue

    return (
        <div className={cn("relative shrink-0 rounded-2xl overflow-hidden group", className)}>
            {/* Gradient background */}
            <div className="absolute inset-0 transition-opacity duration-300" style={bgStyle} />

            {/* Subtle noise texture overlay */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                    backgroundSize: '150px',
                }}
            />

            <div className="relative p-3.5 sm:p-4">
                {/* Icon */}
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-white/20 flex items-center justify-center mb-2.5 sm:mb-3">
                    <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white fill-white" />
                </div>

                {/* Title + badge */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5">
                    <span className="text-[13px] sm:text-sm font-bold text-white leading-tight">
                        {title}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-white bg-white/25 px-1.5 py-0.5 rounded-full leading-none whitespace-nowrap">
                        {badge}
                    </span>
                </div>

                {/* Description */}
                <p className="text-[11px] sm:text-xs text-white/80 leading-relaxed mb-3">
                    {isExpired
                        ? 'Seu período de teste terminou. Assine para continuar.'
                        : `Você tem ${daysRemaining} dias restantes no seu período de teste.`
                    }
                </p>

                {/* Divider */}
                <div className="border-t border-dashed border-white/30 mb-3" />

                {/* Info or Action based on Role */}
                {isAdmin ? (
                    <>
                        <div className="flex flex-col mb-3">
                            <span className="text-[10px] sm:text-xs text-white/60 line-through font-medium">De R$ 80,00</span>
                            <div className="flex flex-wrap items-baseline gap-0.5 mt-0.5 sm:mt-0">
                                <span className="text-lg sm:text-xl font-bold text-white leading-none">R$ 49,99</span>
                                <span className="text-[10px] sm:text-xs text-white/70">/mês</span>
                            </div>
                        </div>
                        <button
                            onClick={upgradeToPro}
                            className="w-full py-1.5 sm:py-2 rounded-xl bg-white/25 hover:bg-white/35 active:scale-[0.98] active:bg-white/20 transition-all duration-200 text-[12px] sm:text-sm font-semibold text-white backdrop-blur-sm border border-white/20 hover:border-white/30 shadow-sm"
                        >
                            {isExpired ? 'Reativar Assinatura' : 'Assinar agora'}
                        </button>
                    </>
                ) : (
                    <div className="rounded-lg bg-white/10 p-2 border border-white/10">
                        <p className="text-[9px] sm:text-[10px] text-white/90 text-center font-medium leading-tight">
                            Apenas um administrador pode gerenciar assinaturas.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

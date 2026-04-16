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
    <div className={cn('group relative shrink-0 overflow-hidden rounded-2xl', className)}>
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
        <div className="mb-2.5 flex h-7 w-7 items-center justify-center rounded-xl bg-white/20 sm:mb-3 sm:h-8 sm:w-8">
          <Zap className="h-3.5 w-3.5 fill-white text-white sm:h-4 sm:w-4" />
        </div>

        {/* Title + badge */}
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-[13px] leading-tight font-bold text-white sm:text-sm">{title}</span>
          <span className="rounded-full bg-white/25 px-1.5 py-0.5 text-[9px] leading-none font-bold whitespace-nowrap text-white sm:text-[10px]">
            {badge}
          </span>
        </div>

        {/* Description */}
        <p className="mb-3 text-[11px] leading-relaxed text-white/80 sm:text-xs">
          {isExpired
            ? 'Seu período de teste terminou. Assine para continuar.'
            : `Você tem ${daysRemaining} dias restantes no seu período de teste.`}
        </p>

        {/* Divider */}
        <div className="mb-3 border-t border-dashed border-white/30" />

        {/* Info or Action based on Role */}
        {isAdmin ? (
          <>
            <div className="mb-3 flex flex-col">
              <span className="text-[10px] font-medium text-white/60 line-through sm:text-xs">
                De R$ 80,00
              </span>
              <div className="mt-0.5 flex flex-wrap items-baseline gap-0.5 sm:mt-0">
                <span className="text-lg leading-none font-bold text-white sm:text-xl">
                  R$ 49,99
                </span>
                <span className="text-[10px] text-white/70 sm:text-xs">/mês</span>
              </div>
            </div>
            <button
              onClick={upgradeToPro}
              className="w-full rounded-xl border border-white/20 bg-white/25 py-1.5 text-[12px] font-semibold text-white shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-white/30 hover:bg-white/35 active:scale-[0.98] active:bg-white/20 sm:py-2 sm:text-sm"
            >
              {isExpired ? 'Reativar Assinatura' : 'Assinar agora'}
            </button>
          </>
        ) : (
          <div className="rounded-lg border border-white/10 bg-white/10 p-2">
            <p className="text-center text-[9px] leading-tight font-medium text-white/90 sm:text-[10px]">
              Apenas um administrador pode gerenciar assinaturas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

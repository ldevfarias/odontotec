import {
  Activity,
  ChevronDown,
  ChevronUp,
  Droplet,
  Heart,
  Pill,
  Shield,
  Smile,
  Sparkles,
  Star,
  Stethoscope,
  Syringe,
} from 'lucide-react';
import { useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { useClinicProceduresControllerFindAll } from '@/generated/hooks/useClinicProceduresControllerFindAll';
import { cn } from '@/lib/utils';

export function TopTreatments() {
  const { data: proceduresResponse, isLoading } = useClinicProceduresControllerFindAll();
  const procedures = proceduresResponse?.data ?? [];
  const [isExpanded, setIsExpanded] = useState(false);

  // Map index to a specific icon and color scheme to maintain the UI design
  const getTreatmentStyle = (name: string, category: string, index: number) => {
    const text = `${name} ${category}`.toLowerCase();

    if (text.includes('limpeza') || text.includes('profilaxia') || text.includes('preven')) {
      return { color: 'bg-blue-100 text-blue-600', icon: Shield };
    }
    if (text.includes('clareamento') || text.includes('estética') || text.includes('lente')) {
      return { color: 'bg-emerald-100 text-emerald-600', icon: Sparkles };
    }
    if (
      text.includes('extrac') ||
      text.includes('extraç') ||
      text.includes('cirurgia') ||
      text.includes('siso')
    ) {
      return { color: 'bg-orange-100 text-orange-600', icon: Syringe };
    }
    if (text.includes('implante') || text.includes('prótese')) {
      return { color: 'bg-rose-100 text-rose-600', icon: Heart };
    }
    if (text.includes('canal') || text.includes('endo')) {
      return { color: 'bg-violet-100 text-violet-600', icon: Activity };
    }
    if (text.includes('restaura')) {
      return { color: 'bg-teal-100 text-teal-600', icon: Star };
    }
    if (text.includes('orto') || text.includes('aparelho')) {
      return { color: 'bg-cyan-100 text-cyan-600', icon: Smile };
    }

    const fallbackStyles = [
      { color: 'bg-blue-100 text-blue-600', icon: Stethoscope },
      { color: 'bg-emerald-100 text-emerald-600', icon: Pill },
      { color: 'bg-orange-100 text-orange-600', icon: Activity },
      { color: 'bg-rose-100 text-rose-600', icon: Droplet },
      { color: 'bg-teal-100 text-teal-600', icon: Star },
    ];
    return fallbackStyles[index % fallbackStyles.length];
  };

  const displayedTreatments = isExpanded ? procedures : procedures.slice(0, 4);

  return (
    <div className="flex h-full w-full flex-col rounded-[24px] border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="mb-6 text-[17px] font-bold tracking-tight text-gray-900">Procedimentos</h3>

      <div className="flex flex-1 flex-col gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2 py-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <div className="flex flex-col items-end gap-1">
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))
        ) : displayedTreatments.length === 0 ? (
          <div className="py-6 text-center text-sm text-gray-500">
            Nenhum procedimento cadastrado.
          </div>
        ) : (
          <div className="flex flex-col gap-4 overflow-hidden transition-all duration-300 ease-in-out">
            {displayedTreatments.map((treatment: unknown, i: number) => {
              const style = getTreatmentStyle(treatment.name || '', treatment.category || '', i);
              const Icon = style.icon;
              const formattedPrice = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(treatment.baseValue || 0);

              return (
                <div
                  key={treatment.id || i}
                  className="group animate-in fade-in slide-in-from-bottom-2 flex cursor-pointer items-center gap-4 duration-300"
                  style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
                >
                  <div
                    className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105',
                      style.color,
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="group-hover:text-primary truncate text-[14px] leading-tight font-bold text-gray-900 transition-colors">
                      {treatment.name}
                    </span>
                    <span className="truncate text-[12px] font-medium text-gray-500">
                      {treatment.category || 'Geral'}
                    </span>
                  </div>

                  <div className="flex shrink-0 flex-col items-end justify-center">
                    <span className="text-[14px] font-bold text-gray-900">{formattedPrice}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {procedures.length > 4 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-200 py-2.5 text-[13px] font-bold text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          {isExpanded ? (
            <>
              Recolher lista
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Ver mais {procedures.length - 4} procedimentos
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}

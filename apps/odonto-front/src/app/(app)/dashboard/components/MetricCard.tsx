import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  className?: string;
}

export function MetricCard({ title, value, icon, trend, className }: MetricCardProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm',
        className,
      )}
    >
      <div className="mb-6 flex items-center gap-2 font-medium text-gray-500">
        <div className="text-gray-400">{icon}</div>
        <span className="text-[15px]">{title}</span>
      </div>

      <div className="flex items-end gap-5">
        <span className="text-[44px] leading-none font-bold tracking-tight text-gray-900">
          {value}
        </span>

        {trend && (
          <div className="mb-1.5 flex shrink-0 flex-col">
            <div
              className={cn(
                'flex w-fit items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-bold',
                trend.isPositive
                  ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
                  : 'border-rose-100 bg-rose-50 text-rose-600',
              )}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="h-3 w-3" strokeWidth={3} />
              ) : (
                <ArrowDownRight className="h-3 w-3" strokeWidth={3} />
              )}
              {trend.value}%
            </div>
            <span className="mt-1 text-[10px] font-medium tracking-wider text-gray-400 uppercase">
              {trend.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

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
        <div className={cn("bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden", className)}>
            <div className="flex items-center gap-2 text-gray-500 font-medium mb-6">
                <div className="text-gray-400">
                    {icon}
                </div>
                <span className="text-[15px]">{title}</span>
            </div>

            <div className="flex items-end gap-5">
                <span className="text-[44px] leading-none font-bold tracking-tight text-gray-900">{value}</span>

                {trend && (
                    <div className="flex flex-col mb-1.5 shrink-0">
                        <div className={cn(
                            "flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded-md w-fit border",
                            trend.isPositive
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : "bg-rose-50 text-rose-600 border-rose-100"
                        )}>
                            {trend.isPositive ? <ArrowUpRight className="h-3 w-3" strokeWidth={3} /> : <ArrowDownRight className="h-3 w-3" strokeWidth={3} />}
                            {trend.value}%
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-wider">{trend.label}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

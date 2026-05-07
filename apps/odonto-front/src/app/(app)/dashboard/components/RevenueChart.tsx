'use client';

import { CalendarDays } from 'lucide-react';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis } from 'recharts';

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { RevenuePeriod, useRevenueHistory } from '@/hooks/useRevenueHistory';
import { cn } from '@/lib/utils';

const PERIOD_OPTIONS: { value: RevenuePeriod; label: string }[] = [
  { value: 'last_month', label: 'Último mês' },
  { value: 'this_week', label: 'Semana atual' },
  { value: 'last_week', label: 'Semana anterior' },
];

const chartConfig = {
  value: {
    label: 'Receita',
    color: 'var(--primary)',
  },
} satisfies ChartConfig;

function formatCurrency(val: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(val);
}

export function RevenueChart() {
  const [period, setPeriod] = useState<RevenuePeriod>('last_month');
  const { data: apiData = [], isLoading } = useRevenueHistory(period);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const revenueHistory = apiData;

  const isMonthly = period === 'last_month';
  const totalRevenue = revenueHistory.reduce((sum, d) => sum + d.value, 0);

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col rounded-3xl border border-gray-100 bg-white px-7 py-6 shadow-sm">
        <div className="mb-4 flex justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-8 w-37 rounded-full" />
        </div>
        <div className="flex flex-1 items-end gap-3 pb-6">
          {[55, 70, 45, 80, 60, 75, 50].map((height, i) => (
            <Skeleton key={i} className="h-full w-full" style={{ maxHeight: `${height}%` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white px-7 py-6 shadow-sm">
      {/* Header */}
      <div className="z-10 mb-6 flex w-full items-start justify-between">
        <div>
          <h3 className="text-[17px] font-bold tracking-tight text-gray-900">Receita mensal</h3>
          <p className="mt-0.5 text-[12px] font-medium text-gray-400">
            Total:{' '}
            <span className="font-semibold text-gray-700">{formatCurrency(totalRevenue)}</span>
          </p>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as RevenuePeriod)}>
          <SelectTrigger className="focus:ring-primary/20 h-8 w-auto min-w-37 gap-1.5 rounded-full border-gray-200 bg-white px-4 text-[13px] font-medium shadow-sm hover:border-gray-300 focus:ring-1">
            <CalendarDays className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end" className="min-w-45 rounded-xl border-gray-100 p-1 shadow-lg">
            {PERIOD_OPTIONS.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="cursor-pointer rounded-lg text-[13px] font-medium"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col pt-4">
        <ChartContainer config={chartConfig} className="min-h-0 w-full flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={revenueHistory}
              margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
              onMouseMove={(state) => {
                if (state.activeTooltipIndex !== undefined) {
                  setActiveIndex(
                    typeof state.activeTooltipIndex === 'number' ? state.activeTooltipIndex : null,
                  );
                }
              }}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" />
                  <stop offset="100%" stopColor="var(--color-chart-2)" />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="var(--color-gray-100)"
              />

              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tickMargin={12}
                tick={({ x, y, payload, index }) => {
                  // Sparse labeling logic (Option A+C)
                  const total = revenueHistory.length;
                  const isFirst = index === 0;
                  const isLast = index === total - 1;
                  const isAnchor = index % 7 === 0;
                  const isActive = index === activeIndex;

                  const showText = !isMonthly || isFirst || isLast || isAnchor || isActive;

                  return (
                    <g transform={`translate(${x},${y})`}>
                      {!showText && isMonthly ? (
                        <circle r={1.5} fill="var(--color-gray-200)" cy={6} />
                      ) : showText ? (
                        <text
                          x={0}
                          y={10}
                          textAnchor="middle"
                          className={cn(
                            'transition-colors duration-200',
                            isMonthly ? 'text-[9px]' : 'text-[11px]',
                            isActive ? 'fill-primary font-bold' : 'fill-gray-400 font-medium',
                          )}
                        >
                          {payload.value}
                        </text>
                      ) : null}
                    </g>
                  );
                }}
              />

              <ChartTooltip
                cursor={{ fill: 'transparent' }}
                content={
                  <ChartTooltipContent
                    hideLabel
                    className="w-30 border-slate-800 bg-slate-900"
                    formatter={(value) => (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">
                          Receita
                        </span>
                        <span className="text-sm font-bold text-white tabular-nums">
                          {formatCurrency(Number(value))}
                        </span>
                      </div>
                    )}
                    indicator="line"
                  />
                }
              />

              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={isMonthly ? 12 : 32}>
                {revenueHistory.map((_, index) => {
                  const isActive = activeIndex === index;
                  const isHovering = activeIndex !== null;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill="url(#barGradient)"
                      fillOpacity={isHovering && !isActive ? 0.3 : 1}
                      className="cursor-pointer transition-all duration-300"
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis } from 'recharts';

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { RevenuePeriod, useRevenueHistory } from '@/hooks/useRevenueHistory';
import { cn } from '@/lib/utils';

interface RevenueChartProps {
  period: RevenuePeriod;
}

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

export function RevenueChart({ period }: RevenueChartProps) {
  const { data: apiData = [], isLoading } = useRevenueHistory(period);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const revenueHistory = apiData;

  const isMonthly = period === 'last_month';
  const totalRevenue = revenueHistory.reduce((sum, d) => sum + d.value, 0);

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[340px] w-full flex-col rounded-[24px] border border-gray-100 bg-white px-7 py-6 shadow-sm">
        <div className="mb-4 flex justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
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
    <div className="relative flex h-full min-h-[340px] w-full flex-col overflow-hidden rounded-[24px] border border-gray-100 bg-white px-7 py-6 shadow-sm">
      {/* Header */}
      <div className="z-10 mb-6 flex w-full items-start justify-between">
        <div>
          <h3 className="text-[17px] font-bold tracking-tight text-gray-900">Visão de Receita</h3>
          <p className="mt-0.5 text-[12px] font-medium text-gray-400">
            Total:{' '}
            <span className="font-semibold text-gray-700">{formatCurrency(totalRevenue)}</span>
          </p>
        </div>
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
                    className="w-[120px] border-slate-800 bg-slate-900"
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

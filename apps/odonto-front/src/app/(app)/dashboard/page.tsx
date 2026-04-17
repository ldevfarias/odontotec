'use client';

import { CalendarDays } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardStats } from '@/hooks/useDashboardStats';

import { DentistDashboard } from './components/dentist/DentistDashboard';
// Components
import { DentistQuickBook } from './components/DentistQuickBook';
import { RecentActivity } from './components/RecentActivity';
import { RevenueChart } from './components/RevenueChart';
import { TopTreatments } from './components/TopTreatments';

type Period = 'last_month' | 'this_week' | 'last_week';

const PERIOD_OPTIONS: { value: Period; label: string; badge?: string }[] = [
  { value: 'last_month', label: 'Último mês' },
  { value: 'this_week', label: 'Semana atual' },
  { value: 'last_week', label: 'Semana anterior' },
];

export default function DashboardPage() {
  const { user } = useAuth();

  const role = user?.role?.toUpperCase();
  if (role === 'DENTIST') {
    return <DentistDashboard />;
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const { data: stats, isLoading, error } = useDashboardStats();
  const [period, setPeriod] = useState<Period>('last_month');

  const selectedLabel = PERIOD_OPTIONS.find((p) => p.value === period)?.label ?? 'Último mês';

  if (isLoading) return <DashboardLoading />;

  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-destructive text-xl font-semibold">Erro ao carregar dashboard</h2>
        <p className="text-muted-foreground max-w-md">
          Não foi possível obter os dados atualizados. Verifique sua conexão ou tente novamente.
        </p>
        <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
      </div>
    );
  }

  if (!stats) return <DashboardLoading />;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 w-full pb-6 duration-500">
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Left Column */}
        <div className="flex flex-col gap-4 lg:col-span-8">
          {/* Section Header with Period Filter */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 h-5 rounded-full border px-2.5 py-0 text-[11px] font-semibold shadow-none">
                {selectedLabel}
              </Badge>
            </div>

            {/* Beautiful Period Select */}
            <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
              <SelectTrigger className="focus:ring-primary/20 h-8 w-auto min-w-[148px] gap-1.5 rounded-full border-gray-200 bg-white px-4 text-[13px] font-medium shadow-sm hover:border-gray-300 focus:ring-1">
                <CalendarDays className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                align="end"
                className="min-w-[180px] rounded-xl border-gray-100 p-1 shadow-lg"
              >
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

          {/* Dentist Quick Book Banner */}
          <DentistQuickBook />

          {/* Revenue Chart */}
          <div className="h-[340px]">
            <RevenueChart period={period} />
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4 lg:col-span-4">
          <div className="flex-1">
            <RecentActivity appointments={stats.recentAppointments} />
          </div>
          <TopTreatments />
        </div>
      </div>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-4 p-1">
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <div className="mb-3 flex items-center justify-between">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-8 w-[148px] rounded-full" />
          </div>
          <Skeleton className="h-[140px] rounded-[24px]" />
          <Skeleton className="h-[340px] rounded-[24px]" />
        </div>
        <div className="flex flex-col gap-4 lg:col-span-4">
          <Skeleton className="min-h-[360px] flex-1 rounded-[24px]" />
          <Skeleton className="h-[360px] rounded-[24px]" />
        </div>
      </div>
    </div>
  );
}

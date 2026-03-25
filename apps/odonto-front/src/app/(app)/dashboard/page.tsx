'use client';

import { useState, Suspense } from 'react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useAuth } from '@/contexts/AuthContext';
import { DentistDashboard } from './components/dentist/DentistDashboard';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Users, Wallet, CalendarDays } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

// Components
import { DentistQuickBook } from './components/DentistQuickBook';
import { RevenueChart } from './components/RevenueChart';
import { TopTreatments } from './components/TopTreatments';
import { RecentActivity } from './components/RecentActivity';

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

    const selectedLabel = PERIOD_OPTIONS.find(p => p.value === period)?.label ?? 'Último mês';

    if (isLoading) return <DashboardLoading />;

    if (error) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
                <h2 className="text-xl font-semibold text-destructive">Erro ao carregar dashboard</h2>
                <p className="text-muted-foreground max-w-md">
                    Não foi possível obter os dados atualizados. Verifique sua conexão ou tente novamente.
                </p>
                <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
            </div>
        );
    }

    if (!stats) return <DashboardLoading />;



    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full pb-6">
            <div className="grid gap-6 lg:gap-8 lg:grid-cols-12">
                {/* Left Column */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                    {/* Section Header with Period Filter */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Badge className="text-[11px] font-semibold px-2.5 py-0 h-5 rounded-full bg-primary/10 text-primary border border-primary/20 shadow-none">
                                {selectedLabel}
                            </Badge>
                        </div>

                        {/* Beautiful Period Select */}
                        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
                            <SelectTrigger className="h-8 w-auto min-w-[148px] text-[13px] font-medium border-gray-200 bg-white rounded-full px-4 shadow-sm hover:border-gray-300 focus:ring-1 focus:ring-primary/20 gap-1.5">
                                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent align="end" className="min-w-[180px] rounded-xl p-1 shadow-lg border-gray-100">
                                {PERIOD_OPTIONS.map(opt => (
                                    <SelectItem
                                        key={opt.value}
                                        value={opt.value}
                                        className="rounded-lg text-[13px] font-medium cursor-pointer"
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
                        <RevenueChart
                            revenue={stats.revenue}
                            period={period}
                        />
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-4 flex flex-col gap-4">
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
        <div className="space-y-4 p-1 max-w-[1400px] mx-auto">
            <div className="grid gap-4 lg:grid-cols-12">
                <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center justify-between mb-3">
                        <Skeleton className="h-5 w-24 rounded-full" />
                        <Skeleton className="h-8 w-[148px] rounded-full" />
                    </div>
                    <Skeleton className="h-[140px] rounded-[24px]" />
                    <Skeleton className="h-[340px] rounded-[24px]" />
                </div>
                <div className="lg:col-span-4 flex flex-col gap-4">
                    <Skeleton className="flex-1 min-h-[360px] rounded-[24px]" />
                    <Skeleton className="h-[360px] rounded-[24px]" />
                </div>
            </div>
        </div>
    );
}

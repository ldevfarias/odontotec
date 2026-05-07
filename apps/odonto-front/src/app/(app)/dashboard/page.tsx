'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardStats } from '@/hooks/useDashboardStats';

import { AdminGreetingBanner } from './components/AdminGreetingBanner';
import { DentistDashboard } from './components/dentist/DentistDashboard';
import { LazyRevenueChart } from './components/LazyRevenueChart';
import { RecentActivity } from './components/RecentActivity';
import { StatsCards } from './components/StatsCards';
import { TopTreatments } from './components/TopTreatments';

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
    <div className="animate-in fade-in slide-in-from-bottom-4 w-full space-y-6 pb-6 duration-500">
      {/* Greeting Banner */}
      <AdminGreetingBanner stats={stats} />

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Revenue Chart — self-manages its period */}
        <div className="flex lg:col-span-6 lg:h-90">
          <LazyRevenueChart />
        </div>

        {/* Agenda do Dia */}
        <div className="flex lg:col-span-3 lg:h-90">
          <RecentActivity appointments={stats.recentAppointments} />
        </div>

        {/* Top Tratamentos */}
        <div className="flex lg:col-span-3 lg:h-90">
          <TopTreatments />
        </div>
      </div>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="w-full space-y-6 pb-6">
      {/* Banner */}
      <Skeleton className="h-19 rounded-2xl" />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-30 rounded-3xl" />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Skeleton className="h-90 rounded-3xl lg:col-span-6" />
        <Skeleton className="h-90 rounded-3xl lg:col-span-3" />
        <Skeleton className="h-90 rounded-3xl lg:col-span-3" />
      </div>
    </div>
  );
}

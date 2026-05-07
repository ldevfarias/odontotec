import { BadgeCheck, CalendarDays, DollarSign, Users } from 'lucide-react';

import { DashboardStats, DashboardTrend } from '@/hooks/useDashboardStats';

import { MetricCard } from './MetricCard';

function formatRevenue(val: number): string {
  if (val >= 1000) {
    return `R$${(val / 1000).toFixed(1).replace('.', ',')}k`;
  }
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}

// Mock trends — replace with real API data when backend exposes these fields
const MOCK_TRENDS: {
  patients: DashboardTrend;
  appointments: DashboardTrend;
  revenue: DashboardTrend;
  occupancy: DashboardTrend;
} = {
  patients: { value: 12, isPositive: true, label: 'vs mês ant.' },
  appointments: { value: 8, isPositive: true, label: 'semana atual' },
  revenue: { value: 3, isPositive: false, label: 'semana atual' },
  occupancy: { value: 5, isPositive: true, label: 'vs semana ant.' },
};

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Pacientes"
        value={stats.patientsToday}
        icon={<Users className="h-5 w-5" />}
        trend={stats.patientsTrend ?? MOCK_TRENDS.patients}
      />
      <MetricCard
        title="Consultas"
        value={stats.appointments}
        icon={<CalendarDays className="h-5 w-5" />}
        trend={stats.appointmentsTrend ?? MOCK_TRENDS.appointments}
      />
      <MetricCard
        title="Receita"
        value={formatRevenue(stats.revenue)}
        icon={<DollarSign className="h-5 w-5" />}
        trend={stats.revenueTrend ?? MOCK_TRENDS.revenue}
      />
      <MetricCard
        title="Taxa Presença"
        value={`${stats.occupancyRate}%`}
        icon={<BadgeCheck className="h-5 w-5" />}
        trend={stats.occupancyTrend ?? MOCK_TRENDS.occupancy}
      />
    </div>
  );
}

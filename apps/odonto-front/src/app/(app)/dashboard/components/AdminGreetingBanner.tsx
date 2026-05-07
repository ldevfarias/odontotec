'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardStats } from '@/hooks/useDashboardStats';

interface AdminGreetingBannerProps {
  stats: DashboardStats;
}

export function AdminGreetingBanner({ stats }: AdminGreetingBannerProps) {
  const { user } = useAuth();

  const rawFirst = user?.name?.split(' ')[0] ?? 'Doutor';
  const firstName = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  const appointmentsCount = stats.patientsToday;
  const appointmentLabel = appointmentsCount === 1 ? 'consulta' : 'consultas';
  const scheduledLabel = appointmentsCount === 1 ? 'agendada' : 'agendadas';

  return (
    <div className="relative flex items-center justify-between overflow-hidden rounded-2xl bg-linear-to-r from-teal-500 to-cyan-400 px-8 py-5 shadow-sm">
      <div>
        <h2 className="text-xl font-black text-white">
          {greeting}, Dr. {firstName}!
        </h2>
        <p className="mt-0.5 text-sm font-medium text-white/80">
          Você tem{' '}
          <span className="font-bold text-white">
            {appointmentsCount} {appointmentLabel}
          </span>{' '}
          {scheduledLabel} para hoje.
        </p>
      </div>
      <Link href="/agendamentos">
        <Button className="border border-white/30 bg-white/20 text-white shadow-none hover:bg-white/30">
          Ver agenda
        </Button>
      </Link>
    </div>
  );
}

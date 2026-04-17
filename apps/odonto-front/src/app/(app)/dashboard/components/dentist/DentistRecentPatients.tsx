'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowRight, User } from 'lucide-react';
import Link from 'next/link';

import { Skeleton } from '@/components/ui/skeleton';

interface DentistRecentPatientsProps {
  appointments: unknown[];
  isLoading?: boolean;
}

export function DentistRecentPatients({ appointments, isLoading }: DentistRecentPatientsProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-1">
            <Skeleton className="h-10 w-10 rounded-full sm:h-9 sm:w-9" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-[140px]" />
              <Skeleton className="h-2.5 w-[90px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Deduplicate by patient id, keep most recent
  const seen = new Set<number>();
  const recentPatients = appointments
    .filter((a) => a.patient?.id && !seen.has(a.patient.id) && seen.add(a.patient.id))
    .slice(0, 5);

  if (recentPatients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <User className="mb-2 h-8 w-8 text-gray-300" />
        <p className="text-sm font-medium text-gray-400">Nenhum paciente hoje</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {recentPatients.map((apt) => {
        const patient = apt.patient;
        const initials =
          patient?.name
            ?.split(' ')
            .map((n: string) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase() ?? '??';

        return (
          <Link
            key={patient?.id}
            href={`/patients?id=${patient?.id}`}
            className="group flex items-center gap-3 rounded-md border border-transparent p-2.5 transition-all hover:border-slate-100 hover:bg-slate-50 active:scale-[0.98] active:bg-slate-100 sm:p-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-teal-200 bg-teal-100 text-[11px] font-black text-teal-700 sm:h-9 sm:w-9">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm leading-tight font-semibold text-gray-800">
                {patient?.name ?? 'Paciente'}
              </p>
              <p className="truncate text-[11px] text-gray-400">
                {apt.date ? format(new Date(apt.date), "HH:mm '·' dd MMM", { locale: ptBR }) : '—'}
              </p>
            </div>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-gray-300 transition-colors group-hover:text-teal-500" />
          </Link>
        );
      })}
    </div>
  );
}

'use client';

import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowRight, CalendarDays } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useAppointmentsControllerFindAll } from '@/generated/hooks/useAppointmentsControllerFindAll';
import { useAppointmentsControllerUpdate } from '@/generated/hooks/useAppointmentsControllerUpdate';
import { UpdateAppointmentDtoStatusEnumKey } from '@/generated/ts/UpdateAppointmentDto';
import { notificationService } from '@/services/notification.service';

import { DentistRecentPatients } from './DentistRecentPatients';
import { DentistTimeline } from './DentistTimeline';

export function DentistDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: appointmentsResponse, isLoading } = useAppointmentsControllerFindAll({
    date: today,
    dentistId: user?.id,
  });
  const appointments = appointmentsResponse?.data ?? [];

  const { mutate: updateAppointment } = useAppointmentsControllerUpdate();

  const handleEditAppointment = (appointment: unknown) => {
    const apt = appointment as { id: number; status?: string };
    updateAppointment(
      {
        id: apt.id,
        data: { status: apt.status as UpdateAppointmentDtoStatusEnumKey },
      },
      {
        onSuccess: () => {
          notificationService.success('Status atualizado!');
          queryClient.invalidateQueries({ queryKey: [{ url: '/appointments' }] });
        },
        onError: () => notificationService.error('Erro ao atualizar status.'),
      },
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-500">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800 sm:text-3xl">
            Bom dia, Dr. {user?.name?.split(' ')[0]}
          </h1>
          <p className="mt-0.5 text-sm font-medium text-gray-400">
            {format(new Date(), "EEEE',' dd 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        <Link href="/agendamentos" className="w-full sm:w-auto">
          <Button
            variant="outline"
            className="w-full gap-2 border-slate-200 text-slate-600 transition-all hover:bg-slate-50 active:scale-[0.98] sm:w-auto"
          >
            <CalendarDays className="h-4 w-4" />
            Ver Agenda Completa
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Main Content: Timeline + Recent Patients */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-8">
        {/* Timeline */}
        <div className="flex flex-col overflow-hidden rounded-sm border border-gray-100 bg-white shadow-sm lg:col-span-8">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-black tracking-widest text-slate-700 uppercase">
                Agenda do Dia
              </h2>
              <p className="mt-0.5 text-[11px] text-gray-400">
                {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
              </p>
            </div>
            <span className="rounded-sm border border-teal-200 bg-teal-50 px-2 py-1 text-[10px] font-bold tracking-widest text-teal-600 uppercase">
              {appointments.length} consulta{appointments.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="p-4">
            <DentistTimeline
              appointments={appointments}
              isLoading={isLoading}
              onEditAppointment={handleEditAppointment}
            />
          </div>
        </div>

        {/* Recent Patients */}
        <div className="flex flex-col overflow-hidden rounded-sm border border-gray-100 bg-white shadow-sm lg:col-span-4">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-black tracking-widest text-slate-700 uppercase">
              Pacientes de Hoje
            </h2>
            <p className="mt-0.5 text-[11px] text-gray-400">Acesso rápido às fichas</p>
          </div>
          <div className="p-3">
            <DentistRecentPatients appointments={appointments} isLoading={isLoading} />
          </div>
          {!isLoading && appointments.length > 0 && (
            <div className="border-t border-gray-100 px-5 py-3">
              <Link
                href="/patients"
                className="flex items-center gap-1 text-[11px] font-bold text-teal-600 transition-colors hover:text-teal-700"
              >
                Ver todos os pacientes
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

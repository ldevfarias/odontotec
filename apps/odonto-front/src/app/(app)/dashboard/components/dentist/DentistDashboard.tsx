'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';
import { ArrowRight, CalendarDays } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useAppointmentsControllerFindAll } from '@/generated/hooks/useAppointmentsControllerFindAll';
import { useAppointmentsControllerUpdate } from '@/generated/hooks/useAppointmentsControllerUpdate';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';


import { DentistTimeline } from './DentistTimeline';
import { DentistRecentPatients } from './DentistRecentPatients';

export function DentistDashboard() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const today = format(new Date(), 'yyyy-MM-dd');

    const { data: appointments = [], isLoading } = useAppointmentsControllerFindAll({
        date: today,
        dentistId: user?.id,
    });

    const { mutate: updateAppointment } = useAppointmentsControllerUpdate();

    const handleStatusChange = (appointment: any, status: string) => {
        updateAppointment(
            { id: appointment.id, data: { status: status as any } },
            {
                onSuccess: () => {
                    notificationService.success('Status atualizado!');
                    queryClient.invalidateQueries({ queryKey: [{ url: '/appointments' }] });
                },
                onError: () => notificationService.error('Erro ao atualizar status.'),
            }
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-800">
                        Bom dia, Dr. {user?.name?.split(' ')[0]}
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5 font-medium">
                        {format(new Date(), "EEEE',' dd 'de' MMMM", { locale: ptBR })}
                    </p>
                </div>
                <Link href="/agendamentos">
                    <Button variant="outline" className="gap-2 border-slate-200 text-slate-600 hover:bg-slate-50">
                        <CalendarDays className="h-4 w-4" />
                        Ver Agenda Completa
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
            </div>


            {/* Main Content: Timeline + Recent Patients */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Timeline */}
                <div className="lg:col-span-8 bg-white border border-gray-100 rounded-sm shadow-sm overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">
                                Agenda do Dia
                            </h2>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                                {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
                            </p>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600 bg-teal-50 border border-teal-200 px-2 py-1 rounded-sm">
                            {appointments.length} consulta{appointments.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="p-4">
                        <DentistTimeline
                            appointments={appointments}
                            isLoading={isLoading}
                            onStatusChange={handleStatusChange}
                        />
                    </div>
                </div>

                {/* Recent Patients */}
                <div className="lg:col-span-4 bg-white border border-gray-100 rounded-sm shadow-sm overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">
                            Pacientes de Hoje
                        </h2>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                            Acesso rápido às fichas
                        </p>
                    </div>
                    <div className="p-3">
                        <DentistRecentPatients
                            appointments={appointments}
                            isLoading={isLoading}
                        />
                    </div>
                    {!isLoading && appointments.length > 0 && (
                        <div className="px-5 py-3 border-t border-gray-100">
                            <Link
                                href="/patients"
                                className="text-[11px] font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
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

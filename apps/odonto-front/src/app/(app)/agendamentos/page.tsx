'use client';

import { Calendar } from '@/components/calendar/Calendar';
import { CalendarEvent, EventCategory, Professional } from '@/components/calendar/types';
import { addMinutes, parseISO } from 'date-fns';
import { useUsersControllerFindAll } from '@/generated/hooks/useUsersControllerFindAll';
import { useAppointmentsControllerFindAll } from '@/generated/hooks/useAppointmentsControllerFindAll';
import { useMemo, useState } from 'react';
import { AppointmentModal } from '@/components/appointments/AppointmentModal';
import { useAppointmentsControllerUpdate } from '@/generated/hooks/useAppointmentsControllerUpdate';
import { useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';
import { CalendarSkeleton } from '@/components/skeletons';

// Categories could also be dynamic in the future, for now keeping basic ones or mapping from status
// Categories could also be dynamic in the future, for now keeping basic ones or mapping from status
const CATEGORIES: EventCategory[] = [
    { id: 'c1', name: 'Consulta', color: '#10b981' }, // Emerald
    { id: 'c2', name: 'Procedimento', color: '#3b82f6' }, // Blue
];

const PROFESSIONAL_COLORS = [
    '#2563eb', // Blue
    '#059669', // Emerald
    '#d97706', // Amber
    '#dc2626', // Red
    '#0891b2', // Cyan
    '#ea580c', // Orange
];

export default function AgendamentosPage() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    const { mutate: updateAppointment } = useAppointmentsControllerUpdate();

    // 1. Fetch Professionals (Dentists only)
    const { data: userData = [], isLoading: isLoadingUsers } = useUsersControllerFindAll({
        client: { params: { role: 'DENTIST' } } as any
    });

    const professionals = useMemo<Professional[]>(() => {
        return (userData as any[]).map((user, index) => ({
            id: user.id.toString(),
            name: user.name,
            role: user.role === 'DENTIST' ? 'Dentista' : user.role,
            color: PROFESSIONAL_COLORS[index % PROFESSIONAL_COLORS.length]
        }));
    }, [userData]);

    // 2. Fetch Appointments
    // Note: The Calendar component handles date filtering internally for the view, 
    // but we fetch all for now or could optimize by passing dates if we expose them from Calendar state.
    const { data: appointmentData = [] } = useAppointmentsControllerFindAll();

    const events = useMemo<CalendarEvent[]>(() => {
        return (appointmentData as any[]).map(app => {
            const start = parseISO(app.date);
            const end = addMinutes(start, app.duration || 30);

            return {
                id: app.id.toString(),
                title: app.patient?.name ? `Consulta: ${app.patient.name}` : 'Consulta',
                patientName: app.patient?.name,
                procedureName: 'Consulta', // Placeholder
                startTime: start,
                endTime: end,
                professionalId: (app.dentistId || app.dentist?.id)?.toString() || '',
                categoryId: 'c1', // Mapping everything to category 1 for now
                description: app.notes || '',
                status: app.status,
                originalAppointment: app,
            };
        });
    }, [appointmentData]);

    if (isLoadingUsers) {
        return <CalendarSkeleton />;
    }

    if (professionals.length === 0) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">Nenhum profissional ativo apto para agendamentos.</p>
            </div>
        );
    }

    const handleUpdateStatus = (id: string, newStatus: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'ABSENT') => {
        updateAppointment({
            id: Number(id),
            data: { status: newStatus }
        }, {
            onSuccess: () => {
                const statusMessage = {
                    'CONFIRMED': 'confirmado',
                    'CANCELLED': 'cancelado',
                    'COMPLETED': 'finalizado',
                    'ABSENT': 'marcado como falta'
                }[newStatus];
                notificationService.success(`Agendamento ${statusMessage} com sucesso!`);
                queryClient.invalidateQueries({ queryKey: [{ url: '/appointments' }] });
            },
            onError: (error: any) => {
                notificationService.apiError(error, 'Erro ao atualizar agendamento');
            }
        });
    };

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <Calendar
                events={events}
                categories={CATEGORIES}
                professionals={professionals}
                onNewAppointment={() => {
                    setSelectedAppointment(null);
                    setIsModalOpen(true);
                }}
                onEditAppointment={(appointment) => {
                    setSelectedAppointment(appointment);
                    setIsModalOpen(true);
                }}
                onUpdateAppointmentStatus={handleUpdateStatus}
            />

            <AppointmentModal
                open={isModalOpen}
                onOpenChange={(open) => {
                    setIsModalOpen(open);
                    if (!open) setSelectedAppointment(null);
                }}
                appointmentToEdit={selectedAppointment}
            />
        </div>
    );
}

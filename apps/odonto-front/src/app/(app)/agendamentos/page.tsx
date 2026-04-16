'use client';

import { useQueryClient } from '@tanstack/react-query';
import { addMinutes, parseISO } from 'date-fns';
import { useMemo, useState } from 'react';

import { AppointmentModal } from '@/components/appointments/AppointmentModal';
import { Calendar } from '@/components/calendar/Calendar';
import { CalendarEvent, EventCategory, Professional } from '@/components/calendar/types';
import { CalendarSkeleton } from '@/components/skeletons';
import { useAuth } from '@/contexts/AuthContext';
import { useAppointmentsControllerFindAll } from '@/generated/hooks/useAppointmentsControllerFindAll';
import { useAppointmentsControllerUpdate } from '@/generated/hooks/useAppointmentsControllerUpdate';
import { useUsersControllerFindAll } from '@/generated/hooks/useUsersControllerFindAll';
import { notificationService } from '@/services/notification.service';

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
  const { user: currentUser } = useAuth();
  const { data: userDataResponse, isLoading: isLoadingUsers } = useUsersControllerFindAll();
  const userData = (userDataResponse as any)?.data ?? [];

  const roleLabels: Record<string, string> = {
    OWNER: 'Administrador',
    ADMIN: 'Administrador',
    DENTIST: 'Dentista',
    SIMPLE: 'Recepcionista',
    RECEPTIONIST: 'Recepcionista',
  };

  const professionals = useMemo<Professional[]>(() => {
    const allUsers = userData as any[];
    const allowedRoles = ['DENTIST', 'ADMIN', 'OWNER'];

    let filteredUsers = allUsers.filter(
      (u) => u.role && allowedRoles.includes(u.role.toUpperCase()) && u.isActive,
    );

    // If the user is a dentist, only show themselves in the calendar
    if (currentUser?.role?.toUpperCase() === 'DENTIST') {
      filteredUsers = filteredUsers.filter((u) => u.id === currentUser.id);
    }

    return filteredUsers.map((user, index) => ({
      id: user.id.toString(),
      name: user.name,
      role: roleLabels[user.role?.toUpperCase()] || user.role,
      color: PROFESSIONAL_COLORS[index % PROFESSIONAL_COLORS.length],
      avatarUrl: user.avatarUrl || undefined,
    }));
  }, [userData, currentUser]);

  // 2. Fetch Appointments
  // Note: The Calendar component handles date filtering internally for the view,
  // but we fetch all for now or could optimize by passing dates if we expose them from Calendar state.
  const { data: appointmentDataResponse } = useAppointmentsControllerFindAll();

  const events = useMemo<CalendarEvent[]>(() => {
    return (appointmentDataResponse?.data ?? []).map((app: Record<string, unknown>) => {
      const patient = app['patient'] as { name?: string } | null;
      const dentist = app['dentist'] as { id?: number } | null;
      const start = parseISO(app['date'] as string);
      const end = addMinutes(start, (app['duration'] as number) || 30);

      return {
        id: String(app['id']),
        title: patient?.name ? `Consulta: ${patient.name}` : 'Consulta',
        patientName: patient?.name,
        procedureName: 'Consulta',
        startTime: start,
        endTime: end,
        professionalId: String(app['dentistId'] ?? dentist?.id ?? ''),
        categoryId: 'c1',
        description: String(app['notes'] ?? ''),
        status: app['status'] as string,
        originalAppointment: app,
      };
    });
  }, [appointmentDataResponse]);

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

  const handleUpdateStatus = (
    id: string,
    newStatus: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'ABSENT',
  ) => {
    updateAppointment(
      {
        id: Number(id),
        data: { status: newStatus },
      },
      {
        onSuccess: () => {
          const statusMessage = {
            CONFIRMED: 'confirmado',
            CANCELLED: 'cancelado',
            COMPLETED: 'finalizado',
            ABSENT: 'marcado como falta',
          }[newStatus];
          notificationService.success(`Agendamento ${statusMessage} com sucesso!`);
          queryClient.invalidateQueries({ queryKey: [{ url: '/appointments' }] });
        },
        onError: (error: any) => {
          notificationService.apiError(error, 'Erro ao atualizar agendamento');
        },
      },
    );
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
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

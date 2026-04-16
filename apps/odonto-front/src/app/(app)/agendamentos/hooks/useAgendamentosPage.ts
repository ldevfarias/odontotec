import { useQueryClient } from '@tanstack/react-query';
import { addMinutes, parseISO } from 'date-fns';
import { useMemo } from 'react';

import { CalendarEvent, EventCategory, Professional } from '@/components/calendar/types';
import { useAuth } from '@/contexts/AuthContext';
import { useAppointmentsControllerFindAll } from '@/generated/hooks/useAppointmentsControllerFindAll';
import { useAppointmentsControllerUpdate } from '@/generated/hooks/useAppointmentsControllerUpdate';
import { useUsersControllerFindAll } from '@/generated/hooks/useUsersControllerFindAll';
import { notificationService } from '@/services/notification.service';

import {
  AppointmentApiItem,
  AppointmentsApiResponse,
  UserApiItem,
  UsersApiResponse,
} from '../types';

export const CATEGORIES: EventCategory[] = [
  { id: 'c1', name: 'Consulta', color: '#10b981' },
  { id: 'c2', name: 'Procedimento', color: '#3b82f6' },
];

const PROFESSIONAL_COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#0891b2', '#ea580c'];

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Administrador',
  ADMIN: 'Administrador',
  DENTIST: 'Dentista',
  SIMPLE: 'Recepcionista',
  RECEPTIONIST: 'Recepcionista',
};

const ALLOWED_PROFESSIONAL_ROLES = ['DENTIST', 'ADMIN', 'OWNER'];

function mapUserToProfessional(user: UserApiItem, index: number): Professional {
  return {
    id: user.id.toString(),
    name: user.name,
    role: ROLE_LABELS[user.role?.toUpperCase()] ?? user.role,
    color: PROFESSIONAL_COLORS[index % PROFESSIONAL_COLORS.length],
    avatarUrl: user.avatarUrl ?? undefined,
  };
}

function mapAppointmentToEvent(app: AppointmentApiItem): CalendarEvent {
  const start = parseISO(app.date);
  const end = addMinutes(start, app.duration || 30);

  return {
    id: String(app.id),
    title: app.patient?.name ? `Consulta: ${app.patient.name}` : 'Consulta',
    patientName: app.patient?.name,
    procedureName: 'Consulta',
    startTime: start,
    endTime: end,
    professionalId: String(app.dentistId ?? app.dentist?.id ?? ''),
    categoryId: 'c1',
    description: app.notes ?? '',
    status: app.status,
    originalAppointment: app,
  };
}

type UpdateStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'ABSENT';

const STATUS_SUCCESS_MESSAGES: Record<UpdateStatus, string> = {
  CONFIRMED: 'confirmado',
  CANCELLED: 'cancelado',
  COMPLETED: 'finalizado',
  ABSENT: 'marcado como falta',
};

export function useAgendamentosPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const { data: userDataResponse, isLoading: isLoadingUsers } = useUsersControllerFindAll();
  const { data: appointmentDataResponse } = useAppointmentsControllerFindAll();
  const { mutate: updateAppointment } = useAppointmentsControllerUpdate();

  const allUsers: UserApiItem[] = (userDataResponse as UsersApiResponse | undefined)?.data ?? [];
  const allAppointments: AppointmentApiItem[] =
    (appointmentDataResponse as AppointmentsApiResponse | undefined)?.data ?? [];

  const professionals = useMemo<Professional[]>(() => {
    let filtered = allUsers.filter(
      (u) => u.role && ALLOWED_PROFESSIONAL_ROLES.includes(u.role.toUpperCase()) && u.isActive,
    );

    if (currentUser?.role?.toUpperCase() === 'DENTIST') {
      filtered = filtered.filter((u) => u.id === currentUser.id);
    }

    return filtered.map(mapUserToProfessional);
  }, [allUsers, currentUser]);

  const events = useMemo<CalendarEvent[]>(
    () => allAppointments.map(mapAppointmentToEvent),
    [allAppointments],
  );

  function handleUpdateStatus(id: string, newStatus: UpdateStatus): void {
    updateAppointment(
      { id: Number(id), data: { status: newStatus } },
      {
        onSuccess: () => {
          notificationService.success(
            `Agendamento ${STATUS_SUCCESS_MESSAGES[newStatus]} com sucesso!`,
          );
          queryClient.invalidateQueries({ queryKey: [{ url: '/appointments' }] });
        },
        onError: (error: unknown) => {
          notificationService.apiError(error, 'Erro ao atualizar agendamento');
        },
      },
    );
  }

  return {
    professionals,
    events,
    isLoading: isLoadingUsers,
    handleUpdateStatus,
  } as const;
}

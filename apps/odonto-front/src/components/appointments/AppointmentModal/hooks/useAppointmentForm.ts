'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { useAuth } from '@/contexts/AuthContext';
import { useAppointmentsControllerCreate } from '@/generated/hooks/useAppointmentsControllerCreate';
import { useAppointmentsControllerGetAvailableSlots } from '@/generated/hooks/useAppointmentsControllerGetAvailableSlots';
import { useAppointmentsControllerUpdate } from '@/generated/hooks/useAppointmentsControllerUpdate';
import { usePatientsControllerFindAll } from '@/generated/hooks/usePatientsControllerFindAll';
import { useUsersControllerFindAll } from '@/generated/hooks/useUsersControllerFindAll';
import type { CreateAppointmentDto } from '@/generated/ts/CreateAppointmentDto';
import type {
  UpdateAppointmentDto,
  UpdateAppointmentDtoStatusEnumKey,
} from '@/generated/ts/UpdateAppointmentDto';
import { analytics, EVENT_NAMES } from '@/services/analytics.service';
import { notificationService } from '@/services/notification.service';

export const appointmentFormSchema = z.object({
  patientId: z.number().min(1, 'Selecione o paciente'),
  dentistId: z.number().min(1, 'Selecione o dentista'),
  duration: z.number().min(15, 'Duração mínima é 15 minutos').max(480, 'Duração máxima é 8 horas'),
  dateOnly: z.string().min(10, 'Selecione uma data'),
  timeOnly: z.string().min(5, 'Selecione um horário'),
  status: z.string().optional(),
});

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

export type PatientRecord = { id: number; name: string };
export type UserRecord = { id: number; name: string; role?: string };
export type AppointmentData = {
  id: number;
  date: string;
  duration: number;
  status?: string;
  patientId?: number;
  dentistId?: number;
  patient?: { id: number };
  dentist?: { id: number };
};

export interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: Date;
  appointmentToEdit?: AppointmentData;
  initialPatientId?: number;
}

export function useAppointmentForm({
  open,
  onOpenChange,
  initialDate,
  appointmentToEdit,
  initialPatientId,
}: AppointmentModalProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isDentist = user?.role?.toUpperCase() === 'DENTIST';

  const [isPatientPopoverOpen, setIsPatientPopoverOpen] = useState(false);
  const [isDentistPopoverOpen, setIsDentistPopoverOpen] = useState(false);

  const { data: patientsResponse } = usePatientsControllerFindAll();
  const patients = (patientsResponse?.data ?? []) as PatientRecord[];
  const { data: professionalsResponse } = useUsersControllerFindAll();
  const { mutate: createAppointment, isPending: isCreating } = useAppointmentsControllerCreate();
  const { mutate: updateAppointment, isPending: isUpdating } = useAppointmentsControllerUpdate();

  const isPending = isCreating || isUpdating;

  const dentists = useMemo(
    () =>
      ((professionalsResponse?.data ?? []) as UserRecord[]).filter((u) => {
        const role = u.role?.toUpperCase();
        return role === 'DENTIST' || role === 'ADMIN' || role === 'OWNER';
      }),
    [professionalsResponse],
  );

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patientId: 0,
      dentistId: isDentist ? (user?.id ?? 0) : 0,
      duration: 30,
      dateOnly: format(initialDate || new Date(), 'yyyy-MM-dd'),
      timeOnly: '',
    },
  });

  const watchDate = useWatch({ control: form.control, name: 'dateOnly', defaultValue: '' });
  const watchDentist = useWatch({ control: form.control, name: 'dentistId', defaultValue: 0 });
  const watchDuration = useWatch({ control: form.control, name: 'duration', defaultValue: 30 });
  const watchPatient = useWatch({ control: form.control, name: 'patientId', defaultValue: 0 });

  const { data: slotsResponse, isFetching: isFetchingSlots } =
    useAppointmentsControllerGetAvailableSlots(
      {
        date: watchDate || format(new Date(), 'yyyy-MM-dd'),
        dentistId: watchDentist || 0,
        duration: watchDuration || 30,
        patientId: watchPatient > 0 ? watchPatient : undefined,
      },
      {
        query: {
          enabled: !!watchDate && !!watchDentist && watchDentist > 0,
        },
      },
    );

  const isEditing = !!appointmentToEdit;
  const originalTime = isEditing ? format(parseISO(appointmentToEdit.date), 'HH:mm') : null;

  const slotsWithOriginal = useMemo(() => {
    const slots: string[] = slotsResponse ?? [];
    if (!isEditing || !originalTime) return slots;

    const originalDate = format(parseISO(appointmentToEdit.date), 'yyyy-MM-dd');
    if (
      watchDate === originalDate &&
      watchDentist === (appointmentToEdit.dentistId || appointmentToEdit.dentist?.id)
    ) {
      if (!slots.includes(originalTime)) {
        return [...slots, originalTime].sort();
      }
    }
    return slots;
  }, [slotsResponse, isEditing, originalTime, watchDate, watchDentist, appointmentToEdit]);

  useEffect(() => {
    if (open) {
      if (appointmentToEdit) {
        const dateObj = parseISO(appointmentToEdit.date);
        form.reset({
          patientId: appointmentToEdit.patientId || appointmentToEdit.patient?.id || 0,
          dentistId: appointmentToEdit.dentistId || appointmentToEdit.dentist?.id || 0,
          duration: appointmentToEdit.duration || 30,
          dateOnly: format(dateObj, 'yyyy-MM-dd'),
          timeOnly: format(dateObj, 'HH:mm'),
          status: appointmentToEdit.status || 'SCHEDULED',
        });
      } else {
        form.reset({
          patientId: initialPatientId || 0,
          dentistId: isDentist ? (user?.id ?? 0) : 0,
          duration: 30,
          dateOnly: format(initialDate || new Date(), 'yyyy-MM-dd'),
          timeOnly: '',
          status: undefined,
        });
      }
    }
  }, [open, initialDate, isDentist, user?.id, form, appointmentToEdit, initialPatientId]);

  function onSubmit(values: AppointmentFormValues) {
    const combinedDateTime = new Date(`${values.dateOnly}T${values.timeOnly}:00.000`);

    const payload = {
      patientId: values.patientId,
      duration: values.duration,
      date: combinedDateTime.toISOString(),
      dentistId: isDentist && user?.id ? user.id : values.dentistId,
      ...(isEditing && values.status
        ? { status: values.status as UpdateAppointmentDtoStatusEnumKey }
        : {}),
    };

    const successCallback = () => {
      notificationService.success(
        isEditing ? 'Agendamento atualizado com sucesso!' : 'Agendamento realizado com sucesso!',
      );
      analytics.capture(
        isEditing ? EVENT_NAMES.APPOINTMENT_UPDATED : EVENT_NAMES.APPOINTMENT_CREATED,
        {
          patient_id: payload.patientId,
          dentist_id: payload.dentistId,
          duration: payload.duration,
          date: payload.date,
        },
      );
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: [{ url: '/appointments' }] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    };

    const errorCallback = (error: unknown) => {
      notificationService.apiError(
        error,
        `Erro ao ${isEditing ? 'atualizar' : 'realizar'} agendamento.`,
      );
    };

    if (isEditing) {
      updateAppointment(
        { id: appointmentToEdit.id, data: payload as UpdateAppointmentDto },
        { onSuccess: successCallback, onError: errorCallback },
      );
    } else {
      createAppointment(
        { data: payload as CreateAppointmentDto },
        { onSuccess: successCallback, onError: errorCallback },
      );
    }
  }

  return {
    form,
    onSubmit,
    isPending,
    isEditing,
    isDentist,
    patients,
    dentists,
    watchDate,
    watchDentist,
    slotsWithOriginal,
    isFetchingSlots,
    isPatientPopoverOpen,
    setIsPatientPopoverOpen,
    isDentistPopoverOpen,
    setIsDentistPopoverOpen,
  };
}

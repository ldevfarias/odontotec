'use client';

import { useState } from 'react';

import { AppointmentModal } from '@/components/appointments/AppointmentModal';
import type { AppointmentData } from '@/components/appointments/AppointmentModal/hooks/useAppointmentForm';
import { Calendar } from '@/components/calendar/Calendar';
import { CalendarSkeleton } from '@/components/skeletons';

import { CATEGORIES, useAgendamentosPage } from './hooks/useAgendamentosPage';

export default function AgendamentosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);

  const { professionals, events, isLoading, handleUpdateStatus } = useAgendamentosPage();

  if (isLoading) {
    return <CalendarSkeleton />;
  }

  if (professionals.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Nenhum profissional ativo apto para agendamentos.</p>
      </div>
    );
  }

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
        appointmentToEdit={selectedAppointment ?? undefined}
      />
    </div>
  );
}

import { useMemo, useState } from 'react';

import { AppointmentDetailSheet } from './AppointmentDetailSheet';
import { CalendarHeader } from './CalendarHeader';
import { CalendarSidebar } from './CalendarSidebar';
import {
  AppointmentData,
  CalendarEvent,
  CalendarState,
  EventCategory,
  Professional,
} from './types';
import { AgendaView } from './views/AgendaView';
import { DayView } from './views/DayView';
import { MonthView } from './views/MonthView';
import { WeekView } from './views/WeekView';

interface CalendarProps {
  events: CalendarEvent[];
  categories: EventCategory[];
  professionals: Professional[];
  onNewAppointment?: () => void;
  onEditAppointment?: (originalAppointment: AppointmentData) => void;
  onUpdateAppointmentStatus?: (
    id: string,
    newStatus: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'ABSENT',
  ) => void;
}

export function Calendar({
  events,
  categories,
  professionals,
  onNewAppointment,
  onEditAppointment,
  onUpdateAppointmentStatus,
}: CalendarProps) {
  const [state, setState] = useState<CalendarState>(() => ({
    currentDate: new Date(),
    view: typeof window !== 'undefined' && window.innerWidth < 640 ? 'agenda' : 'week',
    selectedCategories: categories.map((c) => c.id),
    selectedProfessionals: professionals.map((p) => p.id),
  }));
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileSelectedEvent, setMobileSelectedEvent] = useState<CalendarEvent | null>(null);

  const handleStateChange = (updates: Partial<CalendarState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const handleDayTap = (date: Date) => {
    handleStateChange({ currentDate: date, view: 'agenda' });
  };

  const filteredEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          state.selectedCategories.includes(event.categoryId) &&
          state.selectedProfessionals.includes(event.professionalId),
      ),
    [events, state.selectedCategories, state.selectedProfessionals],
  );

  const activeProfessionals = useMemo(
    () => professionals.filter((p) => state.selectedProfessionals.includes(p.id)),
    [professionals, state.selectedProfessionals],
  );

  return (
    <div className="bg-background border-border flex h-full w-full overflow-hidden rounded-xl border shadow-sm max-sm:rounded-none max-sm:border-0 max-sm:shadow-none">
      <CalendarSidebar
        state={state}
        onStateChange={handleStateChange}
        categories={categories}
        professionals={professionals}
        events={events}
        mobileOpen={mobileFilterOpen}
        onMobileClose={() => setMobileFilterOpen(false)}
      />
      <div className="bg-card flex min-w-0 flex-1 flex-col">
        <CalendarHeader
          state={state}
          onStateChange={handleStateChange}
          onNewAppointment={onNewAppointment}
          onFilterOpen={() => setMobileFilterOpen(true)}
        />
        <div className="relative flex-1 overflow-hidden">
          {state.view === 'agenda' && (
            <AgendaView
              currentDate={state.currentDate}
              events={filteredEvents}
              categories={categories}
              professionals={activeProfessionals}
              onEventTap={(e) => setMobileSelectedEvent(e)}
            />
          )}
          {state.view === 'week' && (
            <WeekView
              currentDate={state.currentDate}
              events={filteredEvents}
              categories={categories}
              professionals={activeProfessionals}
              onEditAppointment={onEditAppointment}
              onUpdateAppointmentStatus={onUpdateAppointmentStatus}
              onEventTap={(e) => setMobileSelectedEvent(e)}
            />
          )}
          {state.view === 'day' && (
            <DayView
              currentDate={state.currentDate}
              events={filteredEvents}
              categories={categories}
              professionals={activeProfessionals}
              onEditAppointment={onEditAppointment}
              onUpdateAppointmentStatus={onUpdateAppointmentStatus}
              onEventTap={(e) => setMobileSelectedEvent(e)}
            />
          )}
          {state.view === 'month' && (
            <MonthView
              currentDate={state.currentDate}
              events={filteredEvents}
              categories={categories}
              professionals={activeProfessionals}
              onEditAppointment={onEditAppointment}
              onUpdateAppointmentStatus={onUpdateAppointmentStatus}
              onEventTap={(e) => setMobileSelectedEvent(e)}
              onDayTap={handleDayTap}
            />
          )}
        </div>
      </div>

      <AppointmentDetailSheet
        event={mobileSelectedEvent}
        open={mobileSelectedEvent !== null}
        onClose={() => setMobileSelectedEvent(null)}
        categories={categories}
        professionals={activeProfessionals}
        onEditAppointment={onEditAppointment}
        onUpdateAppointmentStatus={onUpdateAppointmentStatus}
      />
    </div>
  );
}

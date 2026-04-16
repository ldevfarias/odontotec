import type { AppointmentData } from '@/components/appointments/AppointmentModal/hooks/useAppointmentForm';

export type { AppointmentData };

export type CalendarView = 'day' | 'week' | 'month' | 'agenda';

export interface EventCategory {
  id: string;
  name: string;
  color: string;
  count?: number;
}

export interface Professional {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  color?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  patientName?: string;
  procedureName?: string;
  startTime: Date;
  endTime: Date;
  professionalId: string;
  categoryId: string;
  attendees?: number;
  description?: string;
  status?: string;
  originalAppointment?: AppointmentData;
}

export interface CalendarState {
  currentDate: Date;
  view: CalendarView;
  selectedCategories: string[];
  selectedProfessionals: string[];
}

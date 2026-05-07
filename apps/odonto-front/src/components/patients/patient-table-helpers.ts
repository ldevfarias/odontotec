import { isToday, parseISO } from 'date-fns';

import { Patient } from './PatientsTable';

export const MOBILE_PAGE_SIZE = 15;

export const AVATAR_COLORS = [
  '#2563eb',
  '#059669',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#0891b2',
  '#db2777',
  '#65a30d',
];

export type FilterTab = 'all' | 'active' | 'inactive' | 'today';

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function hasAppointmentToday(patient: Patient): boolean {
  if (!patient.nextAppointmentDate) return false;
  try {
    return isToday(parseISO(patient.nextAppointmentDate));
  } catch {
    return false;
  }
}

export function isPatientActive(patient: Patient): boolean {
  if (patient.status) return patient.status === 'ACTIVE';
  return true;
}

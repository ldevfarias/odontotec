import { ProfessionalInvitation } from '../types';

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Administrador',
  ADMIN: 'Administrador',
  DENTIST: 'Dentista',
  SIMPLE: 'Recepcionista',
};

export function getRoleLabel(role?: string) {
  if (!role) return 'Sem cargo';
  return ROLE_LABELS[role.toUpperCase()] || role;
}

export function isAdminRole(role?: string) {
  if (!role) return false;
  const normalizedRole = role.toUpperCase();
  return normalizedRole === 'ADMIN' || normalizedRole === 'OWNER';
}

export function getInvitationStatus(invitation: ProfessionalInvitation) {
  if (invitation.acceptedAt) return 'accepted';

  const now = new Date();
  const expiresAt = new Date(invitation.expiresAt);

  return expiresAt < now ? 'expired' : 'pending';
}
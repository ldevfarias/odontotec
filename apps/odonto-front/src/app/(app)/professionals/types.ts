export type ProfessionalRole = 'OWNER' | 'ADMIN' | 'DENTIST' | 'SIMPLE' | string;

export interface ProfessionalUser {
  id: number | string;
  name?: string;
  email: string;
  role: ProfessionalRole;
  isActive: boolean;
}

export interface ProfessionalInvitation {
  id: number | string;
  email: string;
  role: ProfessionalRole;
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string | null;
}
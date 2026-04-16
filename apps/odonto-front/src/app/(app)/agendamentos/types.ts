export type UserApiItem = {
  id: number;
  name: string;
  role: string;
  isActive: boolean;
  avatarUrl?: string;
};

export type PatientApiItem = {
  id: number;
  name?: string;
};

export type DentistApiItem = {
  id: number;
};

export type AppointmentApiItem = {
  id: number;
  date: string;
  duration: number;
  status: string;
  notes?: string;
  dentistId: number;
  patientId?: number;
  patient?: PatientApiItem;
  dentist?: DentistApiItem;
};

export type UsersApiResponse = {
  data: UserApiItem[];
};

export type AppointmentsApiResponse = {
  data: AppointmentApiItem[];
};

'use client';

import { Building2, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth, UserClinic } from '@/contexts/AuthContext';

export default function SelectClinicPage() {
  const { clinics, setActiveClinic, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (clinics.length === 0) {
      router.push('/login');
    } else if (clinics.length === 1) {
      setActiveClinic(clinics[0]);
      router.push('/dashboard');
    }
  }, [clinics, setActiveClinic, router]);

  const handleSelect = (clinic: UserClinic) => {
    setActiveClinic(clinic);
    router.push('/dashboard');
  };

  const roleLabels: Record<string, string> = {
    OWNER: 'Administrador',
    ADMIN: 'Administrador',
    DENTIST: 'Dentista',
    SIMPLE: 'Recepcionista',
    RECEPTIONIST: 'Recepcionista',
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Olá, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="mt-2 text-gray-500">Selecione a clínica que deseja acessar</p>
        </div>

        <div className="space-y-3">
          {clinics.map((clinic) => (
            <button
              key={clinic.id}
              onClick={() => handleSelect(clinic)}
              className="group flex w-full cursor-pointer items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-teal-300 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 transition-colors group-hover:bg-teal-100">
                <Building2 className="h-6 w-6 text-teal-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-gray-900">{clinic.name}</p>
                <p className="text-xs text-gray-500">{roleLabels[clinic.role] || clinic.role}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-300 transition-colors group-hover:text-teal-500" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

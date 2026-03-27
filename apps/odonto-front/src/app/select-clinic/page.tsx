'use client';

import { useAuth, UserClinic } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Building2, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';

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
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Olá, {user?.name?.split(' ')[0]} 👋
                    </h1>
                    <p className="text-gray-500 mt-2">Selecione a clínica que deseja acessar</p>
                </div>

                <div className="space-y-3">
                    {clinics.map((clinic) => (
                        <button
                            key={clinic.id}
                            onClick={() => handleSelect(clinic)}
                            className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group"
                        >
                            <div className="h-12 w-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0 group-hover:bg-teal-100 transition-colors">
                                <Building2 className="w-6 h-6 text-teal-600" />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-semibold text-gray-900 text-sm">{clinic.name}</p>
                                <p className="text-xs text-gray-500">{roleLabels[clinic.role] || clinic.role}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-teal-500 transition-colors" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

import { ArrowRight } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PatientSummary {
  id: string;
  name: string;
}

interface RecentPatientsBannerProps {
  count: number;
  patients: PatientSummary[];
}

export function RecentPatientsBanner({ count, patients }: RecentPatientsBannerProps) {
  // Display up to 5 patients visually
  const displayPatients = patients.slice(0, 5);

  return (
    <div className="flex w-full flex-col gap-6 rounded-[24px] border border-gray-100 bg-white p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-bold tracking-tight text-gray-900">
          {count} novos pacientes hoje!
        </h3>
        <p className="mt-1 text-[13px] text-gray-500">
          Envie uma mensagem de boas-vindas para todos novos pacientes.
        </p>
      </div>

      <div className="scrollbar-hide flex w-full items-center gap-4 overflow-x-auto pt-2 pb-1">
        <div className="flex items-center gap-6">
          {displayPatients.map((patient, i) => (
            <div key={patient.id || i} className="flex min-w-[60px] flex-col items-center gap-3">
              <Avatar className="h-14 w-14 border border-gray-100 shadow-sm ring-4 ring-white">
                <AvatarImage
                  src={`https://i.pravatar.cc/150?u=${patient.id || i}`}
                  alt={patient.name}
                />
                <AvatarFallback className="bg-primary/5 text-primary text-sm font-semibold">
                  {patient.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-[13px] font-medium text-gray-700">
                {patient.name.split(' ')[0]}
              </span>
            </div>
          ))}

          <div className="flex min-w-[60px] flex-col items-center gap-3">
            <button className="group flex h-14 w-14 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-400 ring-4 ring-white transition-all hover:border-gray-300 hover:bg-white hover:text-gray-900 hover:shadow-sm">
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </button>
            <span className="mt-[2px] text-[13px] font-medium text-gray-700">Ver todos</span>
          </div>
        </div>
      </div>
    </div>
  );
}

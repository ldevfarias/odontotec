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
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col gap-6 w-full">
            <div>
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">{count} novos pacientes hoje!</h3>
                <p className="text-[13px] text-gray-500 mt-1">Envie uma mensagem de boas-vindas para todos novos pacientes.</p>
            </div>

            <div className="flex items-center w-full overflow-x-auto gap-4 scrollbar-hide pt-2 pb-1">
                <div className="flex items-center gap-6">
                    {displayPatients.map((patient, i) => (
                        <div key={patient.id || i} className="flex flex-col items-center gap-3 min-w-[60px]">
                            <Avatar className="h-14 w-14 border border-gray-100 shadow-sm ring-4 ring-white">
                                <AvatarImage src={`https://i.pravatar.cc/150?u=${patient.id || i}`} alt={patient.name} />
                                <AvatarFallback className="bg-primary/5 text-primary text-sm font-semibold">{patient.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="text-[13px] font-medium text-gray-700">{patient.name.split(' ')[0]}</span>
                        </div>
                    ))}

                    <div className="flex flex-col items-center gap-3 min-w-[60px]">
                        <button className="h-14 w-14 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-300 transition-all hover:shadow-sm bg-gray-50 hover:bg-white group ring-4 ring-white">
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                        <span className="text-[13px] font-medium text-gray-700 mt-[2px]">Ver todos</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

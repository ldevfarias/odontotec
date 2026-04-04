import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RecentActivityProps {
    appointments: any[];
}

export const RecentActivity = ({ appointments }: RecentActivityProps) => {
    return (
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col w-full h-[360px]">
            <h3 className="text-[17px] font-bold text-gray-900 tracking-tight mb-8 mt-1">Agenda do dia</h3>

            <ScrollArea className="flex-1 -mr-2 pr-4">
                <div className="flex flex-col gap-8 pb-4">
                    {appointments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[180px] text-center text-gray-500 gap-2 opacity-50">
                            <span className="text-[13px] font-semibold">Nenhuma atividade hoje.</span>
                        </div>
                    ) : (
                        appointments.map((apt, i) => (
                            <div key={i} className="flex gap-4 group">
                                <Avatar className="h-11 w-11 shrink-0 border border-gray-100 shadow-sm ring-4 ring-white transition-transform group-hover:scale-110">
                                    <AvatarFallback className="text-[13px] bg-primary/10 text-primary font-bold">
                                        {apt.patient?.name?.substring(0, 2).toUpperCase() || 'PT'}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex flex-col flex-1 min-w-0 justify-center">
                                    <div className="text-[14px] leading-tight flex items-center flex-wrap gap-1">
                                        <span className="font-bold text-gray-900 group-hover:text-primary transition-colors cursor-pointer">
                                            {apt.patient?.name || 'Paciente'}
                                        </span>
                                        <span className="text-gray-500 font-medium">em Consulta de</span>
                                        <span className="font-semibold text-gray-700">{apt.dentist?.name || 'Dentista'}</span>
                                    </div>

                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                            {new Date(apt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm",
                                            apt.status === 'CONFIRMED' ? "text-emerald-500 bg-emerald-50" :
                                                apt.status === 'COMPLETED' ? "text-blue-500 bg-blue-50" :
                                                    apt.status === 'CANCELLED' ? "text-rose-500 bg-rose-50" :
                                                        "text-gray-500 bg-gray-100"
                                        )}>
                                            {apt.status === 'SCHEDULED' ? 'Agendado' : apt.status === 'CONFIRMED' ? 'Confirmado' : apt.status === 'COMPLETED' ? 'Compareceu' : apt.status === 'CANCELLED' ? 'Cancelado' : apt.status === 'ABSENT' ? 'Faltou' : apt.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};

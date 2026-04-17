import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface RecentActivityProps {
  appointments: any[];
}

export const RecentActivity = ({ appointments }: RecentActivityProps) => {
  return (
    <div className="flex h-[360px] w-full flex-col rounded-[24px] border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="mt-1 mb-8 text-[17px] font-bold tracking-tight text-gray-900">
        Agenda do dia
      </h3>

      <ScrollArea className="-mr-2 flex-1 pr-4">
        <div className="flex flex-col gap-8 pb-4">
          {appointments.length === 0 ? (
            <div className="flex h-[180px] items-center justify-center py-6 text-center text-sm text-gray-500">
              Nenhuma atividade hoje.
            </div>
          ) : (
            appointments.map((apt, i) => (
              <div key={i} className="group flex gap-4">
                <Avatar className="h-11 w-11 shrink-0 border border-gray-100 shadow-sm ring-4 ring-white transition-transform group-hover:scale-110">
                  <AvatarFallback className="bg-primary/10 text-primary text-[13px] font-bold">
                    {apt.patient?.name?.substring(0, 2).toUpperCase() || 'PT'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-1 text-[14px] leading-tight">
                    <span className="group-hover:text-primary cursor-pointer font-bold text-gray-900 transition-colors">
                      {apt.patient?.name || 'Paciente'}
                    </span>
                    <span className="font-medium text-gray-500">em Consulta de</span>
                    <span className="font-semibold text-gray-700">
                      {apt.dentist?.name || 'Dentista'}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                      {new Date(apt.date).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                    <span
                      className={cn(
                        'rounded-sm px-1.5 py-0.5 text-[10px] font-bold tracking-widest uppercase',
                        apt.status === 'CONFIRMED'
                          ? 'bg-emerald-50 text-emerald-500'
                          : apt.status === 'COMPLETED'
                            ? 'bg-blue-50 text-blue-500'
                            : apt.status === 'CANCELLED'
                              ? 'bg-rose-50 text-rose-500'
                              : 'bg-gray-100 text-gray-500',
                      )}
                    >
                      {apt.status === 'SCHEDULED'
                        ? 'Agendado'
                        : apt.status === 'CONFIRMED'
                          ? 'Confirmado'
                          : apt.status === 'COMPLETED'
                            ? 'Compareceu'
                            : apt.status === 'CANCELLED'
                              ? 'Cancelado'
                              : apt.status === 'ABSENT'
                                ? 'Faltou'
                                : apt.status}
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

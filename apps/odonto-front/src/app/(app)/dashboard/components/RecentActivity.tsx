import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface RecentActivityProps {
  appointments: unknown[];
}

interface RecentActivityItem {
  id?: string;
  date?: string;
  status?: string;
  patient?: {
    name?: string;
  };
}

const AVATAR_COLORS = [
  'bg-pink-600',
  'bg-cyan-600',
  'bg-lime-600',
  'bg-emerald-600',
  'bg-amber-600',
];

function getStatusStyle(status?: string): string {
  if (status === 'CONFIRMED') return 'bg-emerald-100 text-emerald-700';
  if (status === 'COMPLETED') return 'bg-blue-100 text-blue-700';
  if (status === 'CANCELLED') return 'bg-rose-100 text-rose-700';
  return 'bg-slate-100 text-slate-700';
}

function getStatusLabel(status?: string): string {
  if (status === 'SCHEDULED') return 'Agendado';
  if (status === 'CONFIRMED') return 'Confirmado';
  if (status === 'COMPLETED') return 'Compareceu';
  if (status === 'CANCELLED') return 'Cancelado';
  if (status === 'ABSENT') return 'Faltou';
  return status ?? 'Agendado';
}

export const RecentActivity = ({ appointments }: RecentActivityProps) => {
  const items = appointments as RecentActivityItem[];

  return (
    <div className="flex h-full w-full flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="mb-5 text-[24px] leading-none font-extrabold tracking-tight text-slate-900">
        Agenda do dia
      </h3>

      <ScrollArea className="-mr-2 flex-1 pr-2">
        <div className="flex flex-col gap-5 pb-2">
          {items.length === 0 ? (
            <div className="flex h-45 items-center justify-center py-6 text-center text-sm text-gray-500">
              Nenhuma atividade hoje.
            </div>
          ) : (
            items.map((apt, i) => (
              <div key={apt.id ?? i} className="flex items-center gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback
                    className={cn(
                      'text-[12px] font-extrabold text-white',
                      AVATAR_COLORS[i % AVATAR_COLORS.length],
                    )}
                  >
                    {apt.patient?.name?.substring(0, 2).toUpperCase() || 'PT'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-[18px] leading-tight font-extrabold text-slate-900">
                    {apt.patient?.name || 'Paciente'}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-slate-400">
                      {apt.date
                        ? new Date(apt.date).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                        : '--:--'}
                    </span>
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 text-[11px] leading-none font-bold',
                        getStatusStyle(apt.status),
                      )}
                    >
                      {getStatusLabel(apt.status)}
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

'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarCheck, User } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { usePatientsControllerFindAll } from '@/generated/hooks/usePatientsControllerFindAll';
import { useUsersControllerFindAll } from '@/generated/hooks/useUsersControllerFindAll';

import { DentistCard } from './DentistCard';

export function DentistQuickBook() {
  const { user: currentUser } = useAuth();
  const { data: usersResponse } = useUsersControllerFindAll();
  const { data: patientsResponse } = usePatientsControllerFindAll();

  const users = usersResponse?.data || [];
  const allPatients = (patientsResponse?.data as unknown[]) || [];

  const allowedRoles = ['DENTIST', 'ADMIN', 'OWNER'];
  let professionals = (users as unknown[])
    .filter((u) => u.role && allowedRoles.includes(u.role.toUpperCase()))
    .sort((a, b) => {
      const roleA = a.role.toUpperCase();
      const roleB = b.role.toUpperCase();
      const priority = (role: string) => (role === 'OWNER' ? 0 : role === 'ADMIN' ? 1 : 2);
      return priority(roleA) - priority(roleB);
    });

  if (currentUser?.role?.toUpperCase() === 'DENTIST') {
    professionals = professionals.filter((u) => u.id === currentUser.id);
  }

  const todayFormatted = format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR });

  return (
    <div className="flex w-full flex-col gap-3 rounded-[20px] border border-gray-100 bg-white px-5 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-1.5 text-[14px] font-bold tracking-tight text-gray-900">
            <CalendarCheck className="text-primary h-4 w-4" />
            Agendamento Rápido
          </h3>
          <p className="mt-0.5 text-[12px] text-gray-400">
            Clique em um profissional para agendar uma consulta para hoje &middot;{' '}
            <span className="capitalize">{todayFormatted}</span>
          </p>
        </div>
        <Badge
          variant="outline"
          className="h-5 shrink-0 rounded-full border-emerald-200 bg-emerald-50 px-2.5 text-[11px] font-semibold text-emerald-600"
        >
          {professionals.length} disponíveis
        </Badge>
      </div>

      {professionals.length === 0 ? (
        <div className="flex items-center gap-2 py-2 text-[13px] text-gray-400">
          <User className="h-4 w-4" />
          Nenhum profissional encontrado na clínica.
        </div>
      ) : (
        <TooltipProvider delayDuration={300}>
          <div className="scrollbar-hide -mx-1 flex items-center gap-5 overflow-x-auto px-1 pt-1 pb-3">
            {professionals.map((dentist: unknown) => (
              <DentistCard key={dentist.id} dentist={dentist} patients={allPatients} />
            ))}
          </div>
        </TooltipProvider>
      )}
    </div>
  );
}

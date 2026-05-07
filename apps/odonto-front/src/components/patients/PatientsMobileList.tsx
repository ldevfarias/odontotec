import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

import { DeletePatientDialog } from '@/components/patients/DeletePatientDialog';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

import { getAvatarColor, getInitials, MOBILE_PAGE_SIZE } from './patient-table-helpers';
import { Patient } from './PatientsTable';

interface PatientsMobileListProps {
  data: Patient[];
  page: number;
  totalPages: number;
  rowSelection: Record<string, boolean>;
  isAdmin: boolean;
  onPageChange: (page: number) => void;
  onToggleSelect: (id: number, e: React.MouseEvent) => void;
}

export function PatientsMobileList({
  data,
  page,
  totalPages,
  rowSelection,
  isAdmin,
  onPageChange,
  onToggleSelect,
}: PatientsMobileListProps) {
  const router = useRouter();
  const total = data.length;
  const pageData = data.slice(page * MOBILE_PAGE_SIZE, (page + 1) * MOBILE_PAGE_SIZE);

  if (pageData.length === 0) {
    return (
      <div className="text-muted-foreground py-10 text-center text-sm">
        Nenhum paciente encontrado.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="divide-border border-border bg-card flex flex-col divide-y overflow-hidden rounded-xl border">
        {pageData.map((patient) => {
          const isSelected = !!rowSelection[String(patient.id)];
          const color = getAvatarColor(patient.name);
          const nextDate = patient.nextAppointmentDate
            ? format(new Date(patient.nextAppointmentDate), "dd/MM 'às' HH:mm")
            : null;

          return (
            <div
              key={patient.id}
              className={cn(
                'active:bg-muted/50 flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors',
                isSelected && 'bg-primary/5',
              )}
              onClick={() => router.push(`/patients/${patient.id}`)}
            >
              <div onClick={(e) => onToggleSelect(patient.id, e)} className="shrink-0">
                <Checkbox checked={isSelected} onCheckedChange={() => {}} aria-label="Selecionar" />
              </div>

              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: color }}
              >
                {getInitials(patient.name)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-sm font-semibold">{patient.name}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {patient.phone || 'Sem telefone'}
                </p>
                {nextDate && (
                  <p className="text-primary truncate text-xs font-medium">Próximo: {nextDate}</p>
                )}
              </div>

              <div
                className="flex shrink-0 items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="bg-primary/5 text-primary hover:bg-primary/10 flex h-8 w-8 items-center justify-center rounded-md transition-colors"
                  onClick={() => router.push(`/patients/${patient.id}`)}
                >
                  <Eye className="h-4 w-4" />
                </button>
                {isAdmin && (
                  <DeletePatientDialog patientId={patient.id} patientName={patient.name} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-muted-foreground text-xs">
            {page * MOBILE_PAGE_SIZE + 1}–{Math.min((page + 1) * MOBILE_PAGE_SIZE, total)} de{' '}
            {total}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
              className="border-border flex h-8 w-8 items-center justify-center rounded-md border disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
              className="border-border flex h-8 w-8 items-center justify-center rounded-md border disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

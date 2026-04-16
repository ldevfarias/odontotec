import { Filter } from 'lucide-react';

export type PatientFilterOption = 'day' | 'week' | 'month' | 'upcoming';

interface PatientsFilterProps {
  value: PatientFilterOption;
  onChange: (value: PatientFilterOption) => void;
}

export function PatientsFilter({ value, onChange }: PatientsFilterProps) {
  return (
    <div className="border-border/50 mb-4 rounded-xl border bg-white p-3 shadow-md sm:mb-6 sm:p-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="hidden items-center gap-2 sm:flex">
          <div className="bg-primary/10 rounded-lg p-2">
            <Filter className="text-primary h-4 w-4" />
          </div>
          <h3 className="text-foreground text-sm font-semibold">Filtro de Visão</h3>
        </div>

        <div className="bg-muted/50 border-border/50 flex w-full overflow-x-auto rounded-lg border p-1 sm:w-auto">
          <button
            onClick={() => onChange('day')}
            className={`cursor-pointer rounded-md px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
              value === 'day'
                ? 'text-foreground ring-border/20 bg-white shadow-sm ring-1'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Dia
          </button>
          <button
            onClick={() => onChange('week')}
            className={`cursor-pointer rounded-md px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
              value === 'week'
                ? 'text-foreground ring-border/20 bg-white shadow-sm ring-1'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => onChange('month')}
            className={`cursor-pointer rounded-md px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
              value === 'month'
                ? 'text-foreground ring-border/20 bg-white shadow-sm ring-1'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Mês
          </button>

          <button
            onClick={() => onChange('upcoming')}
            className={`cursor-pointer rounded-md px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
              value === 'upcoming'
                ? 'text-foreground ring-border/20 bg-white shadow-sm ring-1'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Próximas Consultas
          </button>
        </div>
      </div>
    </div>
  );
}

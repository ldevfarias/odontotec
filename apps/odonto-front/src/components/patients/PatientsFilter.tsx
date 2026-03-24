import { Filter } from 'lucide-react';

export type PatientFilterOption = 'day' | 'week' | 'month' | 'upcoming';

interface PatientsFilterProps {
    value: PatientFilterOption;
    onChange: (value: PatientFilterOption) => void;
}

export function PatientsFilter({ value, onChange }: PatientsFilterProps) {
    return (
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md border border-border/50 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div className="hidden sm:flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Filter className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">Filtro de Visão</h3>
                </div>

                <div className="flex overflow-x-auto p-1 bg-muted/50 rounded-lg border border-border/50 w-full sm:w-auto">
                    <button
                        onClick={() => onChange('day')}
                        className={`whitespace-nowrap px-4 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${value === 'day' ? 'bg-white shadow-sm text-foreground ring-1 ring-border/20' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Dia
                    </button>
                    <button
                        onClick={() => onChange('week')}
                        className={`whitespace-nowrap px-4 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${value === 'week' ? 'bg-white shadow-sm text-foreground ring-1 ring-border/20' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Semana
                    </button>
                    <button
                        onClick={() => onChange('month')}
                        className={`whitespace-nowrap px-4 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${value === 'month' ? 'bg-white shadow-sm text-foreground ring-1 ring-border/20' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Mês
                    </button>

                    <button
                        onClick={() => onChange('upcoming')}
                        className={`whitespace-nowrap px-4 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${value === 'upcoming' ? 'bg-white shadow-sm text-foreground ring-1 ring-border/20' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Próximas Consultas
                    </button>
                </div>
            </div>
        </div>
    );
}

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarState, CalendarView } from './types';
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarHeaderProps {
    state: CalendarState;
    onStateChange: (state: Partial<CalendarState>) => void;
    onNewAppointment?: () => void;
}

export function CalendarHeader({ state, onStateChange, onNewAppointment }: CalendarHeaderProps) {
    const { currentDate, view } = state;

    const navigate = (direction: 'prev' | 'next' | 'today') => {
        if (direction === 'today') {
            onStateChange({ currentDate: new Date() });
            return;
        }

        let nextDate = new Date(currentDate);

        if (view === 'month') {
            nextDate = direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1);
        } else if (view === 'week') {
            nextDate = direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1);
        } else {
            nextDate = direction === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1);
        }

        onStateChange({ currentDate: nextDate });
    };

    const getTitle = () => {
        if (view === 'day') {
            return format(currentDate, "dd 'de' MMMM, yyyy", { locale: ptBR });
        }
        return format(currentDate, "MMMM, yyyy", { locale: ptBR });
    };

    const setView = (newView: CalendarView) => {
        onStateChange({ view: newView });
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 border-b border-border bg-white shrink-0">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => navigate('prev')} className="h-8 w-8 bg-white shadow-sm border-border/50">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate('today')} className="h-8 px-3 text-xs bg-white shadow-sm border-border/50 hover:bg-muted font-semibold">
                        Hoje
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => navigate('next')} className="h-8 w-8 bg-white shadow-sm border-border/50">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground capitalize">
                    {getTitle()}
                </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <div className="flex p-1 bg-muted/50 rounded-lg border border-border/50">
                    <button
                        onClick={() => setView('day')}
                        className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${view === 'day' ? 'bg-white shadow-sm text-foreground ring-1 ring-border/20' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Dia
                    </button>
                    <button
                        onClick={() => setView('week')}
                        className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${view === 'week' ? 'bg-white shadow-sm text-foreground ring-1 ring-border/20' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Semana
                    </button>
                    <button
                        onClick={() => setView('month')}
                        className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${view === 'month' ? 'bg-white shadow-sm text-foreground ring-1 ring-border/20' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Mês
                    </button>
                </div>

                <Button
                    className="gap-2 h-9 text-xs sm:text-sm rounded-xl"
                    onClick={onNewAppointment}
                >
                    <Plus className="h-4 w-4" />
                    Novo Agendamento
                </Button>
            </div>
        </div>
    );
}

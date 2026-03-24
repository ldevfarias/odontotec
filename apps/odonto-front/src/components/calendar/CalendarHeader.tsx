import { ChevronLeft, ChevronRight, Plus, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarState, CalendarView } from './types';
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarHeaderProps {
    state: CalendarState;
    onStateChange: (state: Partial<CalendarState>) => void;
    onNewAppointment?: () => void;
    onFilterOpen?: () => void;
}

export function CalendarHeader({ state, onStateChange, onNewAppointment, onFilterOpen }: CalendarHeaderProps) {
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
        } else if (view === 'agenda') {
            nextDate = direction === 'next' ? addDays(currentDate, 14) : subDays(currentDate, 14);
        } else {
            nextDate = direction === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1);
        }

        onStateChange({ currentDate: nextDate });
    };

    const getTitle = () => {
        if (view === 'day' || view === 'agenda') {
            return format(currentDate, "dd 'de' MMMM, yyyy", { locale: ptBR });
        }
        return format(currentDate, "MMMM, yyyy", { locale: ptBR });
    };

    const setView = (newView: CalendarView) => {
        onStateChange({ view: newView });
    };

    const mobileViews: { key: CalendarView; label: string }[] = [
        { key: 'agenda', label: 'Agenda' },
        { key: 'day', label: 'Dia' },
        { key: 'week', label: 'Semana' },
        { key: 'month', label: 'Mês' },
    ];

    return (
        <div className="flex flex-col border-b border-border bg-white shrink-0">
            {/* Mobile title row */}
            <div className="flex sm:hidden items-center justify-between px-4 pt-3 pb-1">
                <h2 className="text-lg font-bold tracking-tight text-foreground capitalize">
                    {getTitle()}
                </h2>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-white shadow-sm border-border/50"
                        onClick={onFilterOpen}
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                    <Button
                        size="icon"
                        className="h-8 w-8 rounded-xl"
                        onClick={onNewAppointment}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Mobile nav row */}
            <div className="flex sm:hidden items-center gap-2 px-4 pb-2">
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

            {/* Desktop main row */}
            <div className="hidden sm:flex items-center justify-between gap-3 px-4 py-2.5">
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
                    <h2 className="text-2xl font-bold tracking-tight text-foreground capitalize">
                        {getTitle()}
                    </h2>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex p-1 bg-muted/50 rounded-lg border border-border/50">
                        <button
                            onClick={() => setView('day')}
                            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${view === 'day' ? 'bg-white shadow-sm text-foreground ring-1 ring-border/20' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Dia
                        </button>
                        <button
                            onClick={() => setView('week')}
                            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${view === 'week' ? 'bg-white shadow-sm text-foreground ring-1 ring-border/20' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Semana
                        </button>
                        <button
                            onClick={() => setView('month')}
                            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${view === 'month' ? 'bg-white shadow-sm text-foreground ring-1 ring-border/20' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Mês
                        </button>
                    </div>

                    <Button
                        className="gap-2 h-9 text-sm rounded-xl"
                        onClick={onNewAppointment}
                    >
                        <Plus className="h-4 w-4" />
                        Novo Agendamento
                    </Button>
                </div>
            </div>

            {/* Mobile tab bar */}
            <div className="flex sm:hidden overflow-x-auto border-t border-border/50 px-2">
                {mobileViews.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setView(key)}
                        className={`shrink-0 px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
                            view === key
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
}

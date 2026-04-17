import { addDays, addMonths, addWeeks, format, subDays, subMonths, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, SlidersHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { CalendarState, CalendarView } from './types';

interface CalendarHeaderProps {
  state: CalendarState;
  onStateChange: (state: Partial<CalendarState>) => void;
  onNewAppointment?: () => void;
  onFilterOpen?: () => void;
}

export function CalendarHeader({
  state,
  onStateChange,
  onNewAppointment,
  onFilterOpen,
}: CalendarHeaderProps) {
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
    return format(currentDate, 'MMMM, yyyy', { locale: ptBR });
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
    <div className="border-border flex shrink-0 flex-col border-b bg-white">
      {/* Mobile title row */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1 sm:hidden">
        <h2 className="text-foreground text-lg font-bold tracking-tight capitalize">
          {getTitle()}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="border-border/50 h-8 w-8 bg-white shadow-sm"
            onClick={onFilterOpen}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button size="icon" className="h-8 w-8 rounded-xl" onClick={onNewAppointment}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="flex items-center gap-2 px-4 pb-2 sm:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('prev')}
          className="border-border/50 h-8 w-8 bg-white shadow-sm"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('today')}
          className="border-border/50 hover:bg-muted h-8 bg-white px-3 text-xs font-semibold shadow-sm"
        >
          Hoje
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('next')}
          className="border-border/50 h-8 w-8 bg-white shadow-sm"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Desktop main row */}
      <div className="hidden items-center justify-between gap-3 px-4 py-2.5 sm:flex">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('prev')}
              className="border-border/50 h-8 w-8 bg-white shadow-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('today')}
              className="border-border/50 hover:bg-muted h-8 bg-white px-3 text-xs font-semibold shadow-sm"
            >
              Hoje
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('next')}
              className="border-border/50 h-8 w-8 bg-white shadow-sm"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-foreground text-2xl font-bold tracking-tight capitalize">
            {getTitle()}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-muted/50 border-border/50 flex rounded-lg border p-1">
            <button
              onClick={() => setView('day')}
              className={`cursor-pointer rounded-md px-4 py-1.5 text-xs font-medium transition-all ${view === 'day' ? 'text-foreground ring-border/20 bg-white shadow-sm ring-1' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Dia
            </button>
            <button
              onClick={() => setView('week')}
              className={`cursor-pointer rounded-md px-4 py-1.5 text-xs font-medium transition-all ${view === 'week' ? 'text-foreground ring-border/20 bg-white shadow-sm ring-1' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Semana
            </button>
            <button
              onClick={() => setView('month')}
              className={`cursor-pointer rounded-md px-4 py-1.5 text-xs font-medium transition-all ${view === 'month' ? 'text-foreground ring-border/20 bg-white shadow-sm ring-1' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Mês
            </button>
          </div>

          <Button data-tour="create-appointment-btn" className="h-9 gap-2 rounded-xl text-sm" onClick={onNewAppointment}>
            <Plus className="h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Mobile tab bar */}
      <div className="border-border/50 flex overflow-x-auto border-t px-2 sm:hidden">
        {mobileViews.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`shrink-0 border-b-2 px-4 py-2 text-xs font-semibold transition-colors ${
              view === key
                ? 'border-primary text-primary'
                : 'text-muted-foreground border-transparent'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

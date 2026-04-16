import { format, isAfter, isSameDay } from 'date-fns';
import { CalendarCheck, Clock, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

import { CalendarEvent } from './types';

interface TodaySummaryProps {
  events: CalendarEvent[];
  currentDate: Date;
}

export function TodaySummary({ events, currentDate }: TodaySummaryProps) {
  const stats = useMemo(() => {
    const today = new Date();
    const todayEvents = events.filter((e) => isSameDay(e.startTime, today));
    const total = todayEvents.length;

    // Find next upcoming event
    const now = new Date();
    const upcoming = todayEvents
      .filter((e) => isAfter(e.startTime, now))
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    const nextEvent = upcoming[0] || null;

    return { total, nextEvent, upcoming: upcoming.length };
  }, [events]);

  return (
    <div className="shrink-0 p-3">
      <div className="from-primary/5 via-primary/[0.02] border-primary/10 rounded-xl border bg-gradient-to-br to-transparent p-3">
        <div className="mb-3 flex items-center gap-2">
          <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-lg">
            <TrendingUp className="text-primary h-3.5 w-3.5" />
          </div>
          <span className="text-foreground text-xs font-semibold tracking-wide">Resumo do Dia</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Total */}
          <div className="bg-background/80 border-border/50 hover:border-primary/20 flex flex-col items-center gap-1 rounded-lg border p-2.5 text-center transition-all hover:shadow-sm">
            <div className="bg-primary/10 flex h-7 w-7 items-center justify-center rounded-full">
              <CalendarCheck className="text-primary h-3.5 w-3.5" />
            </div>
            <span className="text-foreground text-lg leading-none font-bold">{stats.total}</span>
            <span className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Consultas
            </span>
          </div>

          {/* Upcoming */}
          <div className="bg-background/80 border-border/50 hover:border-primary/20 flex flex-col items-center gap-1 rounded-lg border p-2.5 text-center transition-all hover:shadow-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10">
              <Clock className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <span className="text-foreground text-lg leading-none font-bold">{stats.upcoming}</span>
            <span className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
              Pendentes
            </span>
          </div>
        </div>

        {/* Next Appointment */}
        {stats.nextEvent && (
          <div className="bg-primary/[0.06] border-primary/10 mt-2.5 flex items-center gap-2.5 rounded-lg border px-3 py-2">
            <div className="bg-primary/15 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
              <Clock className="text-primary h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-primary mb-0.5 text-[10px] font-bold tracking-widest uppercase">
                Próximo
              </p>
              <p className="text-foreground truncate text-xs font-semibold">
                {stats.nextEvent.title}
              </p>
              <p className="text-muted-foreground text-[10px]">
                {format(stats.nextEvent.startTime, 'HH:mm')} -{' '}
                {format(stats.nextEvent.endTime, 'HH:mm')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

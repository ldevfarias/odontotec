import { CalendarCheck, Clock, TrendingUp } from 'lucide-react';
import { CalendarEvent } from './types';
import { isSameDay, format, isAfter } from 'date-fns';
import { useMemo } from 'react';

interface TodaySummaryProps {
    events: CalendarEvent[];
    currentDate: Date;
}

export function TodaySummary({ events, currentDate }: TodaySummaryProps) {
    const stats = useMemo(() => {
        const today = new Date();
        const todayEvents = events.filter(e => isSameDay(e.startTime, today));
        const total = todayEvents.length;

        // Find next upcoming event
        const now = new Date();
        const upcoming = todayEvents
            .filter(e => isAfter(e.startTime, now))
            .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

        const nextEvent = upcoming[0] || null;

        return { total, nextEvent, upcoming: upcoming.length };
    }, [events]);

    return (
        <div className="p-3 shrink-0">
            <div className="rounded-xl bg-gradient-to-br from-primary/5 via-primary/[0.02] to-transparent border border-primary/10 p-3">
                <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
                        <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-xs font-semibold text-foreground tracking-wide">Resumo do Dia</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    {/* Total */}
                    <div className="rounded-lg bg-background/80 border border-border/50 p-2.5 flex flex-col items-center text-center gap-1 transition-all hover:border-primary/20 hover:shadow-sm">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                            <CalendarCheck className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-lg font-bold text-foreground leading-none">{stats.total}</span>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Consultas</span>
                    </div>

                    {/* Upcoming */}
                    <div className="rounded-lg bg-background/80 border border-border/50 p-2.5 flex flex-col items-center text-center gap-1 transition-all hover:border-primary/20 hover:shadow-sm">
                        <div className="h-7 w-7 rounded-full bg-amber-500/10 flex items-center justify-center">
                            <Clock className="h-3.5 w-3.5 text-amber-600" />
                        </div>
                        <span className="text-lg font-bold text-foreground leading-none">{stats.upcoming}</span>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Pendentes</span>
                    </div>
                </div>

                {/* Next Appointment */}
                {stats.nextEvent && (
                    <div className="mt-2.5 rounded-lg bg-primary/[0.06] border border-primary/10 px-3 py-2 flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                            <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-0.5">Próximo</p>
                            <p className="text-xs font-semibold text-foreground truncate">{stats.nextEvent.title}</p>
                            <p className="text-[10px] text-muted-foreground">{format(stats.nextEvent.startTime, 'HH:mm')} - {format(stats.nextEvent.endTime, 'HH:mm')}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

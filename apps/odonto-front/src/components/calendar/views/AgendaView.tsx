'use client';

import { useMemo } from 'react';
import { addDays, format, isSameDay, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { CalendarEvent, EventCategory, Professional } from '../types';

interface AgendaViewProps {
    currentDate: Date;
    events: CalendarEvent[];
    categories: EventCategory[];
    professionals: Professional[];
    onEventTap?: (event: CalendarEvent) => void;
}

const statusLabels: Record<string, string> = {
    SCHEDULED: 'Agendado',
    CONFIRMED: 'Confirmado',
    CANCELLED: 'Cancelado',
    COMPLETED: 'Finalizado',
    ABSENT: 'Faltou',
};

const statusBadgeColors: Record<string, { bg: string; text: string }> = {
    SCHEDULED: { bg: 'bg-muted/20', text: 'text-muted-foreground' },
    CONFIRMED: { bg: 'bg-info/15', text: 'text-info' },
    CANCELLED: { bg: 'bg-destructive/15', text: 'text-destructive' },
    COMPLETED: { bg: 'bg-success/15', text: 'text-success' },
    ABSENT: { bg: 'bg-warning/15', text: 'text-warning-foreground' },
};

export function AgendaView({ currentDate, events, categories, professionals, onEventTap }: AgendaViewProps) {
    const days = useMemo(() => {
        const start = startOfDay(currentDate);
        return Array.from({ length: 14 }, (_, i) => addDays(start, i));
    }, [currentDate]);

    return (
        <div className="flex flex-col h-full overflow-y-auto bg-background">
            {days.map((day) => {
                const dayEvents = events
                    .filter((e) => isSameDay(e.startTime, day))
                    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

                const isPastDay = day < startOfDay(new Date()) && !isSameDay(day, new Date());
                if (isPastDay && dayEvents.length === 0) return null;

                return (
                    <div key={day.toISOString()}>
                        {/* Day header */}
                        <div className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm px-4 py-2 border-b border-border">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest capitalize">
                                {format(day, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                            </span>
                        </div>

                        {dayEvents.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-muted-foreground">
                                Nenhum agendamento
                            </div>
                        ) : (
                            <div className="flex flex-col divide-y divide-border">
                                {dayEvents.map((event) => {
                                    const category = categories.find((c) => c.id === event.categoryId);
                                    const professional = professionals.find((p) => p.id === event.professionalId);
                                    const color = category?.color || '#3b82f6';
                                    const statusLabel = statusLabels[event.status as string] || 'Agendado';
                                    const badgeColors = statusBadgeColors[event.status as string] || statusBadgeColors['SCHEDULED'];

                                    return (
                                        <button
                                            key={event.id}
                                            className="w-full text-left flex items-start gap-3 py-3 px-4 border-l-4 bg-card hover:bg-muted/30 active:bg-muted/50 transition-colors"
                                            style={{ borderLeftColor: color }}
                                            onClick={() => onEventTap?.(event)}
                                        >
                                            {/* Time */}
                                            <div className="shrink-0 w-12 text-xs font-semibold text-muted-foreground pt-0.5">
                                                {format(event.startTime, 'HH:mm')}
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-foreground capitalize truncate">
                                                    {event.patientName || event.title}
                                                </p>
                                                {event.procedureName && (
                                                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                        {event.procedureName}
                                                    </p>
                                                )}
                                                {professional && (
                                                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                        {professional.name}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Status badge */}
                                            <span
                                                className={cn(
                                                    'shrink-0 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm mt-0.5',
                                                    badgeColors.bg,
                                                    badgeColors.text
                                                )}
                                            >
                                                {statusLabel}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

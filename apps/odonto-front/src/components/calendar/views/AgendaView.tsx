'use client';

import { addDays, format, isSameDay, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useMemo } from 'react';

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

export function AgendaView({
  currentDate,
  events,
  categories,
  professionals,
  onEventTap,
}: AgendaViewProps) {
  const days = useMemo(() => {
    const start = startOfDay(currentDate);
    return Array.from({ length: 14 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  return (
    <div className="bg-background flex h-full flex-col overflow-y-auto">
      {days.map((day) => {
        const dayEvents = events
          .filter((e) => isSameDay(e.startTime, day))
          .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

        const isPastDay = day < startOfDay(new Date()) && !isSameDay(day, new Date());
        if (isPastDay && dayEvents.length === 0) return null;

        return (
          <div key={day.toISOString()}>
            {/* Day header */}
            <div className="bg-muted/80 border-border sticky top-0 z-10 border-b px-4 py-2 backdrop-blur-sm">
              <span className="text-muted-foreground text-xs font-bold tracking-widest capitalize uppercase">
                {format(day, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </span>
            </div>

            {dayEvents.length === 0 ? (
              <div className="text-muted-foreground px-4 py-3 text-sm">Nenhum agendamento</div>
            ) : (
              <div className="divide-border flex flex-col divide-y">
                {dayEvents.map((event) => {
                  const category = categories.find((c) => c.id === event.categoryId);
                  const professional = professionals.find((p) => p.id === event.professionalId);
                  const color = category?.color || '#3b82f6';
                  const statusLabel = statusLabels[event.status as string] || 'Agendado';
                  const badgeColors =
                    statusBadgeColors[event.status as string] || statusBadgeColors['SCHEDULED'];

                  return (
                    <button
                      key={event.id}
                      className="bg-card hover:bg-muted/30 active:bg-muted/50 flex w-full items-start gap-3 border-l-4 px-4 py-3 text-left transition-colors"
                      style={{ borderLeftColor: color }}
                      onClick={() => onEventTap?.(event)}
                    >
                      {/* Time */}
                      <div className="text-muted-foreground w-12 shrink-0 pt-0.5 text-xs font-semibold">
                        {format(event.startTime, 'HH:mm')}
                      </div>

                      {/* Details */}
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground truncate text-sm font-semibold capitalize">
                          {event.patientName || event.title}
                        </p>
                        {event.procedureName && (
                          <p className="text-muted-foreground mt-0.5 truncate text-xs">
                            {event.procedureName}
                          </p>
                        )}
                        {professional && (
                          <p className="text-muted-foreground mt-0.5 truncate text-xs">
                            {professional.name}
                          </p>
                        )}
                      </div>

                      {/* Status badge */}
                      <span
                        className={cn(
                          'mt-0.5 shrink-0 rounded-sm px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase',
                          badgeColors.bg,
                          badgeColors.text,
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

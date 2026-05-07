import { addDays, differenceInMinutes, format, isSameDay, startOfDay, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEffect, useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { AppointmentData, CalendarEvent, EventCategory, Professional } from '../types';
import { WeekEventCard } from './WeekEventCard';

type PositionedEvent = CalendarEvent & { leftPos: number; widthPct: number };

function packEvents(columns: CalendarEvent[][], positionedEvents: PositionedEvent[]) {
  const numColumns = columns.length;
  columns.forEach((col, colIndex) => {
    col.forEach((event) => {
      positionedEvents.push({
        ...event,
        leftPos: (colIndex / numColumns) * 100,
        widthPct: (1 / numColumns) * 100,
      });
    });
  });
}

function calculatePositions(dayEvents: CalendarEvent[]): PositionedEvent[] {
  const sortedEvents = [...dayEvents].sort((a, b) => {
    if (a.startTime.getTime() === b.startTime.getTime()) {
      return b.endTime.getTime() - a.endTime.getTime();
    }
    return a.startTime.getTime() - b.startTime.getTime();
  });

  const positionedEvents: PositionedEvent[] = [];
  const columns: CalendarEvent[][] = [];
  let lastEventEnding: Date | null = null;

  sortedEvents.forEach((event) => {
    if (lastEventEnding !== null && event.startTime >= lastEventEnding) {
      packEvents(columns, positionedEvents);
      columns.length = 0;
      lastEventEnding = null;
    }

    let placed = false;
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      if (col[col.length - 1].endTime <= event.startTime) {
        col.push(event);
        placed = true;
        break;
      }
    }
    if (!placed) columns.push([event]);

    if (lastEventEnding === null || event.endTime > lastEventEnding) {
      lastEventEnding = event.endTime;
    }
  });

  if (columns.length > 0) packEvents(columns, positionedEvents);

  return positionedEvents;
}

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  categories: EventCategory[];
  professionals: Professional[];
  onEditAppointment?: (originalAppointment: AppointmentData) => void;
  onUpdateAppointmentStatus?: (
    id: string,
    newStatus: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'ABSENT',
  ) => void;
  onEventTap?: (event: CalendarEvent) => void;
}

const START_HOUR = 7;
const END_HOUR = 19;
const HOUR_HEIGHT = 100;
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR);

export function WeekView({
  currentDate,
  events,
  categories,
  professionals,
  onEditAppointment,
  onUpdateAppointmentStatus,
  onEventTap,
}: WeekViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(new Date());

  const weekDays = useMemo(() => {
    const monday = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 6 }, (_, i) => addDays(monday, i));
  }, [currentDate]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!scrollRef.current) return;
    const currentHour = new Date().getHours();
    const scrollTarget = Math.max(0, (currentHour - START_HOUR - 1) * HOUR_HEIGHT);
    scrollRef.current.scrollTop = scrollTarget;
  }, []);

  const liveLineTop = useMemo(() => {
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const offset = nowMins - START_HOUR * 60;
    return (offset * HOUR_HEIGHT) / 60;
  }, [now]);

  const isCurrentWeek = weekDays.some((d) => isSameDay(d, now));
  const todayIndex = weekDays.findIndex((d) => isSameDay(d, now));

  useEffect(() => {
    if (!scrollRef.current || todayIndex < 0) return;
    const t = setTimeout(() => {
      const container = scrollRef.current;
      if (!container) return;
      const colWidth = container.scrollWidth / (weekDays.length + 1);
      container.scrollLeft = Math.max(0, todayIndex * colWidth - 8);
    }, 50);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-card flex h-full flex-col overflow-hidden">
      <div ref={scrollRef} className="bg-background flex-1 overflow-auto">
        <div className="relative flex min-w-max flex-col sm:min-w-0">
          {/* Header */}
          <div className="border-border bg-card sticky top-0 z-30 flex border-b">
            <div className="border-border bg-card sticky left-0 z-40 w-10 shrink-0 border-r sm:w-16" />
            <div className="flex flex-1">
              {weekDays.map((day) => {
                const isToday = isSameDay(day, now);
                return (
                  <div
                    key={day.toISOString()}
                    className="border-border bg-card flex min-w-[68px] flex-1 flex-col items-center justify-center border-r p-1 text-center sm:min-w-[120px] sm:p-2"
                  >
                    <span className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase sm:text-xs">
                      {format(day, 'EEEEE', { locale: ptBR })}
                      <span className="hidden sm:inline">
                        {format(day, 'EE', { locale: ptBR }).slice(1)}
                      </span>
                    </span>
                    <div
                      className={cn(
                        'mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold sm:h-7 sm:w-7 sm:text-sm',
                        isToday
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-foreground',
                      )}
                    >
                      {format(day, 'd')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grid */}
          <div className="relative flex flex-1">
            <div className="border-border bg-card sticky left-0 z-20 w-10 shrink-0 border-r sm:w-16">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="border-border text-muted-foreground flex items-start justify-end border-b px-1 pt-1 text-right text-[10px] font-medium sm:p-2 sm:text-xs"
                  style={{ height: `${HOUR_HEIGHT}px` }}
                >
                  {hour.toString().padStart(2, '0')}h
                </div>
              ))}
            </div>

            <div className="relative flex flex-1">
              {weekDays.map((day) => {
                const dayEvents = events.filter((e) => isSameDay(e.startTime, day));
                return (
                  <div
                    key={day.toISOString()}
                    className="border-border relative min-w-[68px] flex-1 border-r sm:min-w-[120px]"
                  >
                    {HOURS.map((hour) => (
                      <div
                        key={hour}
                        className="border-border/50 border-b"
                        style={{ height: `${HOUR_HEIGHT}px` }}
                      />
                    ))}

                    {calculatePositions(dayEvents).map((event) => {
                      const startMins = differenceInMinutes(event.startTime, startOfDay(day));
                      const endMins = differenceInMinutes(event.endTime, startOfDay(day));
                      const topMinutes = Math.max(0, startMins - START_HOUR * 60);
                      const durationMinutes = endMins - startMins;
                      const top = (topMinutes * HOUR_HEIGHT) / 60;
                      const isTiny = durationMinutes < 35;
                      const isSmall = durationMinutes < 50;
                      const minCardHeight = isTiny ? 42 : 50;
                      const height = Math.max((durationMinutes * HOUR_HEIGHT) / 60, minCardHeight);
                      const category = categories.find((c) => c.id === event.categoryId);
                      const professional = professionals.find((p) => p.id === event.professionalId);
                      const color = category?.color || '#3b82f6';

                      return (
                        <WeekEventCard
                          key={event.id}
                          event={event}
                          top={top}
                          height={height}
                          color={color}
                          professional={professional}
                          isTiny={isTiny}
                          isSmall={isSmall}
                          onEditAppointment={onEditAppointment}
                          onUpdateAppointmentStatus={onUpdateAppointmentStatus}
                          onEventTap={onEventTap}
                        />
                      );
                    })}
                  </div>
                );
              })}

              {isCurrentWeek &&
                liveLineTop > 0 &&
                liveLineTop < (END_HOUR - START_HOUR) * HOUR_HEIGHT && (
                  <div
                    className="pointer-events-none absolute right-0 left-0 z-20 flex items-center"
                    style={{ top: `${liveLineTop}px` }}
                  >
                    <div
                      className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 shadow-lg shadow-red-500/30"
                      style={{
                        left: todayIndex >= 0 ? `${(todayIndex / weekDays.length) * 100}%` : '0%',
                      }}
                    />
                    <div className="h-[2px] w-full bg-red-500 shadow-sm shadow-red-500/20" />
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

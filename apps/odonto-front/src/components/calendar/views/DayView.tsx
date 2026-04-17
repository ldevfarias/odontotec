import { differenceInMinutes, isSameDay, startOfDay } from 'date-fns';
import { Activity } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { AppointmentData, CalendarEvent, EventCategory, Professional } from '../types';
import { DayEventCard } from './DayEventCard';

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

interface DayViewProps {
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

export function DayView({
  currentDate,
  events,
  categories,
  professionals,
  onEditAppointment,
  onUpdateAppointmentStatus,
  onEventTap,
}: DayViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(new Date());

  const dayEvents = useMemo(() => {
    return events.filter((e) => isSameDay(e.startTime, currentDate));
  }, [events, currentDate]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const isToday = isSameDay(currentDate, now);

  const liveLineTop = useMemo(() => {
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const offset = nowMins - START_HOUR * 60;
    return (offset * HOUR_HEIGHT) / 60;
  }, [now]);

  return (
    <div className="bg-card flex h-full flex-col overflow-hidden">
      {/* Header (Professionals) */}
      <div className="border-border bg-card sticky top-0 z-10 flex border-b">
        <div className="border-border bg-muted/20 flex w-10 shrink-0 items-center justify-center border-r sm:w-16">
          <Activity className="text-muted-foreground h-4 w-4" />
        </div>
        <div className="flex flex-1 overflow-x-auto">
          {professionals.length === 0 ? (
            <div className="text-muted-foreground flex flex-1 items-center justify-center p-3 text-sm">
              Nenhum profissional selecionado
            </div>
          ) : (
            professionals.map((pro) => (
              <div
                key={pro.id}
                className="border-border bg-card flex min-w-[110px] flex-1 flex-col items-center justify-center border-r px-2 py-2 text-center sm:min-w-[150px] sm:p-3"
              >
                <div className="mb-0.5 flex items-center gap-1.5 sm:mb-1 sm:gap-2">
                  {pro.avatarUrl ? (
                    <Image
                      src={pro.avatarUrl}
                      alt={pro.name}
                      width={24}
                      height={24}
                      className="h-5 w-5 rounded-full object-cover sm:h-6 sm:w-6"
                    />
                  ) : (
                    <div className="bg-primary/10 text-primary flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold sm:h-6 sm:w-6">
                      {pro.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-foreground max-w-[70px] truncate text-xs font-semibold sm:max-w-none sm:text-sm">
                    {pro.name}
                  </span>
                </div>
                <span className="text-muted-foreground hidden text-[10px] tracking-widest uppercase sm:block">
                  {pro.role}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="bg-background relative flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="flex min-w-max sm:min-w-0">
          <div className="border-border bg-card sticky left-0 z-10 w-10 shrink-0 border-r sm:w-16">
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
            {professionals.map((pro) => {
              const proEvents = dayEvents.filter((e) => e.professionalId === pro.id);
              return (
                <div
                  key={pro.id}
                  className="border-border relative min-w-[110px] flex-1 border-r sm:min-w-[150px]"
                >
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="border-border/50 border-b"
                      style={{ height: `${HOUR_HEIGHT}px` }}
                    />
                  ))}

                  {calculatePositions(proEvents).map((event) => {
                    const startMins = differenceInMinutes(event.startTime, startOfDay(currentDate));
                    const endMins = differenceInMinutes(event.endTime, startOfDay(currentDate));
                    const topMinutes = Math.max(0, startMins - START_HOUR * 60);
                    const durationMinutes = endMins - startMins;
                    const isTiny = durationMinutes < 35;
                    const isSmall = durationMinutes < 50;
                    const top = (topMinutes * HOUR_HEIGHT) / 60;
                    const minCardHeight = isTiny ? 46 : 56;
                    const height = Math.max((durationMinutes * HOUR_HEIGHT) / 60, minCardHeight);
                    const category = categories.find((c) => c.id === event.categoryId);
                    const professional = professionals.find((p) => p.id === event.professionalId);
                    const color = category?.color || '#3b82f6';

                    return (
                      <DayEventCard
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

            {isToday && liveLineTop > 0 && (
              <div
                className="pointer-events-none absolute right-0 left-0 z-30 flex items-center"
                style={{ top: `${liveLineTop}px` }}
              >
                <div
                  className={cn(
                    'absolute left-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 shadow-lg shadow-red-500/30',
                  )}
                />
                <div className="h-[2px] w-full bg-red-500 shadow-sm shadow-red-500/20" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { useMemo } from 'react';

import { cn } from '@/lib/utils';

import { AppointmentData, CalendarEvent, EventCategory, Professional } from '../types';
import { MonthEventPill } from './MonthEventPill';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  categories: EventCategory[];
  professionals?: Professional[];
  onEditAppointment?: (appointment: AppointmentData) => void;
  onUpdateAppointmentStatus?: (
    id: string,
    newStatus: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'ABSENT',
  ) => void;
  onDayTap?: (date: Date) => void;
}

export function MonthView({
  currentDate,
  events,
  categories,
  professionals = [],
  onEditAppointment,
  onUpdateAppointmentStatus,
  onDayTap,
}: MonthViewProps) {
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  return (
    <div className="bg-background flex h-full flex-col overflow-hidden">
      <div className="border-border bg-card grid grid-cols-7 border-b">
        {[
          ['S', 'Seg'],
          ['T', 'Ter'],
          ['Q', 'Qua'],
          ['Q', 'Qui'],
          ['S', 'Sex'],
          ['S', 'Sáb'],
          ['D', 'Dom'],
        ].map(([short, full]) => (
          <div
            key={full}
            className="text-muted-foreground border-border border-r py-1.5 text-center text-[10px] font-semibold tracking-wider uppercase last:border-r-0 sm:py-2 sm:text-xs"
          >
            <span className="sm:hidden">{short}</span>
            <span className="hidden sm:inline">{full}</span>
          </div>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-7 grid-rows-5 overflow-hidden">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());
          const dayEvents = events.filter((e) => isSameDay(e.startTime, day));
          const displayEvents = dayEvents.slice(0, 3);
          const remainingEvents = dayEvents.length - 3;

          return (
            <div
              key={day.toISOString()}
              className={cn(
                'border-border hover:bg-muted/30 flex min-h-[100px] flex-col gap-1 border-r border-b p-1.5 transition-colors max-sm:min-h-[60px]',
                !isCurrentMonth && 'bg-muted/10 opacity-60',
              )}
              onClick={() => {
                if (window.matchMedia('(pointer: coarse)').matches) {
                  onDayTap?.(day);
                }
              }}
            >
              <div className="mb-1 flex items-start justify-between px-1">
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                    isToday ? 'bg-primary text-primary-foreground' : 'text-foreground',
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>

              {dayEvents.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1 px-1 sm:hidden">
                  {dayEvents.slice(0, 4).map((event) => {
                    const cat = categories.find((c) => c.id === event.categoryId);
                    return (
                      <div
                        key={event.id}
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: cat?.color || '#3b82f6' }}
                      />
                    );
                  })}
                  {dayEvents.length > 4 && (
                    <div className="bg-muted-foreground/40 h-2 w-2 shrink-0 rounded-full" />
                  )}
                </div>
              )}

              <div className="hidden flex-1 flex-col gap-1 overflow-hidden sm:flex">
                {displayEvents.map((event) => {
                  const category = categories.find((c) => c.id === event.categoryId);
                  const color = category?.color || '#3b82f6';
                  const professional = professionals.find((p) => p.id === event.professionalId);

                  return (
                    <MonthEventPill
                      key={event.id}
                      event={event}
                      color={color}
                      professional={professional}
                      onEditAppointment={onEditAppointment}
                      onUpdateAppointmentStatus={onUpdateAppointmentStatus}
                    />
                  );
                })}
                {remainingEvents > 0 && (
                  <div className="text-muted-foreground hover:text-foreground cursor-pointer px-1 text-[10px] font-medium">
                    +{remainingEvents} outros
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

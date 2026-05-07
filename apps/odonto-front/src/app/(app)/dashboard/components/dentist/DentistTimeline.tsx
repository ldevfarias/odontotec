'use client';

import { format, isSameDay } from 'date-fns';
import React from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn, safeParseISO } from '@/lib/utils';

const START_HOUR = 8;
const END_HOUR = 18;
const HOUR_HEIGHT = 72; // px per hour

type AppointmentItem = {
  id?: number;
  date?: string;
  duration?: number;
  status?: string;
  procedure?: string;
  patient?: { name?: string };
  patientName?: string;
};

interface DentistTimelineProps {
  appointments: AppointmentItem[];
  isLoading?: boolean;
  onEditAppointment?: (appointment: AppointmentItem) => void;
}

export function DentistTimeline({
  appointments,
  isLoading,
  onEditAppointment,
}: DentistTimelineProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [nowOffset, setNowOffset] = React.useState<number | null>(null);

  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

  const calcTopOffset = (date: Date): number => {
    const h = date.getHours();
    const m = date.getMinutes();
    return (h - START_HOUR + m / 60) * HOUR_HEIGHT;
  };

  const calcHeight = (durationMin: number): number => {
    return Math.max((durationMin / 60) * HOUR_HEIGHT, 28);
  };

  // Compute now line position
  React.useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      if (h >= START_HOUR && h < END_HOUR) {
        setNowOffset((h - START_HOUR + m / 60) * HOUR_HEIGHT);
      } else {
        setNowOffset(null);
      }
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  // Scroll to now on mount
  React.useEffect(() => {
    if (nowOffset !== null && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: Math.max(0, nowOffset - 120),
        behavior: 'smooth',
      });
    }
  }, [nowOffset]);

  const todayAppointments = appointments.filter((a) => {
    if (!a.date) return false;
    try {
      return isSameDay(safeParseISO(a.date), new Date());
    } catch {
      return false;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="mt-1 h-4 w-12" />
            <Skeleton className="h-14 flex-1 rounded-sm" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="custom-scrollbar relative h-[60vh] min-h-[400px] overflow-y-auto sm:h-[480px]"
    >
      <div className="relative" style={{ height: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT}px` }}>
        {/* Hour lines */}
        {hours.map((h) => (
          <div
            key={h}
            className="absolute right-0 left-0 flex items-start"
            style={{ top: `${(h - START_HOUR) * HOUR_HEIGHT}px` }}
          >
            <span className="w-14 shrink-0 pt-0.5 pr-3 text-right text-[11px] font-bold text-gray-400 select-none">
              {`${h.toString().padStart(2, '0')}:00`}
            </span>
            <div className="mt-2 flex-1 border-t border-gray-100" />
          </div>
        ))}

        {/* Now line */}
        {nowOffset !== null && (
          <div
            className="pointer-events-none absolute right-0 left-14 z-30 flex items-center"
            style={{ top: `${nowOffset}px` }}
          >
            <div className="-ml-1 h-2 w-2 rounded-full bg-red-500 shadow-sm" />
            <div className="h-[2px] flex-1 bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
            <span className="ml-1 rounded-sm bg-red-500 px-1.5 py-0.5 text-[9px] font-black tracking-wide text-white uppercase">
              Agora
            </span>
          </div>
        )}

        {/* Appointment cards */}
        {todayAppointments.map((apt) => {
          if (!apt.date) return null;
          const aptDate = safeParseISO(apt.date);
          const top = calcTopOffset(aptDate);
          const height = calcHeight(apt.duration || 30);

          const statusStyle =
            apt.status === 'COMPLETED'
              ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
              : apt.status === 'CONFIRMED'
                ? 'bg-teal-50 border-teal-400 text-teal-900'
                : apt.status === 'CANCELLED'
                  ? 'bg-rose-50 border-rose-400 text-rose-700 opacity-60'
                  : apt.status === 'ABSENT'
                    ? 'bg-gray-50 border-gray-300 text-gray-500 opacity-40'
                    : 'bg-indigo-50 border-indigo-400 text-indigo-900';

          return (
            <div
              key={apt.id}
              className="absolute right-2 left-14 z-20 cursor-pointer sm:right-4"
              style={{ top: `${top}px`, height: `${height}px` }}
              onClick={() => onEditAppointment?.(apt)}
            >
              <div
                className={cn(
                  'h-full overflow-hidden rounded-sm border-l-4 px-2.5 py-1.5 shadow-sm transition-all hover:translate-x-0.5 hover:shadow-md active:scale-[0.98]',
                  statusStyle,
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[12px] leading-tight font-black uppercase">
                    {apt.patient?.name || apt.patientName || 'Paciente'}
                  </p>
                  <span className="shrink-0 text-[10px] font-bold opacity-60">
                    {format(aptDate, 'HH:mm')}
                  </span>
                </div>
                {height >= 40 && (
                  <p className="mt-0.5 truncate text-[10px] opacity-60">
                    {apt.duration || 30} min
                    {apt.procedure ? ` · ${apt.procedure}` : ''}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {todayAppointments.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm font-medium text-gray-300">Nenhum agendamento para hoje</p>
          </div>
        )}
      </div>
    </div>
  );
}

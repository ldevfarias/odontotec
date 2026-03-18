'use client';

import React from 'react';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { safeParseISO } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const START_HOUR = 8;
const END_HOUR = 18;
const HOUR_HEIGHT = 72; // px per hour

interface DentistTimelineProps {
    appointments: any[];
    isLoading?: boolean;
    onStatusChange?: (appointment: any, status: string) => void;
    onEditAppointment?: (appointment: any) => void;
}

export function DentistTimeline({
    appointments,
    isLoading,
    onStatusChange,
    onEditAppointment,
}: DentistTimelineProps) {
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const [nowOffset, setNowOffset] = React.useState<number | null>(null);

    const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

    const calcTopOffset = (date: Date): number => {
        const h = date.getHours();
        const m = date.getMinutes();
        return ((h - START_HOUR) + m / 60) * HOUR_HEIGHT;
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
                setNowOffset(((h - START_HOUR) + m / 60) * HOUR_HEIGHT);
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

    const todayAppointments = appointments.filter(a => {
        if (!a.date) return false;
        try { return isSameDay(safeParseISO(a.date), new Date()); } catch { return false; }
    });

    if (isLoading) {
        return (
            <div className="space-y-3 p-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                        <Skeleton className="h-4 w-12 mt-1" />
                        <Skeleton className="h-14 flex-1 rounded-sm" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div
            ref={scrollRef}
            className="relative overflow-y-auto custom-scrollbar"
            style={{ height: '480px' }}
        >
            <div
                className="relative"
                style={{ height: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT}px` }}
            >
                {/* Hour lines */}
                {hours.map((h) => (
                    <div
                        key={h}
                        className="absolute left-0 right-0 flex items-start"
                        style={{ top: `${(h - START_HOUR) * HOUR_HEIGHT}px` }}
                    >
                        <span className="text-[11px] font-bold text-gray-400 w-14 shrink-0 pt-0.5 text-right pr-3 select-none">
                            {`${h.toString().padStart(2, '0')}:00`}
                        </span>
                        <div className="flex-1 border-t border-gray-100 mt-2" />
                    </div>
                ))}

                {/* Now line */}
                {nowOffset !== null && (
                    <div
                        className="absolute left-14 right-0 flex items-center z-30 pointer-events-none"
                        style={{ top: `${nowOffset}px` }}
                    >
                        <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 shadow-sm" />
                        <div className="flex-1 h-[2px] bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
                        <span className="text-[9px] font-black text-white bg-red-500 px-1.5 py-0.5 rounded-sm ml-1 uppercase tracking-wide">
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
                        apt.status === 'COMPLETED' ? 'bg-emerald-50 border-emerald-400 text-emerald-900' :
                            apt.status === 'CONFIRMED' ? 'bg-teal-50 border-teal-400 text-teal-900' :
                                apt.status === 'CANCELLED' ? 'bg-rose-50 border-rose-400 text-rose-700 opacity-60' :
                                    apt.status === 'ABSENT' ? 'bg-gray-50 border-gray-300 text-gray-500 opacity-40' :
                                        'bg-indigo-50 border-indigo-400 text-indigo-900';

                    return (
                        <div
                            key={apt.id}
                            className="absolute left-14 right-2 z-20 cursor-pointer"
                            style={{ top: `${top}px`, height: `${height}px` }}
                            onClick={() => onEditAppointment?.(apt)}
                        >
                            <div
                                className={cn(
                                    'h-full rounded-sm border-l-4 px-2.5 py-1.5 shadow-sm overflow-hidden transition-all hover:shadow-md hover:translate-x-0.5',
                                    statusStyle
                                )}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-[12px] font-black leading-tight truncate uppercase">
                                        {apt.patient?.name || apt.patientName || 'Paciente'}
                                    </p>
                                    <span className="text-[10px] font-bold opacity-60 shrink-0">
                                        {format(aptDate, 'HH:mm')}
                                    </span>
                                </div>
                                {height >= 40 && (
                                    <p className="text-[10px] opacity-60 mt-0.5 truncate">
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
                        <p className="text-sm text-gray-300 font-medium">Nenhum agendamento para hoje</p>
                    </div>
                )}
            </div>
        </div>
    );
}

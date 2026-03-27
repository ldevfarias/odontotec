import { useMemo, useRef, useEffect, useState } from 'react';
import { CalendarEvent, EventCategory, Professional } from '../types';
import { startOfWeek, addDays, format, isSameDay, differenceInMinutes, startOfDay, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Clock, Edit2, CheckCircle2, XCircle, CheckSquare, UserX } from 'lucide-react';
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from '@/components/ui/avatar';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

type PositionedEvent = CalendarEvent & { leftPos: number; widthPct: number };

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

    sortedEvents.forEach(event => {
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
        if (!placed) {
            columns.push([event]);
        }

        if (lastEventEnding === null || event.endTime > lastEventEnding) {
            lastEventEnding = event.endTime;
        }
    });

    if (columns.length > 0) {
        packEvents(columns, positionedEvents);
    }

    return positionedEvents;
}

function packEvents(columns: CalendarEvent[][], positionedEvents: PositionedEvent[]) {
    const numColumns = columns.length;
    columns.forEach((col, colIndex) => {
        col.forEach(event => {
            positionedEvents.push({
                ...event,
                leftPos: (colIndex / numColumns) * 100,
                widthPct: (1 / numColumns) * 100,
            });
        });
    });
}

interface WeekViewProps {
    currentDate: Date;
    events: CalendarEvent[];
    categories: EventCategory[];
    professionals: Professional[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onEditAppointment?: (originalAppointment: any) => void;
    onUpdateAppointmentStatus?: (id: string, newStatus: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'ABSENT') => void;
    onEventTap?: (event: CalendarEvent) => void;
}

const START_HOUR = 7;
const END_HOUR = 19;
const HOUR_HEIGHT = 100; // px per hour
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR);

export function WeekView({ currentDate, events, categories, professionals, onEditAppointment, onUpdateAppointmentStatus, onEventTap }: WeekViewProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [now, setNow] = useState(new Date());

    // Mon-Sat (6 days)
    const weekDays = useMemo(() => {
        const monday = startOfWeek(currentDate, { weekStartsOn: 1 });
        return Array.from({ length: 6 }, (_, i) => addDays(monday, i));
    }, [currentDate]);

    // Update current time every minute
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60_000);
        return () => clearInterval(timer);
    }, []);

    // Auto-scroll to current time on mount
    useEffect(() => {
        if (!scrollRef.current) return;
        const currentHour = new Date().getHours();
        const scrollTarget = Math.max(0, (currentHour - START_HOUR - 1) * HOUR_HEIGHT);
        scrollRef.current.scrollTop = scrollTarget;
    }, []);

    // Live line position
    const liveLineTop = useMemo(() => {
        const nowMins = now.getHours() * 60 + now.getMinutes();
        const offset = nowMins - START_HOUR * 60;
        return (offset * HOUR_HEIGHT) / 60;
    }, [now]);

    const isCurrentWeek = weekDays.some(d => isSameDay(d, now));
    const todayIndex = weekDays.findIndex(d => isSameDay(d, now));

    // Scroll horizontally to show today on mobile
    const headerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!scrollRef.current || todayIndex < 0) return;
        // Small delay to let layout settle
        const t = setTimeout(() => {
            const container = scrollRef.current;
            if (!container) return;
            // Each column is ~68px on mobile; scroll so today is near the start
            const colWidth = container.scrollWidth / (weekDays.length + 1); // +1 for time col
            container.scrollLeft = Math.max(0, todayIndex * colWidth - 8);
        }, 50);
        return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex flex-col h-full bg-card overflow-hidden">
            <div ref={scrollRef} className="flex-1 overflow-auto bg-background">
                <div className="flex flex-col min-w-max sm:min-w-0 relative">
                    {/* Header (Days) */}
                    <div className="flex border-b border-border bg-card z-30 sticky top-0">
                        {/* Time column spacer */}
                        <div className="w-10 sm:w-16 shrink-0 border-r border-border bg-card sticky left-0 z-40" />
                        {/* Days */}
                        <div className="flex flex-1">
                            {weekDays.map((day) => {
                                const isToday = isSameDay(day, now);
                                return (
                                    <div
                                        key={day.toISOString()}
                                        className="flex-1 min-w-[68px] sm:min-w-[120px] border-r border-border p-1 sm:p-2 text-center flex flex-col items-center justify-center bg-card"
                                    >
                                        <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                                            {format(day, 'EEEEE', { locale: ptBR })}
                                            <span className="hidden sm:inline">{format(day, 'EE', { locale: ptBR }).slice(1)}</span>
                                        </span>
                                        <div
                                            className={cn(
                                                'mt-0.5 h-6 w-6 sm:h-7 sm:w-7 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold',
                                                isToday ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground'
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
                    <div className="flex flex-1 relative">
                        {/* Times column */}
                        <div className="w-10 sm:w-16 shrink-0 border-r border-border bg-card sticky left-0 z-20">
                            {HOURS.map((hour) => (
                                <div
                                    key={hour}
                                    className="border-b border-border text-[10px] sm:text-xs text-muted-foreground px-1 sm:p-2 text-right font-medium flex items-start justify-end pt-1"
                                    style={{ height: `${HOUR_HEIGHT}px` }}
                                >
                                    {hour.toString().padStart(2, '0')}h
                                </div>
                            ))}
                        </div>

                        {/* Days columns */}
                        <div className="flex flex-1 relative">
                            {weekDays.map((day) => {
                                const dayEvents = events.filter((e) => isSameDay(e.startTime, day));

                                return (
                                    <div key={day.toISOString()} className="flex-1 min-w-[68px] sm:min-w-[120px] border-r border-border relative">
                                        {/* Grid lines */}
                                        {HOURS.map((hour) => (
                                            <div key={hour} className="border-b border-border/50" style={{ height: `${HOUR_HEIGHT}px` }} />
                                        ))}

                                        {/* Events */}
                                        {calculatePositions(dayEvents).map((event) => {
                                            const startMins = differenceInMinutes(event.startTime, startOfDay(day));
                                            const endMins = differenceInMinutes(event.endTime, startOfDay(day));
                                            const topMinutes = Math.max(0, startMins - START_HOUR * 60);
                                            const durationMinutes = endMins - startMins;
                                            const top = (topMinutes * HOUR_HEIGHT) / 60;

                                            const isSmall = durationMinutes < 50;
                                            const isTiny = durationMinutes < 35;

                                            const minCardHeight = isTiny ? 42 : 50;
                                            const height = Math.max((durationMinutes * HOUR_HEIGHT) / 60, minCardHeight);

                                            const category = categories.find((c) => c.id === event.categoryId);
                                            const professional = professionals.find((p) => p.id === event.professionalId);
                                            const color = category?.color || '#3b82f6';

                                            const statusLabels: Record<string, string> = {
                                                'SCHEDULED': 'Agendado',
                                                'CONFIRMED': 'Confirmado',
                                                'CANCELLED': 'Cancelado',
                                                'COMPLETED': 'Finalizado',
                                                'ABSENT': 'Faltou',
                                            };

                                            const statusBadgeColors: Record<string, { bg: string, text: string }> = {
                                                'SCHEDULED': { bg: 'bg-muted/20', text: 'text-muted-foreground' },
                                                'CONFIRMED': { bg: 'bg-info/15', text: 'text-info' },
                                                'CANCELLED': { bg: 'bg-destructive/15', text: 'text-destructive' },
                                                'COMPLETED': { bg: 'bg-success/15', text: 'text-success' },
                                                'ABSENT': { bg: 'bg-warning/15', text: 'text-warning-foreground' },
                                            };

                                            const statusLabel = statusLabels[event.status as string] || 'Agendado';
                                            const badgeColors = statusBadgeColors[event.status as string] || statusBadgeColors['SCHEDULED'];

                                            return (
                                                <HoverCard key={event.id} openDelay={200} closeDelay={150}>
                                                    <HoverCardTrigger asChild>
                                                        <div
                                                            className={cn(
                                                                "absolute rounded-md p-1.5 text-[10px] sm:text-xs overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer z-10 group border-l-[4px] bg-card",
                                                                isTiny ? "p-1" : "p-1.5"
                                                            )}
                                                            style={{
                                                                top: `${top}px`,
                                                                height: `${height}px`,
                                                                left: `calc(${event.leftPos}% + 2px)`,
                                                                width: `calc(${event.widthPct}% - 4px)`,
                                                                borderLeftColor: color,
                                                                boxShadow: `0 4px 6px -1px ${color}20, 0 2px 4px -1px ${color}10`,
                                                            }}
                                                            onClick={() => {
                                                                if (window.matchMedia('(pointer: coarse)').matches) {
                                                                    onEventTap?.(event);
                                                                } else {
                                                                    onEditAppointment?.(event.originalAppointment);
                                                                }
                                                            }}
                                                        >
                                                            <div className={cn("flex flex-col h-full", isTiny ? "gap-0" : "gap-0.5")}>
                                                                <div className="flex items-start justify-between gap-1 overflow-hidden">
                                                                    <div className={cn("truncate leading-tight shrink-1", isTiny ? "font-medium text-foreground/90 capitalize" : "font-bold text-foreground")} style={{ color: isTiny ? undefined : color }}>
                                                                        {isTiny ? event.patientName : (event.procedureName || event.title)}
                                                                    </div>
                                                                </div>
                                                                {!isSmall && !isTiny && (
                                                                    <div className="font-medium truncate text-foreground/90 leading-tight capitalize">
                                                                        {event.patientName}
                                                                    </div>
                                                                )}
                                                                <div className="mt-auto flex items-end justify-between gap-1">
                                                                    <div className="text-[9px] sm:text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                                                                        <span>{format(event.startTime, 'HH:mm')}{!isTiny && ` - ${format(event.endTime, 'HH:mm')}`}</span>
                                                                    </div>
                                                                    {!isTiny && (
                                                                        <div className="shrink-0 mb-[-1px]">
                                                                            <Avatar size="sm" className="size-4 sm:size-5 border shadow-sm" style={{ borderColor: `${color}40` }}>
                                                                                <AvatarImage src={professional?.avatarUrl} alt={professional?.name} />
                                                                                <AvatarFallback className="text-[7px] sm:text-[8px] bg-muted/50">
                                                                                    {professional?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                                                </AvatarFallback>
                                                                            </Avatar>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </HoverCardTrigger>

                                                    {/* --- HoverCard Content --- */}
                                                    <HoverCardContent
                                                        side="right"
                                                        className="flex p-0 min-w-[260px] max-w-[300px] shadow-xl border-border/40 overflow-hidden"
                                                        style={{ borderTopColor: color, borderTopWidth: '4px' }}
                                                    >
                                                        {/* Left Side: Details */}
                                                        <div className="flex-1 p-3 flex flex-col min-w-0">
                                                            {/* Header (Time + Category) */}
                                                            <div className="flex items-center justify-between w-full mb-2">
                                                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium shrink-0">
                                                                    <Clock className="w-3.5 h-3.5" />
                                                                    <span>{format(event.startTime, 'HH:mm')} - {format(event.endTime, 'HH:mm')}</span>
                                                                </div>
                                                                <span
                                                                    className={cn(
                                                                        "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm shrink-0 ml-2 truncate",
                                                                        badgeColors.bg,
                                                                        badgeColors.text
                                                                    )}
                                                                >
                                                                    {statusLabel}
                                                                </span>
                                                            </div>

                                                            {/* Patient Name */}
                                                            <div className="font-semibold text-sm text-foreground capitalize tracking-tight mb-3 truncate">
                                                                {event.patientName || 'Paciente não especificado'}
                                                            </div>

                                                            {/* Notes */}
                                                            {event.description && (
                                                                <div className="text-xs text-muted-foreground mb-3 leading-relaxed opacity-90 line-clamp-2">
                                                                    {event.description}
                                                                </div>
                                                            )}

                                                            {/* Footer - Dentist */}
                                                            <div className="flex items-center gap-2 mt-auto pt-1">
                                                                <Avatar className="w-5 h-5 border shadow-sm shrink-0">
                                                                    <AvatarImage src={professional?.avatarUrl} />
                                                                    <AvatarFallback className="text-[9px] bg-muted uppercase">{professional?.name?.substring(0, 2)}</AvatarFallback>
                                                                </Avatar>
                                                                <span className="text-xs font-semibold text-foreground/90 capitalize truncate">
                                                                    Dr(a). {professional?.name}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Right Side: Actions Vertical */}
                                                        <div className="flex flex-col gap-1 p-1.5 bg-muted/30 border-l border-border/50 justify-start items-center w-10 shrink-0">
                                                            <TooltipProvider delayDuration={0}>
                                                                {!isPast(event.startTime) && (
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="w-7 h-7 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    if (onEditAppointment) onEditAppointment(event.originalAppointment);
                                                                                }}
                                                                            >
                                                                                <Edit2 className="w-3.5 h-3.5" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent side="right" className="text-xs">
                                                                            Editar
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                )}

                                                                {!isPast(event.startTime) ? (
                                                                    <>
                                                                        {event.status === 'SCHEDULED' && onUpdateAppointmentStatus && (
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="icon"
                                                                                        className="w-7 h-7 rounded-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            onUpdateAppointmentStatus(event.id, 'CONFIRMED');
                                                                                        }}
                                                                                    >
                                                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                                                    </Button>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent side="right" className="text-xs">
                                                                                    Confirmar
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        )}

                                                                        {(!event.status || event.status !== 'CANCELLED') && onUpdateAppointmentStatus && (
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="icon"
                                                                                        className="w-7 h-7 rounded-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            onUpdateAppointmentStatus(event.id, 'CANCELLED');
                                                                                        }}
                                                                                    >
                                                                                        <XCircle className="w-3.5 h-3.5" />
                                                                                    </Button>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent side="right" className="text-xs">
                                                                                    Cancelar
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {(event.status === 'SCHEDULED' || event.status === 'CONFIRMED') && onUpdateAppointmentStatus && (
                                                                            <>
                                                                                <Tooltip>
                                                                                    <TooltipTrigger asChild>
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            className="w-7 h-7 rounded-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                onUpdateAppointmentStatus(event.id, 'COMPLETED');
                                                                                            }}
                                                                                        >
                                                                                            <CheckSquare className="w-3.5 h-3.5" />
                                                                                        </Button>
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent side="right" className="text-xs">
                                                                                        Finalizar
                                                                                    </TooltipContent>
                                                                                </Tooltip>

                                                                                <Tooltip>
                                                                                    <TooltipTrigger asChild>
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            className="w-7 h-7 rounded-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                onUpdateAppointmentStatus(event.id, 'ABSENT');
                                                                                            }}
                                                                                        >
                                                                                            <UserX className="w-3.5 h-3.5" />
                                                                                        </Button>
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent side="right" className="text-xs">
                                                                                        Faltou
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            </>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </TooltipProvider>
                                                        </div>
                                                    </HoverCardContent>
                                                </HoverCard>
                                            );
                                        })}
                                    </div>
                                );
                            })}

                            {/* Red Live Line — current time indicator */}
                            {isCurrentWeek && liveLineTop > 0 && liveLineTop < (END_HOUR - START_HOUR) * HOUR_HEIGHT && (
                                <div
                                    className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                                    style={{ top: `${liveLineTop}px` }}
                                >
                                    {/* Red dot on the left edge of the today column */}
                                    <div
                                        className="absolute h-3 w-3 rounded-full bg-red-500 shadow-lg shadow-red-500/30 -translate-y-1/2 -translate-x-1/2"
                                        style={{
                                            left: todayIndex >= 0 ? `${(todayIndex / weekDays.length) * 100}%` : '0%',
                                        }}
                                    />
                                    {/* Full-width red line */}
                                    <div className="w-full h-[2px] bg-red-500 shadow-sm shadow-red-500/20" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

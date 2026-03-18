import { useMemo } from 'react';
import { CalendarEvent, EventCategory, Professional } from '../types';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, isPast } from 'date-fns';
import { cn } from '@/lib/utils';
import { Edit2, CheckCircle2, XCircle, CheckSquare, UserX, Clock, Activity } from 'lucide-react';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';

interface MonthViewProps {
    currentDate: Date;
    events: CalendarEvent[];
    categories: EventCategory[];
    professionals?: Professional[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onEditAppointment?: (appointment: any) => void;
    onUpdateAppointmentStatus?: (id: string, newStatus: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'ABSENT') => void;
}

export function MonthView({
    currentDate,
    events,
    categories,
    professionals = [],
    onEditAppointment,
    onUpdateAppointmentStatus
}: MonthViewProps) {
    const days = useMemo(() => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

        return eachDayOfInterval({ start: startDate, end: endDate });
    }, [currentDate]);

    return (
        <div className="flex flex-col h-full bg-background overflow-hidden">
            {/* Days of week header */}
            <div className="grid grid-cols-7 border-b border-border bg-card">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider border-r border-border last:border-r-0">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-hidden">
                {days.map((day) => {
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isToday = isSameDay(day, new Date());
                    const dayEvents = events.filter((e) => isSameDay(e.startTime, day));

                    // Limit displayed events to 3
                    const displayEvents = dayEvents.slice(0, 3);
                    const remainingEvents = dayEvents.length - 3;

                    return (
                        <div
                            key={day.toISOString()}
                            className={cn(
                                'min-h-[100px] border-r border-b border-border p-1.5 flex flex-col gap-1 transition-colors hover:bg-muted/30',
                                !isCurrentMonth && 'bg-muted/10 opacity-60'
                            )}
                        >
                            <div className="flex justify-between items-start mb-1 px-1">
                                <span
                                    className={cn(
                                        'text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full',
                                        isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'
                                    )}
                                >
                                    {format(day, 'd')}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1 flex-1 overflow-hidden">
                                {displayEvents.map(event => {
                                    const category = categories.find(c => c.id === event.categoryId);
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

                                    const statusShadowMap: Record<string, string> = {
                                        'CONFIRMED': 'var(--color-info)',
                                        'COMPLETED': 'var(--color-success)',
                                        'CANCELLED': 'var(--color-destructive)',
                                        'ABSENT': 'var(--color-warning)',
                                        'SCHEDULED': color,
                                    };

                                    const statusBorderClass: Record<string, string> = {
                                        'CONFIRMED': 'border-info/40',
                                        'COMPLETED': 'border-success/40',
                                        'CANCELLED': 'border-destructive/40',
                                        'ABSENT': 'border-warning/40',
                                        'SCHEDULED': 'border-transparent',
                                    };

                                    const eventBorderClass = statusBorderClass[event.status as string] || 'border-transparent';
                                    const eventShadowColor = statusShadowMap[event.status as string] || color;
                                    const professional = professionals.find((p) => p.id === event.professionalId);


                                    return (
                                        <HoverCard key={event.id} openDelay={200} closeDelay={150}>
                                            <HoverCardTrigger asChild>
                                                <div
                                                    className={cn(
                                                        "text-[10px] px-1.5 py-1 rounded truncate relative group cursor-pointer border-[1.5px] transition-all hover:brightness-110",
                                                        eventBorderClass
                                                    )}
                                                    style={{
                                                        backgroundColor: `${color}15`,
                                                        color: color,
                                                        borderLeftWidth: '4px',
                                                        borderLeftColor: color,
                                                        boxShadow: `0 1px 3px -1px ${eventShadowColor}20`
                                                    }}
                                                >
                                                    <span className="font-semibold mr-1">{format(event.startTime, 'HH:mm')}</span>
                                                    {event.title}
                                                </div>
                                            </HoverCardTrigger>
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
                                {remainingEvents > 0 && (
                                    <div className="text-[10px] font-medium text-muted-foreground px-1 hover:text-foreground cursor-pointer">
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

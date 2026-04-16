import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isPast,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { Activity, CheckCircle2, CheckSquare, Clock, Edit2, UserX, XCircle } from 'lucide-react';
import { useMemo } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import { CalendarEvent, EventCategory, Professional } from '../types';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  categories: EventCategory[];
  professionals?: Professional[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEditAppointment?: (appointment: any) => void;
  onUpdateAppointmentStatus?: (
    id: string,
    newStatus: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'ABSENT',
  ) => void;
  onEventTap?: (event: CalendarEvent) => void;
  onDayTap?: (date: Date) => void;
}

export function MonthView({
  currentDate,
  events,
  categories,
  professionals = [],
  onEditAppointment,
  onUpdateAppointmentStatus,
  onEventTap,
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
      {/* Days of week header */}
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

      {/* Grid */}
      <div className="grid flex-1 grid-cols-7 grid-rows-5 overflow-hidden">
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

              {/* Mobile: color dots */}
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

              {/* Desktop: event pills */}
              <div className="hidden flex-1 flex-col gap-1 overflow-hidden sm:flex">
                {displayEvents.map((event) => {
                  const category = categories.find((c) => c.id === event.categoryId);
                  const color = category?.color || '#3b82f6';

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

                  const statusLabel = statusLabels[event.status as string] || 'Agendado';
                  const badgeColors =
                    statusBadgeColors[event.status as string] || statusBadgeColors['SCHEDULED'];

                  const statusShadowMap: Record<string, string> = {
                    CONFIRMED: 'var(--color-info)',
                    COMPLETED: 'var(--color-success)',
                    CANCELLED: 'var(--color-destructive)',
                    ABSENT: 'var(--color-warning)',
                    SCHEDULED: color,
                  };

                  const statusBorderClass: Record<string, string> = {
                    CONFIRMED: 'border-info/40',
                    COMPLETED: 'border-success/40',
                    CANCELLED: 'border-destructive/40',
                    ABSENT: 'border-warning/40',
                    SCHEDULED: 'border-transparent',
                  };

                  const eventBorderClass =
                    statusBorderClass[event.status as string] || 'border-transparent';
                  const eventShadowColor = statusShadowMap[event.status as string] || color;
                  const professional = professionals.find((p) => p.id === event.professionalId);

                  return (
                    <HoverCard key={event.id} openDelay={200} closeDelay={150}>
                      <HoverCardTrigger asChild>
                        <div
                          className={cn(
                            'group relative cursor-pointer truncate rounded border-[1.5px] px-1.5 py-1 text-[10px] transition-all hover:brightness-110',
                            eventBorderClass,
                          )}
                          style={{
                            backgroundColor: `${color}15`,
                            color: color,
                            borderLeftWidth: '4px',
                            borderLeftColor: color,
                            boxShadow: `0 1px 3px -1px ${eventShadowColor}20`,
                          }}
                        >
                          <span className="mr-1 font-semibold">
                            {format(event.startTime, 'HH:mm')}
                          </span>
                          {event.title}
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent
                        side="right"
                        className="border-border/40 flex max-w-[300px] min-w-[260px] overflow-hidden p-0 shadow-xl"
                        style={{ borderTopColor: color, borderTopWidth: '4px' }}
                      >
                        {/* Left Side: Details */}
                        <div className="flex min-w-0 flex-1 flex-col p-3">
                          {/* Header (Time + Category) */}
                          <div className="mb-2 flex w-full items-center justify-between">
                            <div className="text-muted-foreground flex shrink-0 items-center gap-1.5 text-[11px] font-medium">
                              <Clock className="h-3.5 w-3.5" />
                              <span>
                                {format(event.startTime, 'HH:mm')} -{' '}
                                {format(event.endTime, 'HH:mm')}
                              </span>
                            </div>
                            <span
                              className={cn(
                                'ml-2 shrink-0 truncate rounded-sm px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase',
                                badgeColors.bg,
                                badgeColors.text,
                              )}
                            >
                              {statusLabel}
                            </span>
                          </div>

                          {/* Patient Name */}
                          <div className="text-foreground mb-3 truncate text-sm font-semibold tracking-tight capitalize">
                            {event.patientName || 'Paciente não especificado'}
                          </div>

                          {/* Notes */}
                          {event.description && (
                            <div className="text-muted-foreground mb-3 line-clamp-2 text-xs leading-relaxed opacity-90">
                              {event.description}
                            </div>
                          )}

                          {/* Footer - Dentist */}
                          <div className="mt-auto flex items-center gap-2 pt-1">
                            <Avatar className="h-5 w-5 shrink-0 border shadow-sm">
                              <AvatarImage src={professional?.avatarUrl} />
                              <AvatarFallback className="bg-muted text-[9px] uppercase">
                                {professional?.name?.substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-foreground/90 truncate text-xs font-semibold capitalize">
                              Dr(a). {professional?.name}
                            </span>
                          </div>
                        </div>

                        {/* Right Side: Actions Vertical */}
                        <div className="bg-muted/30 border-border/50 flex w-10 shrink-0 flex-col items-center justify-start gap-1 border-l p-1.5">
                          <TooltipProvider delayDuration={0}>
                            {!isPast(event.startTime) && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-foreground hover:bg-muted h-7 w-7 rounded-sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (onEditAppointment)
                                        onEditAppointment(event.originalAppointment);
                                    }}
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
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
                                        className="h-7 w-7 rounded-sm text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onUpdateAppointmentStatus(event.id, 'CONFIRMED');
                                        }}
                                      >
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="text-xs">
                                      Confirmar
                                    </TooltipContent>
                                  </Tooltip>
                                )}

                                {(!event.status || event.status !== 'CANCELLED') &&
                                  onUpdateAppointmentStatus && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 rounded-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onUpdateAppointmentStatus(event.id, 'CANCELLED');
                                          }}
                                        >
                                          <XCircle className="h-3.5 w-3.5" />
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
                                {(event.status === 'SCHEDULED' || event.status === 'CONFIRMED') &&
                                  onUpdateAppointmentStatus && (
                                    <>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 rounded-sm text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onUpdateAppointmentStatus(event.id, 'COMPLETED');
                                            }}
                                          >
                                            <CheckSquare className="h-3.5 w-3.5" />
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
                                            className="h-7 w-7 rounded-sm text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onUpdateAppointmentStatus(event.id, 'ABSENT');
                                            }}
                                          >
                                            <UserX className="h-3.5 w-3.5" />
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
                  <div className="text-muted-foreground hover:text-foreground cursor-pointer px-1 text-[10px] font-medium">
                    +{remainingEvents} outros
                  </div>
                )}
              </div>
              {/* end desktop pills */}
            </div>
          );
        })}
      </div>
    </div>
  );
}

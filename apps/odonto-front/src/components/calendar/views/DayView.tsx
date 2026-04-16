import { differenceInMinutes, format, isPast, isSameDay, startOfDay } from 'date-fns';
import { Activity, CheckCircle2, CheckSquare, Clock, Edit2, UserX, XCircle } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import { CalendarEvent, EventCategory, Professional } from '../types';

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
    col.forEach((event) => {
      positionedEvents.push({
        ...event,
        leftPos: (colIndex / numColumns) * 100,
        widthPct: (1 / numColumns) * 100,
      });
    });
  });
}

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  categories: EventCategory[];
  professionals: Professional[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEditAppointment?: (originalAppointment: any) => void;
  onUpdateAppointmentStatus?: (
    id: string,
    newStatus: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'ABSENT',
  ) => void;
  onEventTap?: (event: CalendarEvent) => void;
}

const START_HOUR = 7;
const END_HOUR = 19;
const HOUR_HEIGHT = 100; // px per hour
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

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const isToday = isSameDay(currentDate, now);

  // Live line position
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
                    <img
                      src={pro.avatarUrl}
                      alt={pro.name}
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
          {/* Times column */}
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

          {/* Professional columns */}
          <div className="relative flex flex-1">
            {professionals.map((pro) => {
              const proEvents = dayEvents.filter((e) => e.professionalId === pro.id);

              return (
                <div
                  key={pro.id}
                  className="border-border relative min-w-[110px] flex-1 border-r sm:min-w-[150px]"
                >
                  {/* Grid lines */}
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="border-border/50 border-b"
                      style={{ height: `${HOUR_HEIGHT}px` }}
                    />
                  ))}

                  {/* Events */}
                  {calculatePositions(proEvents).map((event) => {
                    const startMins = differenceInMinutes(event.startTime, startOfDay(currentDate));
                    const endMins = differenceInMinutes(event.endTime, startOfDay(currentDate));

                    const topMinutes = Math.max(0, startMins - START_HOUR * 60);
                    const durationMinutes = endMins - startMins;

                    const isSmall = durationMinutes < 50;
                    const isTiny = durationMinutes < 35;

                    const top = (topMinutes * HOUR_HEIGHT) / 60;
                    const minCardHeight = isTiny ? 46 : 56;
                    const height = Math.max((durationMinutes * HOUR_HEIGHT) / 60, minCardHeight);

                    const category = categories.find((c) => c.id === event.categoryId);
                    const professional = professionals.find((p) => p.id === event.professionalId);
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

                    return (
                      <HoverCard key={event.id} openDelay={200} closeDelay={150}>
                        <HoverCardTrigger asChild>
                          <div
                            className={cn(
                              'group bg-card border-l-primary absolute z-20 cursor-pointer overflow-hidden rounded-lg border-l-[4px] p-2 text-xs transition-all hover:-translate-y-0.5 hover:shadow-xl',
                              isTiny ? 'p-1' : 'p-2',
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
                              }
                            }}
                          >
                            {/* Event Content Design */}
                            <div
                              className={cn('flex h-full flex-col', isTiny ? 'gap-0' : 'gap-0.5')}
                            >
                              <div className="flex items-start justify-between gap-2 overflow-hidden">
                                <div
                                  className={cn(
                                    'shrink-1 truncate leading-tight',
                                    isTiny
                                      ? 'text-foreground/90 font-medium capitalize'
                                      : 'text-foreground font-bold',
                                  )}
                                  style={{ color: isTiny ? undefined : color }}
                                >
                                  {isTiny ? event.patientName : event.procedureName || event.title}
                                </div>
                              </div>
                              {!isSmall && !isTiny && (
                                <div className="text-foreground/90 truncate font-medium capitalize">
                                  {event.patientName}
                                </div>
                              )}
                              <div className="mt-auto flex items-end justify-between gap-1">
                                <div className="text-muted-foreground flex items-center gap-1 text-[10px] font-medium">
                                  <span>
                                    {format(event.startTime, 'HH:mm')}
                                    {!isTiny && ` - ${format(event.endTime, 'HH:mm')}`}
                                  </span>
                                </div>
                                {!isTiny && (
                                  <div className="mb-[-1px] shrink-0">
                                    <Avatar
                                      size="sm"
                                      className="size-5 border shadow-sm"
                                      style={{ borderColor: `${color}40` }}
                                    >
                                      <AvatarImage
                                        src={professional?.avatarUrl}
                                        alt={professional?.name}
                                      />
                                      <AvatarFallback className="bg-muted/50 text-[8px]">
                                        {professional?.name
                                          .split(' ')
                                          .map((n) => n[0])
                                          .join('')
                                          .slice(0, 2)}
                                      </AvatarFallback>
                                    </Avatar>
                                  </div>
                                )}
                              </div>
                            </div>
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
                </div>
              );
            })}
            {/* Live Line */}
            {isToday && liveLineTop > 0 && (
              <div
                className="pointer-events-none absolute right-0 left-0 z-30 flex items-center"
                style={{ top: `${liveLineTop}px` }}
              >
                <div className="absolute left-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 shadow-lg shadow-red-500/30" />
                <div className="h-[2px] w-full bg-red-500 shadow-sm shadow-red-500/20" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

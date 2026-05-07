import { format, isPast } from 'date-fns';
import { CheckCircle2, CheckSquare, Clock, Edit2, UserX, XCircle } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import { AppointmentData, CalendarEvent, Professional } from '../types';

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Agendado',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
  COMPLETED: 'Finalizado',
  ABSENT: 'Faltou',
};

const STATUS_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  SCHEDULED: { bg: 'bg-muted/20', text: 'text-muted-foreground' },
  CONFIRMED: { bg: 'bg-info/15', text: 'text-info' },
  CANCELLED: { bg: 'bg-destructive/15', text: 'text-destructive' },
  COMPLETED: { bg: 'bg-success/15', text: 'text-success' },
  ABSENT: { bg: 'bg-warning/15', text: 'text-warning-foreground' },
};

const STATUS_SHADOW_MAP: Record<string, string> = {
  CONFIRMED: 'var(--color-info)',
  COMPLETED: 'var(--color-success)',
  CANCELLED: 'var(--color-destructive)',
  ABSENT: 'var(--color-warning)',
};

const STATUS_BORDER_CLASS: Record<string, string> = {
  CONFIRMED: 'border-info/40',
  COMPLETED: 'border-success/40',
  CANCELLED: 'border-destructive/40',
  ABSENT: 'border-warning/40',
  SCHEDULED: 'border-transparent',
};

interface MonthEventPillProps {
  event: CalendarEvent;
  color: string;
  professional: Professional | undefined;
  onEditAppointment?: (appointment: AppointmentData) => void;
  onUpdateAppointmentStatus?: (
    id: string,
    newStatus: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'ABSENT',
  ) => void;
}

export function MonthEventPill({
  event,
  color,
  professional,
  onEditAppointment,
  onUpdateAppointmentStatus,
}: MonthEventPillProps) {
  const statusLabel = STATUS_LABELS[event.status as string] || 'Agendado';
  const badgeColors =
    STATUS_BADGE_COLORS[event.status as string] || STATUS_BADGE_COLORS['SCHEDULED'];
  const eventBorderClass = STATUS_BORDER_CLASS[event.status as string] || 'border-transparent';
  const eventShadowColor = STATUS_SHADOW_MAP[event.status as string] || color;

  return (
    <HoverCard openDelay={200} closeDelay={150}>
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
          <span className="mr-1 font-semibold">{format(event.startTime, 'HH:mm')}</span>
          {event.title}
        </div>
      </HoverCardTrigger>

      <HoverCardContent
        side="right"
        className="border-border/40 flex max-w-[300px] min-w-[260px] overflow-hidden p-0 shadow-xl"
        style={{ borderTopColor: color, borderTopWidth: '4px' }}
      >
        <div className="flex min-w-0 flex-1 flex-col p-3">
          <div className="mb-2 flex w-full items-center justify-between">
            <div className="text-muted-foreground flex shrink-0 items-center gap-1.5 text-[11px] font-medium">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {format(event.startTime, 'HH:mm')} - {format(event.endTime, 'HH:mm')}
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

          <div className="text-foreground mb-3 truncate text-sm font-semibold tracking-tight capitalize">
            {event.patientName || 'Paciente não especificado'}
          </div>

          {event.description && (
            <div className="text-muted-foreground mb-3 line-clamp-2 text-xs leading-relaxed opacity-90">
              {event.description}
            </div>
          )}

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
                      if (onEditAppointment && event.originalAppointment)
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

                {(!event.status || event.status !== 'CANCELLED') && onUpdateAppointmentStatus && (
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
}

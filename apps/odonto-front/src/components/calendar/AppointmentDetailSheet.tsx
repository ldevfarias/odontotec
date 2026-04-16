'use client';

import { format, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle2, CheckSquare, Edit2, UserX, XCircle } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

import { AppointmentData, CalendarEvent, EventCategory, Professional } from './types';

interface AppointmentDetailSheetProps {
  event: CalendarEvent | null;
  open: boolean;
  onClose: () => void;
  categories: EventCategory[];
  professionals: Professional[];
  onEditAppointment?: (appointment: AppointmentData) => void;
  onUpdateAppointmentStatus?: (
    id: string,
    newStatus: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'ABSENT',
  ) => void;
}

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

export function AppointmentDetailSheet({
  event,
  open,
  onClose,
  categories,
  professionals,
  onEditAppointment,
  onUpdateAppointmentStatus,
}: AppointmentDetailSheetProps) {
  if (!event) return null;

  const category = categories.find((c) => c.id === event.categoryId);
  const professional = professionals.find((p) => p.id === event.professionalId);
  const color = category?.color || '#3b82f6';
  const statusLabel = statusLabels[event.status as string] || 'Agendado';
  const badgeColors = statusBadgeColors[event.status as string] || statusBadgeColors['SCHEDULED'];
  const past = isPast(event.startTime);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] overflow-y-auto rounded-t-2xl p-0 sm:hidden"
      >
        <SheetTitle className="sr-only">Detalhes do agendamento</SheetTitle>
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="bg-muted-foreground/30 h-1 w-10 rounded-full" />
        </div>

        {/* Top color bar */}
        <div className="h-1 w-full" style={{ backgroundColor: color }} />

        <div className="flex flex-col gap-4 p-4">
          {/* Time + status badge */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm font-semibold">
              {format(event.startTime, 'HH:mm')} – {format(event.endTime, 'HH:mm')}
              {' · '}
              {format(event.startTime, "EEE, dd 'de' MMM", { locale: ptBR })}
            </span>
            <span
              className={cn(
                'rounded-sm px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase',
                badgeColors.bg,
                badgeColors.text,
              )}
            >
              {statusLabel}
            </span>
          </div>

          {/* Patient + procedure */}
          <div>
            <p className="text-foreground text-lg leading-tight font-bold capitalize">
              {event.patientName || 'Paciente não especificado'}
            </p>
            {event.procedureName && (
              <p className="text-muted-foreground mt-0.5 text-sm">{event.procedureName}</p>
            )}
            {event.description && (
              <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                {event.description}
              </p>
            )}
          </div>

          {/* Professional */}
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8 shrink-0 border shadow-sm">
              <AvatarImage src={professional?.avatarUrl} />
              <AvatarFallback className="bg-muted text-xs uppercase">
                {professional?.name?.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold capitalize">{professional?.name}</p>
              <p className="text-muted-foreground text-xs">{professional?.role}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-1">
            {!past && (
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => {
                  if (event.originalAppointment) onEditAppointment?.(event.originalAppointment);
                  onClose();
                }}
              >
                <Edit2 className="h-4 w-4" />
                Editar
              </Button>
            )}

            {!past && event.status === 'SCHEDULED' && onUpdateAppointmentStatus && (
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                onClick={() => {
                  onUpdateAppointmentStatus(event.id, 'CONFIRMED');
                  onClose();
                }}
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirmar
              </Button>
            )}

            {!past &&
              (!event.status || event.status !== 'CANCELLED') &&
              onUpdateAppointmentStatus && (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    onUpdateAppointmentStatus(event.id, 'CANCELLED');
                    onClose();
                  }}
                >
                  <XCircle className="h-4 w-4" />
                  Cancelar
                </Button>
              )}

            {past &&
              (event.status === 'SCHEDULED' || event.status === 'CONFIRMED') &&
              onUpdateAppointmentStatus && (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                    onClick={() => {
                      onUpdateAppointmentStatus(event.id, 'COMPLETED');
                      onClose();
                    }}
                  >
                    <CheckSquare className="h-4 w-4" />
                    Finalizar
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 border-orange-200 text-orange-600 hover:bg-orange-50"
                    onClick={() => {
                      onUpdateAppointmentStatus(event.id, 'ABSENT');
                      onClose();
                    }}
                  >
                    <UserX className="h-4 w-4" />
                    Faltou
                  </Button>
                </>
              )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

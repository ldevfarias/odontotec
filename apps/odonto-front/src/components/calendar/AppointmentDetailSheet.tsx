'use client';

import { format, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit2, CheckCircle2, XCircle, CheckSquare, UserX } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { CalendarEvent, EventCategory, Professional } from './types';

interface AppointmentDetailSheetProps {
    event: CalendarEvent | null;
    open: boolean;
    onClose: () => void;
    categories: EventCategory[];
    professionals: Professional[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onEditAppointment?: (appointment: any) => void;
    onUpdateAppointmentStatus?: (id: string, newStatus: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'ABSENT') => void;
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
                className="sm:hidden rounded-t-2xl p-0 max-h-[85vh] overflow-y-auto"
            >
                <SheetTitle className="sr-only">Detalhes do agendamento</SheetTitle>
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
                </div>

                {/* Top color bar */}
                <div className="h-1 w-full" style={{ backgroundColor: color }} />

                <div className="p-4 flex flex-col gap-4">
                    {/* Time + status badge */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-muted-foreground">
                            {format(event.startTime, 'HH:mm')} – {format(event.endTime, 'HH:mm')}
                            {' · '}
                            {format(event.startTime, "EEE, dd 'de' MMM", { locale: ptBR })}
                        </span>
                        <span
                            className={cn(
                                'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm',
                                badgeColors.bg,
                                badgeColors.text
                            )}
                        >
                            {statusLabel}
                        </span>
                    </div>

                    {/* Patient + procedure */}
                    <div>
                        <p className="text-lg font-bold text-foreground capitalize leading-tight">
                            {event.patientName || 'Paciente não especificado'}
                        </p>
                        {event.procedureName && (
                            <p className="text-sm text-muted-foreground mt-0.5">{event.procedureName}</p>
                        )}
                        {event.description && (
                            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                                {event.description}
                            </p>
                        )}
                    </div>

                    {/* Professional */}
                    <div className="flex items-center gap-2.5">
                        <Avatar className="w-8 h-8 border shadow-sm shrink-0">
                            <AvatarImage src={professional?.avatarUrl} />
                            <AvatarFallback className="text-xs bg-muted uppercase">
                                {professional?.name?.substring(0, 2)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-semibold capitalize">{professional?.name}</p>
                            <p className="text-xs text-muted-foreground">{professional?.role}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 pt-1">
                        {!past && (
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-2"
                                onClick={() => {
                                    onEditAppointment?.(event.originalAppointment);
                                    onClose();
                                }}
                            >
                                <Edit2 className="w-4 h-4" />
                                Editar
                            </Button>
                        )}

                        {!past && event.status === 'SCHEDULED' && onUpdateAppointmentStatus && (
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                onClick={() => {
                                    onUpdateAppointmentStatus(event.id, 'CONFIRMED');
                                    onClose();
                                }}
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Confirmar
                            </Button>
                        )}

                        {!past && (!event.status || event.status !== 'CANCELLED') && onUpdateAppointmentStatus && (
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-2 text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => {
                                    onUpdateAppointmentStatus(event.id, 'CANCELLED');
                                    onClose();
                                }}
                            >
                                <XCircle className="w-4 h-4" />
                                Cancelar
                            </Button>
                        )}

                        {past && (event.status === 'SCHEDULED' || event.status === 'CONFIRMED') && onUpdateAppointmentStatus && (
                            <>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                                    onClick={() => {
                                        onUpdateAppointmentStatus(event.id, 'COMPLETED');
                                        onClose();
                                    }}
                                >
                                    <CheckSquare className="w-4 h-4" />
                                    Finalizar
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
                                    onClick={() => {
                                        onUpdateAppointmentStatus(event.id, 'ABSENT');
                                        onClose();
                                    }}
                                >
                                    <UserX className="w-4 h-4" />
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

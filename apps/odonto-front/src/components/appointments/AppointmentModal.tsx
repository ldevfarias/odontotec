'use client';

import { useState, useMemo, useEffect } from 'react';
import { analytics, EVENT_NAMES } from '@/services/analytics.service';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addMinutes, parseISO } from 'date-fns';
import {
    Plus,
    Check,
    ChevronsUpDown,
    Clock,
    User,
    CalendarIcon,
    AlertCircle
} from 'lucide-react';
import { notificationService } from '@/services/notification.service';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { createAppointmentDtoSchema } from '@/generated/zod/createAppointmentDtoSchema';
import { useQueryClient } from '@tanstack/react-query';
import { usePatientsControllerFindAll } from '@/generated/hooks/usePatientsControllerFindAll';
import { useUsersControllerFindAll } from '@/generated/hooks/useUsersControllerFindAll';
import { useAppointmentsControllerCreate } from '@/generated/hooks/useAppointmentsControllerCreate';
import { useAppointmentsControllerUpdate } from '@/generated/hooks/useAppointmentsControllerUpdate';
import { useAppointmentsControllerGetAvailableSlots } from '@/generated/hooks/useAppointmentsControllerGetAvailableSlots';

// Custom schema for the form to separate date and time for better UX
const appointmentFormSchema = z.object({
    patientId: z.number().min(1, 'Selecione o paciente'),
    dentistId: z.number().min(1, 'Selecione o dentista'),
    duration: z.number().min(15, "Duração mínima é 15 minutos").max(480, "Duração máxima é 8 horas"),
    dateOnly: z.string().min(10, 'Selecione uma data'),
    timeOnly: z.string().min(5, 'Selecione um horário'),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface AppointmentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialDate?: Date;
    appointmentToEdit?: any;
}

export function AppointmentModal({ open, onOpenChange, initialDate, appointmentToEdit }: AppointmentModalProps) {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const isDentist = user?.role === 'DENTIST';

    const [isPatientPopoverOpen, setIsPatientPopoverOpen] = useState(false);
    const [isDentistPopoverOpen, setIsDentistPopoverOpen] = useState(false);

    // Fetch data
    const { data: patients = [] } = usePatientsControllerFindAll();
    const { data: professionals = [] } = useUsersControllerFindAll();
    const { mutate: createAppointment, isPending: isCreating } = useAppointmentsControllerCreate();
    const { mutate: updateAppointment, isPending: isUpdating } = useAppointmentsControllerUpdate();

    const isPending = isCreating || isUpdating;

    const dentists = useMemo(() =>
        (professionals as any[]).filter((u: any) => u.role === 'DENTIST' || u.role === 'ADMIN'),
        [professionals]);

    const form = useForm<AppointmentFormValues>({
        resolver: zodResolver(appointmentFormSchema),
        defaultValues: {
            patientId: 0,
            dentistId: isDentist ? (user?.id ?? 0) : 0,
            duration: 30,
            dateOnly: format(initialDate || new Date(), "yyyy-MM-dd"),
            timeOnly: '',
        },
    });

    const watchDate = form.watch("dateOnly");
    const watchDentist = form.watch("dentistId");
    const watchDuration = form.watch("duration");
    const watchPatient = form.watch("patientId");

    const { data: slotsResponse, isFetching: isFetchingSlots } = useAppointmentsControllerGetAvailableSlots(
        {
            date: watchDate || format(new Date(), "yyyy-MM-dd"),
            dentistId: watchDentist || 0,
            duration: watchDuration || 30,
            patientId: watchPatient > 0 ? watchPatient : undefined,
        },
        {
            query: {
                enabled: !!watchDate && !!watchDentist && watchDentist > 0,
            }
        }
    );

    const availableSlots: string[] = Array.isArray(slotsResponse)
        ? slotsResponse
        : (slotsResponse as any)?.data || [];

    const isEditing = !!appointmentToEdit;
    const originalTime = isEditing ? format(parseISO(appointmentToEdit.date), "HH:mm") : null;

    // Inject original time into available slots if editing
    const slotsWithOriginal = useMemo(() => {
        if (!isEditing || !originalTime) return availableSlots;

        // Only inject if the currently selected date/dentist matches the original appointment's
        const originalDate = format(parseISO(appointmentToEdit.date), "yyyy-MM-dd");
        if (watchDate === originalDate && watchDentist === (appointmentToEdit.dentistId || appointmentToEdit.dentist?.id)) {
            if (!availableSlots.includes(originalTime)) {
                return [...availableSlots, originalTime].sort();
            }
        }
        return availableSlots;
    }, [availableSlots, isEditing, originalTime, watchDate, watchDentist, appointmentToEdit]);


    // Reset form when initialDate changes or modal opens
    useEffect(() => {
        if (open) {
            if (appointmentToEdit) {
                const dateObj = parseISO(appointmentToEdit.date);
                form.reset({
                    patientId: appointmentToEdit.patientId || appointmentToEdit.patient?.id || 0,
                    dentistId: appointmentToEdit.dentistId || appointmentToEdit.dentist?.id || 0,
                    duration: appointmentToEdit.duration || 30,
                    dateOnly: format(dateObj, "yyyy-MM-dd"),
                    timeOnly: format(dateObj, "HH:mm"),
                });
            } else {
                form.reset({
                    patientId: 0,
                    dentistId: isDentist ? (user?.id ?? 0) : 0,
                    duration: 30,
                    dateOnly: format(initialDate || new Date(), "yyyy-MM-dd"),
                    timeOnly: '',
                });
            }
        }
    }, [open, initialDate, isDentist, user?.id, form, appointmentToEdit]);

    async function onSubmit(values: AppointmentFormValues) {
        // Construct the full ISO date string from dateOnly and timeOnly
        const combinedDateTime = new Date(`${values.dateOnly}T${values.timeOnly}:00.000`);

        const payload = {
            patientId: values.patientId,
            duration: values.duration,
            date: combinedDateTime.toISOString(),
            // Auto-assign dentist if loged in as dentist
            dentistId: isDentist && user?.id ? user.id : values.dentistId,
        };

        const successCallback = () => {
            notificationService.success(isEditing ? 'Agendamento atualizado com sucesso!' : 'Agendamento realizado com sucesso!');
            analytics.capture(isEditing ? EVENT_NAMES.APPOINTMENT_UPDATED : EVENT_NAMES.APPOINTMENT_CREATED, {
                patient_id: payload.patientId,
                dentist_id: payload.dentistId,
                duration: payload.duration,
                date: payload.date,
            });
            onOpenChange(false);
            queryClient.invalidateQueries({ queryKey: [{ url: '/appointments' }] });
        };

        const errorCallback = (error: any) => {
            notificationService.apiError(error, `Erro ao ${isEditing ? 'atualizar' : 'realizar'} agendamento.`);
        };

        if (isEditing) {
            updateAppointment(
                { id: appointmentToEdit.id, data: payload as any },
                { onSuccess: successCallback, onError: errorCallback }
            );
        } else {
            createAppointment(
                { data: payload as any },
                { onSuccess: successCallback, onError: errorCallback }
            );
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Altere os dados do agendamento abaixo.' : 'Selecione o paciente, o profissional e o horário para agendar.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        {/* Patient Selection (Combobox) */}
                        <FormField
                            control={form.control}
                            name="patientId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Paciente</FormLabel>
                                    <Popover open={isPatientPopoverOpen} onOpenChange={setIsPatientPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "w-full justify-between rounded-xl",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value
                                                        ? (patients as any[]).find((p: any) => p.id === field.value)?.name
                                                        : "Selecionar paciente..."}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[450px] p-0" align="start">
                                            <Command>
                                                <CommandInput placeholder="Buscar paciente..." />
                                                <CommandList>
                                                    <CommandEmpty>Paciente não encontrado.</CommandEmpty>
                                                    <CommandGroup>
                                                        {(patients as any[]).map((patient: any) => (
                                                            <CommandItem
                                                                value={patient.name}
                                                                key={patient.id}
                                                                onSelect={() => {
                                                                    form.setValue("patientId", patient.id);
                                                                    setIsPatientPopoverOpen(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        patient.id === field.value ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {patient.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Professional Selection */}
                        {!isDentist && (
                            <FormField
                                control={form.control}
                                name="dentistId"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Dentista / Responsável</FormLabel>
                                        <Popover open={isDentistPopoverOpen} onOpenChange={setIsDentistPopoverOpen}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn(
                                                            "w-full justify-between rounded-xl",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value
                                                            ? dentists.find((d: any) => d.id === field.value)?.name
                                                            : "Selecionar dentista..."}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[450px] p-0" align="start">
                                                <Command>
                                                    <CommandInput placeholder="Buscar dentista..." />
                                                    <CommandList>
                                                        <CommandEmpty>Dentista não encontrado.</CommandEmpty>
                                                        <CommandGroup>
                                                            {dentists.map((dentist: any) => (
                                                                <CommandItem
                                                                    value={dentist.name}
                                                                    key={dentist.id}
                                                                    onSelect={() => {
                                                                        form.setValue("dentistId", dentist.id);
                                                                        setIsDentistPopoverOpen(false);
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            dentist.id === field.value ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {dentist.name}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            {/* Date */}
                            <FormField
                                control={form.control}
                                name="dateOnly"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col pt-2">
                                        <FormLabel>Data</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal rounded-xl",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {field.value ? format(parseISO(field.value), "dd/MM/yyyy") : <span>Selecione a data</span>}
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value ? parseISO(field.value) : undefined}
                                                    onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Duration */}
                            <FormField
                                control={form.control}
                                name="duration"
                                render={({ field }) => (
                                    <FormItem className="pt-2">
                                        <FormLabel>Duração</FormLabel>
                                        <Select
                                            onValueChange={(v) => field.onChange(parseInt(v))}
                                            defaultValue={field.value.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="rounded-xl">
                                                    <SelectValue placeholder="Selecione a duração" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="15">15 minutos</SelectItem>
                                                <SelectItem value="30">30 minutos</SelectItem>
                                                <SelectItem value="45">45 minutos</SelectItem>
                                                <SelectItem value="60">1 hora</SelectItem>
                                                <SelectItem value="90">1 hora e 30 min</SelectItem>
                                                <SelectItem value="120">2 horas</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Time Slot Select */}
                        <FormField
                            control={form.control}
                            name="timeOnly"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Horário livre
                                        {isFetchingSlots && <Clock className="inline-block ml-2 h-3 w-3 animate-spin text-muted-foreground" />}
                                    </FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={!watchDate || !watchDentist || isFetchingSlots || slotsWithOriginal.length === 0}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="rounded-xl">
                                                <SelectValue placeholder={
                                                    !watchDentist ? "Selecione o dentista" :
                                                        isFetchingSlots ? "Carregando..." :
                                                            slotsWithOriginal.length === 0 ? "Nenhum horário" :
                                                                "Selecione um horário"
                                                } />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {slotsWithOriginal.map(slot => (
                                                <SelectItem key={slot} value={slot}>
                                                    {slot}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                className="rounded-xl"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending || !form.formState.isValid || isFetchingSlots}
                                className="rounded-xl px-8"
                            >
                                {isPending ? 'Salvando...' : 'Confirmar'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>


            </DialogContent>
        </Dialog>
    );
}

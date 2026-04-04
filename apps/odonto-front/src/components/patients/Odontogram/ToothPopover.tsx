'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

import { notificationService } from '@/services/notification.service';
import { createToothObservationDtoSchema } from '@/generated/zod/createToothObservationDtoSchema';
import { useToothObservationsControllerCreate } from '@/generated/hooks/useToothObservationsControllerCreate';
import { toothObservationsControllerFindAllByPatientQueryKey } from '@/generated/hooks/useToothObservationsControllerFindAllByPatient';
import { patientsControllerFindOneQueryKey } from '@/generated/hooks/usePatientsControllerFindOne';

import { cn } from '@/lib/utils';
import { Eye } from 'lucide-react';

export type ToothFace = 'occlusal' | 'mesial' | 'distal' | 'buccal' | 'lingual';

const FACE_LABELS: { face: ToothFace; short: string; label: string }[] = [
    { face: 'occlusal', short: 'O', label: 'Oclusal' },
    { face: 'mesial',   short: 'M', label: 'Mesial' },
    { face: 'distal',   short: 'D', label: 'Distal' },
    { face: 'buccal',   short: 'V', label: 'Vestibular' },
    { face: 'lingual',  short: 'L', label: 'Lingual' },
];

type ObservationFormValues = z.infer<typeof createToothObservationDtoSchema>;

interface ToothPopoverProps {
    toothNumber: string;
    patientId: number;
    toothObservations: any[];
    children: React.ReactNode;
}

export function ToothPopover({
    toothNumber,
    patientId,
    toothObservations,
    children,
}: ToothPopoverProps) {
    const [open, setOpen] = useState(false);
    const [selectedFaces, setSelectedFaces] = useState<ToothFace[]>([]);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 640);
    }, []);

    const queryClient = useQueryClient();
    const { mutate: createObservation, isPending: isCreating } = useToothObservationsControllerCreate();

    const defaultValues: ObservationFormValues = {
        description: '',
        date: new Date().toISOString().split('T')[0],
        patientId,
        toothNumber,
        toothFaces: '',
    };

    const form = useForm<ObservationFormValues>({
        resolver: zodResolver(createToothObservationDtoSchema),
        defaultValues,
    });

    useEffect(() => {
        if (!open) {
            form.reset(defaultValues);
            setSelectedFaces([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const toggleFace = (face: ToothFace) => {
        setSelectedFaces((prev) => {
            const next = prev.includes(face) ? prev.filter((f) => f !== face) : [...prev, face];
            form.setValue('toothFaces', next.map((f) => f.charAt(0).toUpperCase()).join(','));
            return next;
        });
    };

    function onSubmit(values: ObservationFormValues) {
        const today = new Date().toISOString().split('T')[0];
        createObservation(
            { data: { ...values, date: today } },
            {
                onSuccess: () => {
                    notificationService.success('Observação registrada com sucesso!');
                    queryClient.invalidateQueries({
                        queryKey: toothObservationsControllerFindAllByPatientQueryKey(patientId),
                    });
                    queryClient.invalidateQueries({
                        queryKey: patientsControllerFindOneQueryKey(patientId),
                    });
                    form.reset(defaultValues);
                    setSelectedFaces([]);
                    setOpen(false);
                },
                onError: (error: any) => {
                    notificationService.apiError(error, 'Erro ao registrar observação.');
                },
            },
        );
    }

    const hasExistingObservations = toothObservations.length > 0;

    const formInner = (
        <>
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                        {toothNumber}
                    </div>
                    <div>
                        <p className="text-sm font-semibold leading-none">Dente {toothNumber}</p>
                        {hasExistingObservations && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                {toothObservations.length} observaç{toothObservations.length > 1 ? 'ões' : 'ão'}
                            </p>
                        )}
                    </div>
                </div>
                {hasExistingObservations && (
                    <Badge variant="secondary" className="text-[10px] font-bold">
                        <Eye className="h-3 w-3 mr-1" />
                        {toothObservations.length}
                    </Badge>
                )}
            </div>

            <Separator />

            {/* Form */}
            <div className="p-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        {/* Face selector */}
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Faces Afetadas
                            </p>
                            <div className="flex gap-1.5">
                                {FACE_LABELS.map(({ face, short, label }) => {
                                    const isActive = selectedFaces.includes(face);
                                    return (
                                        <button
                                            key={face}
                                            type="button"
                                            title={label}
                                            onClick={() => toggleFace(face)}
                                            className={cn(
                                                'flex-1 h-9 rounded-md border text-xs font-bold transition-all',
                                                isActive
                                                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                                    : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-primary hover:bg-primary/5',
                                            )}
                                        >
                                            {short}
                                        </button>
                                    );
                                })}
                            </div>
                            {selectedFaces.length > 0 && (
                                <p className="text-[10px] text-muted-foreground">
                                    Selecionadas: {selectedFaces
                                        .map((f) => FACE_LABELS.find((l) => l.face === f)?.label)
                                        .join(', ')}
                                </p>
                            )}
                        </div>

                        {/* Observação clínica */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        Observação Clínica
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Descreva a condição do dente..."
                                            className="min-h-[72px] resize-none text-sm"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full h-10 font-semibold"
                            disabled={isCreating}
                        >
                            {isCreating ? 'Salvando...' : 'Salvar Observação'}
                        </Button>
                    </form>
                </Form>
            </div>
        </>
    );

    if (isMobile) {
        return (
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <div className="inline-flex cursor-pointer">{children}</div>
                </SheetTrigger>
                <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl p-0 overflow-y-auto">
                    <SheetTitle className="sr-only">Dente {toothNumber}</SheetTitle>
                    {formInner}
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div className="inline-flex cursor-pointer">{children}</div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" side="top" sideOffset={8} align="center">
                {formInner}
            </PopoverContent>
        </Popover>
    );
}

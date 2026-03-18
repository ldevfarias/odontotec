'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { notificationService } from '@/services/notification.service';
import { createProcedureDtoSchema } from '@/generated/zod/createProcedureDtoSchema';
import { useProceduresControllerCreate } from '@/generated/hooks/useProceduresControllerCreate';
import { proceduresControllerFindAllByPatientQueryKey } from '@/generated/hooks/useProceduresControllerFindAllByPatient';
import { patientsControllerFindOneQueryKey } from '@/generated/hooks/usePatientsControllerFindOne';
import { useClinicProceduresControllerFindAll } from '@/generated/hooks/useClinicProceduresControllerFindAll';

import { cn } from '@/lib/utils';
import { Stethoscope } from 'lucide-react';

export type ToothFace = 'occlusal' | 'mesial' | 'distal' | 'buccal' | 'lingual';

const FACE_LABELS: { face: ToothFace; short: string; label: string }[] = [
    { face: 'occlusal', short: 'O', label: 'Oclusal' },
    { face: 'mesial',   short: 'M', label: 'Mesial' },
    { face: 'distal',   short: 'D', label: 'Distal' },
    { face: 'buccal',   short: 'V', label: 'Vestibular' },
    { face: 'lingual',  short: 'L', label: 'Lingual' },
];

const DEFAULT_PROCEDURE_TYPES = [
    'Restauração',
    'Extração',
    'Tratamento de Canal',
    'Limpeza / Profilaxia',
    'Aplicação de Flúor',
];

type ProcedureFormValues = z.infer<typeof createProcedureDtoSchema>;

interface ToothPopoverProps {
    toothNumber: string;
    patientId: number;
    toothProcedures: any[];
    children: React.ReactNode;
}

export function ToothPopover({
    toothNumber,
    patientId,
    toothProcedures,
    children,
}: ToothPopoverProps) {
    const [open, setOpen] = useState(false);
    const [selectedFaces, setSelectedFaces] = useState<ToothFace[]>([]);

    const queryClient = useQueryClient();
    const { data: catalog = [] } = useClinicProceduresControllerFindAll();
    const { mutate: createProcedure, isPending: isCreating } = useProceduresControllerCreate();

    const defaultValues: ProcedureFormValues = {
        description: '',
        type: '',
        date: new Date().toISOString().split('T')[0],
        patientId: patientId,
        toothNumber: toothNumber,
        toothFaces: '',
    };

    const form = useForm<ProcedureFormValues>({
        resolver: zodResolver(createProcedureDtoSchema),
        defaultValues,
    });

    // Reset form when popover closes (avoid stale state between teeth)
    useEffect(() => {
        if (!open) {
            form.reset(defaultValues);
            setSelectedFaces([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const selectedProcedureName = form.watch('type');

    const selectedCatalogItem = useMemo(
        () => (catalog as any[]).find((p: any) => p.name === selectedProcedureName),
        [catalog, selectedProcedureName]
    );

    // selectionMode derived AFTER procedure is chosen (fixes the inverted order UX bug).
    // Trusts the catalog's selectionMode configuration from the database.
    const selectionMode = useMemo<'FACE' | 'TOOTH' | 'GENERAL'>(() => {
        if (!selectedProcedureName) return 'TOOTH';

        // Use catalog's explicit selectionMode if defined
        if (selectedCatalogItem?.selectionMode) {
            return selectedCatalogItem.selectionMode;
        }

        // Fallback: default to TOOTH (no face selection) for unconfigured procedures
        return 'TOOTH';
    }, [selectedCatalogItem, selectedProcedureName]);

    // Clear faces when selectionMode changes to TOOTH
    useEffect(() => {
        if (selectionMode !== 'FACE') {
            setSelectedFaces([]);
            form.setValue('toothFaces', '');
        }
    }, [selectionMode, form]);

    const toggleFace = (face: ToothFace) => {
        setSelectedFaces(prev => {
            const next = prev.includes(face) ? prev.filter(f => f !== face) : [...prev, face];
            form.setValue('toothFaces', next.map(f => f.charAt(0).toUpperCase()).join(','));
            return next;
        });
    };

    function onSubmit(values: ProcedureFormValues) {
        const today = new Date().toISOString().split('T')[0];
        createProcedure(
            { data: { ...values, date: today } },
            {
                onSuccess: () => {
                    notificationService.success('Procedimento registrado com sucesso!');
                    queryClient.invalidateQueries({
                        queryKey: proceduresControllerFindAllByPatientQueryKey(patientId),
                    });
                    queryClient.invalidateQueries({
                        queryKey: patientsControllerFindOneQueryKey(patientId),
                    });
                    form.reset(defaultValues);
                    setSelectedFaces([]);
                    setOpen(false);
                },
                onError: (error: any) => {
                    notificationService.apiError(error, 'Erro ao registrar procedimento.');
                },
            }
        );
    }

    const hasExistingProcedures = toothProcedures.length > 0;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div className="inline-flex cursor-pointer">
                    {children}
                </div>
            </PopoverTrigger>
            <PopoverContent
                className="w-80 p-0"
                side="top"
                sideOffset={8}
                align="center"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                            {toothNumber}
                        </div>
                        <div>
                            <p className="text-sm font-semibold leading-none">Dente {toothNumber}</p>
                            {hasExistingProcedures && (
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    {toothProcedures.length} registro{toothProcedures.length > 1 ? 's' : ''}
                                </p>
                            )}
                        </div>
                    </div>
                    {hasExistingProcedures && (
                        <Badge variant="secondary" className="text-[10px] font-bold">
                            <Stethoscope className="h-3 w-3 mr-1" />
                            {toothProcedures.length}
                        </Badge>
                    )}
                </div>

                <Separator />

                {/* Form */}
                <div className="p-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                            {/* 1. Procedure Select */}
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                            Procedimento
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-10">
                                                    <SelectValue placeholder="Selecione o procedimento..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="max-h-[280px]">
                                                <SelectItem value="Dente Ausente" className="font-medium text-destructive">
                                                    Marcar como Ausente
                                                </SelectItem>
                                                <Separator className="my-1" />
                                                {(catalog as any[]).length > 0 ? (
                                                    (catalog as any[]).map((proc: any) => (
                                                        <SelectItem key={proc.id} value={proc.name}>
                                                            <div className="flex items-center justify-between w-full gap-3">
                                                                <span className="font-medium text-sm">{proc.name}</span>
                                                                {proc.baseValue && (
                                                                    <span className="text-[10px] text-muted-foreground ml-auto">
                                                                        {new Intl.NumberFormat('pt-BR', {
                                                                            style: 'currency',
                                                                            currency: 'BRL',
                                                                        }).format(Number(proc.baseValue))}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    DEFAULT_PROCEDURE_TYPES.map(type => (
                                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* 2. Face selector — conditional on FACE mode */}
                            {selectedProcedureName && selectionMode === 'FACE' && (
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
                                                            : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-primary hover:bg-primary/5'
                                                    )}
                                                >
                                                    {short}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {selectedFaces.length > 0 && (
                                        <p className="text-[10px] text-muted-foreground">
                                            Selecionadas: {selectedFaces.map(f =>
                                                FACE_LABELS.find(l => l.face === f)?.label
                                            ).join(', ')}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* 3. Observations */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                            Observações Clínicas
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Materiais, detalhes do atendimento..."
                                                className="min-h-[72px] resize-none text-sm"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* 4. Submit */}
                            <Button
                                type="submit"
                                className="w-full h-10 font-semibold"
                                disabled={isCreating || !selectedProcedureName}
                            >
                                {isCreating ? 'Registrando...' : 'Registrar Procedimento'}
                            </Button>
                        </form>
                    </Form>
                </div>
            </PopoverContent>
        </Popover>
    );
}

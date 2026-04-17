'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToothObservationsControllerCreate } from '@/generated/hooks/useToothObservationsControllerCreate';
import { toothObservationsControllerFindAllByPatientQueryKey } from '@/generated/hooks/useToothObservationsControllerFindAllByPatient';
import { createToothObservationDtoSchema } from '@/generated/zod/createToothObservationDtoSchema';
import { cn } from '@/lib/utils';
import { notificationService } from '@/services/notification.service';

export type ToothFace = 'occlusal' | 'mesial' | 'distal' | 'buccal' | 'lingual';

const FACE_LABELS: { face: ToothFace; short: string; label: string }[] = [
  { face: 'occlusal', short: 'O', label: 'Oclusal' },
  { face: 'mesial', short: 'M', label: 'Mesial' },
  { face: 'distal', short: 'D', label: 'Distal' },
  { face: 'buccal', short: 'V', label: 'Vestibular' },
  { face: 'lingual', short: 'L', label: 'Lingual' },
];

const observationFormSchema = createToothObservationDtoSchema.extend({
  description: z.string().min(1, 'A descrição da observação é obrigatória'),
});

type ObservationFormValues = z.infer<typeof observationFormSchema>;

interface ToothPopoverProps {
  toothNumber: string;
  patientId: number;
  toothObservations: unknown[];
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
  const { mutate: createObservation, isPending: isCreating } =
    useToothObservationsControllerCreate();

  const defaultValues: ObservationFormValues = {
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    patientId,
    toothNumber,
    toothFaces: '',
  };

  const form = useForm<ObservationFormValues>({
    resolver: zodResolver(observationFormSchema),
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
    const today = format(new Date(), 'yyyy-MM-dd');
    createObservation(
      { data: { ...values, date: today, toothFaces: values.toothFaces || undefined } },
      {
        onSuccess: (newObservation) => {
          notificationService.success('Observação registrada com sucesso!');
          queryClient.setQueryData(
            toothObservationsControllerFindAllByPatientQueryKey(patientId),
            (old: unknown[] = []) => [...old, newObservation],
          );
          form.reset(defaultValues);
          setSelectedFaces([]);
          setOpen(false);
        },
        onError: (error: unknown) => {
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
          <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold">
            {toothNumber}
          </div>
          <div>
            <p className="text-sm leading-none font-semibold">Dente {toothNumber}</p>
            {hasExistingObservations && (
              <p className="text-muted-foreground mt-0.5 text-[11px]">
                {toothObservations.length} observaç{toothObservations.length > 1 ? 'ões' : 'ão'}
              </p>
            )}
          </div>
        </div>
        {hasExistingObservations && (
          <Badge variant="secondary" className="text-[10px] font-bold">
            <Eye className="mr-1 h-3 w-3" />
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
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Faces Afetadas
              </p>
              <TooltipProvider delayDuration={300}>
                <div className="flex gap-1.5">
                  {FACE_LABELS.map(({ face, short, label }) => {
                    const isActive = selectedFaces.includes(face);
                    return (
                      <Tooltip key={face}>
                        <TooltipTrigger asChild onFocus={(e) => e.preventDefault()}>
                          <button
                            type="button"
                            onClick={() => toggleFace(face)}
                            className={cn(
                              'h-9 flex-1 rounded-md border text-xs font-bold transition-all',
                              isActive
                                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-primary hover:bg-primary/5',
                            )}
                          >
                            {short}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">{label}</TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </TooltipProvider>
              {selectedFaces.length > 0 && (
                <p className="text-muted-foreground text-[10px]">
                  Selecionadas:{' '}
                  {selectedFaces
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
                  <FormLabel className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
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

            <Button type="submit" className="h-10 w-full font-semibold" disabled={isCreating}>
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
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl p-0">
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

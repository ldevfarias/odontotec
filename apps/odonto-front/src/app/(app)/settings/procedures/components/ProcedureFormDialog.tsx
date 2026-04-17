'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

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
import { Textarea } from '@/components/ui/textarea';

import { type Procedure, procedureFormSchema, type ProcedureFormValues } from '../types';

interface ProcedureFormDialogProps {
  open: boolean;
  editingProcedure: Procedure | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: ProcedureFormValues) => Promise<void>;
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const formatCurrencyBRL = (value: number): string => {
  if (!Number.isFinite(value)) {
    return currencyFormatter.format(0);
  }

  return currencyFormatter.format(value);
};

const parseCurrencyInput = (value: string): number => {
  const digitsOnly = value.replace(/\D/g, '');

  if (!digitsOnly) {
    return 0;
  }

  return Number(digitsOnly) / 100;
};

const EMPTY_DEFAULT_VALUES: ProcedureFormValues = {
  name: '',
  description: '',
  baseValue: 0,
};

const toFormDefaults = (procedure: Procedure | null): ProcedureFormValues => {
  if (!procedure) {
    return EMPTY_DEFAULT_VALUES;
  }

  return {
    name: procedure.name,
    description: procedure.description ?? '',
    baseValue: Number(procedure.baseValue),
  };
};

export function ProcedureFormDialog({
  open,
  editingProcedure,
  isSubmitting,
  onClose,
  onSubmit,
}: ProcedureFormDialogProps) {
  const form = useForm<ProcedureFormValues>({
    resolver: zodResolver(procedureFormSchema),
    mode: 'onChange',
    defaultValues: EMPTY_DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset(toFormDefaults(editingProcedure));
  }, [editingProcedure, form, open]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>
            {editingProcedure ? 'Editar Procedimento' : 'Novo Procedimento'}
          </DialogTitle>
          <DialogDescription>
            Preencha os detalhes do procedimento para o catálogo.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Procedimento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Limpeza, Restauração..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="baseValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Base</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="R$ 0,00"
                      value={formatCurrencyBRL(field.value)}
                      onChange={(event) => {
                        field.onChange(parseCurrencyInput(event.target.value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detalhes técnicos..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingProcedure ? 'Salvar Alterações' : 'Criar Procedimento'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

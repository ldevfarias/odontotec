'use client';

import { Plus } from 'lucide-react';
import type { Control } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatBRL } from '@/utils/masks';

import type { ProcedureCatalogItem } from './budget-types';
import type { BudgetFormValues } from './BudgetsTab';
import { ToothCombobox } from './ToothCombobox';

interface BudgetFormCardProps {
  control: Control<BudgetFormValues>;
  catalog: ProcedureCatalogItem[];
  isSubmitDisabled: boolean;
  onSubmit: () => void;
}

export function BudgetFormCard({
  control,
  catalog,
  isSubmitDisabled,
  onSubmit,
}: BudgetFormCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Novo Orçamento
        </CardTitle>
        <CardDescription>Monte um novo orçamento selecionando os procedimentos.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField
            control={control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título do Orçamento</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Tratamento do Canal, Reabilitação Oral..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={control}
              name="procedureName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Procedimento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o procedimento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {catalog.map((proc) => (
                        <SelectItem key={proc.id} value={proc.name}>
                          {proc.name} — {formatBRL(proc.baseValue)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="toothNumber"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-end">
                  <FormLabel>Dente (Opcional)</FormLabel>
                  <FormControl>
                    <ToothCombobox value={field.value ?? ''} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            variant="secondary"
            className="w-full cursor-pointer"
            disabled={isSubmitDisabled}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar ao Carrinho
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

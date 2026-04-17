'use client';

/* eslint-disable max-lines */

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Check,
  CheckCircle2,
  ChevronsUpDown,
  Clock,
  FileText,
  Plus,
  ShoppingCart,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { BudgetsTabSkeleton } from '@/components/skeletons';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClinicProceduresControllerFindAll } from '@/generated/hooks/useClinicProceduresControllerFindAll';
import { useTreatmentPlansControllerCreate } from '@/generated/hooks/useTreatmentPlansControllerCreate';
import {
  treatmentPlansControllerFindAllQueryKey,
  useTreatmentPlansControllerFindAll,
} from '@/generated/hooks/useTreatmentPlansControllerFindAll';
import { useTreatmentPlansControllerRemove } from '@/generated/hooks/useTreatmentPlansControllerRemove';
import { useTreatmentPlansControllerUpdate } from '@/generated/hooks/useTreatmentPlansControllerUpdate';
import type { CreateTreatmentPlanDto } from '@/generated/ts/CreateTreatmentPlanDto';
import type {
  TreatmentPlanItemDto,
  TreatmentPlanItemDtoStatusEnumKey,
} from '@/generated/ts/TreatmentPlanItemDto';
import type {
  UpdateTreatmentPlanDto,
  UpdateTreatmentPlanDtoStatusEnumKey,
} from '@/generated/ts/UpdateTreatmentPlanDto';
import { cn } from '@/lib/utils';
import { notificationService } from '@/services/notification.service';
import { formatCurrencyInput, parseCurrencyInput } from '@/utils/masks';

// FDI Tooth Numbers
const ADULT_TEETH = [
  18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28, 48, 47, 46, 45, 44, 43, 42, 41,
  31, 32, 33, 34, 35, 36, 37, 38,
].sort();

const PEDIATRIC_TEETH = [
  55, 54, 53, 52, 51, 61, 62, 63, 64, 65, 85, 84, 83, 82, 81, 71, 72, 73, 74, 75,
].sort();

const budgetFormSchema = z.object({
  title: z.string().min(1, 'O título é obrigatório'),
  procedureName: z.string().min(1, 'Selecione um procedimento'),
  toothNumber: z.string().optional(),
  discount: z.number().min(0, 'Desconto não pode ser negativo'),
});

type BudgetFormValues = z.infer<typeof budgetFormSchema>;

interface CartItem {
  id: string;
  description: string;
  value: number;
  toothNumber?: number;
}

interface ProcedureCatalogItem {
  id: number;
  name: string;
  baseValue: number;
}

interface BudgetPlanItem extends Omit<TreatmentPlanItemDto, 'surface'> {
  id?: number;
}

interface BudgetPlan {
  id: number;
  patientId: number;
  createdAt: string;
  totalAmount: number;
  discount?: number;
  title?: string;
  status: UpdateTreatmentPlanDtoStatusEnumKey;
  items?: BudgetPlanItem[];
}

interface QueryDataShape<T> {
  data?: T[];
}

const extractArrayData = <T,>(response: unknown): T[] => {
  if (Array.isArray(response)) {
    return response as T[];
  }

  if (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    Array.isArray((response as QueryDataShape<T>).data)
  ) {
    return (response as QueryDataShape<T>).data ?? [];
  }

  return [];
};

interface BudgetsTabProps {
  patientId: number;
}

const STATUS_CONFIG = {
  DRAFT: { label: 'Rascunho', color: 'bg-gray-500', icon: Clock },
  APPROVED: { label: 'Aprovado', color: 'bg-blue-500', icon: CheckCircle2 },
  COMPLETED: { label: 'Finalizado', color: 'bg-green-500', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-500', icon: XCircle },
  REJECTED: { label: 'Rejeitado', color: 'bg-orange-500', icon: XCircle },
};

export function BudgetsTab({ patientId }: BudgetsTabProps) {
  'use no memo';

  const queryClient = useQueryClient();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [toothComboboxOpen, setToothComboboxOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<number | null>(null);

  // API Hooks
  const { data: catalogResponse } = useClinicProceduresControllerFindAll();
  const { data: allPlansResponse, isLoading: isLoadingPlans } =
    useTreatmentPlansControllerFindAll();
  const { mutate: createPlan, isPending: isCreating } = useTreatmentPlansControllerCreate();
  const { mutate: updatePlan, isPending: isUpdating } = useTreatmentPlansControllerUpdate();
  const { mutate: removePlan, isPending: isDeleting } = useTreatmentPlansControllerRemove();

  const catalog = useMemo<ProcedureCatalogItem[]>(() => {
    return extractArrayData<ProcedureCatalogItem>(catalogResponse);
  }, [catalogResponse]);

  const allPlans = useMemo<BudgetPlan[]>(() => {
    return extractArrayData<BudgetPlan>(allPlansResponse);
  }, [allPlansResponse]);

  const isSaving = isCreating || isUpdating;

  const patientPlans = useMemo(() => {
    return allPlans
      .filter((plan) => plan.patientId === patientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allPlans, patientId]);

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      title: '',
      procedureName: '',
      toothNumber: '',
      discount: 0,
    },
  });

  const discount = useWatch({ control: form.control, name: 'discount', defaultValue: 0 }) || 0;
  const watchTitle = useWatch({ control: form.control, name: 'title', defaultValue: '' });
  const watchProcedureName = useWatch({
    control: form.control,
    name: 'procedureName',
    defaultValue: '',
  });
  const subtotal = cart.reduce((acc, item) => acc + item.value, 0);
  const total = Math.max(0, subtotal - discount);

  const addToCart = (values: BudgetFormValues) => {
    const procedure = catalog.find((item) => item.name === values.procedureName);
    if (!procedure) return;

    const newItem: CartItem = {
      id: crypto.randomUUID(),
      description: procedure.name,
      value: Number(procedure.baseValue),
      toothNumber:
        values.toothNumber && values.toothNumber !== 'general'
          ? Number(values.toothNumber)
          : undefined,
    };

    setCart((prev) => [...prev, newItem]);
    notificationService.success('Item adicionado ao carrinho');

    // Clear fields except title
    form.setValue('procedureName', '');
    form.setValue('toothNumber', '');
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleEdit = (plan: BudgetPlan) => {
    setEditingId(plan.id);
    form.setValue('title', plan.title || '');
    form.setValue('discount', Number(plan.discount || 0));

    const newCart = (plan.items ?? []).map((item) => ({
      id: String(item.id ?? crypto.randomUUID()),
      description: item.description,
      value: Number(item.value),
      toothNumber: item.toothNumber,
    }));

    setCart(newCart);
    notificationService.info('Orçamento carregado para edição');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setCart([]);
    form.reset();
    notificationService.info('Edição cancelada');
  };

  const handleApprove = (id: number) => {
    updatePlan(
      { id, data: { status: 'APPROVED' as UpdateTreatmentPlanDtoStatusEnumKey } },
      {
        onSuccess: () => {
          notificationService.success('Orçamento aprovado!');
          queryClient.invalidateQueries({ queryKey: treatmentPlansControllerFindAllQueryKey() });
        },
      },
    );
  };

  const handleCancel = (id: number) => {
    updatePlan(
      { id, data: { status: 'CANCELLED' as UpdateTreatmentPlanDtoStatusEnumKey } },
      {
        onSuccess: () => {
          notificationService.success('Orçamento cancelado!');
          queryClient.invalidateQueries({ queryKey: treatmentPlansControllerFindAllQueryKey() });
        },
      },
    );
  };

  const handleRemove = (id: number) => {
    removePlan(
      { id },
      {
        onSuccess: () => {
          notificationService.success('Orçamento removido!');
          setPlanToDelete(null);
          queryClient.invalidateQueries({ queryKey: treatmentPlansControllerFindAllQueryKey() });
        },
      },
    );
  };

  const saveBudget = () => {
    if (cart.length === 0) {
      notificationService.error('O carrinho está vazio');
      return;
    }

    const title = form.getValues('title');
    const discount = form.getValues('discount') || 0;

    const items: TreatmentPlanItemDto[] = cart.map((item) => ({
      description: item.description,
      value: item.value,
      toothNumber: item.toothNumber,
      status: 'PLANNED' as TreatmentPlanItemDtoStatusEnumKey,
    }));

    const createPlanData: CreateTreatmentPlanDto = {
      patientId,
      dentistId: 1,
      title,
      discount,
      status: 'DRAFT',
      items,
    };

    const updatePlanData: UpdateTreatmentPlanDto = {
      patientId,
      dentistId: 1,
      title,
      discount,
      status: 'DRAFT',
      items,
    };

    if (editingId) {
      updatePlan(
        {
          id: editingId,
          data: updatePlanData,
        },
        {
          onSuccess: () => {
            notificationService.success('Orçamento atualizado com sucesso');
            setCart([]);
            form.reset();
            setEditingId(null);
            queryClient.invalidateQueries({ queryKey: treatmentPlansControllerFindAllQueryKey() });
          },
          onError: () => {
            notificationService.error('Erro ao atualizar orçamento');
          },
        },
      );
    } else {
      createPlan(
        {
          data: createPlanData,
        },
        {
          onSuccess: () => {
            notificationService.success('Orçamento criado com sucesso');
            setCart([]);
            form.reset();
            queryClient.invalidateQueries({ queryKey: treatmentPlansControllerFindAllQueryKey() });
          },
          onError: () => {
            notificationService.error('Erro ao criar orçamento');
          },
        },
      );
    }
  };

  return (
    <Form {...form}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Novo Orçamento
              </CardTitle>
              <CardDescription>
                Monte um novo orçamento selecionando os procedimentos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(addToCart)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título do Orçamento</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Tratamento do Canal, Reabilitação Oral..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
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
                                {proc.name} -{' '}
                                {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                }).format(proc.baseValue)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="toothNumber"
                    render={({ field }) => (
                      <FormItem className="flex flex-col justify-end">
                        <FormLabel>Dente (Opcional)</FormLabel>
                        <Popover open={toothComboboxOpen} onOpenChange={setToothComboboxOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={toothComboboxOpen}
                                className={cn(
                                  'border-input flex h-9 w-full items-center justify-between gap-2 border px-3 py-2 text-sm shadow-xs transition-[color,box-shadow]',
                                  'dark:bg-input/30 dark:hover:bg-input/50 focus-visible:border-ring focus-visible:ring-ring/50 bg-transparent font-normal focus-visible:ring-[3px]',
                                  'hover:text-foreground hover:bg-transparent',
                                  !field.value && 'text-muted-foreground',
                                )}
                              >
                                {field.value
                                  ? field.value === 'general'
                                    ? 'Geral (Sem dente)'
                                    : `Dente ${field.value}`
                                  : 'Selecione o dente'}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[--radix-popover-trigger-width] p-0"
                            align="start"
                          >
                            <Command
                              filter={(value, search) => {
                                if (value.includes(search)) return 1;
                                return 0;
                              }}
                            >
                              <CommandInput placeholder="Pesquisar dente..." />
                              <CommandList>
                                <CommandEmpty>Nenhum dente encontrado.</CommandEmpty>
                                <CommandGroup>
                                  <CommandItem
                                    value="general"
                                    keywords={['general', 'geral', 'sem', 'dente']}
                                    onSelect={() => {
                                      form.setValue('toothNumber', 'general');
                                      setToothComboboxOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        field.value === 'general' ? 'opacity-100' : 'opacity-0',
                                      )}
                                    />
                                    Geral (Sem dente)
                                  </CommandItem>
                                </CommandGroup>
                                <CommandGroup heading="Dentes Permanentes">
                                  {ADULT_TEETH.map((tooth) => (
                                    <CommandItem
                                      value={String(tooth)}
                                      key={tooth}
                                      keywords={[
                                        String(tooth),
                                        `dente ${tooth}`,
                                        `dente ${tooth} permanente`,
                                        'permanente',
                                      ]}
                                      onSelect={() => {
                                        form.setValue('toothNumber', String(tooth));
                                        setToothComboboxOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          'mr-2 h-4 w-4',
                                          field.value === String(tooth)
                                            ? 'opacity-100'
                                            : 'opacity-0',
                                        )}
                                      />
                                      Dente {tooth}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                                <CommandGroup heading="Dentes Decíduos">
                                  {PEDIATRIC_TEETH.map((tooth) => (
                                    <CommandItem
                                      value={String(tooth)}
                                      key={tooth}
                                      keywords={[
                                        String(tooth),
                                        `dente ${tooth}`,
                                        `dente ${tooth} decíduo`,
                                        'decíduo',
                                        'deciduo',
                                      ]}
                                      onSelect={() => {
                                        form.setValue('toothNumber', String(tooth));
                                        setToothComboboxOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          'mr-2 h-4 w-4',
                                          field.value === String(tooth)
                                            ? 'opacity-100'
                                            : 'opacity-0',
                                        )}
                                      />
                                      Dente {tooth}
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
                </div>

                <Button
                  type="submit"
                  variant="secondary"
                  className="w-full"
                  disabled={!watchTitle || !watchProcedureName}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar ao Carrinho
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Histórico de Orçamentos e Planos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-100 pr-4">
                {isLoadingPlans ? (
                  <BudgetsTabSkeleton />
                ) : patientPlans.length === 0 ? (
                  <div className="text-muted-foreground p-4 text-center italic">
                    Nenhum orçamento encontrado.
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {patientPlans.map((plan) => {
                      const config =
                        STATUS_CONFIG[plan.status as keyof typeof STATUS_CONFIG] ||
                        STATUS_CONFIG.DRAFT;
                      const StatusIcon = config.icon;
                      return (
                        <AccordionItem key={plan.id} value={`plan-${plan.id}`}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex w-full items-center justify-between pr-4">
                              <div className="flex items-center gap-2">
                                <div className={`rounded-full p-1 ${config.color} text-white`}>
                                  <StatusIcon className="h-3 w-3" />
                                </div>
                                <span className="text-left font-semibold">
                                  {plan.title || 'Orçamento'}
                                </span>
                              </div>
                              <div className="text-muted-foreground flex items-center gap-4 text-sm">
                                <span>{format(new Date(plan.createdAt), 'dd/MM/yyyy')}</span>
                                <span className="text-primary font-bold">
                                  {new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                  }).format(Number(plan.totalAmount) - Number(plan.discount || 0))}
                                </span>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 pt-2">
                              <div className="bg-muted/20 rounded-md border p-3">
                                <h5 className="text-muted-foreground mb-2 text-xs font-semibold uppercase">
                                  Itens do Orçamento
                                </h5>
                                <div className="space-y-2">
                                  {(plan.items ?? []).map((item, index) => (
                                    <div
                                      key={item.id ?? `${plan.id}-${index}`}
                                      className="flex justify-between text-sm"
                                    >
                                      <span>
                                        {item.description}{' '}
                                        {item.toothNumber && (
                                          <span className="text-muted-foreground text-xs">
                                            (Dente {item.toothNumber})
                                          </span>
                                        )}
                                      </span>
                                      <span className="font-medium">
                                        {new Intl.NumberFormat('pt-BR', {
                                          style: 'currency',
                                          currency: 'BRL',
                                        }).format(Number(item.value))}
                                      </span>
                                    </div>
                                  ))}
                                  {Number(plan.discount ?? 0) > 0 && (
                                    <div className="mt-2 flex justify-between border-t pt-2 text-sm font-medium text-red-500">
                                      <span>Desconto</span>
                                      <span>
                                        -{' '}
                                        {new Intl.NumberFormat('pt-BR', {
                                          style: 'currency',
                                          currency: 'BRL',
                                        }).format(Number(plan.discount))}
                                      </span>
                                    </div>
                                  )}
                                  <div className="text-primary mt-2 flex justify-between border-t pt-2 text-base font-bold">
                                    <span>Total Final</span>
                                    <span>
                                      {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL',
                                      }).format(
                                        Number(plan.totalAmount) - Number(plan.discount || 0),
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-end gap-2">
                                {plan.status === 'DRAFT' && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEdit(plan)}
                                    >
                                      Editar
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-green-200 text-green-600 hover:bg-green-50"
                                      onClick={() => handleApprove(plan.id)}
                                    >
                                      <CheckCircle2 className="mr-2 h-4 w-4" />
                                      Aprovar
                                    </Button>
                                  </>
                                )}
                                {(plan.status === 'APPROVED' || plan.status === 'DRAFT') && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-orange-200 text-orange-600 hover:bg-orange-50"
                                    onClick={() => handleCancel(plan.id)}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancelar
                                  </Button>
                                )}
                                {plan.status === 'DRAFT' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive hover:bg-destructive/10"
                                    onClick={() => setPlanToDelete(plan.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/40 sticky top-6 shadow-sm">
            <CardHeader className="border-border/40 mb-0 border-b pb-3">
              <CardTitle className="text-foreground/80 flex items-center gap-2 text-base font-semibold tracking-tight">
                <ShoppingCart className="text-muted-foreground h-4.5 w-4.5 stroke-[1.5]" />
                Resumo do Orçamento
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pt-3">
              {cart.length === 0 ? (
                <div className="text-muted-foreground/50 flex h-52 flex-col items-center justify-center space-y-4">
                  <ShoppingCart className="h-12 w-12 stroke-1" />
                  <p className="text-sm font-light tracking-wide">Nenhum procedimento no momento</p>
                </div>
              ) : (
                <div className="space-y-0">
                  <ScrollArea className="-mx-4 mt-0 h-80 px-4">
                    <div className="flex flex-col gap-2.5 pb-2">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="group from-card to-muted/30 border-border/40 hover:border-primary/20 relative rounded-lg border bg-linear-to-r p-3 shadow-xs transition-all hover:shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-foreground/95 truncate text-sm leading-none font-semibold">
                                {item.description}
                              </p>
                              {item.toothNumber && (
                                <div className="bg-primary/10 text-primary mt-1.5 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                                  Dente <span className="text-foreground">{item.toothNumber}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <p className="text-primary text-sm font-bold whitespace-nowrap">
                                {new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                }).format(item.value)}
                              </p>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFromCart(item.id)}
                                className="text-muted-foreground hover:bg-destructive hover:text-destructive-foreground h-7 w-7 rounded-full opacity-0 transition-all group-hover:opacity-100"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="border-border/40 mt-2 space-y-4 border-t pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground font-light">Subtotal</span>
                        <span className="text-foreground/80 font-medium">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(subtotal)}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground w-16 text-sm font-light">
                          Desconto
                        </span>
                        <FormField
                          control={form.control}
                          name="discount"
                          render={({ field }) => (
                            <FormItem className="mb-0 flex-1">
                              <FormControl>
                                <div className="relative">
                                  <span className="text-muted-foreground absolute top-2.5 left-3 text-xs font-medium">
                                    R$
                                  </span>
                                  <Input
                                    type="text"
                                    className="text-destructive/90 bg-muted/40 hover:bg-muted/60 focus-visible:border-border/50 h-9 rounded-md border-transparent pl-8 text-right text-sm font-medium shadow-none transition-all focus-visible:bg-transparent"
                                    placeholder="0,00"
                                    {...field}
                                    value={formatCurrencyInput(field.value)}
                                    onChange={(e) =>
                                      field.onChange(parseCurrencyInput(e.target.value))
                                    }
                                  />
                                </div>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="border-border/40 mt-5 flex items-baseline justify-between border-t pt-5">
                        <span className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                          Total
                        </span>
                        <div className="text-right">
                          <p className="text-primary/90 text-[28px] font-bold tracking-tight">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(total)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {editingId && (
                        <Button variant="outline" onClick={handleCancelEdit} className="flex-1">
                          Cancelar Edição
                        </Button>
                      )}
                      <Button
                        className={`h-10 shadow-md ${editingId ? 'flex-1' : 'w-full'}`}
                        onClick={saveBudget}
                        disabled={isSaving}
                      >
                        {isSaving
                          ? 'Salvando...'
                          : editingId
                            ? 'Atualizar Orçamento'
                            : 'Finalizar Orçamento'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={!!planToDelete}
        onOpenChange={(open) => !open && setPlanToDelete(null)}
        title="Excluir orçamento?"
        description="Essa ação não pode ser desfeita. O orçamento será permanentemente removido."
        onConfirm={() => {
          if (planToDelete) handleRemove(planToDelete);
        }}
        isLoading={isDeleting}
        confirmText={isDeleting ? 'Excluindo...' : 'Excluir'}
        variant="destructive"
      />
    </Form>
  );
}

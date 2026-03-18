'use client';

import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { notificationService } from '@/services/notification.service';
import {
    Plus,
    Trash2,
    Banknote,
    FileText,
    ShoppingCart,
    CheckCircle2,
    Clock,
    XCircle,
    Check,
    ChevronsUpDown
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BudgetsTabSkeleton } from '@/components/skeletons';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

import { useClinicProceduresControllerFindAll } from '@/generated/hooks/useClinicProceduresControllerFindAll';
import { useTreatmentPlansControllerCreate } from '@/generated/hooks/useTreatmentPlansControllerCreate';
import { useTreatmentPlansControllerFindAll } from '@/generated/hooks/useTreatmentPlansControllerFindAll';
import { useTreatmentPlansControllerUpdate } from '@/generated/hooks/useTreatmentPlansControllerUpdate';
import { useTreatmentPlansControllerRemove } from '@/generated/hooks/useTreatmentPlansControllerRemove';
import { treatmentPlansControllerFindAllQueryKey } from '@/generated/hooks/useTreatmentPlansControllerFindAll';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatCurrencyInput, parseCurrencyInput } from '@/utils/masks';

// FDI Tooth Numbers
const ADULT_TEETH = [
    18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
    48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38
].sort();

const PEDIATRIC_TEETH = [
    55, 54, 53, 52, 51, 61, 62, 63, 64, 65,
    85, 84, 83, 82, 81, 71, 72, 73, 74, 75
].sort();

const ALL_TEETH = [...ADULT_TEETH, ...PEDIATRIC_TEETH];

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
    const queryClient = useQueryClient();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [toothComboboxOpen, setToothComboboxOpen] = useState(false);
    const [planToDelete, setPlanToDelete] = useState<number | null>(null);

    // API Hooks
    const { data: catalog = [] } = useClinicProceduresControllerFindAll();
    const { data: allPlans = [], isLoading: isLoadingPlans } = useTreatmentPlansControllerFindAll();
    const { mutate: createPlan, isPending: isCreating } = useTreatmentPlansControllerCreate();
    const { mutate: updatePlan, isPending: isUpdating } = useTreatmentPlansControllerUpdate();
    const { mutate: removePlan, isPending: isDeleting } = useTreatmentPlansControllerRemove();

    const isSaving = isCreating || isUpdating;


    const patientPlans = useMemo(() => {
        return (allPlans as any[]).filter(plan => plan.patientId === patientId)
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

    const discount = form.watch('discount') || 0;
    const subtotal = cart.reduce((acc, item) => acc + item.value, 0);
    const total = Math.max(0, subtotal - discount);

    const addToCart = (values: BudgetFormValues) => {
        const procedure = (catalog as any[]).find(p => p.name === values.procedureName);
        if (!procedure) return;

        const newItem: CartItem = {
            id: crypto.randomUUID(),
            description: procedure.name,
            value: Number(procedure.baseValue),
            toothNumber: (values.toothNumber && values.toothNumber !== 'general') ? Number(values.toothNumber) : undefined,
        };

        setCart(prev => [...prev, newItem]);
        notificationService.success('Item adicionado ao carrinho');

        // Clear fields except title
        form.setValue('procedureName', '');
        form.setValue('toothNumber', '');
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const handleEdit = (plan: any) => {
        setEditingId(plan.id);
        form.setValue('title', plan.title || '');
        form.setValue('discount', Number(plan.discount || 0));

        const newCart = plan.items.map((item: any) => ({
            id: item.id || crypto.randomUUID(),
            description: item.description,
            value: Number(item.value),
            toothNumber: item.toothNumber
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
        updatePlan({ id, data: { status: 'APPROVED' } as any }, {
            onSuccess: () => {
                notificationService.success('Orçamento aprovado!');
                queryClient.invalidateQueries({ queryKey: treatmentPlansControllerFindAllQueryKey() });
            }
        });
    };

    const handleCancel = (id: number) => {
        updatePlan({ id, data: { status: 'CANCELLED' } as any }, {
            onSuccess: () => {
                notificationService.success('Orçamento cancelado!');
                queryClient.invalidateQueries({ queryKey: treatmentPlansControllerFindAllQueryKey() });
            }
        });
    };

    const handleRemove = (id: number) => {
        removePlan({ id }, {
            onSuccess: () => {
                notificationService.success('Orçamento removido!');
                setPlanToDelete(null);
                queryClient.invalidateQueries({ queryKey: treatmentPlansControllerFindAllQueryKey() });
            }
        });
    };

    const saveBudget = () => {
        if (cart.length === 0) {
            notificationService.error('O carrinho está vazio');
            return;
        }

        const title = form.getValues('title');
        const discount = form.getValues('discount') || 0;

        const planData = {
            patientId,
            dentistId: 1, // Fix: Use actual dentist ID
            title,
            discount,
            status: 'DRAFT' as any,
            items: cart.map(item => ({
                description: item.description,
                value: item.value,
                toothNumber: item.toothNumber,
                status: 'PLANNED' as any
            }))
        };

        if (editingId) {
            updatePlan({
                id: editingId,
                data: planData as any
            }, {
                onSuccess: () => {
                    notificationService.success('Orçamento atualizado com sucesso');
                    setCart([]);
                    form.reset();
                    setEditingId(null);
                    queryClient.invalidateQueries({ queryKey: treatmentPlansControllerFindAllQueryKey() });
                },
                onError: () => {
                    notificationService.error('Erro ao atualizar orçamento');
                }
            });
        } else {
            createPlan({
                data: planData as any
            }, {
                onSuccess: () => {
                    notificationService.success('Orçamento criado com sucesso');
                    setCart([]);
                    form.reset();
                    queryClient.invalidateQueries({ queryKey: treatmentPlansControllerFindAllQueryKey() });
                },
                onError: () => {
                    notificationService.error('Erro ao criar orçamento');
                }
            });
        }
    };

    return (
        <Form {...form}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
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
                                                <Input placeholder="Ex: Tratamento do Canal, Reabilitação Oral..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                        {(catalog as any[]).map((proc) => (
                                                            <SelectItem key={proc.id} value={proc.name}>
                                                                {proc.name} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proc.baseValue)}
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
                                                                    "flex h-9 w-full items-center justify-between gap-2 border border-input px-3 py-2 text-sm shadow-xs transition-[color,box-shadow]",
                                                                    "bg-transparent dark:bg-input/30 dark:hover:bg-input/50 focus-visible:ring-[3px] focus-visible:border-ring focus-visible:ring-ring/50 font-normal",
                                                                    "hover:bg-transparent hover:text-foreground",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value
                                                                    ? field.value === 'general'
                                                                        ? 'Geral (Sem dente)'
                                                                        : `Dente ${field.value}`
                                                                    : "Selecione o dente"}
                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                                        <Command filter={(value, search) => {
                                                            if (value.includes(search)) return 1;
                                                            return 0;
                                                        }}>
                                                            <CommandInput placeholder="Pesquisar dente..." />
                                                            <CommandList>
                                                                <CommandEmpty>Nenhum dente encontrado.</CommandEmpty>
                                                                <CommandGroup>
                                                                    <CommandItem
                                                                        value="general"
                                                                        keywords={["general", "geral", "sem", "dente"]}
                                                                        onSelect={() => {
                                                                            form.setValue("toothNumber", "general");
                                                                            setToothComboboxOpen(false);
                                                                        }}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                field.value === "general" ? "opacity-100" : "opacity-0"
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
                                                                            keywords={[String(tooth), `dente ${tooth}`, `dente ${tooth} permanente`, "permanente"]}
                                                                            onSelect={() => {
                                                                                form.setValue("toothNumber", String(tooth));
                                                                                setToothComboboxOpen(false);
                                                                            }}
                                                                        >
                                                                            <Check
                                                                                className={cn(
                                                                                    "mr-2 h-4 w-4",
                                                                                    field.value === String(tooth) ? "opacity-100" : "opacity-0"
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
                                                                            keywords={[String(tooth), `dente ${tooth}`, `dente ${tooth} decíduo`, "decíduo", "deciduo"]}
                                                                            onSelect={() => {
                                                                                form.setValue("toothNumber", String(tooth));
                                                                                setToothComboboxOpen(false);
                                                                            }}
                                                                        >
                                                                            <Check
                                                                                className={cn(
                                                                                    "mr-2 h-4 w-4",
                                                                                    field.value === String(tooth) ? "opacity-100" : "opacity-0"
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
                                    disabled={!form.watch('title') || !form.watch('procedureName')}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
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
                            <ScrollArea className="h-[400px] pr-4">
                                {isLoadingPlans ? (
                                    <BudgetsTabSkeleton />
                                ) : patientPlans.length === 0 ? (
                                    <div className="text-center p-4 text-muted-foreground italic">Nenhum orçamento encontrado.</div>
                                ) : (
                                    <Accordion type="single" collapsible className="w-full">
                                        {patientPlans.map((plan) => {
                                            const config = STATUS_CONFIG[plan.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.DRAFT;
                                            const StatusIcon = config.icon;
                                            return (
                                                <AccordionItem key={plan.id} value={`plan-${plan.id}`}>
                                                    <AccordionTrigger className="hover:no-underline">
                                                        <div className="flex items-center justify-between w-full pr-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`p-1 rounded-full ${config.color} text-white`}>
                                                                    <StatusIcon className="h-3 w-3" />
                                                                </div>
                                                                <span className="font-semibold text-left">{plan.title || 'Orçamento'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                                <span>{format(new Date(plan.createdAt), 'dd/MM/yyyy')}</span>
                                                                <span className="font-bold text-primary">
                                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(plan.totalAmount) - Number(plan.discount || 0))}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent>
                                                        <div className="space-y-4 pt-2">
                                                            <div className="border rounded-md p-3 bg-muted/20">
                                                                <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Itens do Orçamento</h5>
                                                                <div className="space-y-2">
                                                                    {plan.items?.map((item: any) => (
                                                                        <div key={item.id} className="flex justify-between text-sm">
                                                                            <span>{item.description} {item.toothNumber && <span className="text-xs text-muted-foreground">(Dente {item.toothNumber})</span>}</span>
                                                                            <span className="font-medium">
                                                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.value))}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                    {plan.discount > 0 && (
                                                                        <div className="flex justify-between text-sm text-red-500 font-medium pt-2 border-t mt-2">
                                                                            <span>Desconto</span>
                                                                            <span>- {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(plan.discount))}</span>
                                                                        </div>
                                                                    )}
                                                                    <div className="flex justify-between text-base font-bold text-primary pt-2 border-t mt-2">
                                                                        <span>Total Final</span>
                                                                        <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(plan.totalAmount) - Number(plan.discount || 0))}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex gap-2 justify-end">
                                                                {plan.status === 'DRAFT' && (
                                                                    <>
                                                                        <Button size="sm" variant="outline" onClick={() => handleEdit(plan)}>
                                                                            Editar
                                                                        </Button>
                                                                        <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleApprove(plan.id)}>
                                                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                                                            Aprovar
                                                                        </Button>
                                                                    </>
                                                                )}
                                                                {(plan.status === 'APPROVED' || plan.status === 'DRAFT') && (
                                                                    <Button size="sm" variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50" onClick={() => handleCancel(plan.id)}>
                                                                        <XCircle className="h-4 w-4 mr-2" />
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
                    <Card className="sticky top-6 shadow-sm border-border/40">
                        <CardHeader className="border-b border-border/40 pb-3 mb-0">
                            <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground/80">
                                <ShoppingCart className="h-[18px] w-[18px] text-muted-foreground stroke-[1.5]" />
                                Resumo do Orçamento
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-3 px-6">
                            {cart.length === 0 ? (
                                <div className="h-52 flex flex-col items-center justify-center text-muted-foreground/50 space-y-4">
                                    <ShoppingCart className="h-12 w-12 stroke-[1]" />
                                    <p className="text-sm font-light tracking-wide">Nenhum procedimento no momento</p>
                                </div>
                            ) : (
                                <div className="space-y-0">
                                    <ScrollArea className="h-[320px] -mx-4 px-4 mt-0">
                                        <div className="flex flex-col gap-2.5 pb-2">
                                            {cart.map((item) => (
                                                <div key={item.id} className="group relative p-3 bg-gradient-to-r from-card to-muted/30 border border-border/40 hover:border-primary/20 shadow-xs hover:shadow-sm transition-all rounded-lg">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-foreground/95 truncate leading-none">{item.description}</p>
                                                            {item.toothNumber && (
                                                                <div className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-[10px] font-bold tracking-wider text-primary uppercase">
                                                                    Dente <span className="text-foreground">{item.toothNumber}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            <p className="text-sm font-bold text-primary whitespace-nowrap">
                                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
                                                            </p>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeFromCart(item.id)}
                                                                className="h-7 w-7 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground opacity-0 group-hover:opacity-100 transition-all rounded-full"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>

                                    <div className="pt-6 mt-2 space-y-4 border-t border-border/40">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-muted-foreground font-light">Subtotal</span>
                                                <span className="font-medium text-foreground/80">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}</span>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <span className="text-sm text-muted-foreground font-light w-16">Desconto</span>
                                                <FormField
                                                    control={form.control}
                                                    name="discount"
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1 mb-0">
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-medium">R$</span>
                                                                    <Input
                                                                        type="text"
                                                                        className="pl-8 h-9 text-sm text-right font-medium text-destructive/90 border-transparent bg-muted/40 hover:bg-muted/60 focus-visible:bg-transparent focus-visible:border-border/50 shadow-none transition-all rounded-md"
                                                                        placeholder="0,00"
                                                                        {...field}
                                                                        value={formatCurrencyInput(field.value)}
                                                                        onChange={(e) => field.onChange(parseCurrencyInput(e.target.value))}
                                                                    />
                                                                </div>
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="pt-5 mt-5 border-t border-border/40 flex justify-between items-baseline">
                                                <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Total</span>
                                                <div className="text-right">
                                                    <p className="text-[28px] font-bold tracking-tight text-primary/90">
                                                        {new Intl.NumberFormat('pt-BR', {
                                                            style: 'currency',
                                                            currency: 'BRL'
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
                                                {isSaving ? 'Salvando...' : editingId ? 'Atualizar Orçamento' : 'Finalizar Orçamento'}
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

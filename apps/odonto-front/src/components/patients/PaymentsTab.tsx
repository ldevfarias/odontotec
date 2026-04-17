'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertCircle,
  Banknote,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  CreditCard,
  DollarSign,
  Plus,
  Receipt,
  ShieldCheck,
  Smartphone,
  Wallet,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { PaymentsTabSkeleton } from '@/components/skeletons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePaymentsControllerCreate } from '@/generated/hooks/usePaymentsControllerCreate';
import {
  paymentsControllerFindAllByPatientQueryKey,
  usePaymentsControllerFindAllByPatient,
} from '@/generated/hooks/usePaymentsControllerFindAllByPatient';
import {
  treatmentPlansControllerFindAllQueryKey,
  useTreatmentPlansControllerFindAll,
} from '@/generated/hooks/useTreatmentPlansControllerFindAll';
import { useTreatmentPlansControllerUpdate } from '@/generated/hooks/useTreatmentPlansControllerUpdate';
import {
  CreatePaymentDtoMethodEnumKey,
  CreatePaymentDtoStatusEnumKey,
} from '@/generated/ts/CreatePaymentDto';
import { UpdateTreatmentPlanDtoStatusEnumKey } from '@/generated/ts/UpdateTreatmentPlanDto';
import { analytics, EVENT_NAMES } from '@/services/analytics.service';
import { notificationService } from '@/services/notification.service';

interface TreatmentPlanItem {
  id?: number;
  description: string;
  value: number;
  toothNumber?: number;
}

interface TreatmentPlan {
  id: number;
  patientId: number;
  status: string;
  createdAt?: string;
  totalAmount: number;
  discount?: number;
  notes?: string;
  title?: string;
  dentist?: { name: string };
  items?: TreatmentPlanItem[];
}

type EnrichedPlan = TreatmentPlan & { totalPaid: number; balance: number };

interface Payment {
  id: number;
  amount: number;
  method: CreatePaymentDtoMethodEnumKey;
  date?: string;
  treatmentPlanId?: number;
}

type PaymentFormValues = z.infer<typeof paymentSchema>;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const methodLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  PIX: { label: 'PIX', icon: <Smartphone className="h-3.5 w-3.5" /> },
  CASH: { label: 'Dinheiro', icon: <Banknote className="h-3.5 w-3.5" /> },
  CREDIT_CARD: { label: 'Crédito', icon: <CreditCard className="h-3.5 w-3.5" /> },
  DEBIT_CARD: { label: 'Débito', icon: <Wallet className="h-3.5 w-3.5" /> },
  INSURANCE: { label: 'Convênio', icon: <ShieldCheck className="h-3.5 w-3.5" /> },
};

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: { label: 'Rascunho', className: 'bg-secondary text-secondary-foreground' },
  APPROVED: { label: 'Aprovado', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  COMPLETED: {
    label: 'Finalizado',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  CANCELLED: {
    label: 'Cancelado',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
};

const paymentSchema = z.object({
  amount: z.string().min(1),
  method: z.enum(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'INSURANCE']),
  date: z.string(),
  treatmentPlanId: z.number().optional(),
});

interface PaymentsTabProps {
  patientId: number;
}

export function PaymentsTab({ patientId }: PaymentsTabProps) {
  const queryClient = useQueryClient();
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    desc: string;
    onConfirm: () => void;
  } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [expandedPlans, setExpandedPlans] = useState<number[]>([]);

  const { data: treatmentPlansResponse, isLoading: loadingPlans } =
    useTreatmentPlansControllerFindAll();
  const { data: paymentsResponse, isLoading: loadingPayments } =
    usePaymentsControllerFindAllByPatient(patientId);
  const treatmentPlans = useMemo<TreatmentPlan[]>(
    () => (treatmentPlansResponse?.data ?? []) as TreatmentPlan[],
    [treatmentPlansResponse],
  );
  const payments = useMemo<Payment[]>(
    () => (paymentsResponse?.data ?? []) as Payment[],
    [paymentsResponse],
  );
  const { mutate: createPayment, isPending: isCreating } = usePaymentsControllerCreate();
  const { mutate: updateTreatmentPlan } = useTreatmentPlansControllerUpdate();

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: '',
      method: 'PIX',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const patientTreatmentPlans = useMemo(() => {
    return treatmentPlans
      .filter((plan) => plan.patientId === patientId)
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }, [treatmentPlans, patientId]);

  const enrichedPlans = useMemo<EnrichedPlan[]>(() => {
    const paymentsByPlan = payments.reduce(
      (acc, p) => {
        if (p.treatmentPlanId) {
          acc[p.treatmentPlanId] = (acc[p.treatmentPlanId] || 0) + Number(p.amount);
        }
        return acc;
      },
      {} as Record<number, number>,
    );

    return patientTreatmentPlans.map((plan) => {
      const totalPaid = paymentsByPlan[plan.id] || 0;
      return { ...plan, totalPaid, balance: Number(plan.totalAmount) - totalPaid };
    });
  }, [patientTreatmentPlans, payments]);

  const totalDebt = enrichedPlans
    .filter((p) => p.status === 'APPROVED')
    .reduce((sum, p) => sum + Math.max(p.balance, 0), 0);
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalBudgeted = enrichedPlans.reduce((sum, p) => sum + Number(p.totalAmount), 0);

  const toggleExpand = (id: number) => {
    setExpandedPlans((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const handleOpenPaymentDialog = (planId: number, balance: number) => {
    setSelectedPlanId(planId);
    form.setValue('amount', balance.toString());
    setIsDialogOpen(true);
  };

  const onSubmit = (values: PaymentFormValues) => {
    createPayment(
      {
        data: {
          ...values,
          amount: Number(values.amount),
          patientId,
          treatmentPlanId: selectedPlanId || undefined,
          status: 'COMPLETED' as CreatePaymentDtoStatusEnumKey,
        },
      },
      {
        onSuccess: () => {
          notificationService.success('Pagamento registrado!');
          analytics.capture(EVENT_NAMES.PAYMENT_REGISTERED, {
            patient_id: patientId,
            treatment_plan_id: selectedPlanId,
            amount: Number(values.amount),
            method: values.method,
          });
          queryClient.invalidateQueries({
            queryKey: paymentsControllerFindAllByPatientQueryKey(patientId),
          });
          queryClient.invalidateQueries({ queryKey: treatmentPlansControllerFindAllQueryKey() });

          // Auto-finalize if fully paid
          if (selectedPlanId) {
            const plan = enrichedPlans.find((p) => p.id === selectedPlanId);
            if (plan && Number(values.amount) >= plan.balance) {
              updateTreatmentPlan(
                {
                  id: plan.id,
                  data: { status: 'COMPLETED' as UpdateTreatmentPlanDtoStatusEnumKey },
                },
                {
                  onSuccess: () => {
                    queryClient.invalidateQueries({
                      queryKey: treatmentPlansControllerFindAllQueryKey(),
                    });
                  },
                },
              );
            }
          }

          setIsDialogOpen(false);
          form.reset();
        },
        onError: (err: unknown) => {
          const msg = isAxiosError(err)
            ? (err.response?.data?.message as string | undefined)
            : undefined;
          notificationService.error(msg || 'Erro ao registrar pagamento');
        },
      },
    );
  };

  const handleStatusUpdate = (id: number, status: UpdateTreatmentPlanDtoStatusEnumKey) => {
    const actionText =
      status === 'APPROVED' ? 'aprovar' : status === 'CANCELLED' ? 'cancelar' : 'finalizar';

    setAlertConfig({
      isOpen: true,
      title: `Confirmar ${actionText}?`,
      desc: `Você tem certeza que deseja ${actionText} o orçamento #${id}? Esta ação afetará os registros financeiros do paciente.`,
      onConfirm: () => {
        updateTreatmentPlan(
          {
            id,
            data: { status },
          },
          {
            onSuccess: () => {
              notificationService.success(
                `Orçamento ${status === 'APPROVED' ? 'aprovado' : status === 'CANCELLED' ? 'cancelado' : 'finalizado'} com sucesso!`,
              );
              analytics.capture(EVENT_NAMES.TREATMENT_PLAN_STATUS_UPDATED, {
                treatment_plan_id: id,
                patient_id: patientId,
                status: status,
              });
              queryClient.invalidateQueries({
                queryKey: treatmentPlansControllerFindAllQueryKey(),
              });
              queryClient.invalidateQueries({
                queryKey: paymentsControllerFindAllByPatientQueryKey(patientId),
              });
              queryClient.invalidateQueries({ queryKey: ['PatientsControllerFindOne', patientId] });
            },
            onError: (err: unknown) => {
              const msg = isAxiosError(err)
                ? (err.response?.data?.message as string | undefined)
                : undefined;
              notificationService.error(msg || 'Erro ao atualizar status');
            },
          },
        );
      },
    });
  };

  if (loadingPlans || loadingPayments) {
    return <PaymentsTabSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* KPI Strip */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 sm:gap-4">
        <div className="card-surface flex items-start gap-2 p-3 sm:gap-4 sm:p-5">
          <div className="bg-destructive/10 shrink-0 rounded-xl p-2.5">
            <AlertCircle className="text-destructive h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="sm:body-small text-muted-foreground mb-1 truncate text-[10px] font-medium">
              Saldo em Aberto
            </p>
            <p className="sm:heading-3 text-destructive text-sm leading-none font-bold">
              {formatCurrency(totalDebt)}
            </p>
          </div>
        </div>
        <div className="card-surface flex items-start gap-2 p-3 sm:gap-4 sm:p-5">
          <div className="bg-success/10 shrink-0 rounded-xl p-2.5">
            <CheckCircle2 className="text-success h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="sm:body-small text-muted-foreground mb-1 truncate text-[10px] font-medium">
              Total Pago
            </p>
            <p className="sm:heading-3 text-success text-sm leading-none font-bold">
              {formatCurrency(totalPaid)}
            </p>
          </div>
        </div>
        <div className="card-surface flex items-start gap-2 p-3 sm:gap-4 sm:p-5">
          <div className="bg-primary/10 shrink-0 rounded-xl p-2.5">
            <ClipboardList className="text-primary h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="sm:body-small text-muted-foreground mb-1 truncate text-[10px] font-medium">
              Total Orçado
            </p>
            <p className="sm:heading-3 text-sm leading-none font-bold">
              {formatCurrency(totalBudgeted)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="budgets" className="w-full">
        <TabsList className="bg-muted/50 grid h-10 w-full grid-cols-2 p-1 lg:w-100">
          <TabsTrigger
            value="budgets"
            className="flex cursor-pointer items-center gap-2 transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <ClipboardList className="h-4 w-4" />
            Orçamentos
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="flex cursor-pointer items-center gap-2 transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Receipt className="h-4 w-4" />
            Pagamentos
          </TabsTrigger>
        </TabsList>

        {/* TAB: Orçamentos */}
        <TabsContent value="budgets" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <ClipboardList className="text-primary h-5 w-5" />
              Gerenciar Orçamentos
            </h3>
            <span className="text-muted-foreground text-xs">{enrichedPlans.length} total</span>
          </div>

          {enrichedPlans.length === 0 ? (
            <div className="text-muted-foreground rounded-lg border-2 border-dashed py-10 text-center italic">
              <ClipboardList className="mx-auto mb-2 h-8 w-8 opacity-20" />
              Nenhum orçamento encontrado para este paciente.
            </div>
          ) : (
            <div className="card-surface divide-y">
              {enrichedPlans.map((plan) => {
                const isExpanded = expandedPlans.includes(plan.id);
                const config = statusConfig[plan.status] || statusConfig.DRAFT;
                const isApproved = plan.status === 'APPROVED';
                const hasPendingBalance = isApproved && plan.balance > 0;
                const hasDiscount = Number(plan.discount || 0) > 0;
                const effectiveTotal = Number(plan.totalAmount) - Number(plan.discount || 0);

                const progressPercent =
                  effectiveTotal > 0 ? Math.min((plan.totalPaid / effectiveTotal) * 100, 100) : 0;

                return (
                  <div
                    key={plan.id}
                    className="group relative flex flex-col overflow-hidden transition-colors"
                  >
                    <div
                      className="hover:bg-muted/30 flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors"
                      onClick={() => toggleExpand(plan.id)}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground group-hover:bg-background/80 h-7 w-7 shrink-0"
                        tabIndex={-1}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="body-regular font-semibold">
                            {plan.title || `Orçamento #${plan.id}`}
                          </span>
                          <Badge variant="outline" className={config.className}>
                            {config.label}
                          </Badge>
                          {hasPendingBalance && (
                            <Badge
                              variant="outline"
                              className="border-amber-200 bg-amber-50 text-amber-700"
                            >
                              Pendente
                            </Badge>
                          )}
                          {isApproved && plan.balance <= 0 && (
                            <Badge
                              variant="outline"
                              className="bg-success text-success-foreground border-success/20"
                            >
                              Finalizado
                            </Badge>
                          )}
                        </div>
                        <div className="caption text-muted-foreground mt-0.5">
                          {plan.createdAt
                            ? format(new Date(plan.createdAt), "dd 'de' MMM 'de' yyyy", {
                                locale: ptBR,
                              })
                            : 'Data desconhecida'}
                          {' · '}
                          {(plan.items || []).length} itens
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <div
                          className={`body-regular font-bold ${hasDiscount ? 'text-primary' : ''}`}
                        >
                          {formatCurrency(effectiveTotal)}
                        </div>
                        {hasDiscount && (
                          <div className="text-muted-foreground text-[10px] line-through opacity-70">
                            {formatCurrency(Number(plan.totalAmount))}
                          </div>
                        )}
                        {isApproved && (
                          <div className="text-muted-foreground mt-0.5 text-[10px]">
                            Pago: {formatCurrency(plan.totalPaid)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress bar for approved plans */}
                    {isApproved && (
                      <div className="px-4 pb-1">
                        <div className="bg-muted h-1 w-full overflow-hidden rounded-full opacity-50">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${progressPercent >= 100 ? 'bg-success' : 'bg-primary'}`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="bg-muted/10 animate-in slide-in-from-top-2 border-t">
                        <div className="overflow-x-auto p-1">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-border/40 hover:bg-transparent">
                                <TableHead className="text-muted-foreground/80 h-auto py-2 text-[10px] font-semibold tracking-wider uppercase">
                                  Dente
                                </TableHead>
                                <TableHead className="text-muted-foreground/80 h-auto py-2 text-[10px] font-semibold tracking-wider uppercase">
                                  Procedimento
                                </TableHead>
                                <TableHead className="text-muted-foreground/80 h-auto py-2 text-right text-[10px] font-semibold tracking-wider uppercase">
                                  Valor
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {(plan.items ?? []).map((item, idx) => (
                                <TableRow
                                  key={idx}
                                  className="border-border/40 hover:bg-transparent"
                                >
                                  <TableCell className="text-foreground/80 py-2 text-sm">
                                    {item.toothNumber ? `Dente ${item.toothNumber}` : 'Geral'}
                                  </TableCell>
                                  <TableCell className="text-foreground/80 py-2 text-sm">
                                    {item.description}
                                  </TableCell>
                                  <TableCell className="text-foreground/80 py-2 text-right font-mono text-sm">
                                    {formatCurrency(item.value)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                        <Separator className="bg-border/40" />
                        <div className="flex items-center justify-between px-4 py-3">
                          {isApproved && plan.balance > 0 ? (
                            <div className="text-muted-foreground text-xs">
                              Saldo restante:{' '}
                              <span className="text-destructive font-semibold">
                                {formatCurrency(plan.balance)}
                              </span>
                            </div>
                          ) : (
                            <div />
                          )}
                          <div className="flex items-center gap-2">
                            {plan.status === 'DRAFT' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-success/30 text-success hover:bg-success/10 h-7 text-xs"
                                onClick={() => handleStatusUpdate(plan.id, 'APPROVED')}
                              >
                                <Check className="mr-1 h-3.5 w-3.5" /> Aprovar
                              </Button>
                            )}
                            {isApproved && plan.balance > 0 && (
                              <Button
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => handleOpenPaymentDialog(plan.id, plan.balance)}
                              >
                                <DollarSign className="mr-1 h-3.5 w-3.5" /> Pagar
                              </Button>
                            )}
                            {plan.status !== 'DRAFT' &&
                              plan.status !== 'CANCELLED' &&
                              plan.status !== 'COMPLETED' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:bg-destructive/10 h-7 text-xs"
                                  onClick={() => handleStatusUpdate(plan.id, 'CANCELLED')}
                                >
                                  Cancelar
                                </Button>
                              )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* TAB: Pagamentos */}
        <TabsContent value="payments" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <Receipt className="h-5 w-5 text-emerald-600" />
              Histórico de Pagamentos
            </h3>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => {
                setSelectedPlanId(null);
                form.reset();
                setIsDialogOpen(true);
              }}
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> Registrar Avulso
            </Button>
          </div>

          {payments.length === 0 ? (
            <div className="text-muted-foreground rounded-lg border-2 border-dashed py-10 text-center italic">
              <Receipt className="mx-auto mb-2 h-8 w-8 opacity-20" />
              Nenhum pagamento registrado.
            </div>
          ) : (
            <div className="card-surface divide-y">
              {payments.map((payment) => {
                const method = methodLabels[payment.method] || {
                  label: payment.method,
                  icon: <DollarSign className="h-3.5 w-3.5" />,
                };
                return (
                  <div
                    key={payment.id}
                    className="group relative flex flex-col overflow-hidden transition-colors"
                  >
                    <div className="hover:bg-muted/30 flex items-center gap-3 px-4 py-3 transition-colors">
                      <div className="bg-success/10 group-hover:bg-success/20 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors">
                        <span className="text-success">{method.icon}</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="body-regular font-semibold">{method.label}</span>
                          {payment.treatmentPlanId && (
                            <Badge variant="outline" className="bg-muted text-muted-foreground">
                              Orçamento #{payment.treatmentPlanId}
                            </Badge>
                          )}
                        </div>
                        <div className="caption text-muted-foreground mt-0.5">
                          {payment.date
                            ? format(new Date(payment.date), "dd 'de' MMM 'de' yyyy", {
                                locale: ptBR,
                              })
                            : '-'}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="body-regular text-success font-bold">
                          {formatCurrency(payment.amount)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription>
              {selectedPlanId
                ? `Confirme o valor e a forma de pagamento do orçamento #${selectedPlanId}.`
                : 'Registre um pagamento avulso para este paciente.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input placeholder="0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PIX">PIX</SelectItem>
                          <SelectItem value="CASH">Dinheiro</SelectItem>
                          <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                          <SelectItem value="DEBIT_CARD">Cartão de Débito</SelectItem>
                          <SelectItem value="INSURANCE">Convênio</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="mt-6">
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? 'Registrando...' : 'Confirmar Pagamento'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={alertConfig?.isOpen || false}
        onOpenChange={(open) =>
          !open && setAlertConfig((prev) => (prev ? { ...prev, isOpen: false } : null))
        }
        title={alertConfig?.title || ''}
        description={alertConfig?.desc || ''}
        onConfirm={() => alertConfig?.onConfirm()}
        confirmText="Confirmar"
        cancelText="Voltar"
        variant={alertConfig?.title.includes('cancelar') ? 'destructive' : 'default'}
      />
    </div>
  );
}

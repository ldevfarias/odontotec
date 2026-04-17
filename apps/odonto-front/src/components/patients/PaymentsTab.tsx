'use client';

import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useMemo, useState } from 'react';

import { PaymentsTabSkeleton } from '@/components/skeletons';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
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
import { CreatePaymentDtoStatusEnumKey } from '@/generated/ts/CreatePaymentDto';
import { UpdateTreatmentPlanDtoStatusEnumKey } from '@/generated/ts/UpdateTreatmentPlanDto';
import { analytics, EVENT_NAMES } from '@/services/analytics.service';
import { notificationService } from '@/services/notification.service';

import { PaymentFormDialog, PaymentFormValues } from './payments/PaymentFormDialog';
import { EnrichedPlan, Payment, PaymentList, TreatmentPlan } from './payments/PaymentList';
import { PaymentSummaryCards } from './payments/PaymentSummaryCards';

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
  const [dialogInitialAmount, setDialogInitialAmount] = useState<string>('');
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
    setDialogInitialAmount(balance.toString());
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
          { id, data: { status } },
          {
            onSuccess: () => {
              notificationService.success(
                `Orçamento ${status === 'APPROVED' ? 'aprovado' : status === 'CANCELLED' ? 'cancelado' : 'finalizado'} com sucesso!`,
              );
              analytics.capture(EVENT_NAMES.TREATMENT_PLAN_STATUS_UPDATED, {
                treatment_plan_id: id,
                patient_id: patientId,
                status,
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
      <PaymentSummaryCards
        totalDebt={totalDebt}
        totalPaid={totalPaid}
        totalBudgeted={totalBudgeted}
      />

      <PaymentList
        enrichedPlans={enrichedPlans}
        payments={payments}
        expandedPlans={expandedPlans}
        onToggleExpand={toggleExpand}
        onOpenPaymentDialog={handleOpenPaymentDialog}
        onStatusUpdate={handleStatusUpdate}
        onRegisterStandalone={() => {
          setSelectedPlanId(null);
          setDialogInitialAmount('');
          setIsDialogOpen(true);
        }}
      />

      <PaymentFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedPlanId={selectedPlanId}
        initialAmount={dialogInitialAmount}
        isCreating={isCreating}
        onSubmit={onSubmit}
      />

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

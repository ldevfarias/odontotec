'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Form } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { useClinicsControllerGetActive } from '@/generated/hooks/useClinicsControllerGetActive';
import { useClinicProceduresControllerFindAll } from '@/generated/hooks/useClinicProceduresControllerFindAll';
import { useTreatmentPlansControllerCreate } from '@/generated/hooks/useTreatmentPlansControllerCreate';
import { useTreatmentPlansControllerRemove } from '@/generated/hooks/useTreatmentPlansControllerRemove';
import { useTreatmentPlansControllerUpdate } from '@/generated/hooks/useTreatmentPlansControllerUpdate';
import type { CreateTreatmentPlanDto } from '@/generated/ts/CreateTreatmentPlanDto';
import type { TreatmentPlanItemDtoStatusEnumKey } from '@/generated/ts/TreatmentPlanItemDto';
import type { UpdateTreatmentPlanDtoStatusEnumKey } from '@/generated/ts/UpdateTreatmentPlanDto';
import { api } from '@/lib/api';
import { notificationService } from '@/services/notification.service';

import type { BudgetPlan, CartItem, ProcedureCatalogItem } from './budget-types';
import { BudgetCartSidebar } from './BudgetCartSidebar';
import { BudgetFormCard } from './BudgetFormCard';
import { BudgetHistoryList } from './BudgetHistoryList';

const budgetFormSchema = z.object({
  title: z.string().min(1, 'O título é obrigatório'),
  procedureName: z.string().min(1, 'Selecione um procedimento'),
  toothNumber: z.string().optional(),
  discount: z.number().min(0, 'Desconto não pode ser negativo'),
});

export type BudgetFormValues = z.infer<typeof budgetFormSchema>;

interface QueryDataShape<T> {
  data?: T[];
}

const treatmentPlansByPatientQueryKey = (patientId: number) =>
  ['treatment-plans', 'patient', patientId] as const;

const extractArrayData = <T,>(response: unknown): T[] => {
  if (Array.isArray(response)) return response as T[];
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
  patientName: string;
  patientPhone?: string;
}

export function BudgetsTab({ patientId, patientName, patientPhone }: BudgetsTabProps) {
  'use no memo';

  const { user } = useAuth();
  const { data: activeClinicData } = useClinicsControllerGetActive();
  const queryClient = useQueryClient();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [planToDelete, setPlanToDelete] = useState<number | null>(null);

  const { data: catalogResponse } = useClinicProceduresControllerFindAll();
  const { data: allPlansResponse, isLoading: isLoadingPlans } = useQuery({
    queryKey: treatmentPlansByPatientQueryKey(patientId),
    queryFn: async () => {
      const response = await api.get(
        '/treatment-plans/patient/:patientId'.replace(':patientId', String(patientId)),
        {
          params: { page: 1, limit: 100 },
        },
      );

      return response.data;
    },
    enabled: Number.isFinite(patientId) && patientId > 0,
  });
  const { mutate: createPlan, isPending: isCreating } = useTreatmentPlansControllerCreate();
  const { mutate: updatePlan, isPending: isUpdating } = useTreatmentPlansControllerUpdate();
  const { mutate: removePlan, isPending: isDeleting } = useTreatmentPlansControllerRemove();

  const catalog = useMemo(
    () => extractArrayData<ProcedureCatalogItem>(catalogResponse),
    [catalogResponse],
  );

  const patientPlans = useMemo(() => {
    const all = extractArrayData<BudgetPlan>(allPlansResponse);
    return all
      .filter((p) => Number(p.patientId) === Number(patientId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allPlansResponse, patientId]);

  const isSaving = isCreating || isUpdating;

  const clinicData = activeClinicData as Record<string, unknown> | undefined;
  const pdfClinic = {
    name: typeof clinicData?.name === 'string' ? clinicData.name : '',
    logoUrl: typeof clinicData?.logoUrl === 'string' ? clinicData.logoUrl : null,
    cnpj: typeof clinicData?.cnpj === 'string' ? clinicData.cnpj : null,
    phone: typeof clinicData?.phone === 'string' ? clinicData.phone : null,
  };

  const pdfPatient = { name: patientName, phone: patientPhone };

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: { title: '', procedureName: '', toothNumber: '', discount: 0 },
  });

  const [watchTitle, watchProcedureName, discount] = useWatch({
    control: form.control,
    name: ['title', 'procedureName', 'discount'],
  });

  const subtotal = cart.reduce((acc, item) => acc + item.value, 0);
  const total = Math.max(0, subtotal - (discount || 0));

  const invalidatePlans = () =>
    queryClient.invalidateQueries({ queryKey: treatmentPlansByPatientQueryKey(patientId) });

  const addToCart = (values: BudgetFormValues) => {
    const procedure = catalog.find((item) => item.name === values.procedureName);
    if (!procedure) return;

    setCart((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        description: procedure.name,
        value: Number(procedure.baseValue),
        toothNumber:
          values.toothNumber && values.toothNumber !== 'general'
            ? Number(values.toothNumber)
            : undefined,
      },
    ]);

    notificationService.success('Item adicionado ao carrinho');
    form.setValue('procedureName', '');
    form.setValue('toothNumber', '');
  };

  const handleEdit = (plan: BudgetPlan) => {
    setEditingId(plan.id);
    form.setValue('title', plan.title ?? '');
    form.setValue('discount', Number(plan.discount ?? 0));
    setCart(
      (plan.items ?? []).map((item) => ({
        id: String(item.id ?? crypto.randomUUID()),
        description: item.description,
        value: Number(item.value),
        toothNumber: item.toothNumber,
      })),
    );
    notificationService.info('Orçamento carregado para edição');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setCart([]);
    form.reset();
    notificationService.info('Edição cancelada');
  };

  const handleStatusChange = (id: number, status: UpdateTreatmentPlanDtoStatusEnumKey) => {
    const labels: Partial<Record<UpdateTreatmentPlanDtoStatusEnumKey, string>> = {
      APPROVED: 'aprovado',
      CANCELLED: 'cancelado',
    };
    updatePlan(
      { id, data: { status } },
      {
        onSuccess: () => {
          notificationService.success(`Orçamento ${labels[status] ?? 'atualizado'}!`);
          invalidatePlans();
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
          invalidatePlans();
        },
      },
    );
  };

  const saveBudget = () => {
    if (cart.length === 0) {
      notificationService.error('O carrinho está vazio');
      return;
    }

    const { title, discount: discountValue } = form.getValues();
    const dentistId = user?.id ?? 0;

    const items = cart.map((item) => ({
      description: item.description,
      value: item.value,
      toothNumber: item.toothNumber,
      status: 'PLANNED' as TreatmentPlanItemDtoStatusEnumKey,
    }));

    const basePayload = {
      patientId,
      dentistId,
      title,
      discount: discountValue || 0,
      status: 'DRAFT' as const,
      items,
    };

    const resetForm = () => {
      setCart([]);
      form.reset();
      setEditingId(null);
      invalidatePlans();
    };

    if (editingId) {
      updatePlan(
        { id: editingId, data: basePayload as CreateTreatmentPlanDto },
        {
          onSuccess: () => {
            notificationService.success('Orçamento atualizado com sucesso');
            resetForm();
          },
          onError: () => {
            notificationService.error('Erro ao atualizar orçamento');
          },
        },
      );
    } else {
      createPlan(
        { data: basePayload },
        {
          onSuccess: () => {
            notificationService.success('Orçamento criado com sucesso');
            resetForm();
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
      <div className="grid h-full min-h-0 grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: form + history */}
        <div className="min-h-0 space-y-6 lg:col-span-2 lg:overflow-y-auto lg:pr-1">
          <BudgetFormCard
            control={form.control}
            catalog={catalog}
            isSubmitDisabled={!watchTitle || !watchProcedureName}
            onSubmit={form.handleSubmit(addToCart)}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Histórico de Orçamentos e Planos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BudgetHistoryList
                plans={patientPlans}
                isLoading={isLoadingPlans}
                patient={pdfPatient}
                clinic={pdfClinic}
                onEdit={handleEdit}
                onStatusChange={handleStatusChange}
                onDeleteRequest={setPlanToDelete}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right column: cart */}
        <div className="space-y-6 lg:min-h-0">
          <BudgetCartSidebar
            cart={cart}
            subtotal={subtotal}
            total={total}
            editingId={editingId}
            isSaving={isSaving}
            control={form.control}
            onRemoveItem={(id) => setCart((prev) => prev.filter((item) => item.id !== id))}
            onCancelEdit={handleCancelEdit}
            onSave={saveBudget}
          />
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

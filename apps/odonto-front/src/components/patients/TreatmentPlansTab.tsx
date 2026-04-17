'use client';

import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CheckCircle2, Clock, FileText, Trash2, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

import { TreatmentPlansTabSkeleton } from '@/components/skeletons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTreatmentPlansControllerFindAll } from '@/generated/hooks/useTreatmentPlansControllerFindAll';
import { useTreatmentPlansControllerRemove } from '@/generated/hooks/useTreatmentPlansControllerRemove';
import { useTreatmentPlansControllerUpdate } from '@/generated/hooks/useTreatmentPlansControllerUpdate';
import { TreatmentPlanItemDto } from '@/generated/ts/TreatmentPlanItemDto';
import { UpdateTreatmentPlanDtoStatusEnumKey } from '@/generated/ts/UpdateTreatmentPlanDto';
import { notificationService } from '@/services/notification.service';

interface TreatmentPlanItem extends Omit<TreatmentPlanItemDto, 'surface' | 'id'> {
  id: number;
  surface?: string;
}

interface TreatmentPlan {
  id: number;
  patientId: number;
  status: string;
  createdAt: string;
  totalAmount: number;
  notes?: string;
  dentist?: { name: string };
  items?: TreatmentPlanItem[];
}

interface TreatmentPlansTabProps {
  patientId: number;
}

const STATUS_CONFIG = {
  DRAFT: { label: 'Rascunho', color: 'bg-gray-500', icon: Clock },
  APPROVED: { label: 'Aprovado', color: 'bg-blue-500', icon: CheckCircle2 },
  COMPLETED: { label: 'Finalizado', color: 'bg-green-500', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-500', icon: XCircle },
  REJECTED: { label: 'Rejeitado', color: 'bg-orange-500', icon: XCircle },
};

export function TreatmentPlansTab({ patientId }: TreatmentPlansTabProps) {
  const queryClient = useQueryClient();
  const { data: treatmentPlansResponse, isLoading } = useTreatmentPlansControllerFindAll();
  const { mutate: removePlan } = useTreatmentPlansControllerRemove();
  const { mutate: updatePlan } = useTreatmentPlansControllerUpdate();

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteType, setDeleteType] = useState<'plan' | 'item' | null>(null);
  const [itemData, setItemData] = useState<{
    planId: number;
    itemId: number;
    currentItems: TreatmentPlanItem[];
  } | null>(null);

  const patientPlans = useMemo(() => {
    const plans = (treatmentPlansResponse?.data ?? []) as TreatmentPlan[];
    return plans.filter((plan) => plan.patientId === patientId);
  }, [treatmentPlansResponse, patientId]);

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setDeleteType('plan');
  };

  const confirmDeletePlan = () => {
    if (deleteId) {
      removePlan(
        { id: deleteId },
        {
          onSuccess: () => {
            notificationService.success('Orçamento excluído!');
            queryClient.invalidateQueries({ queryKey: ['TreatmentPlansControllerFindAll'] });
            setDeleteId(null);
            setDeleteType(null);
          },
        },
      );
    }
  };

  const handleStatusChange = (id: number, status: UpdateTreatmentPlanDtoStatusEnumKey) => {
    updatePlan(
      { id, data: { status } },
      {
        onSuccess: () => {
          notificationService.success('Status atualizado!');
          queryClient.invalidateQueries({ queryKey: ['TreatmentPlansControllerFindAll'] });
        },
      },
    );
  };

  const handleRemoveItem = (planId: number, itemId: number, currentItems: TreatmentPlanItem[]) => {
    setItemData({ planId, itemId, currentItems });
    setDeleteType('item');
  };

  const confirmRemoveItem = () => {
    if (itemData) {
      const updatedItems: TreatmentPlanItemDto[] = itemData.currentItems.map((item) => ({
        id: item.id,
        description: item.description,
        value: item.value,
        toothNumber: item.toothNumber,
        status: item.status,
      }));
      const filteredItems = updatedItems.filter((item) => item.id !== itemData.itemId);

      updatePlan(
        { id: itemData.planId, data: { items: filteredItems } },
        {
          onSuccess: () => {
            notificationService.success('Item removido com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['TreatmentPlansControllerFindAll'] });
            setItemData(null);
            setDeleteType(null);
          },
        },
      );
    }
  };

  if (isLoading) return <TreatmentPlansTabSkeleton />;

  if (patientPlans.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
          <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
            <FileText className="text-muted-foreground h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold">Nenhum orçamento encontrado</h3>
            <p className="text-muted-foreground text-sm">
              Os itens marcados como &ldquo;Orçamento&rdquo; no Odontograma aparecerão aqui.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {patientPlans.map((plan) => {
        const config =
          STATUS_CONFIG[plan.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.DRAFT;
        const StatusIcon = config.icon;

        return (
          <Card key={plan.id} className="overflow-hidden">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`h-10 w-10 rounded-full ${config.color} flex items-center justify-center text-white`}
                  >
                    <StatusIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">Orçamento #{plan.id}</CardTitle>
                      <Badge
                        variant="secondary"
                        className={`${plan.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' : ''}`}
                      >
                        {config.label}
                      </Badge>
                    </div>
                    <CardDescription>
                      Criado em {format(new Date(plan.createdAt), 'dd/MM/yyyy')}
                      {plan.dentist && ` por Dr(a). ${plan.dentist.name}`}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  {plan.status === 'DRAFT' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        onClick={() => handleStatusChange(plan.id, 'APPROVED')}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Aprovar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-orange-200 text-orange-600 hover:bg-orange-50"
                        onClick={() => handleStatusChange(plan.id, 'REJECTED')}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Rejeitar
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(plan.id)}>
                    <Trash2 className="text-destructive h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-25">Dente</TableHead>
                    <TableHead>Procedimento</TableHead>
                    <TableHead>Faces</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(plan.items ?? []).map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        {item.toothNumber ? `Dente ${item.toothNumber}` : 'Geral'}
                      </TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>
                        {item.surface ? (
                          <div className="flex gap-1">
                            {item.surface.split(',').map((f: string) => (
                              <Badge key={f} variant="outline" className="px-1 py-0 text-[10px]">
                                {f}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="flex items-center justify-end gap-2 text-right font-mono">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(item.value)}
                        {plan.status === 'DRAFT' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive h-6 w-6 opacity-50 hover:opacity-100"
                            onClick={() => handleRemoveItem(plan.id, item.id, plan.items ?? [])}
                            title="Remover item"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="bg-muted/10 flex items-center justify-between border-t p-6">
                <div className="text-muted-foreground text-sm italic">
                  {plan.notes || 'Sem observações adicionais.'}
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground mr-4 text-sm font-semibold tracking-wider uppercase">
                    Total
                  </span>
                  <span className="text-primary text-2xl font-bold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      plan.totalAmount,
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      {/* Dialogs */}
      <ConfirmDialog
        open={!!deleteType}
        onOpenChange={(open) => !open && setDeleteType(null)}
        title={deleteType === 'plan' ? 'Excluir Orçamento?' : 'Remover Item?'}
        description={
          deleteType === 'plan'
            ? 'Esta ação não pode ser desfeita. O orçamento será excluído permanentemente.'
            : 'O item será removido deste orçamento. O valor total será recalculado.'
        }
        onConfirm={deleteType === 'plan' ? confirmDeletePlan : confirmRemoveItem}
        confirmText={deleteType === 'plan' ? 'Excluir' : 'Remover'}
        variant="destructive"
      />
    </div>
  );
}

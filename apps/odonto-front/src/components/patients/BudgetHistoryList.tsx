'use client';

import { format } from 'date-fns';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

import { BudgetsTabSkeleton } from '@/components/skeletons';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { UpdateTreatmentPlanDtoStatusEnumKey } from '@/generated/ts/UpdateTreatmentPlanDto';
import { formatBRL } from '@/utils/masks';

import type { BudgetPdfClinic, BudgetPdfPatient, BudgetPlan } from './budget-types';
import { BudgetPdfButton } from './BudgetPdfButton';

const STATUS_CONFIG = {
  DRAFT: { label: 'Rascunho', color: 'bg-gray-500', icon: Clock },
  APPROVED: { label: 'Aprovado', color: 'bg-blue-500', icon: CheckCircle2 },
  COMPLETED: { label: 'Finalizado', color: 'bg-green-500', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-500', icon: XCircle },
  REJECTED: { label: 'Rejeitado', color: 'bg-orange-500', icon: XCircle },
};

interface BudgetHistoryListProps {
  plans: BudgetPlan[];
  isLoading: boolean;
  patient: BudgetPdfPatient;
  clinic: BudgetPdfClinic;
  onEdit: (plan: BudgetPlan) => void;
  onStatusChange: (id: number, status: UpdateTreatmentPlanDtoStatusEnumKey) => void;
  onDeleteRequest: (id: number) => void;
}

export function BudgetHistoryList({
  plans,
  isLoading,
  patient,
  clinic,
  onEdit,
  onStatusChange,
  onDeleteRequest,
}: BudgetHistoryListProps) {
  if (isLoading) return <BudgetsTabSkeleton />;

  if (plans.length === 0) {
    return (
      <div className="text-muted-foreground p-4 text-center">Nenhum orçamento encontrado.</div>
    );
  }

  return (
    <ScrollArea className="max-h-104 pr-4">
      <Accordion type="single" collapsible className="w-full">
        {plans.map((plan) => {
          const config =
            STATUS_CONFIG[plan.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.DRAFT;
          const StatusIcon = config.icon;
          const netTotal = Number(plan.totalAmount) - Number(plan.discount ?? 0);

          return (
            <AccordionItem key={plan.id} value={`plan-${plan.id}`}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex w-full items-center justify-between pr-4">
                  <div className="flex items-center gap-2">
                    <div className={`rounded-full p-1 ${config.color} text-white`}>
                      <StatusIcon className="h-3 w-3" />
                    </div>
                    <span className="text-left font-semibold">{plan.title ?? 'Orçamento'}</span>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-4 text-sm">
                    <span>{format(new Date(plan.createdAt), 'dd/MM/yyyy')}</span>
                    <span className="text-primary font-bold">{formatBRL(netTotal)}</span>
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
                          <span className="font-medium">{formatBRL(Number(item.value))}</span>
                        </div>
                      ))}

                      {Number(plan.discount ?? 0) > 0 && (
                        <div className="mt-2 flex justify-between border-t pt-2 text-sm font-medium text-red-500">
                          <span>Desconto</span>
                          <span>- {formatBRL(Number(plan.discount))}</span>
                        </div>
                      )}

                      <div className="text-primary mt-2 flex justify-between border-t pt-2 text-base font-bold">
                        <span>Total Final</span>
                        <span>{formatBRL(netTotal)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2">
                    <BudgetPdfButton plan={plan} patient={patient} clinic={clinic} />

                    {plan.status === 'DRAFT' && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => onEdit(plan)}>
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-200 text-green-600 hover:bg-green-50"
                          onClick={() => onStatusChange(plan.id, 'APPROVED')}
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
                        onClick={() => onStatusChange(plan.id, 'CANCELLED')}
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
                        onClick={() => onDeleteRequest(plan.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </ScrollArea>
  );
}

'use client';

import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
    FileText,
    CheckCircle2,
    Clock,
    XCircle,
    ChevronRight,
    Plus,
    Trash2,
    DollarSign
} from 'lucide-react';
import { notificationService } from '@/services/notification.service';
import { useQueryClient } from '@tanstack/react-query';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

import { useTreatmentPlansControllerFindAll } from '@/generated/hooks/useTreatmentPlansControllerFindAll';
import { useTreatmentPlansControllerRemove } from '@/generated/hooks/useTreatmentPlansControllerRemove';
import { useTreatmentPlansControllerUpdate } from '@/generated/hooks/useTreatmentPlansControllerUpdate';
import { TreatmentPlansTabSkeleton } from '@/components/skeletons';

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
    const treatmentPlans = treatmentPlansResponse?.data ?? [];
    const { mutate: removePlan } = useTreatmentPlansControllerRemove();
    const { mutate: updatePlan } = useTreatmentPlansControllerUpdate();

    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteType, setDeleteType] = useState<'plan' | 'item' | null>(null);
    const [itemData, setItemData] = useState<{ planId: number, itemId: number, currentItems: any[] } | null>(null);

    const patientPlans = useMemo(() => {
        return (treatmentPlans as any[]).filter(plan => plan.patientId === patientId);
    }, [treatmentPlans, patientId]);

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
                    }
                }
            );
        }
    };

    const handleStatusChange = (id: number, status: string) => {
        updatePlan(
            { id, data: { status: status as any } },
            {
                onSuccess: () => {
                    notificationService.success('Status atualizado!');
                    queryClient.invalidateQueries({ queryKey: ['TreatmentPlansControllerFindAll'] });
                }
            }
        );
    };

    const handleRemoveItem = (planId: number, itemId: number, currentItems: any[]) => {
        setItemData({ planId, itemId, currentItems });
        setDeleteType('item');
    };

    const confirmRemoveItem = () => {
        if (itemData) {
            const updatedItems = itemData.currentItems.filter(item => item.id !== itemData.itemId);

            updatePlan(
                { id: itemData.planId, data: { items: updatedItems } as any },
                {
                    onSuccess: () => {
                        notificationService.success('Item removido com sucesso!');
                        queryClient.invalidateQueries({ queryKey: ['TreatmentPlansControllerFindAll'] });
                        setItemData(null);
                        setDeleteType(null);
                    }
                }
            );
        }
    };

    if (isLoading) return <TreatmentPlansTabSkeleton />;

    if (patientPlans.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold">Nenhum orçamento encontrado</h3>
                        <p className="text-sm text-muted-foreground">
                            Os itens marcados como "Orçamento" no Odontograma aparecerão aqui.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {patientPlans.map((plan) => {
                const config = STATUS_CONFIG[plan.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.DRAFT;
                const StatusIcon = config.icon;

                return (
                    <Card key={plan.id} className="overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-full ${config.color} text-white flex items-center justify-center`}>
                                        <StatusIcon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <CardTitle className="text-xl">Orçamento #{plan.id}</CardTitle>
                                            <Badge variant="secondary" className={`${plan.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' : ''}`}>
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
                                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                                onClick={() => handleStatusChange(plan.id, 'APPROVED')}
                                            >
                                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                                Aprovar
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                                onClick={() => handleStatusChange(plan.id, 'REJECTED')}
                                            >
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Rejeitar
                                            </Button>
                                        </>
                                    )}
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(plan.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Dente</TableHead>
                                        <TableHead>Procedimento</TableHead>
                                        <TableHead>Faces</TableHead>
                                        <TableHead className="text-right">Valor</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(plan.items || []).map((item: any, idx: number) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-medium">
                                                {item.toothNumber ? `Dente ${item.toothNumber}` : 'Geral'}
                                            </TableCell>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell>
                                                {item.surface ? (
                                                    <div className="flex gap-1">
                                                        {item.surface.split(',').map((f: string) => (
                                                            <Badge key={f} variant="outline" className="text-[10px] px-1 py-0">
                                                                {f}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell className="text-right font-mono flex items-center justify-end gap-2">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
                                                {plan.status === 'DRAFT' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-50 hover:opacity-100"
                                                        onClick={() => handleRemoveItem(plan.id, item.id, plan.items)}
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
                            <div className="p-6 bg-muted/10 flex justify-between items-center border-t">
                                <div className="text-sm text-muted-foreground italic">
                                    {plan.notes || 'Sem observações adicionais.'}
                                </div>
                                <div className="text-right">
                                    <span className="text-sm text-muted-foreground mr-4 uppercase tracking-wider font-semibold">Total</span>
                                    <span className="text-2xl font-bold text-primary">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.totalAmount)}
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
                description={deleteType === 'plan'
                    ? 'Esta ação não pode ser desfeita. O orçamento será excluído permanentemente.'
                    : 'O item será removido deste orçamento. O valor total será recalculado.'}
                onConfirm={deleteType === 'plan' ? confirmDeletePlan : confirmRemoveItem}
                confirmText={deleteType === 'plan' ? 'Excluir' : 'Remover'}
                variant="destructive"
            />
        </div>
    );
}

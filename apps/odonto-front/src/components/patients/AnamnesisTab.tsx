'use client';

import { useState } from 'react';
import { useAnamnesisControllerFindAllByPatient } from '@/generated/hooks/useAnamnesisControllerFindAllByPatient';
import { useAnamnesisControllerCreate } from '@/generated/hooks/useAnamnesisControllerCreate';
import { useAnamnesisControllerUpdate } from '@/generated/hooks/useAnamnesisControllerUpdate';
import { useAnamnesisControllerRemove } from '@/generated/hooks/useAnamnesisControllerRemove';
import { useQueryClient } from '@tanstack/react-query';
import { patientsControllerFindOneQueryKey } from '@/generated/hooks/usePatientsControllerFindOne';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Check, Loader2, History, Trash2, Edit2, ChevronRight, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AnamnesisTabSkeleton } from '@/components/skeletons';
import { notificationService } from '@/services/notification.service';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { AnamnesisForm } from './AnamnesisForm';
import { ANAMNESIS_TEMPLATE, AnamnesisCategory } from '@/constants/anamnesis-template';

interface AnamnesisData {
    answers: {
        questionId: string;
        value: any;
        details?: string;
    }[];
}

export function AnamnesisTab({ patientId }: { patientId: number }) {
    const { data: records, isLoading, refetch } = useAnamnesisControllerFindAllByPatient(patientId);
    const { mutate: createAnamnesis, isPending: isCreating } = useAnamnesisControllerCreate();
    const { mutate: updateAnamnesis, isPending: isUpdating } = useAnamnesisControllerUpdate();
    const { mutate: deleteAnamnesis, isPending: isDeleting } = useAnamnesisControllerRemove();
    const queryClient = useQueryClient();

    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editRecord, setEditRecord] = useState<{ id?: number; complaint: string; data: AnamnesisData } | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState<number | null>(null);

    const handleOpenCreate = () => {
        setEditRecord({ complaint: '', data: { answers: [] } });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (record: any) => {
        setEditRecord({
            id: record.id,
            complaint: record.complaint,
            data: record.data?.answers ? record.data : { answers: [] }
        });
        setIsDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        deleteAnamnesis({ id }, {
            onSuccess: () => {
                notificationService.success('Registro excluído!');
                if (selectedId === id) setSelectedId(null);
                setIsDeleteDialogOpen(false);
                setRecordToDelete(null);
                refetch();
            }
        });
    };

    const handleSubmit = (complaint: string, answers: any[]) => {
        const dataPayload = {
            complaint,
            data: { answers },
            patientId
        };

        if (editRecord?.id) {
            updateAnamnesis({ id: editRecord.id, data: dataPayload as any }, {
                onSuccess: () => {
                    notificationService.success('Anamnese atualizada!');
                    setIsDialogOpen(false);
                    queryClient.invalidateQueries({ queryKey: patientsControllerFindOneQueryKey(patientId) });
                    refetch();
                }
            });
        } else {
            createAnamnesis({ data: dataPayload as any }, {
                onSuccess: () => {
                    notificationService.success('Anamnese registrada!');
                    setIsDialogOpen(false);
                    queryClient.invalidateQueries({ queryKey: patientsControllerFindOneQueryKey(patientId) });
                    refetch();
                }
            });
        }
    };

    if (isLoading) {
        return <AnamnesisTabSkeleton />;
    }

    const selectedRecord = records?.find((r: any) => r.id === (selectedId || records[0]?.id));

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar List */}
            <Card className="md:col-span-1 h-[600px] flex flex-col">
                <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <History className="h-4 w-4" /> Histórico
                        </CardTitle>
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleOpenCreate}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <Separator />
                <CardContent className="p-0 overflow-y-auto flex-1">
                    {records && records.length > 0 ? (
                        <div className="divide-y">
                            {records.map((record: any) => (
                                <button
                                    key={record.id}
                                    onClick={() => record.id && setSelectedId(record.id)}
                                    className={cn(
                                        "w-full text-left p-4 hover:bg-muted/50 transition-colors flex flex-col gap-1",
                                        (selectedId || records[0]?.id) === record.id && "bg-primary/5 border-r-2 border-primary"
                                    )}
                                >
                                    <span className="text-xs font-medium text-muted-foreground">
                                        {record.createdAt && format(new Date(record.createdAt), "dd/MM/yyyy HH:mm")}
                                    </span>
                                    <span className="text-sm font-semibold truncate">{record.complaint}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-xs text-muted-foreground italic">
                            Sem registros.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Main Detail View */}
            <Card className="md:col-span-3 min-h-[600px]">
                {selectedRecord ? (
                    <>
                        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                            <div>
                                <CardTitle className="text-xl">{selectedRecord.complaint}</CardTitle>
                                <CardDescription>
                                    Registrado em {selectedRecord.createdAt && format(new Date(selectedRecord.createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="gap-2" onClick={() => handleOpenEdit(selectedRecord)}>
                                    <Edit2 className="h-4 w-4" /> Editar
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-2 text-destructive hover:text-destructive"
                                    onClick={() => {
                                        if (selectedRecord.id) {
                                            setRecordToDelete(selectedRecord.id);
                                            setIsDeleteDialogOpen(true);
                                        }
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" /> Excluir
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-8">
                                {Object.values(AnamnesisCategory).map(category => {
                                    const questionsInCategory = ANAMNESIS_TEMPLATE.filter(q => q.category === category);
                                    const answersInCategory = selectedRecord.data?.answers?.filter((a: any) =>
                                        questionsInCategory.some(q => q.id === a.questionId)
                                    ) || [];

                                    if (answersInCategory.length === 0) return null;

                                    return (
                                        <div key={category} className="space-y-4">
                                            <h4 className="text-sm font-bold text-primary border-l-4 border-primary pl-3 py-1 bg-primary/5">
                                                {category}
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {answersInCategory.map((answer: any) => {
                                                    const question = questionsInCategory.find(q => q.id === answer.questionId);
                                                    if (!question) return null;

                                                    const displayValue = Array.isArray(answer.value)
                                                        ? answer.value.join(', ')
                                                        : typeof answer.value === 'boolean'
                                                            ? (answer.value ? 'Sim' : 'Não')
                                                            : answer.value;

                                                    const hasAlert = selectedRecord.alerts?.some((a: any) => a.questionId === question.id);

                                                    return (
                                                        <div key={answer.questionId} className={cn(
                                                            "p-3 rounded-lg border",
                                                            hasAlert ? "bg-destructive/5 border-destructive/20" : "bg-muted/30 border-muted"
                                                        )}>
                                                            <div className="flex items-start justify-between gap-2">
                                                                <span className="text-xs text-muted-foreground font-medium">{question.label}</span>
                                                                {hasAlert && <AlertCircle className="h-3 w-3 text-destructive" />}
                                                            </div>
                                                            <div className="mt-1 flex flex-col gap-1">
                                                                <span className={cn(
                                                                    "text-sm font-semibold",
                                                                    hasAlert && "text-destructive"
                                                                )}>
                                                                    {displayValue || 'N/A'}
                                                                </span>
                                                                {answer.details && (
                                                                    <p className="text-xs text-muted-foreground italic mt-1 border-t pt-1 border-muted-foreground/10">
                                                                        {answer.details}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}

                                {!selectedRecord.data?.answers && (
                                    <div className="p-8 text-center text-muted-foreground italic bg-muted/20 rounded-lg">
                                        Este registro utiliza um formato antigo e não pode ser exibido com a nova estrutura.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-12 text-center space-y-4">
                        <div className="p-4 bg-muted rounded-full">
                            <Plus className="h-8 w-8" />
                        </div>
                        <div>
                            <p className="font-semibold">Nenhuma anamnese selecionada</p>
                            <p className="text-sm">Selecione um registro ao lado ou crie uma nova ficha.</p>
                        </div>
                        <Button onClick={handleOpenCreate} className="gap-2">
                            <Plus className="h-4 w-4" /> Começar Agora
                        </Button>
                    </div>
                )}
            </Card>

            {/* Entry/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editRecord?.id ? 'Editar Anamnese' : 'Nova Anamnese'}</DialogTitle>
                        <DialogDescription>
                            Preencha os campos abaixo com as informações clínicas do paciente.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <AnamnesisForm
                            initialComplaint={editRecord?.complaint}
                            initialAnswers={editRecord?.data?.answers}
                            onSubmit={handleSubmit}
                            isSubmitting={isCreating || isUpdating}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="Excluir Anamnese"
                description="Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita."
                onConfirm={() => {
                    if (recordToDelete) handleDelete(recordToDelete);
                }}
                isLoading={isDeleting}
                confirmText={isDeleting ? 'Excluindo...' : 'Excluir Registro'}
                variant="destructive"
            />
        </div>
    );
}

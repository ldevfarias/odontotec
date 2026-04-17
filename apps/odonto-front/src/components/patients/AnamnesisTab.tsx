/* eslint-disable prettier/prettier */
'use client';

/* eslint-disable max-lines */

import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertCircle, Edit2, History, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { AnamnesisTabSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ANAMNESIS_TEMPLATE, AnamnesisCategory } from '@/constants/anamnesis-template';
import { useAnamnesisControllerCreate } from '@/generated/hooks/useAnamnesisControllerCreate';
import { useAnamnesisControllerFindAllByPatient } from '@/generated/hooks/useAnamnesisControllerFindAllByPatient';
import { useAnamnesisControllerRemove } from '@/generated/hooks/useAnamnesisControllerRemove';
import { useAnamnesisControllerUpdate } from '@/generated/hooks/useAnamnesisControllerUpdate';
import { patientsControllerFindOneQueryKey } from '@/generated/hooks/usePatientsControllerFindOne';
import type { AnamnesisAnswerDto } from '@/generated/ts/AnamnesisAnswerDto';
import type { CreateAnamnesisDto } from '@/generated/ts/CreateAnamnesisDto';
import { cn } from '@/lib/utils';
import { notificationService } from '@/services/notification.service';

import { AnamnesisForm } from './AnamnesisForm';

interface AnamnesisData {
  answers: {
    questionId: string;
    value: unknown;
    details?: string;
  }[];
}

interface AnamnesisAlert {
  questionId: string;
}

interface AnamnesisRecord {
  id: number;
  complaint: string;
  createdAt?: string;
  data?: AnamnesisData;
  alerts?: AnamnesisAlert[];
}

export function AnamnesisTab({ patientId }: { patientId: number }) {
  const { data: records, isLoading, refetch } = useAnamnesisControllerFindAllByPatient(patientId);
  const { mutate: createAnamnesis, isPending: isCreating } = useAnamnesisControllerCreate();
  const { mutate: updateAnamnesis, isPending: isUpdating } = useAnamnesisControllerUpdate();
  const { mutate: deleteAnamnesis, isPending: isDeleting } = useAnamnesisControllerRemove();
  const queryClient = useQueryClient();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<{
    id?: number;
    complaint: string;
    data: AnamnesisData;
  } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);
  const anamnesisRecords = (records ?? []) as AnamnesisRecord[];

  const handleOpenCreate = () => {
    setEditRecord({ complaint: '', data: { answers: [] } });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (record: AnamnesisRecord) => {
    setEditRecord({
      id: record.id,
      complaint: record.complaint,
      data: record.data?.answers ? record.data : { answers: [] },
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    deleteAnamnesis(
      { id },
      {
        onSuccess: () => {
          notificationService.success('Registro excluído!');
          if (selectedId === id) setSelectedId(null);
          setIsDeleteDialogOpen(false);
          setRecordToDelete(null);
          refetch();
        },
      },
    );
  };

  const handleSubmit = (complaint: string, answers: AnamnesisData['answers']) => {
    const normalizedAnswers: AnamnesisAnswerDto[] = answers.map((answer) => ({
      questionId: answer.questionId,
      details: answer.details,
      value:
        typeof answer.value === 'object' && answer.value !== null
          ? answer.value
          : { value: answer.value ?? '' },
    }));

    const dataPayload: CreateAnamnesisDto = {
      complaint,
      data: { answers: normalizedAnswers },
      patientId,
    };

    if (editRecord?.id) {
      updateAnamnesis(
        { id: editRecord.id, data: dataPayload },
        {
          onSuccess: () => {
            notificationService.success('Anamnese atualizada!');
            setIsDialogOpen(false);
            queryClient.invalidateQueries({
              queryKey: patientsControllerFindOneQueryKey(patientId),
            });
            refetch();
          },
        },
      );
    } else {
      createAnamnesis(
        { data: dataPayload },
        {
          onSuccess: () => {
            notificationService.success('Anamnese registrada!');
            setIsDialogOpen(false);
            queryClient.invalidateQueries({
              queryKey: patientsControllerFindOneQueryKey(patientId),
            });
            refetch();
          },
        },
      );
    }
  };

  if (isLoading) {
    return <AnamnesisTabSkeleton />;
  }

  const selectedRecord = anamnesisRecords.find(
    (record) => record.id === (selectedId || anamnesisRecords[0]?.id),
  );

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
      {/* Mobile: Select dropdown to pick record */}
      <div className="flex items-center gap-2 md:hidden">
        <Select
          value={String(selectedId || anamnesisRecords[0]?.id || '')}
          onValueChange={(val) => setSelectedId(Number(val))}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Selecione uma anamnese..." />
          </SelectTrigger>
          <SelectContent>
            {anamnesisRecords.length > 0 ? (
              anamnesisRecords.map((record) => (
                <SelectItem key={record.id} value={String(record.id)}>
                  {record.complaint || 'Sem queixa'}
                  {record.createdAt ? ` — ${format(new Date(record.createdAt), 'dd/MM/yyyy')}` : ''}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="none" disabled>
                Nenhum registro
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        <Button size="icon" variant="outline" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Sidebar List — desktop only */}
      <Card className="hidden h-150 flex-col md:col-span-1 md:flex">
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <History className="h-4 w-4" /> Histórico
            </CardTitle>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleOpenCreate}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="flex-1 overflow-y-auto p-0">
          {anamnesisRecords.length > 0 ? (
            <div className="divide-y">
              {anamnesisRecords.map((record) => (
                <button
                  key={record.id}
                  onClick={() => record.id && setSelectedId(record.id)}
                  className={cn(
                    'hover:bg-muted/50 flex w-full flex-col gap-1 p-4 text-left transition-colors',
                    (selectedId || anamnesisRecords[0]?.id) === record.id &&
                    'bg-primary/5 border-primary border-r-2',
                  )}
                >
                  <span className="text-muted-foreground text-xs font-medium">
                    {record.createdAt && format(new Date(record.createdAt), 'dd/MM/yyyy HH:mm')}
                  </span>
                  <span className="truncate text-sm font-semibold">{record.complaint}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground p-8 text-center text-xs italic">
              Sem registros.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Detail View */}
      <Card className="col-span-1 min-h-150 md:col-span-3">
        {selectedRecord ? (
          <>
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle className="text-xl">{selectedRecord.complaint}</CardTitle>
                <CardDescription>
                  Registrado em{' '}
                  {selectedRecord.createdAt &&
                    format(
                      new Date(selectedRecord.createdAt),
                      "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                      { locale: ptBR },
                    )}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleOpenEdit(selectedRecord)}
                >
                  <Edit2 className="h-4 w-4" /> Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive gap-2"
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
                {Object.values(AnamnesisCategory).map((category) => {
                  const questionsInCategory = ANAMNESIS_TEMPLATE.filter(
                    (q) => q.category === category,
                  );
                  const answersInCategory =
                    selectedRecord.data?.answers?.filter((answer) =>
                      questionsInCategory.some((q) => q.id === answer.questionId),
                    ) || [];

                  if (answersInCategory.length === 0) return null;

                  return (
                    <div key={category} className="space-y-4">
                      <h4 className="text-primary border-primary bg-primary/5 border-l-4 py-1 pl-3 text-sm font-bold">
                        {category}
                      </h4>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {answersInCategory.map((answer) => {
                          const question = questionsInCategory.find(
                            (q) => q.id === answer.questionId,
                          );
                          if (!question) return null;

                          const displayValue = Array.isArray(answer.value)
                            ? answer.value.join(', ')
                            : typeof answer.value === 'boolean'
                              ? answer.value
                                ? 'Sim'
                                : 'Não'
                              : typeof answer.value === 'string' || typeof answer.value === 'number'
                                ? String(answer.value)
                                : answer.value && typeof answer.value === 'object'
                                  ? JSON.stringify(answer.value)
                                  : 'N/A';

                          const hasAlert = selectedRecord.alerts?.some(
                            (alert) => alert.questionId === question.id,
                          );

                          return (
                            <div
                              key={answer.questionId}
                              className={cn(
                                'rounded-lg border p-3',
                                hasAlert
                                  ? 'bg-destructive/5 border-destructive/20'
                                  : 'bg-muted/30 border-muted',
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-muted-foreground text-xs font-medium">
                                  {question.label}
                                </span>
                                {hasAlert && <AlertCircle className="text-destructive h-3 w-3" />}
                              </div>
                              <div className="mt-1 flex flex-col gap-1">
                                <span
                                  className={cn(
                                    'text-sm font-semibold',
                                    hasAlert && 'text-destructive',
                                  )}
                                >
                                  {displayValue || 'N/A'}
                                </span>
                                {answer.details && (
                                  <p className="text-muted-foreground border-muted-foreground/10 mt-1 border-t pt-1 text-xs italic">
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
                  <div className="text-muted-foreground bg-muted/20 rounded-lg p-8 text-center italic">
                    Este registro utiliza um formato antigo e não pode ser exibido com a nova
                    estrutura.
                  </div>
                )}
              </div>
            </CardContent>
          </>
        ) : (
          <div className="text-muted-foreground flex h-full flex-col items-center justify-center space-y-4 p-12 text-center">
            <div className="bg-muted rounded-full p-4">
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
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
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

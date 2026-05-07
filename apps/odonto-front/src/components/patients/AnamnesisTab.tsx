'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { AnamnesisTabSkeleton } from '@/components/skeletons';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAnamnesisControllerCreate } from '@/generated/hooks/useAnamnesisControllerCreate';
import { useAnamnesisControllerFindAllByPatient } from '@/generated/hooks/useAnamnesisControllerFindAllByPatient';
import { useAnamnesisControllerRemove } from '@/generated/hooks/useAnamnesisControllerRemove';
import { useAnamnesisControllerUpdate } from '@/generated/hooks/useAnamnesisControllerUpdate';
import { patientsControllerFindOneQueryKey } from '@/generated/hooks/usePatientsControllerFindOne';
import type { CreateAnamnesisDto } from '@/generated/ts/CreateAnamnesisDto';
import { notificationService } from '@/services/notification.service';

import {
  type AnamnesisData,
  type AnamnesisRecord,
  buildAnamnesisAnswersPayload,
} from './anamnesis-helpers';
import { AnamnesisDetailCard } from './AnamnesisDetailCard';
import { AnamnesisForm } from './AnamnesisForm';
import { AnamnesisHistoryPanel } from './AnamnesisHistoryPanel';

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
  const selectedRecord = anamnesisRecords.find(
    (record) => record.id === (selectedId || anamnesisRecords[0]?.id),
  );

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
    const dataPayload: CreateAnamnesisDto = {
      complaint,
      data: { answers: buildAnamnesisAnswersPayload(answers) },
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

  return (
    <div className="grid h-full min-h-0 grid-cols-1 gap-6 md:grid-cols-4">
      <AnamnesisHistoryPanel
        records={anamnesisRecords}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onCreate={handleOpenCreate}
      />

      <AnamnesisDetailCard
        selectedRecord={selectedRecord}
        onEdit={handleOpenEdit}
        onDelete={(id) => {
          setRecordToDelete(id);
          setIsDeleteDialogOpen(true);
        }}
        onCreate={handleOpenCreate}
      />

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

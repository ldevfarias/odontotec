'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { patientsControllerFindAllQueryKey } from '@/generated/hooks/usePatientsControllerFindAll';
import { usePatientsControllerRemove } from '@/generated/hooks/usePatientsControllerRemove';
import { analytics, EVENT_NAMES } from '@/services/analytics.service';
import { notificationService } from '@/services/notification.service';

interface DeletePatientDialogProps {
  patientId: number;
  patientName: string;
  onDeleteSuccess?: () => void;
}

export function DeletePatientDialog({
  patientId,
  patientName,
  onDeleteSuccess,
}: DeletePatientDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { mutate: deletePatient, isPending } = usePatientsControllerRemove();

  const handleDelete = () => {
    deletePatient(
      { id: patientId },
      {
        onSuccess: () => {
          notificationService.success(`Paciente ${patientName} removido com sucesso!`);
          analytics.capture(EVENT_NAMES.PATIENT_DELETED, {
            patient_id: patientId,
          });

          // Update cache to remove patient from list
          queryClient.setQueryData(patientsControllerFindAllQueryKey(), (oldData: unknown) => {
            if (Array.isArray(oldData)) {
              return oldData.filter((patient: unknown) => patient.id !== patientId);
            }
            return oldData;
          });

          setIsOpen(false);
          onDeleteSuccess?.();
        },
        onError: (error: unknown) => notificationService.apiError(error),
      },
    );
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="cursor-pointer text-red-500 hover:bg-red-50 hover:text-red-700"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <ConfirmDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Confirmar exclusão"
        description={
          <>
            Tem certeza que deseja remover o paciente <strong>{patientName}</strong>?
            <br />
            <br />
            Esta ação não pode ser desfeita e todos os dados relacionados ao paciente (anamnese,
            exames, evoluções) serão permanentemente excluídos.
          </>
        }
        onConfirm={handleDelete}
        isLoading={isPending}
        confirmText={isPending ? 'Removendo...' : 'Remover Paciente'}
        variant="destructive"
      />
    </>
  );
}

'use client';

import { useState } from 'react';
import { analytics, EVENT_NAMES } from '@/services/analytics.service';
import { Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Button } from '@/components/ui/button';
import { notificationService } from '@/services/notification.service';
import { usePatientsControllerRemove } from '@/generated/hooks/usePatientsControllerRemove';
import { patientsControllerFindAllQueryKey } from '@/generated/hooks/usePatientsControllerFindAll';
import { useQueryClient } from '@tanstack/react-query';

interface DeletePatientDialogProps {
    patientId: number;
    patientName: string;
    onDeleteSuccess?: () => void;
}

export function DeletePatientDialog({ patientId, patientName, onDeleteSuccess }: DeletePatientDialogProps) {
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
                    queryClient.setQueryData(patientsControllerFindAllQueryKey(), (oldData: any) => {
                        if (Array.isArray(oldData)) {
                            return oldData.filter((patient: any) => patient.id !== patientId);
                        }
                        return oldData;
                    });

                    setIsOpen(false);
                    onDeleteSuccess?.();
                },
                onError: (error: any) => notificationService.apiError(error),
            }
        );
    };

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
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
                        Esta ação não pode ser desfeita e todos os dados relacionados ao paciente
                        (anamnese, exames, evoluções) serão permanentemente excluídos.
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

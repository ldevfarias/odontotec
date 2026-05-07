import { useState } from 'react';

import { useDocumentsControllerFindAll } from '@/generated/hooks/useDocumentsControllerFindAll';
import { useDocumentsControllerRemove } from '@/generated/hooks/useDocumentsControllerRemove';
import { notificationService } from '@/services/notification.service';

import { PatientDocumentItem } from '../documents/types';

interface UseDocumentsTabReturn {
  documents: PatientDocumentItem[];
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  documentToDelete: number | null;
  openDeleteDialog: (id: number) => void;
  removeSelectedDocument: () => void;
  refetchDocuments: () => void;
}

export function useDocumentsTab(patientId: number): UseDocumentsTabReturn {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);

  const { data: documentsResponse, refetch } = useDocumentsControllerFindAll({
    patientId: String(patientId),
  });

  const documents = (documentsResponse?.data ?? []) as PatientDocumentItem[];
  const { mutate: removeDocument } = useDocumentsControllerRemove();

  const openDeleteDialog = (id: number) => {
    setDocumentToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const removeSelectedDocument = () => {
    if (!documentToDelete) return;

    removeDocument(
      { id: documentToDelete.toString() },
      {
        onSuccess: () => {
          notificationService.success('Documento excluído com sucesso!');
          setIsDeleteDialogOpen(false);
          setDocumentToDelete(null);
          refetch();
        },
        onError: () => {
          notificationService.error('Erro ao excluir documento.');
        },
      },
    );
  };

  return {
    documents,
    isDialogOpen,
    setIsDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    documentToDelete,
    openDeleteDialog,
    removeSelectedDocument,
    refetchDocuments: refetch,
  };
}

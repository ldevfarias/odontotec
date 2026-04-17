'use client';

import { useState } from 'react';

import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { api } from '@/lib/api';
import { notificationService } from '@/services/notification.service';

interface DeleteUserDialogProps {
  user: unknown;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteUserDialog({ user, open, onOpenChange, onSuccess }: DeleteUserDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function onConfirm() {
    if (!user) return;

    setIsDeleting(true);
    try {
      await api.delete(`/users/${user.id}`);
      notificationService.success('Usuário desativado com sucesso!');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      notificationService.apiError(error, 'Erro ao desativar usuário.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Desativar usuário?"
      description={
        <>
          Tem certeza que deseja desativar <b>{user?.name}</b>? O usuário perderá o acesso ao
          sistema imediatamente.
        </>
      }
      onConfirm={onConfirm}
      isLoading={isDeleting}
      confirmText={isDeleting ? 'Desativando...' : 'Desativar'}
      variant="destructive"
    />
  );
}

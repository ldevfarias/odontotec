'use client';

import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

import { ProcedureFormDialog } from './components/ProcedureFormDialog';
import { ProceduresListCard } from './components/ProceduresListCard';
import { useProceduresCatalog } from './hooks/useProceduresCatalog';
import type { Procedure, ProcedureFormValues } from './types';

export default function ProceduresPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    procedures,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    saveProcedure,
    deleteProcedure,
  } = useProceduresCatalog();

  const filteredProcedures = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    if (!normalizedSearchTerm) {
      return procedures;
    }

    return procedures.filter((procedure) =>
      procedure.name.toLowerCase().includes(normalizedSearchTerm),
    );
  }, [procedures, searchTerm]);

  const openCreateDialog = () => {
    setEditingProcedure(null);
    setIsFormOpen(true);
  };

  const openEditDialog = (procedure: Procedure) => {
    setEditingProcedure(procedure);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (id: number) => {
    setIdToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const closeFormDialog = () => {
    setIsFormOpen(false);
    setEditingProcedure(null);
  };

  const handleSubmit = async (values: ProcedureFormValues) => {
    const didSave = await saveProcedure(values, editingProcedure?.id ?? null);

    if (didSave) {
      closeFormDialog();
    }
  };

  const handleConfirmDelete = async () => {
    if (idToDelete === null) {
      return;
    }

    const didDelete = await deleteProcedure(idToDelete);

    if (didDelete) {
      setIsDeleteDialogOpen(false);
      setIdToDelete(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Catálogo de Procedimentos
          </h1>
          <p className="text-muted-foreground hidden sm:block">
            Configure os procedimentos e valores base da sua clínica.
          </p>
        </div>

        <Button size="sm" className="shrink-0 gap-2" onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novo Procedimento</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </div>

      <ProceduresListCard
        filteredProcedures={filteredProcedures}
        isLoading={isLoading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onEdit={openEditDialog}
        onDelete={openDeleteDialog}
      />

      <ProcedureFormDialog
        open={isFormOpen}
        editingProcedure={editingProcedure}
        isSubmitting={isCreating || isUpdating}
        onClose={closeFormDialog}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Procedimento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este procedimento do catálogo? Esta ação não poderá ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIdToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

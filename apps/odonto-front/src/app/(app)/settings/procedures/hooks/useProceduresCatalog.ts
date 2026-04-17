import { useQueryClient } from '@tanstack/react-query';

import { useClinicProceduresControllerCreate } from '@/generated/hooks/useClinicProceduresControllerCreate';
import {
  clinicProceduresControllerFindAllQueryKey,
  useClinicProceduresControllerFindAll,
} from '@/generated/hooks/useClinicProceduresControllerFindAll';
import { useClinicProceduresControllerRemove } from '@/generated/hooks/useClinicProceduresControllerRemove';
import { useClinicProceduresControllerUpdate } from '@/generated/hooks/useClinicProceduresControllerUpdate';
import { notificationService } from '@/services/notification.service';

import {
  normalizeProcedureMutationResponse,
  normalizeProceduresResponse,
  type Procedure,
  type ProcedureFormValues,
} from '../types';

interface ProceduresQueryShape {
  data?: unknown;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const updateQueryDataWithList = (
  previous: unknown,
  updater: (current: Procedure[]) => Procedure[],
): unknown => {
  const currentList = normalizeProceduresResponse(previous);
  const nextList = updater(currentList);

  if (Array.isArray(previous)) {
    return nextList;
  }

  if (isObject(previous)) {
    return {
      ...previous,
      data: nextList,
    } as ProceduresQueryShape;
  }

  return nextList;
};

export function useProceduresCatalog() {
  const queryClient = useQueryClient();

  const { data: proceduresResponse, isLoading } = useClinicProceduresControllerFindAll();
  const { mutateAsync: createProcedureMutation, isPending: isCreating } =
    useClinicProceduresControllerCreate();
  const { mutateAsync: updateProcedureMutation, isPending: isUpdating } =
    useClinicProceduresControllerUpdate();
  const { mutateAsync: removeProcedureMutation, isPending: isDeleting } =
    useClinicProceduresControllerRemove();

  const procedures = normalizeProceduresResponse(proceduresResponse);

  const saveProcedure = async (
    values: ProcedureFormValues,
    editingProcedureId: number | null,
  ): Promise<boolean> => {
    try {
      if (editingProcedureId !== null) {
        const response = await updateProcedureMutation({ id: editingProcedureId, data: values });
        const updatedProcedure = normalizeProcedureMutationResponse(response);

        if (!updatedProcedure) {
          notificationService.error('Erro ao atualizar procedimento.');
          return false;
        }

        queryClient.setQueryData(clinicProceduresControllerFindAllQueryKey(), (previous) =>
          updateQueryDataWithList(previous, (current) =>
            current.map((item) => (item.id === editingProcedureId ? updatedProcedure : item)),
          ),
        );

        notificationService.success('Procedimento atualizado!');
        return true;
      }

      const response = await createProcedureMutation({ data: values });
      const createdProcedure = normalizeProcedureMutationResponse(response);

      if (!createdProcedure) {
        notificationService.error('Erro ao criar procedimento.');
        return false;
      }

      queryClient.setQueryData(clinicProceduresControllerFindAllQueryKey(), (previous) =>
        updateQueryDataWithList(previous, (current) => [createdProcedure, ...current]),
      );

      notificationService.success('Procedimento criado!');
      return true;
    } catch {
      notificationService.error('Não foi possível salvar o procedimento.');
      return false;
    }
  };

  const deleteProcedure = async (id: number): Promise<boolean> => {
    try {
      await removeProcedureMutation({ id });

      queryClient.setQueryData(clinicProceduresControllerFindAllQueryKey(), (previous) =>
        updateQueryDataWithList(previous, (current) => current.filter((item) => item.id !== id)),
      );

      notificationService.success('Procedimento removido!');
      return true;
    } catch {
      notificationService.error('Erro ao remover procedimento. Verifique suas permissões.');
      return false;
    }
  };

  return {
    procedures,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    saveProcedure,
    deleteProcedure,
  };
}

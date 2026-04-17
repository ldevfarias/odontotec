import { z } from 'zod';

export const procedureFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.optional(z.string()),
  baseValue: z.number().min(0, 'Valor deve ser positivo'),
});

export type ProcedureFormValues = z.infer<typeof procedureFormSchema>;

export interface Procedure {
  id: number;
  name: string;
  description?: string | null;
  baseValue: number;
}

interface ProcedureLike {
  id?: unknown;
  name?: unknown;
  description?: unknown;
  baseValue?: unknown;
}

interface QueryDataLike {
  data?: unknown;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toProcedure = (value: unknown): Procedure | null => {
  if (!isObject(value)) {
    return null;
  }

  const procedure = value as ProcedureLike;

  if (typeof procedure.id !== 'number' || typeof procedure.name !== 'string') {
    return null;
  }

  const rawBaseValue = procedure.baseValue;
  const parsedBaseValue =
    typeof rawBaseValue === 'number'
      ? rawBaseValue
      : typeof rawBaseValue === 'string'
        ? parseFloat(rawBaseValue)
        : NaN;

  return {
    id: procedure.id,
    name: procedure.name,
    description: typeof procedure.description === 'string' ? procedure.description : null,
    baseValue: Number.isFinite(parsedBaseValue) ? parsedBaseValue : 0,
  };
};

export const normalizeProceduresResponse = (response: unknown): Procedure[] => {
  const payload = isObject(response) ? ((response as QueryDataLike).data ?? response) : response;

  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.map(toProcedure).filter((item): item is Procedure => item !== null);
};

export const normalizeProcedureMutationResponse = (response: unknown): Procedure | null => {
  const payload = isObject(response) ? ((response as QueryDataLike).data ?? response) : response;
  return toProcedure(payload);
};

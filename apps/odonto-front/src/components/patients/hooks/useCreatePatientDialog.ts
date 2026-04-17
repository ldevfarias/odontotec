'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { usePatientsControllerCreate } from '@/generated/hooks/usePatientsControllerCreate';
import { patientsControllerFindAllQueryKey } from '@/generated/hooks/usePatientsControllerFindAll';
import type { PatientsControllerCreateMutationRequest } from '@/generated/ts/PatientsControllerCreate';
import { analytics, EVENT_NAMES } from '@/services/analytics.service';
import { notificationService } from '@/services/notification.service';
import { commonValidations } from '@/utils/validations';

const patientFormSchema = z.object({
  name: commonValidations.stringLimit(100).min(1, 'Nome é obrigatório'),
  email: commonValidations.email.min(1, 'E-mail é obrigatório'),
  phone: commonValidations.phone.min(1, 'Telefone é obrigatório'),
  birthDate: commonValidations.birthDate.min(1, 'Data de nascimento é obrigatória'),
  document: commonValidations.cpf,
  address: z.union([commonValidations.stringLimit(255), z.literal('')]).optional(),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;

function buildCreatePatientPayload(
  values: PatientFormValues,
): PatientsControllerCreateMutationRequest {
  return {
    name: values.name.trim(),
    email: values.email || undefined,
    phone: values.phone || undefined,
    birthDate: values.birthDate || undefined,
    document: values.document || undefined,
    address: values.address || undefined,
  };
}

function extractPatientId(response: unknown): number | null {
  if (typeof response !== 'object' || response === null) {
    return null;
  }

  const id = (response as { id?: unknown }).id;
  return typeof id === 'number' ? id : null;
}

function normalizeCreatedPatientForCache(patient: unknown): unknown {
  if (typeof patient !== 'object' || patient === null) {
    return null;
  }

  const patientObj = patient as Record<string, unknown>;

  return {
    id: patientObj.id,
    name: patientObj.name,
    birthDate: patientObj.birthDate || null,
    email: patientObj.email || null,
    phone: patientObj.phone || null,
    address: patientObj.address || null,
    document: patientObj.document || null,
    clinicId: patientObj.clinicId,
    createdAt: patientObj.createdAt || new Date().toISOString(),
    updatedAt: patientObj.updatedAt || new Date().toISOString(),
    lastProcedureDate: null,
    nextAppointmentDate: null,
  };
}

function prependCreatedPatientToCache(oldData: unknown, createdPatient: unknown): unknown {
  if (typeof createdPatient !== 'object' || createdPatient === null) {
    return oldData;
  }

  const createdPatientId = (createdPatient as { id?: unknown }).id;
  if (typeof createdPatientId !== 'number') {
    return oldData;
  }

  if (!oldData || typeof oldData !== 'object') {
    return oldData;
  }

  const currentData = (oldData as { data?: unknown }).data;
  if (!Array.isArray(currentData)) {
    return oldData;
  }

  const alreadyExists = currentData.some((item) => {
    if (typeof item !== 'object' || item === null) {
      return false;
    }

    return (item as { id?: unknown }).id === createdPatientId;
  });

  if (alreadyExists) {
    return oldData;
  }

  const normalizedPatient = normalizeCreatedPatientForCache(createdPatient);
  const currentTotal = (oldData as { total?: unknown }).total;

  return {
    ...(oldData as Record<string, unknown>),
    data: [normalizedPatient, ...currentData],
    total: typeof currentTotal === 'number' ? currentTotal + 1 : currentTotal,
  };
}

export function useCreatePatientDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { mutate: createPatient, isPending: isCreating } = usePatientsControllerCreate();

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      birthDate: '',
      address: '',
      document: '',
    },
  });

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset();
    }
  };

  const onSubmit = (values: PatientFormValues) => {
    const payload = buildCreatePatientPayload(values);

    createPatient(
      { data: payload },
      {
        onSuccess: (createdPatient) => {
          notificationService.success('Paciente cadastrado com sucesso!');
          const patientId = extractPatientId(createdPatient);

          if (patientId !== null) {
            analytics.capture(EVENT_NAMES.PATIENT_CREATED, {
              patient_id: patientId,
              has_address: !!values.address,
            });
          }

          queryClient.setQueriesData(
            {
              queryKey: patientsControllerFindAllQueryKey(),
            },
            (oldData) => prependCreatedPatientToCache(oldData, createdPatient),
          );

          form.reset();
          setIsOpen(false);
        },
        onError: (error: unknown) => {
          console.error('Erro ao cadastrar paciente:', error);
          notificationService.apiError(error, 'Erro ao cadastrar paciente.');
        },
      },
    );
  };

  return {
    form,
    isOpen,
    isCreating,
    onSubmit,
    handleOpenChange,
  };
}

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { usePatientsControllerCreate } from '@/generated/hooks/usePatientsControllerCreate';
import { patientsControllerFindAllQueryKey } from '@/generated/hooks/usePatientsControllerFindAll';
import { patientsControllerCreateMutationRequestSchema } from '@/generated/zod/patientsControllerCreateSchema';
import { analytics, EVENT_NAMES } from '@/services/analytics.service';
import { notificationService } from '@/services/notification.service';
import { cpfMask, phoneMask } from '@/utils/masks';
import { commonValidations } from '@/utils/validations';

const patientFormSchema = z.object({
  name: commonValidations.stringLimit(100).min(1, 'Nome é obrigatório'),
  email: commonValidations.email.min(1, 'E-mail é obrigatório'),
  phone: commonValidations.phone.min(1, 'Telefone é obrigatório'),
  birthDate: commonValidations.birthDate.min(1, 'Data de nascimento é obrigatória'),
  document: commonValidations.cpf, // CPF min is handled by valid CPF mask checking
  address: z.union([commonValidations.stringLimit(255), z.literal('')]).optional(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

export function CreatePatientDialog() {
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

  function onSubmit(values: PatientFormValues) {
    // Remove empty string values to prevent validation errors
    const cleanedValues = Object.entries(values).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key as keyof PatientFormValues] = value;
      }
      return acc;
    }, {} as Partial<PatientFormValues>);

    createPatient(
      { data: cleanedValues as PatientFormValues },
      {
        onSuccess: (newPatient) => {
          notificationService.success('Paciente cadastrado com sucesso!');
          analytics.capture(EVENT_NAMES.PATIENT_CREATED, {
            patient_id: (newPatient as any)?.id,
            has_address: !!values.address,
          });

          // Cache optimization: Update the list locally without a new request
          queryClient.setQueryData(patientsControllerFindAllQueryKey(), (oldData: any) => {
            const patientsList = Array.isArray(oldData) ? oldData : [];
            return [newPatient, ...patientsList];
          });

          form.reset();
          setIsOpen(false);
        },
        onError: (error: any) => {
          console.error('Erro ao cadastrar paciente:', error);
          notificationService.apiError(error, 'Erro ao cadastrar paciente.');
        },
      },
    );
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button className="cursor-pointer gap-2">
          <Plus className="h-4 w-4" />
          Novo Paciente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Paciente</DialogTitle>
          <DialogDescription>
            Preencha os dados básicos para iniciar o prontuário.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do paciente" maxLength={100} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                        {...field}
                        onChange={(e) => field.onChange(phoneMask(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="email@exemplo.com" maxLength={100} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000.000.000-00"
                        maxLength={14}
                        {...field}
                        onChange={(e) => field.onChange(cpfMask(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Rua, número, bairro, cidade" maxLength={255} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button
                type="submit"
                disabled={isCreating || !form.formState.isValid}
                className="w-full sm:w-auto"
              >
                {isCreating ? 'Cadastrando...' : 'Salvar Paciente'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';

import { DateField } from './components/DateField';
import { DentistComboboxField } from './components/DentistComboboxField';
import { DurationField } from './components/DurationField';
import { PatientComboboxField } from './components/PatientComboboxField';
import { StatusField } from './components/StatusField';
import { TimeSlotField } from './components/TimeSlotField';
import { type AppointmentModalProps, useAppointmentForm } from './hooks/useAppointmentForm';

export function AppointmentModal(props: AppointmentModalProps) {
  const {
    form,
    onSubmit,
    isPending,
    isEditing,
    isDentist,
    patients,
    dentists,
    watchDate,
    watchDentist,
    slotsWithOriginal,
    isFetchingSlots,
    isPatientPopoverOpen,
    setIsPatientPopoverOpen,
    isDentistPopoverOpen,
    setIsDentistPopoverOpen,
  } = useAppointmentForm(props);

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Altere os dados do agendamento abaixo.'
              : 'Selecione o paciente, o profissional e o horário para agendar.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <PatientComboboxField
              control={form.control}
              patients={patients}
              open={isPatientPopoverOpen}
              onOpenChange={setIsPatientPopoverOpen}
            />

            {!isDentist && (
              <DentistComboboxField
                control={form.control}
                dentists={dentists}
                open={isDentistPopoverOpen}
                onOpenChange={setIsDentistPopoverOpen}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <DateField control={form.control} />
              <DurationField control={form.control} />
            </div>

            <TimeSlotField
              control={form.control}
              slots={slotsWithOriginal}
              isFetching={isFetchingSlots}
              watchDentist={watchDentist}
              watchDate={watchDate}
            />

            {isEditing && <StatusField control={form.control} />}

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => props.onOpenChange(false)}
                className="rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending || !form.formState.isValid || isFetchingSlots}
                className="rounded-xl px-8"
              >
                {isPending ? 'Salvando...' : 'Confirmar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

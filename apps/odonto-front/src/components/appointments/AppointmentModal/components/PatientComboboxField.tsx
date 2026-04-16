import { Check, ChevronsUpDown } from 'lucide-react';
import { type Control } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import type { AppointmentFormValues, PatientRecord } from '../hooks/useAppointmentForm';

interface PatientComboboxFieldProps {
  control: Control<AppointmentFormValues>;
  patients: PatientRecord[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PatientComboboxField({
  control,
  patients,
  open,
  onOpenChange,
}: PatientComboboxFieldProps) {
  return (
    <FormField
      control={control}
      name="patientId"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Paciente</FormLabel>
          <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    'w-full justify-between rounded-xl',
                    !field.value && 'text-muted-foreground',
                  )}
                >
                  {field.value
                    ? patients.find((p) => p.id === field.value)?.name
                    : 'Selecionar paciente...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[450px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar paciente..." />
                <CommandList>
                  <CommandEmpty>Paciente não encontrado.</CommandEmpty>
                  <CommandGroup>
                    {patients.map((patient) => (
                      <CommandItem
                        value={patient.name}
                        key={patient.id}
                        onSelect={() => {
                          field.onChange(patient.id);
                          onOpenChange(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            patient.id === field.value ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        {patient.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

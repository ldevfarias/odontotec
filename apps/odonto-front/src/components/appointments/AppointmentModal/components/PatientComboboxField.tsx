import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { type Control } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import type { AppointmentFormValues, PatientRecord } from '../hooks/useAppointmentForm';

interface PatientComboboxFieldProps {
  control: Control<AppointmentFormValues>;
  patients: PatientRecord[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingPatientName?: string;
  onCreateNew?: (name: string) => void;
  onClearNewPatient?: () => void;
}

export function PatientComboboxField({
  control,
  patients,
  open,
  onOpenChange,
  pendingPatientName,
  onCreateNew,
  onClearNewPatient,
}: PatientComboboxFieldProps) {
  const [searchValue, setSearchValue] = useState('');

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchValue.toLowerCase().trim()),
  );

  if (pendingPatientName) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Paciente</span>
        <div className="flex items-center justify-between rounded-xl border px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">{pendingPatientName}</span>
            <Badge variant="secondary" className="text-xs">
              Novo paciente
            </Badge>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={onClearNewPatient}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

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
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Buscar paciente..."
                  value={searchValue}
                  onValueChange={setSearchValue}
                />
                <CommandList>
                  {filteredPatients.length > 0 && (
                    <CommandGroup>
                      {filteredPatients.map((patient) => (
                        <CommandItem
                          key={patient.id}
                          value={String(patient.id)}
                          onSelect={() => {
                            field.onChange(patient.id);
                            setSearchValue('');
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
                  )}
                  {searchValue.trim() && (
                    <CommandGroup>
                      <CommandItem
                        value="__create__"
                        onSelect={() => {
                          field.onChange(0);
                          onCreateNew?.(searchValue.trim());
                          setSearchValue('');
                          onOpenChange(false);
                        }}
                        className="cursor-pointer"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Cadastrar &quot;{searchValue.trim()}&quot; como novo paciente
                      </CommandItem>
                    </CommandGroup>
                  )}
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

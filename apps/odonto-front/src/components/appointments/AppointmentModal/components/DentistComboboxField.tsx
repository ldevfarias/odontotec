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
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import type { AppointmentFormValues, UserRecord } from '../hooks/useAppointmentForm';

interface DentistComboboxFieldProps {
  control: Control<AppointmentFormValues>;
  dentists: UserRecord[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DentistComboboxField({
  control,
  dentists,
  open,
  onOpenChange,
}: DentistComboboxFieldProps) {
  return (
    <FormField
      control={control}
      name="dentistId"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Dentista / Responsável</FormLabel>
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
                    ? dentists.find((d) => d.id === field.value)?.name
                    : 'Selecionar dentista...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[450px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar dentista..." />
                <CommandList>
                  <CommandEmpty>Dentista não encontrado.</CommandEmpty>
                  <CommandGroup>
                    {dentists.map((dentist) => (
                      <CommandItem
                        value={dentist.name}
                        key={dentist.id}
                        onSelect={() => {
                          field.onChange(dentist.id);
                          onOpenChange(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            dentist.id === field.value ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        {dentist.name}
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

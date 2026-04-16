import { Clock } from 'lucide-react';
import { type Control } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { AppointmentFormValues } from '../hooks/useAppointmentForm';

interface TimeSlotFieldProps {
  control: Control<AppointmentFormValues>;
  slots: string[];
  isFetching: boolean;
  watchDentist: number;
  watchDate: string;
}

export function TimeSlotField({
  control,
  slots,
  isFetching,
  watchDentist,
  watchDate,
}: TimeSlotFieldProps) {
  return (
    <FormField
      control={control}
      name="timeOnly"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            Horário livre
            {isFetching && (
              <Clock className="text-muted-foreground ml-2 inline-block h-3 w-3 animate-spin" />
            )}
          </FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value}
            disabled={!watchDate || !watchDentist || isFetching || slots.length === 0}
          >
            <FormControl>
              <SelectTrigger className="rounded-xl">
                <SelectValue
                  placeholder={
                    !watchDentist
                      ? 'Selecione o dentista'
                      : isFetching
                        ? 'Carregando...'
                        : slots.length === 0
                          ? 'Nenhum horário'
                          : 'Selecione um horário'
                  }
                />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {slots.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

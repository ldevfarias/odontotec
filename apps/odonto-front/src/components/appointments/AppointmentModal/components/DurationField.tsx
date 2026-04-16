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

interface DurationFieldProps {
  control: Control<AppointmentFormValues>;
}

export function DurationField({ control }: DurationFieldProps) {
  return (
    <FormField
      control={control}
      name="duration"
      render={({ field }) => (
        <FormItem className="pt-2">
          <FormLabel>Duração</FormLabel>
          <Select
            onValueChange={(v) => field.onChange(parseInt(v))}
            value={field.value.toString()}
          >
            <FormControl>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Selecione a duração" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="15">15 minutos</SelectItem>
              <SelectItem value="30">30 minutos</SelectItem>
              <SelectItem value="45">45 minutos</SelectItem>
              <SelectItem value="60">1 hora</SelectItem>
              <SelectItem value="90">1 hora e 30 min</SelectItem>
              <SelectItem value="120">2 horas</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

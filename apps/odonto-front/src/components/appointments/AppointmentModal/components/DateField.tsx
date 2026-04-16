import { format, parseISO } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { type Control } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import type { AppointmentFormValues } from '../hooks/useAppointmentForm';

interface DateFieldProps {
  control: Control<AppointmentFormValues>;
}

export function DateField({ control }: DateFieldProps) {
  return (
    <FormField
      control={control}
      name="dateOnly"
      render={({ field }) => (
        <FormItem className="flex flex-col pt-2">
          <FormLabel>Data</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start rounded-xl text-left font-normal',
                    !field.value && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? (
                    format(parseISO(field.value), 'dd/MM/yyyy')
                  ) : (
                    <span>Selecione a data</span>
                  )}
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value ? parseISO(field.value) : undefined}
                onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

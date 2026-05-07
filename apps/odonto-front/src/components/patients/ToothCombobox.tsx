'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// FDI Tooth Numbers
const ADULT_TEETH = [
  11, 12, 13, 14, 15, 16, 17, 18, 21, 22, 23, 24, 25, 26, 27, 28, 31, 32, 33, 34, 35, 36, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48,
];

const PEDIATRIC_TEETH = [
  51, 52, 53, 54, 55, 61, 62, 63, 64, 65, 71, 72, 73, 74, 75, 81, 82, 83, 84, 85,
];

interface ToothComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

export function ToothCombobox({ value, onChange }: ToothComboboxProps) {
  const [open, setOpen] = useState(false);

  const displayLabel = value
    ? value === 'general'
      ? 'Geral (Sem dente)'
      : `Dente ${value}`
    : 'Selecione o dente';

  const handleSelect = (selected: string) => {
    onChange(selected);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'border-input flex h-9 w-full items-center justify-between gap-2 border px-3 py-2 text-sm shadow-xs transition-[color,box-shadow]',
            'dark:bg-input/30 dark:hover:bg-input/50 focus-visible:border-ring focus-visible:ring-ring/50 bg-transparent font-normal focus-visible:ring-[3px]',
            'hover:text-foreground hover:bg-transparent',
            !value && 'text-muted-foreground',
          )}
        >
          {displayLabel}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command filter={(val, search) => (val.includes(search) ? 1 : 0)}>
          <CommandInput placeholder="Pesquisar dente..." />
          <CommandList>
            <CommandEmpty>Nenhum dente encontrado.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="general"
                keywords={['general', 'geral', 'sem', 'dente']}
                onSelect={() => handleSelect('general')}
              >
                <Check className={cn('mr-2 h-4 w-4', value === 'general' ? 'opacity-100' : 'opacity-0')} />
                Geral (Sem dente)
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Dentes Permanentes">
              {ADULT_TEETH.map((tooth) => (
                <CommandItem
                  key={tooth}
                  value={String(tooth)}
                  keywords={[String(tooth), `dente ${tooth}`, 'permanente']}
                  onSelect={() => handleSelect(String(tooth))}
                >
                  <Check
                    className={cn('mr-2 h-4 w-4', value === String(tooth) ? 'opacity-100' : 'opacity-0')}
                  />
                  Dente {tooth}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Dentes Decíduos">
              {PEDIATRIC_TEETH.map((tooth) => (
                <CommandItem
                  key={tooth}
                  value={String(tooth)}
                  keywords={[String(tooth), `dente ${tooth}`, 'decíduo', 'deciduo']}
                  onSelect={() => handleSelect(String(tooth))}
                >
                  <Check
                    className={cn('mr-2 h-4 w-4', value === String(tooth) ? 'opacity-100' : 'opacity-0')}
                  />
                  Dente {tooth}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

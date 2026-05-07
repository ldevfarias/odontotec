'use client';

import { format } from 'date-fns';
import { History, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

import type { AnamnesisRecord } from './anamnesis-helpers';

interface AnamnesisHistoryPanelProps {
  records: AnamnesisRecord[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onCreate: () => void;
}

export function AnamnesisHistoryPanel({
  records,
  selectedId,
  onSelect,
  onCreate,
}: AnamnesisHistoryPanelProps) {
  const selectedValue = String(selectedId || records[0]?.id || '');

  return (
    <>
      <div className="flex items-center gap-2 md:hidden">
        <Select value={selectedValue} onValueChange={(value) => onSelect(Number(value))}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Selecione uma anamnese..." />
          </SelectTrigger>
          <SelectContent>
            {records.length > 0 ? (
              records.map((record) => (
                <SelectItem key={record.id} value={String(record.id)}>
                  {record.complaint || 'Sem queixa'}
                  {record.createdAt ? ` — ${format(new Date(record.createdAt), 'dd/MM/yyyy')}` : ''}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="none" disabled>
                Nenhum registro
              </SelectItem>
            )}
          </SelectContent>
        </Select>
        <Button size="icon" variant="outline" onClick={onCreate}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Card className="hidden min-h-0 overflow-hidden md:col-span-1 md:flex md:h-full">
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <History className="h-4 w-4" /> Histórico
            </CardTitle>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onCreate}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="flex-1 overflow-y-auto p-0">
          {records.length > 0 ? (
            <div className="divide-y">
              {records.map((record) => (
                <button
                  key={record.id}
                  onClick={() => onSelect(record.id)}
                  className={cn(
                    'hover:bg-muted/50 flex w-full flex-col gap-1 p-4 text-left transition-colors',
                    (selectedId || records[0]?.id) === record.id &&
                    'bg-primary/5 border-primary border-r-2',
                  )}
                >
                  <span className="text-muted-foreground text-xs font-medium">
                    {record.createdAt && format(new Date(record.createdAt), 'dd/MM/yyyy HH:mm')}
                  </span>
                  <span className="truncate text-sm font-semibold">{record.complaint}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground p-8 text-center text-xs italic">
              Sem registros.
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

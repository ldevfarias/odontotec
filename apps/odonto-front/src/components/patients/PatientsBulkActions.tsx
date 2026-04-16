import { Send, X } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';

interface PatientsBulkActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onSendMessage: () => void;
}

export function PatientsBulkActions({
  selectedCount,
  onClearSelection,
  onSendMessage,
}: PatientsBulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <>
      {/* Mobile: barra full-width */}
      <div className="animate-in slide-in-from-bottom-4 fade-in bg-background border-border fixed right-0 bottom-0 left-0 z-50 flex items-center gap-3 border-t px-4 py-3 shadow-lg duration-300 sm:hidden">
        <span className="bg-primary/10 text-primary flex h-6 shrink-0 items-center justify-center rounded-full px-2.5 text-sm font-medium">
          {selectedCount}
        </span>
        <span className="text-foreground flex-1 text-sm font-medium">
          {selectedCount === 1 ? 'selecionado' : 'selecionados'}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="text-foreground gap-2 rounded-lg hover:bg-gray-100"
          onClick={onSendMessage}
        >
          <Send className="h-4 w-4" />
          Mensagem
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground h-8 w-8 shrink-0 rounded-full"
          onClick={onClearSelection}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Desktop: pill flutuante */}
      <div className="animate-in slide-in-from-bottom-10 fade-in fixed bottom-8 left-1/2 z-50 hidden -translate-x-1/2 duration-300 sm:block">
        <div className="card-surface bg-background flex items-center gap-6 rounded-full border border-gray-200 px-6 py-4 shadow-xl">
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary flex h-6 items-center justify-center rounded-full px-2.5 text-sm font-medium">
              {selectedCount}
            </span>
            <span className="body-small text-foreground font-medium whitespace-nowrap">
              {selectedCount === 1 ? 'Paciente selecionado' : 'Pacientes selecionados'}
            </span>
          </div>

          <div className="divider-vertical h-6" />

          <Button
            variant="ghost"
            className="text-foreground gap-2 rounded-full hover:bg-gray-100"
            onClick={onSendMessage}
          >
            <Send className="h-4 w-4" />
            Enviar Mensagem
          </Button>

          <div className="divider-vertical h-6" />

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground h-8 w-8 rounded-full"
            onClick={onClearSelection}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}

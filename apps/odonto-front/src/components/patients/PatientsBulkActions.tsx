import React from 'react';
import { Button } from '@/components/ui/button';
import { Send, X } from 'lucide-react';

interface PatientsBulkActionsProps {
    selectedCount: number;
    onClearSelection: () => void;
    onSendMessage: () => void;
}

export function PatientsBulkActions({
    selectedCount,
    onClearSelection,
    onSendMessage
}: PatientsBulkActionsProps) {
    if (selectedCount === 0) return null;

    return (
        <>
            {/* Mobile: barra full-width */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300 bg-background border-t border-border px-4 py-3 flex items-center gap-3 shadow-lg">
                <span className="bg-primary/10 text-primary h-6 px-2.5 rounded-full text-sm font-medium flex items-center justify-center shrink-0">
                    {selectedCount}
                </span>
                <span className="text-sm font-medium text-foreground flex-1">
                    {selectedCount === 1 ? 'selecionado' : 'selecionados'}
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-foreground hover:bg-gray-100 rounded-lg"
                    onClick={onSendMessage}
                >
                    <Send className="h-4 w-4" />
                    Mensagem
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground shrink-0"
                    onClick={onClearSelection}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Desktop: pill flutuante */}
            <div className="hidden sm:block fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
                <div className="card-surface px-6 py-4 flex items-center gap-6 shadow-xl rounded-full bg-background border border-gray-200">
                    <div className="flex items-center gap-2">
                        <span className="bg-primary/10 text-primary h-6 px-2.5 rounded-full text-sm font-medium flex items-center justify-center">
                            {selectedCount}
                        </span>
                        <span className="body-small font-medium text-foreground whitespace-nowrap">
                            {selectedCount === 1 ? 'Paciente selecionado' : 'Pacientes selecionados'}
                        </span>
                    </div>

                    <div className="divider-vertical h-6" />

                    <Button
                        variant="ghost"
                        className="gap-2 text-foreground hover:bg-gray-100 rounded-full"
                        onClick={onSendMessage}
                    >
                        <Send className="h-4 w-4" />
                        Enviar Mensagem
                    </Button>

                    <div className="divider-vertical h-6" />

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                        onClick={onClearSelection}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </>
    );
}

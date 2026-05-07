import { format, subHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Printer, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { PatientDocumentItem } from './types';

interface DocumentsMobileListProps {
  documents: PatientDocumentItem[];
  onPrint: (doc: PatientDocumentItem) => void;
  onRequestDelete: (id: number) => void;
}

export function DocumentsMobileList({
  documents,
  onPrint,
  onRequestDelete,
}: DocumentsMobileListProps) {
  return (
    <div className="divide-border border-border flex flex-col divide-y overflow-hidden rounded-xl border sm:hidden">
      {documents.map((doc) => (
        <div key={doc.id} className="bg-card flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={doc.type === 'ATESTADO' ? 'default' : 'secondary'}
                className="text-[10px]"
              >
                {doc.type}
              </Badge>
              <span className="text-muted-foreground text-xs">
                {doc.date &&
                  format(subHours(new Date(doc.date), 3), 'dd/MM/yyyy', { locale: ptBR })}
              </span>
            </div>
            <p className="text-foreground mt-0.5 truncate text-sm font-semibold">{doc.title}</p>
            <p className="text-muted-foreground text-xs">{doc.dentist?.name || 'N/A'}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Imprimir"
              onClick={() => onPrint(doc)}
            >
              <Printer className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive h-8 w-8"
              onClick={() => onRequestDelete(doc.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

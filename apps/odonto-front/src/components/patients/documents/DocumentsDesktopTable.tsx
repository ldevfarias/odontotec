import { format, subHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Printer, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { PatientDocumentItem } from './types';

interface DocumentsDesktopTableProps {
  documents: PatientDocumentItem[];
  onPrint: (doc: PatientDocumentItem) => void;
  onRequestDelete: (id: number) => void;
}

export function DocumentsDesktopTable({
  documents,
  onPrint,
  onRequestDelete,
}: DocumentsDesktopTableProps) {
  return (
    <div className="hidden sm:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Profissional</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell className="font-medium">
                {doc.date &&
                  format(subHours(new Date(doc.date), 3), 'dd/MM/yyyy HH:mm', {
                    locale: ptBR,
                  })}
              </TableCell>
              <TableCell>
                <Badge variant={doc.type === 'ATESTADO' ? 'default' : 'secondary'}>{doc.type}</Badge>
              </TableCell>
              <TableCell>{doc.title}</TableCell>
              <TableCell>{doc.dentist?.name || 'N/A'}</TableCell>
              <TableCell className="space-x-2 text-right">
                <Button variant="ghost" size="icon" title="Imprimir" onClick={() => onPrint(doc)}>
                  <Printer className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onRequestDelete(doc.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

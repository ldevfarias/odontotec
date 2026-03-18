'use client';

import { useState } from 'react';
import { FileText, Plus, Eye, Trash2, Printer, Download } from 'lucide-react';
import { format, subHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { notificationService } from '@/services/notification.service';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useDocumentsControllerFindAll } from '@/generated/hooks/useDocumentsControllerFindAll';
import { useDocumentsControllerRemove } from '@/generated/hooks/useDocumentsControllerRemove';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Loader2 } from 'lucide-react';
import { DocumentDialog } from './DocumentDialog';
import { DocumentsTabSkeleton } from '@/components/skeletons';

interface DocumentsTabProps {
    patientId: number;
}

export function DocumentsTab({ patientId }: DocumentsTabProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { data: documents = [], refetch, isLoading } = useDocumentsControllerFindAll({ patientId: String(patientId) });
    const { mutate: removeDocument } = useDocumentsControllerRemove();

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);

    const handleRemove = (id: number) => {
        removeDocument({ id: id.toString() }, {
            onSuccess: () => {
                notificationService.success('Documento excluído com sucesso!');
                setIsDeleteDialogOpen(false);
                setDocumentToDelete(null);
                refetch();
            },
            onError: () => {
                notificationService.error('Erro ao excluir documento.');
            }
        });
    };

    const escapeHtml = (unsafe: string) => {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    };

    const handlePrint = (content: string, title: string) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            const safeTitle = escapeHtml(title);
            const safeContent = escapeHtml(content).replace(/\n/g, '<br/>');

            printWindow.document.write(`
                <html>
                    <head>
                        <title>${safeTitle}</title>
                        <style>
                            body { font-family: sans-serif; padding: 40px; line-height: 1.6; }
                            .header { text-align: center; margin-bottom: 50px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                            .footer { margin-top: 100px; text-align: center; border-top: 1px solid #ccc; padding-top: 20px; }
                            .signature { margin-top: 50px; text-align: center; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1>Documento Clínico</h1>
                        </div>
                        <h2>${safeTitle}</h2>
                        <div>${safeContent}</div>
                        <div class="footer">
                            <p>Emitido em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-semibold">Documentos e Receitas</h2>
                    </div>
                    <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" /> Novo Documento
                    </Button>
                </div>

                {isLoading ? (
                    <DocumentsTabSkeleton />
                ) : documents.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg space-y-3">
                        <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
                        <p className="text-muted-foreground">Nenhum documento gerado para este paciente.</p>
                        <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                            Gerar Primeiro Documento
                        </Button>
                    </div>
                ) : (
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
                            {documents.map((doc: any) => (
                                <TableRow key={doc.id}>
                                    <TableCell className="font-medium">
                                        {doc.date && format(subHours(new Date(doc.date), 3), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={doc.type === 'ATESTADO' ? 'default' : 'secondary'}>
                                            {doc.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{doc.title}</TableCell>
                                    <TableCell>{(doc as any).dentist?.name || 'N/A'}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title="Imprimir"
                                            onClick={() => handlePrint(doc.content, doc.title)}
                                        >
                                            <Printer className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => {
                                                setDocumentToDelete(doc.id);
                                                setIsDeleteDialogOpen(true);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                <DocumentDialog
                    isOpen={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    patientId={patientId}
                    onSuccess={() => refetch()}
                />

                <ConfirmDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                    title="Excluir Documento"
                    description="Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita."
                    onConfirm={() => {
                        if (documentToDelete) handleRemove(documentToDelete);
                    }}
                    confirmText="Excluir"
                    variant="destructive"
                />
            </CardContent>
        </Card>
    );
}

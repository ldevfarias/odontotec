'use client';

import { FileText, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

import { DocumentDialog } from './DocumentDialog';
import { printPatientDocument } from './documents/documentPrint';
import { DocumentsDesktopTable } from './documents/DocumentsDesktopTable';
import { DocumentsMobileList } from './documents/DocumentsMobileList';
import { PatientDocumentItem } from './documents/types';
import { useDocumentsTab } from './hooks/useDocumentsTab';

interface DocumentsTabProps {
  patientId: number;
}

export function DocumentsTab({ patientId }: DocumentsTabProps) {
  const {
    documents,
    isDialogOpen,
    setIsDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    openDeleteDialog,
    removeSelectedDocument,
    refetchDocuments,
  } = useDocumentsTab(patientId);

  const handlePrint = (doc: PatientDocumentItem) => {
    printPatientDocument(doc.content, doc.title);
  };

  return (
    <Card>
      <CardContent className="">
        <div className="flex items-center justify-between sm:mb-6">
          <div className="flex items-center gap-2">
            <FileText className="text-primary h-5 w-5" />
            <h2 className="text-base font-semibold sm:text-xl">Documentos e Receitas</h2>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Documento</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>

        {documents.length === 0 ? (
          <div className="space-y-3 rounded-lg border-2 border-dashed py-10 text-center">
            <FileText className="text-muted-foreground mx-auto h-10 w-10" />
            <p className="text-muted-foreground">Nenhum documento gerado para este paciente.</p>
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
              Gerar Primeiro Documento
            </Button>
          </div>
        ) : (
          <>
            <DocumentsDesktopTable
              documents={documents}
              onPrint={handlePrint}
              onRequestDelete={openDeleteDialog}
            />

            <DocumentsMobileList
              documents={documents}
              onPrint={handlePrint}
              onRequestDelete={openDeleteDialog}
            />
          </>
        )}

        <DocumentDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          patientId={patientId}
          onSuccess={refetchDocuments}
        />

        <ConfirmDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title="Excluir Documento"
          description="Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita."
          onConfirm={removeSelectedDocument}
          confirmText="Excluir"
          variant="destructive"
        />
      </CardContent>
    </Card>
  );
}

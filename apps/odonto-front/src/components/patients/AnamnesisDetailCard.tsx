'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertCircle, Edit2, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ANAMNESIS_TEMPLATE, AnamnesisCategory } from '@/constants/anamnesis-template';
import { cn } from '@/lib/utils';

import { formatAnswerValue, type AnamnesisRecord } from './anamnesis-helpers';

interface AnamnesisDetailCardProps {
  selectedRecord?: AnamnesisRecord;
  onEdit: (record: AnamnesisRecord) => void;
  onDelete: (id: number) => void;
  onCreate: () => void;
}

export function AnamnesisDetailCard({
  selectedRecord,
  onEdit,
  onDelete,
  onCreate,
}: AnamnesisDetailCardProps) {
  return (
    <Card className="col-span-1 min-h-0 overflow-hidden md:col-span-3 md:h-full">
      {selectedRecord ? (
        <>
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle className="text-xl">{selectedRecord.complaint}</CardTitle>
              <CardDescription>
                Registrado em{' '}
                {selectedRecord.createdAt &&
                  format(new Date(selectedRecord.createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => onEdit(selectedRecord)}
              >
                <Edit2 className="h-4 w-4" /> Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive gap-2"
                onClick={() => onDelete(selectedRecord.id)}
              >
                <Trash2 className="h-4 w-4" /> Excluir
              </Button>
            </div>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 overflow-y-auto">
            <div className="space-y-4">
              {Object.values(AnamnesisCategory).map((category) => {
                const questionsInCategory = ANAMNESIS_TEMPLATE.filter(
                  (q) => q.category === category,
                );
                const answersInCategory =
                  selectedRecord.data?.answers?.filter((answer) =>
                    questionsInCategory.some((q) => q.id === answer.questionId),
                  ) || [];

                if (answersInCategory.length === 0) return null;

                return (
                  <div key={category} className="space-y-4">
                    <h4 className="text-primary border-primary bg-primary/5 border-l-4 py-1 pl-3 text-sm font-bold">
                      {category}
                    </h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {answersInCategory.map((answer) => {
                        const question = questionsInCategory.find(
                          (q) => q.id === answer.questionId,
                        );
                        if (!question) return null;

                        const hasAlert = selectedRecord.alerts?.some(
                          (alert) => alert.questionId === question.id,
                        );

                        return (
                          <div
                            key={answer.questionId}
                            className={cn(
                              'rounded-lg border p-3',
                              hasAlert
                                ? 'bg-destructive/5 border-destructive/20'
                                : 'bg-muted/30 border-muted',
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-muted-foreground text-xs font-medium">
                                {question.label}
                              </span>
                              {hasAlert && <AlertCircle className="text-destructive h-3 w-3" />}
                            </div>
                            <div className="mt-1 flex flex-col gap-1">
                              <span
                                className={cn(
                                  'text-sm font-semibold',
                                  hasAlert && 'text-destructive',
                                )}
                              >
                                {formatAnswerValue(answer.value) || 'N/A'}
                              </span>
                              {answer.details && (
                                <p className="text-muted-foreground border-muted-foreground/10 mt-1 border-t pt-1 text-xs italic">
                                  {answer.details}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {!selectedRecord.data?.answers && (
                <div className="text-muted-foreground bg-muted/20 rounded-lg p-8 text-center italic">
                  Este registro utiliza um formato antigo e não pode ser exibido com a nova
                  estrutura.
                </div>
              )}
            </div>
          </CardContent>
        </>
      ) : (
        <div className="text-muted-foreground flex min-h-0 flex-1 flex-col items-center justify-center space-y-4 p-12 text-center">
          <div className="bg-muted rounded-full p-4">
            <Plus className="h-8 w-8" />
          </div>
          <div>
            <p className="font-semibold">Nenhuma anamnese selecionada</p>
            <p className="text-sm">Selecione um registro ao lado ou crie uma nova ficha.</p>
          </div>
          <Button onClick={onCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Começar Agora
          </Button>
        </div>
      )}
    </Card>
  );
}

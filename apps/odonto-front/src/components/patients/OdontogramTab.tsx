'use client';

import React, { useState, useMemo } from 'react';
import { notificationService } from '@/services/notification.service';
import { format } from 'date-fns';
import { History, Trash2, Stethoscope } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { Odontogram } from './Odontogram/Odontogram';

import { useProceduresControllerFindAllByPatient } from '@/generated/hooks/useProceduresControllerFindAllByPatient';
import { useProceduresControllerRemove } from '@/generated/hooks/useProceduresControllerRemove';
import { proceduresControllerFindAllByPatientQueryKey } from '@/generated/hooks/useProceduresControllerFindAllByPatient';
import { OdontogramTabSkeleton } from '@/components/skeletons';

interface OdontogramTabProps {
    patientId: number;
}

export function OdontogramTab({ patientId }: OdontogramTabProps) {
    // selectedTooth: only used to highlight the corresponding tooth when clicking history items
    const [selectedTooth, setSelectedTooth] = useState<string | null>(null);
    const [isPediatric, setIsPediatric] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const queryClient = useQueryClient();
    const { data: procedures = [], isLoading } = useProceduresControllerFindAllByPatient(patientId);
    const { mutate: removeProcedure } = useProceduresControllerRemove();

    const allProcedures = useMemo(() => {
        return (procedures as any[]).sort(
            (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }, [procedures]);

    const handleDelete = (id: number) => setDeleteId(id);

    const confirmDeleteProcedure = () => {
        if (!deleteId) return;
        removeProcedure(
            { id: deleteId },
            {
                onSuccess: () => {
                    notificationService.success('Registro excluído!');
                    queryClient.setQueryData(
                        proceduresControllerFindAllByPatientQueryKey(patientId),
                        (oldData: any[]) =>
                            oldData ? oldData.filter((p: any) => p.id !== deleteId) : []
                    );
                    setDeleteId(null);
                },
                onError: (error: any) => {
                    notificationService.apiError(error, 'Erro ao excluir registro.');
                },
            }
        );
    };

    if (isLoading) return <OdontogramTabSkeleton />;

    const patientProcedures = procedures as any[];

    return (
        <div className="space-y-6">
            {/* Odontogram Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <CardTitle>Odontograma Interativo</CardTitle>
                        <CardDescription>
                            Clique em um dente para registrar ou visualizar procedimentos.
                        </CardDescription>
                    </div>
                    <div className="flex bg-muted p-1 rounded-lg border">
                        <Button
                            variant={!isPediatric ? 'secondary' : 'ghost'}
                            size="sm"
                            className={!isPediatric ? 'shadow-sm' : ''}
                            onClick={() => setIsPediatric(false)}
                        >
                            Adulto
                        </Button>
                        <Button
                            variant={isPediatric ? 'secondary' : 'ghost'}
                            size="sm"
                            className={isPediatric ? 'shadow-sm' : ''}
                            onClick={() => setIsPediatric(true)}
                        >
                            Infantil
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="overflow-x-auto p-0 md:p-4">
                    <div className="flex flex-col items-center gap-3 py-3">
                        <div className="min-w-[800px] w-full max-w-5xl">
                            <Odontogram
                                procedures={patientProcedures}
                                isPediatric={isPediatric}
                                patientId={patientId}
                                highlightedTooth={selectedTooth}
                            />
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap gap-4 px-6 py-3 bg-muted/30 rounded-full border border-muted-foreground/10">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-sm bg-background border border-muted-foreground/40" />
                                <span className="text-xs font-medium text-muted-foreground">Saudável</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-sm bg-primary/20 border border-primary/40" />
                                <span className="text-xs font-medium text-muted-foreground">Selecionado</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-sm bg-destructive/40 border border-destructive/60" />
                                <span className="text-xs font-medium text-muted-foreground">Com Procedimento</span>
                            </div>
                            <Separator orientation="vertical" className="h-4 hidden sm:block" />
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                <span className="font-bold">💡</span>
                                Clique em qualquer dente para registrar
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Procedure History */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Histórico de Procedimentos
                        {allProcedures.length > 0 && (
                            <Badge variant="secondary" className="ml-auto text-xs">
                                {allProcedures.length} registro{allProcedures.length > 1 ? 's' : ''}
                            </Badge>
                        )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Clique em um registro para destacar o dente no odontograma.
                    </p>
                </CardHeader>
                <CardContent>
                    {allProcedures.length === 0 ? (
                        <div className="h-32 flex items-center justify-center text-muted-foreground italic border-2 border-dashed rounded-lg text-center px-4 text-sm">
                            Nenhum procedimento registrado. Clique em um dente no odontograma para começar.
                        </div>
                    ) : (
                        <ScrollArea className="h-[420px] pr-4">
                            <div className="space-y-6">
                                {(() => {
                                    // Group by date (journal view)
                                    const eventsByDate: Record<string, any[]> = {};
                                    allProcedures.forEach((p) => {
                                        const dateKey = format(new Date(p.date), 'dd/MM/yyyy');
                                        if (!eventsByDate[dateKey]) eventsByDate[dateKey] = [];
                                        eventsByDate[dateKey].push(p);
                                    });

                                    const sortedDates = Object.keys(eventsByDate).sort((a, b) => {
                                        const [da, ma, ya] = a.split('/').map(Number);
                                        const [db, mb, yb] = b.split('/').map(Number);
                                        return (
                                            new Date(yb, mb - 1, db).getTime() -
                                            new Date(ya, ma - 1, da).getTime()
                                        );
                                    });

                                    return sortedDates.map((date) => (
                                        <div key={date} className="space-y-3">
                                            <div className="flex items-center gap-2 sticky top-0 bg-background py-1 z-10">
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-muted text-muted-foreground font-bold"
                                                >
                                                    {date}
                                                </Badge>
                                                <Separator className="flex-1" />
                                            </div>

                                            <div className="space-y-3">
                                                {eventsByDate[date].map((item, idx) => {
                                                    const isHighlighted =
                                                        selectedTooth &&
                                                        String(item.toothNumber) === selectedTooth;

                                                    return (
                                                        <div
                                                            key={item.id || `${date}-${idx}`}
                                                            className={`p-3 border rounded-lg transition-all group relative cursor-pointer
                                                                bg-card hover:bg-muted/50
                                                                ${isHighlighted
                                                                    ? 'ring-2 ring-primary border-primary shadow-sm scale-[1.01] z-20'
                                                                    : 'opacity-80 hover:opacity-100'
                                                                }`}
                                                            onClick={() => {
                                                                if (!item.toothNumber) return;
                                                                const num = String(item.toothNumber);
                                                                setSelectedTooth(prev =>
                                                                    prev === num ? null : num
                                                                );
                                                            }}
                                                        >
                                                            <div className="flex items-center justify-between mb-1">
                                                                <div className="flex items-center gap-2">
                                                                    <Stethoscope className="h-3 w-3 text-muted-foreground" />
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="text-[10px] py-0 font-medium"
                                                                    >
                                                                        {item.type || 'Geral'}
                                                                    </Badge>
                                                                    <Badge
                                                                        variant={item.toothNumber ? 'default' : 'outline'}
                                                                        className={`text-[10px] py-0 ${
                                                                            item.toothNumber
                                                                                ? 'bg-primary/10 text-primary border-none'
                                                                                : 'text-muted-foreground'
                                                                        }`}
                                                                    >
                                                                        {item.toothNumber
                                                                            ? `Dente ${item.toothNumber}`
                                                                            : 'Procedimento Geral'}
                                                                    </Badge>
                                                                    {item.toothFaces && (
                                                                        <span className="text-[10px] text-muted-foreground">
                                                                            Faces: {item.toothFaces}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDelete(item.id);
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            </div>
                                                            {item.description && (
                                                                <p className="text-sm font-medium leading-snug text-foreground">
                                                                    {item.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={!!deleteId}
                onOpenChange={(open) => {
                    if (!open) setDeleteId(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteProcedure}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

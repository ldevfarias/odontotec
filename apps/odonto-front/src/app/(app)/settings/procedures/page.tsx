/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { notificationService } from '@/services/notification.service';
import { Plus, Loader2, Pencil, Trash2, Search, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useClinicProceduresControllerFindAll, clinicProceduresControllerFindAllQueryKey } from '@/generated/hooks/useClinicProceduresControllerFindAll';
import { useClinicProceduresControllerCreate } from '@/generated/hooks/useClinicProceduresControllerCreate';
import { useQueryClient } from '@tanstack/react-query';
import { useClinicProceduresControllerUpdate } from '@/generated/hooks/useClinicProceduresControllerUpdate';
import { useClinicProceduresControllerRemove } from '@/generated/hooks/useClinicProceduresControllerRemove';
import { clinicProceduresControllerCreateMutationRequestSchema } from '@/generated/zod/clinicProceduresControllerCreateSchema';

const localProcedureSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    description: z.optional(z.string()),
    category: z.optional(z.string()),
    baseValue: z.number().min(0, 'Valor deve ser positivo'),
    selectionMode: z.enum(['FACE', 'TOOTH', 'GENERAL']).optional(),
});

type ProcedureFormValues = z.infer<typeof localProcedureSchema>;

export default function ProceduresPage() {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const queryClient = useQueryClient();
    const { data: procedures = [], isLoading } = useClinicProceduresControllerFindAll();
    const { mutate: createProcedure, isPending: isCreating } = useClinicProceduresControllerCreate();
    const { mutate: updateProcedure, isPending: isUpdating } = useClinicProceduresControllerUpdate();
    const { mutate: removeProcedure } = useClinicProceduresControllerRemove();

    const form = useForm<ProcedureFormValues>({
        resolver: zodResolver(localProcedureSchema),
        mode: 'onChange',
        defaultValues: {
            name: '',
            description: '',
            category: '',
            baseValue: 0,
            selectionMode: undefined,
        },
    });

    const onSubmit = (values: ProcedureFormValues) => {
        if (editingId) {
            updateProcedure(
                { id: editingId, data: values as any },
                {
                    onSuccess: (res: any) => {
                        notificationService.success('Procedimento atualizado!');
                        closeDialog();
                        const updatedProcedure = res?.data || res;
                        queryClient.setQueryData(
                            clinicProceduresControllerFindAllQueryKey(),
                            (old: any) => {
                                const oldData = old?.data || old;
                                const newData = Array.isArray(oldData) ? oldData.map((p: any) => p.id === editingId ? updatedProcedure : p) : [];
                                return old?.data !== undefined ? { ...old, data: newData } : newData;
                            }
                        );
                    }
                }
            );
        } else {
            createProcedure(
                { data: values as any },
                {
                    onSuccess: (res: any) => {
                        notificationService.success('Procedimento criado!');
                        closeDialog();
                        const newProcedure = res?.data || res;
                        queryClient.setQueryData(
                            clinicProceduresControllerFindAllQueryKey(),
                            (old: any) => {
                                const oldData = old?.data || old;
                                const newData = Array.isArray(oldData) ? [newProcedure, ...oldData] : [newProcedure];
                                return old?.data !== undefined ? { ...old, data: newData } : newData;
                            }
                        );
                    }
                }
            );
        }
    };

    const handleEdit = (procedure: any) => {
        setEditingId(procedure.id);
        form.reset({
            name: procedure.name,
            description: procedure.description || '',
            category: procedure.category || '',
            baseValue: Number(procedure.baseValue),
            selectionMode: procedure.selectionMode || undefined,
        });
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        setIdToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (idToDelete) {
            removeProcedure({ id: idToDelete }, {
                onSuccess: () => {
                    notificationService.success('Procedimento removido!');
                    setIsDeleteDialogOpen(false);
                    queryClient.setQueryData(
                        clinicProceduresControllerFindAllQueryKey(),
                        (old: any) => {
                            const oldData = old?.data || old;
                            const newData = Array.isArray(oldData) ? oldData.filter((p: any) => p.id !== idToDelete) : [];
                            return old?.data !== undefined ? { ...old, data: newData } : newData;
                        }
                    );
                    setIdToDelete(null);
                },
                onError: () => {
                    notificationService.error('Erro ao remover procedimento. Verifique suas permissões.');
                }
            });
        }
    };

    const closeDialog = () => {
        setIsOpen(false);
        setEditingId(null);
        form.reset();
    };

    const filteredProcedures = procedures.filter((p: any) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getSelectionModeLabel = (mode?: string) => {
        switch (mode) {
            case 'FACE':
                return { label: 'Por Face', variant: 'default' as const };
            case 'TOOTH':
                return { label: 'Dente Inteiro', variant: 'secondary' as const };
            case 'GENERAL':
                return { label: 'Sem Seleção', variant: 'outline' as const };
            default:
                return { label: 'Não definido', variant: 'outline' as const };
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Catálogo de Procedimentos</h1>
                    <p className="text-muted-foreground">
                        Configure os procedimentos e valores base da sua clínica.
                    </p>
                </div>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2" onClick={() => { setEditingId(null); form.reset(); }}>
                            <Plus className="h-4 w-4" />
                            Novo Procedimento
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{editingId ? 'Editar Procedimento' : 'Novo Procedimento'}</DialogTitle>
                            <DialogDescription>
                                Preencha os detalhes do procedimento para o catálogo.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome do Procedimento</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: Limpeza, Restauração..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="category"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Categoria</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ex: Preventivo, Estética" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="baseValue"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Valor Base (R$)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descrição (Opcional)</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Detalhes técnicos..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Selection Mode Field */}
                                <FormField
                                    control={form.control}
                                    name="selectionMode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium">
                                                Como registrar no odontograma?
                                            </FormLabel>
                                            <div className="space-y-2 pt-1">
                                                {([
                                                    {
                                                        value: 'FACE',
                                                        label: 'Seleção por Face do Dente',
                                                        description: 'Para procedimentos que afetam uma superfície específica (restauração, obturação, cárie, etc).',
                                                    },
                                                    {
                                                        value: 'TOOTH',
                                                        label: 'Dente Inteiro',
                                                        description: 'Para procedimentos que envolvem o dente todo (extração, canal, limpeza, clareamento, etc).',
                                                    },
                                                    {
                                                        value: 'GENERAL',
                                                        label: 'Sem Seleção',
                                                        description: 'Para procedimentos genéricos que não se aplicam a dentes específicos.',
                                                    },
                                                ] as const).map((option) => {
                                                    const isActive = field.value === option.value;
                                                    return (
                                                        <div
                                                            key={option.value}
                                                            onClick={() => field.onChange(option.value)}
                                                            className={cn(
                                                                'flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all',
                                                                isActive
                                                                    ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                                                                    : 'hover:bg-muted/50 hover:border-muted-foreground/30'
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                'mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                                                                isActive ? 'border-primary' : 'border-muted-foreground/40'
                                                            )}>
                                                                {isActive && (
                                                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className={cn(
                                                                    'text-sm font-medium leading-none',
                                                                    isActive ? 'text-primary' : 'text-foreground'
                                                                )}>
                                                                    {option.label}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    {option.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <DialogFooter>
                                    <Button type="button" variant="ghost" onClick={closeDialog}>Cancelar</Button>
                                    <Button type="submit" disabled={isCreating || isUpdating || !form.formState.isValid}>
                                        {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {editingId ? 'Salvar Alterações' : 'Criar Procedimento'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Filtros</CardTitle>
                        <div className="relative w-72">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar procedimento..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {/* Header row */}
                        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-2 rounded-lg bg-muted/50">
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nome</span>
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground w-28">Categoria</span>
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground w-28 text-right">Valor Base</span>
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground w-32">Modo</span>
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground w-20 text-center">Ações</span>
                        </div>

                        {/* Data rows */}
                        {isLoading ? (
                            <div className="space-y-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="h-14 rounded-lg bg-muted/30 animate-pulse" />
                                ))}
                            </div>
                        ) : filteredProcedures.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground border-2 border-dashed rounded-lg gap-2">
                                <FileText className="h-8 w-8 opacity-30" />
                                <p className="text-sm italic">
                                    {searchTerm ? 'Nenhum resultado para a busca.' : 'Nenhum procedimento cadastrado.'}
                                </p>
                            </div>
                        ) : (
                            filteredProcedures.map((proc: any) => {
                                const modeInfo = getSelectionModeLabel(proc.selectionMode);
                                return (
                                    <div
                                        key={proc.id}
                                        className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-4 py-3 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-accent/30 hover:shadow-sm transition-all duration-200 group"
                                    >
                                        <div>
                                            <p className="font-semibold text-sm text-foreground">{proc.name}</p>
                                            {proc.description && (
                                                <p className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">{proc.description}</p>
                                            )}
                                        </div>
                                        <div className="w-28">
                                            {proc.category ? (
                                                <Badge variant="secondary" className="font-medium text-xs">
                                                    {proc.category}
                                                </Badge>
                                            ) : (
                                                <span className="text-xs text-muted-foreground/50">-</span>
                                            )}
                                        </div>
                                        <div className="w-28 text-right">
                                            <span className="font-mono font-semibold text-sm text-foreground">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proc.baseValue)}
                                            </span>
                                        </div>
                                        <div className="w-32">
                                            <Badge variant={modeInfo.variant} className="text-xs font-medium">
                                                {modeInfo.label}
                                            </Badge>
                                        </div>
                                        <div className="w-20 flex justify-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(proc)}
                                                className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(proc.id)}
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })
                        )}

                        {/* Footer count */}
                        {!isLoading && filteredProcedures.length > 0 && (
                            <p className="text-xs text-muted-foreground text-right pt-1 pr-1">
                                {filteredProcedures.length} procedimento{filteredProcedures.length !== 1 ? 's' : ''}
                                {searchTerm ? ' encontrado' : ' cadastrado'}{filteredProcedures.length !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Procedimento</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir este procedimento do catálogo? Esta ação não poderá ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIdToDelete(null)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
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

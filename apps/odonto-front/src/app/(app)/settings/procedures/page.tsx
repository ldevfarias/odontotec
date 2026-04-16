/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { FileText, Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import { useClinicProceduresControllerCreate } from '@/generated/hooks/useClinicProceduresControllerCreate';
import {
  clinicProceduresControllerFindAllQueryKey,
  useClinicProceduresControllerFindAll,
} from '@/generated/hooks/useClinicProceduresControllerFindAll';
import { useClinicProceduresControllerRemove } from '@/generated/hooks/useClinicProceduresControllerRemove';
import { useClinicProceduresControllerUpdate } from '@/generated/hooks/useClinicProceduresControllerUpdate';
import { notificationService } from '@/services/notification.service';

const localProcedureSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.optional(z.string()),
  category: z.optional(z.string()),
  baseValue: z.number().min(0, 'Valor deve ser positivo'),
});

type ProcedureFormValues = z.infer<typeof localProcedureSchema>;

export default function ProceduresPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const queryClient = useQueryClient();
  const { data: proceduresResponse, isLoading } = useClinicProceduresControllerFindAll();
  const procedures = (proceduresResponse as any) ?? [];
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
            queryClient.setQueryData(clinicProceduresControllerFindAllQueryKey(), (old: any) => {
              const oldData = Array.isArray(old) ? old : old.data || [];
              return oldData.map((p: any) => (p.id === editingId ? updatedProcedure : p));
            });
          },
        },
      );
    } else {
      createProcedure(
        { data: values as any },
        {
          onSuccess: (res: any) => {
            notificationService.success('Procedimento criado!');
            closeDialog();
            const newProcedure = res?.data || res;
            queryClient.setQueryData(clinicProceduresControllerFindAllQueryKey(), (old: any) => {
              const oldData = Array.isArray(old) ? old : old.data || [];
              return [newProcedure, ...oldData];
            });
          },
        },
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
    });
    setIsOpen(true);
  };

  const handleDelete = (id: number) => {
    setIdToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (idToDelete) {
      removeProcedure(
        { id: idToDelete },
        {
          onSuccess: () => {
            notificationService.success('Procedimento removido!');
            setIsDeleteDialogOpen(false);
            queryClient.setQueryData(clinicProceduresControllerFindAllQueryKey(), (old: any) => {
              const oldData = Array.isArray(old) ? old : old.data || [];
              return oldData.filter((p: any) => p.id !== idToDelete);
            });
            setIdToDelete(null);
          },
          onError: () => {
            notificationService.error('Erro ao remover procedimento. Verifique suas permissões.');
          },
        },
      );
    }
  };

  const closeDialog = () => {
    setIsOpen(false);
    setEditingId(null);
    form.reset();
  };

  const filteredProcedures = procedures.filter(
    (p: any) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const procedureDialog = (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="shrink-0 gap-2"
          onClick={() => {
            setEditingId(null);
            form.reset();
          }}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novo Procedimento</span>
          <span className="sm:hidden">Novo</span>
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

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={closeDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating || !form.formState.isValid}>
                {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? 'Salvar Alterações' : 'Criar Procedimento'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
            Catálogo de Procedimentos
          </h1>
          <p className="text-muted-foreground hidden sm:block">
            Configure os procedimentos e valores base da sua clínica.
          </p>
        </div>
        {procedureDialog}
      </div>

      <Card>
        {/* Search bar */}
        <CardHeader className="px-4 pt-4 pb-3">
          <div className="relative w-full">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              placeholder="Buscar procedimento ou categoria..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent className="px-0 pb-2">
          {isLoading ? (
            <div className="space-y-2 px-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-muted/30 h-14 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredProcedures.length === 0 ? (
            <div className="text-muted-foreground mx-4 flex h-32 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed">
              <FileText className="h-8 w-8 opacity-30" />
              <p className="text-sm italic">
                {searchTerm ? 'Nenhum resultado para a busca.' : 'Nenhum procedimento cadastrado.'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop header row */}
              <div className="bg-muted/50 hidden grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2 sm:grid">
                <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  Nome
                </span>
                <span className="text-muted-foreground w-28 text-xs font-semibold tracking-wide uppercase">
                  Categoria
                </span>
                <span className="text-muted-foreground w-28 text-right text-xs font-semibold tracking-wide uppercase">
                  Valor Base
                </span>
                <span className="text-muted-foreground w-20 text-center text-xs font-semibold tracking-wide uppercase">
                  Ações
                </span>
              </div>

              <div className="divide-border divide-y">
                {filteredProcedures.map((proc: any) => {
                  return (
                    <div key={proc.id} className="group">
                      {/* Desktop row */}
                      <div className="hover:bg-accent/30 hidden grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-4 py-3 transition-colors sm:grid">
                        <div>
                          <p className="text-foreground text-sm font-semibold">{proc.name}</p>
                          {proc.description && (
                            <p className="text-muted-foreground mt-0.5 max-w-xs truncate text-xs">
                              {proc.description}
                            </p>
                          )}
                        </div>
                        <div className="w-28">
                          {proc.category ? (
                            <Badge variant="secondary" className="text-xs font-medium">
                              {proc.category}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground/50 text-xs">-</span>
                          )}
                        </div>
                        <div className="w-28 text-right">
                          <span className="text-foreground font-mono text-sm font-semibold">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(proc.baseValue)}
                          </span>
                        </div>
                        <div className="flex w-20 justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(proc)}
                            className="text-muted-foreground h-8 w-8 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(proc.id)}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 opacity-0 transition-all duration-200 group-hover:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Mobile card */}
                      <div className="flex items-center gap-3 px-4 py-3 sm:hidden">
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground truncate text-sm font-semibold">
                            {proc.name}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            {proc.category && (
                              <Badge variant="secondary" className="text-[10px] font-medium">
                                {proc.category}
                              </Badge>
                            )}
                            <span className="text-foreground font-mono text-xs font-semibold">
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              }).format(proc.baseValue)}
                            </span>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(proc)}
                            className="text-muted-foreground h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(proc.id)}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-muted-foreground pt-2 pr-4 pb-1 text-right text-xs">
                {filteredProcedures.length} procedimento{filteredProcedures.length !== 1 ? 's' : ''}
                {searchTerm ? ' encontrado' : ' cadastrado'}
                {filteredProcedures.length !== 1 ? 's' : ''}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Procedimento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este procedimento do catálogo? Esta ação não poderá ser
              desfeita.
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

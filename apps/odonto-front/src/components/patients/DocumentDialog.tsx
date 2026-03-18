'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FileText, Loader2 } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useDocumentsControllerCreate } from '@/generated/hooks/useDocumentsControllerCreate';
import { useUsersControllerFindAll } from '@/generated/hooks/useUsersControllerFindAll';
import { CreatePatientDocumentDtoTypeEnumKey } from '@/generated/ts/CreatePatientDocumentDto';

const formSchema = z.object({
    type: z.enum(['ATESTADO', 'RECEITA', 'OUTRO']),
    title: z.string().min(3, 'Título é obrigatório'),
    content: z.string().min(10, 'O conteúdo deve ter pelo menos 10 caracteres'),
    dentistId: z.string().min(1, 'Profissional é obrigatório'),
});

interface DocumentDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    patientId: number;
    onSuccess?: () => void;
}

export function DocumentDialog({ isOpen, onOpenChange, patientId, onSuccess }: DocumentDialogProps) {
    const { mutate: createDocument, isPending } = useDocumentsControllerCreate();
    const { data: users = [] } = useUsersControllerFindAll();
    const dentists = users.filter((u: any) => u.role === 'DENTIST' || u.role === 'ADMIN');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: 'ATESTADO',
            title: '',
            content: '',
            dentistId: '',
        },
    });

    // Populate templates based on type
    useEffect(() => {
        const type = form.watch('type');
        if (type === 'ATESTADO') {
            form.setValue('title', 'Atestado Médico');
            form.setValue('content', 'Atesto para os devidos fins que o(a) paciente acima citado(a) esteve em consulta odontológica na data de hoje, necessitando de X dias de repouso por motivo de tratamento dentário.');
        } else if (type === 'RECEITA') {
            form.setValue('title', 'Receituário');
            form.setValue('content', 'Uso Oral:\n1. Medicamento X --------- 1 caixa\nTomar 1 comprimido a cada 8 horas por 5 dias.');
        }
    }, [form.watch('type')]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        createDocument({
            data: {
                ...values,
                type: values.type as CreatePatientDocumentDtoTypeEnumKey,
                patientId,
                dentistId: Number(values.dentistId),
            }
        }, {
            onSuccess: () => {
                onOpenChange(false);
                form.reset();
                onSuccess?.();
            }
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Gerar Documento
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="ATESTADO">Atestado</SelectItem>
                                                <SelectItem value="RECEITA">Receituário</SelectItem>
                                                <SelectItem value="OUTRO">Outro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dentistId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Profissional Responsável</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o dentista" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {dentists.map((d: any) => (
                                                    <SelectItem key={d.id} value={d.id.toString()}>
                                                        {d.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título do Documento</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Ex: Atestado de Comparecimento" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Conteúdo</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            className="min-h-[200px]"
                                            placeholder="Descreva as orientações ou o atestado..."
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Salvar e Gerar
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

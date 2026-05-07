'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useDocumentsControllerCreate } from '@/generated/hooks/useDocumentsControllerCreate';
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

export function DocumentDialog({
  isOpen,
  onOpenChange,
  patientId,
  onSuccess,
}: DocumentDialogProps) {
  const { user } = useAuth();
  const { mutate: createDocument, isPending } = useDocumentsControllerCreate();
  const isProfessionalUser = user?.role === 'DENTIST' || user?.role === 'ADMIN';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'ATESTADO',
      title: '',
      content: '',
      dentistId: '',
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form's watch() cannot be memoized safely; known React Compiler limitation
  const currentType = form.watch('type');

  // Populate templates based on type
  useEffect(() => {
    if (currentType === 'ATESTADO') {
      form.setValue('title', 'Atestado Médico');
      form.setValue(
        'content',
        'Atesto para os devidos fins que o(a) paciente acima citado(a) esteve em consulta odontológica na data de hoje, necessitando de X dias de repouso por motivo de tratamento dentário.',
      );
    } else if (currentType === 'RECEITA') {
      form.setValue('title', 'Receituário');
      form.setValue(
        'content',
        'Uso Oral:\n1. Medicamento X --------- 1 caixa\nTomar 1 comprimido a cada 8 horas por 5 dias.',
      );
    }
  }, [currentType, form]);

  // Always pre-fill responsible professional with the logged-in ADMIN/DENTIST.
  useEffect(() => {
    if (!isOpen || !user || !isProfessionalUser) return;

    form.setValue('dentistId', user.id.toString(), {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });
  }, [isOpen, user, isProfessionalUser, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const resolvedDentistId = user && isProfessionalUser ? user.id : Number(values.dentistId);

    createDocument(
      {
        data: {
          ...values,
          type: values.type as CreatePatientDocumentDtoTypeEnumKey,
          patientId,
          dentistId: resolvedDentistId,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
          onSuccess?.();
        },
      },
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="text-primary h-5 w-5" />
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
                render={() => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-2">Profissional Responsável</FormLabel>
                    <FormControl>
                      <div className="border-input bg-muted text-muted-foreground flex h-10 w-full cursor-not-allowed items-center rounded-md border px-3 py-2 text-sm">
                        {user?.name || 'Carregando...'}
                      </div>
                    </FormControl>
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
                      className="min-h-50"
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

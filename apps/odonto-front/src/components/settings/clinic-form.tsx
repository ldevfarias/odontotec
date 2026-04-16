'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { notificationService } from '@/services/notification.service';

const clinicFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Nome da clínica deve ter pelo menos 2 caracteres.',
  }),
  email: z
    .string()
    .email({
      message: 'Por favor, insira um email válido.',
    })
    .optional()
    .or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type ClinicFormValues = z.infer<typeof clinicFormSchema>;

export function ClinicForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const form = useForm<ClinicFormValues>({
    resolver: zodResolver(clinicFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
  });

  useEffect(() => {
    const fetchClinic = async () => {
      try {
        const response = await api.get('/clinics/active');
        const clinic = response.data;
        form.reset({
          name: clinic.name || '',
          email: clinic.email || '',
          phone: clinic.phone || '',
          address: clinic.address || '',
        });
        if (clinic.logoUrl) {
          setLogoPreview(`${process.env.NEXT_PUBLIC_API_URL}${clinic.logoUrl}`);
        }
      } catch (error) {
        console.error('Error fetching clinic:', error);
        notificationService.error(
          'Erro ao carregar dados',
          'Não foi possível carregar as informações da clínica.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchClinic();
  }, [form]);

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    const MAX_SIZE_MB = 5;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

    if (!ALLOWED_TYPES.includes(file.type)) {
      notificationService.error('Formato inválido', 'Use uma imagem em formato JPG, PNG ou WebP.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      notificationService.error(
        'Arquivo muito grande',
        `O tamanho máximo permitido é ${MAX_SIZE_MB}MB.`,
      );
      event.target.value = '';
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  async function onSubmit(data: ClinicFormValues) {
    setIsSaving(true);
    try {
      await api.patch('/clinics/active', data);

      if (logoFile) {
        const formData = new FormData();
        formData.append('file', logoFile);
        await api.put('/clinics/active/logo', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      notificationService.success('Sucesso!', 'As informações da clínica foram atualizadas.');
    } catch (error) {
      console.error('Error updating clinic:', error);
      notificationService.error('Erro ao salvar', 'Não foi possível atualizar as informações.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados da Clínica</CardTitle>
        <CardDescription>
          Atualize as informações da sua clínica como nome, contato e logo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border">
                <AvatarImage src={logoPreview || ''} alt="Logo da Clínica" />
                <AvatarFallback className="text-lg">Logo</AvatarFallback>
              </Avatar>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <FormLabel htmlFor="logo">Logo da Clínica</FormLabel>
                <Input
                  id="logo"
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  onChange={handleLogoChange}
                  className="cursor-pointer"
                />
                <FormDescription>Máx. 5MB · JPG, PNG ou WebP.</FormDescription>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Clínica</FormLabel>
                    <FormControl>
                      <Input placeholder="Clínica Odontológica Exemplo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email de Contato</FormLabel>
                    <FormControl>
                      <Input placeholder="contato@clinica.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua Exemplo, 123 - Centro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving || !form.formState.isValid}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

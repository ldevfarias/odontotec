'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuthControllerRegister } from '@/generated/hooks/useAuthControllerRegister';
import { useUsersControllerFindInvitation } from '@/generated/hooks/useUsersControllerFindInvitation';
import { authControllerRegisterMutationRequestSchema } from '@/generated/zod/authControllerRegisterSchema';
import { notificationService } from '@/services/notification.service';

type RegisterFormValues = z.infer<typeof authControllerRegisterMutationRequestSchema>;

const invitationSchema = z.object({
  email: z.string(),
  cpf: z.string().optional(),
  clinic: z
    .object({
      name: z.string(),
    })
    .optional(),
});

export default function RegisterInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const {
    data: invitation,
    isLoading: isLoadingInvite,
    isError,
  } = useUsersControllerFindInvitation(token);
  const { mutate: register, isPending: isRegistering } = useAuthControllerRegister();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(authControllerRegisterMutationRequestSchema),
    defaultValues: {
      token: token,
      name: '',
      password: '',
    },
  });

  if (isLoadingInvite) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  const parsedInvitation = invitationSchema.safeParse(invitation);

  if (isError || !parsedInvitation.success) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Convite Inválido</CardTitle>
            <CardDescription>
              Este link de convite expirou ou é inválido. Por favor, solicite um novo convite ao
              administrador da clínica.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push('/login')} variant="outline" className="w-full">
              Voltar para Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const invitationData = parsedInvitation.data;

  function onSubmit(values: RegisterFormValues) {
    register(
      { data: values },
      {
        onSuccess: () => {
          notificationService.success('Cadastro concluído com sucesso!');
          // In a real app, the response would contain the token
          // For now, redirect to login
          router.push('/login');
        },
        onError: () => {
          notificationService.error('Erro ao concluir o cadastro.');
        },
      },
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Completar Cadastro</CardTitle>
          <CardDescription>
            Olá! Você foi convidado para a clínica{' '}
            <strong>{invitationData.clinic?.name || 'OdontoTec'}</strong>. Preencha seus dados para
            ativar sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg bg-gray-100 p-4 text-sm">
            <div>
              <span className="block text-gray-500">E-mail</span>
              <span className="font-medium">{invitationData.email}</span>
            </div>
            <div>
              <span className="block text-gray-500">CPF</span>
              <span className="font-medium">{invitationData.cpf || 'Nao informado'}</span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome aqui" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isRegistering}>
                {isRegistering ? 'Ativando conta...' : 'Concluir e Acessar'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

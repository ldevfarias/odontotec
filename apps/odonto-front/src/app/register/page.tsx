'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Mail } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ProgressSteps } from '@/components/ui/progress-steps';
import { useAuth } from '@/contexts/AuthContext';
import { analytics, EVENT_NAMES } from '@/services/analytics.service';
import { initiateRegistration } from '@/services/auth';
import { notificationService } from '@/services/notification.service';

const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [devToken, setDevToken] = useState<string | null>(null);
  const { logout, isAuthenticated } = useAuth();

  useEffect(() => {
    // Se o usuário acessar a página de registro e já estiver logado,
    // limpa a sessão para evitar sobreposição de ID após verificar e-mail.
    if (isAuthenticated) {
      logout();
    }
  }, [isAuthenticated, logout]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const res = await initiateRegistration({
        name: values.name,
        email: values.email,
      });
      setSubmittedEmail(values.email);
      setDevToken(res.devToken || null);
      setIsSuccess(true);
      analytics.capture(EVENT_NAMES.USER_REGISTERED, {
        email: values.email,
        name: values.name,
      });
      notificationService.success('E-mail de verificação enviado!');
    } catch (error: any) {
      console.error(error);
      analytics.captureException(error, { extra: { email: values.email } });
      notificationService.apiError(error, 'Erro ao iniciar cadastro');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 px-4">
        <div className="mt-8 mb-8 w-full max-w-md">
          <ProgressSteps currentStep={1} />
        </div>
        <Card className="border-t-primary w-full max-w-md border-t-4 shadow-xl">
          <CardHeader className="space-y-4 pt-8 text-center">
            <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full p-3">
              <Mail className="text-primary h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-bold">Verifique seu e-mail</CardTitle>
            <CardDescription className="text-base">
              Enviamos um link de confirmação para <br />
              <span className="font-semibold text-gray-900">{submittedEmail}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pb-8 text-center">
            <p className="text-sm text-gray-500">
              Clique no link enviado para o seu e-mail para configurar sua senha e continuar o
              cadastro da sua clínica.
            </p>

            {devToken && (
              <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-4 text-left">
                <p className="mb-2 text-sm font-semibold text-orange-800">
                  [Modo de Desenvolvimento]
                </p>
                <p className="mb-3 text-xs text-orange-700">
                  O envio de e-mail falhou (restrição do Resend). Como você está em desenvolvimento,
                  pode continuar através do botão abaixo:
                </p>
                <Button asChild className="w-full bg-orange-600 hover:bg-orange-700">
                  <Link href={`/register/verify/${devToken}`}>Acessar Link de Verificação</Link>
                </Button>
              </div>
            )}

            <div className="border-t border-gray-100 pt-4">
              <p className="mb-4 text-sm text-gray-500">
                Não recebeu o e-mail? Verifique sua caixa de spam ou lixo eletrônico.
              </p>
              <Button variant="outline" className="w-full" onClick={() => setIsSuccess(false)}>
                Tentar outro e-mail
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mt-8 mb-8 w-full max-w-md">
        <ProgressSteps currentStep={1} />
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-2 pb-6 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Comece gratuitamente</CardTitle>
          <CardDescription className="text-base">
            Crie sua conta em menos de 1 minuto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-gray-700">Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Como devemos chamar você?" className="h-11" {...field} />
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
                    <FormLabel className="font-medium text-gray-700">E-mail Profissional</FormLabel>
                    <FormControl>
                      <Input placeholder="seu@email.com" className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 h-11 w-full text-base font-medium transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? 'Enviando...' : 'Continuar com E-mail'}
                </Button>
              </div>

              <p className="pt-4 text-center text-sm text-gray-500">
                Já tem uma conta?{' '}
                <Link
                  href="/login"
                  className="text-primary hover:text-primary/90 font-semibold hover:underline"
                >
                  Fazer login
                </Link>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

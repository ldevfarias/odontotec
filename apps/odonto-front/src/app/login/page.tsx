'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2, Eye, EyeOff, LayoutDashboard, Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/ui/logo';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthControllerLogin } from '@/generated/hooks/useAuthControllerLogin';
import { authControllerLoginMutationRequestSchema } from '@/generated/zod/authControllerLoginSchema';
import { analytics, EVENT_NAMES } from '@/services/analytics.service';

const LANDING_PAGE_URL = process.env.NEXT_PUBLIC_LANDING_URL || 'http://localhost:3002';

export default function LoginPage() {
  const { login } = useAuth();
  const { mutate, isPending } = useAuthControllerLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof authControllerLoginMutationRequestSchema>>({
    resolver: zodResolver(authControllerLoginMutationRequestSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  function onSubmit(values: z.infer<typeof authControllerLoginMutationRequestSchema>) {
    setAuthError(null);
    mutate(
      { data: values },
      {
        onSuccess: (response) => {
          const res = response as any;
          if (res.user?.id) {
            analytics.identify(String(res.user.id), {
              email: res.user.email,
              name: res.user.name,
              role: res.user.role,
            });
          }
          analytics.capture(EVENT_NAMES.USER_LOGGED_IN, {
            email: values.email,
            role: res.user?.role,
          });
          login('', undefined, res.user, res.clinics);
        },
        onError: (error: any) => {
          console.error('Login error:', error);
          analytics.capture(EVENT_NAMES.USER_LOGIN_FAILED, {
            email: values.email,
            error_status: error.response?.status,
          });
          if (error.response?.status === 401) {
            setAuthError(
              'E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.',
            );
          } else {
            setAuthError(
              'Ocorreu um erro ao tentar entrar. Por favor, tente novamente mais tarde.',
            );
          }
        },
      },
    );
  }

  return (
    <div className="flex min-h-screen w-full font-sans selection:bg-[#41b883]/20">
      {/* Lado Esquerdo - Marketing (Escondido no Mobile) */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#41b883] p-12 text-white lg:flex lg:w-1/2">
        {/* Elementos abstratos de background para dar profundidade */}
        <div className="pointer-events-none absolute top-0 right-0 h-[80vw] w-[80vw] translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-[60vw] w-[60vw] -translate-x-1/3 translate-y-1/3 rounded-full bg-black/5 blur-3xl" />

        <div className="relative z-10 flex h-full flex-col">
          {/* Logo Reutilizável */}
          <Link href={LANDING_PAGE_URL} className="mb-16 inline-block">
            <Logo className="text-3xl text-gray-900" ehColor="text-white" />
          </Link>

          {/* Proposta de Valor */}
          <div className="mt-auto mb-auto max-w-lg space-y-12">
            <div className="space-y-4">
              <h1 className="text-4xl leading-[1.1] font-bold tracking-tight xl:text-5xl">
                Sua clínica, no ritmo <br className="hidden xl:block" /> do que você precisa.
              </h1>
              <p className="max-w-md text-lg leading-relaxed text-[#e2f5ec]">
                Otimize seu tempo clínico e organize seu negócio. Zero distrações, máxima
                eficiência.
              </p>
            </div>

            {/* Bullets Premium */}
            <div className="space-y-8">
              {/* Feature 1 */}
              <div className="flex items-start gap-4 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-lg shadow-black/5 backdrop-blur-sm">
                <div className="shrink-0 rounded-xl bg-white/20 p-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="mb-1 flex items-center gap-2 text-xl font-semibold">
                    Equipe Ilimitada
                    <CheckCircle2 className="h-4 w-4 text-[#e2f5ec]" />
                  </h3>
                  <p className="text-sm leading-relaxed text-[#e2f5ec]/90">
                    Cadastre quantos usuários precisar. Sem pegadinhas, sem custos por assento.
                    Cresça sem barreiras.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-4 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-lg shadow-black/5 backdrop-blur-sm">
                <div className="shrink-0 rounded-xl bg-white/20 p-3">
                  <LayoutDashboard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="mb-1 flex items-center gap-2 text-xl font-semibold">
                    Gestão Visual
                    <CheckCircle2 className="h-4 w-4 text-[#e2f5ec]" />
                  </h3>
                  <p className="text-sm leading-relaxed text-[#e2f5ec]/90">
                    Dashboard ultra limpo que te diz exatamente o que precisa de atenção hoje em
                    tempo real.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lado Direito - Form de Login */}
      <div className="relative flex flex-1 flex-col justify-center overflow-y-auto bg-[#fafafa] px-4 sm:px-6 md:px-12">
        {/* Mobile Header (Sustitui a parte esquerda em telas pequenas) */}
        <div className="absolute top-0 right-0 left-0 z-50 flex flex-col items-center justify-center border-b border-gray-100 bg-white/80 p-6 backdrop-blur-md lg:hidden">
          <Link href={LANDING_PAGE_URL} className="flex items-center gap-2">
            <Logo className="text-xl text-gray-900" />
          </Link>
        </div>

        <div className="animate-in fade-in zoom-in-95 mx-auto mt-20 w-full max-w-[420px] duration-500 ease-out lg:mt-0">
          <div className="mb-10 lg:mb-12">
            <h2 className="mb-3 font-sans text-3xl font-bold tracking-tight text-gray-900">
              Acesse sua clínica
            </h2>
            <p className="text-base text-gray-500">Insira seus dados para continuar.</p>
          </div>

          <div className="rounded-[2rem] border border-gray-100/80 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-10">
            {authError && (
              <div className="animate-in fade-in slide-in-from-top-2 mb-6 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-red-600 shadow-sm duration-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <p className="text-sm leading-normal font-medium">{authError}</p>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-sm font-semibold text-gray-700">E-mail</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="dr@email.com"
                          {...field}
                          className="h-12 rounded-xl border-gray-200 bg-gray-50/50 text-base transition-all duration-200 hover:bg-gray-50 focus-visible:border-[#41b883] focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#41b883]/10"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-sm font-semibold text-gray-700">Senha</FormLabel>
                        <Link
                          href="/auth/forgot-password"
                          className="text-xs font-semibold text-[#41b883] transition-colors hover:text-[#41b883]/80"
                        >
                          Esqueceu ou deseja redefinir?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="group relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...field}
                            className="h-12 rounded-xl border-gray-200 bg-gray-50/50 pr-10 text-base transition-all duration-200 hover:bg-gray-50 focus-visible:border-[#41b883] focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#41b883]/10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute top-1/2 right-3 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-colors hover:text-[#41b883] focus:outline-none"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-500" />
                    </FormItem>
                  )}
                />
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="flex h-12 w-full items-center justify-center rounded-full bg-[#41b883] text-base font-semibold text-white shadow-[#41b883]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#3ba776] hover:shadow-lg focus-visible:ring-4 focus-visible:ring-[#41b883]/30"
                    disabled={isPending}
                  >
                    {isPending ? 'Entrando...' : 'Acessar'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          <div className="mt-8 text-center text-sm font-medium text-gray-500">
            Ainda não tem uma conta?{' '}
            <Link
              href="/register"
              className="font-semibold text-[#41b883] transition-colors hover:text-[#3ba776]"
            >
              Crie sua conta agora
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { analytics, EVENT_NAMES } from '@/services/analytics.service';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, AlertCircle, Users, LayoutDashboard, CheckCircle2 } from 'lucide-react';
import { useAuthControllerLogin } from '@/generated/hooks/useAuthControllerLogin';
import { authControllerLoginMutationRequestSchema } from '@/generated/zod/authControllerLoginSchema';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';

import { Logo } from '@/components/ui/logo';

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
        mutate({ data: values }, {
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
                    setAuthError('E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.');
                } else {
                    setAuthError('Ocorreu um erro ao tentar entrar. Por favor, tente novamente mais tarde.');
                }
            }
        });
    }

    return (
        <div className="flex min-h-screen w-full font-sans selection:bg-[#41b883]/20">
            {/* Lado Esquerdo - Marketing (Escondido no Mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#41b883] p-12 text-white flex-col justify-between relative overflow-hidden">
                {/* Elementos abstratos de background para dar profundidade */}
                <div className="absolute top-0 right-0 w-[80vw] h-[80vw] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[60vw] h-[60vw] bg-black/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full">
                    {/* Logo Reutilizável */}
                    <Link href="/" className="inline-block mb-16">
                        <Logo className="text-3xl text-gray-900" ehColor="text-white" />
                    </Link>

                    {/* Proposta de Valor */}
                    <div className="space-y-12 max-w-lg mt-auto mb-auto">
                        <div className="space-y-4">
                            <h1 className="text-4xl xl:text-5xl font-bold tracking-tight leading-[1.1]">
                                Sua clínica, no ritmo <br className="hidden xl:block" /> do que você precisa.
                            </h1>
                            <p className="text-[#e2f5ec] text-lg leading-relaxed max-w-md">
                                Otimize seu tempo clínico e organize seu negócio. Zero distrações, máxima eficiência.
                            </p>
                        </div>

                        {/* Bullets Premium */}
                        <div className="space-y-8">
                            {/* Feature 1 */}
                            <div className="flex items-start gap-4 p-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm shadow-lg shadow-black/5">
                                <div className="p-3 bg-white/20 rounded-xl shrink-0">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-xl mb-1 flex items-center gap-2">
                                        Equipe Ilimitada
                                        <CheckCircle2 className="w-4 h-4 text-[#e2f5ec]" />
                                    </h3>
                                    <p className="text-[#e2f5ec]/90 leading-relaxed text-sm">
                                        Cadastre quantos usuários precisar. Sem pegadinhas, sem custos por assento. Cresça sem barreiras.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 2 */}
                            <div className="flex items-start gap-4 p-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm shadow-lg shadow-black/5">
                                <div className="p-3 bg-white/20 rounded-xl shrink-0">
                                    <LayoutDashboard className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-xl mb-1 flex items-center gap-2">
                                        Gestão Visual
                                        <CheckCircle2 className="w-4 h-4 text-[#e2f5ec]" />
                                    </h3>
                                    <p className="text-[#e2f5ec]/90 leading-relaxed text-sm">
                                        Dashboard ultra limpo que te diz exatamente o que precisa de atenção hoje em tempo real.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </div>

            {/* Lado Direito - Form de Login */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 md:px-12 bg-[#fafafa] relative overflow-y-auto">

                {/* Mobile Header (Sustitui a parte esquerda em telas pequenas) */}
                <div className="lg:hidden absolute top-0 left-0 right-0 p-6 flex flex-col justify-center items-center bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
                    <Link href="/" className="flex items-center gap-2">
                        <Logo className="text-xl text-gray-900" />
                    </Link>
                </div>

                <div className="w-full max-w-[420px] mx-auto mt-20 lg:mt-0 animate-in fade-in zoom-in-95 duration-500 ease-out">
                    <div className="mb-10 lg:mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 font-sans mb-3">
                            Acesse sua clínica
                        </h2>
                        <p className="text-gray-500 text-base">
                            Insira seus dados para continuar.
                        </p>
                    </div>

                    <div className="bg-white border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] p-8 sm:p-10">
                        {authError && (
                            <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm">
                                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                                <p className="text-sm font-medium leading-normal">{authError}</p>
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
                                                    className="h-12 rounded-xl border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus-visible:bg-white focus-visible:border-[#41b883] focus-visible:ring-4 focus-visible:ring-[#41b883]/10 transition-all duration-200 text-base"
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
                                                    className="text-xs font-semibold text-[#41b883] hover:text-[#41b883]/80 transition-colors"
                                                >
                                                    Esqueceu ou deseja redefinir?
                                                </Link>
                                            </div>
                                            <FormControl>
                                                <div className="relative group">
                                                    <Input
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder="••••••••"
                                                        {...field}
                                                        className="h-12 rounded-xl border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus-visible:bg-white focus-visible:border-[#41b883] focus-visible:ring-4 focus-visible:ring-[#41b883]/10 transition-all duration-200 text-base pr-10"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#41b883] transition-colors focus:outline-none h-8 w-8 flex items-center justify-center rounded-lg"
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
                                        className="w-full h-12 rounded-full font-semibold bg-[#41b883] hover:bg-[#3ba776] text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-4 focus-visible:ring-[#41b883]/30 shadow-[#41b883]/20 text-base flex items-center justify-center"
                                        disabled={isPending}
                                    >
                                        {isPending ? 'Entrando...' : 'Acessar'}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>

                    <div className="mt-8 text-center text-sm text-gray-500 font-medium">
                        Ainda não tem uma conta?{" "}
                        <Link href="/register" className="text-[#41b883] hover:text-[#3ba776] font-semibold transition-colors">
                            Crie sua conta agora
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

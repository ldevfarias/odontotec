'use client';

import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { notificationService } from '@/services/notification.service';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useUsersControllerFindInvitation } from '@/generated/hooks/useUsersControllerFindInvitation';
import { useAuthControllerRegister } from '@/generated/hooks/useAuthControllerRegister';
import { authControllerRegisterMutationRequestSchema } from '@/generated/zod/authControllerRegisterSchema';
import { useAuth } from '@/contexts/AuthContext';

type RegisterFormValues = z.infer<typeof authControllerRegisterMutationRequestSchema>;

export default function RegisterInvitationPage() {
    const { token } = useParams<{ token: string }>();
    const router = useRouter();
    const { login } = useAuth();

    const { data: invitation, isLoading: isLoadingInvite, isError } = useUsersControllerFindInvitation(token);
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
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isError || !invitation) {
        return (
            <div className="flex h-screen items-center justify-center p-4">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle className="text-red-600">Convite Inválido</CardTitle>
                        <CardDescription>
                            Este link de convite expirou ou é inválido. Por favor, solicite um novo convite ao administrador da clínica.
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

    function onSubmit(values: RegisterFormValues) {
        register(
            { data: values },
            {
                onSuccess: (data) => {
                    notificationService.success('Cadastro concluído com sucesso!');
                    // In a real app, the response would contain the token
                    // For now, redirect to login
                    router.push('/login');
                },
                onError: () => {
                    notificationService.error('Erro ao concluir o cadastro.');
                },
            }
        );
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4 py-12">
            <Card className="w-full max-w-lg shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Completar Cadastro</CardTitle>
                    <CardDescription>
                        Olá! Você foi convidado para a clínica <strong>{(invitation as any).clinic?.name || 'OdontoTec'}</strong>.
                        Preencha seus dados para ativar sua conta.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg bg-gray-100 p-4 text-sm">
                        <div>
                            <span className="block text-gray-500">E-mail</span>
                            <span className="font-medium">{(invitation as any).email}</span>
                        </div>
                        <div>
                            <span className="block text-gray-500">CPF</span>
                            <span className="font-medium">{(invitation as any).cpf}</span>
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

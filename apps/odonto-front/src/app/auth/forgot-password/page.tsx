'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { notificationService } from '@/services/notification.service';

const forgotPasswordSchema = z.object({
    email: z.string().email('E-mail inválido'),
});

export default function ForgotPasswordPage() {
    const [isPending, setIsPending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const form = useForm<z.infer<typeof forgotPasswordSchema>>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });

    async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
        setIsPending(true);
        try {
            await api.post('/auth/forgot-password', values);
            setIsSuccess(true);
            notificationService.success('Email de recuperação enviado!', 'Verifique sua caixa de entrada para redefinir sua senha.');
        } catch (error) {
            console.error(error);
            notificationService.error('Erro ao enviar email', 'Ocorreu um erro ao processar sua solicitação. Tente novamente.');
        } finally {
            setIsPending(false);
        }
    }

    if (isSuccess) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50 px-4">
                <Card className="w-full max-w-md shadow-lg">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold text-green-600">Email Enviado!</CardTitle>
                        <CardDescription>
                            Verifique seu e-mail para continuar com a recuperação de senha.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-center">
                        <Link href="/login">
                            <Button variant="outline">Voltar para o Login</Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Recuperar Senha</CardTitle>
                    <CardDescription>
                        Informe seu e-mail para receber o link de redefinição de senha
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>E-mail</FormLabel>
                                        <FormControl>
                                            <Input placeholder="seu@email.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending ? 'Enviando...' : 'Enviar Email'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link href="/login" className="text-sm text-gray-500 hover:underline">
                        Voltar para o Login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}

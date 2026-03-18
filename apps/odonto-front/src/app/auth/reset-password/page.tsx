'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { ResetPasswordCardSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { notificationService } from '@/services/notification.service';

const resetPasswordSchema = z.object({
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
});

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const [isPending, setIsPending] = useState(false);

    const form = useForm<z.infer<typeof resetPasswordSchema>>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
        if (!token) {
            notificationService.error('Token inválido ou ausente.');
            return;
        }

        setIsPending(true);
        try {
            await api.post('/auth/reset-password', {
                token: token,
                password: values.password,
            });
            notificationService.success('Senha redefinida com sucesso!');
            router.push('/login');
        } catch (error) {
            console.error(error);
            notificationService.error('Erro ao redefinir senha', 'O link pode ter expirado ou é inválido.');
        } finally {
            setIsPending(false);
        }
    }

    if (!token) {
        return (
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle className="text-red-600">Erro</CardTitle>
                    <CardDescription>Token de redefinição não encontrado.</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Link href="/auth/forgot-password">
                        <Button variant="outline">Solicitar novo link</Button>
                    </Link>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Redefinir Senha</CardTitle>
                <CardDescription>
                    Crie uma nova senha para sua conta
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirmar Nova Senha</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? 'Redefinindo...' : 'Redefinir Senha'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 px-4">
            <Suspense fallback={<ResetPasswordCardSkeleton />}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}

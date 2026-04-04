'use client';

import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { notificationService } from '@/services/notification.service';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { verifyEmail } from '@/services/auth';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { ProgressSteps } from '@/components/ui/progress-steps';

const verifySchema = z.object({
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não conferem",
    path: ["confirmPassword"],
});

type VerifyFormValues = z.infer<typeof verifySchema>;

export default function VerifyEmailPage() {
    const { token } = useParams<{ token: string }>();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<VerifyFormValues>({
        resolver: zodResolver(verifySchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (values: VerifyFormValues) => {
        setIsLoading(true);
        try {
            const response = await verifyEmail({
                token: token as string,
                password: values.password,
                confirmPassword: values.confirmPassword,
            });

            notificationService.success('E-mail verificado e conta criada com sucesso!');
            // Pass the newly created user to login so AuthContext upgrades the session.
            // Empty clinics array signals a new onboarding user — login() will route to /onboarding/terms.
            login('', response.user.clinicName, response.user as any, []);
        } catch (error: any) {
            console.error(error);
            notificationService.error(error.response?.data?.message || 'Link inválido ou expirado. Solicite um novo cadastro.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 px-4">
            <div className="mb-8 w-full max-w-md mt-8">
                <ProgressSteps currentStep={2} />
            </div>
            <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
                <CardHeader className="text-center space-y-4 pt-8">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">E-mail verificado!</CardTitle>
                    <CardDescription className="text-base">
                        Agora só falta criar sua senha para acessar o sistema.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pb-8">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-medium text-gray-700">Nova Senha</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="••••••••"
                                                    className="h-11 pr-10"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-5 w-5" />
                                                    ) : (
                                                        <Eye className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </div>
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
                                        <FormLabel className="font-medium text-gray-700">Confirmar Senha</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    placeholder="••••••••"
                                                    className="h-11 pr-10"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="h-5 w-5" />
                                                    ) : (
                                                        <Eye className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    className="w-full h-11 text-base font-medium bg-primary hover:bg-primary/90 transition-colors"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Criando Conta...' : 'Criar Senha e Continuar'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

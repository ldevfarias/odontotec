'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AuthInlineError } from '@/components/auth/AuthInlineError';
import { ResetPasswordCardSkeleton } from '@/components/skeletons';
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
import { AUTH_MESSAGES } from '@/constants/auth-messages';
import { api } from '@/lib/api';
import { notificationService } from '@/services/notification.service';

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  });

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [isPending, setIsPending] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    if (!token) {
      setAuthError(AUTH_MESSAGES.RESET_PASSWORD.INVALID_TOKEN_TITLE);
      notificationService.error(AUTH_MESSAGES.RESET_PASSWORD.INVALID_TOKEN_TITLE);
      return;
    }

    setIsPending(true);
    setAuthError(null);
    try {
      await api.post('/auth/reset-password', {
        token: token,
        password: values.password,
      });
      notificationService.success(AUTH_MESSAGES.RESET_PASSWORD.SUCCESS_TOAST_TITLE);
      router.push('/login');
    } catch {
      setAuthError(AUTH_MESSAGES.RESET_PASSWORD.ERROR_TOAST_DESCRIPTION);
      notificationService.error(
        AUTH_MESSAGES.RESET_PASSWORD.ERROR_TOAST_TITLE,
        AUTH_MESSAGES.RESET_PASSWORD.ERROR_TOAST_DESCRIPTION,
      );
    } finally {
      setIsPending(false);
    }
  }

  if (!token) {
    return (
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-red-600">
            {AUTH_MESSAGES.RESET_PASSWORD.INVALID_TOKEN_TITLE}
          </CardTitle>
          <CardDescription>
            {AUTH_MESSAGES.RESET_PASSWORD.INVALID_TOKEN_DESCRIPTION}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/auth/forgot-password">
            <Button variant="outline">{AUTH_MESSAGES.RESET_PASSWORD.REQUEST_NEW_LINK}</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">{AUTH_MESSAGES.RESET_PASSWORD.TITLE}</CardTitle>
        <CardDescription>{AUTH_MESSAGES.RESET_PASSWORD.SUBTITLE}</CardDescription>
      </CardHeader>
      <CardContent>
        <AuthInlineError message={authError} />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{AUTH_MESSAGES.RESET_PASSWORD.PASSWORD_LABEL}</FormLabel>
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
                  <FormLabel>{AUTH_MESSAGES.RESET_PASSWORD.CONFIRM_PASSWORD_LABEL}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending
                ? AUTH_MESSAGES.RESET_PASSWORD.SUBMIT_BUTTON_LOADING
                : AUTH_MESSAGES.RESET_PASSWORD.SUBMIT_BUTTON}
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

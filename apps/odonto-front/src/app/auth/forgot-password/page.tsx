'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AuthInlineError } from '@/components/auth/AuthInlineError';
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

const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
});

export default function ForgotPasswordPage() {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    setIsPending(true);
    setAuthError(null);
    try {
      await api.post('/auth/forgot-password', values);
      setIsSuccess(true);
      notificationService.success(
        AUTH_MESSAGES.FORGOT_PASSWORD.SUCCESS_TOAST_TITLE,
        AUTH_MESSAGES.FORGOT_PASSWORD.SUCCESS_TOAST_DESCRIPTION,
      );
    } catch {
      setAuthError(AUTH_MESSAGES.FORGOT_PASSWORD.ERROR_TOAST_DESCRIPTION);
      notificationService.error(
        AUTH_MESSAGES.FORGOT_PASSWORD.ERROR_TOAST_TITLE,
        AUTH_MESSAGES.FORGOT_PASSWORD.ERROR_TOAST_DESCRIPTION,
      );
    } finally {
      setIsPending(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-green-600">
              {AUTH_MESSAGES.FORGOT_PASSWORD.SUCCESS_TITLE}
            </CardTitle>
            <CardDescription>{AUTH_MESSAGES.FORGOT_PASSWORD.SUCCESS_SUBTITLE}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Link href="/login">
              <Button variant="outline">{AUTH_MESSAGES.FORGOT_PASSWORD.BACK_TO_LOGIN}</Button>
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
          <CardTitle className="text-2xl font-bold">
            {AUTH_MESSAGES.FORGOT_PASSWORD.TITLE}
          </CardTitle>
          <CardDescription>{AUTH_MESSAGES.FORGOT_PASSWORD.SUBTITLE}</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthInlineError message={authError} />

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
                {isPending
                  ? AUTH_MESSAGES.FORGOT_PASSWORD.SUBMIT_BUTTON_LOADING
                  : AUTH_MESSAGES.FORGOT_PASSWORD.SUBMIT_BUTTON}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/login" className="text-sm text-gray-500 hover:underline">
            {AUTH_MESSAGES.FORGOT_PASSWORD.BACK_TO_LOGIN}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

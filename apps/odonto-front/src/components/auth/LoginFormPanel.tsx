import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { UseFormReturn } from 'react-hook-form';

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
import { AUTH_MESSAGES } from '@/constants/auth-messages';
import { LoginFormValues } from '@/hooks/useLoginForm';

const LANDING_PAGE_URL = process.env.NEXT_PUBLIC_LANDING_URL || 'http://localhost:3002';

interface LoginFormPanelProps {
  form: UseFormReturn<LoginFormValues>;
  isPending: boolean;
  onSubmit: (values: LoginFormValues) => void;
  showPassword: boolean;
  togglePasswordVisibility: () => void;
}

export function LoginFormPanel({
  form,
  isPending,
  onSubmit,
  showPassword,
  togglePasswordVisibility,
}: LoginFormPanelProps) {
  return (
    <div className="relative flex flex-1 flex-col justify-center overflow-y-auto bg-[#fafafa] px-4 sm:px-6 md:px-12">
      <div className="absolute top-0 right-0 left-0 z-50 flex flex-col items-center justify-center border-b border-gray-100 bg-white/80 p-6 backdrop-blur-md lg:hidden">
        <Link href={LANDING_PAGE_URL} className="flex items-center gap-2">
          <Logo className="text-xl text-gray-900" />
        </Link>
      </div>

      <div className="animate-in fade-in zoom-in-95 mx-auto mt-20 w-full max-w-105 duration-500 ease-out lg:mt-0">
        <div className="mb-10 lg:mb-12">
          <h2 className="mb-3 font-sans text-3xl font-bold tracking-tight text-gray-900">
            {AUTH_MESSAGES.LOGIN.TITLE}
          </h2>
          <p className="text-base text-gray-500">{AUTH_MESSAGES.LOGIN.SUBTITLE}</p>
        </div>

        <div className="rounded-4xl border border-gray-100/80 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-sm font-semibold text-gray-700">
                      {AUTH_MESSAGES.LOGIN.EMAIL_LABEL}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={AUTH_MESSAGES.LOGIN.EMAIL_PLACEHOLDER}
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
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        {AUTH_MESSAGES.LOGIN.PASSWORD_LABEL}
                      </FormLabel>
                      <Link
                        href="/auth/forgot-password"
                        className="text-xs font-semibold text-[#41b883] transition-colors hover:text-[#41b883]/80"
                      >
                        {AUTH_MESSAGES.LOGIN.FORGOT_PASSWORD}
                      </Link>
                    </div>
                    <FormControl>
                      <div className="group relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder={AUTH_MESSAGES.LOGIN.PASSWORD_PLACEHOLDER}
                          {...field}
                          className="h-12 rounded-xl border-gray-200 bg-gray-50/50 pr-10 text-base transition-all duration-200 hover:bg-gray-50 focus-visible:border-[#41b883] focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#41b883]/10"
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
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
                  {isPending
                    ? AUTH_MESSAGES.LOGIN.SUBMIT_BUTTON_LOADING
                    : AUTH_MESSAGES.LOGIN.SUBMIT_BUTTON}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <div className="mt-8 text-center text-sm font-medium text-gray-500">
          {AUTH_MESSAGES.LOGIN.REGISTER_PROMPT}{' '}
          <Link
            href="/register"
            className="font-semibold text-[#41b883] transition-colors hover:text-[#3ba776]"
          >
            {AUTH_MESSAGES.LOGIN.REGISTER_LINK}
          </Link>
        </div>
      </div>
    </div>
  );
}

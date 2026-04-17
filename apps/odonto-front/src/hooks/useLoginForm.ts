import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AUTH_MESSAGES } from '@/constants/auth-messages';
import { AuthUser, useAuth, UserClinic } from '@/contexts/AuthContext';
import { useAuthControllerLogin } from '@/generated/hooks/useAuthControllerLogin';
import { analytics, EVENT_NAMES } from '@/services/analytics.service';
import { notificationService } from '@/services/notification.service';

interface LoginResponseShape {
  user?: {
    id?: string | number;
    email?: string;
    name?: string;
    role?: string;
  };
  clinics?: unknown[];
}

interface MutationErrorShape {
  response?: {
    status?: number;
  };
}

const getLoginErrorMessage = (statusCode?: number) => {
  if (statusCode === 401) {
    return AUTH_MESSAGES.LOGIN.INVALID_CREDENTIALS_ERROR;
  }

  return AUTH_MESSAGES.LOGIN.GENERIC_ERROR;
};

const toAuthUser = (user?: LoginResponseShape['user']): AuthUser | undefined => {
  if (!user || user.id == null || !user.name || !user.email || !user.role) {
    return undefined;
  }

  const normalizedId = typeof user.id === 'string' ? Number(user.id) : user.id;
  if (!Number.isFinite(normalizedId)) {
    return undefined;
  }

  return {
    id: normalizedId,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

const toUserClinics = (clinics?: LoginResponseShape['clinics']): UserClinic[] | undefined => {
  if (!Array.isArray(clinics)) {
    return undefined;
  }

  return clinics.reduce<UserClinic[]>((acc, clinic) => {
    const entry = clinic as Partial<UserClinic>;
    if (!entry.id || !entry.name || !entry.role) {
      return acc;
    }

    acc.push({
      id: entry.id,
      name: entry.name,
      role: entry.role,
      avatarUrl: entry.avatarUrl ?? null,
    });

    return acc;
  }, []);
};

const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, AUTH_MESSAGES.LOGIN.VALIDATION.EMAIL_REQUIRED)
    .email(AUTH_MESSAGES.LOGIN.VALIDATION.EMAIL_INVALID)
    .max(255, AUTH_MESSAGES.LOGIN.VALIDATION.EMAIL_MAX),
  password: z
    .string()
    .min(1, AUTH_MESSAGES.LOGIN.VALIDATION.PASSWORD_REQUIRED)
    .min(8, AUTH_MESSAGES.LOGIN.VALIDATION.PASSWORD_MIN)
    .max(128, AUTH_MESSAGES.LOGIN.VALIDATION.PASSWORD_MAX),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export function useLoginForm() {
  const { login } = useAuth();
  const { mutate, isPending } = useAuthControllerLogin();

  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    mutate(
      { data: values },
      {
        onSuccess: (response) => {
          const res = response as LoginResponseShape;
          const authUser = toAuthUser(res.user);
          const authClinics = toUserClinics(res.clinics);

          if (authUser) {
            analytics.identify(String(authUser.id), {
              email: authUser.email,
              name: authUser.name,
              role: authUser.role,
            });
          }

          analytics.capture(EVENT_NAMES.USER_LOGGED_IN, {
            email: values.email,
            role: authUser?.role,
          });

          setIsRedirecting(true);
          try {
            login('', undefined, authUser, authClinics);
          } catch {
            setIsRedirecting(false);
          }
        },
        onError: (error: unknown) => {
          const statusCode = (error as MutationErrorShape)?.response?.status;
          const message = getLoginErrorMessage(statusCode);

          analytics.capture(EVENT_NAMES.USER_LOGIN_FAILED, {
            email: values.email,
            error_status: statusCode,
          });
          analytics.captureException(error, { extra: { email: values.email } });

          notificationService.error(AUTH_MESSAGES.LOGIN.ERROR_TOAST_TITLE, message);
        },
      },
    );
  };

  return {
    form,
    isLoading: isPending || isRedirecting,
    onSubmit,
    showPassword,
    togglePasswordVisibility: () => setShowPassword((prevState) => !prevState),
  };
}

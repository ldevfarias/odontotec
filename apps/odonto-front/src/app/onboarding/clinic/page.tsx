'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ProgressSteps } from '@/components/ui/progress-steps';
import { useAuth } from '@/contexts/AuthContext';
import { analytics, EVENT_NAMES } from '@/services/analytics.service';
import { completeClinicSetup } from '@/services/auth';
import { notificationService } from '@/services/notification.service';

const clinicSchema = z.object({
  clinicName: z.string().min(3, 'Nome da clínica deve ter pelo menos 3 caracteres'),
  clinicPhone: z.string().optional(),
  clinicAddress: z.string().optional(),
});

type ClinicFormValues = z.infer<typeof clinicSchema>;

export default function ClinicSetupPage() {
  const router = useRouter();
  const { user, login } = useAuth(); // Need login to update the clinicName in context if needed
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ClinicFormValues>({
    resolver: zodResolver(clinicSchema),
    defaultValues: {
      clinicName: '',
      clinicPhone: '',
      clinicAddress: '',
    },
  });

  const onSubmit = async (values: ClinicFormValues) => {
    setIsLoading(true);
    try {
      const res = await completeClinicSetup(values);
      notificationService.success('Clínica configurada com sucesso!');
      analytics.capture(EVENT_NAMES.CLINIC_SETUP_COMPLETED, {
        clinic_name: values.clinicName,
        // Removendo flags extras do payload original para manter o padrão tipado ou podemos deixar como opcional no serviço
      });

      // Update AuthContext with new active token and clinics
      // AuthContext's login function handles the redirect logically
      if (user) {
        login('', values.clinicName, user, res.clinics);
      } else {
        router.push('/dashboard');
      }
    } catch (error: unknown) {
      console.error(error);
      const err = error as { response?: { data?: { message?: string } } };
      // Se o setup já foi concluído anteriormente (ex: erro de state loop), redirecione
      if (err.response?.data?.message === 'Clinic setup already completed') {
        router.push('/dashboard');
      } else {
        notificationService.error(err.response?.data?.message || 'Erro ao configurar clínica');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mt-8 mb-8 w-full max-w-md">
        <ProgressSteps currentStep={4} />
      </div>
      <Card className="border-t-primary w-full max-w-md border-t-4 shadow-xl">
        <CardHeader className="space-y-4 pt-8 text-center">
          <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full p-3">
            <Building2 className="text-primary h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">Configure sua Clínica</CardTitle>
          <CardDescription className="text-base">
            Último passo! Informe os dados da sua clínica para começar a usar o OdontoTec.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="clinicName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-gray-700">Nome da Clínica</FormLabel>
                    <FormControl>
                      <Input placeholder="Sua Clínica Odontológica" className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="clinicPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-gray-700">Telefone (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="clinicAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-gray-700">Endereço (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Rua, Número, Bairro, Cidade - UF"
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 h-11 w-full text-base font-medium transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? 'Salvando...' : 'Acessar o Sistema'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

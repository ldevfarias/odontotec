'use client';

import { Calendar, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppointmentsControllerPublicCancel } from '@/generated/hooks/useAppointmentsControllerPublicCancel';

function AppointmentCancelContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const token = searchParams.get('token');
  const { isError: isQueryError, isSuccess } = useAppointmentsControllerPublicCancel(
    { id: id!, token: token! },
    {
      query: {
        enabled: !!id && !!token,
        retry: false,
      },
    },
  );

  const status: 'loading' | 'success' | 'error' =
    !id || !token ? 'error' : isSuccess ? 'success' : isQueryError ? 'error' : 'loading';

  return (
    <div className="bg-muted/30 flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-full">
              <Calendar className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl">Cancelamento de Consulta</CardTitle>
          <CardDescription>Gerenciamento de Agendamento</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-6 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="text-primary mb-4 h-10 w-10 animate-spin" />
              <p>Processando seu pedido de cancelamento...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="mb-4 h-16 w-16 text-green-500" />
              <h3 className="mb-2 text-xl font-semibold">Consulta Cancelada!</h3>
              <p className="text-muted-foreground mb-6">
                Seu agendamento foi cancelado com sucesso. Caso queira marcar uma nova data, entre
                em contato com a clínica.
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="text-destructive mb-4 h-16 w-16" />
              <h3 className="mb-2 text-xl font-semibold">Ops! Algo deu errado.</h3>
              <p className="text-muted-foreground mb-6">
                Não foi possível processar seu cancelamento. O link pode ter expirado ou o
                agendamento não existe mais.
              </p>
              <Button variant="outline" onClick={() => window.close()}>
                Fechar Janela
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AppointmentCancelPage() {
  return (
    <Suspense>
      <AppointmentCancelContent />
    </Suspense>
  );
}

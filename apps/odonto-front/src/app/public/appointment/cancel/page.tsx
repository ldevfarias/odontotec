'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAppointmentsControllerPublicCancel } from '@/generated/hooks/useAppointmentsControllerPublicCancel';

function AppointmentCancelContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    const { isLoading: isQueryLoading, isError: isQueryError, isSuccess } = useAppointmentsControllerPublicCancel(
        { id: id!, token: token! },
        {
            query: {
                enabled: !!id && !!token,
                retry: false
            }
        }
    );

    useEffect(() => {
        if (!id || !token) {
            setStatus('error');
        } else if (isSuccess) {
            setStatus('success');
        } else if (isQueryError) {
            setStatus('error');
        } else if (isQueryLoading) {
            setStatus('loading');
        }
    }, [id, token, isSuccess, isQueryError, isQueryLoading]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <Calendar className="h-8 w-8" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Cancelamento de Consulta</CardTitle>
                    <CardDescription>Gerenciamento de Agendamento</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center py-6 text-center">
                    {status === 'loading' && (
                        <>
                            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                            <p>Processando seu pedido de cancelamento...</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Consulta Cancelada!</h3>
                            <p className="text-muted-foreground mb-6">
                                Seu agendamento foi cancelado com sucesso. Caso queira marcar uma nova data, entre em contato com a clínica.
                            </p>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <XCircle className="h-16 w-16 text-destructive mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Ops! Algo deu errado.</h3>
                            <p className="text-muted-foreground mb-6">
                                Não foi possível processar seu cancelamento. O link pode ter expirado ou o agendamento não existe mais.
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

'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { analytics, EVENT_NAMES } from '@/services/analytics.service';
import { subscriptionService } from '@/services/subscription.service';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CreditCard, PartyPopper, AlertTriangle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { notificationService } from '@/services/notification.service';
import { useEffect, useState, useRef } from 'react';
import { BillingCardsSkeleton } from '@/components/skeletons';
import { useSubscription } from '@/contexts/SubscriptionContext';


const STATUS_LABELS: Record<string, string> = {
    TRIAL: 'Período de Teste',
    ACTIVE: 'Ativa',
    CANCELED: 'Cancelada',
    EXPIRED: 'Expirada',
    past_due: 'Pagamento Pendente',
};

export default function BillingPage() {

    const router = useRouter();
    const searchParams = useSearchParams();
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [pollForUpgrade, setPollForUpgrade] = useState(false);
    const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { refreshStatus } = useSubscription();

    const { data: subscription, isLoading, refetch } = useQuery({
        queryKey: ['subscription-status'],
        queryFn: subscriptionService.getStatus,
        refetchInterval: pollForUpgrade ? 2000 : false,
        refetchOnWindowFocus: true, // Override global setting — sync after returning from Stripe portal
    });

    const checkoutMutation = useMutation({
        mutationFn: subscriptionService.createCheckoutSession,
        onSuccess: (data) => {
            if (data.url) {
                analytics.capture(EVENT_NAMES.SUBSCRIPTION_CHECKOUT_INITIATED, {
                    plan: 'PRO',
                });
                setIsRedirecting(true);
                window.location.href = data.url;
            } else {
                notificationService.error('Erro ao iniciar checkout.');
            }
        },
        onError: () => {
            notificationService.error('Erro ao conectar com pagamento via Stripe.');
        }
    });

    const portalMutation = useMutation({
        mutationFn: subscriptionService.createPortalSession,
        onSuccess: (data) => {
            if (data.url) {
                analytics.capture(EVENT_NAMES.SUBSCRIPTION_PORTAL_OPENED, {});
                setIsRedirecting(true);
                window.open(data.url, '_blank');
                setIsRedirecting(false);
            }
        },
        onError: () => {
            notificationService.error('Erro ao abrir portal de faturamento.');
        }
    });

    const hasStartedPolling = useRef(false);

    // Start polling when returning from Stripe with ?success=true
    useEffect(() => {
        if (hasStartedPolling.current) return;
        const success = searchParams.get('success');
        if (!success) return;

        hasStartedPolling.current = true;
        window.history.replaceState(null, '', '/settings/billing');
        setPollForUpgrade(true);

        // Safety timeout: stop polling after 15s regardless
        pollTimeoutRef.current = setTimeout(() => {
            setPollForUpgrade(false);
        }, 15000);
    }, [searchParams]);

    // Detect when plan becomes PRO during polling → confirm and sync global context
    useEffect(() => {
        if (!pollForUpgrade || subscription?.plan !== 'PRO') return;

        setPollForUpgrade(false);
        if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
        refreshStatus();
        notificationService.success('Assinatura realizada com sucesso! 🎉', undefined, { duration: 5000 });
    }, [subscription?.plan, pollForUpgrade, refreshStatus]);

    // Cleanup polling timeout on unmount
    useEffect(() => {
        return () => {
            if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
        };
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-6 container max-w-4xl py-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Assinatura & Planos</h2>
                    <p className="text-muted-foreground">Gerencie sua assinatura e métodos de pagamento.</p>
                </div>
                <BillingCardsSkeleton />
            </div>
        );
    }

    if (!subscription) return null;

    const canceledWithNoGrace =
        subscription.status === 'CANCELED' &&
        (!subscription.currentPeriodEnd || new Date(subscription.currentPeriodEnd) <= new Date());
    const isPro = subscription.status === 'ACTIVE' || subscription.status === 'past_due' ||
        (subscription.status === 'CANCELED' && !canceledWithNoGrace);
    const isTrial = subscription.status === 'TRIAL';
    const isExpired = subscription.status === 'EXPIRED' || canceledWithNoGrace;
    const isCanceling = subscription.cancelAtPeriodEnd === true && subscription.status === 'ACTIVE';

    return (
        <div className="space-y-6 container max-w-4xl py-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Assinatura & Planos</h2>
                <p className="text-muted-foreground">Gerencie sua assinatura e métodos de pagamento.</p>
            </div>

            {/* Status Alert */}
            {isTrial && (
                <Alert className="border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Período de Teste</AlertTitle>
                    <AlertDescription>
                        Você tem <strong>{subscription.daysRemaining} dias restantes</strong> no seu período gratuito.
                        {!isPro && " Aproveite para assinar agora e garantir o preço promocional!"}
                    </AlertDescription>
                </Alert>
            )}

            {isExpired && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Assinatura Expirada/Cancelada</AlertTitle>
                    <AlertDescription>
                        Seu acesso está limitado. Por favor, reative sua assinatura para continuar usando a plataforma.
                    </AlertDescription>
                </Alert>
            )}

            {subscription.cancelAtPeriodEnd && (
                <Alert className="border-orange-500/50 bg-orange-500/10 text-orange-600 dark:text-orange-400">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Cancelamento Agendado</AlertTitle>
                    <AlertDescription>
                        Sua assinatura será cancelada em{' '}
                        <strong>{subscription.cancelAt ? new Date(subscription.cancelAt).toLocaleDateString('pt-BR') : 'breve'}</strong>.
                        Você continuará com acesso até essa data. Para reverter, acesse o portal de gerenciamento.
                    </AlertDescription>
                </Alert>
            )}

            {subscription.status === 'past_due' && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Pagamento Pendente</AlertTitle>
                    <AlertDescription>
                        Houve um problema com seu último pagamento. Por favor, atualize seus dados no portal.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                {/* Current Plan Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Plano Atual
                            {isPro ? <Badge variant="default" className="bg-green-600">PRO</Badge> : <Badge variant="secondary">FREE / TRIAL</Badge>}
                        </CardTitle>
                        <CardDescription>
                            {isPro ? 'Sua clínica está operando com todos os recursos.' : 'Você está usando a versão de demonstração.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Status:</span>
                            <span className="font-medium">
                                {isCanceling ? 'Cancelando' : (STATUS_LABELS[subscription.status] ?? subscription.status)}
                            </span>
                        </div>
                        {subscription.trialEndsAt && subscription.status === 'TRIAL' && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Expira em:</span>
                                <span className="font-medium">{new Date(subscription.trialEndsAt).toLocaleDateString('pt-BR')}</span>
                            </div>
                        )}
                        {subscription.currentPeriodEnd && subscription.status === 'ACTIVE' && !isCanceling && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Próxima renovação:</span>
                                <span className="font-medium">{new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}</span>
                            </div>
                        )}
                        {isCanceling && subscription.cancelAt && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Acesso até:</span>
                                <span className="font-medium text-orange-600">{new Date(subscription.cancelAt).toLocaleDateString('pt-BR')}</span>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        {isPro && (
                            <Button variant="outline" className="w-full" onClick={() => portalMutation.mutate()} disabled={portalMutation.isPending || isRedirecting}>
                                {(portalMutation.isPending || isRedirecting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Gerenciar Assinatura (Portal)
                            </Button>
                        )}
                    </CardFooter>
                </Card>

                {/* Upgrade / Promo Card */}
                {!isPro && (
                    <Card className="border-primary/20 bg-primary/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <PartyPopper className="h-24 w-24" />
                        </div>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary">
                                Seja Pro
                                <Badge variant="default" className="bg-primary text-primary-foreground">Recomendado</Badge>
                            </CardTitle>
                            <CardDescription>
                                Desbloqueie todo o potencial da sua clínica.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-muted-foreground line-through text-lg font-medium">De R$ 80,00</span>
                                    <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded border border-primary/20">-37%</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold">R$ 49,99</span>
                                    <span className="text-muted-foreground">/mês</span>
                                </div>
                                <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                                    <PartyPopper className="h-3 w-3" />
                                    Oferta Especial (Tempo Limitado)
                                </p>
                            </div>
                            <ul className="text-sm space-y-2 text-muted-foreground">
                                <li className="flex items-center gap-2">✓ Agendamento Ilimitado</li>
                                <li className="flex items-center gap-2">✓ Prontuário Eletrônico Completo</li>
                                <li className="flex items-center gap-2">✓ Gestão Financeira</li>
                                <li className="flex items-center gap-2">✓ Suporte Prioritário</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" size="lg" onClick={() => checkoutMutation.mutate(undefined)} disabled={checkoutMutation.isPending || isRedirecting}>
                                {(checkoutMutation.isPending || isRedirecting) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                                Assinar Agora
                            </Button>
                        </CardFooter>
                    </Card>
                )}
            </div>
        </div>
    );
}

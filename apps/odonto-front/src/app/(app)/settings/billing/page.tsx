'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { BillingCardsSkeleton } from '@/components/skeletons';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { assertStripeUrl } from '@/lib/stripe-url';
import { analytics, EVENT_NAMES } from '@/services/analytics.service';
import { notificationService } from '@/services/notification.service';
import { subscriptionService } from '@/services/subscription.service';

import { BillingStatusBanner } from './BillingStatusBanner';
import { PlanCard } from './PlanCard';

export default function BillingPage() {
  const searchParams = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [pollForUpgrade, setPollForUpgrade] = useState(() => !!searchParams.get('success'));
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { refreshStatus } = useSubscription();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: subscriptionService.getStatus,
    refetchInterval: pollForUpgrade ? 2000 : false,
    refetchOnWindowFocus: true,
  });

  const checkoutMutation = useMutation({
    mutationFn: subscriptionService.createCheckoutSession,
    onSuccess: (data) => {
      if (data.url) {
        try {
          const safeUrl = assertStripeUrl(data.url);
          analytics.capture(EVENT_NAMES.SUBSCRIPTION_CHECKOUT_INITIATED, { plan: 'PRO' });
          setIsRedirecting(true);
          window.location.href = safeUrl;
        } catch (err) {
          console.error('[assertStripeUrl] blocked checkout redirect:', err);
          notificationService.error('URL de checkout inválida. Contate o suporte.');
        }
      } else {
        notificationService.error('Erro ao iniciar checkout.');
      }
    },
    onError: () => {
      notificationService.error('Erro ao conectar com pagamento via Stripe.');
    },
  });

  const portalMutation = useMutation({
    mutationFn: subscriptionService.createPortalSession,
    onSuccess: (data) => {
      if (data.url) {
        try {
          const safeUrl = assertStripeUrl(data.url);
          analytics.capture(EVENT_NAMES.SUBSCRIPTION_PORTAL_OPENED, {});
          setIsRedirecting(true);
          window.open(safeUrl, '_blank');
          setIsRedirecting(false);
        } catch (err) {
          console.error('[assertStripeUrl] blocked portal redirect:', err);
          notificationService.error('URL do portal inválida. Contate o suporte.');
        }
      }
    },
    onError: () => {
      notificationService.error('Erro ao abrir portal de faturamento.');
    },
  });

  const hasStartedPolling = useRef(false);

  useEffect(() => {
    if (!pollForUpgrade || hasStartedPolling.current) return;
    hasStartedPolling.current = true;
    window.history.replaceState(null, '', '/settings/billing');
    pollTimeoutRef.current = setTimeout(() => {
      setPollForUpgrade(false);
    }, 15000);
  }, [pollForUpgrade]);

  useEffect(() => {
    if (!pollForUpgrade || subscription?.plan !== 'PRO') return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPollForUpgrade(false);
    if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
    refreshStatus();
    notificationService.success('Assinatura realizada com sucesso! 🎉', undefined, {
      duration: 5000,
    });
  }, [subscription?.plan, pollForUpgrade, refreshStatus]);

  useEffect(() => {
    return () => {
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="container max-w-4xl space-y-6 py-6">
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
  const isPro =
    subscription.status === 'ACTIVE' ||
    subscription.status === 'past_due' ||
    (subscription.status === 'CANCELED' && !canceledWithNoGrace);
  const isTrial = subscription.status === 'TRIAL';
  const isExpired = subscription.status === 'EXPIRED' || canceledWithNoGrace;
  const isCanceling = subscription.cancelAtPeriodEnd === true && subscription.status === 'ACTIVE';

  return (
    <div className="container max-w-4xl space-y-6 py-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Assinatura & Planos</h2>
        <p className="text-muted-foreground">Gerencie sua assinatura e métodos de pagamento.</p>
      </div>

      <BillingStatusBanner
        subscription={subscription}
        isTrial={isTrial}
        isExpired={isExpired}
        isPro={isPro}
      />

      <PlanCard
        subscription={subscription}
        isPro={isPro}
        isCanceling={isCanceling}
        isRedirecting={isRedirecting}
        isPortalPending={portalMutation.isPending}
        isCheckoutPending={checkoutMutation.isPending}
        onPortal={() => portalMutation.mutate()}
        onCheckout={() => checkoutMutation.mutate(undefined)}
      />
    </div>
  );
}

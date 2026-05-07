'use client';

import { AlertTriangle } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SubscriptionData {
  status: string;
  daysRemaining?: number;
  cancelAtPeriodEnd?: boolean;
  cancelAt?: string;
}

interface BillingStatusBannerProps {
  subscription: SubscriptionData;
  isTrial: boolean;
  isExpired: boolean;
  isPro: boolean;
}

export function BillingStatusBanner({
  subscription,
  isTrial,
  isExpired,
  isPro,
}: BillingStatusBannerProps) {
  return (
    <>
      {isTrial && (
        <Alert className="border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Período de Teste</AlertTitle>
          <AlertDescription>
            Você tem <strong>{subscription.daysRemaining} dias restantes</strong> no seu período
            gratuito.
            {!isPro && ' Aproveite para assinar agora e garantir o preço promocional!'}
          </AlertDescription>
        </Alert>
      )}

      {isExpired && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Assinatura Expirada/Cancelada</AlertTitle>
          <AlertDescription>
            Seu acesso está limitado. Por favor, reative sua assinatura para continuar usando a
            plataforma.
          </AlertDescription>
        </Alert>
      )}

      {subscription.cancelAtPeriodEnd && (
        <Alert className="border-orange-500/50 bg-orange-500/10 text-orange-600 dark:text-orange-400">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Cancelamento Agendado</AlertTitle>
          <AlertDescription>
            Sua assinatura será cancelada em{' '}
            <strong>
              {subscription.cancelAt
                ? new Date(subscription.cancelAt).toLocaleDateString('pt-BR')
                : 'breve'}
            </strong>
            . Você continuará com acesso até essa data. Para reverter, acesse o portal de
            gerenciamento.
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
    </>
  );
}

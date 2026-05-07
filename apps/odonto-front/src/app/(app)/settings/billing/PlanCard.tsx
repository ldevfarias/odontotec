'use client';

import { CreditCard, Loader2, PartyPopper } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const STATUS_LABELS: Record<string, string> = {
  TRIAL: 'Período de Teste',
  ACTIVE: 'Ativa',
  CANCELED: 'Cancelada',
  EXPIRED: 'Expirada',
  past_due: 'Pagamento Pendente',
};

interface SubscriptionData {
  status: string;
  plan?: string;
  trialEndsAt?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
  cancelAt?: string | null;
}

interface PlanCardProps {
  subscription: SubscriptionData;
  isPro: boolean;
  isCanceling: boolean;
  isRedirecting: boolean;
  isPortalPending: boolean;
  isCheckoutPending: boolean;
  onPortal: () => void;
  onCheckout: () => void;
}

export function PlanCard({
  subscription,
  isPro,
  isCanceling,
  isRedirecting,
  isPortalPending,
  isCheckoutPending,
  onPortal,
  onCheckout,
}: PlanCardProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Plano Atual
            {isPro ? (
              <Badge variant="default" className="bg-green-600">
                PRO
              </Badge>
            ) : (
              <Badge variant="secondary">FREE / TRIAL</Badge>
            )}
          </CardTitle>
          <CardDescription>
            {isPro
              ? 'Sua clínica está operando com todos os recursos.'
              : 'Você está usando a versão de demonstração.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status:</span>
            <span className="font-medium">
              {isCanceling
                ? 'Cancelando'
                : (STATUS_LABELS[subscription.status] ?? subscription.status)}
            </span>
          </div>
          {subscription.trialEndsAt && subscription.status === 'TRIAL' && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Expira em:</span>
              <span className="font-medium">
                {new Date(subscription.trialEndsAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
          )}
          {subscription.currentPeriodEnd && subscription.status === 'ACTIVE' && !isCanceling && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Próxima renovação:</span>
              <span className="font-medium">
                {new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
              </span>
            </div>
          )}
          {isCanceling && subscription.cancelAt && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Acesso até:</span>
              <span className="font-medium text-orange-600">
                {new Date(subscription.cancelAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {isPro && (
            <Button
              variant="outline"
              className="w-full"
              onClick={onPortal}
              disabled={isPortalPending || isRedirecting}
            >
              {(isPortalPending || isRedirecting) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Gerenciar Assinatura (Portal)
            </Button>
          )}
        </CardFooter>
      </Card>

      {!isPro && (
        <Card className="border-primary/20 bg-primary/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <PartyPopper className="h-24 w-24" />
          </div>
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              Seja Pro
              <Badge variant="default" className="bg-primary text-primary-foreground">
                Recomendado
              </Badge>
            </CardTitle>
            <CardDescription>Desbloqueie todo o potencial da sua clínica.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-muted-foreground text-lg font-medium line-through">
                  De R$ 80,00
                </span>
                <span className="bg-primary/10 text-primary border-primary/20 rounded border px-2 py-0.5 text-xs font-bold">
                  -37%
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">R$ 49,99</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
              <p className="flex items-center gap-1 text-xs font-medium text-green-600">
                <PartyPopper className="h-3 w-3" />
                Oferta Especial (Tempo Limitado)
              </p>
            </div>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li className="flex items-center gap-2">✓ Agendamento Ilimitado</li>
              <li className="flex items-center gap-2">✓ Prontuário Eletrônico Completo</li>
              <li className="flex items-center gap-2">✓ Gestão Financeira</li>
              <li className="flex items-center gap-2">✓ Suporte Prioritário</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              size="lg"
              onClick={onCheckout}
              disabled={isCheckoutPending || isRedirecting}
            >
              {isCheckoutPending || isRedirecting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 h-4 w-4" />
              )}
              Assinar Agora
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

'use client';

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { api } from '@/lib/api';
import { assertStripeUrl } from '@/lib/stripe-url';
import { notificationService } from '@/services/notification.service';
import { subscriptionService } from '@/services/subscription.service';

import { useAuth } from './AuthContext';

interface SubscriptionState {
  plan: 'FREE' | 'PRO';
  status: 'TRIAL' | 'ACTIVE' | 'CANCELED' | 'EXPIRED';
  daysRemaining: number;
  isTrial: boolean;
  isExpired: boolean;
  isCanceling: boolean;
  cancelAt: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  isLocked: boolean;
  trialEndsAt: string | null;
  isLoading: boolean;
  upgradeToPro: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionState | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<Omit<SubscriptionState, 'upgradeToPro' | 'refreshStatus'>>({
    plan: 'FREE',
    status: 'TRIAL',
    daysRemaining: 15, // Default pessimistic
    isTrial: true,
    isExpired: false,
    isCanceling: false,
    cancelAt: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    isLocked: false,
    trialEndsAt: null,
    isLoading: true,
  });

  const refreshStatus = async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/subscription/status');
      const isCanceling = data.cancelAtPeriodEnd === true && data.status === 'ACTIVE';
      setState({
        ...data,
        isCanceling,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const upgradeToPro = async () => {
    try {
      const data = await subscriptionService.createCheckoutSession();
      if (data.url) {
        try {
          window.location.href = assertStripeUrl(data.url);
        } catch (err) {
          console.error('[assertStripeUrl] blocked checkout redirect:', err);
          notificationService.error('URL de checkout inválida. Contate o suporte.');
        }
      } else {
        notificationService.error('Erro ao iniciar checkout.');
      }
    } catch (error: any) {
      console.error('Upgrade failed:', error);
      const message =
        error.response?.status === 403
          ? 'Apenas administradores podem realizar upgrades.'
          : 'Falha ao conectar com o pagamento. Tente novamente.';
      notificationService.error(message);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      refreshStatus();
    }
  }, [user]);

  // Re-sync subscription status when user returns to the tab (e.g. after Stripe portal)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        refreshStatus();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  const canceledWithNoGrace =
    state.status === 'CANCELED' &&
    (!state.currentPeriodEnd || new Date(state.currentPeriodEnd) <= new Date());
  const isLocked = state.status === 'EXPIRED' || canceledWithNoGrace;

  return (
    <SubscriptionContext.Provider value={{ ...state, isLocked, upgradeToPro, refreshStatus }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

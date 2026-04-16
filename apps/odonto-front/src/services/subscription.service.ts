import { api } from '@/lib/api';

export interface SubscriptionStatus {
  plan: 'FREE' | 'PRO';
  status: 'TRIAL' | 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'past_due';
  daysRemaining: number;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  isTrial: boolean;
  isExpired: boolean;
  pastDue: boolean;
  cancelAtPeriodEnd: boolean;
  cancelAt: string | null;
  stripeCustomerId: string | null;
}

export const subscriptionService = {
  getStatus: async (): Promise<SubscriptionStatus> => {
    try {
      const response = await api.get('/subscription/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription status', error);
      throw error;
    }
  },

  createCheckoutSession: async (cancelUrl?: string) => {
    try {
      const response = await api.post('/subscription/checkout', cancelUrl ? { cancelUrl } : {});
      return response.data; // expects { url: string }
    } catch (error) {
      console.error('Error creating checkout session', error);
      throw error;
    }
  },

  createPortalSession: async () => {
    try {
      const response = await api.post('/subscription/portal');
      return response.data; // expects { url: string }
    } catch (error) {
      console.error('Error creating portal session', error);
      throw error;
    }
  },
};

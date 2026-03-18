import { analytics } from '@/services/analytics.service';

/**
 * Hook para acessar o serviço de analytics de forma consistente nos componentes.
 */
export function useAnalytics() {
  return analytics;
}

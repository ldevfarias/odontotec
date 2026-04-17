import posthog from 'posthog-js';

/**
 * Nomes de eventos centralizados para evitar typos e inconsistências.
 */
export const EVENT_NAMES = {
  // Autenticação
  USER_LOGGED_IN: 'user_logged_in',
  USER_LOGIN_FAILED: 'user_login_failed',
  USER_REGISTERED: 'user_registered',

  // Onboarding
  CLINIC_SETUP_COMPLETED: 'clinic_setup_completed',

  // Pacientes
  PATIENT_CREATED: 'patient_created',
  PATIENT_DELETED: 'patient_deleted',

  // Agendamentos
  APPOINTMENT_CREATED: 'appointment_created',
  APPOINTMENT_UPDATED: 'appointment_updated',

  // Financeiro
  PAYMENT_REGISTERED: 'payment_registered',
  TREATMENT_PLAN_STATUS_UPDATED: 'treatment_plan_status_updated',

  // SaaS / Assinaturas
  SUBSCRIPTION_CHECKOUT_INITIATED: 'subscription_checkout_initiated',
  SUBSCRIPTION_PORTAL_OPENED: 'subscription_portal_opened',

  // Time / Profissionais
  PROFESSIONAL_INVITED: 'professional_invited',

  // Tour Guiado
  TOUR_STARTED: 'tour_started',
  TOUR_COMPLETED: 'tour_completed',
  TOUR_DISMISSED: 'tour_dismissed',
} as const;

export type EventName = (typeof EVENT_NAMES)[keyof typeof EVENT_NAMES];

/**
 * Definições de payloads para cada evento (Type Safety)
 */
interface EventPayloads {
  [EVENT_NAMES.USER_LOGGED_IN]: { email: string; role?: string };
  [EVENT_NAMES.USER_LOGIN_FAILED]: { email: string; error_status?: number };
  [EVENT_NAMES.USER_REGISTERED]: { email: string; name: string };
  [EVENT_NAMES.CLINIC_SETUP_COMPLETED]: { clinic_name: string; plan?: string };
  [EVENT_NAMES.PATIENT_CREATED]: { patient_id: number; has_address: boolean };
  [EVENT_NAMES.PATIENT_DELETED]: { patient_id: number };
  [EVENT_NAMES.APPOINTMENT_CREATED]: {
    patient_id: number;
    dentist_id: number;
    duration: number;
    date: string;
  };
  [EVENT_NAMES.APPOINTMENT_UPDATED]: {
    patient_id: number;
    dentist_id: number;
    duration: number;
    date: string;
  };
  [EVENT_NAMES.PAYMENT_REGISTERED]: {
    amount: number;
    method: string;
    patient_id: number;
    treatment_plan_id?: number | null;
  };
  [EVENT_NAMES.TREATMENT_PLAN_STATUS_UPDATED]: {
    status: string;
    patient_id: number;
    treatment_plan_id: number;
    new_status?: string;
  };
  [EVENT_NAMES.SUBSCRIPTION_CHECKOUT_INITIATED]: { plan: string };
  [EVENT_NAMES.SUBSCRIPTION_PORTAL_OPENED]: Record<string, never>;
  [EVENT_NAMES.PROFESSIONAL_INVITED]: { email: string; role: string };
  [EVENT_NAMES.TOUR_STARTED]: Record<string, never>;
  [EVENT_NAMES.TOUR_COMPLETED]: Record<string, never>;
  [EVENT_NAMES.TOUR_DISMISSED]: { step: number };
}

/**
 * Analytics Service centralizado
 */
export const analytics = {
  /**
   * Captura um evento personalizado
   */
  capture<T extends EventName>(event: T, properties?: EventPayloads[T]) {
    posthog.capture(event, properties);
  },

  /**
   * Identifica o usuário no PostHog após login
   */
  identify(distinctId: string, properties?: Record<string, unknown>) {
    posthog.identify(distinctId, properties);
  },

  /**
   * Reseta a identidade (usuado no logout)
   */
  reset() {
    posthog.reset();
  },

  /**
   * Captura uma exceção manualmente
   */
  captureException(error: unknown, properties?: Record<string, unknown>) {
    posthog.captureException(error, properties);
  },
};

# PostHog Integration Report

## Summary

PostHog was integrated into the OdontoTec Next.js 16.1.4 (App Router) project. The integration uses `instrumentation-client.ts` for client-side initialization (the correct approach for Next.js ≥15.3), a reverse proxy via Next.js `rewrites()` to bypass ad blockers, and targeted `posthog.capture()` calls at key business moments across the application.

### Integration Files

| File                        | Change                                                                             |
| --------------------------- | ---------------------------------------------------------------------------------- |
| `instrumentation-client.ts` | Created — PostHog client-side initialization                                       |
| `next.config.ts`            | Updated — added reverse proxy rewrites and `skipTrailingSlashRedirect`             |
| `.env.local`                | Updated — added `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` |

### Key Integration Details

- **Initialization**: `instrumentation-client.ts` at the project root initializes PostHog with `capture_exceptions: true`, debug mode in development, and the `/ingest` reverse proxy host.
- **Identity**: `posthog.identify()` is called on login success with `user.id`, `email`, `name`, and `role`.
- **Reset**: `posthog.reset()` is called on logout to unlink user identity.
- **Proxy**: Requests are routed through `/ingest` → `https://us.i.posthog.com` to avoid ad blockers.

---

## Tracked Events

| Event Name                        | Description                                                      | File                                               |
| --------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------- |
| `user_logged_in`                  | User successfully logs in                                        | `src/app/login/page.tsx`                           |
| `user_login_failed`               | Login attempt fails (wrong credentials, network error)           | `src/app/login/page.tsx`                           |
| `user_registered`                 | New user completes registration via invite link                  | `src/app/register/page.tsx`                        |
| `clinic_setup_completed`          | User finishes onboarding by setting up their clinic              | `src/app/onboarding/clinic/page.tsx`               |
| `patient_created`                 | A new patient is added to the system                             | `src/components/patients/CreatePatientDialog.tsx`  |
| `patient_deleted`                 | A patient record is deleted                                      | `src/components/patients/DeletePatientDialog.tsx`  |
| `appointment_created`             | A new appointment is scheduled                                   | `src/components/appointments/AppointmentModal.tsx` |
| `appointment_updated`             | An existing appointment is edited                                | `src/components/appointments/AppointmentModal.tsx` |
| `payment_registered`              | A payment is recorded for a patient                              | `src/components/patients/PaymentsTab.tsx`          |
| `treatment_plan_status_updated`   | A treatment plan status changes (e.g., in progress → completed)  | `src/components/patients/PaymentsTab.tsx`          |
| `subscription_checkout_initiated` | User clicks "Assinar Agora" and is redirected to Stripe checkout | `src/app/(app)/settings/billing/page.tsx`          |
| `subscription_portal_opened`      | User opens the Stripe billing portal                             | `src/app/(app)/settings/billing/page.tsx`          |
| `professional_invited`            | A new team member is invited to the clinic                       | `src/app/(app)/professionals/page.tsx`             |

---

## PostHog Dashboard & Insights

**Dashboard**: [Analytics basics](https://us.posthog.com/project/341552/dashboard/1358844)

| Insight                               | Description                                                     | Link                                                            |
| ------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------- |
| User Onboarding Funnel                | Funnel from registration → clinic setup → first patient created | [View](https://us.posthog.com/project/341552/insights/yQj6l4M7) |
| Daily Active Users & Login Failures   | Trend of daily logins alongside login failures                  | [View](https://us.posthog.com/project/341552/insights/UIFsZOFD) |
| Core Platform Activity                | Trend of core actions: appointments, patients, payments         | [View](https://us.posthog.com/project/341552/insights/qbDbKIs2) |
| Subscription Funnel & Revenue Actions | Funnel from checkout initiated → portal opened                  | [View](https://us.posthog.com/project/341552/insights/8fm929tF) |

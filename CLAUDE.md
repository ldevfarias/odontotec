# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OdontoTec is a multi-tenant dental clinic management SaaS. It's a Turbo monorepo with three apps:
- `apps/odonto-api` — NestJS REST API (port 3000)
- `apps/odonto-front` — Next.js 16 frontend dashboard (port 3001)
- `apps/landing` — Next.js 16 marketing landing page (port 3002)

## Commands

### Root (Turbo — runs all apps in parallel)
```bash
npm run dev       # Start all apps
npm run build     # Build all apps
npm run lint      # Lint all apps
npm run format    # Prettier format
npm run clean-ports  # Kill processes on 3000, 3001
```

### odonto-api
```bash
npm run start:dev          # Watch mode
npm run build              # Compile to dist/
npm run test               # Jest tests
npm run test:watch         # Jest watch mode
npm run test:e2e           # E2E tests
npm run seed               # Seed database
npm run generate:openapi   # Export openapi.json (required before kubb)
npm run lint               # ESLint --fix
```

### odonto-front
```bash
npm run dev    # Start on port 3001
npm run build  # Next.js production build
npm run lint   # ESLint
npm run kubb   # Regenerate API clients from openapi.json
```

## Architecture

### Multi-Tenancy
Shared database, shared schema. Every entity has a `clinicId` FK. Isolation is enforced at the service layer by filtering all queries by `clinicId`. The frontend sends `X-Clinic-Id` header on every request (set by axios interceptor from sessionStorage). The `@Tenant()` decorator extracts it server-side. A `TenancyInterceptor` validates response data stays within the clinic's scope.

Guard execution order: `ThrottlerGuard → SubscriptionGuard → ClinicMembershipGuard`

### Authentication Flow
- Login → JWT access token (15m) + refresh token (7d), both set as HttpOnly cookies
- Frontend axios interceptor auto-calls `/auth/refresh` on 401, then retries the original request
- `middleware.ts` in odonto-front uses `jwtVerify` to protect routes before rendering
- `@Public()` decorator marks endpoints that bypass `JwtAuthGuard`
- Three roles: `ADMIN`, `DENTIST`, `SIMPLE` (receptionist)

### API Client Generation (Kubb)
The frontend does **not** manually write API clients. Kubb reads `apps/odonto-api/openapi.json` and generates into `apps/odonto-front/src/generated/`:
- `clients/` — Axios clients
- `hooks/` — React Query hooks
- `ts/` — TypeScript types
- `zod/` — Zod schemas

**Workflow**: Modify API → `npm run generate:openapi` in odonto-api → `npm run kubb` in odonto-front → use generated hooks.

### State Management (Frontend)
- `AuthContext` — user identity, list of clinics, active clinic
- `SubscriptionContext` — current plan status (gates features via `SubscriptionBlocker`)
- React Query (TanStack) — all server state; prefer generated hooks from `src/generated/hooks/`

### Notification Pattern
Use `notificationService` (Sonner wrapper at `src/services/notification.service.ts`), not raw `toast()` calls.

### Analytics
`useAnalytics` hook wraps PostHog. Track events like `patient_created`, `appointment_created`, `payment_registered` on significant user actions.

## Environment Setup

**apps/odonto-api/.env**
```
POSTGRES_HOST=localhost
POSTGRES_PORT=5434
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres_password
POSTGRES_DB=odonto_tec
JWT_SECRET=change-in-production
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
# Optional: RESEND_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, R2_* vars
```

**apps/odonto-front/.env.local**
```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

PostgreSQL runs on port **5434** (non-standard). `synchronize: true` in dev, disabled in production.

## Deployment

- **Frontend**: Vercel (auto-deploy from `main`)
- **API**: Railway (via GitHub Actions on `main` push)
- **Database**: Railway PostgreSQL plugin
- **Storage**: Cloudflare R2 (documents/images)
- **Email**: Resend
- **Payments**: Stripe (webhook at `/subscription/webhook`)
- **Analytics**: PostHog

CI pipeline (`.github/workflows/deploy.yml`): lint → type-check → build API → build frontend → deploy to Railway.

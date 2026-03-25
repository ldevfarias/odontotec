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

## Database Migrations

OdontoTec uses **TypeORM migrations** for database schema management in production. This replaces the old `synchronize` pattern and ensures schema versions are tracked and reversible.

### Migration Workflow

**For Developers:**
1. Modify entities in `apps/odonto-api/src/modules/*/entities/*.entity.ts`
2. Locally, the app uses `synchronize: true` (in dev only) to auto-sync schema
3. When ready to commit:
   - Run `npm run build` in odonto-api
   - Run `npm run migration:generate -- DescriptiveName` to generate a migration file from the current schema diff
   - Review the generated migration in `apps/odonto-api/src/migrations/`
   - Commit both the entity and migration files

**For Deployment (Fly.io):**
- `fly.toml` defines the release command: `node dist/src/run-migrations.js`, which runs before the new version goes live
- This connects to the Fly.io database and applies all pending migrations
- Migrations are tracked in the `typeorm_migrations` table to prevent re-running

### Migration Commands

```bash
# In apps/odonto-api/

npm run migration:generate -- MigrationName    # Generate migration from schema diff (requires dev DB connection)
npm run migration:run                          # Run all pending migrations
npm run migration:revert                       # Revert the last migration (use sparingly)
npm run migrate                                # Build + run migrations (used in production builds)
```

### Key Points

- **Migrations are versioned**: Each migration is timestamped (e.g., `1710000000000-InitialSchema.ts`)
- **No manual SQL needed**: Use TypeORM's `QueryRunner` API in migrations for DB-agnostic code
- **Production-safe**: Migrations only run once, tracked in `typeorm_migrations` table
- **Reversible**: Each migration has an `up()` and `down()` method for rolling back if needed
- **Development convenience**: Keep `synchronize: true` in dev so you can quickly iterate without generating migrations for every small change

### File Locations

- **Migrations**: `apps/odonto-api/src/migrations/`
- **TypeORM Config**: `apps/odonto-api/src/typeorm.config.ts`
- **App Module**: `apps/odonto-api/src/app.module.ts`
- **Migration Runner**: `apps/odonto-api/src/run-migrations.ts`

## Deployment

- **Frontend**: Vercel (auto-deploy from `main`)
- **API**: Fly.io — region `gru` (São Paulo), deploy via `flyctl deploy`
- **Database**: Fly.io Postgres
- **Storage**: Cloudflare R2 (documents/images)
- **Email**: Resend
- **Payments**: Stripe (webhook at `/subscription/webhook`)
- **Analytics**: PostHog

CI pipeline (`.github/workflows/deploy.yml`): lint → type-check → build API → build frontend → deploy to Fly.io.

### Fly.io Deploy Notes
- Config: `fly.toml` at repo root
- Migrations run automatically via `release_command` before each deploy
- `auto_stop_machines = "stop"` and `min_machines_running = 0` — machine sleeps when idle to stay in free tier (cold start ~1-3s)

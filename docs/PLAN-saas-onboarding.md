# PLAN-saas-onboarding.md

> [!NOTE]
> This plan outlines the implementation of a new SaaS onboarding flow for clinics. It includes backend changes to support clinic registration and frontend changes for a fluid user experience.

## Goal Description
Allow new clinics to sign up directly from the login screen. The flow will collect necessary information for the first administrator and the clinic itself, creating both entities and logging the user in automatically. This transforms the application into a true multi-tenant SaaS.

## User Review Required
> [!IMPORTANT]
> Please review the following assumptions and decisions:
> 1. **Data Collection**: We trigger registration with minimal fields first:
>    - **User**: Name, Email, Password.
>    - **Clinic**: Name, Phone (optional but recommended), Address (optional).
> 2. **Authentication**: After successful registration, the user is automatically logged in. Email verification is skipped for MVP but recommended later.
> 3. **Role**: The first user created is assigned the `ADMIN` role for that clinic.

## Proposed Changes

### Backend (NestJS)

#### [MODIFY] `apps/odonto-api/src/modules/auth/auth.controller.ts`
- Add `@Post('register-tenant')` endpoint.
- Accepts `RegisterTenantDto`.

#### [NEW] `apps/odonto-api/src/modules/auth/dto/register-tenant.dto.ts`
- Combine user and clinic validation rules.
- Fields: `userName`, `email`, `password`, `clinicName`, `clinicPhone`, `clinicAddress`.

#### [MODIFY] `apps/odonto-api/src/modules/auth/auth.service.ts`
- Implement `registerTenant` method.
- Use a transaction to ensure atomic creation of `Clinic` and `User`.
- Return JWT token upon success (auto-login).

### Frontend (Next.js)

#### [MODIFY] `apps/odonto-front/src/app/(auth)/login/page.tsx`
- Add "Criar nova conta" (Create new account) link/button pointing to `/register`.

#### [NEW] `apps/odonto-front/src/app/(auth)/register/page.tsx`
- Create the main registration page.
- Implement a multi-step form (Wizard):
    - **Step 1: Admin Info** (Name, Email, Password - with confirmation).
    - **Step 2: Clinic Info** (Name, Phone).
    - **Step 3: Review & Submit**.
- Use `shadcn/ui` components for a premium feel.
- Handle API errors (e.g., email already exists).

#### [NEW] `apps/odonto-front/src/services/auth/register-tenant.ts`
- Service function to call the backend endpoint.

## Verification Plan

### Automated Tests
- Run backend unit tests for `AuthService.registerTenant`.
- `npm run test apps/odonto-api`

### Manual Verification
1. Navigate to `/login`.
2. Click "Criar nova conta".
3. Comparison: Verify the UI matches the premium/fluid design goal.
4. Complete the form with valid data.
5. Verify redirection to Dashboard.
6. Verify data in database (Clinic and User created, linked correctly).
7. Logout and login with new credentials.

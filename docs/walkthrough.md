# Walkthrough - SaaS Onboarding Flow

## Overview
We have implemented a complete SaaS onboarding flow that allows new clinics to register directly from the login screen. This includes a new backend endpoint for creating tenants (Clinic + Admin User) and a frontend multi-step wizard for a smooth user experience.

## Changes

### Backend
- **New DTOs**: `RegisterTenantDto`, `CreateClinicDto`.
- **AuthService**: Added `registerTenant` method to transactionally create a `Clinic` and an `Admin User`.
- **AuthController**: Added public `@Post('register-tenant')` endpoint.
- **ClinicsService**: Added `create` method.
- **AuthModule**: Consolidated imports/exports.

### Frontend
- **Login Page**: Added "Criar nova conta" link.
- **Register Page**: Created `src/app/register/page.tsx` with a multi-step form (Wizard).
    - **Step 1**: User Info (Name, Email, Password).
    - **Step 2**: Clinic Info (Name, Phone, Address).
- **Service**: Added `registerTenant` function in `src/services/auth.ts`.
- **Context**: Updated `AuthContext` usages to support immediate login with clinic name.

## Verification Results

### Automated Tests
- Backend compilation passed (`npm run build`).

### Manual Verification Steps
1. **Access Login**: Go to `/login`.
2. **Click Register**: Click "Criar nova conta".
3. **Fill Form**:
    - Enter Admin details.
    - Click "Próximo".
    - Enter Clinic details.
    - Click "Finalizar Cadastro".
4. **Success**: You should be automatically logged in and redirected to the Dashboard with the new clinic name displayed.

## Screenshots
> (Screenshots would be placed here in a real scenario)

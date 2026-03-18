# Architecture Documentation

## Overview
OdontoTec is a Multi-Tenant Dental Clinic Management System built with NestJS and PostgreSQL. It is designed to support multiple clinics (tenants) within a single database instance, ensuring data isolation and security.

## Core Concepts

### Multi-Tenancy
The application uses a **Shared Database, Shared Schema** strategy.
- Every major entity (`User`, `Patient`, `Procedure`, etc.) belongs to a `Clinic`.
- Data isolation is enforced at the Service layer (using `clinicId` in queries) and strictly reinforced by the `TenancyInterceptor`.

### Security Layers
1. **Authentication (JWT)**: Verifies user identity via `PassportStrategy`.
2. **Authorization (RBAC)**: `RolesGuard` restricts access based on user roles (`ADMIN`, `DENTIST`, `SIMPLE`).
3. **Safety Net (TenancyInterceptor)**: checks all outgoing API responses. If it detects data belonging to a different clinic than the authenticated user, it blocks the request.
4. **Rate Limiting**: `ThrottlerModule` limits requests to 10 per minute per IP to prevent abuse.

## Modules

### Patients Module
Manages patient data and clinical history.
- **Entities**: `Patient`, `Procedure`, `Anamnesis`, `Payment`.
- **Key Features**:
  - Full CRUD for clinical procedures.
  - Detailed anamnesis (medical history) tracking.
  - Financial records (payments).

### Users Module
Manages system users (Dentists, Receptionists, Admins).
- **Entities**: `User`.
- **Security**: Passwords are hashed with bcrypt.

### Auth Module
Handles login and token management.
- **Features**:
  - JWT Access Tokens (15 min expiry).
  - Refresh Tokens (7 days expiry, hashed in DB).

## Database Schema Relations
* `Clinic` (1) -> (N) `User`
* `Clinic` (1) -> (N) `Patient`
* `Patient` (1) -> (N) `Procedure`
* `Patient` (1) -> (N) `Anamnesis`
* `Patient` (1) -> (N) `Payment`

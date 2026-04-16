# Frontend Use Cases - Odonto Project

This document outlines the primary use cases for the `odonto-front` application.

## 1. Professional Management (Sprint 2 - Invitation Flow)

- **Goal**: Allow administrators to invite dental professionals securely.
- **Actions**:
  - **Step 1 (Admin)**: Registers **mandatory** info (Email, CPF, Role).
  - **Step 2 (System)**: Generates a temporary secure link and "sends" it to the professional.
  - **Step 3 (Professional)**: Accesses the link, fills in remaining data (Password, Name) and activates the account.
  - **Management**: Admin can Revoke/Resend pending invitations.
- **SDD Hook**: `usePostUsersInvite`, `useGetUsersInvitations`, `usePostAuthRegister`.

## 2. Appointment Scheduling

- **Goal**: Manage dental appointments for patients.
- **Actions**:
  - View appointment calendar.
  - Schedule a new appointment.
  - Reschedule or cancel appointments.

## 3. Patient Records (Sprint 2 - Part 1)

- **Goal**: Maintain and view patient history.
- **Actions**:
  - Search for patients by name or phone.
  - Register new patients with full contact details.
  - View patient profile and basic history.
- **SDD Hook**: `useGetPatients`, `usePostPatients`.

## 4. API Integration (SDD)

- **Goal**: Ensure all UI interactions are synchronized with the `odonto-api` specification.
- **Method**: Use Kubb-generated hooks to interact with backend endpoints.

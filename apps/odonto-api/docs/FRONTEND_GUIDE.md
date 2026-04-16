# Frontend Implementation Guide

This document outlines the technical specifications and integration patterns for building the frontend application for the OdontoTec API.

## 1. Authentication & Security

### Login Flow

1.  **POST** `/auth/login` with `{ email, password }`.
2.  Store `access_token` (short-lived, 15m) and `refresh_token` (long-lived, 7d).
3.  **Important**: The `access_token` contains the `clinicId` and `role`. decode the JWT on the client to customize the UI (e.g., hide "Admin" tabs).

### Request Headers

All protected requests MUST include:
\`\`\`http
Authorization: Bearer <access_token>
\`\`\`

### Token Refresh

When a request fails with `401 Unauthorized`:

1.  Call `/auth/refresh` sending the `refresh_token` in the Authorization header: `Bearer <refresh_token>`.
2.  If successful, update the `access_token` and retry the original request.
3.  If this fails (e.g. refresh token expired), redirect the user to Login.

## 2. Global Error Handling

The frontend must gracefully handle specific HTTP status codes:

| Code    | Meaning           | Action                                                                                                  |
| ------- | ----------------- | ------------------------------------------------------------------------------------------------------- |
| **401** | Unauthorized      | User session expired. Attempt refresh or redirect to login.                                             |
| **403** | Forbidden         | **Security violation**. User tried to access data from another clinic. Show a generic permission error. |
| **429** | Too Many Requests | Rate limit exceeded. Wait 60s before retrying. **Do not spam retries.**                                 |
| **500** | Internal Error    | Server issue. Show a friendly "Try again later" toast.                                                  |

## 3. Data Modules & Features

### Patients Module

- **Base URL**: `/patients`
- **Features**:
  - **List**: `GET /patients` (Returns all patients for the user's clinic).
  - **Details**: `GET /patients/:id`.
  - **Create/Update**: `POST /patients`, `PATCH /patients/:id`.

#### Sub-Resources (Tabs in Patient Detail View)

All sub-resources are linked to a patient ID.

1.  **Procedures** (History of treatments)
    - **Fetch**: `GET /procedures/patient/:patientId`
    - **Create**: `POST /procedures` (Payload: `{ description, date, cost, patientId }`)

2.  **Anamnesis** (Medical History)
    - **Fetch**: `GET /anamnesis/patient/:patientId`
    - **Create**: `POST /anamnesis` (Payload: `{ complaint, history, medications, allergies, patientId }`)

3.  **Payments**
    - **Fetch**: `GET /payments/patient/:patientId`
    - **Create**: `POST /payments` (Payload: `{ amount, method: 'CASH' | 'PIX'..., status, date, patientId }`)

## 4. Multi-Tenancy (Important)

- **No Explicit Clinic ID**: You do **NOT** need to send `clinicId` in your payloads. The API infers it from the user's token.
- **Isolation**: The API guarantees that a user sees only their clinic's data. If you ever see a `403` on a valid resource, it means the ID requested belongs to another clinic (or the safety net was triggered).

## 5. Roles & Permissions (RBAC)

- **ADMIN**: Full access.
- **DENTIST**: Can manage Patients, Procedures, Anamnesis.
- **SIMPLE** (Receptionist): Can manage Patients and Payments. Limited access to clinical details (Procedures/Anamnesis may be read-only or hidden depending on final UI requirements).

## 6. Type Definitions (TypeScript)

Use the API DTOs structure for your frontend interfaces.

- **Dates**: All dates are returned as ISO 8601 strings (`YYYY-MM-DDTHH:mm:ss.sssZ`).
- **Money**: Monetary values are `number` (decimal).

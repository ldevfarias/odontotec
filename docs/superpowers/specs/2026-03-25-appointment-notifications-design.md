# Design: Appointment Notifications — Edit & Cancellation Coverage

**Date:** 2026-03-25
**Status:** Approved

---

## Context

The notification bell (sino) in OdontoTec already notifies the assigned dentist when a new appointment is created. However, several important scenarios were missing:

1. **Appointment edited via dashboard** — dentist is not notified when date/time, patient, or dentist assignment changes
2. **Appointment cancelled via dashboard** — dentist is not notified when an admin or receptionist cancels; only patient-initiated cancellation (via external link) was covered

---

## Goal

Notify the relevant dentist(s) whenever a significant change is made to an appointment:

| Event | Type | Trigger Condition | Recipient |
|---|---|---|---|
| Patient changed | `WARNING` | `before.patientId !== after.patientId` | `after.dentistId` |
| Date/time changed (rescheduled) | `WARNING` | `before.date !== after.date` | `after.dentistId` |
| Dentist reassigned — old dentist | `WARNING` | `before.dentistId !== after.dentistId` | `before.dentistId` |
| Dentist reassigned — new dentist | `INFO` | `before.dentistId !== after.dentistId` | `after.dentistId` |
| Appointment cancelled | `WARNING` | `before.status !== 'CANCELLED'` AND `after.status === 'CANCELLED'` | `after.dentistId` |

Appointment **creation** already works correctly and is unchanged.

---

## Notification Messages

All messages follow the existing Portuguese format and use `new Date(date).toLocaleString('pt-BR')` for date formatting (consistent with the existing patient-cancel notification in the service).

- **Patient changed:** `"O paciente do agendamento de [before.date] foi alterado para [after.patient.name]."`
  - Uses `before.date` (original appointment time the dentist already knows)
- **Rescheduled:** `"O agendamento com [after.patient.name] foi reagendado para [after.date]."`
  - Uses `after.date` (the new scheduled time)
- **Dentist reassigned (old):** `"O agendamento com [after.patient.name] em [after.date] foi transferido para outro profissional."`
- **Dentist reassigned (new):** `"Você recebeu um novo agendamento com [after.patient.name] em [after.date]."`
- **Cancelled:** `"O agendamento com [after.patient.name] em [after.date] foi cancelado."`

---

## Architecture

### Single file changed

**`apps/odonto-api/src/modules/appointments/appointments.service.ts`**

The `update()` method is extended minimally. All notification logic is delegated to private specialist methods:

```
update(id, dto, clinicId)
  ├── fetch appointment before save (before)
  ├── save changes → fetch updated appointment (after)
  ├── notifyAppointmentChanges(before, after, clinicId)
  └── return after

notifyAppointmentChanges(before, after, clinicId)     [private]
  ├── notifyIfPatientChanged(before, after, clinicId)
  ├── notifyIfRescheduled(before, after, clinicId)
  ├── notifyIfDentistChanged(before, after, clinicId)
  └── notifyIfCancelled(before, after, clinicId)

notifyIfPatientChanged(before, after, clinicId)       [private]
notifyIfRescheduled(before, after, clinicId)          [private]
notifyIfDentistChanged(before, after, clinicId)       [private]
notifyIfCancelled(before, after, clinicId)            [private]
```

Each `notifyIf*` method has a single responsibility: check if the relevant field changed, and if so, call `notificationsService.create()`.

**Relation loading requirement:** Both `before` and `after` must be fetched via the existing `findOne()` method (which eagerly loads `patient` and `dentist` relations), not via a plain repository lookup. Notification messages reference `before.patient.name` and `after.patient.name`, so relation data must be present on both snapshots.

**Compound changes:** If multiple fields change in a single `update()` call, each `notifyIf*` fires independently. There is no deduplication or message combining — this is intentional.

### The `remove()` endpoint

The `DELETE /appointments/:id` endpoint calls `remove()` which sets `status = CANCELLED` directly. This endpoint is **not connected to any current dashboard UI** — cancellation in the dashboard goes through `PATCH` with `status: CANCELLED` (i.e., through `update()`). The `remove()` method is therefore out of scope for this feature.

### No changes required in

- Frontend — notifications appear in the bell via existing React Query hooks
- `NotificationsService` — `create()` already supports all needed parameters
- Notification entity, controller, or module
- Kubb-generated types or hooks
- Database schema (no new fields)

---

## Existing Behavior Preserved

- Patient-initiated cancellation via external link has its own dedicated method and remains unchanged.
- Appointment creation notification remains unchanged.

---

## Clean Code Principles Applied

- `update()` stays high-level — reads intent, not implementation details
- Each `notifyIf*` has a single responsibility and is independently readable
- No inflation of the `update()` method body
- Consistent with existing notification patterns in the service

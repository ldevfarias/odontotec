# Design: Appointment Notifications — Edit & Cancellation Coverage

**Date:** 2026-03-25
**Status:** Approved

---

## Context

The notification bell (sino) in OdontoTec already notifies the assigned dentist when a new appointment is created. However, two important scenarios were missing:

1. **Appointment edited via dashboard** — dentist is not notified when date/time or patient changes
2. **Appointment cancelled via dashboard** — dentist is not notified when an admin or receptionist cancels; only patient-initiated cancellation (via external link) was covered

---

## Goal

Notify the assigned dentist whenever a relevant change is made to one of their appointments:

| Event | Notification Type | Trigger Condition |
|---|---|---|
| Patient changed | `WARNING` | `before.patientId !== after.patientId` |
| Date/time changed (rescheduled) | `WARNING` | `before.date !== after.date` OR `before.time !== after.time` |
| Appointment cancelled | `WARNING` | `before.status !== 'CANCELLED'` AND `after.status === 'CANCELLED'` |

Appointment **creation** already works correctly and is unchanged.

---

## Notification Messages

All messages follow the existing Portuguese format used in the codebase:

- **Patient changed:** `"O paciente do agendamento de [DateTime] foi alterado para [NovoNome]."`
- **Rescheduled:** `"O agendamento com [NomePaciente] foi reagendado para [NovaDataHora]."`
- **Cancelled:** `"O agendamento com [NomePaciente] em [DateTime] foi cancelado."`

Recipient: `dentistId` of the appointment (same pattern as creation).

---

## Architecture

### Single file changed

**`apps/odonto-api/src/modules/appointments/appointments.service.ts`**

The `update()` method is extended minimally. All notification logic is delegated to private specialist methods:

```
update(id, dto, clinicId)
  ├── fetch appointment before save (before)
  ├── save changes
  ├── notifyAppointmentChanges(before, saved, clinicId)
  └── return updated appointment

notifyAppointmentChanges(before, after, clinicId)   [private]
  ├── notifyIfPatientChanged(before, after, clinicId)
  ├── notifyIfRescheduled(before, after, clinicId)
  └── notifyIfCancelled(before, after, clinicId)

notifyIfPatientChanged(before, after, clinicId)     [private]
notifyIfRescheduled(before, after, clinicId)        [private]
notifyIfCancelled(before, after, clinicId)          [private]
```

Each `notifyIf*` method has a single responsibility: check if the relevant field changed, and if so, call `notificationsService.create()`.

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
- Each `notifyIf*` is independently readable and testable
- No inflation of the `update()` method body
- Consistent with existing notification patterns in the service

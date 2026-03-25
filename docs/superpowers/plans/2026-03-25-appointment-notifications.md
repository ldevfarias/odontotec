# Appointment Notifications — Edit & Cancellation Coverage

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Notify the assigned dentist when an appointment is updated (patient changed, rescheduled, dentist reassigned, or cancelled via dashboard).

**Architecture:** Extend `AppointmentsService.update()` to capture a `before` snapshot, then after saving call a private coordinator `notifyAppointmentChanges()` which delegates to four focused private methods — one per notification trigger. All changes are in a single file.

**Tech Stack:** NestJS, TypeORM, Jest (`@nestjs/testing`), existing `NotificationsService.create()`.

---

## File Map

| Action | Path |
|---|---|
| Modify | `apps/odonto-api/src/modules/appointments/appointments.service.ts` |
| Create | `apps/odonto-api/src/modules/appointments/appointments.service.notifications.spec.ts` |

---

## Task 1: Test setup + notifyIfPatientChanged

**Files:**
- Create: `apps/odonto-api/src/modules/appointments/appointments.service.notifications.spec.ts`
- Modify: `apps/odonto-api/src/modules/appointments/appointments.service.ts`

- [ ] **Step 1.1: Create the test file with full module setup**

```typescript
// apps/odonto-api/src/modules/appointments/appointments.service.notifications.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppointmentsService } from './appointments.service';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { Patient } from '../patients/entities/patient.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import { JwtService } from '@nestjs/jwt';
import { Clinic } from '../clinics/entities/clinic.entity';

const CLINIC_ID = 1;

function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
    return {
        id: 10,
        clinicId: CLINIC_ID,
        dentistId: 5,
        patientId: 20,
        date: new Date('2026-04-01T10:00:00.000Z'),
        duration: 30,
        status: AppointmentStatus.SCHEDULED,
        cancelledBy: null as unknown as 'PATIENT' | 'CLINIC',
        cancellationReason: null,
        patient: { id: 20, name: 'Maria Silva' } as Patient,
        dentist: { id: 5, name: 'Dr. João' } as any,
        clinic: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    };
}

describe('AppointmentsService — update notifications', () => {
    let service: AppointmentsService;
    let notifyCreate: jest.Mock;
    let findOneSpy: jest.SpyInstance;

    // createQueryBuilder mock returns no conflicts (getOne resolves null).
    // This prevents conflict-check logic from interfering with notification tests.
    const mockRepo = {
        findOne: jest.fn(),
        update: jest.fn().mockResolvedValue(undefined),
        save: jest.fn(),
        create: jest.fn(),
        manager: { getRepository: jest.fn().mockReturnValue({ findOne: jest.fn() }) },
        createQueryBuilder: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(null),
        }),
    };

    beforeEach(async () => {
        notifyCreate = jest.fn().mockResolvedValue({});

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AppointmentsService,
                { provide: getRepositoryToken(Appointment), useValue: mockRepo },
                { provide: getRepositoryToken(Patient), useValue: { findOne: jest.fn() } },
                { provide: getRepositoryToken(Clinic), useValue: { findOne: jest.fn() } },
                { provide: NotificationsService, useValue: { create: notifyCreate } },
                { provide: EmailService, useValue: { sendAppointmentConfirmation: jest.fn() } },
                { provide: JwtService, useValue: { sign: jest.fn(), verify: jest.fn() } },
            ],
        }).compile();

        service = module.get(AppointmentsService);
        findOneSpy = jest.spyOn(service, 'findOne');
    });

    afterEach(() => jest.clearAllMocks());

    // ── notifyIfPatientChanged ─────────────────────────────────────────────

    it('notifies dentist when patient changes', async () => {
        const before = makeAppointment({ patientId: 20, patient: { id: 20, name: 'Maria Silva' } as Patient });
        const after = makeAppointment({ patientId: 99, patient: { id: 99, name: 'Carlos Perez' } as Patient });

        findOneSpy
            .mockResolvedValueOnce(before)
            .mockResolvedValueOnce(after);

        await service.update(10, { patientId: 99 }, CLINIC_ID);

        expect(notifyCreate).toHaveBeenCalledTimes(1);
        expect(notifyCreate).toHaveBeenCalledWith(
            expect.stringContaining('Carlos Perez'),
            CLINIC_ID,
            'WARNING',
            after.dentistId,
        );
    });

    it('does NOT notify when patient is unchanged', async () => {
        const appointment = makeAppointment();
        findOneSpy.mockResolvedValue(appointment);

        await service.update(10, { duration: 60 }, CLINIC_ID);

        expect(notifyCreate).not.toHaveBeenCalled();
    });
});
```

- [ ] **Step 1.2: Run the tests and confirm they FAIL**

```bash
cd apps/odonto-api && npx jest appointments.service.notifications --no-coverage
```

Expected: FAIL — `notifyAppointmentChanges is not a function` or `Expected 1 call, received 0`. Both tests fail.

- [ ] **Step 1.3: Wire `update()` and add the coordinator + notifyIfPatientChanged**

In `apps/odonto-api/src/modules/appointments/appointments.service.ts`, replace the `update()` method and add private methods after `checkConflict`:

```typescript
async update(id: number, updateAppointmentDto: UpdateAppointmentDto, clinicId: number): Promise<Appointment> {
    const before = await this.findOne(id, clinicId);

    if (updateAppointmentDto.date || updateAppointmentDto.duration || updateAppointmentDto.dentistId) {
        const date = updateAppointmentDto.date ? new Date(updateAppointmentDto.date) : before.date;
        const duration = updateAppointmentDto.duration ?? before.duration;
        const dentistId = updateAppointmentDto.dentistId ?? before.dentistId;
        const patientId = updateAppointmentDto.patientId ?? before.patientId;

        await this.checkConflict(date, duration, clinicId, dentistId, patientId, id);
    }

    await this.appointmentsRepository.update({ id, clinicId }, updateAppointmentDto);
    const after = await this.findOne(id, clinicId);

    await this.notifyAppointmentChanges(before, after, clinicId);
    return after;
}

private async notifyAppointmentChanges(before: Appointment, after: Appointment, clinicId: number): Promise<void> {
    await this.notifyIfPatientChanged(before, after, clinicId);
    await this.notifyIfRescheduled(before, after, clinicId);
    await this.notifyIfDentistChanged(before, after, clinicId);
    await this.notifyIfCancelled(before, after, clinicId);
}

private async notifyIfPatientChanged(before: Appointment, after: Appointment, clinicId: number): Promise<void> {
    if (before.patientId === after.patientId) return;
    const originalDate = new Date(before.date).toLocaleString('pt-BR');
    await this.notificationsService.create(
        `O paciente do agendamento de ${originalDate} foi alterado para ${after.patient.name}.`,
        clinicId,
        'WARNING',
        after.dentistId,
    );
}

private async notifyIfRescheduled(before: Appointment, after: Appointment, clinicId: number): Promise<void> {
    // placeholder — implemented in Task 2
}

private async notifyIfDentistChanged(before: Appointment, after: Appointment, clinicId: number): Promise<void> {
    // placeholder — implemented in Task 3
}

private async notifyIfCancelled(before: Appointment, after: Appointment, clinicId: number): Promise<void> {
    // placeholder — implemented in Task 4
}
```

- [ ] **Step 1.4: Run the tests and confirm they PASS**

```bash
cd apps/odonto-api && npx jest appointments.service.notifications --no-coverage
```

Expected: PASS — 2 tests green.

- [ ] **Step 1.5: Commit**

```bash
git add apps/odonto-api/src/modules/appointments/appointments.service.ts \
        apps/odonto-api/src/modules/appointments/appointments.service.notifications.spec.ts
git commit -m "feat: wire update() notifications and add notifyIfPatientChanged"
```

---

## Task 2: notifyIfRescheduled

**Files:**
- Modify: `apps/odonto-api/src/modules/appointments/appointments.service.notifications.spec.ts`
- Modify: `apps/odonto-api/src/modules/appointments/appointments.service.ts`

- [ ] **Step 2.1: Add tests for rescheduled**

Append inside the `describe` block in the spec file, after the existing patient tests:

```typescript
// ── notifyIfRescheduled ────────────────────────────────────────────────────

it('notifies dentist when date changes', async () => {
    const before = makeAppointment({ date: new Date('2026-04-01T10:00:00.000Z') });
    const after = makeAppointment({ date: new Date('2026-04-02T14:00:00.000Z') });

    findOneSpy
        .mockResolvedValueOnce(before)
        .mockResolvedValueOnce(after);

    await service.update(10, { date: '2026-04-02T14:00:00.000Z' }, CLINIC_ID);

    expect(notifyCreate).toHaveBeenCalledTimes(1);
    expect(notifyCreate).toHaveBeenCalledWith(
        expect.stringContaining('reagendado'),
        CLINIC_ID,
        'WARNING',
        after.dentistId,
    );
});

it('does NOT notify when date is unchanged', async () => {
    const appointment = makeAppointment();
    findOneSpy.mockResolvedValue(appointment);

    await service.update(10, { duration: 45 }, CLINIC_ID);

    expect(notifyCreate).not.toHaveBeenCalled();
});
```

- [ ] **Step 2.2: Run to confirm the positive test FAILs**

```bash
cd apps/odonto-api && npx jest appointments.service.notifications --no-coverage
```

Expected: 1 new failure (`notifies dentist when date changes`). The negative test passes immediately because the placeholder does nothing. Total: 3 pass, 1 fail.

- [ ] **Step 2.3: Implement notifyIfRescheduled**

Replace the placeholder in `appointments.service.ts`:

```typescript
private async notifyIfRescheduled(before: Appointment, after: Appointment, clinicId: number): Promise<void> {
    if (new Date(before.date).toISOString() === new Date(after.date).toISOString()) return;
    const newDate = new Date(after.date).toLocaleString('pt-BR');
    await this.notificationsService.create(
        `O agendamento com ${after.patient.name} foi reagendado para ${newDate}.`,
        clinicId,
        'WARNING',
        after.dentistId,
    );
}
```

- [ ] **Step 2.4: Run to confirm all 4 tests PASS**

```bash
cd apps/odonto-api && npx jest appointments.service.notifications --no-coverage
```

Expected: PASS — 4 tests green.

- [ ] **Step 2.5: Commit**

```bash
git add apps/odonto-api/src/modules/appointments/appointments.service.ts \
        apps/odonto-api/src/modules/appointments/appointments.service.notifications.spec.ts
git commit -m "feat: add notifyIfRescheduled for appointment date changes"
```

---

## Task 3: notifyIfDentistChanged

**Files:**
- Modify: `apps/odonto-api/src/modules/appointments/appointments.service.notifications.spec.ts`
- Modify: `apps/odonto-api/src/modules/appointments/appointments.service.ts`

- [ ] **Step 3.1: Add tests for dentist reassignment**

Append inside the `describe` block:

```typescript
// ── notifyIfDentistChanged ─────────────────────────────────────────────────

it('notifies both old and new dentist when dentist changes', async () => {
    const before = makeAppointment({ dentistId: 5 });
    const after = makeAppointment({ dentistId: 7 });

    findOneSpy
        .mockResolvedValueOnce(before)
        .mockResolvedValueOnce(after);

    await service.update(10, { dentistId: 7 }, CLINIC_ID);

    expect(notifyCreate).toHaveBeenCalledTimes(2);

    expect(notifyCreate).toHaveBeenCalledWith(
        expect.stringContaining('transferido'),
        CLINIC_ID,
        'WARNING',
        5, // before.dentistId — old dentist
    );
    expect(notifyCreate).toHaveBeenCalledWith(
        expect.stringContaining('novo agendamento'),
        CLINIC_ID,
        'INFO',
        7, // after.dentistId — new dentist
    );
});

it('does NOT notify when dentist is unchanged', async () => {
    // Use same dentistId in DTO to specifically verify the guard condition.
    const appointment = makeAppointment({ dentistId: 5 });
    findOneSpy.mockResolvedValue(appointment);

    await service.update(10, { dentistId: 5 }, CLINIC_ID);

    expect(notifyCreate).not.toHaveBeenCalled();
});
```

- [ ] **Step 3.2: Run to confirm the positive test FAILs**

```bash
cd apps/odonto-api && npx jest appointments.service.notifications --no-coverage
```

Expected: 1 new failure (`notifies both old and new dentist when dentist changes`). The negative test passes immediately. Total: 5 pass, 1 fail.

- [ ] **Step 3.3: Implement notifyIfDentistChanged**

Replace the placeholder in `appointments.service.ts`:

```typescript
private async notifyIfDentistChanged(before: Appointment, after: Appointment, clinicId: number): Promise<void> {
    if (before.dentistId === after.dentistId) return;
    const dateStr = new Date(after.date).toLocaleString('pt-BR');
    await Promise.all([
        this.notificationsService.create(
            `O agendamento com ${after.patient.name} em ${dateStr} foi transferido para outro profissional.`,
            clinicId,
            'WARNING',
            before.dentistId,
        ),
        this.notificationsService.create(
            `Você recebeu um novo agendamento com ${after.patient.name} em ${dateStr}.`,
            clinicId,
            'INFO',
            after.dentistId,
        ),
    ]);
}
```

- [ ] **Step 3.4: Run to confirm all 6 tests PASS**

```bash
cd apps/odonto-api && npx jest appointments.service.notifications --no-coverage
```

Expected: PASS — 6 tests green.

- [ ] **Step 3.5: Commit**

```bash
git add apps/odonto-api/src/modules/appointments/appointments.service.ts \
        apps/odonto-api/src/modules/appointments/appointments.service.notifications.spec.ts
git commit -m "feat: add notifyIfDentistChanged for dentist reassignment"
```

---

## Task 4: notifyIfCancelled

**Files:**
- Modify: `apps/odonto-api/src/modules/appointments/appointments.service.notifications.spec.ts`
- Modify: `apps/odonto-api/src/modules/appointments/appointments.service.ts`

- [ ] **Step 4.1: Add tests for cancellation**

Append inside the `describe` block:

```typescript
// ── notifyIfCancelled ──────────────────────────────────────────────────────

it('notifies dentist when appointment is cancelled via dashboard', async () => {
    const before = makeAppointment({ status: AppointmentStatus.SCHEDULED });
    const after = makeAppointment({ status: AppointmentStatus.CANCELLED });

    findOneSpy
        .mockResolvedValueOnce(before)
        .mockResolvedValueOnce(after);

    await service.update(10, { status: AppointmentStatus.CANCELLED }, CLINIC_ID);

    expect(notifyCreate).toHaveBeenCalledTimes(1);
    expect(notifyCreate).toHaveBeenCalledWith(
        expect.stringContaining('cancelado'),
        CLINIC_ID,
        'WARNING',
        after.dentistId,
    );
});

it('does NOT notify when appointment was already cancelled', async () => {
    const alreadyCancelled = makeAppointment({ status: AppointmentStatus.CANCELLED });
    findOneSpy.mockResolvedValue(alreadyCancelled);

    await service.update(10, { status: AppointmentStatus.CANCELLED }, CLINIC_ID);

    expect(notifyCreate).not.toHaveBeenCalled();
});

it('does NOT notify when status changes to non-cancelled (e.g. CONFIRMED)', async () => {
    const before = makeAppointment({ status: AppointmentStatus.SCHEDULED });
    const after = makeAppointment({ status: AppointmentStatus.CONFIRMED });

    findOneSpy
        .mockResolvedValueOnce(before)
        .mockResolvedValueOnce(after);

    await service.update(10, { status: AppointmentStatus.CONFIRMED }, CLINIC_ID);

    expect(notifyCreate).not.toHaveBeenCalled();
});
```

- [ ] **Step 4.2: Run to confirm the positive test FAILs**

```bash
cd apps/odonto-api && npx jest appointments.service.notifications --no-coverage
```

Expected: 1 new failure (`notifies dentist when appointment is cancelled via dashboard`). The two negative tests pass immediately with the placeholder. Total: 8 pass, 1 fail.

- [ ] **Step 4.3: Implement notifyIfCancelled**

Replace the placeholder in `appointments.service.ts`:

```typescript
private async notifyIfCancelled(before: Appointment, after: Appointment, clinicId: number): Promise<void> {
    if (before.status === AppointmentStatus.CANCELLED || after.status !== AppointmentStatus.CANCELLED) return;
    const dateStr = new Date(after.date).toLocaleString('pt-BR');
    await this.notificationsService.create(
        `O agendamento com ${after.patient.name} em ${dateStr} foi cancelado.`,
        clinicId,
        'WARNING',
        after.dentistId,
    );
}
```

- [ ] **Step 4.4: Run the notification test suite to confirm all 9 tests PASS**

```bash
cd apps/odonto-api && npx jest appointments.service.notifications --no-coverage
```

Expected: PASS — 9 tests green.

- [ ] **Step 4.5: Run the full API test suite to confirm no regressions**

```bash
cd apps/odonto-api && npx jest --no-coverage
```

Expected: all tests pass.

- [ ] **Step 4.6: Commit**

```bash
git add apps/odonto-api/src/modules/appointments/appointments.service.ts \
        apps/odonto-api/src/modules/appointments/appointments.service.notifications.spec.ts
git commit -m "feat: add notifyIfCancelled for dashboard-initiated cancellations"
```

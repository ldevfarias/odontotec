// apps/odonto-api/src/modules/appointments/appointments.service.notifications.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
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
    let findOneSpy: jest.SpyInstance<any, any[]>;

    // createQueryBuilder mock returns no conflicts (getOne resolves null).
    // This prevents conflict-check logic from interfering with notification tests.
    const mockRepo = {
        findOne: jest.fn(),
        update: jest.fn().mockResolvedValue(undefined),
        save: jest.fn(),
        create: jest.fn(),
        manager: { getRepository: jest.fn().mockReturnValue({ findOne: jest.fn() }) },
        createQueryBuilder: jest.fn().mockImplementation(() => {
            let isLockQuery = false;
            const qb: any = {
                where: jest.fn().mockImplementation((query) => {
                    if (query.includes('appointment.id = :id')) {
                        isLockQuery = true;
                    }
                    return qb;
                }),
                andWhere: jest.fn().mockReturnThis(),
                setLock: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockImplementation(() => {
                    if (isLockQuery) {
                        return Promise.resolve(makeAppointment({ id: 10 }));
                    }
                    return Promise.resolve(null);
                }),
            };
            return qb;
        }),
    };

    const mockDataSource = {
        transaction: jest.fn(async (cb) => {
            const manager = {
                getRepository: jest.fn().mockReturnValue({
                    ...mockRepo,
                    findOne: jest.fn().mockImplementation((...args) => (findOneSpy as jest.Mock)(...args)),
                }),
                update: jest.fn().mockResolvedValue(undefined),
                findOne: jest.fn().mockImplementation((...args) => (findOneSpy as jest.Mock)(...args)),
            };
            return cb(manager);
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
                { provide: DataSource, useValue: mockDataSource },
            ],
        }).compile();

        service = module.get(AppointmentsService);
        // We MUST also mock the findOne inside the manager
        const mockManagerRepo = (mockDataSource.transaction.mock.calls[0] as any); 
        // Wait, transaction is called during the test, not here.
        
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
});

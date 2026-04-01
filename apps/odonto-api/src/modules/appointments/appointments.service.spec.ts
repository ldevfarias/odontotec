// apps/odonto-api/src/modules/appointments/appointments.service.spec.ts
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppointmentsService } from './appointments.service';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Clinic } from '../clinics/entities/clinic.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';
import { JwtService } from '@nestjs/jwt';

const CLINIC_ID = 1;
const DENTIST_ID = 5;
const PATIENT_ID = 20;
const APPT_ID = 10;

function makeAppointment(overrides: Partial<Appointment> = {}): Appointment {
    return {
        id: APPT_ID,
        clinicId: CLINIC_ID,
        dentistId: DENTIST_ID,
        patientId: PATIENT_ID,
        date: new Date('2026-04-01T10:00:00.000Z'),
        duration: 30,
        status: AppointmentStatus.SCHEDULED,
        cancelledBy: null as unknown as 'PATIENT' | 'CLINIC',
        cancellationReason: null,
        patient: { id: PATIENT_ID, name: 'Maria Silva' } as Patient,
        dentist: { id: DENTIST_ID, name: 'Dr. João' } as any,
        clinic: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    };
}

/**
 * Build a chainable QueryBuilder mock whose `getOne()` returns the supplied value.
 * Every chained method returns the same object so that `.where().andWhere()...getOne()`
 * works without errors.
 */
function makeQueryBuilder(getOneResult: Appointment | null) {
    const qb: Record<string, jest.Mock> = {};
    const methods = ['where', 'andWhere', 'orWhere', 'leftJoinAndSelect', 'orderBy', 'getMany'];
    for (const m of methods) {
        qb[m] = jest.fn().mockReturnThis();
    }
    qb.getOne = jest.fn().mockResolvedValue(getOneResult);
    qb.getManyAndCount = jest.fn().mockResolvedValue([[getOneResult].filter(Boolean), getOneResult ? 1 : 0]);
    return qb;
}

describe('AppointmentsService — conflict checking', () => {
    let service: AppointmentsService;

    // We rebuild these per test so each test can configure its own getOne result.
    let mockAppointmentsRepo: Record<string, jest.Mock>;
    let mockPatientRepo: Record<string, jest.Mock>;
    let mockClinicRepo: Record<string, jest.Mock>;
    let mockNotificationsService: { create: jest.Mock };
    let mockEmailService: { sendAppointmentConfirmation: jest.Mock };
    let mockJwtService: { sign: jest.Mock; verify: jest.Mock };

    async function buildModule(getOneResult: Appointment | null) {
        const qb = makeQueryBuilder(getOneResult);

        mockAppointmentsRepo = {
            create: jest.fn().mockReturnValue(makeAppointment()),
            save: jest.fn().mockResolvedValue(makeAppointment()),
            update: jest.fn().mockResolvedValue(undefined),
            findOne: jest.fn().mockResolvedValue(makeAppointment()),
            manager: {
                getRepository: jest.fn().mockReturnValue({
                    findOne: jest.fn().mockResolvedValue(null),
                }),
            },
            createQueryBuilder: jest.fn().mockReturnValue(qb),
        };

        mockPatientRepo = {
            // Return patient WITHOUT email to skip email sending side-effect
            findOne: jest.fn().mockResolvedValue({ id: PATIENT_ID, name: 'Maria Silva', email: null }),
        };

        mockClinicRepo = {
            findOne: jest.fn().mockResolvedValue({ id: CLINIC_ID, name: 'OdontoTec' }),
        };

        mockNotificationsService = { create: jest.fn().mockResolvedValue({}) };
        mockEmailService = { sendAppointmentConfirmation: jest.fn() };
        mockJwtService = { sign: jest.fn().mockReturnValue('dummy-token'), verify: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AppointmentsService,
                { provide: getRepositoryToken(Appointment), useValue: mockAppointmentsRepo },
                { provide: getRepositoryToken(Patient), useValue: mockPatientRepo },
                { provide: getRepositoryToken(Clinic), useValue: mockClinicRepo },
                { provide: NotificationsService, useValue: mockNotificationsService },
                { provide: EmailService, useValue: mockEmailService },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        service = module.get(AppointmentsService);
    }

    afterEach(() => jest.clearAllMocks());

    // ── create ─────────────────────────────────────────────────────────────────

    describe('create', () => {
        it('saves and returns appointment when no conflict exists', async () => {
            await buildModule(null); // getOne returns null → no conflict

            const dto = {
                date: '2026-04-01T10:00:00.000Z',
                duration: 30,
                dentistId: DENTIST_ID,
                patientId: PATIENT_ID,
            };

            const saved = makeAppointment();
            mockAppointmentsRepo.save.mockResolvedValue(saved);

            const result = await service.create(dto, CLINIC_ID);

            expect(mockAppointmentsRepo.createQueryBuilder).toHaveBeenCalled();
            expect(mockAppointmentsRepo.save).toHaveBeenCalledTimes(1);
            expect(result).toEqual(saved);
        });

        it('throws BadRequestException with dentist message when dentist has a conflict', async () => {
            // Conflict appointment has the same dentistId as requested → dentist conflict
            const conflict = makeAppointment({ dentistId: DENTIST_ID, patientId: 99 });
            await buildModule(conflict);

            const dto = {
                date: '2026-04-01T10:00:00.000Z',
                duration: 30,
                dentistId: DENTIST_ID,
                patientId: PATIENT_ID,
            };

            await expect(service.create(dto, CLINIC_ID)).rejects.toThrow(
                new BadRequestException('Dentist has a conflicting appointment at this time'),
            );

            // Appointment must NOT be persisted
            expect(mockAppointmentsRepo.save).not.toHaveBeenCalled();
        });

        it('throws BadRequestException with patient message when patient has a conflict', async () => {
            // Conflict appointment has a DIFFERENT dentistId → patient conflict branch
            const conflict = makeAppointment({ dentistId: 999, patientId: PATIENT_ID });
            await buildModule(conflict);

            const dto = {
                date: '2026-04-01T10:00:00.000Z',
                duration: 30,
                dentistId: DENTIST_ID,
                patientId: PATIENT_ID,
            };

            await expect(service.create(dto, CLINIC_ID)).rejects.toThrow(
                new BadRequestException('Patient has a conflicting appointment at this time'),
            );

            expect(mockAppointmentsRepo.save).not.toHaveBeenCalled();
        });

        it('conflict detected via Brackets (dentist OR patient match)', async () => {
            // Both dentistId and patientId provided → checkConflict uses new Brackets(...) with orWhere.
            // The conflict fixture has the same dentistId as the request, so the dentist branch fires.
            const conflict = makeAppointment({ dentistId: DENTIST_ID, patientId: 99 });
            await buildModule(conflict);

            const dto = {
                date: '2026-04-01T10:00:00.000Z',
                duration: 30,
                dentistId: DENTIST_ID,
                patientId: PATIENT_ID,
            };

            await expect(service.create(dto, CLINIC_ID)).rejects.toThrow(
                'Dentist has a conflicting appointment at this time',
            );

            expect(mockAppointmentsRepo.save).not.toHaveBeenCalled();
        });

        it('notifies dentist after saving appointment (happy path)', async () => {
            await buildModule(null); // no conflict

            const dto = {
                date: '2026-04-01T10:00:00.000Z',
                duration: 30,
                dentistId: DENTIST_ID,
                patientId: PATIENT_ID,
            };

            const saved = makeAppointment();
            mockAppointmentsRepo.save.mockResolvedValue(saved);

            await service.create(dto, CLINIC_ID);

            expect(mockNotificationsService.create).toHaveBeenCalledWith(
                expect.stringContaining('Novo agendamento'),
                CLINIC_ID,
                'INFO',
                DENTIST_ID,
            );
        });
    });

    // ── update ─────────────────────────────────────────────────────────────────

    describe('update', () => {
        it('calls checkConflict and updates appointment when no conflict on reschedule', async () => {
            await buildModule(null); // no conflict

            const before = makeAppointment();
            const after = makeAppointment({ date: new Date('2026-04-02T14:00:00.000Z') });

            // findOne is called twice: once for `before`, once for `after`
            mockAppointmentsRepo.findOne
                .mockResolvedValueOnce(before)
                .mockResolvedValueOnce(after);

            const result = await service.update(
                APPT_ID,
                { date: '2026-04-02T14:00:00.000Z' },
                CLINIC_ID,
            );

            // createQueryBuilder called for conflict check (date field changed)
            expect(mockAppointmentsRepo.createQueryBuilder).toHaveBeenCalled();
            expect(mockAppointmentsRepo.update).toHaveBeenCalledWith(
                { id: APPT_ID, clinicId: CLINIC_ID },
                expect.objectContaining({ date: '2026-04-02T14:00:00.000Z' }),
            );
            expect(result).toEqual(after);
        });

        it('throws BadRequestException when rescheduled date causes a conflict', async () => {
            const conflict = makeAppointment({ dentistId: DENTIST_ID });
            await buildModule(conflict);

            const before = makeAppointment();
            mockAppointmentsRepo.findOne.mockResolvedValue(before);

            await expect(
                service.update(APPT_ID, { date: '2026-04-02T14:00:00.000Z' }, CLINIC_ID),
            ).rejects.toThrow('Dentist has a conflicting appointment at this time');

            // Appointment must NOT be updated in the DB
            expect(mockAppointmentsRepo.update).not.toHaveBeenCalled();
        });

        it('does NOT call checkConflict when only non-time fields change (status)', async () => {
            await buildModule(null);

            const appointment = makeAppointment();
            mockAppointmentsRepo.findOne.mockResolvedValue(appointment);

            await service.update(
                APPT_ID,
                { status: AppointmentStatus.CONFIRMED },
                CLINIC_ID,
            );

            // createQueryBuilder should NOT have been called — no time-related field changed
            expect(mockAppointmentsRepo.createQueryBuilder).not.toHaveBeenCalled();
            expect(mockAppointmentsRepo.update).toHaveBeenCalledTimes(1);
        });

        it('does NOT call checkConflict when only patientId changes (non-time field)', async () => {
            // Business rule: changing only the patient does not trigger conflict re-check.
            // The guard in update() only checks: date || duration || dentistId.
            // This is intentional — patientId changes are not time-based conflicts.
            await buildModule(null);

            const appointment = makeAppointment();
            mockAppointmentsRepo.findOne.mockResolvedValue(appointment);

            await service.update(APPT_ID, { patientId: 50 }, CLINIC_ID);

            expect(mockAppointmentsRepo.createQueryBuilder).not.toHaveBeenCalled();
            expect(mockAppointmentsRepo.update).toHaveBeenCalledTimes(1);
        });
    });
});

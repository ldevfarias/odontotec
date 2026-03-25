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

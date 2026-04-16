// apps/odonto-api/src/modules/appointments/appointments.service.spec.ts
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
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
  let isSpecificIdQuery = false;
  const qb: any = {
    where: jest.fn().mockImplementation((query) => {
      if (
        query &&
        typeof query === 'string' &&
        query.includes('appointment.id = :id')
      ) {
        isSpecificIdQuery = true;
      }
      return qb;
    }),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    setLock: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockImplementation(() => {
      if (isSpecificIdQuery) {
        // Return the appointment being updated/locked
        return Promise.resolve(makeAppointment({ id: APPT_ID }));
      }
      // Return the conflict (or null) for checkConflict
      return Promise.resolve(getOneResult);
    }),
    getManyAndCount: jest
      .fn()
      .mockResolvedValue([
        [getOneResult].filter(Boolean),
        getOneResult ? 1 : 0,
      ]),
  };
  return qb;
}

describe('AppointmentsService — conflict checking', () => {
  let service: AppointmentsService;

  // We rebuild these per test so each test can configure its own getOne result.
  let mockAppointmentsRepo: Record<string, any>;
  let mockPatientRepo: Record<string, jest.Mock>;
  let mockClinicRepo: Record<string, jest.Mock>;
  let mockNotificationsService: { create: jest.Mock };
  let mockEmailService: { sendAppointmentConfirmation: jest.Mock };
  let mockJwtService: { sign: jest.Mock; verify: jest.Mock };
  let mockDataSource: Record<string, jest.Mock>;

  async function buildModule(getOneResult: Appointment | null) {
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
      createQueryBuilder: jest
        .fn()
        .mockImplementation(() => makeQueryBuilder(getOneResult)),
    };

    mockPatientRepo = {
      // Return patient WITHOUT email to skip email sending side-effect
      findOne: jest
        .fn()
        .mockResolvedValue({
          id: PATIENT_ID,
          name: 'Maria Silva',
          email: null,
        }),
    };

    mockClinicRepo = {
      findOne: jest
        .fn()
        .mockResolvedValue({ id: CLINIC_ID, name: 'OdontoTec' }),
    };

    mockNotificationsService = { create: jest.fn().mockResolvedValue({}) };
    mockEmailService = { sendAppointmentConfirmation: jest.fn() };
    mockJwtService = {
      sign: jest.fn().mockReturnValue('dummy-token'),
      verify: jest.fn(),
    };

    mockDataSource = {
      transaction: jest.fn(async (cb) =>
        cb({
          getRepository: jest.fn().mockReturnValue(mockAppointmentsRepo),
        }),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: getRepositoryToken(Appointment),
          useValue: mockAppointmentsRepo,
        },
        { provide: getRepositoryToken(Patient), useValue: mockPatientRepo },
        { provide: getRepositoryToken(Clinic), useValue: mockClinicRepo },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: DataSource, useValue: mockDataSource },
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
      const conflict = makeAppointment({
        dentistId: DENTIST_ID,
        patientId: 99,
        id: 999,
      });
      await buildModule(conflict);

      const dto = {
        date: '2026-04-01T10:00:00.000Z',
        duration: 30,
        dentistId: DENTIST_ID,
        patientId: PATIENT_ID,
      };

      await expect(service.create(dto, CLINIC_ID)).rejects.toThrow(
        new BadRequestException(
          'Dentist has a conflicting appointment at this time',
        ),
      );

      // Appointment must NOT be persisted
      expect(mockAppointmentsRepo.save).not.toHaveBeenCalled();
    });

    it('throws BadRequestException with patient message when patient has a conflict', async () => {
      // Conflict appointment has a DIFFERENT dentistId → patient conflict branch
      const conflict = makeAppointment({
        dentistId: 999,
        patientId: PATIENT_ID,
        id: 999,
      });
      await buildModule(conflict);

      const dto = {
        date: '2026-04-01T10:00:00.000Z',
        duration: 30,
        dentistId: DENTIST_ID,
        patientId: PATIENT_ID,
      };

      await expect(service.create(dto, CLINIC_ID)).rejects.toThrow(
        new BadRequestException(
          'Patient has a conflicting appointment at this time',
        ),
      );

      expect(mockAppointmentsRepo.save).not.toHaveBeenCalled();
    });

    it('conflict detected via Brackets (dentist OR patient match)', async () => {
      // Both dentistId and patientId provided → checkConflict uses new Brackets(...) with orWhere.
      // The conflict fixture has the same dentistId as the request, so the dentist branch fires.
      const conflict = makeAppointment({
        dentistId: DENTIST_ID,
        patientId: 99,
        id: 999,
      });
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
      const after = makeAppointment({
        date: new Date('2026-04-02T14:00:00.000Z'),
      });

      // findOne is called twice: once for `before`, once for `after`
      mockAppointmentsRepo.findOne
        .mockResolvedValueOnce(before)
        .mockResolvedValueOnce(after);

      const result = await service.update(
        APPT_ID,
        { date: '2026-04-02T14:00:00.000Z' },
        CLINIC_ID,
      );

      // createQueryBuilder called twice: once for lock, once for conflict check (date field changed)
      expect(mockAppointmentsRepo.createQueryBuilder).toHaveBeenCalledTimes(2);
      expect(mockAppointmentsRepo.update).toHaveBeenCalledWith(
        { id: APPT_ID, clinicId: CLINIC_ID },
        expect.objectContaining({ date: '2026-04-02T14:00:00.000Z' }),
      );
      expect(result).toEqual(after);
    });

    it('throws BadRequestException when rescheduled date causes a conflict', async () => {
      const conflict = makeAppointment({ dentistId: DENTIST_ID, id: 999 });
      await buildModule(conflict);

      const before = makeAppointment();
      mockAppointmentsRepo.findOne.mockResolvedValue(before);

      await expect(
        service.update(
          APPT_ID,
          { date: '2026-04-02T14:00:00.000Z' },
          CLINIC_ID,
        ),
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

      // Exactly once for the lock
      expect(mockAppointmentsRepo.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(mockAppointmentsRepo.update).toHaveBeenCalledTimes(1);
    });

    it('does NOT call checkConflict when only patientId changes (non-time field)', async () => {
      await buildModule(null);

      const appointment = makeAppointment();
      mockAppointmentsRepo.findOne.mockResolvedValue(appointment);

      await service.update(APPT_ID, { patientId: 50 }, CLINIC_ID);

      // Exactly once for the lock
      expect(mockAppointmentsRepo.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(mockAppointmentsRepo.update).toHaveBeenCalledTimes(1);
    });
  });
});

// ── createWithPatient ──────────────────────────────────────────────────────

describe('createWithPatient', () => {
  const NEW_PATIENT_ID = 99;

  let service: AppointmentsService;
  let mockDataSource: Record<string, jest.Mock>;

  function makeManagerForWithPatient() {
    const savedPatient = {
      id: NEW_PATIENT_ID,
      name: 'Ana Lima',
      phone: '(11) 99999-9999',
      clinicId: CLINIC_ID,
    };
    const savedAppointment = makeAppointment({ patientId: NEW_PATIENT_ID });

    const appointmentRepo = {
      create: jest.fn().mockReturnValue(savedAppointment),
      save: jest.fn().mockResolvedValue(savedAppointment),
      createQueryBuilder: jest
        .fn()
        .mockImplementation(() => makeQueryBuilder(null)),
    };

    const patientRepo = {
      create: jest.fn().mockReturnValue(savedPatient),
      save: jest.fn().mockResolvedValue(savedPatient),
      findOne: jest.fn().mockResolvedValue(savedPatient),
    };

    const manager: any = {
      getRepository: jest.fn().mockImplementation((entity: any) => {
        const name = typeof entity === 'string' ? entity : entity?.name;
        if (name === 'Patient') return patientRepo;
        if (name === 'Appointment') return appointmentRepo;
        // Clinic, User
        return { findOne: jest.fn().mockResolvedValue(null) };
      }),
    };

    return { manager, patientRepo, appointmentRepo };
  }

  it('creates patient and appointment atomically and returns the appointment', async () => {
    const { manager, patientRepo, appointmentRepo } =
      makeManagerForWithPatient();

    mockDataSource = {
      transaction: jest.fn(async (cb: any) => cb(manager)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: getRepositoryToken(Appointment), useValue: appointmentRepo },
        { provide: getRepositoryToken(Patient), useValue: patientRepo },
        {
          provide: getRepositoryToken(Clinic),
          useValue: { findOne: jest.fn().mockResolvedValue(null) },
        },
        {
          provide: NotificationsService,
          useValue: { create: jest.fn().mockResolvedValue({}) },
        },
        {
          provide: EmailService,
          useValue: { sendAppointmentConfirmation: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('tok') },
        },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get(AppointmentsService);

    const result = await service.createWithPatient(
      {
        patientName: 'Ana Lima',
        patientPhone: '(11) 99999-9999',
        date: '2026-05-01T10:00:00.000Z',
        duration: 30,
        dentistId: DENTIST_ID,
      },
      CLINIC_ID,
    );

    expect(patientRepo.create).toHaveBeenCalledWith({
      name: 'Ana Lima',
      phone: '(11) 99999-9999',
      clinicId: CLINIC_ID,
    });
    expect(patientRepo.save).toHaveBeenCalled();
    expect(appointmentRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        patientId: NEW_PATIENT_ID,
        clinicId: CLINIC_ID,
      }),
    );
    expect(result.patientId).toBe(NEW_PATIENT_ID);
  });

  it('rolls back (transaction never commits) if patient save throws', async () => {
    const { manager, patientRepo, appointmentRepo } =
      makeManagerForWithPatient();
    patientRepo.save = jest.fn().mockRejectedValue(new Error('DB error'));

    mockDataSource = {
      transaction: jest.fn(async (cb: any) => cb(manager)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: getRepositoryToken(Appointment), useValue: appointmentRepo },
        { provide: getRepositoryToken(Patient), useValue: patientRepo },
        {
          provide: getRepositoryToken(Clinic),
          useValue: { findOne: jest.fn().mockResolvedValue(null) },
        },
        {
          provide: NotificationsService,
          useValue: { create: jest.fn().mockResolvedValue({}) },
        },
        {
          provide: EmailService,
          useValue: { sendAppointmentConfirmation: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('tok') },
        },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get(AppointmentsService);

    await expect(
      service.createWithPatient(
        {
          patientName: 'Ana Lima',
          patientPhone: '(11) 99999-9999',
          date: '2026-05-01T10:00:00.000Z',
          duration: 30,
          dentistId: DENTIST_ID,
        },
        CLINIC_ID,
      ),
    ).rejects.toThrow('DB error');

    // Appointment should never have been touched
    expect(appointmentRepo.create).not.toHaveBeenCalled();
  });
});

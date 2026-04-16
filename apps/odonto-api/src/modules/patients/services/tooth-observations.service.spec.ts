import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ToothObservationsService } from './tooth-observations.service';
import { ToothObservation } from '../entities/tooth-observation.entity';
import { Patient } from '../entities/patient.entity';

describe('ToothObservationsService', () => {
  let service: ToothObservationsService;
  let mockRepo: {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    delete: jest.Mock;
  };
  let mockPatientRepo: {
    existsBy: jest.Mock;
  };

  beforeEach(async () => {
    mockRepo = {
      create: jest.fn((v) => v),
      save: jest.fn((v) => Promise.resolve({ id: 1, ...v })),
      find: jest.fn().mockResolvedValue([]),
      delete: jest.fn(),
    };
    mockPatientRepo = {
      existsBy: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToothObservationsService,
        { provide: getRepositoryToken(ToothObservation), useValue: mockRepo },
        { provide: getRepositoryToken(Patient), useValue: mockPatientRepo },
      ],
    }).compile();

    service = module.get<ToothObservationsService>(ToothObservationsService);
  });

  describe('create', () => {
    it('stamps clinicId onto the saved observation', async () => {
      const dto = {
        toothNumber: '11',
        description: 'Cárie incipiente',
        date: '2026-04-04',
        patientId: 42,
      };
      await service.create(dto as any, 7);
      expect(mockRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          clinicId: 7,
          patientId: 42,
          toothNumber: '11',
        }),
      );
    });

    it('throws BadRequestException when patientId does not belong to the clinic', async () => {
      mockPatientRepo.existsBy.mockResolvedValue(false);
      const dto = {
        toothNumber: '11',
        description: 'X',
        date: '2026-04-04',
        patientId: 999,
      };
      await expect(service.create(dto as any, 7)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('findAllByPatient', () => {
    it('filters by patientId AND clinicId', async () => {
      await service.findAllByPatient(42, 7);
      expect(mockRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { patientId: 42, clinicId: 7 } }),
      );
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when observation does not belong to clinic', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 0 });
      await expect(service.remove(99, 7)).rejects.toThrow(NotFoundException);
    });

    it('deletes scoped by id AND clinicId (tenant isolation)', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 1 });
      await service.remove(1, 7);
      expect(mockRepo.delete).toHaveBeenCalledWith({ id: 1, clinicId: 7 });
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ExamsService } from './exams.service';
import { Exam } from '../entities/exam.entity';
import { STORAGE_PROVIDER } from '../../../common/providers/storage/storage.provider.interface';

describe('ExamsService', () => {
  let service: ExamsService;
  let mockStorage: { upload: jest.Mock; delete: jest.Mock };
  let mockRepo: { create: jest.Mock; save: jest.Mock; find: jest.Mock; findOne: jest.Mock; remove: jest.Mock };

  beforeEach(async () => {
    mockStorage = { upload: jest.fn().mockResolvedValue('https://cdn.example.com/clinics/7/patients/42/exams/uuid.pdf'), delete: jest.fn() };
    mockRepo = { create: jest.fn((v) => v), save: jest.fn((v) => Promise.resolve(v)), find: jest.fn(), findOne: jest.fn(), remove: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamsService,
        { provide: getRepositoryToken(Exam), useValue: mockRepo },
        { provide: STORAGE_PROVIDER, useValue: mockStorage },
      ],
    }).compile();

    service = module.get<ExamsService>(ExamsService);
  });

  it('uploads exam file scoped by clinicId AND patientId', async () => {
    const dto = { title: 'Raio-X', patientId: 42 };
    const file = { buffer: Buffer.from('data'), originalname: 'rx.pdf', mimetype: 'application/pdf' } as Express.Multer.File;

    await service.create(dto as any, 7, file);

    expect(mockStorage.upload).toHaveBeenCalledWith(
      file.buffer,
      file.originalname,
      file.mimetype,
      'clinics/7/patients/42/exams',
    );
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ClinicsController } from './clinics.controller';
import { ClinicsService } from './clinics.service';
import { STORAGE_PROVIDER } from '../../common/providers/storage/storage.provider.interface';

describe('ClinicsController - uploadLogo', () => {
  let controller: ClinicsController;
  let mockStorage: { upload: jest.Mock; delete: jest.Mock };
  let mockService: { updateLogo: jest.Mock };

  beforeEach(async () => {
    mockStorage = {
      upload: jest
        .fn()
        .mockResolvedValue('https://cdn.example.com/clinics/5/logos/uuid.png'),
      delete: jest.fn(),
    };
    mockService = { updateLogo: jest.fn().mockResolvedValue({}) };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClinicsController],
      providers: [
        { provide: ClinicsService, useValue: mockService },
        { provide: STORAGE_PROVIDER, useValue: mockStorage },
      ],
    }).compile();

    controller = module.get<ClinicsController>(ClinicsController);
  });

  it('uploads logo scoped under clinics/{clinicId}/logos', async () => {
    const req = { user: { userId: 1 }, headers: { 'x-clinic-id': '5' } };
    const file = {
      buffer: Buffer.from('img'),
      originalname: 'logo.png',
      mimetype: 'image/png',
    } as Express.Multer.File;

    await controller.uploadLogo(req as any, file);

    expect(mockStorage.upload).toHaveBeenCalledWith(
      file.buffer,
      file.originalname,
      file.mimetype,
      'clinics/5/logos',
    );
  });
});

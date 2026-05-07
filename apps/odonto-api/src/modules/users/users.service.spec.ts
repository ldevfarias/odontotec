import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { STORAGE_PROVIDER } from '../../common/providers/storage/storage.provider.interface';
import { ClinicMembership } from '../clinics/entities/clinic-membership.entity';
import { Clinic } from '../clinics/entities/clinic.entity';
import { EmailService } from '../email/email.service';
import { PendingRegistration } from './entities/pending-registration.entity';
import { UserInvitation } from './entities/user-invitation.entity';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let mockMembershipRepo: unknown;
  let mockStorage: { upload: jest.Mock; delete: jest.Mock };

  async function createTestModule(membershipRepo: unknown, storage: unknown) {
    const mockDS = {
      getRepository: jest.fn(),
      transaction: jest.fn(async (cb) => {
        const manager = {
          getRepository: jest.fn().mockImplementation((entity) => {
            if (entity === ClinicMembership) return membershipRepo;
            return mockRepo();
          }),
          update: jest.fn().mockResolvedValue({}),
          delete: jest.fn().mockResolvedValue({}),
          save: jest.fn().mockImplementation((v) => Promise.resolve(v)),
          findOne: jest.fn().mockImplementation((entity, options) => {
            if (entity === ClinicMembership)
              return membershipRepo.findOne(options);
            return null;
          }),
        };
        return cb(manager);
      }),
    };

    return await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepo() },
        { provide: getRepositoryToken(UserInvitation), useValue: mockRepo() },
        {
          provide: getRepositoryToken(PendingRegistration),
          useValue: mockRepo(),
        },
        { provide: getRepositoryToken(Clinic), useValue: mockRepo() },
        {
          provide: getRepositoryToken(ClinicMembership),
          useValue: membershipRepo,
        },
        { provide: STORAGE_PROVIDER, useValue: storage },
        { provide: EmailService, useValue: { sendInvitationEmail: jest.fn() } },
        { provide: DataSource, useValue: mockDS },
      ],
    }).compile();
  }

  describe('findAllByClinic', () => {
    beforeEach(async () => {
      mockMembershipRepo = mockRepo();
      mockStorage = { upload: jest.fn(), delete: jest.fn() };
      const module = await createTestModule(mockMembershipRepo, mockStorage);
      service = module.get<UsersService>(UsersService);
    });

    it('returns users with avatarUrl from membership', async () => {
      const memberships = [
        {
          role: 'DENTIST',
          user: { id: 1, name: 'Ana', email: 'ana@test.com', isActive: true },
          avatarUrl: 'https://cdn.example.com/clinics/5/avatars/uuid.jpg',
        },
        {
          role: 'RECEPTIONIST',
          user: { id: 2, name: 'Bob', email: 'bob@test.com', isActive: true },
          avatarUrl: null,
        },
      ];
      mockMembershipRepo.findAndCount.mockResolvedValue([memberships, 2]);

      const result = await service.findAllByClinic(5);

      expect(result).toEqual({
        data: [
          {
            id: 1,
            name: 'Ana',
            email: 'ana@test.com',
            role: 'DENTIST',
            isActive: true,
            avatarUrl: 'https://cdn.example.com/clinics/5/avatars/uuid.jpg',
          },
          {
            id: 2,
            name: 'Bob',
            email: 'bob@test.com',
            role: 'RECEPTIONIST',
            isActive: true,
            avatarUrl: null,
          },
        ],
        total: 2,
        page: 1,
        limit: 50,
      });
    });
  });

  describe('uploadAvatar', () => {
    beforeEach(async () => {
      mockMembershipRepo = mockRepo();
      mockStorage = { upload: jest.fn(), delete: jest.fn() };
      const module = await createTestModule(mockMembershipRepo, mockStorage);
      service = module.get<UsersService>(UsersService);
    });

    const mockFile = {
      buffer: Buffer.from('img'),
      originalname: 'avatar.jpg',
      mimetype: 'image/jpeg',
    } as Express.Multer.File;

    it('uploads avatar to correct R2 path and returns avatarUrl', async () => {
      mockMembershipRepo.findOne.mockResolvedValue({
        userId: 1,
        clinicId: 5,
        avatarUrl: null,
      });
      mockStorage.upload.mockResolvedValue(
        'https://cdn.example.com/clinics/5/avatars/uuid.jpg',
      );
      mockMembershipRepo.update.mockResolvedValue({});

      const result = await service.uploadAvatar(1, 5, mockFile);

      expect(mockStorage.upload).toHaveBeenCalledWith(
        mockFile.buffer,
        mockFile.originalname,
        mockFile.mimetype,
        'clinics/5/avatars',
      );
      expect(result).toEqual({
        avatarUrl: 'https://cdn.example.com/clinics/5/avatars/uuid.jpg',
      });
    });

    it('deletes old avatar before uploading new one', async () => {
      mockMembershipRepo.findOne.mockResolvedValue({
        userId: 1,
        clinicId: 5,
        avatarUrl: 'https://cdn.example.com/clinics/5/avatars/old.jpg',
      });
      mockStorage.upload.mockResolvedValue(
        'https://cdn.example.com/clinics/5/avatars/new.jpg',
      );
      mockMembershipRepo.update.mockResolvedValue({});

      await service.uploadAvatar(1, 5, mockFile);

      expect(mockStorage.delete).toHaveBeenCalledWith(
        'https://cdn.example.com/clinics/5/avatars/old.jpg',
      );
    });

    it('throws NotFoundException when membership not found on upload', async () => {
      mockMembershipRepo.findOne.mockResolvedValue(null);
      await expect(service.uploadAvatar(1, 99, mockFile)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('removes avatar and returns null', async () => {
      mockMembershipRepo.findOne.mockResolvedValue({
        userId: 1,
        clinicId: 5,
        avatarUrl: 'https://cdn.example.com/clinics/5/avatars/uuid.jpg',
      });
      mockStorage.delete.mockResolvedValue(undefined);
      mockMembershipRepo.update.mockResolvedValue({});

      const result = await service.removeAvatar(1, 5);

      expect(mockStorage.delete).toHaveBeenCalledWith(
        'https://cdn.example.com/clinics/5/avatars/uuid.jpg',
      );
      expect(result).toEqual({ avatarUrl: null });
    });

    it('throws NotFoundException when membership not found on remove', async () => {
      mockMembershipRepo.findOne.mockResolvedValue(null);
      await expect(service.removeAvatar(1, 99)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

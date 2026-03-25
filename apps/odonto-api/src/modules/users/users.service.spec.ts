import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserInvitation } from './entities/user-invitation.entity';
import { PendingRegistration } from './entities/pending-registration.entity';
import { Clinic } from '../clinics/entities/clinic.entity';
import { ClinicMembership } from '../clinics/entities/clinic-membership.entity';
import { STORAGE_PROVIDER } from '../../common/providers/storage/storage.provider.interface';
import { EmailService } from '../email/email.service';

const mockRepo = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
});

describe('UsersService - findAllByClinic', () => {
    let service: UsersService;
    let mockMembershipRepo: ReturnType<typeof mockRepo>;

    beforeEach(async () => {
        mockMembershipRepo = mockRepo();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: getRepositoryToken(User), useValue: mockRepo() },
                { provide: getRepositoryToken(UserInvitation), useValue: mockRepo() },
                { provide: getRepositoryToken(PendingRegistration), useValue: mockRepo() },
                { provide: getRepositoryToken(Clinic), useValue: mockRepo() },
                { provide: getRepositoryToken(ClinicMembership), useValue: mockMembershipRepo },
                { provide: STORAGE_PROVIDER, useValue: { upload: jest.fn(), delete: jest.fn() } },
                { provide: EmailService, useValue: { sendInvitationEmail: jest.fn() } },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
    });

    it('returns users with avatarUrl from membership', async () => {
        mockMembershipRepo.find.mockResolvedValue([
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
        ]);

        const result = await service.findAllByClinic(5);

        expect(result).toEqual([
            { id: 1, name: 'Ana', email: 'ana@test.com', role: 'DENTIST', isActive: true, avatarUrl: 'https://cdn.example.com/clinics/5/avatars/uuid.jpg' },
            { id: 2, name: 'Bob', email: 'bob@test.com', role: 'RECEPTIONIST', isActive: true, avatarUrl: null },
        ]);
    });
});

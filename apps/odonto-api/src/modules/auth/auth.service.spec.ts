import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { ClinicsService } from '../clinics/clinics.service';
import { EmailService } from '../email/email.service';
import { UserRole } from '../users/enums/role.enum';

// Partially mock bcrypt: keep real hash (so bcrypt hash assertions work), mock compare for control
jest.mock('bcrypt', () => {
    const real = jest.requireActual<typeof import('bcrypt')>('bcrypt');
    return {
        ...real,
        compare: jest.fn(),
    };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcryptMock = require('bcrypt') as { compare: jest.Mock; hash: typeof import('bcrypt')['hash'] };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockTokens = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
};

function buildUser(overrides: Record<string, unknown> = {}) {
    return {
        id: 1,
        name: 'Dr. Ana',
        email: 'ana@clinic.com',
        password: 'hashed-password',
        role: UserRole.ADMIN,
        isActive: true,
        currentHashedRefreshToken: 'hashed-refresh-token',
        resetPasswordToken: null,
        resetPasswordExpires: null,
        ...overrides,
    };
}

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockUsersService = {
    findByEmail: jest.fn(),
    findOneWithRefreshToken: jest.fn(),
    findOneForPasswordReset: jest.fn(),
    findPendingRegistrationByToken: jest.fn(),
    createUser: jest.fn(),
    deletePendingRegistration: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
};

const mockClinicsService = {
    findAllByUser: jest.fn(),
    createForUser: jest.fn(),
    addMember: jest.fn(),
    update: jest.fn(),
};

const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
};

const configGetImpl = (key: string) => {
    if (key === 'JWT_SECRET') return 'test-secret';
    if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
    return undefined;
};

const mockConfigService = {
    get: jest.fn(configGetImpl),
};

const mockEmailService = {
    sendPasswordResetEmail: jest.fn(),
    sendWelcomeEmail: jest.fn(),
};

const mockDataSource = {
    transaction: jest.fn((cb) => cb({
        getRepository: jest.fn().mockReturnValue({
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
        }),
    })),
};

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        jest.clearAllMocks();

        // Restore default implementations cleared by clearAllMocks
        mockConfigService.get.mockImplementation(configGetImpl);

        // Default: signAsync persistent implementation — first call → access_token, subsequent → refresh_token
        mockJwtService.signAsync.mockImplementation(async () => {
            const callCount = mockJwtService.signAsync.mock.calls.length;
            return callCount === 1 ? mockTokens.access_token : mockTokens.refresh_token;
        });

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useValue: mockUsersService },
                { provide: ClinicsService, useValue: mockClinicsService },
                { provide: JwtService, useValue: mockJwtService },
                { provide: ConfigService, useValue: mockConfigService },
                { provide: EmailService, useValue: mockEmailService },
                { provide: DataSource, useValue: mockDataSource },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    // -----------------------------------------------------------------------
    // validateUser
    // -----------------------------------------------------------------------

    describe('validateUser', () => {
        it('returns user without password when credentials are valid and user is active', async () => {
            const user = buildUser();
            mockUsersService.findByEmail.mockResolvedValue(user);
            bcryptMock.compare.mockResolvedValue(true);

            const result = await service.validateUser('ana@clinic.com', 'correct-password');

            expect(result).not.toHaveProperty('password');
            expect(result).toMatchObject({ id: 1, name: 'Dr. Ana', email: 'ana@clinic.com' });
        });

        it('normalizes the email before lookup', async () => {
            const user = buildUser();
            mockUsersService.findByEmail.mockResolvedValue(user);
            bcryptMock.compare.mockResolvedValue(true);

            await service.validateUser('  ANA@CLINIC.COM  ', 'pass');

            expect(mockUsersService.findByEmail).toHaveBeenCalledWith('ana@clinic.com');
        });

        it('returns null when user is inactive', async () => {
            const user = buildUser({ isActive: false });
            mockUsersService.findByEmail.mockResolvedValue(user);

            const result = await service.validateUser('ana@clinic.com', 'correct-password');

            expect(result).toBeNull();
        });

        it('returns null when password is wrong', async () => {
            const user = buildUser();
            mockUsersService.findByEmail.mockResolvedValue(user);
            bcryptMock.compare.mockResolvedValue(false);

            const result = await service.validateUser('ana@clinic.com', 'wrong-password');

            expect(result).toBeNull();
        });

        it('returns null when user does not exist', async () => {
            mockUsersService.findByEmail.mockResolvedValue(null);

            const result = await service.validateUser('unknown@clinic.com', 'any');

            expect(result).toBeNull();
        });
    });

    // -----------------------------------------------------------------------
    // login
    // -----------------------------------------------------------------------

    describe('login', () => {
        const clinicMemberships = [
            {
                clinic: { id: 10, name: 'Ana Clinic' },
                role: 'OWNER',
                avatarUrl: 'https://cdn.example.com/avatar.jpg',
            },
        ];

        it('returns tokens, user and clinics on valid credentials', async () => {
            const user = buildUser();
            mockUsersService.findByEmail.mockResolvedValue(user);
            bcryptMock.compare.mockResolvedValue(true);
            mockClinicsService.findAllByUser.mockResolvedValue(clinicMemberships);
            mockUsersService.update.mockResolvedValue(undefined);

            const result = await service.login({ email: 'ana@clinic.com', password: 'correct-password' });

            expect(result).toMatchObject({
                _tokens: { access_token: mockTokens.access_token, refresh_token: mockTokens.refresh_token },
                user: { id: 1, name: 'Dr. Ana', email: 'ana@clinic.com', role: UserRole.ADMIN },
                clinics: [{ id: 10, name: 'Ana Clinic', role: 'OWNER', avatarUrl: 'https://cdn.example.com/avatar.jpg' }],
            });
        });

        it('stores hashed refresh token after login', async () => {
            const user = buildUser();
            mockUsersService.findByEmail.mockResolvedValue(user);
            bcryptMock.compare.mockResolvedValue(true);
            mockClinicsService.findAllByUser.mockResolvedValue([]);
            mockUsersService.update.mockResolvedValue(undefined);

            await service.login({ email: 'ana@clinic.com', password: 'correct-password' });

            const updateCall = mockUsersService.update.mock.calls.find(
                (c: unknown[]) => c[1]?.currentHashedRefreshToken,
            );
            expect(updateCall[1].currentHashedRefreshToken).toMatch(/^\$2[aby]\$/);
            expect(updateCall[1].currentHashedRefreshToken).not.toBe(mockTokens.refresh_token);
        });

        it('maps null avatarUrl to null in clinic list', async () => {
            const user = buildUser();
            mockUsersService.findByEmail.mockResolvedValue(user);
            bcryptMock.compare.mockResolvedValue(true);
            mockClinicsService.findAllByUser.mockResolvedValue([
                { clinic: { id: 10, name: 'Ana Clinic' }, role: 'OWNER', avatarUrl: null },
            ]);
            mockUsersService.update.mockResolvedValue(undefined);

            const result = await service.login({ email: 'ana@clinic.com', password: 'correct-password' });

            expect(result.clinics[0].avatarUrl).toBeNull();
        });

        it('throws UnauthorizedException on invalid credentials', async () => {
            mockUsersService.findByEmail.mockResolvedValue(null);

            await expect(
                service.login({ email: 'ana@clinic.com', password: 'wrong-password' }),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('throws UnauthorizedException when user is inactive', async () => {
            const user = buildUser({ isActive: false });
            mockUsersService.findByEmail.mockResolvedValue(user);
            bcryptMock.compare.mockResolvedValue(true);

            await expect(
                service.login({ email: 'ana@clinic.com', password: 'correct-password' }),
            ).rejects.toThrow(UnauthorizedException);
        });
    });

    // -----------------------------------------------------------------------
    // refreshTokens
    // -----------------------------------------------------------------------

    describe('refreshTokens', () => {
        it('returns new tokens when refresh token is valid', async () => {
            const user = buildUser();
            mockUsersService.findOneWithRefreshToken.mockResolvedValue(user);
            bcryptMock.compare.mockResolvedValue(true);
            mockUsersService.update.mockResolvedValue(undefined);

            const result = await service.refreshTokens(1, 'valid-refresh-token');

            expect(result._tokens).toMatchObject(mockTokens);
        });

        it('throws UnauthorizedException when user is not found', async () => {
            mockUsersService.findOneWithRefreshToken.mockResolvedValue(null);

            await expect(service.refreshTokens(99, 'any-token')).rejects.toThrow(UnauthorizedException);
        });

        it('throws UnauthorizedException when user has no stored refresh token', async () => {
            const user = buildUser({ currentHashedRefreshToken: null });
            mockUsersService.findOneWithRefreshToken.mockResolvedValue(user);

            await expect(service.refreshTokens(1, 'any-token')).rejects.toThrow(UnauthorizedException);
        });

        it('throws UnauthorizedException when refresh token does not match stored hash', async () => {
            const user = buildUser();
            mockUsersService.findOneWithRefreshToken.mockResolvedValue(user);
            bcryptMock.compare.mockResolvedValue(false);

            await expect(service.refreshTokens(1, 'tampered-token')).rejects.toThrow(UnauthorizedException);
        });

        /**
         * SECURITY FIX — TDD red test.
         *
         * An inactive user should NOT be able to obtain new tokens via the
         * refresh endpoint. The current implementation does NOT check
         * `user.isActive`, so this test is expected to FAIL until the fix is
         * applied to `refreshTokens()`.
         */
        it('throws UnauthorizedException when user is inactive', async () => {
            const user = buildUser({ isActive: false });
            mockUsersService.findOneWithRefreshToken.mockResolvedValue(user);
            bcryptMock.compare.mockResolvedValue(true);
            mockUsersService.update.mockResolvedValue(undefined);

            await expect(service.refreshTokens(1, 'valid-token')).rejects.toThrow(UnauthorizedException);
        });
    });

    // -----------------------------------------------------------------------
    // verifyEmailAndSetPassword
    // -----------------------------------------------------------------------

    describe('verifyEmailAndSetPassword', () => {
        const pendingReg = {
            id: 42,
            name: 'Dr. Ana',
            email: 'ana@clinic.com',
            termsAcceptedAt: new Date('2025-01-01'),
        };

        const createdUser = {
            id: 1,
            name: 'Dr. Ana',
            email: 'ana@clinic.com',
            role: UserRole.ADMIN,
            isActive: false,
        };

        const createdClinic = {
            id: 10,
            name: 'Dr. Ana Clinic',
        };

        it('creates user and clinic and returns tokens on valid token + matching passwords', async () => {
            mockUsersService.findPendingRegistrationByToken.mockResolvedValue(pendingReg);
            mockUsersService.createUser.mockResolvedValue(createdUser);
            mockClinicsService.createForUser.mockResolvedValue(createdClinic);
            mockUsersService.deletePendingRegistration.mockResolvedValue(undefined);
            mockUsersService.update.mockResolvedValue(undefined);

            const result = await service.verifyEmailAndSetPassword({
                token: 'valid-token',
                password: 'NewPass123!',
                confirmPassword: 'NewPass123!',
            });

            expect(mockUsersService.createUser).toHaveBeenCalledWith(
                expect.objectContaining({ email: pendingReg.email, role: UserRole.ADMIN }),
                expect.anything()
            );
            expect(mockClinicsService.createForUser).toHaveBeenCalledWith(
                createdUser.id,
                expect.objectContaining({ name: `${pendingReg.name} Clinic` }),
                expect.anything()
            );
            expect(mockUsersService.deletePendingRegistration).toHaveBeenCalledWith(pendingReg.id, expect.anything());
            expect(result).toMatchObject({
                _tokens: { access_token: mockTokens.access_token, refresh_token: mockTokens.refresh_token },
                user: expect.objectContaining({ id: createdUser.id, email: createdUser.email }),
            });
        });

        it('throws BadRequestException when passwords do not match', async () => {
            await expect(
                service.verifyEmailAndSetPassword({
                    token: 'valid-token',
                    password: 'NewPass123!',
                    confirmPassword: 'Different456!',
                }),
            ).rejects.toThrow(BadRequestException);

            // Should bail out before hitting the DB
            expect(mockUsersService.findPendingRegistrationByToken).not.toHaveBeenCalled();
        });

        it('throws BadRequestException when token is invalid or expired', async () => {
            mockUsersService.findPendingRegistrationByToken.mockResolvedValue(null);

            await expect(
                service.verifyEmailAndSetPassword({
                    token: 'expired-token',
                    password: 'NewPass123!',
                    confirmPassword: 'NewPass123!',
                }),
            ).rejects.toThrow(BadRequestException);
        });
    });

    // -----------------------------------------------------------------------
    // resetPassword
    // -----------------------------------------------------------------------

    describe('resetPassword', () => {
        const jti = 'unique-jti-abc123';
        const userId = 5;

        it('updates password and clears reset fields on valid token', async () => {
            mockJwtService.verifyAsync.mockResolvedValue({ sub: userId, type: 'reset', jti });
            const user = buildUser({
                id: userId,
                resetPasswordToken: jti,
                resetPasswordExpires: new Date(Date.now() + 3600_000),
            });
            mockUsersService.findOneForPasswordReset.mockResolvedValue(user);
            mockUsersService.update.mockResolvedValue(undefined);

            await service.resetPassword('valid-token', 'SuperSecret99!');

            const updateCall = mockUsersService.update.mock.calls.find(
                (c: unknown[]) => c[1]?.password,
            );
            expect(updateCall[1].password).toMatch(/^\$2[aby]\$/);
            expect(updateCall[1].password).not.toBe('SuperSecret99!');
            expect(updateCall[1].resetPasswordToken).toBeNull();
            expect(updateCall[1].resetPasswordExpires).toBeNull();
        });

        it('throws UnauthorizedException when jti does not match stored token (already used)', async () => {
            mockJwtService.verifyAsync.mockResolvedValue({ sub: userId, type: 'reset', jti: 'different-jti' });
            const user = buildUser({
                id: userId,
                resetPasswordToken: jti, // stored jti differs from JWT jti
                resetPasswordExpires: new Date(Date.now() + 3600_000),
            });
            mockUsersService.findOneForPasswordReset.mockResolvedValue(user);

            await expect(service.resetPassword('already-used-token', 'NewPass!')).rejects.toThrow(
                UnauthorizedException,
            );
        });

        it('throws UnauthorizedException when reset token is expired', async () => {
            mockJwtService.verifyAsync.mockResolvedValue({ sub: userId, type: 'reset', jti });
            const user = buildUser({
                id: userId,
                resetPasswordToken: jti,
                resetPasswordExpires: new Date(Date.now() - 1), // already in the past
            });
            mockUsersService.findOneForPasswordReset.mockResolvedValue(user);

            await expect(service.resetPassword('expired-token', 'NewPass!')).rejects.toThrow(
                UnauthorizedException,
            );
        });

        it('throws UnauthorizedException when jwt verification fails', async () => {
            mockJwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

            await expect(service.resetPassword('bad-jwt', 'NewPass!')).rejects.toThrow(
                UnauthorizedException,
            );
        });

        it('throws UnauthorizedException when token type is not reset', async () => {
            mockJwtService.verifyAsync.mockResolvedValue({ sub: userId, type: 'access', jti });
            const user = buildUser({ id: userId, resetPasswordToken: jti });
            mockUsersService.findOneForPasswordReset.mockResolvedValue(user);

            await expect(service.resetPassword('wrong-type-token', 'NewPass!')).rejects.toThrow(
                UnauthorizedException,
            );
        });
    });

    // -----------------------------------------------------------------------
    // Token exposure — tokens must not appear in service return values
    // -----------------------------------------------------------------------

    describe('Token exposure — tokens must not appear in service return values', () => {
        it('login() does not return access_token or refresh_token in the top-level object', async () => {
            const user = buildUser();
            mockUsersService.findByEmail.mockResolvedValue(user);
            bcryptMock.compare.mockResolvedValue(true);
            mockClinicsService.findAllByUser.mockResolvedValue([]);
            mockUsersService.update.mockResolvedValue(undefined);

            const result = await service.login({ email: 'ana@clinic.com', password: 'pass123' });

            expect(result).not.toHaveProperty('access_token');
            expect(result).not.toHaveProperty('refresh_token');
            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('clinics');
        });

        it('refreshTokens() does not return access_token or refresh_token in the top-level object', async () => {
            const user = buildUser();
            mockUsersService.findOneWithRefreshToken.mockResolvedValue(user);
            bcryptMock.compare.mockResolvedValue(true);
            mockUsersService.update.mockResolvedValue(undefined);

            const result = await service.refreshTokens(1, 'valid-token');

            expect(result).not.toHaveProperty('access_token');
            expect(result).not.toHaveProperty('refresh_token');
        });
    });
});

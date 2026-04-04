import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { DataSource, EntityManager } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { RegisterInvitationDto } from './dto/register-invitation.dto';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { InitiateRegistrationDto } from './dto/initiate-registration.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { CompleteClinicDto } from './dto/complete-clinic.dto';
import { ClinicsService } from '../clinics/clinics.service';
import { UserRole } from '../users/enums/role.enum';
import { ClinicRole } from '../clinics/enums/clinic-role.enum';
import { EmailService } from '../email/email.service';
import { randomBytes } from 'crypto';


@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private clinicsService: ClinicsService,
        private emailService: EmailService,
        private dataSource: DataSource,
    ) { }

    async registerByInvitation(registerDto: RegisterInvitationDto) {
        return await this.dataSource.transaction(async (manager) => {
            const { user, invitation } = await this.usersService.completeInvitation(
                registerDto.token,
                registerDto.name,
                registerDto.password,
                manager
            );

            // Add user to the clinic using the invitation already returned by completeInvitation
            const clinicRole = this.mapUserRoleToClinicRole(invitation.role);
            await this.clinicsService.addMember(invitation.clinicId, user.id, clinicRole, manager);

            const tokens = await this.getTokens(user.id, user.email, user.role, user.isActive);
            await this.updateRefreshToken(user.id, tokens.refresh_token, manager);

            const clinics = await this.clinicsService.findAllByUser(user.id);

            return {
                _tokens: tokens,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                clinics: clinics.map(c => ({ id: c.clinic.id, name: c.clinic.name, role: c.role, avatarUrl: c.avatarUrl ?? null })),
            };
        });
    }

    async initiateRegistration(dto: InitiateRegistrationDto) {
        const pending = await this.usersService.createPendingRegistration(dto.name, dto.email);
        const emailSent = await this.emailService.sendRegistrationVerificationEmail(pending.email, pending.name, pending.verificationToken);

        if (!emailSent) {
            console.log(`\n\n[DEV MODE] Email failed to send. Verification Token: ${pending.verificationToken}\nLink: ${this.configService.get('FRONTEND_URL')}/register/verify/${pending.verificationToken}\n\n`);
        }

        return {
            message: 'Verification email sent successfully',
        };
    }

    async verifyEmailAndSetPassword(dto: VerifyEmailDto) {
        if (dto.password !== dto.confirmPassword) {
            throw new BadRequestException('Passwords do not match');
        }

        return await this.dataSource.transaction(async (manager) => {
            const pending = await this.usersService.findPendingRegistrationByToken(dto.token);
            if (!pending) {
                throw new BadRequestException('Invalid or expired verification token');
            }

            const user = await this.usersService.createUser({
                name: pending.name,
                email: pending.email,
                password: dto.password,
                role: UserRole.ADMIN,
                isActive: false, // Block access until clinic setup is complete
                termsAcceptedAt: pending.termsAcceptedAt || undefined,
            }, manager);

            // Create a provisional clinic with the user as OWNER
            const clinic = await this.clinicsService.createForUser(user.id, {
                name: `${pending.name} Clinic`, // Provisional name
                phone: '',
                address: '',
            } as any, manager);

            // Delete the pending registration
            await this.usersService.deletePendingRegistration(pending.id, manager);

            // Generate tokens so user can proceed to step 3 authenticated
            const tokens = await this.getTokens(user.id, user.email, user.role, user.isActive);
            await this.updateRefreshToken(user.id, tokens.refresh_token, manager);

            return {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                    clinicName: clinic.name,
                },
                _tokens: tokens,
            };
        });
    }

    async completeClinicSetup(userId: number, dto: CompleteClinicDto) {
        return await this.dataSource.transaction(async (manager) => {
            const user = await this.usersService.findOne(userId, manager);
            if (!user) throw new UnauthorizedException('User not found');

            if (!user.termsAcceptedAt) {
                throw new BadRequestException('Você precisa aceitar os termos de uso antes de configurar a clínica');
            }

            if (user.isActive) {
                throw new BadRequestException('Clinic setup already completed');
            }

            // Find user's clinics (should have the provisional one)
            const userClinics = await this.clinicsService.findAllByUser(userId);
            const ownerClinic = userClinics.find(c => c.role === ClinicRole.OWNER);

            if (!ownerClinic) {
                throw new BadRequestException('No clinic found for this user');
            }

            // Update clinic
            await this.clinicsService.update(ownerClinic.clinic.id, {
                name: dto.clinicName,
                phone: dto.clinicPhone,
                address: dto.clinicAddress,
            } as any, manager);

            // Mark user as active, unblocking their access
            await this.usersService.update(user.id, { isActive: true } as any, manager);

            // Generate new tokens with isActive = true
            const tokens = await this.getTokens(user.id, user.email, user.role, true);
            await this.updateRefreshToken(user.id, tokens.refresh_token, manager);

            try {
                await this.emailService.sendWelcomeEmail(user.email, user.name, dto.clinicName);
            } catch (e) {
                console.error('Failed to send welcome email', e);
            }

            const clinics = await this.clinicsService.findAllByUser(userId);

            return {
                message: 'Clinic setup completed successfully',
                clinics: clinics.map(c => ({ id: c.clinic.id, name: c.clinic.name, role: c.role, avatarUrl: c.avatarUrl ?? null })),
                _tokens: tokens,
            };
        });
    }

    async registerTenant(registerDto: RegisterTenantDto) {
        return await this.dataSource.transaction(async (manager) => {
            try {
                // 1. Create User
                const user = await this.usersService.createUser({
                    name: registerDto.userName,
                    email: registerDto.email,
                    password: registerDto.password,
                    role: UserRole.ADMIN,
                    isActive: true,
                }, manager);

                // 2. Create Clinic with user as owner
                const clinic = await this.clinicsService.createForUser(user.id, {
                    name: registerDto.clinicName,
                    phone: registerDto.clinicPhone,
                    address: registerDto.clinicAddress,
                } as any, manager);

                // 3. Generate Tokens
                const tokens = await this.getTokens(user.id, user.email, user.role, user.isActive);
                await this.updateRefreshToken(user.id, tokens.refresh_token, manager);

                // 4. Send Welcome Email
                await this.emailService.sendWelcomeEmail(user.email, user.name, clinic.name);

                return {
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        clinicName: clinic.name,
                    },
                    clinics: [{ id: clinic.id, name: clinic.name, role: ClinicRole.OWNER }],
                    _tokens: tokens,
                };
            } catch (error) {
                console.error('Error registering tenant:', error);
                throw error;
            }
        });
    }

    async validateUser(email: string, pass: string): Promise<any> {
        const normalizedEmail = email.toLowerCase().trim();
        const user = await this.usersService.findByEmail(normalizedEmail);

        if (user && user.isActive && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const tokens = await this.getTokens(user.id, user.email, user.role, user.isActive);
        await this.updateRefreshToken(user.id, tokens.refresh_token);

        // Get all clinics for this user
        const clinics = await this.clinicsService.findAllByUser(user.id);

        return {
            _tokens: tokens,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            clinics: clinics.map(c => ({ id: c.clinic.id, name: c.clinic.name, role: c.role, avatarUrl: c.avatarUrl ?? null })),
        };
    }

    async logout(userId: number) {
        return this.usersService.update(userId, { currentHashedRefreshToken: null } as any);
    }

    async getMe(userId: number) {
        const user = await this.usersService.findOne(userId);
        if (!user) throw new UnauthorizedException('User not found');
        const clinics = await this.clinicsService.findAllByUser(user.id);
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            clinics: clinics.map(c => ({ id: c.clinic.id, name: c.clinic.name, role: c.role, avatarUrl: c.avatarUrl ?? null })),
        };
    }

    async refreshTokens(userId: number, refreshToken: string) {
        return await this.dataSource.transaction(async (manager) => {
            const user = await this.usersService.findOneWithRefreshToken(userId, manager);
            if (!user || !user.currentHashedRefreshToken)
                throw new UnauthorizedException('Access Denied');

            const refreshTokenMatches = await bcrypt.compare(refreshToken, user.currentHashedRefreshToken);
            if (!refreshTokenMatches) throw new UnauthorizedException('Access Denied');

            if (!user.isActive) throw new UnauthorizedException('Access Denied');

            const tokens = await this.getTokens(user.id, user.email, user.role, user.isActive);
            await this.updateRefreshToken(user.id, tokens.refresh_token, manager);
            return { _tokens: tokens, message: 'Tokens refreshed' };
        });
    }

    async updateRefreshToken(userId: number, refreshToken: string, manager?: EntityManager) {
        const hash = await bcrypt.hash(refreshToken, 10);
        await this.usersService.update(userId, { currentHashedRefreshToken: hash }, manager);
    }

    async getTokens(userId: number, email: string, role: string, isActive: boolean = true) {
        const payload = { sub: userId, email, role, isActive };
        const secret = this.configService.get<string>('JWT_SECRET');
        const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

        if (!secret || !refreshSecret) {
            throw new Error('JWT secrets are not properly configured.');
        }

        const [at, rt] = await Promise.all([
            this.jwtService.signAsync(payload, { expiresIn: '15m', secret }),
            this.jwtService.signAsync(payload, { expiresIn: '7d', secret: refreshSecret }),
        ]);

        return {
            access_token: at,
            refresh_token: rt,
        };
    }

    async forgotPassword(email: string): Promise<void> {
        const user = await this.usersService.findByEmail(email);

        if (!user) {
            return;
        }

        const jti = randomBytes(32).toString('hex');
        const token = await this.jwtService.signAsync(
            { sub: user.id, type: 'reset', jti },
            { secret: this.configService.get('JWT_SECRET'), expiresIn: '1h' }
        );

        await this.usersService.update(user.id, {
            resetPasswordToken: jti,
            resetPasswordExpires: new Date(Date.now() + 3600000)
        } as any);

        await this.emailService.sendPasswordResetEmail(user.email, user.name, token);
    }

    async resetPassword(token: string, newPass: string): Promise<void> {
        return await this.dataSource.transaction(async (manager) => {
            try {
                const payload = await this.jwtService.verifyAsync(token, {
                    secret: this.configService.get('JWT_SECRET')
                });

                if (payload.type !== 'reset') throw new UnauthorizedException('Invalid token type');

                const user = await this.usersService.findOneForPasswordReset(payload.sub, manager);
                if (!user) throw new UnauthorizedException('User not found');

                if (user.resetPasswordToken !== payload.jti) {
                    throw new UnauthorizedException('Token already used or invalid');
                }

                if (user.resetPasswordExpires && new Date() > user.resetPasswordExpires) {
                    throw new UnauthorizedException('Token expired');
                }

                const hashedPassword = await bcrypt.hash(newPass, 10);

                await this.usersService.update(user.id, {
                    password: hashedPassword,
                    resetPasswordToken: null,
                    resetPasswordExpires: null
                } as any, manager);

            } catch (error) {
                if (error instanceof UnauthorizedException) {
                    throw error;
                }
                console.error('Reset Password Error:', error instanceof Error ? error.message : String(error));
                throw new UnauthorizedException('Invalid or expired token');
            }
        });
    }

    private mapUserRoleToClinicRole(userRole: UserRole): ClinicRole {
        switch (userRole) {
            case UserRole.ADMIN: return ClinicRole.ADMIN;
            case UserRole.DENTIST: return ClinicRole.DENTIST;
            case UserRole.SIMPLE: return ClinicRole.RECEPTIONIST;
            default: return ClinicRole.RECEPTIONIST;
        }
    }
}

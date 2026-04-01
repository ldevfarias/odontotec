import { Injectable, ConflictException, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from './entities/user.entity';
import { UserInvitation } from './entities/user-invitation.entity';
import { PendingRegistration } from './entities/pending-registration.entity';
import { Clinic } from '../clinics/entities/clinic.entity';
import { ClinicMembership } from '../clinics/entities/clinic-membership.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { ClinicUserDto } from './dto/clinic-user.dto';
import { EmailService } from '../email/email.service';
import { STORAGE_PROVIDER } from '../../common/providers/storage/storage.provider.interface';
import type { IStorageProvider } from '../../common/providers/storage/storage.provider.interface';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(UserInvitation)
        private invitationRepository: Repository<UserInvitation>,
        @InjectRepository(PendingRegistration)
        private pendingRegistrationRepository: Repository<PendingRegistration>,
        @InjectRepository(Clinic)
        private clinicRepository: Repository<Clinic>,
        @InjectRepository(ClinicMembership)
        private membershipRepository: Repository<ClinicMembership>,
        @Inject(STORAGE_PROVIDER)
        private storageProvider: IStorageProvider,
        private emailService: EmailService,
    ) { }

    async invite(inviteUserDto: InviteUserDto, clinicId: number): Promise<UserInvitation> {
        const { email, cpf, role } = inviteUserDto;
        const normalizedEmail = email.toLowerCase().trim();

        // Optional: Revoke previous pending invitations for this email/clinic
        await this.invitationRepository.delete({ email: normalizedEmail, clinicId, acceptedAt: IsNull() });

        const token = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const invitation = this.invitationRepository.create({
            email: normalizedEmail,
            cpf,
            role,
            token,
            clinicId,
            expiresAt,
        });

        const savedInvitation = await this.invitationRepository.save(invitation);

        try {
            const clinic = await this.clinicRepository.findOne({ where: { id: clinicId } });
            if (clinic) {
                await this.emailService.sendInvitationEmail(
                    normalizedEmail,
                    clinic.name,
                    token,
                    expiresAt,
                );
            }
        } catch (error) {
            console.error('Failed to send invitation email:', error);
        }

        return savedInvitation;
    }

    async findAllInvitations(clinicId: number): Promise<UserInvitation[]> {
        return this.invitationRepository.find({
            where: { clinicId },
            order: { createdAt: 'DESC' }
        });
    }

    async createPendingRegistration(name: string, email: string): Promise<PendingRegistration> {
        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await this.findByEmail(normalizedEmail);

        if (existingUser) {
            throw new ConflictException('Email already in use');
        }

        await this.pendingRegistrationRepository.delete({ email: normalizedEmail });

        const token = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const pending = this.pendingRegistrationRepository.create({
            name,
            email: normalizedEmail,
            verificationToken: token,
            expiresAt,
            termsAcceptedAt: null,
        });

        return this.pendingRegistrationRepository.save(pending);
    }

    async findPendingRegistrationByToken(token: string): Promise<PendingRegistration | null> {
        const pending = await this.pendingRegistrationRepository.findOne({
            where: { verificationToken: token }
        });

        if (pending && pending.expiresAt < new Date()) {
            return null;
        }

        return pending;
    }

    async deletePendingRegistration(id: number): Promise<void> {
        await this.pendingRegistrationRepository.delete(id);
    }

    async findInvitationByToken(token: string): Promise<UserInvitation | null> {
        const invitation = await this.invitationRepository.findOne({
            where: { token, acceptedAt: IsNull() },
            relations: ['clinic']
        });

        if (invitation && invitation.expiresAt < new Date()) {
            return null;
        }

        return invitation;
    }

    async completeInvitation(token: string, name: string, password: string): Promise<{ user: User; invitation: UserInvitation }> {
        const invitation = await this.findInvitationByToken(token);
        if (!invitation) {
            throw new BadRequestException('Invalid or expired invitation token');
        }

        // Check if user already exists (invited to multiple clinics)
        let user = await this.findByEmail(invitation.email);
        if (!user) {
            user = await this.createUser({
                email: invitation.email,
                name: name,
                password: password,
                role: invitation.role,
                isActive: true,
            });
        }

        invitation.acceptedAt = new Date();
        await this.invitationRepository.save(invitation);

        return { user, invitation };
    }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const email = createUserDto.email.toLowerCase().trim();
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const user = this.usersRepository.create({
            ...createUserDto,
            email,
            password: hashedPassword,
        });

        try {
            return await this.usersRepository.save(user);
        } catch (error: any) {
            if (error.code === '23505') {
                throw new ConflictException('Email already in use');
            }
            throw error;
        }
    }

    /**
     * @deprecated Use createUser instead. This method was here for backward compatibility.
     */
    async create(createUserDto: CreateUserDto, _clinicId?: number): Promise<User> {
        return this.createUser(createUserDto);
    }

    async findAllByClinic(clinicId: number, page = 1, limit = 50): Promise<PaginatedResponseDto<ClinicUserDto>> {
        const [memberships, total] = await this.membershipRepository.findAndCount({
            where: { clinicId, isActive: true, user: Not(IsNull()) },
            relations: ['user'],
            skip: (page - 1) * limit,
            take: limit,
        });
        const data = memberships
            .filter(m => m.user)
            .map(m => ({
                id: m.user.id,
                name: m.user.name,
                email: m.user.email,
                role: m.role,
                isActive: m.user.isActive,
                avatarUrl: m.avatarUrl ?? null,
            }));
        return { data, total, page, limit };
    }

    async update(id: number, updateUserDto: UpdateUserDto | Partial<User>): Promise<User | null> {
        try {
            const user = await this.usersRepository.findOne({ where: { id } });
            if (!user) return null;

            Object.assign(user, updateUserDto);
            return await this.usersRepository.save(user);
        } catch (error: any) {
            if (error.code === '23505') {
                throw new ConflictException('Email already in use');
            }
            throw error;
        }
    }

    async acceptTerms(id: number): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new BadRequestException('User not found');
        }
        if (user.termsAcceptedAt) {
            return user;
        }
        user.termsAcceptedAt = new Date();
        return this.usersRepository.save(user);
    }

    async remove(id: number): Promise<void> {
        await this.usersRepository.update({ id }, { isActive: false });
    }

    async findByEmail(email: string): Promise<User | null> {
        const normalizedEmail = email.toLowerCase().trim();
        return this.usersRepository.findOne({
            where: { email: normalizedEmail },
            select: ['id', 'name', 'email', 'password', 'role', 'isActive']
        });
    }

    async findOne(id: number): Promise<User | null> {
        return this.usersRepository.findOne({ where: { id } });
    }

    async findOneWithRefreshToken(id: number): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { id },
            select: ['id', 'email', 'role', 'isActive', 'currentHashedRefreshToken'],
        });
    }

    async findOneForPasswordReset(id: number): Promise<User | null> {
        return this.usersRepository.findOne({
            where: { id },
            select: ['id', 'email', 'role', 'isActive', 'resetPasswordToken', 'resetPasswordExpires'],
        });
    }

    async uploadAvatar(userId: number, clinicId: number, file: Express.Multer.File): Promise<{ avatarUrl: string }> {
        const membership = await this.membershipRepository.findOne({
            where: { userId, clinicId, isActive: true },
        });
        if (!membership) {
            throw new NotFoundException('Membership not found for this clinic');
        }

        // Delete old avatar (best-effort — proceed even if R2 delete fails)
        if (membership.avatarUrl) {
            try {
                await this.storageProvider.delete(membership.avatarUrl);
            } catch (err) {
                console.warn(`Failed to delete old avatar from R2: ${membership.avatarUrl}`, err);
            }
        }

        const avatarUrl = await this.storageProvider.upload(
            file.buffer,
            file.originalname,
            file.mimetype,
            `clinics/${clinicId}/avatars`,
        );

        await this.membershipRepository.update({ userId, clinicId }, { avatarUrl });
        return { avatarUrl };
    }

    async removeAvatar(userId: number, clinicId: number): Promise<{ avatarUrl: null }> {
        const membership = await this.membershipRepository.findOne({
            where: { userId, clinicId, isActive: true },
        });
        if (!membership) {
            throw new NotFoundException('Membership not found for this clinic');
        }

        if (membership.avatarUrl) {
            try {
                await this.storageProvider.delete(membership.avatarUrl);
            } catch (err) {
                console.warn(`Failed to delete old avatar from R2: ${membership.avatarUrl}`, err);
            }
        }

        await this.membershipRepository.update({ userId, clinicId }, { avatarUrl: null });
        return { avatarUrl: null };
    }
}

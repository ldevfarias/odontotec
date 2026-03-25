import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clinic } from './entities/clinic.entity';
import { ClinicMembership } from './entities/clinic-membership.entity';
import { ClinicRole } from './enums/clinic-role.enum';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { CreateClinicDto } from './dto/create-clinic.dto';

@Injectable()
export class ClinicsService {
    constructor(
        @InjectRepository(Clinic)
        private clinicsRepository: Repository<Clinic>,
        @InjectRepository(ClinicMembership)
        private membershipRepository: Repository<ClinicMembership>,
    ) { }

    async findOne(id: number): Promise<Clinic> {
        const clinic = await this.clinicsRepository.findOne({ where: { id } });
        if (!clinic) {
            throw new NotFoundException(`Clinic with ID ${id} not found`);
        }
        return clinic;
    }

    async create(createClinicDto: CreateClinicDto): Promise<Clinic> {
        const clinic = this.clinicsRepository.create(createClinicDto);
        return this.clinicsRepository.save(clinic);
    }

    async createForUser(userId: number, createClinicDto: CreateClinicDto): Promise<Clinic> {
        const clinic = this.clinicsRepository.create({
            ...createClinicDto,
            ownerId: userId,
        });
        const savedClinic = await this.clinicsRepository.save(clinic);

        // Auto-create OWNER membership
        const membership = this.membershipRepository.create({
            userId,
            clinicId: savedClinic.id,
            role: ClinicRole.OWNER,
            isActive: true,
        });
        await this.membershipRepository.save(membership);

        return savedClinic;
    }

    async findAllByUser(userId: number): Promise<{ clinic: Clinic; role: ClinicRole; avatarUrl: string | null }[]> {
        const memberships = await this.membershipRepository.find({
            where: { userId, isActive: true },
            relations: ['clinic'],
        });
        return memberships.map(m => ({ clinic: m.clinic, role: m.role, avatarUrl: m.avatarUrl ?? null }));
    }

    async addMember(clinicId: number, userId: number, role: ClinicRole): Promise<ClinicMembership> {
        const existing = await this.membershipRepository.findOne({
            where: { userId, clinicId },
        });
        if (existing) {
            existing.role = role;
            existing.isActive = true;
            return this.membershipRepository.save(existing);
        }
        const membership = this.membershipRepository.create({
            userId,
            clinicId,
            role,
            isActive: true,
        });
        return this.membershipRepository.save(membership);
    }

    async removeMember(clinicId: number, userId: number): Promise<void> {
        await this.membershipRepository.update({ userId, clinicId }, { isActive: false });
    }

    async getUserMembership(userId: number, clinicId: number): Promise<ClinicMembership | null> {
        return this.membershipRepository.findOne({
            where: { userId, clinicId, isActive: true },
        });
    }

    async update(id: number, updateClinicDto: UpdateClinicDto): Promise<Clinic> {
        const clinic = await this.findOne(id);
        await this.clinicsRepository.update(id, updateClinicDto);
        return this.findOne(id);
    }

    async updateLogo(id: number, logoUrl: string): Promise<Clinic> {
        await this.clinicsRepository.update(id, { logoUrl });
        return this.findOne(id);
    }
}

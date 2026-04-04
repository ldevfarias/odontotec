import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
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
        private dataSource: DataSource,
    ) { }

    private getRepository<T extends object>(entityClass: new () => T, manager?: EntityManager): Repository<T> {
        return manager ? manager.getRepository(entityClass) : this.dataSource.getRepository(entityClass);
    }

    async findOne(id: number, manager?: EntityManager): Promise<Clinic> {
        const repo = this.getRepository(Clinic, manager);
        const clinic = await repo.findOne({ where: { id } });
        if (!clinic) {
            throw new NotFoundException(`Clinic with ID ${id} not found`);
        }
        return clinic;
    }

    async create(createClinicDto: CreateClinicDto, manager?: EntityManager): Promise<Clinic> {
        const repo = this.getRepository(Clinic, manager);
        const clinic = repo.create(createClinicDto);
        return repo.save(clinic);
    }

    async createForUser(userId: number, createClinicDto: CreateClinicDto, manager?: EntityManager): Promise<Clinic> {
        return await (manager ? Promise.resolve(manager) : this.dataSource.transaction(async m => m)).then(async m => {
            const clinicRepo = m.getRepository(Clinic);
            const membershipRepo = m.getRepository(ClinicMembership);

            const clinic = clinicRepo.create({
                ...createClinicDto,
                ownerId: userId,
            });
            const savedClinic = await clinicRepo.save(clinic);

            // Auto-create OWNER membership
            const membership = membershipRepo.create({
                userId,
                clinicId: savedClinic.id,
                role: ClinicRole.OWNER,
                isActive: true,
            });
            await membershipRepo.save(membership);

            return savedClinic;
        });
    }

    async findAllByUser(userId: number): Promise<{ clinic: Clinic; role: ClinicRole; avatarUrl: string | null }[]> {
        const memberships = await this.membershipRepository.find({
            where: { userId, isActive: true },
            relations: ['clinic'],
        });
        return memberships.map(m => ({ clinic: m.clinic, role: m.role, avatarUrl: m.avatarUrl ?? null }));
    }

    async addMember(clinicId: number, userId: number, role: ClinicRole, manager?: EntityManager): Promise<ClinicMembership> {
        const repo = this.getRepository(ClinicMembership, manager);
        const existing = await repo.findOne({
            where: { userId, clinicId },
        });
        if (existing) {
            existing.role = role;
            existing.isActive = true;
            return repo.save(existing);
        }
        const membership = repo.create({
            userId,
            clinicId,
            role,
            isActive: true,
        });
        return repo.save(membership);
    }

    async removeMember(clinicId: number, userId: number): Promise<void> {
        await this.membershipRepository.update({ userId, clinicId }, { isActive: false });
    }

    async getUserMembership(userId: number, clinicId: number): Promise<ClinicMembership | null> {
        return this.membershipRepository.findOne({
            where: { userId, clinicId, isActive: true },
        });
    }

    async update(id: number, updateClinicDto: UpdateClinicDto, manager?: EntityManager): Promise<Clinic> {
        const repo = this.getRepository(Clinic, manager);
        await repo.update(id, updateClinicDto);
        return this.findOne(id, manager);
    }

    async updateLogo(id: number, logoUrl: string): Promise<Clinic> {
        await this.clinicsRepository.update(id, { logoUrl });
        return this.findOne(id);
    }
}

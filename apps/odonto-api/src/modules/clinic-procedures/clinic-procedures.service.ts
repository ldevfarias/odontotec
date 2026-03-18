import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClinicProcedure } from './entities/clinic-procedure.entity';
import { CreateClinicProcedureDto, UpdateClinicProcedureDto } from './dto/clinic-procedure.dto';

@Injectable()
export class ClinicProceduresService {
    constructor(
        @InjectRepository(ClinicProcedure)
        private repository: Repository<ClinicProcedure>,
    ) { }

    async create(dto: CreateClinicProcedureDto, clinicId: number): Promise<ClinicProcedure> {
        const procedure = this.repository.create({
            ...dto,
            clinicId,
        });
        return this.repository.save(procedure);
    }

    async findAll(clinicId: number): Promise<ClinicProcedure[]> {
        return this.repository.find({
            where: { clinicId },
            order: { name: 'ASC' },
        });
    }

    async findOne(id: number, clinicId: number): Promise<ClinicProcedure> {
        const procedure = await this.repository.findOne({
            where: { id, clinicId },
        });
        if (!procedure) {
            throw new NotFoundException(`Procedure with ID ${id} not found`);
        }
        return procedure;
    }

    async update(id: number, dto: UpdateClinicProcedureDto, clinicId: number): Promise<ClinicProcedure> {
        const procedure = await this.findOne(id, clinicId);
        Object.assign(procedure, dto);
        return this.repository.save(procedure);
    }

    async remove(id: number, clinicId: number): Promise<void> {
        const procedure = await this.findOne(id, clinicId);
        await this.repository.remove(procedure);
    }
}

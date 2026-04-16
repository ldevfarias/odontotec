import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Procedure } from '../entities/procedure.entity';
import { CreateProcedureDto } from '../dto/create-procedure.dto';
import { UpdateProcedureDto } from '../dto/update-procedure.dto';

@Injectable()
export class ProceduresService {
  constructor(
    @InjectRepository(Procedure)
    private proceduresRepository: Repository<Procedure>,
  ) {}

  async create(
    createProcedureDto: CreateProcedureDto,
    clinicId: number,
  ): Promise<Procedure> {
    const procedure = this.proceduresRepository.create({
      ...createProcedureDto,
      clinicId,
    });
    return this.proceduresRepository.save(procedure);
  }

  async findAllByPatient(
    patientId: number,
    clinicId: number,
  ): Promise<Procedure[]> {
    return this.proceduresRepository.find({
      where: { patientId, clinicId },
      order: { date: 'DESC' },
    });
  }

  async findOne(id: number, clinicId: number): Promise<Procedure> {
    const procedure = await this.proceduresRepository.findOne({
      where: { id, clinicId },
    });
    if (!procedure) {
      throw new NotFoundException(`Procedure with ID ${id} not found`);
    }
    return procedure;
  }

  async update(
    id: number,
    updateProcedureDto: UpdateProcedureDto,
    clinicId: number,
  ): Promise<Procedure> {
    const procedure = await this.findOne(id, clinicId);
    Object.assign(procedure, updateProcedureDto);
    return this.proceduresRepository.save(procedure);
  }

  async remove(id: number, clinicId: number): Promise<void> {
    const result = await this.proceduresRepository.delete({ id, clinicId });
    if (result.affected === 0) {
      throw new NotFoundException(`Procedure with ID ${id} not found`);
    }
  }
}

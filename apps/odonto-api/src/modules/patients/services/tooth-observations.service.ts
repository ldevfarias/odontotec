import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ToothObservation } from '../entities/tooth-observation.entity';
import { Patient } from '../entities/patient.entity';
import { CreateToothObservationDto } from '../dto/create-tooth-observation.dto';

@Injectable()
export class ToothObservationsService {
  constructor(
    @InjectRepository(ToothObservation)
    private readonly repo: Repository<ToothObservation>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
  ) {}

  async create(
    dto: CreateToothObservationDto,
    clinicId: number,
  ): Promise<ToothObservation> {
    const patientExists = await this.patientRepo.existsBy({
      id: dto.patientId,
      clinicId,
    });
    if (!patientExists) {
      throw new BadRequestException('Patient not found in this clinic');
    }
    const observation = this.repo.create({ ...dto, clinicId });
    return this.repo.save(observation);
  }

  async findAllByPatient(
    patientId: number,
    clinicId: number,
  ): Promise<ToothObservation[]> {
    return this.repo.find({
      where: { patientId, clinicId },
      order: { date: 'DESC' },
    });
  }

  async remove(id: number, clinicId: number): Promise<void> {
    const result = await this.repo.delete({ id, clinicId });
    if (result.affected === 0) {
      throw new NotFoundException(`ToothObservation with ID ${id} not found`);
    }
  }
}

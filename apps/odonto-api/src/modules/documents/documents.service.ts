import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import {
    CreatePatientDocumentDto,
    UpdatePatientDocumentDto,
} from './dto/patient-document.dto';
import { PatientDocument } from './entities/patient-document.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(PatientDocument)
    private documentRepository: Repository<PatientDocument>,
  ) {}

  async create(
    createDto: CreatePatientDocumentDto,
    clinicId: number,
  ): Promise<PatientDocument> {
    const document = this.documentRepository.create({
      ...createDto,
      clinicId,
    });
    return this.documentRepository.save(document);
  }

  async findAll(
    clinicId: number,
    patientId?: number,
    page = 1,
    limit = 50,
  ): Promise<PaginatedResponseDto<PatientDocument>> {
    const where: FindOptionsWhere<PatientDocument> = { clinicId };
    if (patientId) {
      where.patientId = patientId;
    }
    const [data, total] = await this.documentRepository.findAndCount({
      where,
      relations: ['patient', 'dentist'],
      order: { date: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findOne(id: number, clinicId: number): Promise<PatientDocument> {
    const document = await this.documentRepository.findOne({
      where: { id, clinicId },
      relations: ['patient', 'dentist'],
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    return document;
  }

  async update(
    id: number,
    updateDto: UpdatePatientDocumentDto,
    clinicId: number,
  ): Promise<PatientDocument> {
    const document = await this.findOne(id, clinicId);
    Object.assign(document, updateDto);
    return this.documentRepository.save(document);
  }

  async remove(id: number, clinicId: number): Promise<void> {
    await this.findOne(id, clinicId);
    await this.documentRepository.softDelete({ id, clinicId });
  }
}

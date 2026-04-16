import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto, UpdatePatientDto } from './dto/patient.dto';
import { AnamnesisService } from './services/anamnesis.service';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    private anamnesisService: AnamnesisService,
  ) {}

  async create(
    createPatientDto: CreatePatientDto,
    clinicId: number,
  ): Promise<Patient> {
    const patient = this.patientsRepository.create({
      ...createPatientDto,
      clinicId,
    });
    return this.patientsRepository.save(patient);
  }

  async findAll(
    clinicId: number,
    page = 1,
    limit = 50,
  ): Promise<PaginatedResponseDto<any>> {
    const offset = (page - 1) * limit;
    const countQuery = `
            SELECT COUNT(*) AS total
            FROM patients p
            WHERE p.clinic_id = $1 AND p.deleted_at IS NULL
        `;
    const dataQuery = `
            SELECT
                p.id, p.name, p.birth_date AS "birthDate", p.email, p.phone, p.address, p.document, p.clinic_id AS "clinicId", p.created_at AS "createdAt", p.updated_at AS "updatedAt",
                MAX(pr.date) AS "lastProcedureDate",
                MIN(CASE WHEN a.date >= CURRENT_DATE AND a.status NOT IN ('CANCELLED', 'ABSENT') THEN a.date END) AS "nextAppointmentDate"
            FROM patients p
            LEFT JOIN procedures pr ON pr.patient_id = p.id AND pr.clinic_id = $1
            LEFT JOIN appointments a ON a.patient_id = p.id AND a.clinic_id = $1
            WHERE p.clinic_id = $1 AND p.deleted_at IS NULL
            GROUP BY p.id
            ORDER BY p.name ASC
            LIMIT $2 OFFSET $3;
        `;
    const [countResult, data] = await Promise.all([
      this.patientsRepository.query(countQuery, [clinicId]),
      this.patientsRepository.query(dataQuery, [clinicId, limit, offset]),
    ]);
    const total = parseInt(countResult[0]?.total ?? '0', 10);
    return { data, total, page, limit };
  }

  async findOne(id: number, clinicId: number): Promise<any> {
    const patient = await this.patientsRepository.findOne({
      where: { id, clinicId },
    });
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    const alerts = await this.anamnesisService.getActiveAlerts(id, clinicId);
    return { ...patient, alerts };
  }

  async update(
    id: number,
    updatePatientDto: UpdatePatientDto,
    clinicId: number,
  ): Promise<Patient> {
    const patient = await this.findOne(id, clinicId);
    this.patientsRepository.merge(patient, updatePatientDto);
    return this.patientsRepository.save(patient);
  }

  async remove(id: number, clinicId: number): Promise<void> {
    const patient = await this.findOne(id, clinicId);
    await this.patientsRepository.softRemove(patient);
  }
}

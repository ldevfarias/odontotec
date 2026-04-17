import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Anamnesis } from '../entities/anamnesis.entity';
import { CreateAnamnesisDto } from '../dto/create-anamnesis.dto';
import { UpdateAnamnesisDto } from '../dto/update-anamnesis.dto';
import { ANAMNESIS_TEMPLATE } from '../constants/anamnesis-template.constant';

@Injectable()
export class AnamnesisService {
  constructor(
    @InjectRepository(Anamnesis)
    private anamnesisRepository: Repository<Anamnesis>,
  ) {}

  async create(
    createAnamnesisDto: CreateAnamnesisDto,
    clinicId: number,
  ): Promise<Anamnesis> {
    const anamnesis = this.anamnesisRepository.create({
      complaint: createAnamnesisDto.complaint,
      data: createAnamnesisDto.data as unknown as Record<string, unknown>,
      patientId: createAnamnesisDto.patientId,
      clinicId,
    });
    return this.anamnesisRepository.save(anamnesis);
  }

  async findAllByPatient(patientId: number, clinicId: number): Promise<any[]> {
    const records = await this.anamnesisRepository.find({
      where: { patientId, clinicId },
      order: { createdAt: 'DESC' },
    });

    return records.map((record) => ({
      ...record,
      alerts: this.calculateAlerts(record),
    }));
  }

  async findOne(id: number, clinicId: number): Promise<any> {
    const anamnesis = await this.anamnesisRepository.findOne({
      where: { id, clinicId },
    });
    if (!anamnesis) {
      throw new NotFoundException(`Anamnesis with ID ${id} not found`);
    }
    return {
      ...anamnesis,
      alerts: this.calculateAlerts(anamnesis),
    };
  }

  async update(
    id: number,
    updateAnamnesisDto: UpdateAnamnesisDto,
    clinicId: number,
  ): Promise<any> {
    const anamnesis = await this.anamnesisRepository.findOne({
      where: { id, clinicId },
    });
    if (!anamnesis) {
      throw new NotFoundException(`Anamnesis with ID ${id} not found`);
    }
    Object.assign(anamnesis, updateAnamnesisDto);
    const saved = await this.anamnesisRepository.save(anamnesis);
    return {
      ...saved,
      alerts: this.calculateAlerts(saved),
    };
  }

  async remove(id: number, clinicId: number): Promise<void> {
    const result = await this.anamnesisRepository.delete({ id, clinicId });
    if (result.affected === 0) {
      throw new NotFoundException(`Anamnesis with ID ${id} not found`);
    }
  }

  async getActiveAlerts(
    patientId: number,
    clinicId: number,
  ): Promise<{ questionId: string; label: string }[]> {
    const latestAnamnesis = await this.anamnesisRepository.findOne({
      where: { patientId, clinicId },
      order: { createdAt: 'DESC' },
    });

    if (!latestAnamnesis) {
      return [];
    }

    return this.calculateAlerts(latestAnamnesis);
  }

  private calculateAlerts(
    anamnesis: Anamnesis,
  ): { questionId: string; label: string }[] {
    if (!anamnesis || !anamnesis.data || !anamnesis.data.answers) {
      return [];
    }

    const alerts: { questionId: string; label: string }[] = [];
    const answers = anamnesis.data.answers as any[];

    for (const answer of answers) {
      const questionTemplate = ANAMNESIS_TEMPLATE.find(
        (q) => q.id === answer.questionId,
      );
      if (questionTemplate && questionTemplate.alertIfValue !== undefined) {
        let isAlert = false;
        if (typeof questionTemplate.alertIfValue === 'function') {
          isAlert = questionTemplate.alertIfValue(answer.value);
        } else {
          isAlert = answer.value === questionTemplate.alertIfValue;
        }

        if (isAlert) {
          if (
            answer.questionId === 'allergies' &&
            Array.isArray(answer.value)
          ) {
            answer.value.forEach((v: string) =>
              alerts.push({
                questionId: answer.questionId,
                label: `Alergia: ${v}`,
              }),
            );
          } else {
            alerts.push({
              questionId: answer.questionId,
              label: questionTemplate.alertLabel || questionTemplate.label,
            });
          }
        }
      }
    }

    return alerts;
  }
}

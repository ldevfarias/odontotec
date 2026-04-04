import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { TreatmentPlan } from './entities/treatment-plan.entity';
import { TreatmentPlanItem } from './entities/treatment-plan-item.entity';
import { CreateTreatmentPlanDto, UpdateTreatmentPlanDto } from './dto/treatment-plan.dto';
import { Payment, PaymentStatus } from '../patients/entities/payment.entity';
import { TreatmentPlanStatus } from './enums/status.enum';

@Injectable()
export class TreatmentPlansService {
    constructor(
        @InjectRepository(TreatmentPlan)
        private treatmentPlanRepository: Repository<TreatmentPlan>,
        @InjectRepository(TreatmentPlanItem)
        private treatmentPlanItemRepository: Repository<TreatmentPlanItem>,
        @InjectRepository(Payment)
        private paymentRepository: Repository<Payment>,
    ) { }

    async create(createDto: CreateTreatmentPlanDto, clinicId: number): Promise<TreatmentPlan> {
        const totalAmount = (createDto.items || [])
            .filter(item => item.status !== 'CANCELLED' && item.status !== 'CANCELED')
            .reduce((sum, item) => sum + Number(item.value), 0);

        const treatmentPlan = this.treatmentPlanRepository.create({
            ...createDto,
            totalAmount,
            clinicId,
            items: createDto.items as any[],
        });

        return this.treatmentPlanRepository.save(treatmentPlan);
    }

    async findAll(clinicId: number, page = 1, limit = 50): Promise<PaginatedResponseDto<TreatmentPlan>> {
        const [data, total] = await this.treatmentPlanRepository.findAndCount({
            where: { clinicId },
            relations: ['items', 'patient', 'dentist', 'payments'],
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total, page, limit };
    }

    async findByPeriod(startDate: Date, endDate: Date, clinicId: number): Promise<TreatmentPlan[]> {
        return this.treatmentPlanRepository.createQueryBuilder('plan')
            .where('plan.clinicId = :clinicId', { clinicId })
            .andWhere('plan.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
            .getMany();
    }

    async findOne(id: number, clinicId: number): Promise<TreatmentPlan> {
        const plan = await this.treatmentPlanRepository.findOne({
            where: { id, clinicId },
            relations: ['items', 'patient', 'dentist', 'payments'],
        });

        if (!plan) {
            throw new NotFoundException(`Treatment Plan with ID ${id} not found`);
        }

        return plan;
    }


    async update(id: number, updateDto: UpdateTreatmentPlanDto, clinicId: number): Promise<TreatmentPlan> {
        const plan = await this.findOne(id, clinicId);

        if (updateDto.items) {
            plan.totalAmount = updateDto.items
                .filter(item => item.status !== 'CANCELLED' && item.status !== 'CANCELED')
                .reduce((sum, item) => sum + Number(item.value), 0);

            // Manual Orphan Removal
            const currentItemIds = plan.items.map(i => i.id);
            const newItemIds = updateDto.items
                .filter(i => i.id)
                .map(i => i.id);

            const itemsToRemove = currentItemIds.filter(id => !newItemIds.includes(id));

            if (itemsToRemove.length > 0) {
                await this.treatmentPlanItemRepository.delete(itemsToRemove);
            }
        }

        Object.assign(plan, updateDto);
        return this.treatmentPlanRepository.save(plan);
    }

    async remove(id: number, clinicId: number): Promise<void> {
        const plan = await this.findOne(id, clinicId);
        await this.treatmentPlanRepository.remove(plan);
    }
}

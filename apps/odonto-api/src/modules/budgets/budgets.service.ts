import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget, BudgetStatus } from './entities/budget.entity';
import { BudgetItem } from './entities/budget-item.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { ClinicProcedure } from '../clinic-procedures/entities/clinic-procedure.entity';

@Injectable()
export class BudgetsService {
    constructor(
        @InjectRepository(Budget)
        private budgetsRepository: Repository<Budget>,
        @InjectRepository(ClinicProcedure)
        private clinicProceduresRepository: Repository<ClinicProcedure>,
    ) { }

    async create(clinicId: number, createBudgetDto: CreateBudgetDto) {
        let total = 0;
        const budgetItems: BudgetItem[] = [];

        for (const itemDto of createBudgetDto.items) {
            const procedure = await this.clinicProceduresRepository.findOne({
                where: { id: itemDto.clinicProcedureId, clinicId },
            });

            if (!procedure) {
                throw new NotFoundException(`Clinic procedure with ID ${itemDto.clinicProcedureId} not found`);
            }

            const unitPrice = procedure.baseValue;
            const subtotal = unitPrice * itemDto.quantity;
            total += subtotal;

            const item = new BudgetItem();
            item.clinicProcedureId = procedure.id;
            item.quantity = itemDto.quantity;
            item.unitPrice = unitPrice;
            item.subtotal = subtotal;

            budgetItems.push(item);
        }

        const budget = this.budgetsRepository.create({
            clinicId,
            patientId: createBudgetDto.patientId,
            notes: createBudgetDto.notes,
            total,
            items: budgetItems,
        });

        return this.budgetsRepository.save(budget);
    }

    findAllByPatient(clinicId: number, patientId: number) {
        return this.budgetsRepository.find({
            where: { clinicId, patientId },
            order: { createdAt: 'DESC' },
            relations: ['items', 'items.clinicProcedure'],
        });
    }

    async findOne(id: number, clinicId: number) {
        const budget = await this.budgetsRepository.findOne({
            where: { id, clinicId },
            relations: ['items', 'items.clinicProcedure'],
        });

        if (!budget) {
            throw new NotFoundException(`Budget with ID ${id} not found`);
        }

        return budget;
    }

    async update(id: number, clinicId: number, updateBudgetDto: UpdateBudgetDto) {
        const budget = await this.findOne(id, clinicId);

        if (updateBudgetDto.status && updateBudgetDto.status !== budget.status) {
            // Business rule: Can't change status once it's something final, or maybe just simple update.
            budget.status = updateBudgetDto.status;
        }

        if (updateBudgetDto.notes !== undefined) {
            budget.notes = updateBudgetDto.notes;
        }

        return this.budgetsRepository.save(budget);
    }

    async remove(id: number, clinicId: number) {
        const budget = await this.findOne(id, clinicId);

        if (budget.status === BudgetStatus.APPROVED) {
            throw new BadRequestException('Cannot delete an approved budget');
        }

        return this.budgetsRepository.softRemove(budget);
    }
}

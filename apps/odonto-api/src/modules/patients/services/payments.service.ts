import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Payment)
        private paymentsRepository: Repository<Payment>,
    ) { }

    async create(createPaymentDto: CreatePaymentDto, clinicId: number): Promise<Payment> {
        const payment = this.paymentsRepository.create({
            ...createPaymentDto,
            clinicId,
        });
        return this.paymentsRepository.save(payment);
    }

    async findAllByPatient(patientId: number, clinicId: number): Promise<Payment[]> {
        return this.paymentsRepository.find({
            where: { patientId, clinicId },
            order: { date: 'DESC' },
        });
    }

    async findByPeriod(startDate: Date, endDate: Date, clinicId: number): Promise<Payment[]> {
        return this.paymentsRepository.createQueryBuilder('payment')
            .where('payment.clinicId = :clinicId', { clinicId })
            .andWhere('payment.date BETWEEN :startDate AND :endDate', { startDate, endDate })
            .getMany();
    }

    async findOne(id: number, clinicId: number): Promise<Payment> {
        const payment = await this.paymentsRepository.findOne({
            where: { id, clinicId },
        });
        if (!payment) {
            throw new NotFoundException(`Payment with ID ${id} not found`);
        }
        return payment;
    }

    async update(id: number, updatePaymentDto: UpdatePaymentDto, clinicId: number): Promise<Payment> {
        const payment = await this.findOne(id, clinicId);
        Object.assign(payment, updatePaymentDto);
        return this.paymentsRepository.save(payment);
    }

    async remove(id: number, clinicId: number): Promise<void> {
        const result = await this.paymentsRepository.delete({ id, clinicId });
        if (result.affected === 0) {
            throw new NotFoundException(`Payment with ID ${id} not found`);
        }
    }
}

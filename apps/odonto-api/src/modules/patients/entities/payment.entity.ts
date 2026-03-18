import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';
import { Clinic } from '../../clinics/entities/clinic.entity';
import { TreatmentPlan } from '../../treatment-plans/entities/treatment-plan.entity';

export enum PaymentMethod {
    CASH = 'CASH',
    CREDIT_CARD = 'CREDIT_CARD',
    DEBIT_CARD = 'DEBIT_CARD',
    PIX = 'PIX',
    INSURANCE = 'INSURANCE',
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    CANCELED = 'CANCELED',
    CANCELLED = 'CANCELLED',
}

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({
        type: 'enum',
        enum: PaymentMethod,
    })
    method: PaymentMethod;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    })
    status: PaymentStatus;

    @Column({ type: 'timestamp' })
    date: Date;

    @Column({ name: 'patient_id' })
    patientId: number;

    @ManyToOne(() => Patient, (patient) => patient.payments)
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @Column({ name: 'clinic_id' })
    clinicId: number;

    @ManyToOne(() => Clinic)
    @JoinColumn({ name: 'clinic_id' })
    clinic: Clinic;

    @Column({ name: 'treatment_plan_id', nullable: true })
    treatmentPlanId: number;

    @ManyToOne(() => TreatmentPlan, (plan) => plan.id, { nullable: true })
    @JoinColumn({ name: 'treatment_plan_id' })
    treatmentPlan: TreatmentPlan;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

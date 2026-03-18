import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Budget } from './budget.entity';
import { ClinicProcedure } from '../../clinic-procedures/entities/clinic-procedure.entity';

@Entity('budget_items')
export class BudgetItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'budget_id' })
    budgetId: number;

    @ManyToOne(() => Budget, budget => budget.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'budget_id' })
    budget: Budget;

    @Column({ name: 'clinic_procedure_id' })
    clinicProcedureId: number;

    @ManyToOne(() => ClinicProcedure)
    @JoinColumn({ name: 'clinic_procedure_id' })
    clinicProcedure: ClinicProcedure;

    @Column({ type: 'int', default: 1 })
    quantity: number;

    @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
    unitPrice: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    subtotal: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

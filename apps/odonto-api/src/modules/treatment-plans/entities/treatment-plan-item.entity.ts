import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TreatmentPlan } from './treatment-plan.entity';
import { TreatmentPlanItemStatus } from '../enums/status.enum';

@Entity('treatment_plan_items')
export class TreatmentPlanItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column({ nullable: true })
  toothNumber: number;

  @Column({ nullable: true })
  surface: string;

  @Column({
    type: 'enum',
    enum: TreatmentPlanItemStatus,
    default: TreatmentPlanItemStatus.PLANNED,
  })
  status: TreatmentPlanItemStatus;

  @Column({ name: 'treatment_plan_id' })
  treatmentPlanId: number;

  @ManyToOne(() => TreatmentPlan, (plan) => plan.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'treatment_plan_id' })
  treatmentPlan: TreatmentPlan;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Clinic } from '../../clinics/entities/clinic.entity';
import { User } from '../../users/entities/user.entity';
import { Patient } from '../../patients/entities/patient.entity';

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  ABSENT = 'ABSENT',
}

@Entity('appointments')
@Unique(['clinicId', 'dentistId', 'date'])
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamptz' })
  date: Date;

  @Column({ default: 30 }) // Duration in minutes
  duration: number;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.SCHEDULED,
  })
  status: AppointmentStatus;

  @Column({
    type: 'enum',
    enum: ['PATIENT', 'CLINIC'],
    name: 'cancelled_by',
    nullable: true,
  })
  cancelledBy: 'PATIENT' | 'CLINIC' | null;

  @Column({ name: 'cancellation_reason', nullable: true, type: 'text' })
  cancellationReason: string | null;

  @Column({ name: 'clinic_id' })
  clinicId: number;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic | null;

  @Column({ name: 'dentist_id' })
  dentistId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'dentist_id' })
  dentist: User;

  @Column({ name: 'patient_id' })
  patientId: number;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

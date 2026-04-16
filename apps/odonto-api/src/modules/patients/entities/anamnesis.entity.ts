import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from './patient.entity';
import { Clinic } from '../../clinics/entities/clinic.entity';

@Entity('anamnesis')
export class Anamnesis {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  complaint: string; // Main complaint

  @Column('jsonb', { nullable: true })
  data: Record<string, any>; // Flexible data (history, medications, allergies, etc.)

  @Column({ name: 'patient_id' })
  patientId: number;

  @ManyToOne(() => Patient, (patient) => patient.anamnesis)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ name: 'clinic_id' })
  clinicId: number;

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

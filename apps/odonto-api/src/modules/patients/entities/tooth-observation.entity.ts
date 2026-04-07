import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, UpdateDateColumn,
    ManyToOne, JoinColumn,
} from 'typeorm';
import { Patient } from './patient.entity';
import { Clinic } from '../../clinics/entities/clinic.entity';

@Entity('tooth_observations')
export class ToothObservation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'tooth_number' })
    toothNumber: string;

    @Column({ name: 'tooth_faces', nullable: true })
    toothFaces: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'timestamp' })
    date: Date;

    @Column({ name: 'patient_id' })
    patientId: number;

    @ManyToOne(() => Patient, (patient) => patient.id)
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

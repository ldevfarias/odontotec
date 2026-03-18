import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';
import { Clinic } from '../../clinics/entities/clinic.entity';

@Entity('procedures')
export class Procedure {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    type: string;

    @Column({ type: 'timestamp' })
    date: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    cost: number;

    @Column({ name: 'tooth_number', nullable: true })
    toothNumber: string;

    @Column({ name: 'tooth_faces', nullable: true })
    toothFaces: string;

    @Column({ name: 'patient_id' })
    patientId: number;

    @ManyToOne(() => Patient, (patient) => patient.procedures)
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

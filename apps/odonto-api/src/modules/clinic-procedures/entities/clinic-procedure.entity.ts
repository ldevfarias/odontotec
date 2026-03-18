import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Clinic } from '../../clinics/entities/clinic.entity';

@Entity('clinic_procedures')
export class ClinicProcedure {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    category: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    baseValue: number;

    @Column({
        type: 'varchar',
        name: 'selection_mode',
        default: 'FACE',
        comment: 'Selection mode for the odontogram: FACE (individual faces), TOOTH (whole tooth), GENERAL (no specific selection)'
    })
    selectionMode: string;

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

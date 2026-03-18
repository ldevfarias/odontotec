import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, JoinColumn, ManyToOne } from 'typeorm';
import { Clinic } from '../../clinics/entities/clinic.entity';

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    message: string;

    @Column({ default: 'INFO' }) // INFO, WARNING, SUCCESS, ERROR
    type: string;

    @Column({ default: false })
    read: boolean;

    @Column({ name: 'clinic_id' })
    clinicId: number;

    @Column({ name: 'user_id', nullable: true })
    userId: number;

    @ManyToOne(() => Clinic)
    @JoinColumn({ name: 'clinic_id' })
    clinic: Clinic;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}

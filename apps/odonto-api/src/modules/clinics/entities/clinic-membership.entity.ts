import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Clinic } from '../entities/clinic.entity';
import { ClinicRole } from '../enums/clinic-role.enum';

@Entity('clinic_memberships')
@Unique(['userId', 'clinicId'])
export class ClinicMembership {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_id' })
    userId: number;

    @Column({ name: 'clinic_id' })
    clinicId: number;

    @Column({
        type: 'enum',
        enum: ClinicRole,
        default: ClinicRole.RECEPTIONIST,
    })
    role: ClinicRole;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ name: 'avatar_url', type: 'varchar', nullable: true, default: null })
    avatarUrl: string | null;

    @ManyToOne(() => User, (user) => user.memberships, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Clinic, (clinic) => clinic.memberships, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'clinic_id' })
    clinic: Clinic;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ClinicMembership } from './clinic-membership.entity';

@Entity('clinics')
export class Clinic {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ name: 'logo_url', nullable: true })
    logoUrl: string;

    @Column({ nullable: true })
    email: string;

    @Column({ default: 'FREE' })
    plan: 'FREE' | 'PRO';

    @Column({ default: 'TRIAL' })
    subscriptionStatus: 'TRIAL' | 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'past_due';

    @Column({ type: 'timestamp', nullable: true })
    trialEndsAt: Date | null;

    @Column({ name: 'current_period_end', type: 'timestamp', nullable: true })
    currentPeriodEnd: Date | null;

    @Column({ name: 'cancel_at_period_end', default: false })
    cancelAtPeriodEnd: boolean;

    @Column({ name: 'stripe_customer_id', nullable: true })
    stripeCustomerId: string;

    @Column({ name: 'stripe_subscription_id', nullable: true })
    stripeSubscriptionId: string;

    @Column({ name: 'owner_id', nullable: true })
    ownerId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'owner_id' })
    owner: User;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => ClinicMembership, (membership) => membership.clinic)
    memberships: ClinicMembership[];
}

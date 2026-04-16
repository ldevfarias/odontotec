import { Entity, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('processed_stripe_events')
export class ProcessedStripeEvent {
  @PrimaryColumn()
  id: string;

  @CreateDateColumn({ name: 'processed_at' })
  processedAt: Date;
}

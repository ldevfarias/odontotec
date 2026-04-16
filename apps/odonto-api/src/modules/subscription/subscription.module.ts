import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { StripeWebhookController } from './stripe.webhook.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clinic } from '../clinics/entities/clinic.entity';
import { ProcessedStripeEvent } from './entities/processed-stripe-event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Clinic, ProcessedStripeEvent])],
  controllers: [SubscriptionController, StripeWebhookController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}

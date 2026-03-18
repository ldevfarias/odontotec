import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { StripeWebhookController } from './stripe.webhook.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clinic } from '../clinics/entities/clinic.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Clinic])],
    controllers: [SubscriptionController, StripeWebhookController],
    providers: [SubscriptionService],
    exports: [SubscriptionService],
})
export class SubscriptionModule { }

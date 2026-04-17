import {
    BadRequestException,
    Controller,
    Headers,
    Post,
    Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import type { Request } from 'express';
import Stripe from 'stripe';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Clinic } from '../clinics/entities/clinic.entity';
import { EmailService } from '../email/email.service';
import { ProcessedStripeEvent } from './entities/processed-stripe-event.entity';

@Controller('webhooks/stripe')
export class StripeWebhookController {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Clinic)
    private clinicRepository: Repository<Clinic>,
    private emailService: EmailService,
    private dataSource: DataSource,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY')!,
      {
        apiVersion: '2025-01-27.acacia' as any,
      },
    );
  }

  @Post()
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: Request,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    let event: Stripe.Event;

    try {
      const rawBody = req['rawBody'];
      if (!rawBody) {
        throw new BadRequestException('Raw body not available');
      }

      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.configService.get<string>('STRIPE_WEBHOOK_SECRET')!,
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    console.log(`Received event: ${event.type} [${event.id}]`);

    // Global Transaction for Idempotency
    return await this.dataSource.transaction(async (manager) => {
      const processedEventRepo = manager.getRepository(ProcessedStripeEvent);

      // Check if already processed
      const alreadyProcessed = await processedEventRepo.findOne({
        where: { id: event.id },
        lock: { mode: 'pessimistic_write' },
      });

      if (alreadyProcessed) {
        console.log(`Event ${event.id} already processed, skipping.`);
        return { received: true, alreadyProcessed: true };
      }

      // Route events
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(
            event.data.object as Stripe.Checkout.Session,
            manager,
          );
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(
            event.data.object as Stripe.Invoice,
            manager,
          );
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(
            event.data.object as Stripe.Invoice,
            manager,
          );
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(
            event.data.object as Stripe.Subscription,
            manager,
          );
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(
            event.data.object as Stripe.Subscription,
            manager,
          );
          break;
        default:
        // Just log it
      }

      // Save processed event
      await processedEventRepo.save({ id: event.id });

      return { received: true };
    });
  }

  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
    manager: EntityManager,
  ) {
    const clinicId = session.metadata?.clinicId;
    if (!clinicId) {
      console.error(
        '[Webhook] checkout.session.completed missing clinicId in metadata',
        { sessionId: session.id },
      );
      return;
    }

    const subscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id;
    if (!subscriptionId) {
      console.warn(
        '[Webhook] checkout.session.completed has no subscription ID yet',
        { sessionId: session.id, clinicId },
      );
      return;
    }

    const clinicRepo = manager.getRepository(Clinic);
    const clinic = await clinicRepo.findOne({
      where: { id: Number(clinicId) },
      relations: { owner: true },
      lock: { mode: 'pessimistic_write' },
    });

    if (!clinic) {
      console.error(
        `[Webhook] Clinic ${clinicId} not found for checkout.session.completed`,
      );
      return;
    }

    if (clinic.stripeSubscriptionId !== subscriptionId) {
      clinic.stripeSubscriptionId = subscriptionId;
      clinic.stripeCustomerId =
        typeof session.customer === 'string'
          ? session.customer
          : (session.customer?.id as string);
      clinic.subscriptionStatus = 'ACTIVE';
      clinic.plan = 'PRO';
      await clinicRepo.save(clinic);
      console.log(
        `[Webhook] Clinic ${clinicId} upgraded to PRO via checkout.session.completed`,
      );
      if (clinic.owner?.email) {
        await this.emailService.sendSubscriptionProActivatedEmail(
          clinic.owner.email,
          clinic.owner.name,
          clinic.name,
        );
      }
    }
  }

  private async handleInvoicePaymentSucceeded(
    invoice: Stripe.Invoice,
    manager: EntityManager,
  ) {
    const subscriptionId =
      typeof (invoice as any).subscription === 'string'
        ? (invoice as any).subscription
        : (invoice as any).subscription?.id;
    if (!subscriptionId) return;

    const clinicRepo = manager.getRepository(Clinic);
    const clinic = await clinicRepo.findOne({
      where: { stripeSubscriptionId: subscriptionId },
      lock: { mode: 'pessimistic_write' },
    });

    if (clinic) {
      let changed = false;
      if (clinic.subscriptionStatus !== 'ACTIVE') {
        clinic.subscriptionStatus = 'ACTIVE';
        changed = true;
      }

      if (clinic.trialEndsAt !== null) {
        clinic.trialEndsAt = null;
        changed = true;
      }

      if (clinic.cancelAtPeriodEnd !== false) {
        clinic.cancelAtPeriodEnd = false;
        changed = true;
      }

      if (changed) {
        await clinicRepo.save(clinic);
      }
    }
  }

  private async handleInvoicePaymentFailed(
    invoice: Stripe.Invoice,
    manager: EntityManager,
  ) {
    const subscriptionId =
      typeof (invoice as any).subscription === 'string'
        ? (invoice as any).subscription
        : (invoice as any).subscription?.id;
    if (!subscriptionId) return;

    // No action needed for now, just logging or placeholder for later
  }

  private async handleSubscriptionUpdated(
    subscription: Stripe.Subscription,
    manager: EntityManager,
  ) {
    const clinicRepo = manager.getRepository(Clinic);
    const clinic = await clinicRepo.findOne({
      where: { stripeSubscriptionId: subscription.id },
      relations: { owner: true },
      lock: { mode: 'pessimistic_write' },
    });

    if (clinic) {
      const previousCancelAtPeriodEnd = clinic.cancelAtPeriodEnd;
      let newStatus = clinic.subscriptionStatus;

      if (subscription.status === 'active') newStatus = 'ACTIVE';
      else if (subscription.status === 'trialing') newStatus = 'ACTIVE';
      else if (subscription.status === 'past_due') newStatus = 'past_due';
      else if (
        subscription.status === 'canceled' ||
        subscription.status === 'unpaid'
      )
        newStatus = 'CANCELED';

      const periodEnd = (subscription as any).current_period_end;
      const newCurrentPeriodEnd = periodEnd
        ? new Date(periodEnd * 1000)
        : clinic.currentPeriodEnd;
      const newCancelAtPeriodEnd = subscription.cancel_at_period_end;

      if (
        clinic.subscriptionStatus !== newStatus ||
        clinic.currentPeriodEnd?.getTime() !== newCurrentPeriodEnd?.getTime() ||
        clinic.cancelAtPeriodEnd !== newCancelAtPeriodEnd
      ) {
        clinic.subscriptionStatus = newStatus;
        clinic.currentPeriodEnd = newCurrentPeriodEnd;
        clinic.cancelAtPeriodEnd = newCancelAtPeriodEnd;
        if (newStatus === 'CANCELED') {
          clinic.plan = 'FREE';
        }
        await clinicRepo.save(clinic);
        console.log(
          `[Webhook] Subscription updated for clinic ${clinic.id}: status → ${newStatus}, cancelAtPeriodEnd → ${newCancelAtPeriodEnd}`,
        );
        if (!previousCancelAtPeriodEnd && newCancelAtPeriodEnd) {
          if (clinic.owner?.email && newCurrentPeriodEnd) {
            await this.emailService.sendSubscriptionCancelScheduledEmail(
              clinic.owner.email,
              clinic.owner.name,
              clinic.name,
              newCurrentPeriodEnd,
            );
          }
        }
      }
    }
  }

  private async handleSubscriptionDeleted(
    subscription: Stripe.Subscription,
    manager: EntityManager,
  ) {
    const clinicRepo = manager.getRepository(Clinic);
    const clinic = await clinicRepo.findOne({
      where: { stripeSubscriptionId: subscription.id },
      relations: { owner: true },
      lock: { mode: 'pessimistic_write' },
    });

    if (clinic && clinic.subscriptionStatus !== 'CANCELED') {
      clinic.subscriptionStatus = 'CANCELED';
      clinic.plan = 'FREE';
      clinic.cancelAtPeriodEnd = false;
      await clinicRepo.save(clinic);
      console.log(
        `[Webhook] Subscription deleted for clinic ${clinic.id}: status → CANCELED`,
      );
      if (clinic.owner?.email) {
        await this.emailService.sendSubscriptionCancelledEmail(
          clinic.owner.email,
          clinic.owner.name,
          clinic.name,
        );
      }
    }
  }
}

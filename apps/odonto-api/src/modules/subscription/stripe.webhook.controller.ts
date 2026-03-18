import { Controller, Post, Headers, Req, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clinic } from '../clinics/entities/clinic.entity';
import Stripe from 'stripe';
import type { Request } from 'express';
import { EmailService } from '../email/email.service';

@Controller('webhooks/stripe')
export class StripeWebhookController {
    private stripe: Stripe;

    constructor(
        private configService: ConfigService,
        @InjectRepository(Clinic)
        private clinicRepository: Repository<Clinic>,
        private emailService: EmailService,
    ) {
        this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY')!, {
            apiVersion: '2025-01-27.acacia' as any,
        });
    }

    @Post()
    async handleWebhook(@Headers('stripe-signature') signature: string, @Req() req: Request) {
        if (!signature) {
            throw new BadRequestException('Missing stripe-signature header');
        }

        let event: Stripe.Event;

        try {
            // Access rawBody directly to avoid NestJS JSON parsing destruction without TypeScript complaining
            const rawBody = req['rawBody'];
            if (!rawBody) {
                // Fallback or error if rawBody is not available.
                // NestJS by default parses JSON, destroying the signature verification.
                // We MUST enable raw body parsing for this route or globally.
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

        console.log(`Received event: ${event.type}`);

        switch (event.type) {
            case 'checkout.session.completed':
                await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
                break;
            case 'invoice.payment_succeeded':
                await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
                break;
            case 'invoice.payment_failed':
                await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
                break;
            case 'customer.subscription.deleted':
                await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
                break;
            case 'customer.subscription.updated':
                await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
                break;
            default:
            // console.log(`Unhandled event type ${event.type}`);
        }

        return { received: true };
    }

    private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
        const clinicId = session.metadata?.clinicId;
        if (!clinicId) {
            console.error('[Webhook] checkout.session.completed missing clinicId in metadata', { sessionId: session.id });
            return;
        }

        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
        if (!subscriptionId) {
            console.warn('[Webhook] checkout.session.completed has no subscription ID yet', { sessionId: session.id, clinicId });
            return;
        }

        const clinic = await this.clinicRepository.findOne({
            where: { id: Number(clinicId) },
            relations: { owner: true },
        });
        if (!clinic) {
            console.error(`[Webhook] Clinic ${clinicId} not found for checkout.session.completed`);
            return;
        }

        // Idempotency check: Save only if we haven't processed this subscription yet
        if (clinic.stripeSubscriptionId !== subscriptionId) {
            clinic.stripeSubscriptionId = subscriptionId;
            clinic.stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id as string;
            clinic.subscriptionStatus = 'ACTIVE';
            clinic.plan = 'PRO';
            await this.clinicRepository.save(clinic);
            console.log(`[Webhook] Clinic ${clinicId} upgraded to PRO via checkout.session.completed`);
            if (clinic.owner?.email) {
                await this.emailService.sendSubscriptionProActivatedEmail(
                    clinic.owner.email,
                    clinic.owner.name,
                    clinic.name,
                );
            }
        }
    }

    private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
        const subscriptionId = typeof (invoice as any).subscription === 'string' ? (invoice as any).subscription : (invoice as any).subscription?.id;
        if (!subscriptionId) return;

        const clinic = await this.clinicRepository.findOne({ where: { stripeSubscriptionId: subscriptionId } });

        if (clinic) {
            let changed = false;
            if (clinic.subscriptionStatus !== 'ACTIVE') {
                clinic.subscriptionStatus = 'ACTIVE';
                changed = true;
            }

            // Always clear trialEndsAt on any successful payment — handles race where
            // invoice.payment_succeeded arrives after checkout.session.completed already
            // set status to ACTIVE, leaving trialEndsAt non-null with a stale trial date.
            if (clinic.trialEndsAt !== null) {
                clinic.trialEndsAt = null;
                changed = true;
            }

            if (clinic.cancelAtPeriodEnd !== false) {
                clinic.cancelAtPeriodEnd = false;
                changed = true;
            }

            if (changed) {
                await this.clinicRepository.save(clinic);
            }
        }
    }

    private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
        const subscriptionId = typeof (invoice as any).subscription === 'string' ? (invoice as any).subscription : (invoice as any).subscription?.id;
        if (!subscriptionId) return;

        const clinic = await this.clinicRepository.findOne({ where: { stripeSubscriptionId: subscriptionId } });

        if (clinic) {
            // We don't block immediately. Status usually becomes 'past_due' in Stripe automatically.
            // We wait for subscription.updated to set 'past_due' in DB.
        }
    }

    private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
        const clinic = await this.clinicRepository.findOne({
            where: { stripeSubscriptionId: subscription.id },
            relations: { owner: true },
        });
        if (clinic) {
            const previousCancelAtPeriodEnd = clinic.cancelAtPeriodEnd;
            let newStatus = clinic.subscriptionStatus;

            // Map Stripe status to our status
            if (subscription.status === 'active') newStatus = 'ACTIVE';
            else if (subscription.status === 'trialing') newStatus = 'ACTIVE';
            else if (subscription.status === 'past_due') newStatus = 'past_due';
            else if (subscription.status === 'canceled' || subscription.status === 'unpaid') newStatus = 'CANCELED';

            const periodEnd = (subscription as any).current_period_end;
            const newCurrentPeriodEnd = periodEnd ? new Date(periodEnd * 1000) : clinic.currentPeriodEnd;
            const newCancelAtPeriodEnd = subscription.cancel_at_period_end;

            // Save only if state actually changed (idempotency improvement)
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
                await this.clinicRepository.save(clinic);
                console.log(`[Webhook] Subscription updated for clinic ${clinic.id}: status → ${newStatus}, cancelAtPeriodEnd → ${newCancelAtPeriodEnd}`);
                if (!previousCancelAtPeriodEnd && newCancelAtPeriodEnd) {
                    if (!newCurrentPeriodEnd) {
                        console.warn(`[Webhook] cancel-scheduled email suppressed for clinic ${clinic.id}: no currentPeriodEnd`);
                    } else if (clinic.owner?.email) {
                        await this.emailService.sendSubscriptionCancelScheduledEmail(
                            clinic.owner.email,
                            clinic.owner.name,
                            clinic.name,
                            newCurrentPeriodEnd,
                        );
                    } else {
                        console.warn(`[Webhook] cancel-scheduled email suppressed for clinic ${clinic.id}: no owner email`);
                    }
                }
            }
        }
    }

    private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
        const clinic = await this.clinicRepository.findOne({
            where: { stripeSubscriptionId: subscription.id },
            relations: { owner: true },
        });
        if (clinic && clinic.subscriptionStatus !== 'CANCELED') {
            clinic.subscriptionStatus = 'CANCELED';
            clinic.plan = 'FREE';
            clinic.cancelAtPeriodEnd = false;
            // Preserve currentPeriodEnd as-is — records when access expired (audit/UI)
            await this.clinicRepository.save(clinic);
            console.log(`[Webhook] Subscription deleted for clinic ${clinic.id}: status → CANCELED`);
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

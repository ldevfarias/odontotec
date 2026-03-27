import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clinic } from '../clinics/entities/clinic.entity';
import { User } from '../users/entities/user.entity';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SubscriptionService {
    private stripe: Stripe;

    constructor(
        @InjectRepository(Clinic)
        private clinicRepository: Repository<Clinic>,
        private configService: ConfigService,
    ) {
        this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY')!, {
            apiVersion: '2025-01-27.acacia' as any,
        });
    }

    async getStatus(user: User, clinicId: number) {
        const clinic = await this.clinicRepository.findOne({ where: { id: clinicId } });

        if (!clinic) {
            throw new NotFoundException('Clinic not found');
        }

        const now = new Date();
        const trialEnd = clinic.trialEndsAt || new Date(clinic.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);

        let status = clinic.subscriptionStatus;

        // Select the relevant date for daysRemaining based on status
        let referenceDate: Date;
        if (status === 'TRIAL' || status === 'EXPIRED') {
            referenceDate = trialEnd;
        } else {
            // ACTIVE, CANCELED, past_due: use currentPeriodEnd (paid period)
            referenceDate = clinic.currentPeriodEnd || trialEnd;
        }

        const diffTime = referenceDate.getTime() - now.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (status === 'TRIAL' && daysRemaining <= 0) {
            status = 'EXPIRED';
        }

        // Map Stripe status → internal status (shared by both sync paths)
        type SubscriptionStatus = typeof clinic.subscriptionStatus;
        const stripeStatusMap: Record<string, SubscriptionStatus> = {
            active: 'ACTIVE',
            trialing: 'ACTIVE',
            past_due: 'past_due',
            canceled: 'CANCELED',
            unpaid: 'CANCELED',
        };

        if (clinic.stripeSubscriptionId && status !== 'EXPIRED') {
            try {
                const subscription = await this.stripe.subscriptions.retrieve(clinic.stripeSubscriptionId);
                const syncedStatus = stripeStatusMap[subscription.status];

                // Only persist if status actually diverged (idempotent — avoids unnecessary writes)
                // Also sync new fields during reconciliation to cover missed webhooks
                if (syncedStatus && clinic.subscriptionStatus !== syncedStatus) {
                    console.log(
                        `[Subscription] Syncing status for clinic ${clinic.id}: ${clinic.subscriptionStatus} → ${syncedStatus}`,
                    );
                    clinic.subscriptionStatus = syncedStatus;
                    if ((subscription as any).current_period_end) {
                        clinic.currentPeriodEnd = new Date((subscription as any).current_period_end * 1000);
                    }
                    clinic.cancelAtPeriodEnd = subscription.cancel_at_period_end;
                    if (syncedStatus === 'CANCELED') {
                        clinic.plan = 'FREE';
                    }
                    await this.clinicRepository.save(clinic);
                    status = syncedStatus;
                }
            } catch (error) {
                // Fail-safe: Stripe unreachable → return current DB status, don't throw
                console.error('[Subscription] Error fetching Stripe subscription, using cached DB status:', error);
            }
        } else if (clinic.stripeCustomerId && !clinic.stripeSubscriptionId && clinic.plan !== 'PRO') {
            // Fallback: webhook may be delayed — query Stripe by customer to find the subscription
            try {
                const subscriptions = await this.stripe.subscriptions.list({
                    customer: clinic.stripeCustomerId,
                    limit: 1,
                });
                const sub = subscriptions.data[0];
                if (sub) {
                    const syncedStatus = stripeStatusMap[sub.status] ?? clinic.subscriptionStatus;
                    console.log(
                        `[Subscription] Fallback sync for clinic ${clinic.id}: linked subscription ${sub.id} (${sub.status})`,
                    );
                    clinic.stripeSubscriptionId = sub.id;
                    clinic.subscriptionStatus = syncedStatus;
                    clinic.plan = 'PRO';
                    await this.clinicRepository.save(clinic);
                    status = syncedStatus;
                }
            } catch (error) {
                console.error('[Subscription] Error in fallback subscription lookup by customer:', error);
            }
        }

        return {
            plan: clinic.plan,
            status,
            daysRemaining: Math.max(0, daysRemaining),
            trialEndsAt: trialEnd,
            currentPeriodEnd: clinic.currentPeriodEnd,
            isTrial: status === 'TRIAL',
            isExpired: status === 'EXPIRED',
            pastDue: status === 'past_due',
            cancelAtPeriodEnd: clinic.cancelAtPeriodEnd,
            cancelAt: clinic.cancelAtPeriodEnd ? clinic.currentPeriodEnd : null,
            stripeCustomerId: clinic.stripeCustomerId,
        };
    }

    async createCheckoutSession(user: User, clinicId: number, cancelUrl?: string) {
        const clinic = await this.clinicRepository.findOne({ where: { id: clinicId } });
        if (!clinic) throw new NotFoundException('Clinic not found');

        let customerId = clinic.stripeCustomerId;

        if (!customerId) {
            const customer = await this.stripe.customers.create({
                email: user.email,
                name: clinic.name,
                metadata: {
                    clinicId: clinic.id,
                },
            });
            customerId = customer.id;
            clinic.stripeCustomerId = customerId;
            await this.clinicRepository.save(clinic);
        }

        const activeSubscriptionsCount = await this.clinicRepository.count({
            where: {
                subscriptionStatus: 'ACTIVE'
            }
        });

        const priceId = this.configService.get<string>('STRIPE_PRICE_ID');

        if (!priceId) {
            throw new BadRequestException('Stripe Price IDs are not configured properly');
        }

        const session = await this.stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card', 'boleto'],
            payment_method_collection: 'if_required',
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            subscription_data: {
                // Align Stripe trial with OdontoTec's actual trial end — prevents double-counting.
                // If the trial has already expired, omit trial_end so billing starts immediately.
                ...((() => {
                    const clinicTrialEnd = clinic.trialEndsAt
                        ? new Date(clinic.trialEndsAt)
                        : new Date(clinic.createdAt.getTime() + 14 * 24 * 60 * 60 * 1000);
                    const remainingMs = clinicTrialEnd.getTime() - Date.now();
                    if (remainingMs > 0) {
                        return { trial_end: Math.floor(clinicTrialEnd.getTime() / 1000) };
                    }
                    return {};
                })()),
                metadata: {
                    clinicId: clinic.id.toString()
                }
            },
            metadata: {
                clinicId: clinic.id.toString()
            },
            success_url: `${this.configService.get('FRONTEND_URL')}/settings/billing?success=true`,
            cancel_url: cancelUrl ?? `${this.configService.get('FRONTEND_URL')}/settings/billing`,
        });

        return { url: session.url };
    }

    async createPortalSession(user: User, clinicId: number) {
        const clinic = await this.clinicRepository.findOne({ where: { id: clinicId } });
        if (!clinic || !clinic.stripeCustomerId) {
            throw new BadRequestException('No billing account found');
        }

        const session = await this.stripe.billingPortal.sessions.create({
            customer: clinic.stripeCustomerId,
            return_url: `${this.configService.get('FRONTEND_URL')}/settings/billing`,
        });

        return { url: session.url };
    }

    async upgrade(user: User) {
        throw new BadRequestException('Please use the checkout flow.');
    }
}

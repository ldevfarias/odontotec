import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StripeWebhookController } from './stripe.webhook.controller';
import { Clinic } from '../clinics/entities/clinic.entity';
import { EmailService } from '../email/email.service';

function makeClinic(overrides: Partial<Clinic> = {}): Clinic {
    return {
        id: 1,
        name: 'Clínica Sorriso',
        address: null,
        phone: null,
        logoUrl: null,
        email: null,
        plan: 'FREE',
        subscriptionStatus: 'TRIAL',
        trialEndsAt: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        ownerId: 10,
        owner: { id: 10, name: 'Dr. Ana', email: 'ana@example.com' } as any,
        createdAt: new Date(),
        updatedAt: new Date(),
        memberships: [],
        ...overrides,
    };
}

describe('StripeWebhookController — private handlers', () => {
    let controller: StripeWebhookController;
    let clinicRepository: { findOne: jest.Mock; save: jest.Mock };
    let emailService: {
        sendSubscriptionProActivatedEmail: jest.Mock;
        sendSubscriptionCancelScheduledEmail: jest.Mock;
        sendSubscriptionCancelledEmail: jest.Mock;
    };

    beforeEach(async () => {
        clinicRepository = {
            findOne: jest.fn(),
            save: jest.fn().mockImplementation(async (entity) => entity),
        };

        emailService = {
            sendSubscriptionProActivatedEmail: jest.fn().mockResolvedValue(true),
            sendSubscriptionCancelScheduledEmail: jest.fn().mockResolvedValue(true),
            sendSubscriptionCancelledEmail: jest.fn().mockResolvedValue(true),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [StripeWebhookController],
            providers: [
                {
                    provide: ConfigService,
                    useValue: { get: jest.fn().mockReturnValue('test-key') },
                },
                {
                    provide: getRepositoryToken(Clinic),
                    useValue: clinicRepository,
                },
                {
                    provide: EmailService,
                    useValue: emailService,
                },
            ],
        }).compile();

        controller = module.get<StripeWebhookController>(StripeWebhookController);
    });

    // ─── handleCheckoutSessionCompleted ────────────────────────────────────────

    describe('handleCheckoutSessionCompleted', () => {
        it('upgrades clinic to PRO when not yet processed', async () => {
            const clinic = makeClinic({ stripeSubscriptionId: 'old-sub' });
            clinicRepository.findOne.mockResolvedValue(clinic);

            const session = {
                metadata: { clinicId: '1' },
                subscription: 'sub_new123',
                customer: 'cus_abc',
            } as any;

            await (controller as any).handleCheckoutSessionCompleted(session);

            expect(clinicRepository.save).toHaveBeenCalledTimes(1);
            const saved: Clinic = clinicRepository.save.mock.calls[0][0];
            expect(saved.plan).toBe('PRO');
            expect(saved.subscriptionStatus).toBe('ACTIVE');
            expect(saved.stripeSubscriptionId).toBe('sub_new123');
            expect(saved.stripeCustomerId).toBe('cus_abc');
        });

        it('sends ProActivated email to owner after upgrade', async () => {
            const clinic = makeClinic({ stripeSubscriptionId: 'old-sub' });
            clinicRepository.findOne.mockResolvedValue(clinic);

            const session = {
                metadata: { clinicId: '1' },
                subscription: 'sub_new123',
                customer: 'cus_abc',
            } as any;

            await (controller as any).handleCheckoutSessionCompleted(session);

            expect(emailService.sendSubscriptionProActivatedEmail).toHaveBeenCalledWith(
                'ana@example.com',
                'Dr. Ana',
                'Clínica Sorriso',
            );
        });

        it('does NOT save or email when subscription already matches (idempotency)', async () => {
            const clinic = makeClinic({ stripeSubscriptionId: 'sub_existing', plan: 'PRO', subscriptionStatus: 'ACTIVE' });
            clinicRepository.findOne.mockResolvedValue(clinic);

            const session = {
                metadata: { clinicId: '1' },
                subscription: 'sub_existing',
                customer: 'cus_abc',
            } as any;

            await (controller as any).handleCheckoutSessionCompleted(session);

            expect(clinicRepository.save).not.toHaveBeenCalled();
            expect(emailService.sendSubscriptionProActivatedEmail).not.toHaveBeenCalled();
        });

        it('returns early when session.metadata.clinicId is absent', async () => {
            const session = {
                metadata: {},
                subscription: 'sub_new123',
                customer: 'cus_abc',
            } as any;

            await (controller as any).handleCheckoutSessionCompleted(session);

            expect(clinicRepository.findOne).not.toHaveBeenCalled();
            expect(clinicRepository.save).not.toHaveBeenCalled();
        });

        it('returns early when session.subscription is null', async () => {
            const session = {
                metadata: { clinicId: '1' },
                subscription: null,
                customer: 'cus_abc',
            } as any;

            await (controller as any).handleCheckoutSessionCompleted(session);

            expect(clinicRepository.findOne).not.toHaveBeenCalled();
            expect(clinicRepository.save).not.toHaveBeenCalled();
        });

        it('does not throw and does not save when clinic is not found', async () => {
            clinicRepository.findOne.mockResolvedValue(null);

            const session = {
                metadata: { clinicId: '999' },
                subscription: 'sub_new123',
                customer: 'cus_abc',
            } as any;

            await expect((controller as any).handleCheckoutSessionCompleted(session)).resolves.not.toThrow();
            expect(clinicRepository.save).not.toHaveBeenCalled();
        });
    });

    // ─── handleInvoicePaymentSucceeded ─────────────────────────────────────────

    describe('handleInvoicePaymentSucceeded', () => {
        it('reactivates clinic and clears trial/cancelAtPeriodEnd', async () => {
            const clinic = makeClinic({
                stripeSubscriptionId: 'sub_abc',
                subscriptionStatus: 'past_due',
                trialEndsAt: new Date('2026-06-01'),
                cancelAtPeriodEnd: true,
            });
            clinicRepository.findOne.mockResolvedValue(clinic);

            const invoice = { subscription: 'sub_abc' } as any;

            await (controller as any).handleInvoicePaymentSucceeded(invoice);

            expect(clinicRepository.save).toHaveBeenCalledTimes(1);
            const saved: Clinic = clinicRepository.save.mock.calls[0][0];
            expect(saved.subscriptionStatus).toBe('ACTIVE');
            expect(saved.trialEndsAt).toBeNull();
            expect(saved.cancelAtPeriodEnd).toBe(false);
        });

        it('does NOT call save when clinic is already ACTIVE with no pending changes (idempotency)', async () => {
            const clinic = makeClinic({
                stripeSubscriptionId: 'sub_abc',
                subscriptionStatus: 'ACTIVE',
                trialEndsAt: null,
                cancelAtPeriodEnd: false,
            });
            clinicRepository.findOne.mockResolvedValue(clinic);

            const invoice = { subscription: 'sub_abc' } as any;

            await (controller as any).handleInvoicePaymentSucceeded(invoice);

            expect(clinicRepository.save).not.toHaveBeenCalled();
        });

        it('returns early when invoice has no subscription ID', async () => {
            const invoice = { subscription: null } as any;

            await (controller as any).handleInvoicePaymentSucceeded(invoice);

            expect(clinicRepository.findOne).not.toHaveBeenCalled();
            expect(clinicRepository.save).not.toHaveBeenCalled();
        });

        it('does not throw and does not save when clinic is not found', async () => {
            clinicRepository.findOne.mockResolvedValue(null);

            const invoice = { subscription: 'sub_unknown' } as any;

            await expect((controller as any).handleInvoicePaymentSucceeded(invoice)).resolves.not.toThrow();
            expect(clinicRepository.save).not.toHaveBeenCalled();
        });
    });

    // ─── handleSubscriptionUpdated ─────────────────────────────────────────────

    describe('handleSubscriptionUpdated', () => {
        it('sets subscriptionStatus to past_due when Stripe status is past_due', async () => {
            const clinic = makeClinic({
                stripeSubscriptionId: 'sub_xyz',
                subscriptionStatus: 'ACTIVE',
                currentPeriodEnd: new Date('2026-05-01'),
                cancelAtPeriodEnd: false,
            });
            clinicRepository.findOne.mockResolvedValue(clinic);

            const subscription = {
                id: 'sub_xyz',
                status: 'past_due',
                cancel_at_period_end: false,
                current_period_end: Math.floor(new Date('2026-05-01').getTime() / 1000),
            } as any;

            await (controller as any).handleSubscriptionUpdated(subscription);

            expect(clinicRepository.save).toHaveBeenCalledTimes(1);
            const saved: Clinic = clinicRepository.save.mock.calls[0][0];
            expect(saved.subscriptionStatus).toBe('past_due');
        });

        it('sets subscriptionStatus to CANCELED and plan to FREE when Stripe status is canceled', async () => {
            const clinic = makeClinic({
                stripeSubscriptionId: 'sub_xyz',
                subscriptionStatus: 'ACTIVE',
                plan: 'PRO',
                currentPeriodEnd: new Date('2026-05-01'),
                cancelAtPeriodEnd: false,
            });
            clinicRepository.findOne.mockResolvedValue(clinic);

            const subscription = {
                id: 'sub_xyz',
                status: 'canceled',
                cancel_at_period_end: false,
                current_period_end: Math.floor(new Date('2026-05-01').getTime() / 1000),
            } as any;

            await (controller as any).handleSubscriptionUpdated(subscription);

            expect(clinicRepository.save).toHaveBeenCalledTimes(1);
            const saved: Clinic = clinicRepository.save.mock.calls[0][0];
            expect(saved.subscriptionStatus).toBe('CANCELED');
            expect(saved.plan).toBe('FREE');
            expect(saved.cancelAtPeriodEnd).toBe(false);
        });

        it('sends cancel-scheduled email when cancel_at_period_end transitions from false to true', async () => {
            const periodEnd = new Date('2026-06-30');
            const clinic = makeClinic({
                stripeSubscriptionId: 'sub_xyz',
                subscriptionStatus: 'ACTIVE',
                currentPeriodEnd: periodEnd,
                cancelAtPeriodEnd: false,
            });
            clinicRepository.findOne.mockResolvedValue(clinic);

            const subscription = {
                id: 'sub_xyz',
                status: 'active',
                cancel_at_period_end: true,
                current_period_end: Math.floor(periodEnd.getTime() / 1000),
            } as any;

            await (controller as any).handleSubscriptionUpdated(subscription);

            expect(clinicRepository.save).toHaveBeenCalled();
            expect(emailService.sendSubscriptionCancelScheduledEmail).toHaveBeenCalledWith(
                'ana@example.com',
                'Dr. Ana',
                'Clínica Sorriso',
                expect.any(Date),
            );
        });

        it('does NOT send cancel-scheduled email when owner has no email, but still saves', async () => {
            const periodEnd = new Date('2026-06-30');
            const clinic = makeClinic({
                stripeSubscriptionId: 'sub_xyz',
                subscriptionStatus: 'ACTIVE',
                currentPeriodEnd: periodEnd,
                cancelAtPeriodEnd: false,
                owner: { id: 10, name: 'Dr. Ana', email: null } as any,
            });
            clinicRepository.findOne.mockResolvedValue(clinic);

            const subscription = {
                id: 'sub_xyz',
                status: 'active',
                cancel_at_period_end: true,
                current_period_end: Math.floor(periodEnd.getTime() / 1000),
            } as any;

            await (controller as any).handleSubscriptionUpdated(subscription);

            expect(clinicRepository.save).toHaveBeenCalled();
            expect(emailService.sendSubscriptionCancelScheduledEmail).not.toHaveBeenCalled();
        });

        it('does not save when subscription status and fields are unchanged (idempotency)', async () => {
            const periodEnd = new Date('2026-05-01');
            const clinic = makeClinic({
                stripeSubscriptionId: 'sub_xyz',
                subscriptionStatus: 'past_due',
                currentPeriodEnd: periodEnd,
                cancelAtPeriodEnd: false,
            });
            clinicRepository.findOne.mockResolvedValue(clinic);

            const subscription = {
                id: 'sub_xyz',
                status: 'past_due',
                cancel_at_period_end: false,
                current_period_end: Math.floor(periodEnd.getTime() / 1000),
            } as any;

            await (controller as any).handleSubscriptionUpdated(subscription);

            expect(clinicRepository.save).not.toHaveBeenCalled();
        });

        it('does not throw and does not save when clinic is not found', async () => {
            clinicRepository.findOne.mockResolvedValue(null);

            const subscription = {
                id: 'sub_unknown',
                status: 'active',
                cancel_at_period_end: false,
                current_period_end: Math.floor(new Date('2026-05-01').getTime() / 1000),
            } as any;

            await expect((controller as any).handleSubscriptionUpdated(subscription)).resolves.not.toThrow();
            expect(clinicRepository.save).not.toHaveBeenCalled();
        });
    });

    // ─── handleSubscriptionDeleted ─────────────────────────────────────────────

    describe('handleSubscriptionDeleted', () => {
        it('cancels clinic: sets CANCELED, plan FREE, clears cancelAtPeriodEnd and sends email', async () => {
            const clinic = makeClinic({
                stripeSubscriptionId: 'sub_del',
                subscriptionStatus: 'ACTIVE',
                plan: 'PRO',
                cancelAtPeriodEnd: true,
            });
            clinicRepository.findOne.mockResolvedValue(clinic);

            const subscription = { id: 'sub_del' } as any;

            await (controller as any).handleSubscriptionDeleted(subscription);

            expect(clinicRepository.save).toHaveBeenCalledTimes(1);
            const saved: Clinic = clinicRepository.save.mock.calls[0][0];
            expect(saved.subscriptionStatus).toBe('CANCELED');
            expect(saved.plan).toBe('FREE');
            expect(saved.cancelAtPeriodEnd).toBe(false);

            expect(emailService.sendSubscriptionCancelledEmail).toHaveBeenCalledWith(
                'ana@example.com',
                'Dr. Ana',
                'Clínica Sorriso',
            );
        });

        it('does NOT call save when clinic is already CANCELED (idempotency)', async () => {
            const clinic = makeClinic({
                stripeSubscriptionId: 'sub_del',
                subscriptionStatus: 'CANCELED',
                plan: 'FREE',
            });
            clinicRepository.findOne.mockResolvedValue(clinic);

            const subscription = { id: 'sub_del' } as any;

            await (controller as any).handleSubscriptionDeleted(subscription);

            expect(clinicRepository.save).not.toHaveBeenCalled();
            expect(emailService.sendSubscriptionCancelledEmail).not.toHaveBeenCalled();
        });

        it('does not throw and does not save when clinic is not found', async () => {
            clinicRepository.findOne.mockResolvedValue(null);

            const subscription = { id: 'sub_unknown' } as any;

            await expect((controller as any).handleSubscriptionDeleted(subscription)).resolves.not.toThrow();
            expect(clinicRepository.save).not.toHaveBeenCalled();
        });
    });
});

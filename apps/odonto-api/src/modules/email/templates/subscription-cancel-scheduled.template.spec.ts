import { getSubscriptionCancelScheduledEmailTemplate } from './subscription-cancel-scheduled.template';

describe('getSubscriptionCancelScheduledEmailTemplate', () => {
    const periodEnd = new Date('2026-04-30T00:00:00Z');

    it('should mention cancellation/encerramento in subject', () => {
        const { subject } = getSubscriptionCancelScheduledEmailTemplate('Dra. Clara', 'Bella Dental', 'https://odontoehtec.com.br', periodEnd);
        expect(subject.toLowerCase()).toMatch(/cancelamento|encerramento/);
    });

    it('should include the day of periodEnd in html', () => {
        const { html } = getSubscriptionCancelScheduledEmailTemplate('Dra. Clara', 'Bella Dental', 'https://odontoehtec.com.br', periodEnd);
        expect(html).toContain('30');
    });

    it('should include the landingUrl in html', () => {
        const { html } = getSubscriptionCancelScheduledEmailTemplate('Dra. Clara', 'Bella Dental', 'https://odontoehtec.com.br', periodEnd);
        expect(html).toContain('odontoehtec.com.br');
    });

    it('should include the admin name in html', () => {
        const { html } = getSubscriptionCancelScheduledEmailTemplate('Dra. Clara', 'Bella Dental', 'https://odontoehtec.com.br', periodEnd);
        expect(html).toContain('Dra. Clara');
    });

    it('should include clinic name in html', () => {
        const { html } = getSubscriptionCancelScheduledEmailTemplate('Dra. Clara', 'Bella Dental', 'https://odontoehtec.com.br', periodEnd);
        expect(html).toContain('Bella Dental');
    });
});

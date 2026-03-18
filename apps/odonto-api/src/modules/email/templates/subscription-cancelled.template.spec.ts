import { getSubscriptionCancelledEmailTemplate } from './subscription-cancelled.template';

describe('getSubscriptionCancelledEmailTemplate', () => {
    it('should mention cancellation in subject', () => {
        const { subject } = getSubscriptionCancelledEmailTemplate('Dr. Pedro', 'Odonto Plus', 'https://odontoehtec.com.br');
        expect(subject.toLowerCase()).toMatch(/cancelad|encerrad/);
    });

    it('should include the landingUrl in html', () => {
        const { html } = getSubscriptionCancelledEmailTemplate('Dr. Pedro', 'Odonto Plus', 'https://odontoehtec.com.br');
        expect(html).toContain('https://odontoehtec.com.br');
    });

    it('should include clinic name in html', () => {
        const { html } = getSubscriptionCancelledEmailTemplate('Dr. Pedro', 'Odonto Plus', 'https://odontoehtec.com.br');
        expect(html).toContain('Odonto Plus');
    });

    it('should include admin name in html', () => {
        const { html } = getSubscriptionCancelledEmailTemplate('Dr. Pedro', 'Odonto Plus', 'https://odontoehtec.com.br');
        expect(html).toContain('Dr. Pedro');
    });
});

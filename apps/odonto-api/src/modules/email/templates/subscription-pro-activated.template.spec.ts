import { getSubscriptionProActivatedEmailTemplate } from './subscription-pro-activated.template';

describe('getSubscriptionProActivatedEmailTemplate', () => {
  const params = {
    adminName: 'Dr. Ana',
    clinicName: 'Clínica Sorriso',
    dashboardUrl: 'http://localhost:3001/dashboard',
  };

  it('should include "PRO" in the subject', () => {
    const { subject } = getSubscriptionProActivatedEmailTemplate(
      params.adminName,
      params.clinicName,
      params.dashboardUrl,
    );
    expect(subject).toContain('PRO');
  });

  it('should include adminName in html', () => {
    const { html } = getSubscriptionProActivatedEmailTemplate(
      params.adminName,
      params.clinicName,
      params.dashboardUrl,
    );
    expect(html).toContain('Dr. Ana');
  });

  it('should include clinicName in html', () => {
    const { html } = getSubscriptionProActivatedEmailTemplate(
      params.adminName,
      params.clinicName,
      params.dashboardUrl,
    );
    expect(html).toContain('Clínica Sorriso');
  });

  it('should include dashboardUrl in html', () => {
    const { html } = getSubscriptionProActivatedEmailTemplate(
      params.adminName,
      params.clinicName,
      params.dashboardUrl,
    );
    expect(html).toContain('http://localhost:3001/dashboard');
  });
});

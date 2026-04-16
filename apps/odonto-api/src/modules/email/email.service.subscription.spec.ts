import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

const CONFIG_MAP: Record<string, string> = {
  RESEND_API_KEY: 'test-key',
  RESEND_FROM_EMAIL: 'noreply@test.com',
  FRONTEND_URL: 'http://localhost:3001',
  LANDING_URL: 'https://odontoehtec.com.br',
};

describe('EmailService — subscription lifecycle', () => {
  let service: EmailService;
  let mockSend: jest.Mock;

  beforeEach(async () => {
    mockSend = jest
      .fn()
      .mockResolvedValue({ data: { id: 'email-id' }, error: null });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn((key: string) => CONFIG_MAP[key]) },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    (service as any).resend = { emails: { send: mockSend } };
  });

  describe('sendSubscriptionProActivatedEmail', () => {
    it('returns true on success', async () => {
      const result = await service.sendSubscriptionProActivatedEmail(
        'a@b.com',
        'Dr. Ana',
        'Sorriso',
      );
      expect(result).toBe(true);
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it('returns false when resend returns error', async () => {
      mockSend.mockResolvedValueOnce({
        data: null,
        error: { message: 'fail' },
      });
      const result = await service.sendSubscriptionProActivatedEmail(
        'a@b.com',
        'Dr. Ana',
        'Sorriso',
      );
      expect(result).toBe(false);
    });

    it('passes dashboard URL in html', async () => {
      await service.sendSubscriptionProActivatedEmail(
        'a@b.com',
        'Dr. Ana',
        'Sorriso',
      );
      expect(mockSend.mock.calls[0][0].html).toContain('/dashboard');
    });
  });

  describe('sendSubscriptionCancelScheduledEmail', () => {
    it('returns true on success', async () => {
      const result = await service.sendSubscriptionCancelScheduledEmail(
        'a@b.com',
        'Dr. Pedro',
        'Sorriso',
        new Date('2026-04-30'),
      );
      expect(result).toBe(true);
    });

    it('passes LANDING_URL in html', async () => {
      await service.sendSubscriptionCancelScheduledEmail(
        'a@b.com',
        'Dr. Pedro',
        'Sorriso',
        new Date('2026-04-30'),
      );
      expect(mockSend.mock.calls[0][0].html).toContain('odontoehtec.com.br');
    });

    it('returns false when resend returns error', async () => {
      mockSend.mockResolvedValueOnce({
        data: null,
        error: { message: 'fail' },
      });
      const result = await service.sendSubscriptionCancelScheduledEmail(
        'a@b.com',
        'Dr. Pedro',
        'Sorriso',
        new Date('2026-04-30'),
      );
      expect(result).toBe(false);
    });
  });

  describe('sendSubscriptionCancelledEmail', () => {
    it('returns true on success', async () => {
      const result = await service.sendSubscriptionCancelledEmail(
        'a@b.com',
        'Dr. Clara',
        'Sorriso',
      );
      expect(result).toBe(true);
    });

    it('passes LANDING_URL in html', async () => {
      await service.sendSubscriptionCancelledEmail(
        'a@b.com',
        'Dr. Clara',
        'Sorriso',
      );
      expect(mockSend.mock.calls[0][0].html).toContain('odontoehtec.com.br');
    });

    it('returns false when resend returns error', async () => {
      mockSend.mockResolvedValueOnce({
        data: null,
        error: { message: 'fail' },
      });
      const result = await service.sendSubscriptionCancelledEmail(
        'a@b.com',
        'Dr. Clara',
        'Sorriso',
      );
      expect(result).toBe(false);
    });
  });
});

import { AppointmentsController } from './appointments.controller';

function getThrottleLimit(
  controller: { prototype: Record<string, unknown> },
  methodName: string,
): number | undefined {
  return Reflect.getMetadata(
    'THROTTLER:LIMITdefault',
    controller.prototype[methodName],
  ) as number | undefined;
}

function getThrottleTtl(
  controller: { prototype: Record<string, unknown> },
  methodName: string,
): number | undefined {
  return Reflect.getMetadata(
    'THROTTLER:TTLdefault',
    controller.prototype[methodName],
  ) as number | undefined;
}

describe('AppointmentsController — Throttle on public cancel endpoint', () => {
  it('publicCancel should have throttle limit ≤ 10', () => {
    const limit = getThrottleLimit(AppointmentsController, 'publicCancel');
    expect(limit).toBeDefined();
    expect(limit).toBeLessThanOrEqual(10);
  });

  it('publicCancel throttle TTL should be at least 60s', () => {
    const ttl = getThrottleTtl(AppointmentsController, 'publicCancel');
    expect(ttl).toBeDefined();
    expect(ttl).toBeGreaterThanOrEqual(60000);
  });
});

import 'reflect-metadata';
import { AuthController } from './auth.controller';

const LIMIT_KEY = 'THROTTLER:LIMITdefault';
const TTL_KEY = 'THROTTLER:TTLdefault';

function getThrottleMeta(methodName: keyof typeof AuthController.prototype) {
  return {
    limit: Reflect.getMetadata(
      LIMIT_KEY,
      AuthController.prototype[methodName as string],
    ),
    ttl: Reflect.getMetadata(
      TTL_KEY,
      AuthController.prototype[methodName as string],
    ),
  };
}

describe('AuthController – Throttle decorators on all public endpoints', () => {
  // Pre-existing endpoints (must not regress)
  it('login has throttle: limit=5, ttl=60000', () => {
    const { limit, ttl } = getThrottleMeta('login');
    expect(limit).toBeDefined();
    expect(limit).toBe(5);
    expect(ttl).toBe(60000);
  });

  it('forgotPassword has throttle: limit=5, ttl=60000', () => {
    const { limit, ttl } = getThrottleMeta('forgotPassword');
    expect(limit).toBeDefined();
    expect(limit).toBe(5);
    expect(ttl).toBe(60000);
  });

  it('resetPassword has throttle: limit=3, ttl=60000', () => {
    const { limit, ttl } = getThrottleMeta('resetPassword');
    expect(limit).toBeDefined();
    expect(limit).toBe(3);
    expect(ttl).toBe(60000);
  });

  // New endpoints added in this task
  it('register (register-invitation) has throttle: limit=10, ttl=60000', () => {
    const { limit, ttl } = getThrottleMeta('register');
    expect(limit).toBeDefined();
    expect(limit).toBe(10);
    expect(ttl).toBe(60000);
  });

  it('registerTenant (register-tenant) has throttle: limit=5, ttl=60000', () => {
    const { limit, ttl } = getThrottleMeta('registerTenant');
    expect(limit).toBeDefined();
    expect(limit).toBe(5);
    expect(ttl).toBe(60000);
  });

  it('initiateRegistration (initiate-registration) has throttle: limit=5, ttl=60000', () => {
    const { limit, ttl } = getThrottleMeta('initiateRegistration');
    expect(limit).toBeDefined();
    expect(limit).toBe(5);
    expect(ttl).toBe(60000);
  });

  it('verifyEmail (verify-email) has throttle: limit=10, ttl=60000', () => {
    const { limit, ttl } = getThrottleMeta('verifyEmail');
    expect(limit).toBeDefined();
    expect(limit).toBe(10);
    expect(ttl).toBe(60000);
  });
});

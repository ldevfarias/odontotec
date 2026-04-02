import { AuthController } from './auth.controller';

function getThrottleLimit(controller: any, methodName: string): number | undefined {
    return Reflect.getMetadata('THROTTLER:LIMITdefault', controller.prototype[methodName]);
}

describe('AuthController – Throttle decorators on public endpoints', () => {
    it('register-invitation has throttle limit <= 10', () => {
        const limit = getThrottleLimit(AuthController, 'register');
        expect(limit).toBeDefined();
        expect(limit).toBeLessThanOrEqual(10);
    });

    it('register-tenant has throttle limit <= 10', () => {
        const limit = getThrottleLimit(AuthController, 'registerTenant');
        expect(limit).toBeDefined();
        expect(limit).toBeLessThanOrEqual(10);
    });

    it('initiate-registration has throttle limit <= 10', () => {
        const limit = getThrottleLimit(AuthController, 'initiateRegistration');
        expect(limit).toBeDefined();
        expect(limit).toBeLessThanOrEqual(10);
    });

    it('verify-email has throttle limit <= 10', () => {
        const limit = getThrottleLimit(AuthController, 'verifyEmail');
        expect(limit).toBeDefined();
        expect(limit).toBeLessThanOrEqual(10);
    });
});

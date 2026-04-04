import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from './login.dto';
import { VerifyEmailDto } from './verify-email.dto';

describe('LoginDto', () => {
    it('rejects password longer than 128 characters', async () => {
        const dto = plainToInstance(LoginDto, {
            email: 'test@clinic.com',
            password: 'A'.repeat(129),
        });
        const errors = await validate(dto);
        const passwordError = errors.find((e) => e.property === 'password');
        expect(passwordError).toBeDefined();
    });

    it('accepts password exactly 128 characters', async () => {
        const dto = plainToInstance(LoginDto, {
            email: 'test@clinic.com',
            password: 'A'.repeat(128),
        });
        const errors = await validate(dto);
        const passwordError = errors.find((e) => e.property === 'password');
        expect(passwordError).toBeUndefined();
    });

    it('rejects email longer than 255 characters', async () => {
        const dto = plainToInstance(LoginDto, {
            email: `${'a'.repeat(250)}@x.com`,
            password: 'password123',
        });
        const errors = await validate(dto);
        const emailError = errors.find((e) => e.property === 'email');
        expect(emailError).toBeDefined();
    });
});

describe('VerifyEmailDto', () => {
    it('rejects password longer than 128 characters', async () => {
        const dto = plainToInstance(VerifyEmailDto, {
            token: 'valid-token',
            password: 'A'.repeat(129),
            confirmPassword: 'A'.repeat(129),
        });
        const errors = await validate(dto);
        const passwordError = errors.find((e) => e.property === 'password');
        expect(passwordError).toBeDefined();
    });

    it('accepts password exactly 128 characters', async () => {
        const dto = plainToInstance(VerifyEmailDto, {
            token: 'valid-token',
            password: 'A'.repeat(128),
            confirmPassword: 'A'.repeat(128),
        });
        const errors = await validate(dto);
        const passwordError = errors.find((e) => e.property === 'password');
        expect(passwordError).toBeUndefined();
    });

    it('rejects confirmPassword shorter than 8 characters', async () => {
        const dto = plainToInstance(VerifyEmailDto, {
            token: 'valid-token',
            password: 'password123',
            confirmPassword: 'short',
        });
        const errors = await validate(dto);
        const confirmError = errors.find((e) => e.property === 'confirmPassword');
        expect(confirmError).toBeDefined();
    });

    it('rejects confirmPassword longer than 128 characters', async () => {
        const dto = plainToInstance(VerifyEmailDto, {
            token: 'valid-token',
            password: 'password123',
            confirmPassword: 'A'.repeat(129),
        });
        const errors = await validate(dto);
        const confirmError = errors.find((e) => e.property === 'confirmPassword');
        expect(confirmError).toBeDefined();
    });

    it('accepts valid confirmPassword', async () => {
        const dto = plainToInstance(VerifyEmailDto, {
            token: 'valid-token',
            password: 'password123',
            confirmPassword: 'password123',
        });
        const errors = await validate(dto);
        const confirmError = errors.find((e) => e.property === 'confirmPassword');
        expect(confirmError).toBeUndefined();
    });
});

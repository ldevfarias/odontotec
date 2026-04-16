import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  UpdateUserDto,
  ChangeRoleDto,
  DeactivateUserDto,
} from './dto/user.dto';

describe('UpdateUserDto — mass assignment protection', () => {
  it('should not validate role field (no validator on UpdateUserDto)', async () => {
    const dto = plainToInstance(UpdateUserDto, { name: 'Ana', role: 'ADMIN' });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should not validate isActive field (no validator on UpdateUserDto)', async () => {
    const dto = plainToInstance(UpdateUserDto, {
      name: 'Ana',
      isActive: false,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept name and email', async () => {
    const dto = plainToInstance(UpdateUserDto, {
      name: 'Ana',
      email: 'ana@test.com',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});

describe('DeactivateUserDto', () => {
  it('should require isActive field', async () => {
    const dto = plainToInstance(DeactivateUserDto, {});
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'isActive')).toBe(true);
  });

  it('should reject non-boolean', async () => {
    const dto = plainToInstance(DeactivateUserDto, { isActive: 'yes' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'isActive')).toBe(true);
  });

  it('should accept true', async () => {
    const dto = plainToInstance(DeactivateUserDto, { isActive: true });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept false', async () => {
    const dto = plainToInstance(DeactivateUserDto, { isActive: false });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});

describe('ChangeRoleDto', () => {
  it('should require role field', async () => {
    const dto = plainToInstance(ChangeRoleDto, {});
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'role')).toBe(true);
  });

  it('should reject invalid role', async () => {
    const dto = plainToInstance(ChangeRoleDto, { role: 'HACKER' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'role')).toBe(true);
  });

  it('should accept valid role', async () => {
    const dto = plainToInstance(ChangeRoleDto, { role: 'DENTIST' });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});

import { validateCnpj } from './is-valid-cnpj.validator';

describe('validateCnpj', () => {
  // Valid traditional numeric CNPJ: 11.222.333/0001-81
  it('accepts a valid numeric CNPJ (raw)', () => {
    expect(validateCnpj('11222333000181')).toBe(true);
  });

  it('accepts a valid numeric CNPJ (formatted)', () => {
    expect(validateCnpj('11.222.333/0001-81')).toBe(true);
  });

  // Valid alphanumeric CNPJ: AB.222.333/0001-01
  it('accepts a valid alphanumeric CNPJ (raw)', () => {
    expect(validateCnpj('AB222333000101')).toBe(true);
  });

  it('accepts a valid alphanumeric CNPJ (formatted)', () => {
    expect(validateCnpj('AB.222.333/0001-01')).toBe(true);
  });

  it('rejects a CNPJ with a wrong check digit', () => {
    expect(validateCnpj('11222333000182')).toBe(false);
  });

  it('rejects a homogeneous sequence', () => {
    expect(validateCnpj('00000000000000')).toBe(false);
    expect(validateCnpj('AAAAAAAAAAAAAA')).toBe(false);
  });

  it('rejects wrong length', () => {
    expect(validateCnpj('1122233300018')).toBe(false);
    expect(validateCnpj('112223330001810')).toBe(false);
  });

  it('rejects letters in check digit positions (13–14)', () => {
    expect(validateCnpj('AB2223330001AB')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validateCnpj('')).toBe(false);
  });
});

import { registerDecorator, ValidationOptions } from 'class-validator';

function charValue(c: string): number {
  const code = c.charCodeAt(0);
  return code >= 48 && code <= 57 ? code - 48 : code - 55;
}

function calcDigit(chars: string, weights: number[]): number {
  const sum = chars
    .split('')
    .reduce((acc, c, i) => acc + charValue(c) * weights[i], 0);
  const rem = sum % 11;
  return rem < 2 ? 0 : 11 - rem;
}

export function validateCnpj(raw: string): boolean {
  const cnpj = raw.replace(/[.\-/]/g, '').toUpperCase();
  if (cnpj.length !== 14) return false;
  if (/^(.)\1+$/.test(cnpj)) return false;
  if (!/^[A-Z0-9]{12}[0-9]{2}$/.test(cnpj)) return false;

  const dv1 = calcDigit(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const dv2 = calcDigit(cnpj.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return dv1 === parseInt(cnpj[12], 10) && dv2 === parseInt(cnpj[13], 10);
}

export function IsValidCnpj(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidCnpj',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (!value) return true;
          if (typeof value !== 'string') return false;
          return validateCnpj(value);
        },
        defaultMessage() {
          return 'CNPJ inválido.';
        },
      },
    });
  };
}

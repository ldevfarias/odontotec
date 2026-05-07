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

export function stripCnpj(value: string): string {
  return value.replace(/[.\-/]/g, '').toUpperCase();
}

export function formatCnpj(raw: string): string {
  const cnpj = stripCnpj(raw).slice(0, 14);
  if (!cnpj) return '';
  const p1 = cnpj.slice(0, 2);
  const p2 = cnpj.slice(2, 5);
  const p3 = cnpj.slice(5, 8);
  const p4 = cnpj.slice(8, 12);
  const p5 = cnpj.slice(12, 14);
  let result = p1;
  if (p2) result += '.' + p2;
  if (p3) result += '.' + p3;
  if (p4) result += '/' + p4;
  if (p5) result += '-' + p5;
  return result;
}

import { buildCorsOrigins } from './cors.config';

describe('buildCorsOrigins', () => {
  it('parses a single valid origin', () => {
    const result = buildCorsOrigins('http://localhost:3001', 'development');
    expect(result).toEqual(['http://localhost:3001']);
  });

  it('parses multiple comma-separated origins', () => {
    const result = buildCorsOrigins(
      'http://localhost:3001,http://localhost:3002',
      'development',
    );
    expect(result).toEqual(['http://localhost:3001', 'http://localhost:3002']);
  });

  it('trims whitespace around origins', () => {
    const result = buildCorsOrigins(
      ' http://localhost:3001 , http://localhost:3002 ',
      'development',
    );
    expect(result).toEqual(['http://localhost:3001', 'http://localhost:3002']);
  });

  it('throws when a wildcard origin is provided', () => {
    expect(() => buildCorsOrigins('*.example.com', 'development')).toThrow(
      'Wildcard',
    );
  });

  it('throws when origin is not a valid URL', () => {
    expect(() => buildCorsOrigins('not-a-url', 'development')).toThrow(
      'not a valid URL',
    );
  });

  it('throws when production origin uses HTTP', () => {
    expect(() =>
      buildCorsOrigins('http://app.odontotec.com', 'production'),
    ).toThrow('must use HTTPS');
  });

  it('accepts HTTPS origin in production', () => {
    const result = buildCorsOrigins('https://app.odontotec.com', 'production');
    expect(result).toEqual(['https://app.odontotec.com']);
  });

  it('throws when origin is empty string', () => {
    expect(() => buildCorsOrigins(',', 'development')).toThrow('empty');
  });

  it('throws when a completely empty string is provided', () => {
    expect(() => buildCorsOrigins('', 'development')).toThrow('empty');
  });

  it('throws when one origin in a list is invalid', () => {
    expect(() =>
      buildCorsOrigins('http://localhost:3001,not-a-url', 'development'),
    ).toThrow('not a valid URL');
  });
});

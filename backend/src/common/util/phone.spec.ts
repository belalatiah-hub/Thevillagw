import { normalizePhone } from './phone';

describe('normalizePhone', () => {
  it('treats international and national Egyptian forms as equal', () => {
    expect(normalizePhone('+20 101 600 0201')).toBe('01016000201');
    expect(normalizePhone('01016000201')).toBe('01016000201');
    expect(normalizePhone('0020 101 600 0201')).toBe('01016000201');
  });

  it('strips formatting characters', () => {
    expect(normalizePhone('(010) 1600-0201')).toBe('01016000201');
  });

  it('returns null for empty input', () => {
    expect(normalizePhone(null)).toBeNull();
    expect(normalizePhone('')).toBeNull();
    expect(normalizePhone('   ')).toBeNull();
  });

  it('leaves non-EG numbers as digit strings', () => {
    expect(normalizePhone('+971 50 123 4567')).toBe('971501234567');
  });
});

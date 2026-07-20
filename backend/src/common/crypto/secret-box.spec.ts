import { decryptSecret, encryptSecret, maskSecret } from './secret-box';

describe('secret-box (AES-256-GCM)', () => {
  const KEY = 'a'.repeat(64); // 32-byte hex key

  it('round-trips a secret', () => {
    const plain = 'EAAB-super-secret-token-12345';
    const enc = encryptSecret(plain, KEY);
    expect(enc).not.toContain(plain);
    expect(decryptSecret(enc, KEY)).toBe(plain);
  });

  it('produces a different ciphertext each time (random IV)', () => {
    expect(encryptSecret('x', KEY)).not.toBe(encryptSecret('x', KEY));
  });

  it('fails to decrypt with the wrong key', () => {
    const enc = encryptSecret('secret', KEY);
    expect(() => decryptSecret(enc, 'b'.repeat(64))).toThrow();
  });

  it('fails on tampered ciphertext (auth tag)', () => {
    const enc = encryptSecret('secret', KEY);
    const [iv, tag, data] = enc.split('.');
    const tampered = [iv, tag, Buffer.from('zzzz').toString('base64') + data].join('.');
    expect(() => decryptSecret(tampered, KEY)).toThrow();
  });

  it('derives a key from a non-hex passphrase', () => {
    const enc = encryptSecret('hi', 'some-passphrase');
    expect(decryptSecret(enc, 'some-passphrase')).toBe('hi');
  });

  it('masks all but the last 4 chars', () => {
    expect(maskSecret('abcd1234WXYZ')).toBe('••••••••WXYZ');
    expect(maskSecret('')).toBe('');
  });
});

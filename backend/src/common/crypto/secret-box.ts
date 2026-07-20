import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

/**
 * Authenticated symmetric encryption for integration credentials (OAuth tokens,
 * API keys, webhook secrets). AES-256-GCM with a per-value random IV; the key is
 * derived from INTEGRATION_ENC_KEY. Ciphertext is stored; plaintext is never
 * persisted or returned over the API (see maskSecret). In production the key
 * should come from a KMS/secret manager, not an env var.
 *
 * Format: base64(iv).base64(authTag).base64(ciphertext)
 */
const ALGO = 'aes-256-gcm';

function keyFrom(secret: string): Buffer {
  // Accept a 64-char hex key directly, else derive 32 bytes via SHA-256.
  if (/^[0-9a-f]{64}$/i.test(secret)) {
    return Buffer.from(secret, 'hex');
  }
  return createHash('sha256')
    .update(secret || 'dev-integration-key')
    .digest();
}

export function encryptSecret(plaintext: string, secret: string): string {
  const key = keyFrom(secret);
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('base64'), tag.toString('base64'), enc.toString('base64')].join('.');
}

export function decryptSecret(payload: string, secret: string): string {
  const [ivB64, tagB64, dataB64] = payload.split('.');
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error('Malformed ciphertext');
  }
  const key = keyFrom(secret);
  const decipher = createDecipheriv(ALGO, key, Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}

/** Show only the last 4 characters of a secret for display; never the rest. */
export function maskSecret(plaintext: string): string {
  if (!plaintext) return '';
  const tail = plaintext.slice(-4);
  return `••••••••${tail}`;
}

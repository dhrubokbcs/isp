import crypto from 'crypto';

function getSecretKey(): string {
  const secret = process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || secret.length < 32) {
    throw new Error('FATAL SECURITY ERROR: SESSION_SECRET or SUPABASE_SERVICE_ROLE_KEY must be set and at least 32 characters.');
  }
  // Derive a dedicated 256-bit key for session signing using SHA-256 HMAC derivation
  return crypto.createHash('sha256').update(`isp_session_salt_${secret}`).digest('hex');
}

/**
 * Creates a cryptographically signed HMAC SHA-256 token
 * Format: base64url(payload).base64url(signature)
 */
export function signToken<T>(payload: T): string {
  const secretKey = getSecretKey();
  const json = JSON.stringify(payload);
  const payloadBase64 = Buffer.from(json, 'utf8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(payloadBase64)
    .digest('base64url');
  return `${payloadBase64}.${signature}`;
}

/**
 * Verifies and decodes an HMAC SHA-256 signed token
 */
export function verifyToken<T>(token: string): T | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadBase64, providedSig] = parts;
  if (!payloadBase64 || !providedSig) return null;

  try {
    const secretKey = getSecretKey();
    const expectedSig = crypto
      .createHmac('sha256', secretKey)
      .update(payloadBase64)
      .digest('base64url');

    // Constant-time comparison to prevent timing attacks
    const providedBuffer = Buffer.from(providedSig, 'utf8');
    const expectedBuffer = Buffer.from(expectedSig, 'utf8');

    if (providedBuffer.length !== expectedBuffer.length) return null;
    if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) return null;

    const json = Buffer.from(payloadBase64, 'base64url').toString('utf8');
    const parsed = JSON.parse(json);
    return parsed as T;
  } catch {
    return null;
  }
}

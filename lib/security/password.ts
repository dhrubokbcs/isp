import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Check whether a string matches a bcrypt hash format ($2a$, $2b$, or $2y$).
 */
export function isBcryptHash(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(str);
}

/**
 * Hashes a plaintext password using bcrypt with standard 10 salt rounds.
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  if (!plainPassword || typeof plainPassword !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  return bcrypt.hash(plainPassword.trim(), SALT_ROUNDS);
}

/**
 * Verifies a plaintext password against a stored hash.
 * Includes graceful backward-compatibility for legacy plaintext records.
 */
export async function verifyPassword(
  plainPassword: string,
  storedHash: string
): Promise<{ matches: boolean; needsRehash: boolean }> {
  if (!plainPassword || !storedHash) {
    return { matches: false, needsRehash: false };
  }

  // 1. Standard bcrypt hash check
  if (isBcryptHash(storedHash)) {
    const matches = await bcrypt.compare(plainPassword.trim(), storedHash);
    return { matches, needsRehash: false };
  }

  // 2. Legacy plaintext fallback: matches if plain string equals stored hash
  const legacyMatches = plainPassword.trim() === storedHash.trim();
  return {
    matches: legacyMatches,
    needsRehash: legacyMatches, // Flag that this record should be upgraded to bcrypt!
  };
}

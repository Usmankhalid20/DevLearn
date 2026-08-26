import crypto from 'node:crypto';
import argon2 from 'argon2';

/**
 * Hashes a plaintext password using Argon2id
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456, // 19 MiB
    timeCost: 2,
    parallelism: 1,
  });
}

/**
 * Verifies a password against an Argon2id hash
 */
export async function verifyPassword(hash: string, plaintext: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plaintext);
  } catch {
    return false;
  }
}

/**
 * Generates a cryptographically secure random session token
 */
export function generateRandomToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Produces a SHA-256 hash of a session token for secure database storage
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

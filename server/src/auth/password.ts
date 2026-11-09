import { randomBytes, scrypt as _scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(_scrypt) as (pw: string, salt: Buffer, len: number, opts: object) => Promise<Buffer>;
const PARAMS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

/** scrypt (bộ nhớ cứng) — định dạng: scrypt$N$r$p$salt$hash */
export async function hashPassword(pw: string): Promise<string> {
  const salt = randomBytes(16);
  const h = await scrypt(pw.normalize('NFKC'), salt, 64, PARAMS);
  return `scrypt$${PARAMS.N}$${PARAMS.r}$${PARAMS.p}$${salt.toString('base64')}$${h.toString('base64')}`;
}
export async function verifyPassword(pw: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [, N, r, p, salt, hash] = parts;
  const expected = Buffer.from(hash, 'base64');
  const h = await scrypt(pw.normalize('NFKC'), Buffer.from(salt, 'base64'), expected.length, { N: Number(N), r: Number(r), p: Number(p), maxmem: 64 * 1024 * 1024 });
  return h.length === expected.length && timingSafeEqual(h, expected);
}
export function newToken(): string { return randomBytes(32).toString('base64url'); }
export function sha256(s: string): string { return createHash('sha256').update(s).digest('hex'); }
export function validatePasswordStrength(pw: string): string | null {
  if (pw.length < 8) return 'Mật khẩu tối thiểu 8 ký tự';
  if (pw.length > 128) return 'Mật khẩu quá dài';
  if (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw)) return 'Mật khẩu cần có cả chữ và số';
  return null;
}

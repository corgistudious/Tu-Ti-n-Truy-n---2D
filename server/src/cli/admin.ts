/**
 * Tạo / nâng quyền tài khoản quản trị — KHÔNG có tài khoản admin cố định trong source.
 * Dùng: ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run admin:create -w server   (role mặc định admin)
 *   hoặc: npm run admin:create -w server -- --email a@b.c --role gm   (mật khẩu đọc từ ADMIN_PASSWORD)
 */
import { hashPassword, validatePasswordStrength } from '../auth/password.js';
import { closeDb, q1 } from '../db.js';
import { migrate } from '../migrate.js';

const args = process.argv.slice(2);
const arg = (k: string) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
const email = (arg('email') ?? process.env.ADMIN_EMAIL ?? '').trim().toLowerCase();
const role = arg('role') ?? 'admin';
const password = process.env.ADMIN_PASSWORD ?? '';

async function main(): Promise<void> {
  if (!email || !['support', 'gm', 'admin'].includes(role)) throw new Error('Thiếu --email/ADMIN_EMAIL hoặc role không hợp lệ');
  await migrate();
  const existing = await q1<{ id: number }>('SELECT id FROM accounts WHERE lower(email) = $1', [email]);
  if (existing) {
    await q1('UPDATE accounts SET role = $2 WHERE id = $1', [existing.id, role]);
    console.log(`Đã đặt vai trò ${role} cho tài khoản #${existing.id}`);
  } else {
    const weak = validatePasswordStrength(password);
    if (weak) throw new Error(`ADMIN_PASSWORD: ${weak}`);
    const r = await q1<{ id: number }>('INSERT INTO accounts(email, password_hash, role, email_verified_at) VALUES ($1,$2,$3, now()) RETURNING id', [email, await hashPassword(password), role]);
    console.log(`Đã tạo tài khoản ${role} #${r!.id}`);
  }
  await closeDb();
}
main().catch((e) => { console.error(String(e.message ?? e)); process.exit(1); });

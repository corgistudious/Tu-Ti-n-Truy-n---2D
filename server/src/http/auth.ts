import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { config } from '../config.js';
import { q, q1, tx } from '../db.js';
import { hashPassword, newToken, sha256, validatePasswordStrength, verifyPassword } from '../auth/password.js';
import { sendMail } from '../services/mailer.js';
import { securityLog } from '../services/audit.js';
import { rateLimit } from '../redis.js';

export interface AccountCtx { id: number; email: string; role: 'player' | 'support' | 'gm' | 'admin'; sessionId: string; verified: boolean; mutedUntil: Date | null }

const MAX_FAILED = 5;
const LOCK_MIN = 15;

export async function createSession(accountId: number, req: FastifyRequest, device?: string): Promise<string> {
  const token = newToken();
  const days = config().SESSION_DAYS;
  await q('INSERT INTO sessions(account_id, token_hash, device, ip, user_agent, expires_at) VALUES ($1,$2,$3,$4,$5, now() + ($6 || \' days\')::interval)',
    [accountId, sha256(token), (device ?? '').slice(0, 60), req.ip, String(req.headers['user-agent'] ?? '').slice(0, 200), String(days)]);
  return token;
}

/** Xác thực token phiên — dùng chung cho HTTP và WebSocket */
export async function accountFromToken(token: string | undefined): Promise<AccountCtx | null> {
  if (!token || token.length > 200) return null;
  const r = await q1<{ sid: string; id: number; email: string; role: AccountCtx['role']; status: string; banned_until: Date | null; email_verified_at: Date | null; muted_until: Date | null; last_seen_at: Date }>(
    `SELECT s.id AS sid, s.last_seen_at, a.id, a.email, a.role, a.status, a.banned_until, a.email_verified_at, a.muted_until
     FROM sessions s JOIN accounts a ON a.id = s.account_id
     WHERE s.token_hash = $1 AND s.revoked_at IS NULL AND s.expires_at > now()`, [sha256(token)]);
  if (!r) return null;
  if (r.status === 'banned' && (!r.banned_until || r.banned_until > new Date())) return null;
  if (Date.now() - new Date(r.last_seen_at).getTime() > 60_000) await q('UPDATE sessions SET last_seen_at = now() WHERE id = $1', [r.sid]);
  return { id: r.id, email: r.email, role: r.role, sessionId: r.sid, verified: !!r.email_verified_at, mutedUntil: r.muted_until };
}
export function bearer(req: FastifyRequest): string | undefined {
  const h = req.headers.authorization;
  return h?.startsWith('Bearer ') ? h.slice(7) : undefined;
}
export async function requireAccount(req: FastifyRequest, reply: FastifyReply): Promise<AccountCtx | null> {
  const acc = await accountFromToken(bearer(req));
  if (!acc) { reply.code(401).send({ error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn' }); return null; }
  return acc;
}

async function issueEmailToken(accountId: number, kind: 'verify' | 'reset', hours: number): Promise<string> {
  const token = newToken();
  await q('INSERT INTO email_tokens(account_id, kind, token_hash, expires_at) VALUES ($1,$2,$3, now() + ($4 || \' hours\')::interval)', [accountId, kind, sha256(token), String(hours)]);
  return token;
}

const Email = z.string().trim().toLowerCase().email().max(200);

export function authRoutes(app: FastifyInstance): void {
  app.post('/api/auth/register', async (req, reply) => {
    if (!(await rateLimit(`reg:${req.ip}`, config().REGISTER_LIMIT_PER_HOUR, 3600))) return reply.code(429).send({ error: 'Đăng ký quá nhiều lần, thử lại sau' });
    const body = z.object({ email: Email, password: z.string(), device: z.string().optional() }).safeParse(req.body);
    if (!body.success) return reply.code(400).send({ error: 'Email hoặc mật khẩu không hợp lệ' });
    const weak = validatePasswordStrength(body.data.password);
    if (weak) return reply.code(400).send({ error: weak });
    const exists = await q1('SELECT 1 FROM accounts WHERE lower(email) = $1', [body.data.email]);
    if (exists) return reply.code(409).send({ error: 'Email đã được đăng ký' });
    const hash = await hashPassword(body.data.password);
    const acc = await q1<{ id: number }>('INSERT INTO accounts(email, password_hash) VALUES ($1,$2) RETURNING id', [body.data.email, hash]);
    const vt = await issueEmailToken(acc!.id, 'verify', 48);
    await sendMail(body.data.email, 'Xác thực tài khoản Tu Tiên Truyện 2D', `Chào đạo hữu,\n\nNhấn liên kết sau để xác thực email:\n${config().PUBLIC_URL}/api/auth/verify?token=${vt}\n\nLiên kết hết hạn sau 48 giờ.`);
    await securityLog(acc!.id, 'register', req.ip);
    const token = config().REQUIRE_EMAIL_VERIFIED === 'true' ? null : await createSession(acc!.id, req, body.data.device);
    return { ok: true, token, needVerify: config().REQUIRE_EMAIL_VERIFIED === 'true' };
  });

  const verify = async (token: string | undefined, req: FastifyRequest) => {
    if (!token) return false;
    const row = await q1<{ id: number; account_id: number }>("SELECT id, account_id FROM email_tokens WHERE token_hash = $1 AND kind = 'verify' AND used_at IS NULL AND expires_at > now()", [sha256(token)]);
    if (!row) return false;
    await tx(async (c) => {
      await c.query('UPDATE email_tokens SET used_at = now() WHERE id = $1', [row.id]);
      await c.query('UPDATE accounts SET email_verified_at = COALESCE(email_verified_at, now()) WHERE id = $1', [row.account_id]);
    });
    await securityLog(row.account_id, 'email_verified', req.ip);
    return true;
  };
  app.get('/api/auth/verify', async (req, reply) => {
    const ok = await verify((req.query as { token?: string }).token, req);
    reply.type('text/html; charset=utf-8').send(`<!doctype html><meta charset="utf-8"><title>Tu Tiên Truyện 2D</title><body style="font-family:sans-serif;background:#111;color:#eee;text-align:center;padding:60px"><h2>${ok ? 'Xác thực email thành công!' : 'Liên kết không hợp lệ hoặc đã hết hạn.'}</h2><p>Bạn có thể quay lại trò chơi.</p></body>`);
  });
  app.post('/api/auth/verify', async (req, reply) => {
    const ok = await verify((req.body as { token?: string })?.token, req);
    return ok ? { ok } : reply.code(400).send({ error: 'Mã xác thực không hợp lệ hoặc đã hết hạn' });
  });
  app.post('/api/auth/resend-verification', async (req, reply) => {
    const acc = await requireAccount(req, reply); if (!acc) return;
    if (acc.verified) return { ok: true };
    if (!(await rateLimit(`resend:${acc.id}`, 3, 3600))) return reply.code(429).send({ error: 'Gửi lại quá nhiều lần' });
    const vt = await issueEmailToken(acc.id, 'verify', 48);
    await sendMail(acc.email, 'Xác thực tài khoản Tu Tiên Truyện 2D', `Liên kết xác thực:\n${config().PUBLIC_URL}/api/auth/verify?token=${vt}`);
    return { ok: true };
  });

  app.post('/api/auth/login', async (req, reply) => {
    if (!(await rateLimit(`login:${req.ip}`, config().LOGIN_LIMIT_PER_10MIN, 600))) return reply.code(429).send({ error: 'Đăng nhập quá nhiều lần, thử lại sau' });
    const body = z.object({ email: Email, password: z.string().max(200), device: z.string().optional() }).safeParse(req.body);
    if (!body.success) return reply.code(400).send({ error: 'Thông tin đăng nhập không hợp lệ' });
    const a = await q1<{ id: number; password_hash: string; status: string; banned_until: Date | null; ban_reason: string | null; failed_logins: number; locked_until: Date | null; email_verified_at: Date | null; role: string }>('SELECT * FROM accounts WHERE lower(email) = $1', [body.data.email]);
    if (!a) { await hashPassword('timing-equalizer-1'); return reply.code(401).send({ error: 'Email hoặc mật khẩu không đúng' }); }
    if (a.locked_until && a.locked_until > new Date()) return reply.code(423).send({ error: 'Tài khoản tạm khóa do nhập sai nhiều lần. Thử lại sau ít phút.' });
    const ok = await verifyPassword(body.data.password, a.password_hash);
    if (!ok) {
      const failed = a.failed_logins + 1;
      await q("UPDATE accounts SET failed_logins = $2::int, locked_until = CASE WHEN $3::boolean THEN now() + ($4::text || ' minutes')::interval ELSE locked_until END WHERE id = $1", [a.id, failed >= MAX_FAILED ? 0 : failed, failed >= MAX_FAILED, String(LOCK_MIN)]);
      await securityLog(a.id, 'login_failed', req.ip, { failed });
      return reply.code(401).send({ error: 'Email hoặc mật khẩu không đúng' });
    }
    if (a.status === 'banned' && (!a.banned_until || a.banned_until > new Date())) {
      await securityLog(a.id, 'login_banned', req.ip);
      return reply.code(403).send({ error: `Tài khoản bị khóa${a.ban_reason ? ': ' + a.ban_reason : ''}${a.banned_until ? ' đến ' + a.banned_until.toISOString() : ''}` });
    }
    if (config().REQUIRE_EMAIL_VERIFIED === 'true' && !a.email_verified_at) return reply.code(403).send({ error: 'Vui lòng xác thực email trước khi đăng nhập' });
    await q("UPDATE accounts SET failed_logins = 0, locked_until = NULL, last_login_at = now(), status = CASE WHEN status='banned' AND banned_until <= now() THEN 'active' ELSE status END WHERE id = $1", [a.id]);
    const token = await createSession(a.id, req, body.data.device);
    await securityLog(a.id, 'login', req.ip, { device: body.data.device });
    return { token, account: { id: a.id, email: body.data.email, verified: !!a.email_verified_at, role: a.role } };
  });

  app.get('/api/auth/me', async (req, reply) => {
    const acc = await requireAccount(req, reply); if (!acc) return;
    return { id: acc.id, email: acc.email, verified: acc.verified, role: acc.role };
  });
  app.post('/api/auth/logout', async (req, reply) => {
    const acc = await requireAccount(req, reply); if (!acc) return;
    await q('UPDATE sessions SET revoked_at = now() WHERE id = $1', [acc.sessionId]);
    await securityLog(acc.id, 'logout', req.ip);
    return { ok: true };
  });
  app.get('/api/auth/sessions', async (req, reply) => {
    const acc = await requireAccount(req, reply); if (!acc) return;
    const rows = await q('SELECT id, device, ip, user_agent, created_at, last_seen_at FROM sessions WHERE account_id = $1 AND revoked_at IS NULL AND expires_at > now() ORDER BY last_seen_at DESC', [acc.id]);
    return rows.map((r) => ({ ...r, current: r.id === acc.sessionId }));
  });
  app.delete('/api/auth/sessions/:id', async (req, reply) => {
    const acc = await requireAccount(req, reply); if (!acc) return;
    const { id } = req.params as { id: string };
    if (!/^[0-9a-f-]{36}$/.test(id)) return reply.code(400).send({ error: 'Mã phiên không hợp lệ' });
    await q('UPDATE sessions SET revoked_at = now() WHERE id = $1 AND account_id = $2', [id, acc.id]);
    await securityLog(acc.id, 'session_revoked', req.ip, { session: id });
    return { ok: true };
  });
  app.post('/api/auth/logout-all', async (req, reply) => {
    const acc = await requireAccount(req, reply); if (!acc) return;
    await q('UPDATE sessions SET revoked_at = now() WHERE account_id = $1 AND id <> $2 AND revoked_at IS NULL', [acc.id, acc.sessionId]);
    await securityLog(acc.id, 'logout_all', req.ip);
    return { ok: true };
  });
  app.post('/api/auth/forgot', async (req, reply) => {
    if (!(await rateLimit(`forgot:${req.ip}`, 5, 3600))) return reply.code(429).send({ error: 'Quá nhiều yêu cầu' });
    const body = z.object({ email: Email }).safeParse(req.body);
    if (!body.success) return reply.code(400).send({ error: 'Email không hợp lệ' });
    const a = await q1<{ id: number }>('SELECT id FROM accounts WHERE lower(email) = $1', [body.data.email]);
    if (a) {
      const t = await issueEmailToken(a.id, 'reset', 1);
      await sendMail(body.data.email, 'Đặt lại mật khẩu Tu Tiên Truyện 2D', `Mã đặt lại mật khẩu (hết hạn sau 1 giờ):\n${t}\n\nNếu không phải bạn yêu cầu, hãy bỏ qua email này.`);
      await securityLog(a.id, 'password_reset_requested', req.ip);
    }
    return { ok: true }; // không tiết lộ email có tồn tại hay không
  });
  app.post('/api/auth/reset', async (req, reply) => {
    const body = z.object({ token: z.string().max(200), password: z.string() }).safeParse(req.body);
    if (!body.success) return reply.code(400).send({ error: 'Dữ liệu không hợp lệ' });
    const weak = validatePasswordStrength(body.data.password);
    if (weak) return reply.code(400).send({ error: weak });
    const row = await q1<{ id: number; account_id: number }>("SELECT id, account_id FROM email_tokens WHERE token_hash = $1 AND kind = 'reset' AND used_at IS NULL AND expires_at > now()", [sha256(body.data.token)]);
    if (!row) return reply.code(400).send({ error: 'Mã đặt lại không hợp lệ hoặc đã hết hạn' });
    const hash = await hashPassword(body.data.password);
    await tx(async (c) => {
      await c.query('UPDATE email_tokens SET used_at = now() WHERE id = $1', [row.id]);
      await c.query('UPDATE accounts SET password_hash = $2, failed_logins = 0, locked_until = NULL WHERE id = $1', [row.account_id, hash]);
      await c.query('UPDATE sessions SET revoked_at = now() WHERE account_id = $1 AND revoked_at IS NULL', [row.account_id]);
    });
    await securityLog(row.account_id, 'password_reset', req.ip);
    return { ok: true };
  });
  app.post('/api/auth/change-password', async (req, reply) => {
    const acc = await requireAccount(req, reply); if (!acc) return;
    const body = z.object({ oldPassword: z.string().max(200), newPassword: z.string() }).safeParse(req.body);
    if (!body.success) return reply.code(400).send({ error: 'Dữ liệu không hợp lệ' });
    const weak = validatePasswordStrength(body.data.newPassword);
    if (weak) return reply.code(400).send({ error: weak });
    const a = await q1<{ password_hash: string }>('SELECT password_hash FROM accounts WHERE id = $1', [acc.id]);
    if (!a || !(await verifyPassword(body.data.oldPassword, a.password_hash))) return reply.code(400).send({ error: 'Mật khẩu cũ không đúng' });
    await q('UPDATE accounts SET password_hash = $2 WHERE id = $1', [acc.id, await hashPassword(body.data.newPassword)]);
    await q('UPDATE sessions SET revoked_at = now() WHERE account_id = $1 AND id <> $2 AND revoked_at IS NULL', [acc.id, acc.sessionId]);
    await securityLog(acc.id, 'password_changed', req.ip);
    return { ok: true };
  });
}

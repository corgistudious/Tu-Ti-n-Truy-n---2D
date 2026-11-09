import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { EVENT_SCHEDULE, ITEMS, MAPS, MONSTERS, QUESTS, TILE, WORLD_EVENTS } from '@tt/shared';
import { q, q1, tx } from '../db.js';
import { adminLog } from '../services/audit.js';
import { changeCurrency } from '../services/currency.js';
import { rollAffixes } from '../services/items.js';
import { accountFromToken, bearer, type AccountCtx } from './auth.js';
import { world } from '../game/world.js';
import { sendMail } from '../game/rpc/economy.js';

const LEVEL = { player: 0, support: 1, gm: 2, admin: 3 } as const;
type Role = keyof typeof LEVEL;

async function staff(req: FastifyRequest, reply: FastifyReply, min: Role): Promise<AccountCtx | null> {
  const acc = await accountFromToken(bearer(req));
  if (!acc) { reply.code(401).send({ error: 'Chưa đăng nhập' }); return null; }
  if (LEVEL[acc.role] < LEVEL[min]) { reply.code(403).send({ error: 'Không đủ quyền' }); return null; }
  return acc;
}

export function adminRoutes(app: FastifyInstance): void {
  app.get('/api/admin/me', async (req, reply) => { const a = await staff(req, reply, 'support'); if (!a) return; return { id: a.id, email: a.email, role: a.role }; });

  app.get('/api/admin/overview', async (req, reply) => {
    if (!(await staff(req, reply, 'support'))) return;
    const counts = await q1('SELECT (SELECT count(*) FROM accounts)::int AS accounts, (SELECT count(*) FROM characters WHERE deleted_at IS NULL)::int AS characters, (SELECT count(*) FROM reports WHERE status = \'open\')::int AS open_reports, (SELECT count(*) FROM server_errors WHERE created_at > now() - interval \'24 hours\')::int AS errors_24h');
    const money = await q1('SELECT COALESCE(sum(gold),0)::bigint AS gold, COALESCE(sum(spirit_stones),0)::bigint AS spirit_stones FROM character_currencies');
    return { world: world().stats(), counts, money };
  });
  app.get('/api/admin/online', async (req, reply) => {
    if (!(await staff(req, reply, 'support'))) return;
    return world().online().map((s) => ({ charId: s.charId, accountId: s.accountId, name: s.name, realm: s.realmLabel(), map: s.ent?.inst.def.name, key: s.ent?.inst.key, connected: !!s.ws, violations: Math.round(s.violations) }));
  });

  // -------- tài khoản --------
  app.get('/api/admin/accounts', async (req, reply) => {
    if (!(await staff(req, reply, 'support'))) return;
    const term = String((req.query as { q?: string }).q ?? '').slice(0, 100);
    return q(`SELECT a.id, a.email, a.role, a.status, a.banned_until, a.muted_until, a.created_at, a.last_login_at, a.email_verified_at IS NOT NULL AS verified,
              (SELECT json_agg(json_build_object('id', c.id, 'name', c.name, 'realm', c.realm_idx)) FROM characters c WHERE c.account_id = a.id AND c.deleted_at IS NULL) AS characters
              FROM accounts a WHERE $1 = '' OR a.email ILIKE '%' || $1 || '%' OR EXISTS (SELECT 1 FROM characters c WHERE c.account_id = a.id AND c.name ILIKE '%' || $1 || '%') ORDER BY a.id DESC LIMIT 100`, [term]);
  });
  app.get('/api/admin/accounts/:id', async (req, reply) => {
    if (!(await staff(req, reply, 'support'))) return;
    const id = Number((req.params as { id: string }).id);
    const acc = await q1('SELECT id, email, role, status, ban_reason, banned_until, muted_until, created_at, last_login_at FROM accounts WHERE id = $1', [id]);
    if (!acc) return reply.code(404).send({ error: 'Không tìm thấy' });
    const security = await q('SELECT event, ip, meta, created_at FROM security_logs WHERE account_id = $1 ORDER BY id DESC LIMIT 100', [id]);
    const sessions = await q('SELECT id, device, ip, created_at, last_seen_at FROM sessions WHERE account_id = $1 AND revoked_at IS NULL AND expires_at > now()', [id]);
    const characters = await q('SELECT id, name, realm_idx, layer, map_id, created_at, last_played_at, delete_requested_at, deleted_at FROM characters WHERE account_id = $1', [id]);
    return { account: acc, security, sessions, characters };
  });
  const Ban = z.object({ reason: z.string().min(1).max(300), hours: z.number().int().positive().max(24 * 3650).optional() });
  app.post('/api/admin/accounts/:id/ban', async (req, reply) => {
    const a = await staff(req, reply, 'gm'); if (!a) return;
    const id = Number((req.params as { id: string }).id);
    const b = Ban.safeParse(req.body); if (!b.success) return reply.code(400).send({ error: 'Dữ liệu không hợp lệ' });
    const target = await q1<{ role: Role }>('SELECT role FROM accounts WHERE id = $1', [id]);
    if (!target) return reply.code(404).send({ error: 'Không tìm thấy' });
    if (LEVEL[target.role] >= LEVEL[a.role]) return reply.code(403).send({ error: 'Không thể khóa tài khoản cùng/cao cấp hơn' });
    await tx(async (c) => {
      await c.query("UPDATE accounts SET status = 'banned', ban_reason = $2, banned_until = CASE WHEN $3::int IS NULL THEN NULL ELSE now() + ($3 || ' hours')::interval END WHERE id = $1", [id, b.data.reason, b.data.hours ?? null]);
      await c.query('UPDATE sessions SET revoked_at = now() WHERE account_id = $1 AND revoked_at IS NULL', [id]);
    });
    const cid = world().byAccount.get(id);
    if (cid) { const s = world().sessions.get(cid); s?.send({ t: 'kick', reason: `Tài khoản bị khóa: ${b.data.reason}` }); s?.ws?.close(4002, 'banned'); if (s) await world().removeSession(s); }
    await adminLog(a.id, 'ban', 'account', id, b.data, req.ip);
    return { ok: true };
  });
  app.post('/api/admin/accounts/:id/unban', async (req, reply) => {
    const a = await staff(req, reply, 'gm'); if (!a) return;
    const id = Number((req.params as { id: string }).id);
    await q("UPDATE accounts SET status = 'active', ban_reason = NULL, banned_until = NULL WHERE id = $1", [id]);
    await adminLog(a.id, 'unban', 'account', id, {}, req.ip);
    return { ok: true };
  });
  app.post('/api/admin/accounts/:id/mute', async (req, reply) => {
    const a = await staff(req, reply, 'support'); if (!a) return;
    const id = Number((req.params as { id: string }).id);
    const b = z.object({ minutes: z.number().int().positive().max(60 * 24 * 365), reason: z.string().max(300).optional() }).safeParse(req.body);
    if (!b.success) return reply.code(400).send({ error: 'Dữ liệu không hợp lệ' });
    const r = await q1<{ muted_until: Date }>("UPDATE accounts SET muted_until = now() + ($2 || ' minutes')::interval WHERE id = $1 RETURNING muted_until", [id, String(b.data.minutes)]);
    const cid = world().byAccount.get(id);
    if (cid && r) { const s = world().sessions.get(cid); if (s) { s.mutedUntil = r.muted_until; s.notify(`Bạn bị cấm chat ${b.data.minutes} phút`, 'warn'); } }
    await adminLog(a.id, 'mute', 'account', id, b.data, req.ip);
    return { ok: true };
  });
  app.post('/api/admin/accounts/:id/unmute', async (req, reply) => {
    const a = await staff(req, reply, 'support'); if (!a) return;
    const id = Number((req.params as { id: string }).id);
    await q('UPDATE accounts SET muted_until = NULL WHERE id = $1', [id]);
    const cid = world().byAccount.get(id); if (cid) { const s = world().sessions.get(cid); if (s) s.mutedUntil = null; }
    await adminLog(a.id, 'unmute', 'account', id, {}, req.ip);
    return { ok: true };
  });
  app.post('/api/admin/accounts/:id/role', async (req, reply) => {
    const a = await staff(req, reply, 'admin'); if (!a) return;
    const id = Number((req.params as { id: string }).id);
    const b = z.object({ role: z.enum(['player', 'support', 'gm', 'admin']) }).safeParse(req.body);
    if (!b.success) return reply.code(400).send({ error: 'Vai trò không hợp lệ' });
    if (id === a.id) return reply.code(400).send({ error: 'Không thể tự đổi vai trò' });
    await q('UPDATE accounts SET role = $2 WHERE id = $1', [id, b.data.role]);
    await adminLog(a.id, 'set_role', 'account', id, b.data, req.ip);
    return { ok: true };
  });

  // -------- nhân vật --------
  app.get('/api/admin/characters/:id', async (req, reply) => {
    if (!(await staff(req, reply, 'support'))) return;
    const id = Number((req.params as { id: string }).id);
    const ch = await q1('SELECT * FROM characters WHERE id = $1', [id]);
    if (!ch) return reply.code(404).send({ error: 'Không tìm thấy' });
    const wallet = await q1('SELECT * FROM character_currencies WHERE character_id = $1', [id]);
    const items = await q('SELECT id, template_id, container, slot, quantity, enhance, refine, bound, locked, created_at, origin FROM item_instances WHERE owner_id = $1 ORDER BY container, slot', [id]);
    const quests = await q('SELECT quest_id, state, progress, completed_at FROM quest_progress WHERE character_id = $1', [id]);
    const pets = await q('SELECT * FROM pets WHERE owner_id = $1', [id]);
    const cult = await q('SELECT * FROM cultivation_logs WHERE character_id = $1 ORDER BY id DESC LIMIT 50', [id]);
    return { character: ch, wallet, items: items.map((i) => ({ ...i, name: ITEMS[(i as { template_id: string }).template_id]?.name })), quests, pets, cultivation: cult, online: world().isOnline(id) };
  });
  app.post('/api/admin/characters/:id/grant', async (req, reply) => {
    const a = await staff(req, reply, 'gm'); if (!a) return;
    const id = Number((req.params as { id: string }).id);
    const b = z.object({ item: z.string(), qty: z.number().int().positive().max(9999), reason: z.string().min(3).max(300) }).safeParse(req.body);
    if (!b.success || !ITEMS[b.data.item]) return reply.code(400).send({ error: 'Dữ liệu không hợp lệ' });
    await tx(async (c) => {
      // tạo vật phẩm ở trạng thái ký gửi rồi gửi qua thư (không phụ thuộc chỗ trống túi); nguồn "admin" được ghi item_logs
      const d = ITEMS[b.data.item];
      const rows = [];
      let left = b.data.qty;
      while (left > 0) {
        const n = d.stackable ? Math.min(left, d.maxStack) : 1;
        const r = await c.query("INSERT INTO item_instances(template_id, owner_id, container, quantity, affixes, durability, origin) VALUES ($1,$2,'escrow',$3,$4,$5,$6) RETURNING *", [d.id, id, n, JSON.stringify(rollAffixes(d)), d.durability ?? null, `admin:${a.id}`]);
        await c.query('INSERT INTO item_logs(item_id, template_id, character_id, action, quantity, details) VALUES ($1,$2,$3,$4,$5,$6)', [r.rows[0].id, d.id, id, 'admin_grant', n, JSON.stringify({ admin: a.id, reason: b.data.reason })]);
        rows.push(r.rows[0]);
        left -= n;
      }
      await sendMail(c, id, 'Quản Trị Viên', 'Vật phẩm từ GM', b.data.reason, { items: rows });
    });
    await adminLog(a.id, 'grant_item', 'character', id, b.data, req.ip);
    return { ok: true };
  });
  app.post('/api/admin/characters/:id/currency', async (req, reply) => {
    const a = await staff(req, reply, 'admin'); if (!a) return;
    const id = Number((req.params as { id: string }).id);
    const b = z.object({ currency: z.enum(['gold', 'spirit_stones']), delta: z.number().int(), reason: z.string().min(3).max(300) }).safeParse(req.body);
    if (!b.success) return reply.code(400).send({ error: 'Dữ liệu không hợp lệ' });
    const bal = await tx((c) => changeCurrency(c, id, b.data.currency, b.data.delta, 'admin_adjust', 'admin', a.id));
    await adminLog(a.id, 'currency_adjust', 'character', id, b.data, req.ip);
    return { ok: true, balance: bal };
  });
  app.post('/api/admin/characters/:id/kick', async (req, reply) => {
    const a = await staff(req, reply, 'support'); if (!a) return;
    const id = Number((req.params as { id: string }).id);
    const s = world().sessions.get(id);
    if (s) { s.send({ t: 'kick', reason: 'Bị quản trị viên ngắt kết nối' }); s.ws?.close(4004, 'kicked'); await world().removeSession(s); }
    await adminLog(a.id, 'kick', 'character', id, {}, req.ip);
    return { ok: true, wasOnline: !!s };
  });

  // -------- kinh tế & lịch sử --------
  app.get('/api/admin/economy', async (req, reply) => {
    if (!(await staff(req, reply, 'gm'))) return;
    const flows = await q("SELECT currency, reason, sum(delta)::bigint AS total, count(*)::int AS n FROM currency_ledger WHERE created_at > now() - interval '24 hours' GROUP BY currency, reason ORDER BY currency, total DESC");
    const totals = await q1('SELECT COALESCE(sum(gold),0)::bigint AS gold, COALESCE(sum(spirit_stones),0)::bigint AS spirit_stones FROM character_currencies');
    const market = await q1("SELECT count(*) FILTER (WHERE status='active')::int AS active, count(*) FILTER (WHERE status='sold' AND closed_at > now() - interval '24 hours')::int AS sold_24h FROM market_listings");
    const topRich = await q('SELECT c.name, w.gold, w.spirit_stones FROM character_currencies w JOIN characters c ON c.id = w.character_id ORDER BY w.gold DESC LIMIT 10');
    return { flows, totals, market, topRich };
  });
  app.get('/api/admin/trades', async (req, reply) => {
    if (!(await staff(req, reply, 'support'))) return;
    const ch = Number((req.query as { char?: string }).char ?? 0);
    return q('SELECT t.*, a.name AS name_a, b.name AS name_b FROM trades t JOIN characters a ON a.id = t.char_a JOIN characters b ON b.id = t.char_b WHERE $1 = 0 OR t.char_a = $1 OR t.char_b = $1 ORDER BY t.id DESC LIMIT 200', [ch]);
  });
  app.get('/api/admin/ledger', async (req, reply) => {
    if (!(await staff(req, reply, 'support'))) return;
    const ch = Number((req.query as { char?: string }).char ?? 0);
    return q('SELECT * FROM currency_ledger WHERE $1 = 0 OR character_id = $1 ORDER BY id DESC LIMIT 300', [ch]);
  });
  app.get('/api/admin/item-logs', async (req, reply) => {
    if (!(await staff(req, reply, 'support'))) return;
    const ch = Number((req.query as { char?: string }).char ?? 0);
    return q('SELECT * FROM item_logs WHERE $1 = 0 OR character_id = $1 ORDER BY id DESC LIMIT 300', [ch]);
  });
  app.get('/api/admin/chat', async (req, reply) => {
    if (!(await staff(req, reply, 'support'))) return;
    const ch = Number((req.query as { char?: string }).char ?? 0);
    return q('SELECT l.*, c.name FROM chat_logs l JOIN characters c ON c.id = l.character_id WHERE $1 = 0 OR l.character_id = $1 ORDER BY l.id DESC LIMIT 300', [ch]);
  });

  // -------- nội dung: vật phẩm / nhiệm vụ / boss / sự kiện --------
  app.get('/api/admin/content', async (req, reply) => {
    if (!(await staff(req, reply, 'gm'))) return;
    const overrides = await q('SELECT * FROM content_overrides ORDER BY kind, ref_id');
    return {
      overrides,
      items: Object.values(ITEMS).map((i) => ({ id: i.id, name: i.name, type: i.type, rarity: i.rarity, value: i.value })),
      quests: Object.values(QUESTS).map((x) => ({ id: x.id, name: x.name, kind: x.kind, chapter: x.chapter })),
      bosses: Object.values(MONSTERS).filter((m) => m.rank !== 'normal').map((m) => ({ id: m.id, name: m.name, rank: m.rank, level: m.level })),
      maps: Object.values(MAPS).filter((m) => !m.instance).map((m) => ({ id: m.id, name: m.name })),
      events: Object.values(WORLD_EVENTS),
    };
  });
  app.post('/api/admin/content/override', async (req, reply) => {
    const a = await staff(req, reply, 'gm'); if (!a) return;
    const b = z.object({ kind: z.enum(['item', 'quest', 'boss', 'shop']), ref: z.string().max(80), data: z.record(z.unknown()).nullable() }).safeParse(req.body);
    if (!b.success) return reply.code(400).send({ error: 'Dữ liệu không hợp lệ' });
    if (b.data.data === null) await q('DELETE FROM content_overrides WHERE kind = $1 AND ref_id = $2', [b.data.kind, b.data.ref]);
    else await q('INSERT INTO content_overrides(kind, ref_id, data, updated_by) VALUES ($1,$2,$3,$4) ON CONFLICT (kind, ref_id) DO UPDATE SET data = $3, updated_by = $4, updated_at = now()', [b.data.kind, b.data.ref, JSON.stringify(b.data.data), a.id]);
    await adminLog(a.id, 'content_override', b.data.kind, b.data.ref, { data: b.data.data }, req.ip);
    return { ok: true };
  });
  app.post('/api/admin/boss/spawn', async (req, reply) => {
    const a = await staff(req, reply, 'gm'); if (!a) return;
    const b = z.object({ monster: z.string(), map: z.string(), channel: z.number().int().min(1).max(5).optional() }).safeParse(req.body);
    if (!b.success || !MONSTERS[b.data.monster] || !MAPS[b.data.map] || MAPS[b.data.map].instance) return reply.code(400).send({ error: 'Dữ liệu không hợp lệ' });
    const inst = world().getPublicInstance(b.data.map, b.data.channel ?? 1);
    const m = inst.spawnMonster(b.data.monster, inst.grid.w * TILE * 0.6, { noRespawn: true, tag: 'event' });
    world().announce(`${m.name} xuất hiện tại ${inst.def.name} (kênh ${inst.channel})!`);
    await adminLog(a.id, 'boss_spawn', 'monster', b.data.monster, b.data, req.ip);
    return { ok: true, id: m.id };
  });
  app.get('/api/admin/events', async (req, reply) => {
    if (!(await staff(req, reply, 'gm'))) return;
    return { scheduled: await q('SELECT * FROM events ORDER BY starts_at DESC LIMIT 100'), active: world().activeEvents };
  });
  app.post('/api/admin/events', async (req, reply) => {
    const a = await staff(req, reply, 'gm'); if (!a) return;
    const b = z.object({ key: z.string(), startsAt: z.string().datetime().optional(), durationMin: z.number().int().positive().max(60 * 24 * 14).optional() }).safeParse(req.body);
    if (!b.success || !WORLD_EVENTS[b.data.key]) return reply.code(400).send({ error: 'Sự kiện không hợp lệ' });
    const def = WORLD_EVENTS[b.data.key];
    const starts = b.data.startsAt ? new Date(b.data.startsAt) : new Date();
    const ends = new Date(starts.getTime() + (b.data.durationMin ?? def.durationMin) * 60000);
    const r = await q1<{ id: number }>('INSERT INTO events(event_key, name, starts_at, ends_at, created_by) VALUES ($1,$2,$3,$4,$5) RETURNING id', [def.id, def.name, starts, ends, a.id]);
    await adminLog(a.id, 'event_create', 'event', r!.id, b.data, req.ip);
    await runEventScheduler();
    return { ok: true, id: r!.id };
  });
  app.post('/api/admin/events/:id/cancel', async (req, reply) => {
    const a = await staff(req, reply, 'gm'); if (!a) return;
    const id = Number((req.params as { id: string }).id);
    await q('UPDATE events SET cancelled_at = now() WHERE id = $1', [id]);
    world().endEvent(id);
    await adminLog(a.id, 'event_cancel', 'event', id, {}, req.ip);
    return { ok: true };
  });
  app.post('/api/admin/announce', async (req, reply) => {
    const a = await staff(req, reply, 'gm'); if (!a) return;
    const b = z.object({ message: z.string().min(1).max(300) }).safeParse(req.body);
    if (!b.success) return reply.code(400).send({ error: 'Nội dung không hợp lệ' });
    await q('INSERT INTO announcements(message, created_by) VALUES ($1,$2)', [b.data.message, a.id]);
    world().announce(b.data.message);
    await adminLog(a.id, 'announce', null, null, b.data, req.ip);
    return { ok: true };
  });

  // -------- báo cáo, lỗi, nhật ký --------
  app.get('/api/admin/reports', async (req, reply) => {
    if (!(await staff(req, reply, 'support'))) return;
    return q("SELECT r.*, a.name AS reporter, t.name AS target, t.account_id AS target_account FROM reports r JOIN characters a ON a.id = r.reporter_id JOIN characters t ON t.id = r.target_id ORDER BY (r.status = 'open') DESC, r.id DESC LIMIT 200");
  });
  app.post('/api/admin/reports/:id/resolve', async (req, reply) => {
    const a = await staff(req, reply, 'support'); if (!a) return;
    const id = Number((req.params as { id: string }).id);
    const b = z.object({ status: z.enum(['resolved', 'dismissed']) }).safeParse(req.body);
    if (!b.success) return reply.code(400).send({ error: 'Dữ liệu không hợp lệ' });
    await q('UPDATE reports SET status = $2, handled_by = $3, handled_at = now() WHERE id = $1', [id, b.data.status, a.id]);
    await adminLog(a.id, 'report_' + b.data.status, 'report', id, {}, req.ip);
    return { ok: true };
  });
  app.get('/api/admin/errors', async (req, reply) => { if (!(await staff(req, reply, 'gm'))) return; return q('SELECT * FROM server_errors ORDER BY id DESC LIMIT 200'); });
  app.get('/api/admin/logs', async (req, reply) => { if (!(await staff(req, reply, 'admin'))) return; return q('SELECT l.*, a.email FROM admin_logs l LEFT JOIN accounts a ON a.id = l.admin_id ORDER BY l.id DESC LIMIT 300'); });
  app.get('/api/admin/staff', async (req, reply) => { if (!(await staff(req, reply, 'admin'))) return; return q("SELECT id, email, role, last_login_at FROM accounts WHERE role <> 'player' ORDER BY role, id"); });
  app.get('/api/admin/mail-outbox', async (req, reply) => { if (!(await staff(req, reply, 'admin'))) return; return q('SELECT id, to_email, subject, body, sent_at, error, created_at FROM mail_outbox ORDER BY id DESC LIMIT 100'); });
}

/** Bộ lập lịch sự kiện: tạo bản ghi sự kiện định kỳ theo EVENT_SCHEDULE (idempotent nhờ unique (event_key, starts_at)) rồi bật/tắt sự kiện */
export async function runEventScheduler(): Promise<void> {
  const now = new Date();
  for (const sch of EVENT_SCHEDULE) {
    const def = WORLD_EVENTS[sch.key];
    if (!def) continue;
    for (const h of sch.hoursUtc) {
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), h, 0, 0));
      const end = new Date(start.getTime() + def.durationMin * 60000);
      if (now >= start && now < end) await q('INSERT INTO events(event_key, name, starts_at, ends_at) VALUES ($1,$2,$3,$4) ON CONFLICT (event_key, starts_at) DO NOTHING', [def.id, def.name, start, end]);
    }
  }
  const due = await q<{ id: number; event_key: string; ends_at: Date }>('SELECT id, event_key, ends_at FROM events WHERE cancelled_at IS NULL AND starts_at <= now() AND ends_at > now()');
  for (const e of due) world().startEvent(e.id, e.event_key, new Date(e.ends_at).getTime());
  for (const a of [...world().activeEvents]) if (Date.now() >= a.endsAt) world().endEvent(a.id);
}

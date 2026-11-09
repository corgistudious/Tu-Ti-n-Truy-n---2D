import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { LIMITS, MAPS, groundYAt, generateGrid, gameData } from '@tt/shared';
import { q, q1, tx } from '../db.js';
import { requireAccount } from './auth.js';
import { validateCharacterName } from '../services/filter.js';
import { grantItems } from '../services/items.js';
import { securityLog } from '../services/audit.js';
import { world } from '../game/world.js';

export const APPEARANCE_OPTIONS = {
  hair: 6, face: 4, eyes: 4, outfit: 4,
  hairColors: ['#1a1a1a', '#4a2a1a', '#8a5a2a', '#d8c08a', '#c0c0c8', '#7a2a2a', '#2a3a6a', '#3a6a4a'],
  skins: ['#f6d7b8', '#f2c9a0', '#e0ac7e', '#c58c5c', '#8d5a3b'],
  outfitColors: ['#3a6aaa', '#aa3a3a', '#3a8a5a', '#6a4a8a', '#c0a040', '#dadada', '#2a2a2a', '#d07a9a'],
};
const Hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const AppearanceSchema = z.object({
  gender: z.enum(['male', 'female']),
  hair: z.number().int().min(0).max(APPEARANCE_OPTIONS.hair - 1),
  hairColor: Hex.refine((v) => APPEARANCE_OPTIONS.hairColors.includes(v.toLowerCase()), 'màu tóc'),
  face: z.number().int().min(0).max(APPEARANCE_OPTIONS.face - 1),
  eyes: z.number().int().min(0).max(APPEARANCE_OPTIONS.eyes - 1),
  skin: Hex.refine((v) => APPEARANCE_OPTIONS.skins.includes(v.toLowerCase()), 'màu da'),
  outfit: z.number().int().min(0).max(APPEARANCE_OPTIONS.outfit - 1),
  outfitColor: Hex.refine((v) => APPEARANCE_OPTIONS.outfitColors.includes(v.toLowerCase()), 'màu áo'),
});

/** Hoàn tất xóa các nhân vật đã qua thời gian bảo vệ */
export async function finalizeDeletions(): Promise<number> {
  const r = await q("UPDATE characters SET deleted_at = now() WHERE deleted_at IS NULL AND delete_requested_at IS NOT NULL AND delete_requested_at < now() - ($1 || ' hours')::interval RETURNING id", [String(LIMITS.characterDeleteProtectHours)]);
  return r.length;
}

export function characterRoutes(app: FastifyInstance): void {
  app.get('/api/data/version', async () => ({ version: gameData().version }));
  app.get('/api/data/bundle', async (req, reply) => {
    const d = gameData();
    const etag = `"${d.version}"`;
    if (req.headers['if-none-match'] === etag) return reply.code(304).send();
    reply.header('ETag', etag).header('Cache-Control', 'public, max-age=300');
    return d;
  });
  app.get('/api/data/appearance-options', async () => APPEARANCE_OPTIONS);

  app.get('/api/characters', async (req, reply) => {
    const acc = await requireAccount(req, reply); if (!acc) return;
    await finalizeDeletions();
    return q(`SELECT id, name, gender, appearance, realm_idx, layer, map_id, last_played_at, delete_requested_at, title, combat_power
              FROM characters WHERE account_id = $1 AND deleted_at IS NULL ORDER BY id`, [acc.id]);
  });

  app.post('/api/characters', async (req, reply) => {
    const acc = await requireAccount(req, reply); if (!acc) return;
    const body = z.object({ name: z.string(), appearance: AppearanceSchema }).safeParse(req.body);
    if (!body.success) return reply.code(400).send({ error: 'Dữ liệu ngoại hình không hợp lệ' });
    const name = body.data.name.normalize('NFC').trim();
    const bad = validateCharacterName(name);
    if (bad) return reply.code(400).send({ error: bad });
    const count = await q1<{ n: number }>('SELECT count(*)::int AS n FROM characters WHERE account_id = $1 AND deleted_at IS NULL', [acc.id]);
    if ((count?.n ?? 0) >= LIMITS.charactersPerAccount) return reply.code(400).send({ error: `Mỗi tài khoản tối đa ${LIMITS.charactersPerAccount} nhân vật` });
    const ap = { ...body.data.appearance, hairColor: body.data.appearance.hairColor.toLowerCase(), skin: body.data.appearance.skin.toLowerCase(), outfitColor: body.data.appearance.outfitColor.toLowerCase() };
    const startMap = MAPS['tan_thu_thon'];
    const spawnY = groundYAt(generateGrid(startMap), startMap.spawnX);
    try {
      const id = await tx(async (c) => {
        const r = await c.query('INSERT INTO characters(account_id, name, gender, appearance, map_id, x, y, hotbar, hp, mp) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,-1,-1) RETURNING id',
          [acc.id, name, ap.gender, JSON.stringify(ap), startMap.id, startMap.spawnX, spawnY, JSON.stringify(['basic_attack'])]);
        const cid = r.rows[0].id as number;
        await c.query('INSERT INTO character_currencies(character_id, gold) VALUES ($1, 100)', [cid]);
        await c.query("INSERT INTO currency_ledger(character_id, currency, delta, balance_after, reason) VALUES ($1,'gold',100,100,'character_created')", [cid]);
        await c.query('INSERT INTO character_stats(character_id) VALUES ($1)', [cid]);
        await c.query("INSERT INTO character_skills(character_id, skill_id, level) VALUES ($1, 'basic_attack', 1)", [cid]);
        await grantItems(c, cid, [{ item: 'pill_hp_1', qty: 5, bound: true }, { item: 'tal_return', qty: 2, bound: true }], 'starter');
        return cid;
      });
      await securityLog(acc.id, 'character_created', req.ip, { characterId: id });
      return { id };
    } catch (e) {
      if ((e as { code?: string }).code === '23505') return reply.code(409).send({ error: 'Tên nhân vật đã tồn tại' });
      throw e;
    }
  });

  app.post('/api/characters/:id/delete', async (req, reply) => {
    const acc = await requireAccount(req, reply); if (!acc) return;
    const id = Number((req.params as { id: string }).id);
    const body = z.object({ confirmName: z.string() }).safeParse(req.body);
    const ch = await q1<{ name: string }>('SELECT name FROM characters WHERE id = $1 AND account_id = $2 AND deleted_at IS NULL', [id, acc.id]);
    if (!ch) return reply.code(404).send({ error: 'Không tìm thấy nhân vật' });
    if (!body.success || body.data.confirmName.normalize('NFC') !== ch.name) return reply.code(400).send({ error: 'Nhập chính xác tên nhân vật để xác nhận' });
    const gm = await q1('SELECT 1 FROM guild_members WHERE character_id = $1 AND rank = \'leader\'', [id]);
    if (gm) return reply.code(400).send({ error: 'Hãy nhường chức Tông Chủ trước khi xóa nhân vật' });
    if (world().isOnline(id)) return reply.code(400).send({ error: 'Nhân vật đang trực tuyến' });
    await q('UPDATE characters SET delete_requested_at = now() WHERE id = $1', [id]);
    await securityLog(acc.id, 'character_delete_requested', req.ip, { characterId: id });
    return { ok: true, finalizeAfterHours: LIMITS.characterDeleteProtectHours };
  });
  app.post('/api/characters/:id/restore', async (req, reply) => {
    const acc = await requireAccount(req, reply); if (!acc) return;
    const id = Number((req.params as { id: string }).id);
    const r = await q('UPDATE characters SET delete_requested_at = NULL WHERE id = $1 AND account_id = $2 AND deleted_at IS NULL RETURNING id', [id, acc.id]);
    if (!r.length) return reply.code(404).send({ error: 'Không tìm thấy nhân vật' });
    await securityLog(acc.id, 'character_restored', req.ip, { characterId: id });
    return { ok: true };
  });
}

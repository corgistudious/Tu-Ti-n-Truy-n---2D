import { npcX, LIMITS, MAPS, NEAREST_CITY, NPCS, QUESTS, SHOPS, TILE, WORLD_TIERS, realmDef, type MapDef } from '@tt/shared';
import { q, q1, tx } from '../../db.js';
import { redis } from '../../redis.js';
import { changeCurrency } from '../../services/currency.js';
import { GameError, assert } from '../../services/errors.js';
import { maskProfanity, sanitizeText } from '../../services/filter.js';
import { accept, canAccept, nearNpc, npcQuests, questEvent, questView, startEscortIfNeeded, turnIn } from '../quests.js';
import type { PlayerSession } from '../player.js';
import { int, oneOf, optStr, rpc, str } from './registry.js';

// ---------- NPC & nhiệm vụ ----------
rpc('npc.talk', (s, p) => {
  const npcId = str(p, 'npc', 60);
  const npc = NPCS[npcId];
  assert(npc, 'NPC không tồn tại');
  assert(nearNpc(s, npcId), 'Quá xa NPC');
  questEvent(s, 'talk', npcId, 1);
  questEvent(s, 'deliver', npcId, 1);
  // hộ tống thất bại có thể bắt đầu lại khi nói chuyện với NPC được hộ tống
  for (const [qid, qs] of s.quests) if (qs.state === 'active' && QUESTS[qid]?.objectives.some((o) => o.type === 'escort' && o.target === npcId)) startEscortIfNeeded(s, qid);
  const qsList = npcQuests(s, npcId);
  return {
    npc: { id: npc.id, name: npc.name, title: npc.title, greeting: npc.greeting, services: npc.services ?? [], shop: npc.shop ?? null, teleports: npc.teleports ?? [] },
    offer: qsList.offer.map((id) => ({ id, name: QUESTS[id].name, choices: QUESTS[id].choices?.map((c) => ({ id: c.id, text: c.text })), dialogue: QUESTS[id].dialogue.offer, rewards: QUESTS[id].rewards, objectives: QUESTS[id].objectives.map((o) => o.desc) })),
    progress: qsList.progress.map((id) => ({ id, name: QUESTS[id].name, text: QUESTS[id].dialogue.progress, complete: QUESTS[id].dialogue.complete, choices: QUESTS[id].choices?.map((c) => ({ id: c.id, text: c.text, rep: c.rep })) })),
  };
});
rpc('quest.accept', (s, p) => { accept(s, str(p, 'id', 60)); return { ok: true }; });
rpc('quest.turnIn', async (s, p) => turnIn(s, str(p, 'id', 60), optStr(p, 'choice', 40)));
rpc('quest.abandon', (s, p) => {
  const id = str(p, 'id', 60);
  const qs = s.quests.get(id);
  assert(qs?.state === 'active', 'Không có nhiệm vụ này');
  assert(QUESTS[id]?.kind !== 'main', 'Không thể hủy nhiệm vụ chính tuyến');
  s.quests.delete(id);
  for (const e of [...s.ent.inst.escorts.values()]) if (e.questId === id && e.ownerChar === s.charId) s.ent.inst.escorts.delete(e.id);
  q('DELETE FROM quest_progress WHERE character_id = $1 AND quest_id = $2', [s.charId, id]).catch(() => undefined);
  return { ok: true };
});
rpc('quest.list', async (s) => {
  const active = await tx((c) => questView(s, c));
  const done = [...s.quests].filter(([, v]) => v.state === 'done').map(([k]) => k);
  // gợi ý nhiệm vụ kế tiếp có thể nhận (chính tuyến)
  const available = Object.values(QUESTS).filter((d) => d.kind !== 'hidden' && !canAccept(s, d)).map((d) => ({ id: d.id, name: d.name, giver: d.giver, giverName: NPCS[d.giver]?.name, kind: d.kind, map: Object.values(MAPS).find((m) => m.npcs.some((n) => n.npc === d.giver))?.name }));
  return { active, done, available };
});

// ---------- tương tác điểm điều tra ----------
rpc('interact.use', (s, p) => {
  const id = str(p, 'id', 60);
  const it = s.ent.inst.def.interacts.find((x) => x.id === id);
  assert(it, 'Không có gì để điều tra');
  assert(Math.abs(it.x - s.ent.x) < 100, 'Quá xa');
  const d = QUESTS[it.quest];
  const st = s.quests.get(it.quest);
  if (!st && d.kind === 'hidden' && !canAccept(s, d)) {
    s.quests.set(d.id, { state: 'active', progress: {}, times: 0, completedAt: null, dirty: true });
    s.notify(`Phát hiện nhiệm vụ ẩn: ${d.name}`, 'good');
    s.send({ t: 'ev', k: 'questAccepted', id: d.id });
  }
  if (s.quests.get(it.quest)?.state !== 'active') return { ok: false, text: 'Không phát hiện điều gì đặc biệt.' };
  questEvent(s, 'interact', id, 1);
  // nhiệm vụ ẩn chỉ có 1 mục tiêu tương tác -> trả tại chỗ
  if (d.kind === 'hidden' && d.objectives.every((o) => o.type === 'interact')) {
    const qs = s.quests.get(d.id)!;
    if (d.objectives.every((o) => (qs.progress[o.id] ?? 0) >= o.count)) {
      return finishHidden(s, d.id);
    }
  }
  return { ok: true, text: `Bạn điều tra ${it.name}...` };
});
async function finishHidden(s: PlayerSession, qid: string) {
  const d = QUESTS[qid];
  const qs = s.quests.get(qid)!;
  await tx(async (c) => {
    if (d.rewards.gold) await changeCurrency(c, s.charId, 'gold', d.rewards.gold, 'quest_reward', 'quest', qid);
    const { grantItems } = await import('../../services/items.js');
    if (d.rewards.items?.length) await grantItems(c, s.charId, d.rewards.items.map((i) => ({ ...i, bound: true })), `quest:${qid}`);
    if (d.rewards.title && !s.row.titles.includes(d.rewards.title)) { s.row.titles.push(d.rewards.title); await c.query('UPDATE characters SET titles = $2 WHERE id = $1', [s.charId, JSON.stringify(s.row.titles)]); }
    qs.state = 'done'; qs.completedAt = new Date(); qs.times++; qs.dirty = true;
    await s.flushQuests(c);
  });
  s.addTuVi(d.rewards.tuvi + d.rewards.exp * 0.5, 'quest');
  return { ok: true, text: d.dialogue.complete.map((l) => l.text).join(' '), rewards: d.rewards };
}

// ---------- di chuyển giữa bản đồ ----------
/** Quy tắc vào bản đồ: giới hạn cứng theo tầng thế giới (minRealm); cảnh giới khuyến nghị chỉ CẢNH BÁO (khám phá tự do); khu ẩn cần đã khám phá */
export async function checkMapEntry(s: PlayerSession, target: MapDef, force: boolean): Promise<{ warn?: string }> {
  if (s.realmIdx < target.minRealm) throw new GameError(`Linh khí ${target.name} quá mạnh — cần tối thiểu cảnh giới ${realmDef(target.minRealm).name}`);
  if (target.hidden) {
    const d = await q1('SELECT 1 FROM map_discovery WHERE character_id = $1 AND map_id = $2', [s.charId, target.id]);
    if (!d) throw new GameError('Khu vực chưa được khám phá');
  }
  if (!force && s.realmIdx < target.reqRealm - 1) {
    return { warn: `CẢNH BÁO: ${target.name} khuyến nghị cảnh giới ${realmDef(target.reqRealm).name} (nguy hiểm ${target.danger}/10). Quái vật ở đây có thể hạ bạn rất nhanh. Vẫn tiến vào?` };
  }
  return {};
}
rpc('portal.use', async (s, p) => {
  const id = str(p, 'id', 80);
  const inst = s.ent.inst;
  assert(!inst.instanceKind || inst.controller?.canLeaveByPortal, 'Không thể dùng cổng ở đây');
  const portal = inst.def.portals.find((x) => x.id === id);
  assert(portal, 'Cổng không tồn tại');
  assert(Math.abs(portal.x - s.ent.x) < 90, 'Hãy đến gần cổng dịch chuyển');
  assert(!s.ent.dead, 'Đã tử vong');
  const target = MAPS[portal.to];
  const chk = await checkMapEntry(s, target, p.force === true);
  if (chk.warn) return { ok: false, warn: chk.warn };
  const dest = target.portals.find((x) => x.id === portal.toPortal);
  const arriveX = dest ? dest.x + (dest.x < target.width * TILE / 2 ? 60 : -60) : target.spawnX;
  s.world.enterMapById(s, target.id, arriveX);
  return { ok: true };
});
rpc('teleport.npc', async (s, p) => {
  const npcId = str(p, 'npc', 60);
  const mapId = str(p, 'map', 60);
  const npc = NPCS[npcId];
  assert(npc?.teleports?.includes(mapId), 'Không thể dịch chuyển tới đó');
  assert(nearNpc(s, npcId), 'Quá xa NPC');
  const target = MAPS[mapId];
  const chk = await checkMapEntry(s, target, p.force === true);
  if (chk.warn) return { ok: false, warn: chk.warn };
  const cost = Math.round(20 * Math.pow(1.5, target.reqRealm));
  await s.enqueue(() => tx((c) => changeCurrency(c, s.charId, 'gold', -cost, 'teleport_fee', 'map', mapId)));
  s.world.enterMapById(s, mapId);
  return { ok: true, cost };
});
rpc('respawn', (s, p) => {
  assert(s.ent.dead, 'Bạn chưa tử vong');
  const where = p.where === 'here' ? 'here' : 'city';
  const inst = s.ent.inst;
  if (inst.instanceKind === 'trial' || inst.instanceKind === 'arena') { s.revive(1); s.world.leaveInstance(s); return { ok: true }; }
  if (inst.instanceKind) { s.revive(0.5); s.serverMoved(inst.def.spawnX, inst.grid.groundTop[Math.floor(inst.def.spawnX / TILE)] * TILE); return { ok: true }; }
  s.revive(0.5);
  if (where === 'city') {
    const city = inst.def.safe ? inst.def.id : NEAREST_CITY[inst.def.tier] ?? NEAREST_CITY[inst.def.world] ?? 'thanh_van_thanh';
    if (MAPS[city] && s.realmIdx >= MAPS[city].minRealm) s.world.enterMapById(s, city); else s.respawnAtSafe();
  } else s.respawnAtSafe();
  return { ok: true };
});

// ---------- chat ----------
const CHANNEL_LIMIT: Record<string, [number, number]> = { world: [1, 8], map: [1, 2], party: [3, 3], guild: [3, 3], private: [3, 3] };
rpc('chat.send', async (s, p) => {
  const ch = oneOf(p, 'ch', ['world', 'map', 'party', 'guild', 'private'] as const);
  const text = maskProfanity(sanitizeText(p.text, LIMITS.chatMaxLen));
  assert(text.length > 0, 'Tin nhắn trống');
  if (s.mutedUntil && new Date(s.mutedUntil) > new Date()) throw new GameError(`Bạn đang bị cấm chat đến ${new Date(s.mutedUntil).toLocaleString('vi-VN')}`);
  if (ch === 'world' && s.realmIdx < 1) throw new GameError('Cần đạt Nhập Môn để chat thế giới');
  const [max, win] = CHANNEL_LIMIT[ch];
  const k = `chat:${s.charId}:${ch}`;
  const n = await redis().incr(k).catch(() => 1);
  if (n === 1) await redis().expire(k, win).catch(() => undefined);
  if (n > max) throw new GameError('Bạn chat quá nhanh');
  const dupKey = `chatdup:${s.charId}`;
  const last = await redis().get(dupKey).catch(() => null);
  if (last === text) throw new GameError('Không gửi lặp lại cùng một tin nhắn');
  await redis().set(dupKey, text, 'EX', 30).catch(() => undefined);
  const msg = { t: 'chat', ch, from: s.name, fromId: s.charId, text, title: s.row.title };
  let target: string | null = null;
  switch (ch) {
    case 'world': s.world.broadcastAll(msg); break;
    case 'map': s.ent.inst.broadcast(msg); break;
    case 'party': {
      assert(s.partyId, 'Bạn không ở trong tổ đội');
      for (const cid of s.world.parties.get(s.partyId)?.members ?? []) s.world.sessions.get(cid)?.send(msg);
      break;
    }
    case 'guild': {
      assert(s.guildId, 'Bạn chưa gia nhập tông môn');
      for (const x of s.world.sessions.values()) if (x.guildId === s.guildId) x.send(msg);
      break;
    }
    case 'private': {
      const to = str(p, 'to', 30);
      const t = s.world.byName(to);
      assert(t, 'Người chơi không trực tuyến');
      const blocked = await q1("SELECT 1 FROM friends WHERE character_id = $1 AND friend_id = $2 AND status = 'blocked'", [t.charId, s.charId]);
      assert(!blocked, 'Không thể gửi tin nhắn');
      t.send({ ...msg, to: t.name }); s.send({ ...msg, to: t.name });
      target = t.name;
      break;
    }
  }
  await q('INSERT INTO chat_logs(character_id, channel, target, message) VALUES ($1,$2,$3,$4)', [s.charId, ch, target, text]);
  return { ok: true };
});

// ---------- tiện ích ----------
rpc('char.info', (s, p) => {
  if (p.name) {
    const t = s.world.byName(str(p, 'name', 30));
    assert(t, 'Người chơi không trực tuyến');
    return { name: t.name, realm: t.realmLabel(), guild: t.guildName, title: t.row.title, appearance: t.visual(), equipment: t.equipment.map((e) => ({ t: e.template_id, slot: e.slot, enhance: e.enhance })) };
  }
  return s.selfState();
});
rpc('settings.keybinds', async (s, p) => {
  const kb = p.keybinds;
  assert(kb && typeof kb === 'object' && !Array.isArray(kb), 'Phím tắt không hợp lệ');
  const clean: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(kb)) {
    if (!/^[a-z_0-9]{1,24}$/.test(k) || !Array.isArray(v)) continue;
    clean[k] = (v as unknown[]).filter((x) => typeof x === 'string' && x.length <= 16).slice(0, 3) as string[];
  }
  s.row.keybinds = clean;
  await q('UPDATE characters SET keybinds = $2 WHERE id = $1', [s.charId, JSON.stringify(clean)]);
  return { ok: true };
});
rpc('title.set', async (s, p) => {
  const t = p.title === null ? null : str(p, 'title', 40);
  assert(t === null || s.row.titles.includes(t), 'Chưa sở hữu danh hiệu này');
  s.row.title = t;
  await q('UPDATE characters SET title = $2 WHERE id = $1', [s.charId, t]);
  s.known.clear();
  return { ok: true };
});
rpc('pvp.mode', async (s, p) => {
  const mode = oneOf(p, 'mode', ['peace', 'guild', 'all'] as const);
  assert(Date.now() - s.lastCombatAt > 10_000, 'Không thể đổi chế độ khi đang chiến đấu');
  s.row.pvp_mode = mode;
  await q('UPDATE characters SET pvp_mode = $2 WHERE id = $1', [s.charId, mode]);
  return { ok: true, mode };
});
rpc('report.player', async (s, p) => {
  const name = str(p, 'name', 30);
  const reason = oneOf(p, 'reason', ['spam', 'abuse', 'cheat', 'name', 'scam', 'other'] as const);
  const details = sanitizeText(p.details ?? '', 500);
  const t = await q1<{ id: number }>('SELECT id FROM characters WHERE lower(name) = lower($1) AND deleted_at IS NULL', [name]);
  assert(t, 'Không tìm thấy người chơi');
  assert(t.id !== s.charId, 'Không thể tự báo cáo');
  const recent = await q1<{ n: number }>("SELECT count(*)::int AS n FROM reports WHERE reporter_id = $1 AND created_at > now() - interval '1 hour'", [s.charId]);
  assert((recent?.n ?? 0) < 5, 'Bạn đã báo cáo quá nhiều trong 1 giờ');
  const chat = await q('SELECT channel, message, created_at FROM chat_logs WHERE character_id = $1 ORDER BY id DESC LIMIT 20', [t.id]);
  await q('INSERT INTO reports(reporter_id, target_id, reason, details, context) VALUES ($1,$2,$3,$4,$5)', [s.charId, t.id, reason, details, JSON.stringify({ chat, map: s.ent.inst.def.id })]);
  return { ok: true };
});
rpc('rank.get', async (_s, p) => {
  const kind = oneOf(p, 'kind', ['realm', 'power', 'wealth', 'arena', 'guild', 'pk'] as const);
  const cacheKey = `rank:${kind}`;
  const cached = await redis().get(cacheKey).catch(() => null);
  if (cached) return JSON.parse(cached);
  let rows: unknown[];
  switch (kind) {
    case 'realm': rows = await q('SELECT name, realm_idx, layer, tu_vi FROM characters WHERE deleted_at IS NULL ORDER BY realm_idx DESC, layer DESC, tu_vi DESC LIMIT 50'); break;
    case 'power': rows = await q('SELECT name, combat_power, realm_idx FROM characters WHERE deleted_at IS NULL ORDER BY combat_power DESC LIMIT 50'); break;
    case 'wealth': rows = await q('SELECT c.name, w.gold, w.spirit_stones FROM character_currencies w JOIN characters c ON c.id = w.character_id WHERE c.deleted_at IS NULL ORDER BY w.spirit_stones DESC, w.gold DESC LIMIT 50'); break;
    case 'arena': rows = await q('SELECT name, arena_rating FROM characters WHERE deleted_at IS NULL ORDER BY arena_rating DESC LIMIT 50'); break;
    case 'pk': rows = await q('SELECT name, pk_points FROM characters WHERE deleted_at IS NULL AND pk_points > 0 ORDER BY pk_points DESC LIMIT 50'); break;
    case 'guild': rows = await q('SELECT g.name, g.level, g.exp, (SELECT count(*) FROM guild_members m WHERE m.guild_id = g.id)::int AS members FROM guilds g WHERE disbanded_at IS NULL ORDER BY level DESC, exp DESC LIMIT 50'); break;
  }
  const out = { kind, rows };
  await redis().set(cacheKey, JSON.stringify(out), 'EX', 60).catch(() => undefined);
  return out;
});
rpc('shop.list', (_s, p) => {
  const id = str(p, 'shop', 60);
  const sh = SHOPS[id];
  assert(sh, 'Cửa hàng không tồn tại');
  return sh;
});
rpc('npc.service', (s, p) => {
  const npcId = str(p, 'npc', 60);
  const svc = str(p, 'service', 30);
  assert(nearNpc(s, npcId), 'Quá xa NPC');
  assert(NPCS[npcId]?.services?.includes(svc as never), 'NPC không có dịch vụ này');
  return { ok: true };
});
export function requireService(s: PlayerSession, service: string, npcId?: string): void {
  const inst = s.ent.inst;
  const npcs = inst.def.npcs.filter((n) => NPCS[n.npc]?.services?.includes(service as never) && (!npcId || n.npc === npcId));
  if (!npcs.some((n) => Math.abs(npcX(n, Date.now()) - s.ent.x) <= 200)) throw new GameError('Cần ở gần NPC cung cấp dịch vụ này');
}
export const _unused = { optStr, int };

// ---------- bản đồ thế giới & khám phá ----------
rpc('world.info', async (s) => {
  const rows = await q<{ map_id: string; discovered_at: Date; visits: number }>('SELECT map_id, discovered_at, visits FROM map_discovery WHERE character_id = $1', [s.charId]);
  const disc = new Set(rows.map((r) => r.map_id));
  const maps = Object.values(MAPS).filter((m) => !m.instance && (!m.hidden || disc.has(m.id))).map((m) => ({
    id: m.id, name: disc.has(m.id) ? m.name : '???', tier: m.tier, continent: m.continent, region: m.region, coords: m.coords, danger: m.danger,
    reqRealm: m.reqRealm, minRealm: m.minRealm, pvp: m.pvp, safe: m.safe, discovered: disc.has(m.id), hidden: !!m.hidden, links: m.portals.map((p) => p.to),
  }));
  return { tiers: WORLD_TIERS.map((t) => ({ id: t.id, name: t.name, order: t.order, minRealm: t.minRealm, desc: t.desc, hub: t.hub, accessible: s.realmIdx >= t.minRealm })), maps, discovered: disc.size, total: maps.length, current: s.ent.inst.def.id };
});

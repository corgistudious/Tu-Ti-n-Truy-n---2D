import { ACHIEVEMENTS, MAPS, TERRITORY_MAPS } from '@tt/shared';
import { q, q1 } from '../../db.js';
import { log } from '../../log.js';
import { redis } from '../../redis.js';
import { GameError, assert } from '../../services/errors.js';
import { STRONGEST_INFO, achEvent, recomputeStrongest } from '../achievements.js';
import type { MonsterEnt } from '../entities.js';
import type { MapInstance } from '../mapInstance.js';
import type { PlayerSession } from '../player.js';
import { world } from '../world.js';
import { int, oneOf, rpc, str } from './registry.js';

const MAX_ALLIES = 2;
const key = (a: number, b: number) => (a < b ? `${a}:${b}` : `${b}:${a}`);
/** lời mời liên minh đang chờ: guild đích -> { từ guild, lúc } */
const allyRequests = new Map<number, { from: number; fromName: string; at: number }[]>();

/** Nạp liên minh & lãnh thổ khi khởi động server; cài hook chiếm lãnh thổ */
export async function loadDiplomacy(): Promise<void> {
  const w = world();
  w.alliances.clear(); w.territories.clear();
  for (const r of await q<{ guild_a: number; guild_b: number }>('SELECT guild_a, guild_b FROM guild_alliances')) w.alliances.add(key(Number(r.guild_a), Number(r.guild_b)));
  for (const r of await q<{ map_id: string; guild_id: number; name: string }>('SELECT t.map_id, t.guild_id, g.name FROM territories t JOIN guilds g ON g.id = t.guild_id WHERE g.disbanded_at IS NULL')) w.territories.set(r.map_id, { guildId: Number(r.guild_id), guildName: r.name });
  w.territoryHook = (inst, m) => { captureTerritory(inst, m).catch((e) => log.warn('territory', { err: String(e) })); };
}

/** Thủ Hộ Linh Mạch bị hạ: tông môn gây nhiều sát thương nhất (cộng dồn thành viên) chiếm lãnh thổ */
export async function captureTerritory(inst: MapInstance, m: MonsterEnt): Promise<number | null> {
  const w = world();
  const byGuild = new Map<number, number>();
  for (const [id, v] of m.threat) {
    const p = inst.players.get(id);
    if (p?.s.guildId) byGuild.set(p.s.guildId, (byGuild.get(p.s.guildId) ?? 0) + v);
  }
  let best: number | null = null; let bestV = 0;
  for (const [g, v] of byGuild) if (v > bestV) { bestV = v; best = g; }
  const mapId = inst.def.id;
  if (!best) { w.announce(`Thủ Hộ Linh Mạch ${MAPS[mapId].name} đã bị hạ nhưng không tông môn nào đủ công lao để chiếm lĩnh.`); return null; }
  const g = await q1<{ name: string }>('SELECT name FROM guilds WHERE id = $1 AND disbanded_at IS NULL', [best]);
  if (!g) return null;
  await q('INSERT INTO territories(map_id, guild_id, captured_at) VALUES ($1,$2,now()) ON CONFLICT (map_id) DO UPDATE SET guild_id = $2, captured_at = now()', [mapId, best]);
  await q('INSERT INTO guild_logs(guild_id, character_id, action, details) VALUES ($1,NULL,$2,$3)', [best, 'territory', JSON.stringify({ map: mapId })]).catch(() => undefined);
  w.territories.set(mapId, { guildId: best, guildName: g.name });
  w.announce(`[Lãnh Thổ] Tông môn ${g.name} đã chiếm lĩnh ${MAPS[mapId].name}! Thành viên tu luyện tại đây được +10% tu vi.`);
  const owned = [...w.territories.values()].filter((t) => t.guildId === best).length;
  for (const s of w.sessions.values()) if (s.guildId === best) achEvent(s, 'territory', owned);
  return best;
}

function leader(s: PlayerSession): number {
  if (!s.guildId || s.guildRank !== 'leader') throw new GameError('Chỉ tông chủ mới thực hiện được');
  return s.guildId;
}
function alliesOf(g: number): number[] {
  const out: number[] = [];
  for (const k of world().alliances) { const [a, b] = k.split(':').map(Number); if (a === g) out.push(b); else if (b === g) out.push(a); }
  return out;
}

rpc('guild.diplomacy', async (s) => {
  assert(s.guildId, 'Bạn chưa có tông môn');
  const ids = alliesOf(s.guildId);
  const allies = ids.length ? await q<{ id: number; name: string; level: number }>('SELECT id, name, level FROM guilds WHERE id = ANY($1) AND disbanded_at IS NULL', [ids]) : [];
  const requests = (allyRequests.get(s.guildId) ?? []).filter((r) => Date.now() - r.at < 600_000);
  const territories = [...world().territories].filter(([, t]) => t.guildId === s.guildId).map(([m]) => ({ map: m, name: MAPS[m]?.name }));
  return { allies, requests, territories, maxAllies: MAX_ALLIES };
});

rpc('guild.ally', async (s, p) => {
  const action = oneOf(p, 'action', ['request', 'accept', 'decline', 'break'] as const);
  const me = leader(s);
  const w = world();
  if (action === 'request') {
    const t = await q1<{ id: number; name: string; leader_id: number }>('SELECT id, name, leader_id FROM guilds WHERE lower(name) = lower($1) AND disbanded_at IS NULL', [str(p, 'name', 30)]);
    assert(t && Number(t.id) !== me, 'Không tìm thấy tông môn');
    const tid = Number(t.id);
    assert(!w.allied(me, tid), 'Đã là đồng minh');
    assert(!w.atWar(me, tid), 'Đang giao chiến với tông môn này');
    assert(alliesOf(me).length < MAX_ALLIES, `Tối đa ${MAX_ALLIES} đồng minh`);
    const list = (allyRequests.get(tid) ?? []).filter((r) => r.from !== me && Date.now() - r.at < 600_000);
    list.push({ from: me, fromName: s.guildName ?? '', at: Date.now() });
    allyRequests.set(tid, list);
    w.sessions.get(Number(t.leader_id))?.send({ t: 'ev', k: 'allyReq', from: s.guildName, guildId: me });
    return { ok: true };
  }
  const gid = int(p, 'guild', 1);
  if (action === 'accept' || action === 'decline') {
    const list = allyRequests.get(me) ?? [];
    const req = list.find((r) => r.from === gid && Date.now() - r.at < 600_000);
    assert(req, 'Lời mời không tồn tại hoặc đã hết hạn');
    allyRequests.set(me, list.filter((r) => r !== req));
    if (action === 'decline') return { ok: true };
    assert(!w.atWar(me, gid), 'Đang giao chiến với tông môn này');
    assert(alliesOf(me).length < MAX_ALLIES && alliesOf(gid).length < MAX_ALLIES, `Mỗi tông môn tối đa ${MAX_ALLIES} đồng minh`);
    const [a, b] = me < gid ? [me, gid] : [gid, me];
    await q('INSERT INTO guild_alliances(guild_a, guild_b) VALUES ($1,$2) ON CONFLICT DO NOTHING', [a, b]);
    w.alliances.add(key(a, b));
    w.announce(`Tông môn ${s.guildName} và ${req.fromName} đã kết minh!`);
    return { ok: true };
  }
  // break
  assert(w.allied(me, gid), 'Không phải đồng minh');
  const [a, b] = me < gid ? [me, gid] : [gid, me];
  await q('DELETE FROM guild_alliances WHERE guild_a = $1 AND guild_b = $2', [a, b]);
  w.alliances.delete(key(a, b));
  return { ok: true };
});

rpc('territory.list', async () => ({
  maps: TERRITORY_MAPS.filter((m) => MAPS[m]).map((m) => ({ map: m, name: MAPS[m].name, owner: world().territories.get(m)?.guildName ?? null })),
  event: 'ev_territory_war', bonus: '+10% tu vi cho thành viên tông môn chiếm giữ',
}));

rpc('achievement.list', (s) => {
  const list = Object.values(ACHIEVEMENTS).map((a) => ({ id: a.id, name: a.name, desc: a.desc, category: a.category, points: a.points, title: a.title ?? null, done: s.achDone.has(a.id) }));
  const points = list.filter((a) => a.done).reduce((n, a) => n + a.points, 0);
  return { list, points, counters: Object.fromEntries(s.counters) };
});

rpc('rank.strongest', async (s) => {
  const cacheKey = 'rank:strongest';
  let top: unknown[] | null = null;
  const cached = await redis().get(cacheKey).catch(() => null);
  if (cached) top = JSON.parse(cached);
  if (!top) {
    const snap = await q1<{ data: unknown[] }>("SELECT data FROM ranking_snapshots WHERE kind = 'strongest' ORDER BY id DESC LIMIT 1");
    top = snap?.data ?? (await recomputeStrongest()).top;
    await redis().set(cacheKey, JSON.stringify(top), 'EX', 60).catch(() => undefined);
  }
  const holders = await q<{ title: string; name: string; rank: number }>('SELECT d.title, c.name, d.rank FROM dynamic_titles d JOIN characters c ON c.id = d.character_id ORDER BY d.title, d.rank');
  return { ...STRONGEST_INFO, top: (top as unknown[]).slice(0, 50), holders, mine: s.dynamicTitles };
});

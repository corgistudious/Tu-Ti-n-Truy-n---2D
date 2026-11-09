import { LIMITS, TILE } from '@tt/shared';
import { q, q1, tx } from '../../db.js';
import { changeCurrency } from '../../services/currency.js';
import { GameError, assert } from '../../services/errors.js';
import { sanitizeText, validateCharacterName } from '../../services/filter.js';
import { grantItems } from '../../services/items.js';
import type { InstanceController, MapInstance } from '../mapInstance.js';
import type { MonsterEnt } from '../entities.js';
import type { PlayerSession } from '../player.js';
import { world } from '../world.js';
import { requireService } from './core.js';
import { achEvent } from '../achievements.js';
import { pushInventory } from './inventory.js';
import { int, oneOf, optStr, rpc, str } from './registry.js';

// ======================= TỔ ĐỘI =======================
async function persistParty(pid: number): Promise<void> {
  const p = world().parties.get(pid);
  await tx(async (c) => {
    if (!p || p.members.size <= 1) {
      await c.query('DELETE FROM parties WHERE id = $1', [pid]);
      return;
    }
    await c.query('UPDATE parties SET leader_id = $2 WHERE id = $1', [pid, p.leader]);
    await c.query('DELETE FROM party_members WHERE party_id = $1', [pid]);
    for (const m of p.members) await c.query('INSERT INTO party_members(party_id, character_id) VALUES ($1,$2) ON CONFLICT (character_id) DO UPDATE SET party_id = $1', [pid, m]);
  });
}
rpc('party.invite', async (s, p) => {
  const t = world().byName(str(p, 'name', 30));
  assert(t && t !== s, 'Người chơi không trực tuyến');
  assert(!t.partyId, 'Người chơi đã có tổ đội');
  if (s.partyId) {
    const party = world().parties.get(s.partyId)!;
    assert(party.leader === s.charId, 'Chỉ đội trưởng được mời');
    assert(party.members.size < LIMITS.partyMax, 'Tổ đội đã đủ người');
  }
  world().partyInvites.set(t.charId, { partyId: s.partyId, from: s.charId, at: Date.now() });
  t.send({ t: 'ev', k: 'partyReq', from: s.name, fromId: s.charId });
  return { ok: true };
});
rpc('party.respond', async (s, p) => {
  const from = int(p, 'from', 1);
  const inv = world().partyInvites.get(s.charId);
  assert(inv && inv.from === from, 'Lời mời đã hết hạn');
  world().partyInvites.delete(s.charId);
  const leader = world().sessions.get(from);
  if (!p.accept) { leader?.notify(`${s.name} từ chối vào tổ đội`); return { ok: true }; }
  assert(!s.partyId, 'Bạn đã có tổ đội');
  assert(leader, 'Đội trưởng đã rời mạng');
  let pid = leader.partyId;
  if (!pid) {
    const r = await q1<{ id: number }>('INSERT INTO parties(leader_id) VALUES ($1) RETURNING id', [leader.charId]);
    pid = r!.id;
    world().parties.set(pid, { id: pid, leader: leader.charId, members: new Set([leader.charId]) });
    leader.partyId = pid;
  }
  const party = world().parties.get(pid)!;
  assert(party.members.size < LIMITS.partyMax, 'Tổ đội đã đủ người');
  party.members.add(s.charId);
  s.partyId = pid;
  await persistParty(pid);
  world().pushParty(pid);
  return { ok: true };
});
async function leaveParty(s: PlayerSession, kicked = false): Promise<void> {
  const pid = s.partyId;
  if (!pid) return;
  const party = world().parties.get(pid);
  s.partyId = null;
  s.send({ t: 'ev', k: 'party', d: null });
  if (!party) return;
  party.members.delete(s.charId);
  if (party.leader === s.charId) party.leader = [...party.members][0] ?? 0;
  if (party.members.size <= 1) {
    for (const m of party.members) { const x = world().sessions.get(m); if (x) { x.partyId = null; x.send({ t: 'ev', k: 'party', d: null }); } }
    world().parties.delete(pid);
  }
  await persistParty(pid);
  world().pushParty(pid);
  if (kicked) s.notify('Bạn đã bị mời khỏi tổ đội', 'warn');
}
rpc('party.leave', async (s) => { assert(s.partyId, 'Không có tổ đội'); await leaveParty(s); return { ok: true }; });
rpc('party.kick', async (s, p) => {
  assert(s.partyId, 'Không có tổ đội');
  const party = world().parties.get(s.partyId)!;
  assert(party.leader === s.charId, 'Chỉ đội trưởng được mời ra');
  const id = int(p, 'id', 1);
  assert(party.members.has(id) && id !== s.charId, 'Không có thành viên này');
  const t = world().sessions.get(id);
  if (t) await leaveParty(t, true);
  else { party.members.delete(id); await persistParty(party.id); world().pushParty(party.id); }
  return { ok: true };
});

// ======================= BẠN BÈ =======================
rpc('friend.list', async (s) => {
  const rows = await q<{ friend_id: number; status: string; name: string; realm_idx: number }>("SELECT f.friend_id, f.status, c.name, c.realm_idx FROM friends f JOIN characters c ON c.id = f.friend_id WHERE f.character_id = $1 AND c.deleted_at IS NULL", [s.charId]);
  const pending = await q<{ character_id: number; name: string }>("SELECT f.character_id, c.name FROM friends f JOIN characters c ON c.id = f.character_id WHERE f.friend_id = $1 AND f.status = 'pending'", [s.charId]);
  return { friends: rows.map((r) => ({ ...r, online: world().isOnline(r.friend_id) })), pending };
});
rpc('friend.add', async (s, p) => {
  const name = str(p, 'name', 30);
  const t = await q1<{ id: number }>('SELECT id FROM characters WHERE lower(name) = lower($1) AND deleted_at IS NULL', [name]);
  assert(t && t.id !== s.charId, 'Không tìm thấy người chơi');
  const n = await q1<{ n: number }>("SELECT count(*)::int AS n FROM friends WHERE character_id = $1 AND status = 'accepted'", [s.charId]);
  assert((n?.n ?? 0) < 100, 'Danh sách bạn bè đã đầy');
  const blocked = await q1("SELECT 1 FROM friends WHERE character_id = $1 AND friend_id = $2 AND status = 'blocked'", [t.id, s.charId]);
  assert(!blocked, 'Không thể kết bạn');
  await q("INSERT INTO friends(character_id, friend_id, status) VALUES ($1,$2,'pending') ON CONFLICT DO NOTHING", [s.charId, t.id]);
  world().sessions.get(t.id)?.send({ t: 'ev', k: 'friendReq', from: s.name, fromId: s.charId });
  return { ok: true };
});
rpc('friend.respond', async (s, p) => {
  const from = int(p, 'from', 1);
  const r = await q1("SELECT 1 FROM friends WHERE character_id = $1 AND friend_id = $2 AND status = 'pending'", [from, s.charId]);
  assert(r, 'Không có lời mời');
  await tx(async (c) => {
    if (p.accept) {
      await c.query("UPDATE friends SET status = 'accepted' WHERE character_id = $1 AND friend_id = $2", [from, s.charId]);
      await c.query("INSERT INTO friends(character_id, friend_id, status) VALUES ($1,$2,'accepted') ON CONFLICT (character_id, friend_id) DO UPDATE SET status = 'accepted'", [s.charId, from]);
    } else await c.query('DELETE FROM friends WHERE character_id = $1 AND friend_id = $2', [from, s.charId]);
  });
  return { ok: true };
});
rpc('friend.remove', async (s, p) => {
  const id = int(p, 'id', 1);
  await q('DELETE FROM friends WHERE (character_id = $1 AND friend_id = $2) OR (character_id = $2 AND friend_id = $1 AND status <> \'blocked\')', [s.charId, id]);
  return { ok: true };
});
rpc('friend.block', async (s, p) => {
  const name = str(p, 'name', 30);
  const t = await q1<{ id: number }>('SELECT id FROM characters WHERE lower(name) = lower($1) AND deleted_at IS NULL', [name]);
  assert(t && t.id !== s.charId, 'Không tìm thấy người chơi');
  await q("INSERT INTO friends(character_id, friend_id, status) VALUES ($1,$2,'blocked') ON CONFLICT (character_id, friend_id) DO UPDATE SET status = 'blocked'", [s.charId, t.id]);
  return { ok: true };
});

// ======================= TÔNG MÔN =======================
const RANKS = ['leader', 'vice', 'elder', 'member'] as const;
type Rank = typeof RANKS[number];
const PERM: Record<string, Rank[]> = { invite: ['leader', 'vice', 'elder'], kick: ['leader', 'vice'], setRank: ['leader'], withdraw: ['leader', 'vice'], notice: ['leader', 'vice'], war: ['leader'], boss: ['leader', 'vice'] };
function can(s: PlayerSession, perm: keyof typeof PERM): void { if (!s.guildId || !PERM[perm].includes(s.guildRank as Rank)) throw new GameError('Không đủ quyền hạn trong tông môn'); }
function guildMaxMembers(level: number): number { return LIMITS.guildBaseMembers + (level - 1) * 5; }
async function guildLog(guildId: number, charId: number, action: string, details: object = {}): Promise<void> { await q('INSERT INTO guild_logs(guild_id, character_id, action, details) VALUES ($1,$2,$3,$4)', [guildId, charId, action, JSON.stringify(details)]); }
function refreshGuildMember(cid: number, guildId: number | null, name: string | null, rank: string | null): void {
  const s = world().sessions.get(cid);
  if (!s) return;
  s.guildId = guildId; s.guildName = name; s.guildRank = rank;
  s.send({ t: 'ev', k: 'guild', d: guildId ? { id: guildId, name, rank } : null });
  s.known.clear();
}
export async function addGuildExp(guildId: number, exp: number): Promise<void> {
  const g = await q1<{ level: number; exp: number }>('UPDATE guilds SET exp = exp + $2 WHERE id = $1 RETURNING level, exp', [guildId, exp]);
  if (!g) return;
  const need = 10000 * Math.pow(2, g.level - 1);
  if (g.exp >= need && g.level < 20) await q('UPDATE guilds SET level = level + 1, exp = exp - $2 WHERE id = $1', [guildId, need]);
}

rpc('guild.create', async (s, p) => {
  requireService(s, 'guild');
  const name = str(p, 'name', 20).normalize('NFC').trim();
  const bad = validateCharacterName(name);
  if (bad) throw new GameError(bad.replace('Tên', 'Tên tông môn'));
  assert(!s.guildId, 'Bạn đã ở trong tông môn');
  assert(s.realmIdx >= 3, 'Cần cảnh giới Nội Kình để lập tông môn');
  const g = await s.enqueue(() => tx(async (c) => {
    await changeCurrency(c, s.charId, 'gold', -LIMITS.guildCreateCost, 'guild_create');
    const exists = (await c.query('SELECT 1 FROM guilds WHERE lower(name) = lower($1) AND disbanded_at IS NULL', [name])).rowCount;
    assert(!exists, 'Tên tông môn đã tồn tại');
    const r = (await c.query('INSERT INTO guilds(name, leader_id) VALUES ($1,$2) RETURNING id', [name, s.charId])).rows[0];
    await c.query("INSERT INTO guild_members(guild_id, character_id, rank) VALUES ($1,$2,'leader')", [r.id, s.charId]);
    return r.id as number;
  }));
  refreshGuildMember(s.charId, g, name, 'leader');
  achEvent(s, 'guild_join', 1);
  await guildLog(g, s.charId, 'create');
  await pushInventory(s);
  return { ok: true, id: g };
});
rpc('guild.info', async (s, p) => {
  const id = p.id ? int(p, 'id', 1) : s.guildId;
  assert(id, 'Bạn chưa có tông môn');
  const g = await q1('SELECT id, name, leader_id, level, exp, gold, notice, created_at FROM guilds WHERE id = $1 AND disbanded_at IS NULL', [id]);
  assert(g, 'Tông môn không tồn tại');
  const members = await q<{ character_id: number; rank: string; contribution: number; name: string; realm_idx: number; layer: number }>('SELECT m.character_id, m.rank, m.contribution, c.name, c.realm_idx, c.layer FROM guild_members m JOIN characters c ON c.id = m.character_id WHERE m.guild_id = $1 ORDER BY array_position(ARRAY[\'leader\',\'vice\',\'elder\',\'member\'], m.rank), m.contribution DESC', [id]);
  const isMember = s.guildId === id;
  const items = isMember ? await q("SELECT id, template_id, quantity, enhance FROM item_instances WHERE container = 'guild' AND ref_id = $1", [String(id)]) : [];
  const logs = isMember ? await q('SELECT l.action, l.details, l.created_at, c.name FROM guild_logs l LEFT JOIN characters c ON c.id = l.character_id WHERE l.guild_id = $1 ORDER BY l.id DESC LIMIT 30', [id]) : [];
  const wars = [...world().guildWars.values()].filter((w) => w.a === id || w.b === id).map((w) => ({ ...w, endsIn: w.endsAt - Date.now() }));
  return { guild: { ...g, maxMembers: guildMaxMembers(Number((g as { level: number }).level)), expNext: 10000 * Math.pow(2, Number((g as { level: number }).level) - 1) }, members: members.map((m) => ({ ...m, online: world().isOnline(m.character_id) })), items, logs, wars };
});
rpc('guild.list', async () => q('SELECT g.id, g.name, g.level, (SELECT count(*) FROM guild_members m WHERE m.guild_id = g.id)::int AS members, c.name AS leader FROM guilds g JOIN characters c ON c.id = g.leader_id WHERE g.disbanded_at IS NULL ORDER BY g.level DESC, g.exp DESC LIMIT 50'));
const guildInvites = new Map<number, { guildId: number; from: number; at: number }>();
rpc('guild.invite', async (s, p) => {
  can(s, 'invite');
  const t = world().byName(str(p, 'name', 30));
  assert(t && !t.guildId, 'Người chơi không trực tuyến hoặc đã có tông môn');
  guildInvites.set(t.charId, { guildId: s.guildId!, from: s.charId, at: Date.now() });
  t.send({ t: 'ev', k: 'guildReq', from: s.name, guild: s.guildName, guildId: s.guildId });
  return { ok: true };
});
rpc('guild.respond', async (s, p) => {
  const inv = guildInvites.get(s.charId);
  assert(inv && Date.now() - inv.at < 120_000, 'Lời mời đã hết hạn');
  guildInvites.delete(s.charId);
  if (!p.accept) return { ok: true };
  assert(!s.guildId, 'Bạn đã có tông môn');
  const g = await q1<{ name: string; level: number }>('SELECT name, level FROM guilds WHERE id = $1 AND disbanded_at IS NULL', [inv.guildId]);
  assert(g, 'Tông môn không tồn tại');
  const n = await q1<{ n: number }>('SELECT count(*)::int AS n FROM guild_members WHERE guild_id = $1', [inv.guildId]);
  assert((n?.n ?? 0) < guildMaxMembers(g.level), 'Tông môn đã đủ người');
  await q("INSERT INTO guild_members(guild_id, character_id, rank) VALUES ($1,$2,'member')", [inv.guildId, s.charId]);
  refreshGuildMember(s.charId, inv.guildId, g.name, 'member');
  achEvent(s, 'guild_join', 1);
  await guildLog(inv.guildId, s.charId, 'join');
  return { ok: true };
});
rpc('guild.leave', async (s) => {
  assert(s.guildId, 'Bạn chưa có tông môn');
  const gid = s.guildId;
  if (s.guildRank === 'leader') {
    const n = await q1<{ n: number }>('SELECT count(*)::int AS n FROM guild_members WHERE guild_id = $1', [gid]);
    assert((n?.n ?? 0) <= 1, 'Tông chủ phải nhường chức trước khi rời (hoặc là thành viên duy nhất để giải tán)');
    await tx(async (c) => {
      const items = await c.query("SELECT id FROM item_instances WHERE container = 'guild' AND ref_id = $1", [String(gid)]);
      assert(!items.rowCount, 'Kho tông môn còn vật phẩm — rút ra trước khi giải tán');
      await c.query('UPDATE guilds SET disbanded_at = now() WHERE id = $1', [gid]);
      await c.query('DELETE FROM guild_members WHERE guild_id = $1', [gid]);
    });
  } else await q('DELETE FROM guild_members WHERE character_id = $1', [s.charId]);
  await guildLog(gid, s.charId, 'leave');
  refreshGuildMember(s.charId, null, null, null);
  return { ok: true };
});
rpc('guild.kick', async (s, p) => {
  can(s, 'kick');
  const id = int(p, 'id', 1);
  const m = await q1<{ rank: string }>('SELECT rank FROM guild_members WHERE guild_id = $1 AND character_id = $2', [s.guildId, id]);
  assert(m && id !== s.charId, 'Không có thành viên này');
  assert(RANKS.indexOf(m.rank as Rank) > RANKS.indexOf(s.guildRank as Rank), 'Không thể mời người cùng hoặc cao chức hơn');
  await q('DELETE FROM guild_members WHERE character_id = $1', [id]);
  await guildLog(s.guildId!, s.charId, 'kick', { target: id });
  refreshGuildMember(id, null, null, null);
  return { ok: true };
});
rpc('guild.setRank', async (s, p) => {
  can(s, 'setRank');
  const id = int(p, 'id', 1);
  const rank = oneOf(p, 'rank', RANKS);
  const m = await q1('SELECT 1 FROM guild_members WHERE guild_id = $1 AND character_id = $2', [s.guildId, id]);
  assert(m && id !== s.charId, 'Không có thành viên này');
  await tx(async (c) => {
    if (rank === 'leader') {
      await c.query("UPDATE guild_members SET rank = 'vice' WHERE character_id = $1", [s.charId]);
      await c.query('UPDATE guilds SET leader_id = $2 WHERE id = $1', [s.guildId, id]);
    }
    await c.query('UPDATE guild_members SET rank = $2 WHERE character_id = $1', [id, rank]);
  });
  if (rank === 'leader') refreshGuildMember(s.charId, s.guildId, s.guildName, 'vice');
  refreshGuildMember(id, s.guildId, s.guildName, rank);
  await guildLog(s.guildId!, s.charId, 'set_rank', { target: id, rank });
  return { ok: true };
});
rpc('guild.notice', async (s, p) => {
  can(s, 'notice');
  const text = sanitizeText(p.text, 300);
  await q('UPDATE guilds SET notice = $2 WHERE id = $1', [s.guildId, text]);
  return { ok: true };
});
rpc('guild.donate', async (s, p) => {
  assert(s.guildId, 'Bạn chưa có tông môn');
  const gold = int(p, 'gold', 100, 1e12);
  await s.enqueue(() => tx(async (c) => {
    await changeCurrency(c, s.charId, 'gold', -gold, 'guild_donate', 'guild', s.guildId!);
    await c.query('UPDATE guilds SET gold = gold + $2 WHERE id = $1', [s.guildId, gold]);
    const contrib = Math.floor(gold / 100);
    await c.query('UPDATE guild_members SET contribution = contribution + $2 WHERE character_id = $1', [s.charId, contrib]);
    await changeCurrency(c, s.charId, 'guild_contrib', contrib, 'guild_donate', 'guild', s.guildId!);
  }));
  await addGuildExp(s.guildId, Math.floor(gold / 50));
  await guildLog(s.guildId, s.charId, 'donate', { gold });
  await pushInventory(s);
  return { ok: true };
});
rpc('guild.deposit', async (s, p) => {
  assert(s.guildId, 'Bạn chưa có tông môn');
  const { uuid } = await import('./registry.js');
  const id = uuid(p, 'id');
  assert(!s.tradeLocked.has(id), 'Vật phẩm đang trong giao dịch');
  await s.enqueue(() => tx(async (c) => {
    const { ownedInstance, detach } = await import('../../services/items.js');
    const n = (await c.query("SELECT count(*)::int AS n FROM item_instances WHERE container = 'guild' AND ref_id = $1", [String(s.guildId)])).rows[0].n;
    assert(n < 100, 'Kho tông môn đã đầy');
    const row = await ownedInstance(c, s.charId, id);
    await detach(c, row, row.quantity, { owner: null, container: 'guild', refId: String(s.guildId) }, true);
    await c.query('INSERT INTO guild_logs(guild_id, character_id, action, details) VALUES ($1,$2,$3,$4)', [s.guildId, s.charId, 'deposit', JSON.stringify({ item: row.template_id, qty: row.quantity })]);
  }));
  await pushInventory(s);
  return { ok: true };
});
rpc('guild.withdraw', async (s, p) => {
  can(s, 'withdraw');
  const { uuid } = await import('./registry.js');
  const id = uuid(p, 'id');
  await s.enqueue(() => tx(async (c) => {
    const { placeIntoBag } = await import('../../services/items.js');
    const row = (await c.query("SELECT * FROM item_instances WHERE id = $1 AND container = 'guild' AND ref_id = $2 FOR UPDATE", [id, String(s.guildId)])).rows[0];
    assert(row, 'Không có vật phẩm này trong kho');
    await placeIntoBag(c, row, s.charId);
    await c.query('INSERT INTO guild_logs(guild_id, character_id, action, details) VALUES ($1,$2,$3,$4)', [s.guildId, s.charId, 'withdraw', JSON.stringify({ item: row.template_id, qty: row.quantity })]);
  }));
  await pushInventory(s);
  return { ok: true };
});
rpc('guild.war', async (s, p) => {
  can(s, 'war');
  const targetName = str(p, 'guild', 20);
  const t = await q1<{ id: number; name: string }>('SELECT id, name FROM guilds WHERE lower(name) = lower($1) AND disbanded_at IS NULL', [targetName]);
  assert(t && t.id !== s.guildId, 'Không tìm thấy tông môn');
  assert(!world().atWar(s.guildId!, t.id), 'Đang giao chiến với tông môn này');
  const cost = 20000;
  const r = await tx(async (c) => {
    const g = (await c.query('SELECT gold FROM guilds WHERE id = $1 FOR UPDATE', [s.guildId])).rows[0];
    assert(Number(g.gold) >= cost, `Quỹ tông môn cần ${cost} vàng`);
    await c.query('UPDATE guilds SET gold = gold - $2 WHERE id = $1', [s.guildId, cost]);
    return (await c.query("INSERT INTO guild_wars(guild_a, guild_b, ends_at) VALUES ($1,$2, now() + interval '1 hour') RETURNING id", [s.guildId, t.id])).rows[0].id as number;
  });
  const [a, b] = s.guildId! < t.id ? [s.guildId!, t.id] : [t.id, s.guildId!];
  world().guildWars.set(`${a}:${b}`, { id: r, a: s.guildId!, b: t.id, endsAt: Date.now() + 3600_000 });
  world().announce(`Tông môn ${s.guildName} tuyên chiến với ${t.name}! Chiến tranh kéo dài 1 giờ.`);
  return { ok: true };
});
world().guildWarScoreHook = (killer, victim) => {
  const w = [...world().guildWars.values()].find((x) => (x.a === killer && x.b === victim) || (x.b === killer && x.a === victim));
  if (!w) return;
  q(w.a === killer ? 'UPDATE guild_wars SET score_a = score_a + 1 WHERE id = $1' : 'UPDATE guild_wars SET score_b = score_b + 1 WHERE id = $1', [w.id]).catch(() => undefined);
};
world().guildWarEndHook = (id) => {
  (async () => {
    const w = await q1<{ guild_a: number; guild_b: number; score_a: number; score_b: number }>('SELECT * FROM guild_wars WHERE id = $1', [id]);
    if (!w) return;
    const winner = w.score_a === w.score_b ? null : w.score_a > w.score_b ? w.guild_a : w.guild_b;
    await q('UPDATE guild_wars SET winner = $2 WHERE id = $1', [id, winner]);
    if (winner) await addGuildExp(winner, 5000);
    world().announce(`Chiến tranh tông môn kết thúc (${w.score_a} - ${w.score_b}).`);
  })().catch(() => undefined);
};

/** Boss tông môn: instance riêng, mỗi ngày một lần */
class GuildBossController implements InstanceController {
  bossId?: string;
  ended = false;
  constructor(readonly guildId: number) {}
  onMonsterKilled(inst: MapInstance, m: MonsterEnt): void {
    if (m.id !== this.bossId || this.ended) return;
    this.ended = true;
    const members = [...inst.players.values()];
    addGuildExp(this.guildId, 3000 + members.length * 500).catch(() => undefined);
    for (const p of members) {
      p.s.enqueue(() => tx(async (c) => {
        await grantItems(c, p.s.charId, [{ item: 'stone_refine', qty: 3 }, { item: 'pill_bt_assist', qty: 1 }], 'guild_boss').catch(() => undefined);
        await changeCurrency(c, p.s.charId, 'guild_contrib', 200, 'guild_boss');
        await c.query('UPDATE guild_members SET contribution = contribution + 200 WHERE character_id = $1', [p.s.charId]);
      })).then(() => pushInventory(p.s)).catch(() => undefined);
      p.s.notify('Boss tông môn bị tiêu diệt! Nhận phần thưởng tông môn.', 'good');
    }
  }
}
rpc('guild.boss', async (s, p) => {
  assert(s.guildId, 'Bạn chưa có tông môn');
  const action = oneOf(p, 'action', ['start', 'enter'] as const);
  let inst = world().findInstance((i) => i.instanceKind === 'guild' && i.ownerKey === `g${s.guildId}`);
  if (action === 'start') {
    can(s, 'boss');
    assert(!inst, 'Boss tông môn đang diễn ra');
    const g = await q1<{ level: number; boss_last_at: Date | null }>('SELECT level, boss_last_at FROM guilds WHERE id = $1', [s.guildId]);
    assert(!g?.boss_last_at || new Date(g.boss_last_at).toDateString() !== new Date().toDateString(), 'Hôm nay đã khiêu chiến Boss tông môn');
    await q('UPDATE guilds SET boss_last_at = now() WHERE id = $1', [s.guildId]);
    const ctl = new GuildBossController(s.guildId);
    inst = world().createInstance('guild_hall', `g${s.guildId}`, ctl);
    const avgRealm = Math.max(10, s.realmIdx);
    const boss = inst.spawnMonster('guild_boss_ancient_tree', inst.grid.w * TILE * 0.75, { noRespawn: true, tag: 'guild', level: avgRealm * 9 + 5 + (g?.level ?? 1) });
    ctl.bossId = boss.id;
    for (const x of world().sessions.values()) if (x.guildId === s.guildId) x.notify('Boss tông môn đã xuất hiện tại Tông Môn Đại Điện! Dùng "Vào Boss Tông Môn".', 'good');
  }
  assert(inst, 'Chưa có Boss tông môn');
  world().rememberReturn(s);
  world().enterInstance(s, inst, 6 * TILE);
  return { ok: true };
});
export const _s = { optStr };

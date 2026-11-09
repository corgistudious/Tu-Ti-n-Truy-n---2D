import { DUNGEONS, ITEMS, TILE, eloUpdate, realmDef } from '@tt/shared';
import { q, q1, tx } from '../../db.js';
import { changeCurrency } from '../../services/currency.js';
import { GameError, assert } from '../../services/errors.js';
import { grantItems } from '../../services/items.js';
import { eff } from '../combat.js';
import type { InstanceController, MapInstance } from '../mapInstance.js';
import type { MonsterEnt, PlayerEnt } from '../entities.js';
import type { PlayerSession } from '../player.js';
import { questEvent } from '../quests.js';
import { world } from '../world.js';
import { requireService } from './core.js';
import { pushInventory } from './inventory.js';
import { int, rpc, str } from './registry.js';

// ======================= TỈ THÍ =======================
rpc('duel.request', (s, p) => {
  const t = world().byName(str(p, 'name', 30));
  assert(t && t !== s, 'Người chơi không trực tuyến');
  assert(t.ent.inst === s.ent.inst && Math.abs(t.ent.x - s.ent.x) < 500, 'Cần đứng gần đối phương');
  assert(!s.ent.inst.instanceKind, 'Không thể tỉ thí ở đây');
  assert(!s.duelWith && !t.duelWith, 'Một bên đang tỉ thí');
  world().duelRequests.set(t.charId, { from: s.charId, at: Date.now() });
  t.send({ t: 'ev', k: 'duelReq', from: s.name, fromId: s.charId });
  return { ok: true };
});
rpc('duel.respond', (s, p) => {
  const from = int(p, 'from', 1);
  const req = world().duelRequests.get(s.charId);
  assert(req && req.from === from, 'Lời mời đã hết hạn');
  world().duelRequests.delete(s.charId);
  const a = world().sessions.get(from);
  if (!p.accept) { a?.notify(`${s.name} từ chối tỉ thí`); return { ok: true }; }
  assert(a && a.ent.inst === s.ent.inst, 'Đối phương đã rời đi');
  a.duelWith = s.charId; s.duelWith = a.charId;
  const msg = { t: 'ev', k: 'duel', a: a.name, b: s.name };
  a.send(msg); s.send(msg);
  // tự kết thúc sau 3 phút
  setTimeout(() => { if (a.duelWith === s.charId) { a.duelWith = null; s.duelWith = null; a.notify('Tỉ thí hòa (hết giờ)'); s.notify('Tỉ thí hòa (hết giờ)'); } }, 180_000);
  return { ok: true };
});

// ======================= ĐẤU TRƯỜNG XẾP HẠNG =======================
const arenaQueue: { charId: number; rating: number; at: number }[] = [];
class ArenaController implements InstanceController {
  ended = false;
  startAt = Date.now() + 3000;
  constructor(readonly a: PlayerSession, readonly b: PlayerSession) {}
  tick(inst: MapInstance): void {
    if (this.ended) return;
    if (Date.now() - this.startAt > 120_000) {
      const pa = this.a.ent.hp / eff(this.a.ent).maxHp, pb = this.b.ent.hp / eff(this.b.ent).maxHp;
      this.finish(inst, pa === pb ? null : pa > pb ? this.a : this.b);
    }
  }
  onPlayerKilled(inst: MapInstance, p: PlayerEnt): boolean { this.finish(inst, p.s === this.a ? this.b : this.a); return true; }
  onPlayerLeave(inst: MapInstance, p: PlayerEnt): void { if (!this.ended) this.finish(inst, p.s === this.a ? this.b : this.a); }
  private finish(inst: MapInstance, winner: PlayerSession | null): void {
    if (this.ended) return;
    this.ended = true;
    const ra = this.a.row.arena_rating, rb = this.b.row.arena_rating;
    const [na, nb] = eloUpdate(ra, rb, winner === null ? 0.5 : winner === this.a ? 1 : 0);
    this.a.row.arena_rating = na; this.b.row.arena_rating = nb;
    tx(async (c) => {
      await c.query('UPDATE characters SET arena_rating = $2 WHERE id = $1', [this.a.charId, na]);
      await c.query('UPDATE characters SET arena_rating = $2 WHERE id = $1', [this.b.charId, nb]);
      await c.query('INSERT INTO arena_matches(char_a, char_b, winner, rating_a_before, rating_b_before) VALUES ($1,$2,$3,$4,$5)', [this.a.charId, this.b.charId, winner?.charId ?? null, ra, rb]);
      if (winner) await changeCurrency(c, winner.charId, 'gold', 500 * (1 + winner.realmIdx), 'arena_win');
    }).catch(() => undefined);
    for (const s of [this.a, this.b]) s.send({ t: 'ev', k: 'arenaEnd', win: winner === s, draw: winner === null, rating: s.row.arena_rating });
    setTimeout(() => { for (const s of [this.a, this.b]) if (s.ent.inst === inst) { if (s.ent.dead) s.revive(1); else { s.ent.hp = eff(s.ent).maxHp; } world().leaveInstance(s); } }, 3000);
  }
}
rpc('arena.queue', (s) => {
  requireService(s, 'arena');
  assert(s.realmIdx >= 2, 'Cần cảnh giới Luyện Thể');
  assert(!arenaQueue.some((x) => x.charId === s.charId), 'Đang xếp hàng');
  arenaQueue.push({ charId: s.charId, rating: s.row.arena_rating, at: Date.now() });
  return { ok: true, queued: arenaQueue.length };
});
rpc('arena.leave', (s) => { const i = arenaQueue.findIndex((x) => x.charId === s.charId); if (i >= 0) arenaQueue.splice(i, 1); return { ok: true }; });
world().leaveQueueHook = (s) => { const i = arenaQueue.findIndex((x) => x.charId === s.charId); if (i >= 0) arenaQueue.splice(i, 1); };
export function arenaMatchmake(): void {
  arenaQueue.sort((x, y) => x.rating - y.rating);
  for (let i = 0; i < arenaQueue.length - 1; i++) {
    const x = arenaQueue[i], y = arenaQueue[i + 1];
    const wait = (Date.now() - Math.min(x.at, y.at)) / 1000;
    const window = 100 + wait * 10; // nới dần khoảng chênh lệch
    const a = world().sessions.get(x.charId), b = world().sessions.get(y.charId);
    if (!a || !b || a.ent.inst.instanceKind || b.ent.inst.instanceKind) continue;
    if (Math.abs(x.rating - y.rating) > window) continue;
    if (Math.abs(a.realmIdx - b.realmIdx) > 3 && wait < 120) continue; // tránh chênh lệch cảnh giới quá lớn
    arenaQueue.splice(i, 2); i--;
    const ctl = new ArenaController(a, b);
    const inst = world().createInstance('arena_map', `arena${a.charId}_${b.charId}`, ctl);
    for (const [s, x0] of [[a, 8 * TILE], [b, 32 * TILE]] as [PlayerSession, number][]) {
      world().rememberReturn(s); world().enterInstance(s, inst, x0);
      s.ent.hp = eff(s.ent).maxHp; s.mp = eff(s.ent).maxMp; s.invulnUntil = Date.now() + 3000;
      s.send({ t: 'ev', k: 'arena', vs: s === a ? b.name : a.name, start: 3000 });
    }
  }
}

// ======================= PHÓ BẢN =======================
class DungeonController implements InstanceController {
  wave = -1;
  waveMonsters = new Set<string>();
  bossId?: string;
  ended = false;
  started = Date.now();
  members: number[];
  nextAt = Date.now() + 3000;
  constructor(readonly dungeonId: string, members: number[]) { this.members = members; }
  tick(inst: MapInstance): void {
    if (this.ended) return;
    const d = DUNGEONS[this.dungeonId];
    if (Date.now() - this.started > d.timeLimit * 1000) { this.fail(inst, 'Hết thời gian'); return; }
    if (inst.players.size === 0) { this.fail(inst, 'Không còn ai'); return; }
    if ([...inst.players.values()].every((p) => p.dead)) { this.fail(inst, 'Cả đội đã gục ngã'); return; }
    if (this.waveMonsters.size === 0 && !this.bossId && Date.now() >= this.nextAt) {
      this.wave++;
      const level = realmDef(d.reqRealm).idx * 9 + 6;
      if (this.wave < d.waves.length) {
        for (const sp of d.waves[this.wave]) for (let i = 0; i < sp.count; i++) {
          const m = inst.spawnMonster(sp.monster, inst.grid.w * TILE * (0.45 + Math.random() * 0.4), { noRespawn: true, tag: 'wave', level });
          m.def = { ...m.def, aggroRange: 1200 };
          this.waveMonsters.add(m.id);
        }
        inst.broadcast({ t: 'ev', k: 'msg', text: `Đợt ${this.wave + 1}/${d.waves.length + 1}`, kind: 'info' });
      } else {
        const boss = inst.spawnMonster(d.boss, inst.grid.w * TILE * 0.8, { noRespawn: true, tag: 'wave' });
        this.bossId = boss.id;
        inst.broadcast({ t: 'ev', k: 'say', i: boss.id, text: `${boss.name} xuất hiện!` });
      }
    }
  }
  onMonsterKilled(inst: MapInstance, m: MonsterEnt): void {
    if (this.waveMonsters.delete(m.id) && this.waveMonsters.size === 0) this.nextAt = Date.now() + 2500;
    if (m.id === this.bossId) this.clear(inst);
  }
  onPlayerKilled(): boolean { return false; }
  private clear(inst: MapInstance): void {
    this.ended = true;
    const d = DUNGEONS[this.dungeonId];
    const present = [...inst.players.values()];
    for (const p of present) {
      p.s.addTuVi(d.rewards.tuvi, 'dungeon'); p.s.addExp(d.rewards.exp);
      questEvent(p.s, 'dungeon', d.id, 1);
      const items = d.rewards.items.filter((i) => Math.random() < i.chance).map((i) => ({ item: i.item, qty: i.qty }));
      p.s.enqueue(() => tx(async (c) => {
        await changeCurrency(c, p.s.charId, 'gold', d.rewards.gold, 'dungeon_reward', 'dungeon', d.id);
        if (items.length) await grantItems(c, p.s.charId, items, `dungeon:${d.id}`);
      })).then(() => pushInventory(p.s)).catch((e) => p.s.notify(`Không nhận được vật phẩm: ${(e as Error).message}`, 'warn'));
      p.s.notify(`Hoàn thành phó bản ${d.name}! Nhận ${d.rewards.gold.toLocaleString('vi-VN')} vàng${items.length ? ', ' + items.map((i) => ITEMS[i.item].name).join(', ') : ''}.`, 'good');
    }
    q("INSERT INTO dungeon_runs(dungeon_id, members, result, started_at) VALUES ($1,$2,'cleared',$3)", [d.id, JSON.stringify(this.members), new Date(this.started)]).catch(() => undefined);
    inst.broadcast({ t: 'ev', k: 'dungeonEnd', ok: true, leaveIn: 15000 });
    setTimeout(() => { for (const p of [...inst.players.values()]) { if (p.dead) p.s.revive(1); world().leaveInstance(p.s); } }, 15000);
  }
  private fail(inst: MapInstance, reason: string): void {
    this.ended = true;
    q("INSERT INTO dungeon_runs(dungeon_id, members, result, started_at) VALUES ($1,$2,'failed',$3)", [this.dungeonId, JSON.stringify(this.members), new Date(this.started)]).catch(() => undefined);
    inst.broadcast({ t: 'ev', k: 'dungeonEnd', ok: false, reason, leaveIn: 5000 });
    setTimeout(() => { for (const p of [...inst.players.values()]) { if (p.dead) p.s.revive(0.5); world().leaveInstance(p.s); } }, 5000);
  }
}
rpc('dungeon.enter', async (s, p) => {
  const id = str(p, 'id', 40);
  const d = DUNGEONS[id];
  assert(d, 'Phó bản không tồn tại');
  assert(!s.ent.inst.instanceKind, 'Hãy rời khu vực hiện tại');
  const party = s.partyId ? world().parties.get(s.partyId) : null;
  assert(!party || party.leader === s.charId, 'Chỉ đội trưởng được mở phó bản');
  const members = party ? [...party.members].map((cid) => world().sessions.get(cid)).filter((x): x is PlayerSession => !!x && x.ent.inst === s.ent.inst) : [s];
  assert(members.length >= d.minPlayers && members.length <= d.maxPlayers, `Phó bản cho ${d.minPlayers}-${d.maxPlayers} người (thành viên phải ở cùng bản đồ)`);
  for (const m of members) {
    if (m.realmIdx < d.reqRealm) throw new GameError(`${m.name} chưa đủ cảnh giới`);
    if (m.ent.dead) throw new GameError(`${m.name} đã tử vong`);
  }
  const today = new Date().toISOString().slice(0, 10);
  await tx(async (c) => {
    for (const m of members) {
      const r = (await c.query('INSERT INTO dungeon_entries(character_id, dungeon_id, day, count) VALUES ($1,$2,$3,1) ON CONFLICT (character_id, dungeon_id, day) DO UPDATE SET count = dungeon_entries.count + 1 RETURNING count', [m.charId, id, today])).rows[0];
      if (r.count > d.dailyLimit) throw new GameError(`${m.name} đã hết lượt vào hôm nay (${d.dailyLimit}/ngày)`);
    }
  });
  const ctl = new DungeonController(id, members.map((m) => m.charId));
  const inst = world().createInstance(d.map, `dg${s.charId}`, ctl);
  for (const m of members) { world().rememberReturn(m); world().enterInstance(m, inst, 5 * TILE); }
  return { ok: true };
});
rpc('dungeon.leave', (s) => {
  const k = s.ent.inst.instanceKind;
  assert(k && k !== 'housing', 'Bạn không ở trong phó bản');
  if (s.ent.dead) s.revive(0.5);
  world().leaveInstance(s);
  return { ok: true };
});
export const _p = { q1 };

import type { WebSocket } from 'ws';
import {
  ITEMS, MAPS, NEAREST_CITY, PROTOCOL_VERSION, QUESTS, SERVER_TICK_HZ, SNAPSHOT_HZ, TILE, WORLD_EVENTS, groundYAt, killRewardScale, gameData,
} from '@tt/shared';
import { q, tx } from '../db.js';
import { log } from '../log.js';
import { redis } from '../redis.js';
import { changeCurrency } from '../services/currency.js';
import { serverError } from '../services/audit.js';
import { eff } from './combat.js';
import type { CombatEnt, MonsterEnt, PlayerEnt } from './entities.js';
import { MapInstance, type InstanceController } from './mapInstance.js';
import { PlayerSession } from './player.js';
import { checkRealmObjectives, questEvent as qEvent } from './quests.js';

const CHANNEL_CAP = 60;
const RECONNECT_GRACE_MS = 30_000;
const SERVER_ID = `node-${process.pid}`;

export interface Party { id: number; leader: number; members: Set<number> }
export interface ActiveEvent { id: number; key: string; name: string; endsAt: number; expMult: number; dropMult: number; map: string; bossId?: string; instKey?: string }

export class World {
  readonly sessions = new Map<number, PlayerSession>();
  readonly byAccount = new Map<number, number>();
  readonly instances = new Map<string, MapInstance>();
  readonly parties = new Map<number, Party>();
  readonly partyInvites = new Map<number, { partyId: number | null; from: number; at: number }>();
  readonly duelRequests = new Map<number, { from: number; at: number }>();
  readonly guildWars = new Map<string, { id: number; a: number; b: number; endsAt: number }>();
  activeEvents: ActiveEvent[] = [];
  private furnitureBonus = new Map<number, number>();
  private timer: NodeJS.Timeout | null = null;
  private jobs: NodeJS.Timeout[] = [];
  private tickCount = 0;
  tickMsAvg = 0;
  startedAt = Date.now();
  hooks: { afterTick?: () => void } = {};

  start(): void {
    const dtMs = 1000 / SERVER_TICK_HZ;
    let last = Date.now();
    this.timer = setInterval(() => {
      const now = Date.now();
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const t0 = performance.now();
      this.tickCount++;
      const snap = this.tickCount % Math.round(SERVER_TICK_HZ / SNAPSHOT_HZ) === 0;
      for (const inst of this.instances.values()) {
        try {
          if (inst.players.size === 0 && inst.instanceKind == null && inst.monsters.size > 0 && this.tickCount % 4 !== 0) continue; // bản đồ trống: giảm tần suất
          inst.tick(dt);
          if (snap) inst.sendSnapshots();
        } catch (e) {
          log.error('instance tick error', { key: inst.key, err: String((e as Error).stack ?? e) });
          serverError(`tick:${inst.key}`, e).catch(() => undefined);
        }
      }
      this.tickMsAvg = this.tickMsAvg * 0.95 + (performance.now() - t0) * 0.05;
      this.hooks.afterTick?.();
    }, dtMs);
    this.jobs.push(setInterval(() => this.autosave().catch((e) => log.error('autosave', { err: String(e) })), 30_000));
    this.jobs.push(setInterval(() => this.housekeeping().catch((e) => log.error('housekeeping', { err: String(e) })), 10_000));
  }
  async stop(): Promise<void> {
    if (this.timer) clearInterval(this.timer);
    for (const j of this.jobs) clearInterval(j);
    await this.autosave();
    for (const s of this.sessions.values()) s.ws?.close(1001, 'server shutdown');
  }

  // ---------------- instance ----------------
  getPublicInstance(mapId: string, prefer?: number): MapInstance {
    const def = MAPS[mapId];
    if (!def || def.instance) throw new Error('not a public map ' + mapId);
    const order = prefer ? [prefer, ...Array.from({ length: def.channels }, (_, i) => i + 1).filter((c) => c !== prefer)] : Array.from({ length: def.channels }, (_, i) => i + 1);
    for (const ch of order) {
      const key = `${mapId}#${ch}`;
      let inst = this.instances.get(key);
      if (!inst) { inst = new MapInstance(this, def, key, ch, null); inst.spawnInitial(); this.instances.set(key, inst); }
      if (inst.players.size < CHANNEL_CAP || ch === order[order.length - 1]) return inst;
    }
    throw new Error('unreachable');
  }
  createInstance(mapId: string, ownerKey: string, controller: InstanceController | null, spawnDefault = false): MapInstance {
    const def = MAPS[mapId];
    const key = `${mapId}@${ownerKey}@${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
    const inst = new MapInstance(this, def, key, 1, def.instance ?? 'dungeon', ownerKey);
    inst.controller = controller;
    if (spawnDefault) inst.spawnInitial();
    this.instances.set(key, inst);
    return inst;
  }
  findInstance(pred: (i: MapInstance) => boolean): MapInstance | undefined { for (const i of this.instances.values()) if (pred(i)) return i; return undefined; }

  /** Đưa người chơi vào bản đồ (server quyết định vị trí) */
  enterInstance(s: PlayerSession, inst: MapInstance, x?: number): void {
    const old = s.ent?.inst;
    if (old) old.removePlayer(s.ent);
    s.stopMeditate(); s.interruptChannel('');
    const px = Math.max(2 * TILE, Math.min((inst.grid.w - 2) * TILE, x ?? inst.def.spawnX));
    const py = groundYAt(inst.grid, px);
    if (!s.ent) {
      s.ent = { id: `p${s.charId}`, kind: 'p', name: s.row.name, x: px, y: py, vx: 0, vy: 0, w: 26, h: 58, facing: 1, anim: 'idle', animUntil: 0, hp: 1, stats: s.stats, statuses: [], shield: 0, dead: false, onGround: true, inst, s };
      const max = s.stats.maxHp;
      s.ent.hp = s.row.hp > 0 ? Math.min(max, s.row.hp) : max;
      s.mp = s.row.mp >= 0 ? Math.min(s.stats.maxMp, s.row.mp) : s.stats.maxMp;
    }
    s.ent.x = px; s.ent.y = py; s.ent.vx = 0; s.ent.vy = 0; s.ent.inst = inst;
    s.known.clear(); s.lastSelfSig = ''; s.airSince = 0;
    inst.addPlayer(s.ent);
    if (s.summonedPetId) this.spawnOwnedPet(s).catch(() => undefined);
    s.send({
      t: 'map', map: inst.def.id, key: inst.key, ch: inst.channel, inst: inst.instanceKind, x: px, y: py, self: s.selfState(),
      nodes: Object.fromEntries([...inst.nodeReadyAt].filter(([, t]) => t > Date.now()).map(([k, t]) => [k, t - Date.now()])),
      events: this.activeEvents.filter((e) => e.map === '*' || e.map === inst.def.id).map((e) => ({ name: e.name, endsIn: e.endsAt - Date.now() })),
    });
    qEvent(s, 'reach', inst.def.id, 1);
  }
  async spawnOwnedPet(s: PlayerSession): Promise<void> {
    if (!s.summonedPetId || !s.ent) return;
    const pet = (await q<{ id: number; template_id: string; name: string; level: number; quality: number }>('SELECT * FROM pets WHERE id = $1 AND owner_id = $2', [s.summonedPetId, s.charId]))[0];
    if (!pet) { s.summonedPetId = null; return; }
    const gear = await q<{ template_id: string }>("SELECT template_id FROM item_instances WHERE container = 'pet' AND ref_id = $1", [String(pet.id)]);
    const gs: Record<string, number> = {};
    for (const g of gear) for (const [k, v] of Object.entries(ITEMS[g.template_id]?.stats ?? {})) gs[k] = (gs[k] ?? 0) + (v as number);
    for (const p of [...s.ent.inst.pets.values()]) if (p.ownerId === s.ent.id && p.petId) s.ent.inst.removePet(p);
    s.ent.inst.addRealPet(s.ent, pet.id, pet.template_id, pet.name, pet.level, pet.quality, gs);
  }

  enterMapById(s: PlayerSession, mapId: string, x?: number): void {
    const def = MAPS[mapId];
    if (!def || def.instance) throw new Error('bad map');
    if (s.ent?.inst.instanceKind) s.returnPoint = null;
    this.enterInstance(s, this.getPublicInstance(mapId), x);
  }
  /** Rời instance về điểm trở lại (hoặc thành gần nhất) */
  leaveInstance(s: PlayerSession): void {
    const rp = s.returnPoint;
    s.returnPoint = null;
    if (rp && MAPS[rp.map] && !MAPS[rp.map].instance) this.enterMapById(s, rp.map, rp.x);
    else this.enterMapById(s, NEAREST_CITY[MAPS[s.ent.inst.def.id]?.world ?? 'nhan_gioi'] ?? 'thanh_van_thanh');
  }
  rememberReturn(s: PlayerSession): void {
    if (!s.ent.inst.instanceKind) s.returnPoint = { map: s.ent.inst.def.id, x: s.ent.x, y: s.ent.y };
  }

  // ---------------- kết nối ----------------
  isOnline(charId: number): boolean { return this.sessions.has(charId); }
  online(): PlayerSession[] { return [...this.sessions.values()]; }
  byName(name: string): PlayerSession | undefined {
    const n = name.normalize('NFC').toLowerCase();
    for (const s of this.sessions.values()) if (s.row.name.toLowerCase() === n) return s;
    return undefined;
  }

  async connect(ws: WebSocket, accountId: number, role: string, charId: number, mutedUntil: Date | null): Promise<PlayerSession> {
    // chống đăng nhập đồng thời: một tài khoản chỉ một nhân vật trực tuyến
    const prevChar = this.byAccount.get(accountId);
    let s: PlayerSession | undefined;
    if (prevChar !== undefined) {
      const prev = this.sessions.get(prevChar);
      if (prev) {
        if (prevChar === charId) {
          // tiếp quản phiên (reconnect hoặc đăng nhập từ thiết bị khác) — không nạp lại để tránh lệch dữ liệu
          if (prev.ws && prev.ws !== ws) { prev.send({ t: 'kick', reason: 'Tài khoản đăng nhập từ nơi khác' }); prev.ws.close(4001, 'replaced'); }
          s = prev;
        } else {
          prev.send({ t: 'kick', reason: 'Tài khoản đăng nhập nhân vật khác' });
          prev.ws?.close(4001, 'replaced');
          await this.removeSession(prev);
        }
      }
    }
    const cross = await redis().set(`online:acc:${accountId}`, `${SERVER_ID}:${charId}`, 'EX', 120).catch(() => null);
    void cross;
    if (!s) {
      s = new PlayerSession(this, charId, accountId, role);
      await s.load();
      this.sessions.set(charId, s);
      this.byAccount.set(accountId, charId);
      this.restoreParty(s);
      s.mutedUntil = mutedUntil;
      s.attach(ws);
      const def = MAPS[s.row.map_id];
      const mapId = def && !def.instance ? def.id : 'tan_thu_thon';
      this.enterInstance(s, this.getPublicInstance(mapId), def && !def.instance ? s.row.x : undefined);
      this.notifyFriends(s, true).catch(() => undefined);
    } else {
      s.mutedUntil = mutedUntil;
      s.attach(ws);
      this.enterInstance(s, s.ent.inst, s.ent.x);
    }
    s.send({ t: 'hello', proto: PROTOCOL_VERSION, data: gameData().version, server: SERVER_ID });
    return s;
  }
  onSocketClosed(s: PlayerSession, ws: WebSocket): void {
    if (s.ws !== ws) return;
    s.ws = null;
    s.disconnectedAt = Date.now();
  }
  async removeSession(s: PlayerSession): Promise<void> {
    try { await s.save(); } catch (e) { log.error('save on leave failed', { char: s.charId, err: String(e) }); }
    if (s.tradeId) this.tradeCancelHook?.(s);
    s.ent?.inst.removePlayer(s.ent);
    this.sessions.delete(s.charId);
    if (this.byAccount.get(s.accountId) === s.charId) this.byAccount.delete(s.accountId);
    await redis().del(`online:acc:${s.accountId}`).catch(() => undefined);
    this.notifyFriends(s, false).catch(() => undefined);
    this.leaveQueueHook?.(s);
  }
  tradeCancelHook?: (s: PlayerSession) => void;
  leaveQueueHook?: (s: PlayerSession) => void;

  // ---------------- định kỳ ----------------
  async autosave(): Promise<void> {
    for (const s of this.sessions.values()) await s.save().catch((e) => log.error('autosave char', { char: s.charId, err: String(e) }));
  }
  private async housekeeping(): Promise<void> {
    const now = Date.now();
    for (const s of [...this.sessions.values()]) {
      if (!s.ws && s.disconnectedAt && now - s.disconnectedAt > RECONNECT_GRACE_MS) await this.removeSession(s);
      else if (s.ws) await redis().expire(`online:acc:${s.accountId}`, 120).catch(() => undefined);
    }
    for (const [key, inst] of this.instances) {
      if (inst.instanceKind && inst.players.size === 0 && inst.emptySince && now - inst.emptySince > 60_000) this.instances.delete(key);
    }
    for (const [k, v] of this.partyInvites) if (now - v.at > 60_000) this.partyInvites.delete(k);
    for (const [k, v] of this.duelRequests) if (now - v.at > 60_000) this.duelRequests.delete(k);
    for (const [k, w] of this.guildWars) if (now > w.endsAt) { this.guildWars.delete(k); this.guildWarEndHook?.(w.id); }
    await this.housekeepingHook?.();
  }
  housekeepingHook?: () => Promise<void>;
  guildWarEndHook?: (id: number) => void;

  // ---------------- phần thưởng ----------------
  expMultiplier(mapId?: string): number {
    let m = 1;
    for (const e of this.activeEvents) if (e.map === '*' || e.map === mapId) m *= e.expMult;
    return m;
  }
  dropMultiplier(mapId: string): number {
    let m = 1;
    for (const e of this.activeEvents) if (e.map === '*' || e.map === mapId) m *= e.dropMult;
    return m;
  }

  /** Phần thưởng khi hạ quái: tu vi cho mọi người góp sức (theo tổ đội), vật phẩm rơi thuộc về người/tổ đội góp nhiều nhất */
  rewardKill(inst: MapInstance, m: MonsterEnt, _src: CombatEnt | null): void {
    if (m.tag === 'trial') return;
    const contributors: PlayerEnt[] = [];
    let top: PlayerEnt | undefined; let topV = 0;
    for (const [id, v] of m.threat) {
      const p = inst.players.get(id);
      if (!p) continue;
      contributors.push(p);
      if (v > topV) { topV = v; top = p; }
    }
    if (!top) return;
    // tổ đội ở gần cũng nhận phần
    const recipients = new Set<PlayerEnt>(contributors);
    for (const c of contributors) if (c.s.partyId) for (const p of inst.players.values()) if (p.s.partyId === c.s.partyId && Math.abs(p.x - m.x) < 1500) recipients.add(p);
    const partyBonus = 1 + 0.1 * (recipients.size - 1);
    for (const p of recipients) {
      if (p.dead) continue;
      const scale = killRewardScale(p.s.powerLevel(), m.def.level);
      p.s.addTuVi((m.def.tuvi + m.def.exp * 0.5) * scale * partyBonus, 'kill');
      p.s.addExp(m.def.exp * scale);
      qEvent(p.s, 'kill', m.def.id, 1);
      this.petExpHook?.(p.s, Math.round(m.def.exp * scale * 0.3));
    }
    const owners = top.s.partyId ? [...recipients].filter((p) => p.s.partyId === top!.s.partyId).map((p) => p.s.charId) : [top.s.charId];
    // vàng: chia đều cho chủ sở hữu (giao dịch DB nhỏ, nguồn sinh tiền ghi sổ cái)
    const gold = Math.round((m.def.gold[0] + Math.random() * (m.def.gold[1] - m.def.gold[0])) * killRewardScale(top.s.powerLevel(), m.def.level));
    if (gold > 0) {
      const each = Math.max(1, Math.floor(gold / owners.length));
      for (const cid of owners) {
        const s = this.sessions.get(cid);
        if (!s) continue;
        s.enqueue(() => tx((c) => changeCurrency(c, cid, 'gold', each, 'monster_kill', 'monster', m.def.id))).then((bal) => s.send({ t: 'ev', k: 'cur', gold: bal, add: each })).catch(() => undefined);
      }
    }
    // vật phẩm rơi
    const dm = this.dropMultiplier(inst.def.id) * inst.dropMult;
    for (const d of m.def.drops) {
      if (d.questOnly) {
        const need = owners.some((cid) => this.sessions.get(cid)?.quests.get(d.questOnly!)?.state === 'active');
        if (!need) continue;
      } else if (Math.random() > Math.min(1, d.chance * dm)) continue;
      const qty = d.min + Math.floor(Math.random() * (d.max - d.min + 1));
      inst.addDrop(d.item, qty, m.x, owners);
    }
  }
  petExpHook?: (s: PlayerSession, exp: number) => void;

  questEvent(charId: number, type: string, target: string, n: number): void {
    const s = this.sessions.get(charId);
    if (s) qEvent(s, type as never, target, n);
  }
  questRealmCheck(s: PlayerSession): void { checkRealmObjectives(s); }
  escortFailed(charId: number, questId: string, _obj: string): void {
    const s = this.sessions.get(charId);
    if (!s) return;
    s.notify(`Nhiệm vụ "${QUESTS[questId]?.name}": người được hộ tống đã gục ngã. Hãy nói chuyện lại để thử lại.`, 'warn');
  }

  // ---------------- PvP ----------------
  pvpAllowed(pa: PlayerEnt, pb: PlayerEnt): boolean {
    const inst = pa.inst;
    if (pa.s.duelWith === pb.s.charId && pb.s.duelWith === pa.s.charId) return true;
    if (inst.instanceKind === 'arena') return true;
    if (inst.def.safe || inst.instanceKind) return false;
    if (pa.s.partyId && pa.s.partyId === pb.s.partyId) return false;
    if (pa.s.guildId && pa.s.guildId === pb.s.guildId) return false;
    // bảo hộ tân thủ & chống bắt nạt: cảnh giới < 3 miễn PvP; chênh > 2 cảnh giới thì người mạnh không tấn công được
    if (pb.s.realmIdx < 3 || pa.s.realmIdx < 3) return false;
    if (pa.s.realmIdx - pb.s.realmIdx > 2) return false;
    if (pa.s.guildId && pb.s.guildId && this.atWar(pa.s.guildId, pb.s.guildId)) return true;
    if (inst.def.pvp !== 'open') return false;
    if (pa.s.row.pvp_mode !== 'peace') return true;
    // chế độ hòa bình: chỉ được phản kích kẻ vừa tấn công mình trong 30 giây
    return pa.s.lastAggressor === pb.s.charId && Date.now() - pa.s.lastAggressorAt < 30_000;
  }
  atWar(a: number, b: number): boolean { return this.guildWars.has(a < b ? `${a}:${b}` : `${b}:${a}`); }

  onPlayerDeath(s: PlayerSession, killer: CombatEnt | null, handled: boolean): void {
    const kp = killer ? (killer.kind === 'p' ? (killer as PlayerEnt) : killer.kind === 'pet' ? (s.ent.inst.entity((killer as unknown as { ownerId: string }).ownerId) as PlayerEnt | undefined) : undefined) : undefined;
    if (s.duelWith && kp && kp.s.charId === s.duelWith) {
      this.endDuel(kp.s, s);
      return;
    }
    if (handled || !kp) return;
    // chiến tranh tông môn: cộng điểm
    if (kp.s.guildId && s.guildId && this.atWar(kp.s.guildId, s.guildId)) this.guildWarScoreHook?.(kp.s.guildId, s.guildId);
    else if (s.ent.inst.def.pvp === 'open') {
      // điểm PK khi giết người không khiêu chiến trước
      if (s.lastAggressor !== kp.s.charId) { kp.s.row.pk_points += 1; q('UPDATE characters SET pk_points = pk_points + 1 WHERE id = $1', [kp.s.charId]).catch(() => undefined); }
    }
  }
  guildWarScoreHook?: (killerGuild: number, victimGuild: number) => void;
  endDuel(winner: PlayerSession, loser: PlayerSession): void {
    winner.duelWith = null; loser.duelWith = null;
    loser.revive(0.3);
    const msg = `${winner.name} đã thắng ${loser.name} trong trận tỉ thí!`;
    winner.ent.inst.emitNear(winner.ent.x, { t: 'ev', k: 'msg', text: msg, kind: 'good' });
  }

  // ---------------- tổ đội ----------------
  restoreParty(s: PlayerSession): void {
    for (const p of this.parties.values()) if (p.members.has(s.charId)) { s.partyId = p.id; return; }
    q<{ party_id: number }>('SELECT party_id FROM party_members WHERE character_id = $1', [s.charId]).then(async (r) => {
      if (!r[0]) return;
      const pid = r[0].party_id;
      if (!this.parties.has(pid)) {
        const mem = await q<{ character_id: number }>('SELECT character_id FROM party_members WHERE party_id = $1', [pid]);
        const lead = await q<{ leader_id: number }>('SELECT leader_id FROM parties WHERE id = $1', [pid]);
        if (!lead[0]) return;
        this.parties.set(pid, { id: pid, leader: lead[0].leader_id, members: new Set(mem.map((m) => m.character_id)) });
      }
      s.partyId = pid;
      this.pushParty(pid);
    }).catch(() => undefined);
  }
  pushParty(pid: number): void {
    const p = this.parties.get(pid);
    if (!p) return;
    const members = [...p.members].map((cid) => {
      const s = this.sessions.get(cid);
      return { id: cid, name: s?.name ?? '?', online: !!s, hp: s ? Math.round(s.ent.hp) : 0, mhp: s ? Math.round(eff(s.ent).maxHp) : 0, map: s?.ent.inst.def.name ?? '', realm: s?.realmLabel() ?? '' };
    });
    for (const cid of p.members) this.sessions.get(cid)?.send({ t: 'ev', k: 'party', d: { id: pid, leader: p.leader, members } });
  }

  // ---------------- bạn bè ----------------
  async notifyFriends(s: PlayerSession, online: boolean): Promise<void> {
    const rows = await q<{ character_id: number }>("SELECT character_id FROM friends WHERE friend_id = $1 AND status = 'accepted'", [s.charId]);
    for (const r of rows) this.sessions.get(r.character_id)?.send({ t: 'ev', k: 'friend', name: s.name, online });
  }

  // ---------------- động phủ ----------------
  setFurnitureBonus(charId: number, v: number): void { this.furnitureBonus.set(charId, v); }
  housingFurnitureBonus(charId: number): number { return this.furnitureBonus.get(charId) ?? 0; }

  // ---------------- chat/thông báo ----------------
  broadcastAll(msg: object): void { const s = JSON.stringify(msg); for (const x of this.sessions.values()) x.sendRaw(s); }
  announce(text: string): void { this.broadcastAll({ t: 'chat', ch: 'system', from: 'Hệ Thống', text }); }

  // ---------------- sự kiện thế giới ----------------
  startEvent(id: number, key: string, endsAt: number): ActiveEvent | null {
    const def = WORLD_EVENTS[key];
    if (!def || this.activeEvents.some((e) => e.id === id)) return null;
    const ev: ActiveEvent = { id, key, name: def.name, endsAt, expMult: def.expMult ?? 1, dropMult: def.dropMult ?? 1, map: def.map };
    if (def.map !== '*' && MAPS[def.map]) {
      const inst = this.getPublicInstance(def.map, 1);
      if (def.boss) { const m = inst.spawnMonster(def.boss, inst.grid.w * TILE * 0.5, { noRespawn: true, tag: 'event' }); ev.bossId = m.id; ev.instKey = inst.key; }
      for (const sp of def.spawns ?? []) for (let i = 0; i < sp.count; i++) inst.spawnMonster(sp.monster, sp.x1 + Math.random() * (sp.x2 - sp.x1), { noRespawn: true, tag: 'event' });
    }
    this.activeEvents.push(ev);
    this.announce(`[Sự kiện] ${def.name}: ${def.desc}`);
    return ev;
  }
  endEvent(id: number): void {
    const ev = this.activeEvents.find((e) => e.id === id);
    if (!ev) return;
    this.activeEvents = this.activeEvents.filter((e) => e !== ev);
    if (ev.instKey && ev.bossId) { const inst = this.instances.get(ev.instKey); const m = inst?.monsters.get(ev.bossId); if (m && !m.dead) inst!.monsters.delete(m.id); }
    this.announce(`[Sự kiện] ${ev.name} đã kết thúc.`);
  }

  stats(): Record<string, unknown> {
    let monsters = 0;
    for (const i of this.instances.values()) monsters += i.monsters.size;
    return { online: this.sessions.size, instances: this.instances.size, monsters, tickMsAvg: Math.round(this.tickMsAvg * 100) / 100, uptimeSec: Math.round((Date.now() - this.startedAt) / 1000), events: this.activeEvents.map((e) => e.name) };
  }
}

let _world: World | null = null;
export function world(): World { if (!_world) _world = new World(); return _world; }
export function resetWorldForTests(): void { _world = null; }

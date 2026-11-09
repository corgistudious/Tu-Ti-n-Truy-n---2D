import type { WebSocket } from 'ws';
import {
  EQUIP_SLOTS, ITEMS, LIMITS, MOVE_VALIDATION, PHYSICS, QUESTS, SKILLS, TILE, combatPower, meditationRate, overlapsSolid, powerLevel,
  realmDef, realmName, standingOn, tuViRequired, type Appearance, type PartialStats, type Stats,
} from '@tt/shared';
import { q, tx, type Tx } from '../db.js';
import { log } from '../log.js';
import { computeStats } from '../services/stats.js';
import type { ItemRow } from '../services/items.js';
import { GameError } from '../services/errors.js';
import { castSkill, eff, isDisabled, skill as getSkill, applyStatus } from './combat.js';
import { powerModifiers, cultivationMultiplier, checkFortunes } from './power.js';
import type { CombatEnt, PlayerEnt } from './entities.js';
import type { World } from './world.js';

export interface QuestState { state: 'active' | 'done'; progress: Record<string, number>; times: number; completedAt: Date | null; dirty?: boolean }

export interface CharRow {
  id: number; account_id: number; name: string; gender: string; appearance: Appearance; realm_idx: number; layer: number; tu_vi: number; exp: number;
  hp: number; mp: number; map_id: string; x: number; y: number; hotbar: string[]; keybinds: unknown; title: string | null; titles: string[]; pvp_mode: string;
  pk_points: number; arena_rating: number; bt_fail_streak: number; bt_cooldown_until: Date | null; playtime_sec: number;
}

type Channel = { kind: 'gather' | 'meditate'; until: number; x: number; data: Record<string, unknown>; onDone?: () => void };

export class PlayerSession {
  ws: WebSocket | null = null;
  ent!: PlayerEnt;
  row!: CharRow;
  stats!: Stats;
  mp = 0;
  equipment: ItemRow[] = [];
  permanent: PartialStats = {};
  skills = new Map<string, number>();
  quests = new Map<string, QuestState>();
  cds = new Map<string, number>();
  itemCds = new Map<string, number>();
  known = new Map<string, string>();
  lastSelfSig = '';
  partyId: number | null = null;
  guildId: number | null = null;
  guildName: string | null = null;
  guildRank: string | null = null;
  invulnUntil = 0;
  lastCombatAt = 0;
  comboStep = 0;
  lastAttackAt = 0;
  castUntil = 0;
  dodgeUntil = 0;
  lastInputAt = 0;
  lastInputSeq = 0;
  airSince = 0;
  airMinY = 0;
  violations = 0;
  meditating = false;
  channel: Channel | null = null;
  tradeLocked = new Set<string>();
  tradeId: string | null = null;
  duelWith: number | null = null;
  returnPoint: { map: string; x: number; y: number } | null = null;
  disconnectedAt = 0;
  mutedUntil: Date | null = null;
  housingBonus = 0;
  summonedPetId: number | null = null;
  lastAggressor = 0;
  power: import('./power.js').PowerState = { element: null, grade: 0, physique: 'pham_the', meridians: 0 };
  rep = new Map<string, number>();
  fortuneAcc = 0;
  achDone = new Set<string>();
  counters = new Map<string, number>();
  dirtyCounters = new Set<string>();
  dynamicTitles: string[] = [];
  achCaughtUp = false;
  lastAggressorAt = 0;
  private queue: Promise<unknown> = Promise.resolve();
  private msgWindow = { start: 0, count: 0 };
  private playStart = Date.now();
  dirty = false;
  loaded = false;

  constructor(readonly world: World, readonly charId: number, readonly accountId: number, readonly role: string) {}

  get name(): string { return this.row.name; }
  get realmIdx(): number { return this.row.realm_idx; }
  get layer(): number { return this.row.layer; }

  // ---------------- tải dữ liệu ----------------
  async load(): Promise<void> {
    const rows = await q<CharRow>('SELECT * FROM characters WHERE id = $1 AND deleted_at IS NULL', [this.charId]);
    if (!rows[0]) throw new GameError('Không tìm thấy nhân vật');
    this.row = rows[0];
    const st = await q<{ bonus: PartialStats }>('SELECT bonus FROM character_stats WHERE character_id = $1', [this.charId]);
    this.permanent = st[0]?.bonus ?? {};
    for (const s of await q<{ skill_id: string; level: number }>('SELECT skill_id, level FROM character_skills WHERE character_id = $1', [this.charId])) this.skills.set(s.skill_id, s.level);
    for (const r of await q<{ quest_id: string; state: 'active' | 'done'; progress: Record<string, number>; times_done: number; completed_at: Date | null }>('SELECT * FROM quest_progress WHERE character_id = $1', [this.charId])) {
      this.quests.set(r.quest_id, { state: r.state, progress: r.progress, times: r.times_done, completedAt: r.completed_at });
    }
    const g = await q<{ guild_id: number; rank: string; name: string }>('SELECT gm.guild_id, gm.rank, g.name FROM guild_members gm JOIN guilds g ON g.id = gm.guild_id WHERE gm.character_id = $1 AND g.disbanded_at IS NULL', [this.charId]);
    if (g[0]) { this.guildId = g[0].guild_id; this.guildRank = g[0].rank; this.guildName = g[0].name; }
    const h = await q<{ buildings: Record<string, number> }>('SELECT buildings FROM housing WHERE character_id = $1', [this.charId]);
    this.housingBonus = (h[0]?.buildings?.tu_linh_tran ?? 0) * 0.15;
    await (await import('./power.js')).loadPower(this);
    await (await import('./achievements.js')).loadAchievements(this);
    await this.reloadEquipment();
    this.resetDailyQuests();
    this.loaded = true;
  }
  async reloadEquipment(c?: Tx): Promise<void> {
    const r = c ? (await c.query("SELECT * FROM item_instances WHERE owner_id = $1 AND container = 'equip'", [this.charId])).rows : await q<ItemRow>("SELECT * FROM item_instances WHERE owner_id = $1 AND container = 'equip'", [this.charId]);
    this.equipment = r as ItemRow[];
    this.recomputeStats();
  }
  recomputeStats(): void {
    const prevMax = this.stats?.maxHp;
    const mods = powerModifiers(this);
    const perm: PartialStats = { ...this.permanent };
    for (const [k, v] of Object.entries(mods.pct)) (perm as Record<string, number>)[k] = ((perm as Record<string, number>)[k] ?? 0) + (v as number);
    this.stats = computeStats({ realmIdx: this.row.realm_idx, layer: this.row.layer, equipment: this.equipment, permanent: perm, flat: mods.flat, buffs: [] });
    if (this.ent) {
      this.ent.stats = this.stats;
      if (prevMax && this.ent.hp > this.stats.maxHp) this.ent.hp = this.stats.maxHp;
    }
    this.row.hp = this.ent?.hp ?? this.row.hp;
  }
  private resetDailyQuests(): void {
    const today = new Date().toDateString();
    for (const [id, qs] of this.quests) {
      const d = QUESTS[id];
      if (d?.repeatable === 'daily' && qs.state === 'done' && qs.completedAt && new Date(qs.completedAt).toDateString() !== today) {
        this.quests.delete(id);
        q('DELETE FROM quest_progress WHERE character_id = $1 AND quest_id = $2', [this.charId, id]).catch(() => undefined);
      }
    }
  }

  // ---------------- mạng ----------------
  attach(ws: WebSocket): void { this.ws = ws; this.disconnectedAt = 0; this.known.clear(); this.lastSelfSig = ''; }
  send(msg: object): void { this.sendRaw(JSON.stringify(msg)); }
  sendRaw(s: string): void { if (this.ws && this.ws.readyState === 1) this.ws.send(s); }
  notify(text: string, kind: 'info' | 'warn' | 'good' = 'info'): void { this.send({ t: 'ev', k: 'msg', text, kind }); }

  /** Chống spam gói tin: tối đa 60 gói/giây */
  allowMessage(): boolean {
    const now = Date.now();
    if (now - this.msgWindow.start > 1000) { this.msgWindow = { start: now, count: 0 }; }
    return ++this.msgWindow.count <= 60;
  }
  /** Tuần tự hóa thao tác nghiệp vụ của một người chơi — chống race condition nhân đôi vật phẩm */
  enqueue<T>(fn: () => Promise<T>): Promise<T> {
    const p = this.queue.then(fn, fn);
    this.queue = p.catch(() => undefined);
    return p;
  }

  visual(): Record<string, unknown> {
    const look: Record<string, string | undefined> = {};
    for (const it of this.equipment) { const d = ITEMS[it.template_id]; if (d?.appearance && d.slot) look[d.slot] = d.appearance; }
    return { ...this.row.appearance, weapon: look.weapon, fashion: look.fashion, mount: look.mount, title: this.row.title };
  }
  realmLabel(): string { return realmName(this.row.realm_idx, this.row.layer); }

  /** Dữ liệu đầy đủ của bản thân gửi khi vào bản đồ */
  selfState(): Record<string, unknown> {
    const req = tuViRequired(this.row.realm_idx, this.row.layer);
    return {
      id: this.ent.id, charId: this.charId, name: this.row.name, appearance: this.visual(), realm: this.row.realm_idx, layer: this.row.layer, realmName: this.realmLabel(),
      tuVi: this.row.tu_vi, tuViReq: req, exp: this.row.exp, hp: Math.round(this.ent.hp), mp: Math.round(this.mp), stats: eff(this.ent), hotbar: this.row.hotbar,
      skills: Object.fromEntries(this.skills), keybinds: this.row.keybinds, title: this.row.title, titles: [...new Set([...this.row.titles, ...this.dynamicTitles])], pvpMode: this.row.pvp_mode,
      guild: this.guildId ? { id: this.guildId, name: this.guildName, rank: this.guildRank } : null, partyId: this.partyId, power: combatPower(this.stats),
      btCooldown: this.row.bt_cooldown_until, arenaRating: this.row.arena_rating, pk: this.row.pk_points,
    };
  }
  pushStats(): void {
    this.send({ t: 'ev', k: 'self', d: { realm: this.row.realm_idx, layer: this.row.layer, realmName: this.realmLabel(), tuVi: this.row.tu_vi, tuViReq: tuViRequired(this.row.realm_idx, this.row.layer), exp: this.row.exp, stats: eff(this.ent), power: combatPower(this.stats), appearance: this.visual() } });
  }

  // ---------------- tu vi ----------------
  /** Cộng tu vi; tự lên tầng trong cùng cảnh giới; tầng 9 đầy thì dừng chờ đột phá */
  addTuVi(amount: number, source: string): void {
    if (amount <= 0 || !Number.isFinite(amount)) return;
    const rootMult = source === 'meditate' ? cultivationMultiplier(this) : source === 'kill' ? 1 + (cultivationMultiplier(this) - 1) / 2 : 1;
    const terr = this.guildId && this.ent ? this.world.territories.get(this.ent.inst.def.id) : undefined;
    const terrMult = terr && terr.guildId === this.guildId ? 1.1 : 1;
    let gained = Math.floor(amount * rootMult * terrMult * this.world.expMultiplier(this.ent?.inst?.def.id));
    let leveled = false;
    while (gained > 0) {
      const req = tuViRequired(this.row.realm_idx, this.row.layer);
      const room = req - this.row.tu_vi;
      if (gained < room) { this.row.tu_vi += gained; gained = 0; break; }
      if (this.row.layer < 9) { gained -= room; this.row.tu_vi = 0; this.row.layer++; leveled = true; }
      else { this.row.tu_vi = req; gained = 0; }
    }
    this.dirty = true;
    if (leveled) {
      this.recomputeStats();
      this.ent.hp = eff(this.ent).maxHp; this.mp = eff(this.ent).maxMp;
      this.notify(`Tu vi tinh tiến: ${this.realmLabel()}`, 'good');
      this.ent.inst.emitNear(this.ent.x, { t: 'ev', k: 'lvl', i: this.ent.id, lv: this.realmLabel() });
      this.world.questRealmCheck(this);
    }
    this.send({ t: 'ev', k: 'tuvi', v: this.row.tu_vi, req: tuViRequired(this.row.realm_idx, this.row.layer), add: Math.floor(amount), src: source, layer: this.row.layer });
  }
  addExp(amount: number): void { this.row.exp += Math.floor(amount); this.dirty = true; }

  // ---------------- vòng lặp ----------------
  tick(dt: number): void {
    const e = this.ent; if (!e || e.dead) return;
    const now = e.inst.now;
    const es = eff(e);
    const outOfCombat = now - this.lastCombatAt > 5000;
    const mult = this.meditating ? 3 : outOfCombat ? 1 : 0.25;
    if (e.hp < es.maxHp) e.hp = Math.min(es.maxHp, e.hp + es.hpRegen * mult * dt);
    if (this.mp < es.maxMp) this.mp = Math.min(es.maxMp, this.mp + es.mpRegen * (mult + 0.5) * dt);
    if (this.meditating) {
      this.medAcc = (this.medAcc ?? 0) + dt;
      if (this.medAcc >= 1) {
        this.medAcc -= 1;
        const inHouse = e.inst.instanceKind === 'housing' && e.inst.ownerKey === String(this.charId);
        const rate = meditationRate(this.row.realm_idx, this.row.layer, e.inst.def.spiritDensity, inHouse ? this.housingBonus + this.world.housingFurnitureBonus(this.charId) : 0);
        this.addTuVi(rate, 'meditate');
        if (++this.fortuneAcc >= 30) { this.fortuneAcc = 0; checkFortunes(this, 'meditate', { map: e.inst.def.id }).catch(() => undefined); }
      }
    }
    if (this.channel && now >= this.channel.until) { const c = this.channel; this.channel = null; e.anim = 'idle'; c.onDone?.(); }
  }
  medAcc = 0;

  startChannel(kind: Channel['kind'], seconds: number, data: Record<string, unknown>, onDone: () => void): void {
    this.stopMeditate();
    this.channel = { kind, until: this.ent.inst.now + seconds * 1000, x: this.ent.x, data, onDone };
    this.ent.anim = 'cast';
    this.send({ t: 'ev', k: 'chan', d: seconds * 1000, kind, ...data });
  }
  interruptChannel(reason: string): void {
    if (this.channel) { this.channel = null; this.send({ t: 'ev', k: 'chanx', reason }); }
    if (this.meditating && reason) this.stopMeditate();
  }
  stopMeditate(): void { if (this.meditating) { this.meditating = false; this.ent.anim = 'idle'; this.send({ t: 'ev', k: 'med', on: false }); } }

  // ---------------- di chuyển (chống gian lận) ----------------
  /** Client gửi vị trí dự đoán; server kiểm tra tốc độ, va chạm, thời gian trên không. */
  handleInput(m: { seq: number; x: number; y: number; vx: number; vy: number; f: number; g: boolean; a: string }): void {
    const e = this.ent; if (!e) return;
    if (!Number.isFinite(m.x) || !Number.isFinite(m.y) || !Number.isFinite(m.vx) || !Number.isFinite(m.vy)) return;
    if (m.seq <= this.lastInputSeq) return; // chống replay
    this.lastInputSeq = m.seq;
    const now = Date.now();
    if (e.dead) return;
    const dt = Math.min(MOVE_VALIDATION.maxReportGap, Math.max(0.03, (now - (this.lastInputAt || now - 66)) / 1000));
    this.lastInputAt = now;
    const es = eff(e);
    if (isDisabled(e) || now < this.castUntil - 50) { this.correct(); return; }
    const dodging = now < this.dodgeUntil + 150;
    const maxSpeed = (dodging ? PHYSICS.dodgeSpeed : PHYSICS.runSpeed * es.moveSpeed) * MOVE_VALIDATION.speedTolerance;
    const dx = m.x - e.x;
    const maxDx = maxSpeed * dt + MOVE_VALIDATION.horizontalSlackPx + Math.abs(e.vx) * 0.05;
    const grid = e.inst.grid;
    let ok = Math.abs(dx) <= maxDx;
    // độ cao nhảy tối đa
    const dy = m.y - e.y;
    if (ok && dy < 0) ok = -dy <= PHYSICS.jumpVelocity * dt + 40;
    if (ok && (m.x < 0 || m.x > grid.w * TILE || m.y > grid.h * TILE + 64)) ok = false;
    if (ok && overlapsSolid(grid, m.x, m.y, PHYSICS.playerW, PHYSICS.playerH)) ok = false;
    // chống bay: ở trên không quá lâu mà không rơi xuống
    if (ok) {
      const grounded = standingOn(grid, m.x, m.y, PHYSICS.playerW);
      if (grounded) { this.airSince = 0; }
      else {
        if (!this.airSince) { this.airSince = now; this.airMinY = m.y; }
        this.airMinY = Math.min(this.airMinY, m.y);
        if (now - this.airSince > MOVE_VALIDATION.maxAirTimeNoFall * 1000 && m.y <= this.airMinY + 2) ok = false;
      }
    }
    if (!ok) {
      this.violations++;
      if (this.violations % 20 === 0) log.warn('movement violations', { char: this.charId, n: this.violations, map: e.inst.def.id });
      this.correct();
      return;
    }
    if (this.violations > 0) this.violations -= 0.05;
    if (this.meditating && Math.abs(dx) > 2) this.stopMeditate();
    if (this.channel && Math.abs(m.x - this.channel.x) > 24) this.interruptChannel('Di chuyển');
    e.x = m.x; e.y = m.y; e.vx = m.vx; e.vy = m.vy; e.facing = m.f >= 0 ? 1 : -1; e.onGround = !!m.g;
    if (now > e.animUntil && !this.meditating && !this.channel) e.anim = ['idle', 'run', 'jump', 'fall'].includes(m.a) ? m.a : 'idle';
    // rơi khỏi bản đồ
    if (e.y > grid.h * TILE + 32) { this.respawnAtSafe(); }
  }
  correct(): void { this.send({ t: 'corr', x: Math.round(this.ent.x), y: Math.round(this.ent.y), seq: this.lastInputSeq }); }
  serverMoved(x: number, y: number): void { this.ent.x = x; this.ent.y = y; this.send({ t: 'corr', x: Math.round(x), y: Math.round(y), seq: this.lastInputSeq, force: 1 }); }
  respawnAtSafe(): void {
    const inst = this.ent.inst;
    const x = inst.def.spawnX;
    const y = inst.grid.groundTop[Math.floor(x / TILE)] * TILE;
    this.serverMoved(x, y);
  }

  // ---------------- chiến đấu ----------------
  private canAct(): boolean {
    const e = this.ent;
    if (!e || e.dead) return false;
    if (isDisabled(e)) return false;
    if (e.inst.def.safe && e.inst.instanceKind !== 'housing') return true;
    return true;
  }
  handleAttack(): void {
    if (!this.canAct()) return;
    const now = Date.now();
    const sk = SKILLS['basic_attack'];
    if (now - this.lastAttackAt < sk.cooldown * 1000 * 0.85) return;
    this.stopMeditate(); this.interruptChannel('');
    this.comboStep = now - this.lastAttackAt < 900 ? (this.comboStep % 3) + 1 : 1;
    this.lastAttackAt = now;
    const mult = this.comboStep === 3 ? 1.6 : 1;
    const s = this.comboStep === 3 ? { ...sk, knockback: 180 } : sk;
    castSkill(this.ent.inst, this.ent, s, 1, mult);
    this.ent.animUntil = now + 300;
  }
  handleSkill(skillId: string, aimX?: number): void {
    if (!this.canAct()) return;
    const level = this.skills.get(skillId);
    if (!level) { this.notify('Chưa học kỹ năng này', 'warn'); return; }
    if (!this.row.hotbar.includes(skillId)) return;
    const sk = getSkill(skillId);
    const now = Date.now();
    const cd = this.cds.get(skillId) ?? 0;
    if (now < cd - 100) return;
    const cost = Math.round(sk.cost * (1 + this.row.realm_idx * 0.35) * (1 + (level - 1) * 0.05));
    if (this.mp < cost) { this.notify('Không đủ chân khí', 'warn'); return; }
    if (this.ent.inst.def.safe && sk.power > 0 && this.ent.inst.instanceKind !== 'arena') { /* vùng an toàn: vẫn cho thi triển (không gây sát thương cho người chơi khác) */ }
    this.stopMeditate(); this.interruptChannel('');
    this.mp -= cost;
    this.cds.set(skillId, now + sk.cooldown * 1000);
    this.castUntil = now + sk.castTime * 1000;
    castSkill(this.ent.inst, this.ent, sk, level, 1, aimX);
    this.ent.animUntil = now + Math.max(300, sk.castTime * 1000 + 200);
  }
  handleDodge(): void {
    if (!this.canAct()) return;
    const now = Date.now();
    if (now < (this.cds.get('__dodge') ?? 0)) return;
    this.cds.set('__dodge', now + PHYSICS.dodgeCooldown * 1000);
    this.dodgeUntil = now + PHYSICS.dodgeTime * 1000;
    this.invulnUntil = Math.max(this.invulnUntil, now + PHYSICS.dodgeTime * 1000);
    this.stopMeditate();
  }
  applyBuff(id: 'atk_up' | 'def_up' | 'speed_up' | 'shield', duration: number, power: number): void {
    applyStatus(this.ent.inst, this.ent, this.ent, { id, duration, power }, 0);
  }

  onDeath(killer: CombatEnt | null, handled: boolean): void {
    this.stopMeditate(); this.interruptChannel('');
    this.ent.anim = 'death';
    const byPlayer = killer && (killer.kind === 'p' || killer.kind === 'pet');
    if (!handled && !byPlayer) {
      // phạt nhẹ: mất 1% tu vi tầng hiện tại, độ bền trang bị -5
      const loss = Math.floor(this.row.tu_vi * 0.01);
      this.row.tu_vi -= loss; this.dirty = true;
      q("UPDATE item_instances SET durability = GREATEST(0, durability - 5) WHERE owner_id = $1 AND container = 'equip' AND durability IS NOT NULL", [this.charId]).then(() => this.reloadEquipment()).catch(() => undefined);
      this.notify(`Bạn đã tử vong. Mất ${loss.toLocaleString('vi-VN')} tu vi, trang bị giảm độ bền.`, 'warn');
    } else if (!handled) {
      this.notify('Bạn đã bị đánh bại.', 'warn');
    }
    this.world.onPlayerDeath(this, killer, handled);
    this.send({ t: 'ev', k: 'dead', by: killer?.name ?? '' });
  }

  revive(hpPct = 0.5): void {
    const e = this.ent;
    e.dead = false; e.hp = Math.max(1, eff(e).maxHp * hpPct); this.mp = Math.max(this.mp, eff(e).maxMp * hpPct); e.anim = 'idle'; e.statuses = []; e.shield = 0;
    this.invulnUntil = Date.now() + 3000;
    e.inst.emitNear(e.x, { t: 'ev', k: 'revive', i: e.id });
  }

  // ---------------- lưu ----------------
  async save(c?: Tx): Promise<void> {
    if (!this.loaded || !this.ent) return;
    const e = this.ent;
    const inInstance = !!e.inst.instanceKind;
    const pos = inInstance && this.returnPoint ? this.returnPoint : { map: e.inst.def.id, x: e.x, y: e.y };
    const playtime = this.row.playtime_sec + Math.floor((Date.now() - this.playStart) / 1000);
    this.playStart = Date.now();
    this.row.playtime_sec = playtime;
    const sql = `UPDATE characters SET realm_idx=$2, layer=$3, tu_vi=$4, exp=$5, hp=$6, mp=$7, map_id=$8, x=$9, y=$10, playtime_sec=$11, combat_power=$12, last_played_at=now(), bt_fail_streak=$13, bt_cooldown_until=$14 WHERE id=$1`;
    const params = [this.charId, this.row.realm_idx, this.row.layer, Math.floor(this.row.tu_vi), Math.floor(this.row.exp), e.dead ? eff(e).maxHp * 0.5 : e.hp, this.mp, pos.map, pos.x, pos.y, playtime, combatPower(this.stats), this.row.bt_fail_streak, this.row.bt_cooldown_until];
    if (c) await c.query(sql, params); else await q(sql, params);
    await this.flushQuests(c);
    if (this.dirtyCounters.size) await (await import('./achievements.js')).flushCounters(this);
    this.dirty = false;
  }
  async flushQuests(c?: Tx): Promise<void> {
    for (const [id, qs] of this.quests) {
      if (!qs.dirty) continue;
      qs.dirty = false;
      const sql = `INSERT INTO quest_progress(character_id, quest_id, state, progress, completed_at, times_done) VALUES ($1,$2,$3,$4,$5,$6)
                   ON CONFLICT (character_id, quest_id) DO UPDATE SET state=$3, progress=$4, completed_at=$5, times_done=$6`;
      const params = [this.charId, id, qs.state, JSON.stringify(qs.progress), qs.completedAt, qs.times];
      if (c) await c.query(sql, params); else await q(sql, params);
    }
  }

  /** Hệ thống phím tắt hợp lệ */
  static validHotbar(list: unknown, skills: Map<string, number>): string[] {
    if (!Array.isArray(list)) throw new GameError('Thanh kỹ năng không hợp lệ');
    const out = list.slice(0, LIMITS.hotbarSize).map((s) => (typeof s === 'string' && (s === '' || skills.has(s)) ? s : ''));
    return out;
  }
  equippedIn(slot: string): ItemRow | undefined { return this.equipment.find((i) => i.slot === EQUIP_SLOTS.indexOf(slot as never)); }
  powerLevel(): number { return powerLevel(this.row.realm_idx, this.row.layer); }
  realm() { return realmDef(this.row.realm_idx); }
  async withTx<T>(fn: (c: Tx) => Promise<T>): Promise<T> { return tx(fn); }
}

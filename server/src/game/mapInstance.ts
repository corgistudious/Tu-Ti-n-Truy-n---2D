import { AOI, MONSTERS, PETS, PHYSICS, TILE, generateGrid, groundYAt, moveBody, petStats, tileAt, type MapDef, type NetEntity, type TileGrid } from '@tt/shared';
import { initMonsterStats, tickEscort, tickMonster, tickPet } from './ai.js';
import { eff, tickSkillObjects, tickStatuses } from './combat.js';
import type { CombatEnt, DropEnt, EscortEnt, MonsterEnt, PendingAoe, PetEnt, PlayerEnt, Projectile, Zone } from './entities.js';
import type { World } from './world.js';

/** Bộ điều khiển instance (phó bản, thử thách đột phá, đấu trường...) */
export interface InstanceController {
  tick?(inst: MapInstance): void;
  onMonsterKilled?(inst: MapInstance, m: MonsterEnt, killer: CombatEnt | null): void;
  onPlayerKilled?(inst: MapInstance, p: PlayerEnt, killer: CombatEnt | null): boolean; // true = đã xử lý (không áp phạt chết thường)
  onPlayerLeave?(inst: MapInstance, p: PlayerEnt): void;
  canLeaveByPortal?: boolean;
}

export class MapInstance {
  readonly grid: TileGrid;
  readonly players = new Map<string, PlayerEnt>();
  readonly monsters = new Map<string, MonsterEnt>();
  readonly pets = new Map<string, PetEnt>();
  readonly escorts = new Map<string, EscortEnt>();
  readonly drops = new Map<string, DropEnt>();
  projectiles: Projectile[] = [];
  aoes: PendingAoe[] = [];
  zones: Zone[] = [];
  readonly nodeReadyAt = new Map<string, number>();
  now = Date.now();
  tickNo = 0;
  emptySince = Date.now();
  controller: InstanceController | null = null;
  private seq = 0;
  dropMult = 1;
  expMult = 1;

  constructor(readonly world: World, readonly def: MapDef, readonly key: string, readonly channel: number, readonly instanceKind: MapDef['instance'] | null, readonly ownerKey?: string) {
    this.grid = generateGrid(def);
  }

  nextId(prefix: string): string { return `${prefix}${this.key.length}_${++this.seq}`; }

  spawnInitial(): void {
    for (const s of this.def.spawns) for (let i = 0; i < s.count; i++) this.spawnMonster(s.monster, s.x1 + Math.random() * (s.x2 - s.x1), { spawnX1: s.x1, spawnX2: s.x2 });
  }

  spawnMonster(id: string, x: number, opts: { spawnX1?: number; spawnX2?: number; noRespawn?: boolean; tag?: string; level?: number; ownerTrial?: number } = {}): MonsterEnt {
    const def = MONSTERS[id];
    if (!def) throw new Error('unknown monster ' + id);
    const cx = Math.max(2 * TILE, Math.min((this.grid.w - 2) * TILE, x));
    const m: MonsterEnt = {
      id: this.nextId('m'), kind: 'm', name: def.name, x: cx, y: groundYAt(this.grid, cx) - (def.flying ? 90 : 0), vx: 0, vy: 0, w: def.w, h: def.h, facing: -1, anim: 'idle', animUntil: 0,
      hp: 1, stats: undefined as never, statuses: [], shield: 0, dead: false, onGround: false, inst: this,
      def, state: 'idle', homeX: cx, spawnX1: opts.spawnX1 ?? cx - 150, spawnX2: opts.spawnX2 ?? cx + 150, cds: {}, phase: 0, threat: new Map(), respawnAt: 0, nextThink: 0, patrolX: cx,
      retreatUntil: 0, retreated: false, enrage: 1, speedMult: 1, noRespawn: opts.noRespawn, tag: opts.tag, ownerTrial: opts.ownerTrial,
    };
    initMonsterStats(m, opts.level);
    this.monsters.set(m.id, m);
    return m;
  }

  respawnMonster(m: MonsterEnt): void {
    const x = m.spawnX1 + Math.random() * (m.spawnX2 - m.spawnX1);
    Object.assign(m, { dead: false, x, homeX: x, patrolX: x, y: groundYAt(this.grid, x) - (m.def.flying ? 90 : 0), vx: 0, vy: 0, state: 'idle', targetId: undefined, phase: 0, enrage: 1, speedMult: 1, statuses: [], shield: 0, retreated: false, cds: {}, windup: undefined });
    m.threat.clear();
    m.hp = m.stats.maxHp;
    this.emitNear(m.x, { t: 'ev', k: 'spawn', i: m.id });
  }

  addPlayer(p: PlayerEnt): void {
    this.players.set(p.id, p);
    p.inst = this;
    this.emptySince = 0;
  }
  removePlayer(p: PlayerEnt): void {
    this.players.delete(p.id);
    for (const pet of [...this.pets.values()]) if (pet.ownerId === p.id) this.removePet(pet);
    for (const e of [...this.escorts.values()]) if (e.ownerChar === p.s.charId) { this.escorts.delete(e.id); }
    this.controller?.onPlayerLeave?.(this, p);
    for (const m of this.monsters.values()) { m.threat.delete(p.id); if (m.targetId === p.id) m.targetId = undefined; }
    if (this.players.size === 0) this.emptySince = Date.now();
  }

  entity(id: string): CombatEnt | undefined {
    return this.players.get(id) ?? this.monsters.get(id) ?? this.pets.get(id) ?? this.escorts.get(id);
  }
  *combatants(): Generator<CombatEnt> {
    for (const p of this.players.values()) yield p;
    for (const m of this.monsters.values()) if (!m.dead) yield m;
    for (const p of this.pets.values()) if (!p.dead) yield p;
    for (const e of this.escorts.values()) yield e;
  }
  playerByChar(charId: number): PlayerEnt | undefined { return this.players.get(`p${charId}`); }

  solidAt(x: number, y: number): boolean { return tileAt(this.grid, Math.floor(x / TILE), Math.floor(y / TILE)) === '#'; }

  /** Lướt theo hướng mặt, dừng khi gặp tường */
  dash(e: CombatEnt, distance: number): void {
    const step = 8 * e.facing;
    let moved = 0;
    while (Math.abs(moved) < distance) {
      const nx = e.x + step;
      const half = e.w / 2;
      const edge = nx + half * e.facing;
      if (this.solidAt(edge, e.y - 4) || this.solidAt(edge, e.y - e.h + 4)) break;
      e.x = nx; moved += step;
    }
    if (e.kind === 'p') (e as PlayerEnt).s.serverMoved(e.x, e.y);
  }

  spawnSummon(caster: CombatEnt, petId: string, duration: number, level: number): void {
    const def = PETS[petId];
    if (!def) return;
    // xóa triệu hồi cũ cùng loại
    for (const p of [...this.pets.values()]) if (p.ownerId === caster.id && p.def.id === petId) this.removePet(p);
    const es = eff(caster);
    const stats = { ...es, maxHp: Math.round(es.maxHp * (def.baseStats.maxHp ?? 0.4) * (1 + level * 0.05)), atk: Math.round(es.matk * (def.baseStats.atk ?? 0.5) * (1 + level * 0.05)), matk: Math.round(es.matk * (def.baseStats.atk ?? 0.5)), moveSpeed: 1 };
    const pet: PetEnt = { id: this.nextId('s'), kind: 'pet', name: def.name, x: caster.x - caster.facing * 30, y: caster.y, vx: 0, vy: 0, w: 36, h: 36, facing: caster.facing, anim: 'idle', animUntil: 0, hp: stats.maxHp, stats, statuses: [], shield: 0, dead: false, onGround: false, inst: this, ownerId: caster.id, def, expiresAt: this.now + duration * 1000, cds: {}, level: level * 5 };
    this.pets.set(pet.id, pet);
  }
  addRealPet(owner: PlayerEnt, petId: number, templateId: string, name: string, level: number, quality: number, gearStats: Record<string, number>): PetEnt | undefined {
    const def = PETS[templateId];
    if (!def) return undefined;
    const s = petStats(def.baseStats, def.growth, level, quality);
    for (const [k, v] of Object.entries(gearStats)) (s as unknown as Record<string, number>)[k] += v;
    const pet: PetEnt = { id: `pet${petId}`, kind: 'pet', name, x: owner.x - 30, y: owner.y, vx: 0, vy: 0, w: 36, h: 36, facing: owner.facing, anim: 'idle', animUntil: 0, hp: s.maxHp, stats: s, statuses: [], shield: 0, dead: false, onGround: false, inst: this, ownerId: owner.id, def, petId, cds: {}, level };
    this.pets.set(pet.id, pet);
    return pet;
  }
  removePet(p: PetEnt): void { this.pets.delete(p.id); }

  addEscort(e: EscortEnt): void { this.escorts.set(e.id, e); }
  escortArrived(e: EscortEnt): void {
    this.escorts.delete(e.id);
    this.world.questEvent(e.ownerChar, 'escort', e.npcId, 1);
  }

  addDrop(item: string, qty: number, x: number, owners: number[] | null): DropEnt {
    const d: DropEnt = { id: this.nextId('d'), item, qty, x: x + (Math.random() - 0.5) * 40, y: groundYAt(this.grid, x), owners, freeAt: this.now + 30000, expiresAt: this.now + 120000 };
    this.drops.set(d.id, d);
    return d;
  }

  kill(target: CombatEnt, src: CombatEnt | null): void {
    if (target.dead) return;
    target.dead = true; target.hp = 0; target.anim = 'death'; target.statuses = []; target.shield = 0;
    this.emitNear(target.x, { t: 'ev', k: 'die', i: target.id });
    if (target.kind === 'm') {
      const m = target as MonsterEnt;
      m.state = 'dead'; m.windup = undefined; m.diedAt = this.now;
      m.respawnAt = m.noRespawn ? 0 : this.now + m.def.respawn * 1000;
      this.world.rewardKill(this, m, src);
      this.controller?.onMonsterKilled?.(this, m, src);
      if (m.noRespawn) setTimeout(() => this.monsters.delete(m.id), 1500);
    } else if (target.kind === 'p') {
      const p = target as PlayerEnt;
      const handled = this.controller?.onPlayerKilled?.(this, p, src) ?? false;
      p.s.onDeath(src, handled);
    } else if (target.kind === 'pet') {
      const pet = target as PetEnt;
      if (!pet.petId) this.removePet(pet);
      else { setTimeout(() => { if (this.pets.get(pet.id) === pet) { pet.dead = false; pet.hp = pet.stats.maxHp * 0.5; } }, 15000); }
    } else if (target.kind === 'e') {
      const e = target as EscortEnt;
      this.escorts.delete(e.id);
      this.world.escortFailed(e.ownerChar, e.questId, e.objectiveId);
    }
  }

  tick(dt: number): void {
    this.now = Date.now();
    this.tickNo++;
    for (const p of this.players.values()) { if (!p.dead) tickStatuses(this, p); p.s.tick(dt); }
    for (const m of this.monsters.values()) { if (!m.dead) tickStatuses(this, m); tickMonster(this, m, dt); }
    for (const p of [...this.pets.values()]) { if (!p.dead) tickStatuses(this, p); tickPet(this, p, dt); }
    for (const e of [...this.escorts.values()]) { tickStatuses(this, e); tickEscort(this, e, dt); }
    tickSkillObjects(this, dt);
    if (this.tickNo % 20 === 0) for (const [id, d] of this.drops) if (this.now >= d.expiresAt) { this.drops.delete(id); }
    this.controller?.tick?.(this);
  }

  /** Mạng theo vùng quan tâm (AOI): chỉ gửi thực thể trong ±viewRadiusCells ô quanh người chơi */
  inView(px: number, x: number, cells: number = AOI.viewRadiusCells): boolean {
    return Math.abs(Math.floor(px / AOI.cellWidth) - Math.floor(x / AOI.cellWidth)) <= cells;
  }
  emitNear(x: number, msg: object, cells: number = AOI.viewRadiusCells): void {
    const s = JSON.stringify(msg);
    for (const p of this.players.values()) if (this.inView(p.x, x, cells)) p.s.sendRaw(s);
  }
  broadcast(msg: object): void { const s = JSON.stringify(msg); for (const p of this.players.values()) p.s.sendRaw(s); }

  netEntity(e: CombatEnt, full: boolean): NetEntity {
    const base: NetEntity = { i: e.id, k: e.kind === 'p' ? 'p' : e.kind === 'm' ? 'm' : e.kind === 'pet' ? 'pet' : 'e', x: Math.round(e.x), y: Math.round(e.y), f: e.facing, a: e.anim, hp: Math.round(e.hp), mhp: Math.round(eff(e).maxHp) };
    if (e.statuses.length) base.st = e.statuses.map((s) => s.id);
    if (full) {
      base.n = e.name;
      if (e.kind === 'p') { const p = e as PlayerEnt; base.ap = p.s.visual(); base.lv = p.s.realmLabel(); base.g = p.s.guildName ?? undefined; }
      if (e.kind === 'm') { const m = e as MonsterEnt; base.s = m.def.sprite; base.r = ['normal', 'elite', 'rare', 'boss', 'world_boss', 'dungeon_boss', 'guild_boss', 'event_boss'].indexOf(m.def.rank); base.lv = String(m.def.id); }
      if (e.kind === 'pet') base.s = (e as PetEnt).def.sprite;
      if (e.kind === 'e') base.s = (e as EscortEnt).npcId;
    }
    return base;
  }

  sendSnapshots(): void {
    for (const p of this.players.values()) {
      const s = p.s;
      const visible = new Set<string>();
      const out: NetEntity[] = [];
      const consider = (e: CombatEnt) => {
        if (!this.inView(p.x, e.x)) return;
        if (e.kind === 'm' && (e as MonsterEnt).dead && this.now - ((e as MonsterEnt).diedAt ?? 0) > 2000) return;
        visible.add(e.id);
        const known = s.known.get(e.id);
        const ne = this.netEntity(e, !known);
        const sig = `${ne.x},${ne.y},${ne.f},${ne.a},${ne.hp},${ne.mhp},${ne.st?.join('')}`;
        if (known !== sig) { out.push(ne); s.known.set(e.id, sig); }
      };
      for (const e of this.players.values()) if (e !== p) consider(e);
      for (const e of this.monsters.values()) consider(e);
      for (const e of this.pets.values()) consider(e);
      for (const e of this.escorts.values()) consider(e);
      for (const d of this.drops.values()) {
        if (!this.inView(p.x, d.x)) continue;
        visible.add(d.id);
        if (!s.known.has(d.id)) { out.push({ i: d.id, k: 'd', x: Math.round(d.x), y: Math.round(d.y), s: d.item, n: String(d.qty) }); s.known.set(d.id, '1'); }
      }
      const gone: string[] = [];
      for (const id of s.known.keys()) if (!visible.has(id)) { gone.push(id); s.known.delete(id); }
      // bản thân: luôn gửi HP/MP/trạng thái (vị trí do client dự đoán, server gửi khi sửa)
      const self = { hp: Math.round(p.hp), mhp: Math.round(eff(p).maxHp), mp: Math.round(s.mp), mmp: Math.round(eff(p).maxMp), st: p.statuses.map((x) => x.id), sh: Math.round(p.shield) };
      const selfSig = JSON.stringify(self);
      const selfChanged = selfSig !== s.lastSelfSig;
      if (out.length || gone.length || selfChanged) {
        s.lastSelfSig = selfSig;
        s.send({ t: 'snap', tick: this.tickNo, e: out, gone, me: selfChanged ? self : undefined });
      }
    }
  }

  /** Di chuyển người chơi theo vật lý server (khi server cần tự mô phỏng — vd đẩy lùi do bẫy) */
  simulatePlayer(p: PlayerEnt, dt: number): void { moveBody(this.grid, p, dt, PHYSICS.gravity, PHYSICS.maxFall); }
}

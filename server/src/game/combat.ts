import { SKILLS, computeDamage, statusChance, type SkillDef, type StatusApply, type Stats, type StatusId } from '@tt/shared';
import { elementBonus } from './power.js';
import type { BaseEnt, CombatEnt, MonsterEnt, PetEnt, PlayerEnt, StatusInst } from './entities.js';
import type { MapInstance } from './mapInstance.js';

const NEGATIVE: StatusId[] = ['burn', 'freeze', 'poison', 'stun', 'slow', 'mark_thunder', 'armor_break', 'tam_ma'];
const rng = Math.random;

export function hasStatus(e: BaseEnt, id: StatusId): StatusInst | undefined { return e.statuses.find((s) => s.id === id); }
export function isDisabled(e: BaseEnt): boolean { return !!(hasStatus(e, 'stun') || hasStatus(e, 'freeze')); }

/** Chỉ số hiệu lực sau trạng thái tạm thời */
export function eff(e: BaseEnt): Stats {
  const s = { ...e.stats };
  for (const st of e.statuses) {
    switch (st.id) {
      case 'atk_up': s.atk *= 1 + st.power; s.matk *= 1 + st.power; break;
      case 'def_up': s.def *= 1 + st.power; s.mdef *= 1 + st.power; break;
      case 'armor_break': s.def *= 1 - st.power; s.mdef *= 1 - st.power; break;
      case 'speed_up': s.moveSpeed += st.power; break;
      case 'slow': s.moveSpeed *= 1 - st.power; break;
      case 'tam_ma': s.atk *= 0.9; s.matk *= 0.9; break;
    }
  }
  if (e.kind === 'm') { const m = e as MonsterEnt; s.atk *= m.enrage; s.matk *= m.enrage; s.moveSpeed *= m.speedMult; }
  return s;
}

/** Chủ sở hữu "người chơi" của một thực thể (chính nó, hoặc chủ linh thú) */
export function ownerPlayer(inst: MapInstance, e: CombatEnt): PlayerEnt | undefined {
  if (e.kind === 'p') return e;
  if (e.kind === 'pet') { const o = inst.entity((e as PetEnt).ownerId); return o?.kind === 'p' ? (o as PlayerEnt) : undefined; }
  return undefined;
}

export function canHit(inst: MapInstance, a: CombatEnt, b: CombatEnt): boolean {
  if (a === b || b.dead || a.dead) return false;
  if (a.kind === 'm') return b.kind === 'p' || b.kind === 'pet' || b.kind === 'e';
  if (b.kind === 'e') return false;
  const pa = ownerPlayer(inst, a);
  if (!pa) return false;
  if (b.kind === 'm') {
    const m = b as MonsterEnt;
    if (m.ownerTrial !== undefined && m.ownerTrial !== pa.s.charId) return false;
    return true;
  }
  const pb = ownerPlayer(inst, b);
  if (!pb || pb === pa) return false;
  if (b.kind === 'pet') return inst.world.pvpAllowed(pa, pb);
  return inst.world.pvpAllowed(pa, pb);
}

export function skillPower(skill: SkillDef, level: number): number { return skill.power + skill.powerPerLevel * (level - 1); }

export function applyStatus(inst: MapInstance, src: CombatEnt, tgt: CombatEnt, a: StatusApply, srcAtk: number): void {
  if (tgt.dead) return;
  const negative = NEGATIVE.includes(a.id);
  if (negative) {
    const chance = statusChance(a.chance ?? 1, eff(tgt).res);
    if (rng() > chance) return;
    // boss kháng khống chế mạnh: thời gian khống chế giảm 70%
    if ((a.id === 'stun' || a.id === 'freeze') && tgt.kind === 'm' && (tgt as MonsterEnt).def.rank.includes('boss')) a = { ...a, duration: a.duration * 0.3 };
  }
  const now = inst.now;
  const existing = tgt.statuses.find((s) => s.id === a.id);
  if (a.id === 'shield') {
    tgt.shield = Math.max(tgt.shield, eff(tgt).maxHp * (a.power ?? 0.1));
  }
  if (existing) {
    existing.until = Math.max(existing.until, now + a.duration * 1000);
    existing.stacks = Math.min(a.stacks ?? 1, existing.stacks + 1);
    existing.power = Math.max(existing.power, a.power ?? 0);
    existing.srcAtk = Math.max(existing.srcAtk ?? 0, srcAtk);
  } else {
    tgt.statuses.push({ id: a.id, until: now + a.duration * 1000, power: a.power ?? 0, stacks: 1, srcId: src.id, srcAtk, nextTick: now + 1000 });
  }
  inst.emitNear(tgt.x, { t: 'ev', k: 'st', i: tgt.id, st: tgt.statuses.map((s) => s.id) });
}

export interface HitOpts { mult?: number; fixedDamage?: number; noEffects?: boolean; hitIndex?: number }

/** Một đòn đánh của kỹ năng vào mục tiêu — server tính toàn bộ */
export function hit(inst: MapInstance, src: CombatEnt, tgt: CombatEnt, skill: SkillDef, level: number, opts: HitOpts = {}): number {
  if (!canHit(inst, src, tgt)) return 0;
  const es = eff(src), et = eff(tgt);
  let bonus = 0;
  if (skill.combo) {
    const st = hasStatus(tgt, skill.combo.requires);
    if (st) {
      const stacks = skill.combo.requires === 'mark_thunder' || skill.combo.requires === 'poison' ? st.stacks : 1;
      bonus += skill.combo.bonus * stacks;
      if (skill.combo.consume) { tgt.statuses = tgt.statuses.filter((s) => s !== st); inst.emitNear(tgt.x, { t: 'ev', k: 'st', i: tgt.id, st: tgt.statuses.map((s) => s.id) }); }
      if (skill.combo.extra) applyStatus(inst, src, tgt, skill.combo.extra, es.matk);
      inst.emitNear(tgt.x, { t: 'ev', k: 'combo', i: tgt.id, s: skill.id });
    }
  }
  const srcP = src.kind === 'p' ? (src as PlayerEnt) : undefined;
  if (srcP) bonus += elementBonus(srcP.s, skill.path);
  const attack = skill.scaling === 'atk' ? es.atk : es.matk;
  const defense = skill.scaling === 'atk' ? et.def : et.mdef;
  let amount: number; let crit = false;
  if (opts.fixedDamage !== undefined) {
    amount = Math.round(opts.fixedDamage);
  } else {
    const r = computeDamage({ attack, defense, pen: es.pen, power: skillPower(skill, level) * (opts.mult ?? 1), crit: es.crit, critDmg: es.critDmg, targetRes: et.res, bonus, rng });
    amount = r.amount; crit = r.crit;
  }
  const pa = ownerPlayer(inst, src), pb = ownerPlayer(inst, tgt);
  if (pa && pb) amount = Math.max(1, Math.round(amount * 0.5)); // PvP giảm sát thương để giao tranh kéo dài
  const dealt = damage(inst, src, tgt, amount, crit);
  if (!opts.noEffects && !tgt.dead) {
    for (const e of skill.effects) {
      if (['shield', 'regen', 'atk_up', 'def_up', 'speed_up'].includes(e.id)) continue; // hiệu ứng có lợi áp cho bản thân/đồng đội ở useSkill
      applyStatus(inst, src, tgt, e, attack);
    }
    if (skill.knockback && tgt.kind !== 'p') {
      const kb = skill.knockback * (tgt.kind === 'm' && (tgt as MonsterEnt).def.rank.includes('boss') ? 0.15 : 1);
      tgt.vx = (tgt.x >= src.x ? 1 : -1) * kb; tgt.vy = -180;
    } else if (skill.knockback && tgt.kind === 'p') {
      (tgt as PlayerEnt).s.send({ t: 'ev', k: 'kb', vx: (tgt.x >= src.x ? 1 : -1) * skill.knockback * 0.6, vy: -160 });
    }
  }
  return dealt;
}

/** Áp sát thương thô (sau công thức), xử lý khiên và tử vong */
export function damage(inst: MapInstance, src: CombatEnt | null, tgt: CombatEnt, amount: number, crit: boolean, kind: 'hit' | 'dot' | 'true' = 'hit'): number {
  if (tgt.dead) return 0;
  if (tgt.kind === 'p' && (tgt as PlayerEnt).s.invulnUntil > inst.now) return 0;
  let a = amount;
  if (tgt.shield > 0) { const absorbed = Math.min(tgt.shield, a); tgt.shield -= absorbed; a -= absorbed; if (tgt.shield <= 0) tgt.statuses = tgt.statuses.filter((s) => s.id !== 'shield'); }
  tgt.hp = Math.max(0, tgt.hp - a);
  if (src) tgt.lastHitBy = src.id;
  if (tgt.kind === 'm' && src) {
    const p = ownerPlayer(inst, src);
    if (p) { const m = tgt as MonsterEnt; m.threat.set(p.id, (m.threat.get(p.id) ?? 0) + amount); if (m.state === 'idle' || m.state === 'patrol') { m.state = 'chase'; m.targetId = src.id; } }
  }
  if (tgt.kind === 'p') {
    const p = tgt as PlayerEnt; p.s.lastCombatAt = inst.now; p.s.interruptChannel('Bị tấn công');
    const ap = src ? ownerPlayer(inst, src) : undefined;
    if (ap && ap !== p) { p.s.lastAggressor = ap.s.charId; p.s.lastAggressorAt = inst.now; }
  }
  if (src && src.kind === 'p') (src as PlayerEnt).s.lastCombatAt = inst.now;
  inst.emitNear(tgt.x, { t: 'ev', k: 'dmg', i: tgt.id, v: amount, c: crit ? 1 : 0, d: kind === 'dot' ? 1 : 0, hp: Math.round(tgt.hp) });
  if (tgt.hp <= 0) inst.kill(tgt, src);
  return amount;
}

export function heal(inst: MapInstance, tgt: CombatEnt, amount: number): void {
  if (tgt.dead) return;
  const max = eff(tgt).maxHp;
  const before = tgt.hp;
  tgt.hp = Math.min(max, tgt.hp + amount);
  const v = Math.round(tgt.hp - before);
  if (v > 0) inst.emitNear(tgt.x, { t: 'ev', k: 'heal', i: tgt.id, v, hp: Math.round(tgt.hp) });
}

/** Cập nhật trạng thái (DoT, hồi phục, hết hạn) mỗi tick */
export function tickStatuses(inst: MapInstance, e: CombatEnt): void {
  if (!e.statuses.length) return;
  const now = inst.now;
  let changed = false;
  for (const s of e.statuses) {
    if (now >= s.nextTick && now < s.until) {
      s.nextTick += 1000;
      if (s.id === 'burn' || s.id === 'poison') {
        const src = s.srcId ? inst.entity(s.srcId) ?? null : null;
        const dmg = Math.max(1, Math.round((s.srcAtk ?? 1) * s.power * s.stacks * (1 - Math.min(0.5, eff(e).res * 0.5))));
        damage(inst, src as CombatEnt | null, e, dmg, false, 'dot');
        if (e.dead) return;
      } else if (s.id === 'regen') {
        heal(inst, e, eff(e).maxHp * s.power);
      }
    }
  }
  const before = e.statuses.length;
  e.statuses = e.statuses.filter((s) => s.until > now);
  if (e.statuses.length !== before) changed = true;
  if (!e.statuses.some((s) => s.id === 'shield') && e.shield > 0 && changed) e.shield = 0;
  if (changed) inst.emitNear(e.x, { t: 'ev', k: 'st', i: e.id, st: e.statuses.map((s) => s.id) });
}

function inRect(t: BaseEnt, x1: number, x2: number, yTop: number, yBot: number): boolean {
  const l = t.x - t.w / 2, r = t.x + t.w / 2, top = t.y - t.h, bot = t.y;
  return r >= Math.min(x1, x2) && l <= Math.max(x1, x2) && bot >= yTop && top <= yBot;
}
function inCircle(t: BaseEnt, cx: number, cy: number, r: number): boolean {
  const nx = Math.max(t.x - t.w / 2, Math.min(cx, t.x + t.w / 2));
  const ny = Math.max(t.y - t.h, Math.min(cy, t.y));
  return (nx - cx) ** 2 + (ny - cy) ** 2 <= r * r;
}

/** Đồng minh để hồi máu/buff (bản thân + tổ đội trong bán kính) */
function allies(inst: MapInstance, caster: CombatEnt, cx: number, cy: number, r: number): CombatEnt[] {
  const p = ownerPlayer(inst, caster);
  const out: CombatEnt[] = [caster];
  if (!p) return out;
  for (const e of inst.combatants()) {
    if (e === caster || e.dead) continue;
    const pe = ownerPlayer(inst, e);
    if (!pe) continue;
    if ((pe === p || (p.s.partyId && pe.s.partyId === p.s.partyId)) && inCircle(e, cx, cy, r)) out.push(e);
  }
  return out;
}

const BENEFICIAL: StatusId[] = ['shield', 'regen', 'atk_up', 'def_up', 'speed_up'];

/**
 * Thi triển kỹ năng (đã qua kiểm tra hồi chiêu/chi phí ở tầng gọi).
 * mult: hệ số (vd combo đánh thường 1.6 ở đòn 3).
 */
export function castSkill(inst: MapInstance, caster: CombatEnt, skill: SkillDef, level: number, mult = 1, aimX?: number): void {
  const f = caster.facing;
  const cy = caster.y - caster.h / 2;
  caster.anim = skill.anim; caster.animUntil = inst.now + 350;
  inst.emitNear(caster.x, { t: 'ev', k: 'fx', i: caster.id, s: skill.id, x: Math.round(caster.x), y: Math.round(caster.y), f });
  // hiệu ứng có lợi cho bản thân / đồng đội
  const buffs = skill.effects.filter((e) => BENEFICIAL.includes(e.id));
  const sh = skill.shape;
  if (buffs.length || skill.heal) {
    const targets = sh.type === 'aoe' || sh.type === 'zone' ? allies(inst, caster, caster.x, cy, sh.type === 'aoe' && sh.offset === 0 ? sh.radius : 220) : [caster];
    for (const t of targets) {
      for (const b of buffs) applyStatus(inst, caster, t, b, eff(caster).matk);
      if (skill.heal && sh.type !== 'zone') heal(inst, t, eff(caster).matk * skill.heal * (1 + (level - 1) * 0.1));
    }
  }
  switch (sh.type) {
    case 'self': return;
    case 'melee': {
      const x2 = caster.x + f * sh.range;
      const top = cy - sh.height / 2, bot = cy + sh.height / 2;
      for (let h = 0; h < skill.hits; h++) {
        for (const t of inst.combatants()) if (t !== caster && inRect(t, caster.x - f * 10, x2, top, bot)) hit(inst, caster, t, skill, level, { mult, hitIndex: h });
      }
      return;
    }
    case 'projectile': {
      const count = sh.count ?? 1;
      for (let i = 0; i < count; i++) {
        const ang = count > 1 ? (-(sh.spread ?? 0.5) / 2 + (sh.spread ?? 0.5) * (i / (count - 1))) : 0;
        inst.projectiles.push({
          id: inst.nextId('j'), ownerId: caster.id, skill, level, x: caster.x + f * 20, y: cy,
          vx: Math.cos(ang) * sh.speed * f, vy: Math.sin(ang) * sh.speed, traveled: 0, range: sh.range, radius: sh.radius,
          pierce: sh.pierce ?? 1, hit: new Set(), mult,
        });
      }
      return;
    }
    case 'aoe': {
      const tx = aimX !== undefined && Math.abs(aimX - caster.x) <= sh.offset + 40 ? aimX : caster.x + f * sh.offset;
      const delay = (sh.delay ?? 0) * 1000;
      if (skill.heal && !skill.power) return;
      if (delay > 0) {
        inst.aoes.push({ id: inst.nextId('a'), ownerId: caster.id, skill, level, x: tx, y: cy, radius: sh.radius, at: inst.now + delay, hitsLeft: skill.hits, mult });
        inst.emitNear(tx, { t: 'ev', k: 'tele', x: Math.round(tx), y: Math.round(cy), r: sh.radius, d: delay, s: skill.id });
      } else {
        for (let h = 0; h < skill.hits; h++) for (const t of inst.combatants()) if (t !== caster && inCircle(t, tx, cy, sh.radius)) hit(inst, caster, t, skill, level, { mult, hitIndex: h });
      }
      return;
    }
    case 'dash': {
      const startX = caster.x;
      inst.dash(caster, sh.distance);
      const top = cy - sh.height / 2, bot = cy + sh.height / 2;
      for (let h = 0; h < skill.hits; h++) for (const t of inst.combatants()) if (t !== caster && inRect(t, startX, caster.x + f * 30, top, bot)) hit(inst, caster, t, skill, level, { mult, hitIndex: h });
      return;
    }
    case 'zone': {
      const tx = caster.x + f * sh.offset;
      inst.zones.push({ id: inst.nextId('z'), ownerId: caster.id, skill, level, x: tx, y: cy, radius: sh.radius, until: inst.now + sh.duration * 1000, nextTick: inst.now + 200, interval: sh.interval * 1000, mult });
      inst.emitNear(tx, { t: 'ev', k: 'zone', x: Math.round(tx), y: Math.round(cy), r: sh.radius, d: sh.duration * 1000, s: skill.id });
      return;
    }
    case 'summon': {
      inst.spawnSummon(caster, sh.pet, sh.duration, level);
      return;
    }
  }
}

/** Mô phỏng đạn, vùng trì hoãn và trận pháp mỗi tick */
export function tickSkillObjects(inst: MapInstance, dt: number): void {
  const now = inst.now;
  // đạn
  for (let i = inst.projectiles.length - 1; i >= 0; i--) {
    const p = inst.projectiles[i];
    const src = inst.entity(p.ownerId);
    p.x += p.vx * dt; p.y += p.vy * dt; p.traveled += Math.hypot(p.vx, p.vy) * dt;
    let remove = p.traveled >= p.range || !src || p.x < 0 || p.x > inst.grid.w * 32;
    if (!remove && inst.solidAt(p.x, p.y)) remove = true;
    if (!remove && src) {
      for (const t of inst.combatants()) {
        if (p.hit.has(t.id) || t === src || !canHit(inst, src, t)) continue;
        if (inCircle(t, p.x, p.y, p.radius)) {
          p.hit.add(t.id);
          for (let h = 0; h < p.skill.hits; h++) hit(inst, src, t, p.skill, p.level, { mult: p.mult, hitIndex: h });
          if (p.hit.size >= p.pierce) { remove = true; break; }
        }
      }
    }
    if (remove) inst.projectiles.splice(i, 1);
  }
  // vùng có báo hiệu
  for (let i = inst.aoes.length - 1; i >= 0; i--) {
    const a = inst.aoes[i];
    if (now < a.at) continue;
    const src = inst.entity(a.ownerId);
    if (src) {
      for (const t of inst.combatants()) {
        if (t === src || !inCircle(t, a.x, a.y, a.radius)) continue;
        if (a.fixedDamage !== undefined) { if (canHit(inst, src, t)) hit(inst, src, t, a.skill, a.level, { fixedDamage: a.fixedDamage }); }
        else for (let h = 0; h < a.hitsLeft; h++) hit(inst, src, t, a.skill, a.level, { mult: a.mult, hitIndex: h });
      }
    }
    inst.emitNear(a.x, { t: 'ev', k: 'boom', x: Math.round(a.x), y: Math.round(a.y), r: a.radius, s: a.skill.id });
    inst.aoes.splice(i, 1);
  }
  // trận pháp / vùng kéo dài
  for (let i = inst.zones.length - 1; i >= 0; i--) {
    const z = inst.zones[i];
    if (now >= z.until) { inst.zones.splice(i, 1); continue; }
    if (now < z.nextTick) continue;
    z.nextTick += z.interval;
    const src = inst.entity(z.ownerId);
    if (!src) { inst.zones.splice(i, 1); continue; }
    if (z.skill.heal) for (const t of allies(inst, src, z.x, z.y, z.radius)) heal(inst, t, eff(src).matk * z.skill.heal);
    if (z.skill.power > 0) for (const t of inst.combatants()) if (t !== src && inCircle(t, z.x, z.y, z.radius)) hit(inst, src, t, z.skill, z.level, { mult: z.mult });
  }
}

export function skill(id: string): SkillDef { const s = SKILLS[id]; if (!s) throw new Error('unknown skill ' + id); return s; }

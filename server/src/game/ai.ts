import { PHYSICS, SKILLS, monsterStats, moveBody, groundYAt, type SkillDef } from '@tt/shared';
import { castSkill, eff, isDisabled, canHit } from './combat.js';
import type { CombatEnt, EscortEnt, MonsterEnt, PetEnt, PlayerEnt } from './entities.js';
import type { MapInstance } from './mapInstance.js';

const THINK_MS = 200;

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number { return Math.hypot(a.x - b.x, (a.y - b.y) * 0.8); }

function nearestTarget(inst: MapInstance, m: MonsterEnt, range: number): CombatEnt | undefined {
  let best: CombatEnt | undefined; let bd = range;
  for (const e of inst.combatants()) {
    if (e.kind === 'm' || e.dead) continue;
    if (!canHit(inst, m, e)) continue;
    if (e.kind === 'p' && (e as PlayerEnt).s.invulnUntil > inst.now) continue;
    const d = dist(m, e);
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}

function pickSkill(inst: MapInstance, m: MonsterEnt): SkillDef {
  const list = m.def.phases && m.phase > 0 ? m.def.phases[m.phase - 1].skills : m.def.skills;
  const ready = list.filter((s) => (m.cds[s] ?? 0) <= inst.now).map((s) => SKILLS[s]).filter(Boolean);
  // ưu tiên kỹ năng mạnh (hồi chiêu dài) khi sẵn sàng
  ready.sort((a, b) => b.cooldown - a.cooldown);
  return ready[0] ?? SKILLS[m.def.skills[0]] ?? SKILLS['m_bite'];
}

function checkPhase(inst: MapInstance, m: MonsterEnt): void {
  const phases = m.def.phases;
  if (!phases || m.phase >= phases.length) return;
  const next = phases[m.phase];
  if (m.hp / m.stats.maxHp <= next.hpBelow) {
    m.phase++;
    if (next.enrage) m.enrage = next.enrage;
    if (next.speedMult) m.speedMult = next.speedMult;
    if (next.shieldPct) { m.shield = m.stats.maxHp * next.shieldPct; m.statuses.push({ id: 'shield', until: inst.now + 20000, power: next.shieldPct, stacks: 1, nextTick: inst.now + 1000 }); }
    if (next.summon) for (let i = 0; i < next.summon.count; i++) inst.spawnMonster(next.summon.monster, m.x + (i - next.summon.count / 2) * 50, { noRespawn: true, tag: 'summon', level: m.def.level });
    for (const s of next.skills) m.cds[s] = Math.min(m.cds[s] ?? 0, inst.now + 800);
    inst.emitNear(m.x, { t: 'ev', k: 'say', i: m.id, text: next.announce, phase: m.phase }, 2);
  }
}

/** AI quái vật: phát hiện → truy đuổi → tấn công (có thời gian vận chiêu để né) → rút lui/trở về → hồi sinh */
export function tickMonster(inst: MapInstance, m: MonsterEnt, dt: number): void {
  const now = inst.now;
  if (m.dead) {
    if (!m.noRespawn && m.respawnAt && now >= m.respawnAt) inst.respawnMonster(m);
    return;
  }
  checkPhase(inst, m);
  const es = eff(m);
  const disabled = isDisabled(m);
  if (!disabled && m.windup && now >= m.windup.until) {
    const sk = m.windup.skill; m.windup = undefined;
    castSkill(inst, m, sk, 1 + Math.floor(m.def.level / 20));
    m.state = 'chase';
  }
  if (!disabled && !m.windup && now >= m.nextThink) {
    m.nextThink = now + THINK_MS;
    const target = m.targetId ? inst.entity(m.targetId) : undefined;
    const fromHome = Math.abs(m.x - m.homeX);
    switch (m.state) {
      case 'idle': case 'patrol': {
        if (!m.def.passive && m.def.aggroRange > 0) {
          const t = nearestTarget(inst, m, m.def.aggroRange);
          if (t) { m.state = 'chase'; m.targetId = t.id; break; }
        }
        if (m.state === 'idle' && Math.random() < 0.08 && m.def.speed > 0) { m.state = 'patrol'; m.patrolX = Math.max(m.spawnX1, Math.min(m.spawnX2, m.homeX + (Math.random() - 0.5) * 300)); }
        if (m.state === 'patrol' && Math.abs(m.x - m.patrolX) < 8) m.state = 'idle';
        break;
      }
      case 'chase': {
        if (!target || target.dead || !canHit(inst, m, target) || fromHome > m.def.leashRange) {
          // chuyển mục tiêu theo threat nếu có
          let next: string | undefined; let best = 0;
          for (const [id, v] of m.threat) { const e = inst.entity(id); if (e && !e.dead && v > best && Math.abs(e.x - m.homeX) < m.def.leashRange) { best = v; next = id; } }
          if (next && fromHome <= m.def.leashRange) { m.targetId = next; break; }
          m.state = 'return'; m.targetId = undefined; break;
        }
        if (m.def.retreatAtHp && !m.retreated && m.hp / m.stats.maxHp < m.def.retreatAtHp) { m.retreated = true; m.state = 'retreat'; m.retreatUntil = now + 2000; break; }
        const d = Math.abs(target.x - m.x);
        if (d <= m.def.attackRange + target.w / 2 && Math.abs(target.y - m.y) < 120 + (m.def.flying ? 80 : 0)) {
          if ((m.cds['__atk'] ?? 0) <= now) {
            const sk = pickSkill(inst, m);
            m.cds[sk.id] = now + sk.cooldown * 1000;
            m.cds['__atk'] = now + m.def.attackCooldown * 1000;
            m.facing = target.x >= m.x ? 1 : -1;
            const windupMs = Math.max(350, sk.castTime * 1000);
            m.windup = { skill: sk, until: now + windupMs };
            m.state = 'windup';
            m.anim = sk.anim; m.animUntil = now + windupMs + 200;
            inst.emitNear(m.x, { t: 'ev', k: 'wind', i: m.id, s: sk.id, d: windupMs });
          }
        }
        break;
      }
      case 'retreat': if (now >= m.retreatUntil) m.state = 'chase'; break;
      case 'return': {
        if (fromHome < 10) { m.state = 'idle'; m.hp = m.stats.maxHp; m.threat.clear(); m.phase = 0; m.enrage = 1; m.speedMult = 1; m.statuses = []; m.shield = 0; }
        break;
      }
      default: break;
    }
  }
  // di chuyển
  let desiredVx = 0;
  const speed = m.def.speed * es.moveSpeed * (m.state === 'return' ? 1.6 : 1);
  if (!disabled && !m.windup) {
    const target = m.targetId ? inst.entity(m.targetId) : undefined;
    if (m.state === 'chase' && target) {
      const dx = target.x - m.x;
      const keep = m.def.attackRange > 200 ? m.def.attackRange * 0.7 : m.def.attackRange * 0.6;
      if (Math.abs(dx) > keep) desiredVx = Math.sign(dx) * speed;
      else if (m.def.attackRange > 200 && Math.abs(dx) < 120) desiredVx = -Math.sign(dx) * speed * 0.7;
      m.facing = dx >= 0 ? 1 : -1;
    } else if (m.state === 'retreat' && target) {
      desiredVx = -Math.sign(target.x - m.x) * speed * 1.2; m.facing = desiredVx >= 0 ? 1 : -1;
    } else if (m.state === 'patrol') {
      desiredVx = Math.sign(m.patrolX - m.x) * speed * 0.5; if (desiredVx) m.facing = desiredVx > 0 ? 1 : -1;
    } else if (m.state === 'return') {
      desiredVx = Math.sign(m.homeX - m.x) * speed; if (desiredVx) m.facing = desiredVx > 0 ? 1 : -1;
    }
  }
  // giảm dần lực đẩy lùi
  if (Math.abs(m.vx) > Math.abs(desiredVx) + 5 && m.onGround) m.vx *= 0.85; else m.vx = desiredVx;
  if (m.def.flying) {
    const target = m.targetId ? inst.entity(m.targetId) : undefined;
    const groundY = groundYAt(inst.grid, m.x);
    const wantY = target && m.state === 'chase' ? Math.min(groundY - 10, target.y - 40) : groundY - 90;
    m.vy = Math.sign(wantY - m.y) * Math.min(120, Math.abs(wantY - m.y) * 3);
    moveBody(inst.grid, m, dt, 0, PHYSICS.maxFall, true, true);
  } else {
    const prevX = m.x;
    moveBody(inst.grid, m, dt, PHYSICS.gravity, PHYSICS.maxFall);
    // bị chặn bởi bậc đất -> nhảy
    if (desiredVx !== 0 && m.onGround && Math.abs(m.x - prevX) < 0.3) m.vy = -PHYSICS.jumpVelocity * 0.85;
  }
  if (!m.windup && now > m.animUntil) m.anim = Math.abs(m.vx) > 5 ? 'run' : 'idle';
  if (m.y > inst.grid.h * 32 + 200) { m.x = m.homeX; m.y = groundYAt(inst.grid, m.homeX); m.vy = 0; }
}

export function initMonsterStats(m: MonsterEnt, levelOverride?: number): void {
  const stats = monsterStats(levelOverride ? { ...m.def, level: levelOverride } : m.def);
  m.stats = stats; m.hp = stats.maxHp;
}

/** Linh thú/triệu hồi: theo chủ, đánh mục tiêu của chủ */
export function tickPet(inst: MapInstance, p: PetEnt, dt: number): void {
  const now = inst.now;
  const owner = inst.entity(p.ownerId) as PlayerEnt | undefined;
  if (!owner || (p.expiresAt && now >= p.expiresAt)) { inst.removePet(p); return; }
  if (p.dead) return;
  let target = p.targetId ? inst.entity(p.targetId) : undefined;
  if (!target || target.dead || Math.abs(target.x - owner.x) > 500) {
    target = undefined; p.targetId = undefined;
    // mục tiêu: quái gần nhất đang đánh chủ hoặc chủ vừa đánh
    let best = 350;
    for (const e of inst.combatants()) {
      if (e.kind !== 'm' || e.dead || !canHit(inst, p, e)) continue;
      const m = e as MonsterEnt;
      const engaged = m.targetId === owner.id || m.threat.has(owner.id);
      const d = Math.abs(e.x - p.x);
      if (engaged && d < best) { best = d; target = e; p.targetId = e.id; }
    }
  }
  let vx = 0;
  const speed = 200 * eff(p).moveSpeed;
  if (target && !isDisabled(p)) {
    const dx = target.x - p.x;
    p.facing = dx >= 0 ? 1 : -1;
    if (Math.abs(dx) > 50) vx = Math.sign(dx) * speed;
    else if ((p.cds['__atk'] ?? 0) <= now) {
      const ready = p.def.skills.filter((s) => (p.cds[s] ?? 0) <= now).map((s) => SKILLS[s]).sort((a, b) => b.cooldown - a.cooldown)[0] ?? SKILLS['m_bite'];
      p.cds[ready.id] = now + ready.cooldown * 1000; p.cds['__atk'] = now + 1200;
      castSkill(inst, p, ready, Math.max(1, Math.floor(p.level / 10)));
    }
  } else {
    const dx = owner.x - owner.facing * 50 - p.x;
    if (Math.abs(dx) > 40) vx = Math.sign(dx) * Math.max(speed, Math.abs(owner.vx) + 30);
    if (Math.abs(dx) > 800) { p.x = owner.x; p.y = owner.y; }
    if (vx) p.facing = vx > 0 ? 1 : -1;
  }
  p.vx = vx;
  const prevX = p.x;
  moveBody(inst.grid, p, dt, PHYSICS.gravity, PHYSICS.maxFall);
  if (vx !== 0 && p.onGround && Math.abs(p.x - prevX) < 0.3) p.vy = -PHYSICS.jumpVelocity * 0.9;
  if (p.y > inst.grid.h * 32 + 100) { p.x = owner.x; p.y = owner.y; p.vy = 0; }
  if (now > p.animUntil) p.anim = Math.abs(p.vx) > 5 ? 'run' : 'idle';
}

/** NPC hộ tống: đi về đích, dừng khi người chơi ở xa, chịu đòn từ quái */
export function tickEscort(inst: MapInstance, e: EscortEnt, dt: number): void {
  if (e.dead) return;
  const owner = inst.playerByChar(e.ownerChar);
  let vx = 0;
  if (owner && Math.abs(owner.x - e.x) < 260 && inst.now >= e.waitUntil) {
    const dx = e.destX - e.x;
    if (Math.abs(dx) > 10) vx = Math.sign(dx) * 85;
    e.facing = dx >= 0 ? 1 : -1;
  }
  e.vx = vx;
  const prevX = e.x;
  moveBody(inst.grid, e, dt, PHYSICS.gravity, PHYSICS.maxFall);
  if (vx !== 0 && e.onGround && Math.abs(e.x - prevX) < 0.2) e.vy = -PHYSICS.jumpVelocity * 0.9;
  e.anim = Math.abs(vx) > 1 ? 'run' : 'idle';
  if (Math.abs(e.destX - e.x) <= 12) inst.escortArrived(e);
}

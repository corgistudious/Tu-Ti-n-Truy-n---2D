import {
  BREAKTHROUGH_COOLDOWN_SEC, BREAKTHROUGH_FAIL_TUVI_LOSS, GATHER_TABLES, ITEMS, LIMITS, MONSTERS, PROFESSION_NAMES, QUESTS, RECIPES, SKILLS, TILE,
  breakthroughRate, professionExpRequired, realmDef, tuViRequired, type ProfessionId,
} from '@tt/shared';
import { q, q1, tx, type Tx } from '../../db.js';
import { changeCurrency } from '../../services/currency.js';
import { GameError, assert } from '../../services/errors.js';
import { consumeTemplate, countTemplate, grantItems } from '../../services/items.js';
import { damage, eff } from '../combat.js';
import type { MapInstance, InstanceController } from '../mapInstance.js';
import type { MonsterEnt, PlayerEnt } from '../entities.js';
import type { PlayerSession } from '../player.js';
import { questEvent } from '../quests.js';
import { checkFortunes } from '../power.js';
import { requireService } from './core.js';
import { achEvent } from '../achievements.js';
import { pushInventory } from './inventory.js';
import { int, rpc, str } from './registry.js';

// ======================= KỸ NĂNG =======================
rpc('skill.list', (s) => ({ learned: Object.fromEntries(s.skills), hotbar: s.row.hotbar }));
function skillLevelCap(s: PlayerSession, skillId: string): number {
  const sk = SKILLS[skillId];
  return Math.min(sk.maxLevel, 3 + Math.max(0, s.realmIdx - sk.reqRealm));
}
rpc('skill.learnUpgrade', async (s, p) => {
  const id = str(p, 'id', 40);
  const sk = SKILLS[id];
  assert(sk && !id.startsWith('m_') && id !== 'basic_attack', 'Kỹ năng không hợp lệ');
  const lvl = s.skills.get(id);
  assert(lvl, 'Cần lĩnh ngộ bí tịch trước');
  assert(lvl < skillLevelCap(s, id), `Cảnh giới hiện tại chỉ cho phép tối đa cấp ${skillLevelCap(s, id)}`);
  const gold = Math.round(sk.learnCost.gold * lvl * 1.5);
  const stones = Math.round(sk.learnCost.spirit_stones * lvl);
  await s.enqueue(() => tx(async (c) => {
    await changeCurrency(c, s.charId, 'gold', -gold, 'skill_upgrade', 'skill', id);
    if (stones) await changeCurrency(c, s.charId, 'spirit_stones', -stones, 'skill_upgrade', 'skill', id);
    if (lvl >= 5) await consumeTemplate(c, s.charId, `manual_${id}`, 1, 'skill_upgrade');
    await c.query('UPDATE character_skills SET level = level + 1 WHERE character_id = $1 AND skill_id = $2', [s.charId, id]);
  }));
  s.skills.set(id, lvl + 1);
  await pushInventory(s);
  s.send({ t: 'ev', k: 'skills', skills: Object.fromEntries(s.skills), hotbar: s.row.hotbar });
  return { ok: true, level: lvl + 1, gold, stones };
});
rpc('skill.hotbar', async (s, p) => {
  const list = (await import('../player.js')).PlayerSession.validHotbar(p.hotbar, s.skills);
  if (!list.includes('basic_attack')) list[0] = 'basic_attack';
  s.row.hotbar = list;
  await q('UPDATE characters SET hotbar = $2 WHERE id = $1', [s.charId, JSON.stringify(list)]);
  return { ok: true, hotbar: list };
});

// ======================= TU LUYỆN =======================
rpc('cult.info', async (s) => {
  const r = realmDef(s.realmIdx);
  const next = realmDef(s.realmIdx + 1);
  const mats = await tx(async (c) => Promise.all(r.breakthrough.materials.map(async (m) => ({ ...m, have: await countTemplate(c, s.charId, m.item) }))));
  const assist = await tx((c) => countTemplate(c, s.charId, 'pill_bt_assist'));
  return {
    realm: s.realmIdx, layer: s.layer, name: s.realmLabel(), next: next.name, tuVi: s.row.tu_vi, req: tuViRequired(s.realmIdx, s.layer),
    materials: mats, gold: r.breakthrough.gold, trial: r.breakthrough.trial, quest: r.breakthrough.questRequired ? { id: r.breakthrough.questRequired, name: QUESTS[r.breakthrough.questRequired]?.name, done: s.quests.get(r.breakthrough.questRequired)?.state === 'done' } : null,
    rate: breakthroughRate(r.breakthrough.baseRate, 0, s.row.bt_fail_streak), trialBonus: r.breakthrough.trial !== 'none' ? 0.25 : 0, assistPills: assist,
    cooldownUntil: s.row.bt_cooldown_until, meditating: s.meditating, stage: r.stage, description: r.description,
  };
});
rpc('cult.meditate', (s, p) => {
  const on = p.on !== false;
  if (!on) { s.stopMeditate(); return { ok: true, on: false }; }
  assert(!s.ent.dead, 'Đã tử vong');
  assert(Date.now() - s.lastCombatAt > 4000, 'Không thể đả tọa khi đang chiến đấu');
  assert(s.ent.onGround !== false, 'Phải đứng trên mặt đất');
  s.interruptChannel('');
  s.meditating = true; s.ent.anim = 'meditate';
  s.send({ t: 'ev', k: 'med', on: true });
  return { ok: true, on: true };
});

class TrialController implements InstanceController {
  stage = 0;
  started = Date.now();
  strikes: { x: number; at: number }[] = [];
  strikesLeft = 0;
  nextStrikeAt = 0;
  done = false;
  demonId?: string;
  constructor(readonly s: PlayerSession, readonly stages: ('tam_ma' | 'thien_kiep')[], readonly rate: number, readonly fromRealm: number) {}
  begin(inst: MapInstance): void { this.startStage(inst); }
  private startStage(inst: MapInstance): void {
    const kind = this.stages[this.stage];
    const p = this.s.ent;
    this.started = Date.now();
    if (kind === 'tam_ma') {
      const m = inst.spawnMonster('trial_inner_demon', p.x + 260, { noRespawn: true, tag: 'trial', ownerTrial: this.s.charId });
      const es = eff(p);
      m.stats = { ...m.stats, maxHp: Math.round(es.maxHp * 1.6), atk: Math.round(Math.max(es.atk, es.matk) * 0.55), matk: Math.round(Math.max(es.atk, es.matk) * 0.55), def: es.def, mdef: es.mdef, crit: 0.08, res: 0.3 };
      m.hp = m.stats.maxHp; m.name = `Tâm Ma của ${this.s.name}`;
      m.def = { ...MONSTERS['trial_inner_demon'], aggroRange: 900, leashRange: 2000 };
      this.demonId = m.id;
      this.s.send({ t: 'ev', k: 'trial', stage: 'tam_ma', text: 'Tâm Ma hiện hình — đánh bại chính mình trong 120 giây!', time: 120000 });
    } else {
      this.strikesLeft = 3 + Math.floor(this.fromRealm / 3);
      this.nextStrikeAt = Date.now() + 2500;
      this.s.send({ t: 'ev', k: 'trial', stage: 'thien_kiep', text: `Thiên kiếp giáng xuống: ${this.strikesLeft} đạo lôi. Né tránh vùng báo hiệu (nhảy/lộn)!`, time: 120000, strikes: this.strikesLeft });
    }
  }
  tick(inst: MapInstance): void {
    if (this.done) return;
    const now = Date.now();
    const p = this.s.ent;
    if (!inst.players.has(p.id)) { this.finish(inst, false, 'Rời khỏi thử thách'); return; }
    if (now - this.started > 120_000) { this.finish(inst, false, 'Hết thời gian'); return; }
    if (this.stages[this.stage] === 'thien_kiep') {
      if (this.strikesLeft > 0 && now >= this.nextStrikeAt) {
        this.strikesLeft--;
        // đạo cuối cùng: ba tia cùng lúc
        const xs = this.strikesLeft === 0 ? [p.x - 90, p.x, p.x + 90] : [p.x + (Math.random() - 0.5) * 60];
        for (const x of xs) { this.strikes.push({ x, at: now + 1100 }); inst.emitNear(x, { t: 'ev', k: 'tele', x: Math.round(x), y: Math.round(p.y - 30), r: 70, d: 1100, s: 'm_lightning_strike' }); }
        this.nextStrikeAt = now + 2200;
      }
      for (let i = this.strikes.length - 1; i >= 0; i--) {
        const st = this.strikes[i];
        if (now < st.at) continue;
        this.strikes.splice(i, 1);
        inst.emitNear(st.x, { t: 'ev', k: 'boom', x: Math.round(st.x), y: Math.round(p.y - 30), r: 70, s: 'm_lightning_strike' });
        if (!p.dead && Math.abs(p.x - st.x) <= 70 + p.w / 2 && p.y > inst.grid.groundTop[Math.floor(st.x / TILE)] * TILE - 140) {
          damage(inst, null, p, Math.round(eff(p).maxHp * (0.2 + this.fromRealm * 0.004)), false, 'true');
        }
      }
      if (this.strikesLeft === 0 && this.strikes.length === 0 && !p.dead) this.nextStage(inst);
    }
  }
  onMonsterKilled(inst: MapInstance, m: MonsterEnt): void { if (m.id === this.demonId && !this.done) this.nextStage(inst); }
  onPlayerKilled(inst: MapInstance, _p: PlayerEnt): boolean { this.finish(inst, false, 'Bạn đã gục ngã trong thử thách'); return true; }
  onPlayerLeave(inst: MapInstance): void { if (!this.done) this.finish(inst, false, 'Rời khỏi thử thách'); }
  private nextStage(inst: MapInstance): void {
    this.stage++;
    if (this.stage >= this.stages.length) this.finish(inst, true, '');
    else this.startStage(inst);
  }
  private finish(inst: MapInstance, cleared: boolean, reason: string): void {
    if (this.done) return;
    this.done = true;
    const success = cleared && Math.random() < Math.min(0.98, this.rate + 0.25);
    applyBreakthrough(this.s, success, this.stages.join('+'), cleared ? this.rate + 0.25 : 0, cleared ? (success ? '' : 'Vượt qua thử thách nhưng đạo cơ chưa vững — đột phá thất bại.') : reason).catch(() => undefined);
    setTimeout(() => {
      if (this.s.ent.inst === inst) { if (this.s.ent.dead) this.s.revive(1); this.s.world.leaveInstance(this.s); }
    }, 2500);
  }
}

async function applyBreakthrough(s: PlayerSession, success: boolean, trial: string, rate: number, failReason: string): Promise<void> {
  const from = s.realmIdx;
  await s.enqueue(async () => {
    if (success) {
      s.row.realm_idx += 1; s.row.layer = 1; s.row.tu_vi = 0; s.row.bt_fail_streak = 0; s.row.bt_cooldown_until = null;
    } else {
      s.row.tu_vi = Math.floor(s.row.tu_vi * (1 - BREAKTHROUGH_FAIL_TUVI_LOSS));
      s.row.bt_fail_streak += 1;
      s.row.bt_cooldown_until = new Date(Date.now() + BREAKTHROUGH_COOLDOWN_SEC * 1000);
    }
    await tx(async (c) => {
      await s.save(c);
      await c.query('INSERT INTO cultivation_logs(character_id, from_realm, to_realm, success, rate, trial) VALUES ($1,$2,$3,$4,$5,$6)', [s.charId, from, from + 1, success, rate, trial]);
    });
  });
  s.recomputeStats();
  if (success) {
    const es = eff(s.ent);
    if (!s.ent.dead) { s.ent.hp = es.maxHp; s.mp = es.maxMp; }
    const name = realmDef(s.realmIdx).name;
    s.notify(`ĐỘT PHÁ THÀNH CÔNG! Bước vào cảnh giới ${name}!`, 'good');
    s.send({ t: 'ev', k: 'breakthrough', ok: true, realm: s.realmIdx, name });
    if (s.realmIdx >= 6) s.world.announce(`${s.name} đã đột phá thành công cảnh giới ${name}!`);
    s.world.questRealmCheck(s);
    achEvent(s, 'realm', s.realmIdx);
    const unlocked = realmDef(s.realmIdx).unlockMaps;
    if (unlocked.length) s.notify(`Mở khóa khu vực: ${unlocked.map((m) => m).join(', ')}`, 'info');
  } else {
    if (trial.includes('tam_ma')) { s.ent.statuses.push({ id: 'tam_ma', until: Date.now() + 300_000, power: 0, stacks: 1, nextTick: Date.now() + 1000 }); s.notify('Tâm ma quấy nhiễu: -10% công trong 5 phút.', 'warn'); }
    s.notify(`Đột phá thất bại. ${failReason} Mất ${Math.round(BREAKTHROUGH_FAIL_TUVI_LOSS * 100)}% tu vi tầng hiện tại, lần sau +5% tỉ lệ. Hồi lại sau ${BREAKTHROUGH_COOLDOWN_SEC} giây.`, 'warn');
    s.send({ t: 'ev', k: 'breakthrough', ok: false });
  }
  s.pushStats();
}

rpc('cult.breakthrough', async (s, p) => {
  const r = realmDef(s.realmIdx);
  assert(!s.ent.dead, 'Đã tử vong');
  assert(!s.ent.inst.instanceKind, 'Không thể đột phá trong phó bản');
  assert(s.layer >= 9 && s.row.tu_vi >= tuViRequired(s.realmIdx, s.layer), 'Tu vi chưa viên mãn (cần tầng 9 đầy tu vi)');
  assert(Date.now() - s.lastCombatAt > 5000, 'Không thể đột phá khi đang chiến đấu');
  if (s.row.bt_cooldown_until && new Date(s.row.bt_cooldown_until) > new Date()) throw new GameError('Kinh mạch chưa hồi phục sau lần đột phá thất bại');
  if (r.breakthrough.questRequired && s.quests.get(r.breakthrough.questRequired)?.state !== 'done') throw new GameError(`Cần hoàn thành nhiệm vụ "${QUESTS[r.breakthrough.questRequired]?.name}"`);
  const useAssist = p.assist === true;
  await s.enqueue(() => tx(async (c) => {
    for (const m of r.breakthrough.materials) await consumeTemplate(c, s.charId, m.item, m.qty, 'breakthrough');
    if (useAssist) await consumeTemplate(c, s.charId, 'pill_bt_assist', 1, 'breakthrough');
    await changeCurrency(c, s.charId, 'gold', -r.breakthrough.gold, 'breakthrough', 'realm', s.realmIdx);
  }));
  await pushInventory(s);
  const rate = breakthroughRate(r.breakthrough.baseRate, useAssist ? 0.1 : 0, s.row.bt_fail_streak);
  s.stopMeditate();
  if (r.breakthrough.trial === 'none') {
    const ok = Math.random() < rate;
    await applyBreakthrough(s, ok, 'none', rate, '');
    return { ok: true, trial: 'none', success: ok };
  }
  const stages: ('tam_ma' | 'thien_kiep')[] = r.breakthrough.trial === 'both' ? ['tam_ma', 'thien_kiep'] : [r.breakthrough.trial as 'tam_ma' | 'thien_kiep'];
  const ctl = new TrialController(s, stages, rate, s.realmIdx);
  const inst = s.world.createInstance(stages[0] === 'tam_ma' ? 'trial_tam_ma' : 'trial_thien_kiep', String(s.charId), ctl);
  s.world.rememberReturn(s);
  s.world.enterInstance(s, inst, 8 * TILE);
  s.ent.hp = eff(s.ent).maxHp; s.mp = eff(s.ent).maxMp;
  ctl.begin(inst);
  return { ok: true, trial: r.breakthrough.trial };
});

// ======================= NGHỀ NGHIỆP =======================
async function profLevel(c: Tx, charId: number, prof: ProfessionId): Promise<{ level: number; exp: number }> {
  const r = (await c.query('SELECT level, exp FROM profession_levels WHERE character_id = $1 AND profession = $2 FOR UPDATE', [charId, prof])).rows[0];
  return r ?? { level: 0, exp: 0 };
}
export async function addProfExp(c: Tx, s: PlayerSession, prof: ProfessionId, exp: number): Promise<void> {
  let { level, exp: e } = await profLevel(c, s.charId, prof);
  e += exp;
  const before = level;
  while (level < 100 && e >= professionExpRequired(level)) { e -= professionExpRequired(level); level++; }
  await c.query('INSERT INTO profession_levels(character_id, profession, level, exp) VALUES ($1,$2,$3,$4) ON CONFLICT (character_id, profession) DO UPDATE SET level = $3, exp = $4', [s.charId, prof, level, e]);
  if (level > before) s.notify(`${PROFESSION_NAMES[prof]} đạt cấp ${level}!`, 'good');
}
async function bestTool(c: Tx, charId: number, prof: ProfessionId): Promise<number> {
  const rows = (await c.query("SELECT template_id FROM item_instances WHERE owner_id = $1 AND container = 'bag'", [charId])).rows as { template_id: string }[];
  let best = 0;
  for (const r of rows) { const d = ITEMS[r.template_id]; if (d?.toolFor === prof) best = Math.max(best, d.toolPower ?? 1); }
  return best;
}
rpc('craft.list', async (s) => {
  const profs = await q<{ profession: string; level: number; exp: number }>('SELECT profession, level, exp FROM profession_levels WHERE character_id = $1', [s.charId]);
  const jobs = await q('SELECT id, recipe_id, started_at, finishes_at, success FROM crafting_jobs WHERE character_id = $1 AND claimed_at IS NULL ORDER BY id', [s.charId]);
  return { professions: Object.fromEntries(profs.map((p) => [p.profession, { level: p.level, exp: p.exp, next: professionExpRequired(p.level) }])), jobs: jobs.map((j) => ({ ...j, success: undefined })) };
});
function craftLocationOk(s: PlayerSession): number {
  const inst = s.ent.inst;
  if (inst.instanceKind === 'housing' && inst.ownerKey === String(s.charId)) return -1; // trong động phủ
  requireService(s, 'craft');
  return 0;
}
rpc('craft.start', async (s, p) => {
  const id = str(p, 'recipe', 60);
  const r = RECIPES[id];
  assert(r, 'Công thức không tồn tại');
  const loc = craftLocationOk(s);
  const res = await s.enqueue(() => tx(async (c) => {
    const { level } = await profLevel(c, s.charId, r.profession);
    assert(level >= r.level, `${PROFESSION_NAMES[r.profession]} cần cấp ${r.level}`);
    const running = (await c.query('SELECT count(*)::int AS n FROM crafting_jobs WHERE character_id = $1 AND claimed_at IS NULL', [s.charId])).rows[0].n;
    assert(running < 3, 'Tối đa 3 lượt chế tạo cùng lúc — hãy nhận thành phẩm');
    const tool = r.toolRequired ? await bestTool(c, s.charId, r.profession) : 1;
    assert(!r.toolRequired || tool > 0, `Cần công cụ ${PROFESSION_NAMES[r.profession]} trong túi`);
    for (const i of r.inputs) await consumeTemplate(c, s.charId, i.item, i.qty, `craft:${id}`);
    if (r.gold) await changeCurrency(c, s.charId, 'gold', -r.gold, 'craft_fee', 'recipe', id);
    let speed = 0;
    if (loc === -1) { const h = (await c.query('SELECT buildings FROM housing WHERE character_id = $1', [s.charId])).rows[0]; speed = Math.min(0.5, (h?.buildings?.dan_phong ?? 0) * 0.1); }
    const seconds = Math.max(1, Math.round(r.seconds * (1 - speed)));
    const success = Math.random() < Math.min(0.99, r.successRate + (tool - 1) * 0.03 + Math.max(0, level - r.level) * 0.005);
    const job = (await c.query("INSERT INTO crafting_jobs(character_id, recipe_id, finishes_at, success) VALUES ($1,$2, now() + ($3 || ' seconds')::interval, $4) RETURNING id, finishes_at", [s.charId, id, String(seconds), success])).rows[0];
    return { ok: true, job: job.id, seconds };
  }));
  await pushInventory(s);
  return res;
});
rpc('craft.claim', async (s, p) => {
  const jobId = int(p, 'job', 1);
  const res = await s.enqueue(() => tx(async (c) => {
    const job = (await c.query('SELECT * FROM crafting_jobs WHERE id = $1 AND character_id = $2 AND claimed_at IS NULL FOR UPDATE', [jobId, s.charId])).rows[0];
    assert(job, 'Không tìm thấy lượt chế tạo');
    assert(new Date(job.finishes_at) <= new Date(), 'Chưa hoàn thành');
    const r = RECIPES[job.recipe_id];
    await c.query('UPDATE crafting_jobs SET claimed_at = now() WHERE id = $1', [jobId]);
    if (job.success) await grantItems(c, s.charId, [{ item: r.output.item, qty: r.output.qty }], `craft:${r.id}`);
    await addProfExp(c, s, r.profession, job.success ? r.exp : Math.ceil(r.exp / 2));
    return { ok: true, success: job.success, item: r.output.item, qty: r.output.qty, recipe: r.id };
  }));
  if (res.success) { questEvent(s, 'craft', res.recipe, 1); achEvent(s, 'craft', 1); }
  s.notify(res.success ? `Chế tạo thành công: ${ITEMS[res.item].name} x${res.qty}` : 'Chế tạo thất bại — nguyên liệu đã tiêu hao.', res.success ? 'good' : 'warn');
  await pushInventory(s);
  return res;
});

rpc('gather.start', async (s, p) => {
  const nodeId = str(p, 'node', 60);
  const inst = s.ent.inst;
  const node = inst.def.nodes.find((n) => n.id === nodeId);
  assert(node, 'Không có tài nguyên');
  assert(Math.abs(node.x - s.ent.x) < 80, 'Quá xa');
  assert(!s.ent.dead && !s.channel, 'Đang bận');
  const key = `${nodeId}`;
  const readyAt = node.kind === 'fishing' ? 0 : inst.nodeReadyAt.get(key) ?? 0;
  assert(Date.now() >= readyAt, 'Tài nguyên đã bị khai thác, chờ hồi phục');
  const table = GATHER_TABLES[node.table];
  const { level, tool } = await tx(async (c) => ({ level: (await profLevel(c, s.charId, table.profession)).level, tool: await bestTool(c, s.charId, table.profession) }));
  assert(level >= table.level, `${PROFESSION_NAMES[table.profession]} cần cấp ${table.level}`);
  if (table.profession === 'fishing' || table.level > 0) assert(tool > 0, `Cần công cụ ${PROFESSION_NAMES[table.profession]} trong túi`);
  const seconds = table.seconds * Math.max(0.5, 1 - tool * 0.08);
  s.startChannel('gather', seconds, { node: nodeId, prof: table.profession }, () => {
    if (node.kind !== 'fishing') {
      if (Date.now() < (inst.nodeReadyAt.get(key) ?? 0)) { s.notify('Người khác đã khai thác trước', 'warn'); return; }
      inst.nodeReadyAt.set(key, Date.now() + node.respawn * 1000);
      inst.broadcast({ t: 'ev', k: 'node', id: nodeId, d: node.respawn * 1000 });
    }
    const total = table.loot.reduce((a, l) => a + l.weight, 0);
    let roll = Math.random() * total;
    const loot = table.loot.find((l) => (roll -= l.weight) < 0) ?? table.loot[0];
    const qty = loot.min + Math.floor(Math.random() * (loot.max - loot.min + 1)) + (tool >= 3 ? 1 : 0);
    s.enqueue(() => tx(async (c) => {
      await grantItems(c, s.charId, [{ item: loot.item, qty }], `gather:${node.table}`);
      await addProfExp(c, s, table.profession, table.exp);
    })).then(async () => {
      s.notify(`Thu được ${ITEMS[loot.item].name} x${qty}`, 'good');
      questEvent(s, 'gather', loot.item, qty);
      checkFortunes(s, 'gather', { map: inst.def.id, target: node.kind }).catch(() => undefined);
      await pushInventory(s);
    }).catch((e) => s.notify((e as Error).message, 'warn'));
  });
  return { ok: true, seconds };
});
export const _k = { q1, LIMITS };

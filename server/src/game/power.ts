import {
  AWAKEN_TABLE, FACTIONS, FORTUNES, ITEMS, MAPS, MERIDIANS, NPCS, PHYSIQUES, ROOT_ELEMENTS, ROOT_GRADES, combatLevel, combatLevelStats, isNight, repTier, tuViRequired,
  type FortuneDef, type PartialStats, type RootElement, type StatKey,
} from '@tt/shared';
import { q, tx, type Tx } from '../db.js';
import { log } from '../log.js';
import { grantItems } from '../services/items.js';
import { GameError } from '../services/errors.js';
import type { PlayerSession } from './player.js';

export interface PowerState { element: RootElement | null; grade: number; physique: string; meridians: number }

export async function loadPower(s: PlayerSession): Promise<void> {
  await q('INSERT INTO character_power(character_id) VALUES ($1) ON CONFLICT DO NOTHING', [s.charId]);
  const r = (await q<{ root_element: RootElement | null; root_grade: number; physique: string; meridians: number }>('SELECT * FROM character_power WHERE character_id = $1', [s.charId]))[0];
  s.power = { element: r.root_element, grade: r.root_grade, physique: r.physique, meridians: r.meridians };
  for (const x of await q<{ faction: string; value: number }>('SELECT faction, value FROM faction_reputation WHERE character_id = $1', [s.charId])) s.rep.set(x.faction, x.value);
  // nhân vật đã hoàn thành "Thức Tỉnh Linh Căn" trước khi có hệ thống này: thức tỉnh bù
  if (s.power.grade === 0 && s.quests.get('mq_4_06')?.state === 'done') await tx((c) => awakenRoot(c, s)).catch((e) => log.warn('awaken backfill', { err: String(e) }));
}

/** Phần trăm (nhân) và cộng thẳng từ linh căn, thể chất, kinh mạch, lịch luyện */
export function powerModifiers(s: PlayerSession): { pct: PartialStats; flat: PartialStats } {
  const pct: PartialStats = {}; const flat: PartialStats = {};
  const addPct = (k: StatKey, v: number) => { pct[k] = (pct[k] ?? 0) + v; };
  const addFlat = (k: StatKey, v: number) => { flat[k] = (flat[k] ?? 0) + v; };
  const p = s.power;
  if (!p) return { pct, flat };
  if (p.element && p.grade > 0) {
    const st = ROOT_ELEMENTS[p.element].stat as StatKey;
    if (st === 'crit' || st === 'pen') addFlat(st, 0.01 * p.grade); else addPct(st, 0.03 * p.grade);
  }
  for (const [k, v] of Object.entries(PHYSIQUES[p.physique]?.stats ?? {}) as [StatKey, number][]) {
    if (['crit', 'critDmg', 'pen', 'res', 'moveSpeed'].includes(k)) addFlat(k, v); else addPct(k, v);
  }
  for (const m of MERIDIANS) {
    if (!(p.meridians & (1 << m.idx))) continue;
    if (m.stat) addPct(m.stat as StatKey, m.bonus);
    else for (const k of ['maxHp', 'maxMp', 'atk', 'matk', 'def', 'mdef'] as StatKey[]) addPct(k, m.bonus);
  }
  for (const [k, v] of Object.entries(combatLevelStats(combatLevel(s.row.exp))) as [StatKey, number][]) addFlat(k, v);
  return { pct, flat };
}
export function cultivationMultiplier(s: PlayerSession): number { return ROOT_GRADES[s.power?.grade ?? 0]?.cultivation ?? 1; }
/** Thưởng sát thương khi dùng công pháp hợp nguyên tố linh căn */
export function elementBonus(s: PlayerSession, path: string): number {
  const p = s.power;
  if (!p?.element || !p.grade) return 0;
  return (ROOT_ELEMENTS[p.element].paths as readonly string[]).includes(path) ? ROOT_GRADES[p.grade].dmg : 0;
}

function rollGrade(): number {
  const total = AWAKEN_TABLE.reduce((a, [, w]) => a + w, 0);
  let r = Math.random() * total;
  for (const [g, w] of AWAKEN_TABLE) { if ((r -= w) < 0) return g; }
  return 1;
}
/** Thức tỉnh linh căn — gọi khi trả "Thức Tỉnh Linh Căn" (mq_4_06) */
export async function awakenRoot(c: Tx, s: PlayerSession): Promise<void> {
  if (s.power.grade > 0) return;
  const els = (Object.keys(ROOT_ELEMENTS) as RootElement[]).filter((e) => e !== 'hon_don');
  const element = Math.random() < 0.01 ? 'hon_don' : els[Math.floor(Math.random() * els.length)];
  const grade = rollGrade();
  await c.query('UPDATE character_power SET root_element = $2, root_grade = $3, updated_at = now() WHERE character_id = $1', [s.charId, element, grade]);
  s.power.element = element; s.power.grade = grade;
  s.notify(`Linh căn thức tỉnh: ${ROOT_ELEMENTS[element].name} — ${ROOT_GRADES[grade].name}!`, 'good');
}

export async function addRep(c: Tx, s: PlayerSession, faction: string, delta: number): Promise<void> {
  if (!FACTIONS[faction] || !delta) return;
  const r = await c.query('INSERT INTO faction_reputation(character_id, faction, value) VALUES ($1,$2,$3) ON CONFLICT (character_id, faction) DO UPDATE SET value = GREATEST(-50000, LEAST(100000, faction_reputation.value + $3)) RETURNING value', [s.charId, faction, delta]);
  s.rep.set(faction, r.rows[0].value);
  s.send({ t: 'ev', k: 'rep', faction, value: r.rows[0].value, delta });
}
/** Hệ số giá theo danh vọng với thế lực của NPC bán hàng */
export function priceFactor(s: PlayerSession, npcId: string): number {
  const f = NPCS[npcId]?.faction;
  if (!f) return 1;
  return 1 - repTier(s.rep.get(f) ?? 0).discount;
}

// ======================= KINH MẠCH & TẨY LUYỆN LINH CĂN =======================
export async function openMeridian(s: PlayerSession, idx: number): Promise<{ ok: boolean }> {
  const m = MERIDIANS[idx];
  if (!m) throw new GameError('Kinh mạch không tồn tại');
  if (s.power.meridians & (1 << idx)) throw new GameError('Kinh mạch đã đả thông');
  if (idx > 0 && !(s.power.meridians & (1 << (idx - 1)))) throw new GameError('Phải đả thông kinh mạch trước theo thứ tự');
  if (s.realmIdx < m.reqRealm) throw new GameError(`Cần cảnh giới tối thiểu ${m.reqRealm}`);
  const { consumeTemplate } = await import('../services/items.js');
  const { changeCurrency } = await import('../services/currency.js');
  const ok = Math.random() < m.rate;
  await s.enqueue(() => tx(async (c) => {
    await consumeTemplate(c, s.charId, m.pill, m.pillQty, 'meridian');
    await changeCurrency(c, s.charId, 'gold', -m.gold, 'meridian', 'meridian', idx);
    if (ok) {
      const next = s.power.meridians | (1 << idx);
      await c.query('UPDATE character_power SET meridians = $2, updated_at = now() WHERE character_id = $1', [s.charId, next]);
      s.power.meridians = next;
    }
  }));
  s.recomputeStats();
  s.pushStats();
  s.notify(ok ? `Đả thông ${m.name}!` : `Xung kích ${m.name} thất bại — đan dược đã tiêu hao, kinh mạch không tổn thương.`, ok ? 'good' : 'warn');
  return { ok };
}
export async function refineRoot(s: PlayerSession): Promise<{ ok: boolean; grade: number }> {
  if (!s.power.grade) throw new GameError('Chưa thức tỉnh linh căn');
  if (s.power.grade >= 6) throw new GameError('Linh căn đã đạt Thần Phẩm');
  const { consumeTemplate } = await import('../services/items.js');
  const rate = [0, 0.6, 0.45, 0.3, 0.18, 0.08][s.power.grade];
  const ok = Math.random() < rate;
  await s.enqueue(() => tx(async (c) => {
    await consumeTemplate(c, s.charId, 'stone_spirit_root', 1, 'refine_root');
    if (ok) await c.query('UPDATE character_power SET root_grade = root_grade + 1, updated_at = now() WHERE character_id = $1', [s.charId]);
  }));
  if (ok) s.power.grade++;
  s.recomputeStats();
  s.pushStats();
  s.notify(ok ? `Linh căn thăng lên ${ROOT_GRADES[s.power.grade].name}!` : 'Tẩy luyện thất bại (linh căn không suy giảm).', ok ? 'good' : 'warn');
  return { ok, grade: s.power.grade };
}

// ======================= CƠ DUYÊN =======================
/** Kiểm tra cơ duyên: điều kiện vị trí/thời gian/cảnh giới/nhiệm vụ + xác suất có kiểm soát + giới hạn (một lần, hồi chiêu, số lượng toàn server) */
export async function checkFortunes(s: PlayerSession, trigger: FortuneDef['trigger'], ctx: { map?: string; target?: string }): Promise<void> {
  if (!s.ent || s.ent.dead) return;
  const now = Date.now();
  for (const f of FORTUNES) {
    if (f.trigger !== trigger) continue;
    if (f.map && f.map !== ctx.map) continue;
    if (f.target && f.target !== ctx.target) continue;
    if (f.minRealm !== undefined && s.realmIdx < f.minRealm) continue;
    if (f.maxRealm !== undefined && s.realmIdx > f.maxRealm) continue;
    if (f.timeOfDay && (f.timeOfDay === 'night') !== isNight(now)) continue;
    if (f.quest && s.quests.get(f.quest)?.state !== 'done') continue;
    if (Math.random() >= f.chance) continue;
    await grantFortune(s, f).catch((e) => log.warn('fortune grant failed', { f: f.id, err: String(e) }));
  }
}
export async function grantFortune(s: PlayerSession, f: FortuneDef): Promise<boolean> {
  const granted = await s.enqueue(() => tx(async (c) => {
    const last = (await c.query('SELECT created_at FROM fortune_log WHERE character_id = $1 AND fortune_id = $2 ORDER BY id DESC LIMIT 1', [s.charId, f.id])).rows[0];
    if (last && f.once) return false;
    if (last && f.cooldownHours && Date.now() - new Date(last.created_at).getTime() < f.cooldownHours * 3600_000) return false;
    if (f.globalCap) {
      await c.query('INSERT INTO fortune_global(fortune_id) VALUES ($1) ON CONFLICT DO NOTHING', [f.id]);
      const g = (await c.query('UPDATE fortune_global SET claimed = claimed + 1 WHERE fortune_id = $1 AND claimed < $2 RETURNING claimed', [f.id, f.globalCap])).rows[0];
      if (!g) return false; // đã hết số lượng toàn server
    }
    for (const r of f.rewards) {
      switch (r.kind) {
        case 'discover_map': await c.query('INSERT INTO map_discovery(character_id, map_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [s.charId, r.value]); break;
        case 'physique': {
          const cur = PHYSIQUES[s.power.physique]?.rarity ?? 0;
          if ((PHYSIQUES[r.value]?.rarity ?? 0) > cur) { await c.query('UPDATE character_power SET physique = $2 WHERE character_id = $1', [s.charId, r.value]); s.power.physique = r.value; }
          break;
        }
        case 'spirit_root':
          if (s.power.grade > 0 && s.power.grade < 6) { await c.query('UPDATE character_power SET root_grade = root_grade + 1 WHERE character_id = $1', [s.charId]); s.power.grade++; }
          break;
        case 'item': case 'pet_egg': await grantItems(c, s.charId, [{ item: r.value, qty: r.qty ?? 1, bound: true }], `fortune:${f.id}`); break;
        case 'tuvi': break;
      }
    }
    await c.query('INSERT INTO fortune_log(character_id, fortune_id, rewards) VALUES ($1,$2,$3)', [s.charId, f.id, JSON.stringify(f.rewards)]);
    return true;
  }));
  if (!granted) return false;
  for (const r of f.rewards) if (r.kind === 'tuvi') s.addTuVi(tuViRequired(s.realmIdx, s.layer) * 0.1, 'fortune');
  s.recomputeStats();
  s.pushStats();
  const desc = f.rewards.map((r) => r.kind === 'discover_map' ? `khám phá ${MAPS[r.value]?.name}` : r.kind === 'physique' ? `thể chất ${PHYSIQUES[r.value]?.name}` : r.kind === 'spirit_root' ? 'linh căn thăng phẩm' : r.kind === 'tuvi' ? 'tu vi tăng vọt' : `${ITEMS[r.value]?.name} x${r.qty ?? 1}`).join(', ');
  s.send({ t: 'ev', k: 'fortune', id: f.id, name: f.name, desc: f.desc, rewards: desc });
  s.notify(`【Cơ Duyên】 ${f.name}: ${desc}`, 'good');
  if (f.globalCap) s.world.announce(`${s.name} gặp cơ duyên hiếm: ${f.name}!`);
  return true;
}

import { ITEMS, SET_DEFS, addStats, baseCharacterStats, emptyStats, enhanceMultiplier, refineMultiplier, type PartialStats, type Stats, type StatKey } from '@tt/shared';
import type { ItemRow } from './items.js';

export interface StatInput {
  realmIdx: number; layer: number;
  equipment: ItemRow[];
  permanent: PartialStats;      // phần trăm (0.02 = +2%)
  flat?: PartialStats;          // cộng thẳng (chí mạng, xuyên giáp, kháng...) — từ thể chất/lịch luyện
  buffs: { id: string; power: number }[];
}

/** Tính chỉ số cuối cùng — chỉ server tính, client chỉ hiển thị */
export function computeStats(inp: StatInput): Stats {
  const s = baseCharacterStats(inp.realmIdx, inp.layer);
  const gear = emptyStats();
  const setCount: Record<string, number> = {};
  for (const it of inp.equipment) {
    const d = ITEMS[it.template_id];
    if (!d) continue;
    if (it.durability !== null && it.durability !== undefined && it.durability <= 0) continue; // hỏng: không tính
    const mult = enhanceMultiplier(it.enhance) * refineMultiplier(it.refine);
    for (const k of Object.keys(d.stats ?? {}) as StatKey[]) {
      const v = d.stats![k]!;
      const scalable = !['crit', 'critDmg', 'pen', 'res', 'moveSpeed'].includes(k);
      gear[k] += scalable ? v * mult : v;
    }
    for (const a of it.affixes ?? []) gear[a.stat] += a.value;
    for (const g of it.gems ?? []) { const gd = ITEMS[g]; if (gd?.gemStat) gear[gd.gemStat.stat] += gd.gemStat.value; }
    if (d.set) setCount[d.set] = (setCount[d.set] ?? 0) + 1;
  }
  addStats(s, gear);
  for (const [sid, n] of Object.entries(setCount)) for (const b of SET_DEFS[sid]?.bonuses ?? []) if (n >= b.count) addStats(s, b.stats);
  const ADDITIVE: StatKey[] = ['crit', 'critDmg', 'pen', 'res', 'moveSpeed'];
  for (const k of Object.keys(inp.permanent) as StatKey[]) { if (ADDITIVE.includes(k)) s[k] += inp.permanent[k] ?? 0; else s[k] *= 1 + (inp.permanent[k] ?? 0); }
  for (const k of Object.keys(inp.flat ?? {}) as StatKey[]) s[k] += inp.flat![k] ?? 0;
  for (const b of inp.buffs) {
    if (b.id === 'atk_up') { s.atk *= 1 + b.power; s.matk *= 1 + b.power; }
    if (b.id === 'def_up') { s.def *= 1 + b.power; s.mdef *= 1 + b.power; }
    if (b.id === 'speed_up') s.moveSpeed += b.power;
    if (b.id === 'armor_break') { s.def *= 1 - b.power; s.mdef *= 1 - b.power; }
    if (b.id === 'slow') s.moveSpeed *= 1 - b.power;
    if (b.id === 'tam_ma') { s.atk *= 0.9; s.matk *= 0.9; }
  }
  s.crit = Math.min(0.75, s.crit); s.pen = Math.min(0.8, s.pen); s.res = Math.min(0.8, s.res);
  s.moveSpeed = Math.max(0.3, Math.min(2.2, s.moveSpeed));
  for (const k of ['maxHp', 'maxMp', 'atk', 'matk', 'def', 'mdef', 'hpRegen', 'mpRegen'] as StatKey[]) s[k] = Math.round(s[k]);
  return s;
}

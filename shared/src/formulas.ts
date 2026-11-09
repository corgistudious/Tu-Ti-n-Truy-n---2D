import type { MonsterDef, PartialStats, Stats, StatKey } from './types.js';
import { RARITIES } from './constants.js';

/** Số cảnh giới đã định nghĩa rõ (Võ Đạo 10 + Tu Chân 9 + Tiên Giới 10). Sau đó là Hỗn Độn vô hạn. */
export const NAMED_REALMS = 29;
export const LAYERS_PER_REALM = 9;
export const MAX_DAMAGE = 1e15;

/** "Cấp tổng" dùng để scale chỉ số: realmIdx*9 + layer (layer bắt đầu từ 1) */
export function powerLevel(realmIdx: number, layer: number): number {
  return realmIdx * LAYERS_PER_REALM + Math.max(1, Math.min(LAYERS_PER_REALM, layer));
}

/** Tu vi cần để lên tầng kế tiếp. Tăng theo cấp số nhân trong vùng đã đặt tên, tuyến tính hơn ở Hỗn Độn để tránh tràn số. */
export function tuViRequired(realmIdx: number, layer: number): number {
  const L = powerLevel(realmIdx, layer);
  const capL = NAMED_REALMS * LAYERS_PER_REALM;
  if (L <= capL) return Math.floor(80 * Math.pow(1.105, L));
  const base = 80 * Math.pow(1.105, capL);
  return Math.floor(base * (1 + 0.08 * (L - capL)));
}

/** Đường cong chỉ số cơ bản theo cấp tổng */
export function statCurve(L: number): number {
  const capL = NAMED_REALMS * LAYERS_PER_REALM;
  if (L <= capL) return Math.pow(1.034, L);
  return Math.pow(1.034, capL) * (1 + 0.02 * (L - capL));
}

export function emptyStats(): Stats {
  return { maxHp: 0, maxMp: 0, atk: 0, matk: 0, def: 0, mdef: 0, crit: 0, critDmg: 0, pen: 0, res: 0, moveSpeed: 0, hpRegen: 0, mpRegen: 0 };
}

export function addStats(target: Stats, add: PartialStats | undefined, mult = 1): Stats {
  if (!add) return target;
  for (const k of Object.keys(add) as StatKey[]) target[k] += (add[k] ?? 0) * mult;
  return target;
}

/** Chỉ số gốc của nhân vật theo cảnh giới/tầng. Mỗi lần qua đại cảnh giới có thêm bước nhảy. */
export function baseCharacterStats(realmIdx: number, layer: number): Stats {
  const L = powerLevel(realmIdx, layer);
  const c = statCurve(L);
  const realmJump = 1 + realmIdx * 0.06;
  return {
    maxHp: Math.round(120 * c * realmJump),
    maxMp: Math.round(60 * c * realmJump),
    atk: Math.round(14 * c * realmJump),
    matk: Math.round(14 * c * realmJump),
    def: Math.round(6 * c * realmJump),
    mdef: Math.round(6 * c * realmJump),
    crit: 0.05,
    critDmg: 1.5,
    pen: 0,
    res: 0.02 + Math.min(0.3, realmIdx * 0.01),
    moveSpeed: 1,
    hpRegen: Math.round(2 * c),
    mpRegen: Math.round(1.5 * c),
  };
}

/** Chỉ số quái vật theo cấp và hệ số loại */
export function monsterStats(m: MonsterDef): Stats {
  const c = statCurve(m.level);
  return {
    maxHp: Math.round(90 * c * m.hpMult),
    maxMp: 100,
    atk: Math.round(11 * c * m.atkMult),
    matk: Math.round(11 * c * m.atkMult),
    def: Math.round(5 * c * m.defMult),
    mdef: Math.round(5 * c * m.defMult),
    crit: m.rank === 'normal' ? 0.03 : 0.08,
    critDmg: 1.5,
    pen: m.rank.includes('boss') ? 0.15 : 0,
    res: m.rank.includes('boss') ? 0.45 : m.rank === 'elite' ? 0.2 : 0.05,
    moveSpeed: 1,
    hpRegen: 0,
    mpRegen: 0,
  };
}

/** Chỉ số trang bị theo tầng cảnh giới yêu cầu, ô trang bị và độ hiếm */
export function equipmentBaseStats(slot: string, reqRealm: number, rarity: number): PartialStats {
  const L = powerLevel(reqRealm, 5);
  const c = statCurve(L) * (1 + reqRealm * 0.06);
  const r = RARITIES[Math.min(rarity, RARITIES.length - 1)].mult;
  const k = c * r;
  switch (slot) {
    case 'weapon': return { atk: Math.round(9 * k), matk: Math.round(9 * k), crit: 0.01 * Math.min(rarity, 5) };
    case 'armor': return { maxHp: Math.round(55 * k), def: Math.round(5 * k), mdef: Math.round(3 * k) };
    case 'helmet': return { maxHp: Math.round(30 * k), mdef: Math.round(4 * k) };
    case 'boots': return { def: Math.round(3 * k), moveSpeed: 0.03 + 0.01 * Math.min(rarity, 6) };
    case 'ring': return { atk: Math.round(4 * k), matk: Math.round(4 * k), critDmg: 0.05 * Math.min(rarity, 6) };
    case 'amulet': return { maxMp: Math.round(30 * k), matk: Math.round(4 * k), res: 0.01 * Math.min(rarity, 6) };
    case 'artifact': return { atk: Math.round(5 * k), matk: Math.round(6 * k), pen: 0.02 * Math.min(rarity, 8) };
    default: return {};
  }
}

/** Hệ số cường hóa: +1..+15, tăng dần */
export function enhanceMultiplier(level: number): number {
  return 1 + level * 0.07 + Math.max(0, level - 10) * 0.05;
}
export function enhanceSuccessRate(current: number): number {
  const rates = [1, 1, 0.95, 0.9, 0.85, 0.75, 0.65, 0.55, 0.45, 0.38, 0.3, 0.24, 0.18, 0.13, 0.09];
  return rates[Math.min(current, rates.length - 1)];
}
export function enhanceCost(current: number, reqRealm: number): { gold: number; stones: number } {
  return { gold: Math.round(200 * Math.pow(1.45, current) * (1 + reqRealm)), stones: current >= 7 ? Math.round(2 * Math.pow(1.4, current - 6) * (1 + reqRealm * 0.5)) : 0 };
}
/** Thất bại từ +7 trở lên tụt 1 cấp (không phá hủy) — hậu quả hợp lý, không quá nặng */
export function enhanceFailPenalty(current: number): number { return current >= 7 ? 1 : 0; }

export function refineMultiplier(level: number): number { return 1 + level * 0.04; }

export interface DamageInput {
  attack: number;        // atk hoặc matk của bên tấn công
  defense: number;       // def hoặc mdef của bên phòng thủ
  pen: number;           // 0..0.8
  power: number;         // hệ số kỹ năng
  crit: number;          // tỷ lệ chí mạng 0..1
  critDmg: number;       // hệ số chí mạng
  targetRes: number;     // kháng của mục tiêu (giảm chí mạng & hiệu ứng)
  bonus: number;         // hệ số cộng thêm (combo, enrage, ...)
  rng: () => number;
}
export interface DamageResult { amount: number; crit: boolean }

/**
 * Công thức sát thương: giảm thương theo tỉ lệ def/(def + 3*attack) — không phụ thuộc độ lớn tuyệt đối
 * nên cân bằng ở mọi cảnh giới, không tràn số (giới hạn MAX_DAMAGE).
 */
export function computeDamage(d: DamageInput): DamageResult {
  const attack = Math.max(1, d.attack);
  const effDef = Math.max(0, d.defense * (1 - Math.min(0.8, Math.max(0, d.pen))));
  const mitigation = effDef / (effDef + 3 * attack);
  const variance = 0.95 + d.rng() * 0.1;
  let amount = attack * d.power * (1 - mitigation) * variance * (1 + d.bonus);
  const critChance = Math.max(0, Math.min(0.75, d.crit - d.targetRes * 0.25));
  const crit = d.rng() < critChance;
  if (crit) amount *= Math.max(1.2, d.critDmg);
  amount = Math.max(1, Math.min(MAX_DAMAGE, Math.round(amount)));
  return { amount, crit };
}

/** Xác suất hiệu ứng sau kháng */
export function statusChance(base: number, res: number): number {
  return Math.max(0, Math.min(1, base * (1 - Math.min(0.8, res))));
}

/** Tỉ lệ đột phá: tỉ lệ gốc + đan dược hỗ trợ - phạt tâm ma của các lần thất bại trước */
export function breakthroughRate(baseRate: number, pillBonus: number, failStreak: number): number {
  return Math.max(0.05, Math.min(0.98, baseRate + pillBonus + Math.min(0.25, failStreak * 0.05)));
}

/** Thất bại mất 15% tu vi của tầng hiện tại, không tụt tầng/cảnh giới */
export const BREAKTHROUGH_FAIL_TUVI_LOSS = 0.15;
export const BREAKTHROUGH_COOLDOWN_SEC = 120;

/** Tu vi nhận khi đả tọa mỗi giây */
export function meditationRate(realmIdx: number, layer: number, density: number, housingBonus: number): number {
  return Math.max(1, Math.floor(tuViRequired(realmIdx, layer) / 900 * density * (1 + housingBonus)));
}

/** Kinh nghiệm/tu vi từ quái: giảm khi chênh lệch cấp lớn để chống farm quái thấp */
export function killRewardScale(playerL: number, monsterL: number): number {
  const diff = monsterL - playerL;
  if (diff >= 0) return Math.min(1.3, 1 + diff * 0.03);
  return Math.max(0.05, 1 + diff * 0.08);
}

/** Elo cho đấu trường */
export function eloUpdate(ra: number, rb: number, scoreA: number, k = 32): [number, number] {
  const ea = 1 / (1 + Math.pow(10, (rb - ra) / 400));
  const na = Math.round(ra + k * (scoreA - ea));
  const nb = Math.round(rb + k * ((1 - scoreA) - (1 - ea)));
  return [na, nb];
}

/** Chỉ số sức mạnh tổng hợp để xếp hạng */
export function combatPower(s: Stats): number {
  return Math.round(s.maxHp * 0.2 + s.maxMp * 0.1 + (s.atk + s.matk) * 1.5 + (s.def + s.mdef) * 1.2 + s.crit * 1000 + s.critDmg * 300 + s.pen * 2000 + s.res * 1000);
}

export function petStats(base: PartialStats, growth: number, level: number, quality: number): Stats {
  const s = emptyStats();
  const m = Math.pow(growth, level - 1) * (1 + quality * 0.12);
  for (const k of Object.keys(base) as StatKey[]) s[k] = Math.round((base[k] ?? 0) * m * 100) / 100;
  s.moveSpeed = 1; s.critDmg = 1.5; s.crit = 0.05;
  return s;
}
export function petExpRequired(level: number): number { return Math.floor(60 * Math.pow(1.16, level)); }
export function professionExpRequired(level: number): number { return Math.floor(50 * Math.pow(1.25, level)); }

/** Seeded RNG (mulberry32) — dùng cho sinh bản đồ tất định */
export function seededRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

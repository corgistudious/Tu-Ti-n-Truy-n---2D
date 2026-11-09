import { powerLevel } from '../formulas.js';
import type { BossPhase, DropEntry, MonsterDef, MonsterRank } from '../types.js';
import { herbForRealm, oreForRealm } from './realms.js';

const monsters: Record<string, MonsterDef> = {};

interface Opt {
  mat?: string; skills?: string[]; passive?: boolean; flying?: boolean; capturable?: string; element?: MonsterDef['element'];
  phases?: BossPhase[]; extraDrops?: DropEntry[]; scaling?: 'atk' | 'matk'; size?: [number, number]; speed?: number; ranged?: boolean; retreat?: number;
}

const RANK_MULT: Record<MonsterRank, { hp: number; atk: number; def: number; exp: number; respawn: number }> = {
  normal: { hp: 1, atk: 1, def: 1, exp: 1, respawn: 12 },
  elite: { hp: 3.2, atk: 1.5, def: 1.4, exp: 4, respawn: 60 },
  rare: { hp: 5, atk: 1.6, def: 1.6, exp: 10, respawn: 600 },
  boss: { hp: 22, atk: 2.0, def: 1.8, exp: 40, respawn: 900 },
  world_boss: { hp: 160, atk: 2.6, def: 2.2, exp: 200, respawn: 7200 },
  dungeon_boss: { hp: 30, atk: 2.2, def: 2.0, exp: 60, respawn: 0 },
  guild_boss: { hp: 120, atk: 2.2, def: 2.0, exp: 120, respawn: 0 },
  event_boss: { hp: 80, atk: 2.2, def: 2.0, exp: 100, respawn: 0 },
};

function defaultDrops(realm: number, rank: MonsterRank, mat?: string): DropEntry[] {
  const big = rank !== 'normal';
  const d: DropEntry[] = [
    { item: herbForRealm(realm), chance: big ? 0.8 : 0.12, min: 1, max: big ? 4 : 1 },
    { item: oreForRealm(realm), chance: big ? 0.8 : 0.1, min: 1, max: big ? 3 : 1 },
    { item: 'stone_enhance', chance: big ? 0.9 : 0.06, min: 1, max: big ? 5 : 1 },
    { item: `pill_hp_${Math.min(5, 1 + Math.floor(realm / 5))}`, chance: big ? 0.5 : 0.05, min: 1, max: 2 },
    { item: 'pet_food_1', chance: 0.04, min: 1, max: 2 },
  ];
  if (mat) d.push({ item: mat, chance: big ? 1 : 0.35, min: 1, max: big ? 4 : 1 });
  const eqChance = rank === 'normal' ? 0.02 : rank === 'elite' ? 0.2 : 0.6;
  for (const slot of ['weapon', 'armor', 'helmet', 'boots', 'ring', 'amulet', 'artifact']) d.push({ item: `eq_${slot}_${Math.min(28, realm)}`, chance: eqChance / 7 * (big ? 2 : 1), min: 1, max: 1 });
  if (big) {
    d.push({ item: `pill_bt_${Math.min(29, realm + 1)}`, chance: rank === 'elite' ? 0.06 : 0.35, min: 1, max: 1 });
    d.push({ item: 'stone_refine', chance: 0.4, min: 1, max: 2 });
    d.push({ item: `pill_tuvi_${Math.min(6, 1 + Math.floor(realm / 5))}`, chance: 0.4, min: 1, max: 2 });
  }
  if (rank.includes('boss') || rank === 'rare') {
    d.push({ item: 'stone_reroll', chance: 0.3, min: 1, max: 1 });
    d.push({ item: `gem_ruby_${Math.min(5, 1 + Math.floor(realm / 6))}`, chance: 0.15, min: 1, max: 1 });
    d.push({ item: `gem_emerald_${Math.min(5, 1 + Math.floor(realm / 6))}`, chance: 0.15, min: 1, max: 1 });
    d.push({ item: 'bag_stones_small', chance: 0.5, min: 1, max: 3 });
  }
  return d;
}

function mob(id: string, name: string, sprite: string, rank: MonsterRank, realm: number, layer: number, o: Opt = {}): MonsterDef {
  const rm = RANK_MULT[rank];
  const L = powerLevel(realm, layer);
  const boss = rank.includes('boss');
  const [w, h] = o.size ?? (boss ? [90, 120] : rank === 'elite' || rank === 'rare' ? [52, 60] : [40, 44]);
  const m: MonsterDef = {
    id, name, sprite, rank, level: L, w, h,
    hpMult: rm.hp, atkMult: rm.atk, defMult: rm.def,
    speed: o.speed ?? (boss ? 110 : 90),
    aggroRange: o.passive ? 0 : boss ? 480 : 300,
    attackRange: o.ranged ? 320 : boss ? 90 : 52,
    attackCooldown: boss ? 1.4 : 1.8,
    scaling: o.scaling ?? 'atk',
    passive: o.passive,
    flying: o.flying,
    skills: o.skills ?? ['m_bite'],
    phases: o.phases,
    drops: [...defaultDrops(realm, rank, o.mat), ...(o.extraDrops ?? [])],
    exp: Math.round(12 * Math.pow(1.09, L) * rm.exp),
    tuvi: Math.round(6 * Math.pow(1.1, L) * rm.exp),
    gold: [Math.round(3 * Math.pow(1.07, L) * rm.exp), Math.round(8 * Math.pow(1.07, L) * rm.exp)],
    respawn: rm.respawn,
    capturable: o.capturable,
    element: o.element ?? 'none',
    leashRange: boss ? 900 : 600,
    retreatAtHp: o.retreat,
  };
  if (monsters[id]) throw new Error('dup monster ' + id);
  monsters[id] = m;
  return m;
}

const ph = (hpBelow: number, announce: string, skills: string[], extra: Partial<BossPhase> = {}): BossPhase => ({ hpBelow, announce, skills, ...extra });

// ===== Nhân Giới =====
mob('slime_green', 'Lục Linh Nhầy', 'slime', 'normal', 0, 2, { mat: 'mat_slime_gel', passive: true, speed: 60 });
mob('chicken_wild', 'Gà Rừng Hung Dữ', 'bird', 'normal', 0, 3, { mat: 'mat_slime_gel', speed: 80 });
mob('fox_spirit_young', 'Tiểu Linh Hồ', 'fox', 'normal', 0, 5, { mat: 'mat_fox_tail', capturable: 'pet_fox', speed: 110 });
mob('bamboo_sprite', 'Trúc Yêu', 'treant', 'normal', 0, 6, { mat: 'mat_bamboo_core', skills: ['m_bite', 'm_spit'] });
mob('wolf_black', 'Hắc Phong Lang', 'wolf', 'normal', 0, 8, { mat: 'mat_wolf_fang', capturable: 'pet_wolf', speed: 120, skills: ['m_bite', 'm_charge'] });
mob('boar_iron', 'Thiết Bì Trư', 'boar', 'elite', 0, 9, { mat: 'mat_boar_hide', skills: ['m_bite', 'm_charge'] });
mob('boss_bamboo_king', 'Thanh Trúc Yêu Vương', 'treant', 'boss', 0, 9, { mat: 'mat_bamboo_core', skills: ['m_slam', 'm_spit'], extraDrops: [{ item: 'set_thanh_truc_weapon', chance: 0.2, min: 1, max: 1 }, { item: 'set_thanh_truc_boots', chance: 0.25, min: 1, max: 1 }],
  phases: [ph(0.6, 'Trúc Yêu Vương gọi rừng trúc trợ giúp!', ['m_slam', 'm_barrage'], { summon: { monster: 'bamboo_sprite', count: 3 } }), ph(0.25, 'Trúc Yêu Vương nổi giận, rễ trúc trồi lên khắp nơi!', ['m_slam', 'm_barrage', 'm_void_zone'], { enrage: 1.3, speedMult: 1.2 })] });

mob('bandit_thug', 'Sơn Tặc Lâu La', 'bandit', 'normal', 1, 3, { mat: 'mat_bandit_badge', skills: ['m_bite'] });
mob('bandit_archer', 'Sơn Tặc Cung Thủ', 'bandit', 'normal', 1, 5, { mat: 'mat_bandit_badge', skills: ['m_barrage'], ranged: true, scaling: 'atk', retreat: 0.2 });
mob('wolf_wind', 'Phong Lang', 'wolf', 'normal', 1, 6, { mat: 'mat_wolf_fang', capturable: 'pet_wolf', speed: 130, skills: ['m_bite', 'm_charge'] });
mob('bandit_captain', 'Sơn Tặc Đầu Mục', 'bandit', 'elite', 1, 8, { mat: 'mat_bandit_badge', skills: ['m_shadow', 'm_howl'] });
mob('boss_black_wind', 'Hắc Phong Trại Chủ', 'bandit', 'boss', 1, 9, { mat: 'mat_bandit_badge', skills: ['m_shadow', 'm_slam'], extraDrops: [{ item: 'set_hac_phong_weapon', chance: 0.15, min: 1, max: 1 }, { item: 'qi_bandit_map', chance: 1, min: 1, max: 1, questOnly: 'mq_2_04' }],
  phases: [ph(0.7, 'Trại chủ thổi tù và gọi thuộc hạ!', ['m_shadow', 'm_slam'], { summon: { monster: 'bandit_thug', count: 4 } }), ph(0.35, 'Hắc Phong Trại Chủ vận Hắc Phong Đao Pháp!', ['m_shadow', 'm_slam', 'm_barrage'], { enrage: 1.4, shieldPct: 0.1 })] });

mob('training_dummy', 'Mộc Nhân Luyện Công', 'golem', 'normal', 2, 1, { passive: true, speed: 0, size: [40, 70] });
mob('stone_golem_small', 'Thạch Khôi Lỗi', 'golem', 'normal', 2, 5, { mat: 'mat_iron_scrap', skills: ['m_slam'], speed: 60 });
mob('academy_rogue', 'Phản Đồ Học Viện', 'bandit', 'elite', 2, 8, { mat: 'mat_iron_scrap', skills: ['m_shadow'] });

mob('sword_spirit', 'Kiếm Linh', 'spirit', 'normal', 3, 4, { mat: 'mat_iron_scrap', flying: true, skills: ['m_shadow'], scaling: 'atk' });
mob('rusted_guard', 'Thiết Vệ Rỉ Sét', 'golem', 'normal', 3, 6, { mat: 'mat_iron_scrap', skills: ['m_slam'] });
mob('boss_ancient_sword', 'Cổ Kiếm Chi Hồn', 'spirit', 'boss', 3, 9, { mat: 'mat_iron_scrap', flying: true, skills: ['m_shadow', 'm_barrage'], extraDrops: [{ item: 'qi_sword_fragment', chance: 1, min: 1, max: 1, questOnly: 'mq_3_02' }, { item: 'set_hac_phong_armor', chance: 0.2, min: 1, max: 1 }],
  phases: [ph(0.66, 'Cổ kiếm phân thân thành vạn kiếm ảnh!', ['m_barrage', 'm_shadow', 'm_meteor']), ph(0.33, 'Kiếm hồn hộ thể bằng kiếm cương!', ['m_barrage', 'm_shadow', 'm_meteor'], { shieldPct: 0.15, enrage: 1.3 })] });

mob('tiger_stripe', 'Ban Lan Hổ', 'tiger', 'normal', 4, 4, { mat: 'mat_tiger_claw', capturable: 'pet_tiger', speed: 130, skills: ['m_bite', 'm_charge'] });
mob('snake_jade', 'Lục Ngọc Xà', 'snake', 'normal', 4, 6, { mat: 'mat_snake_venom', skills: ['m_spit'], element: 'doc' });
mob('ape_mountain', 'Sơn Viên', 'golem', 'elite', 4, 8, { mat: 'mat_beast_core', skills: ['m_slam', 'm_howl'] });
mob('rare_golden_fox', 'Kim Vĩ Linh Hồ', 'fox', 'rare', 4, 9, { mat: 'mat_fox_tail', capturable: 'pet_fox', speed: 160, skills: ['m_firebolt'], retreat: 0.3 });
mob('boss_beast_king', 'Yêu Thú Vương Bạch Ngạch', 'tiger', 'boss', 4, 9, { mat: 'mat_beast_core', skills: ['m_charge', 'm_slam', 'm_howl'], speed: 140,
  phases: [ph(0.6, 'Bạch Ngạch gầm vang, bầy hổ kéo đến!', ['m_charge', 'm_slam'], { summon: { monster: 'tiger_stripe', count: 2 } }), ph(0.3, 'Yêu Thú Vương cuồng bạo!', ['m_charge', 'm_slam', 'm_howl'], { enrage: 1.5, speedMult: 1.4 })] });

mob('herb_mantis', 'Dược Đường Lang', 'bird', 'normal', 5, 4, { mat: 'mat_snake_venom', skills: ['m_bite', 'm_shadow'] });
mob('poison_toad', 'Độc Thiềm', 'slime', 'normal', 5, 6, { mat: 'mat_snake_venom', skills: ['m_spit'], element: 'doc' });
mob('treant_old', 'Cổ Mộc Tinh', 'treant', 'elite', 5, 8, { mat: 'mat_treant_bark', skills: ['m_slam', 'm_heal'] });
mob('boss_poison_queen', 'Vạn Độc Tri Chu Hậu', 'snake', 'boss', 5, 9, { mat: 'mat_snake_venom', skills: ['m_spit', 'm_void_zone'], element: 'doc', scaling: 'matk',
  phases: [ph(0.6, 'Tri Chu Hậu nhả độc vụ khắp cốc!', ['m_spit', 'm_void_zone', 'm_barrage'], { summon: { monster: 'poison_toad', count: 3 } }), ph(0.3, 'Độc tố bao phủ thân thể Tri Chu Hậu!', ['m_void_zone', 'm_barrage', 'm_heal'], { shieldPct: 0.2 })] });

mob('sect_puppet', 'Thủ Sơn Khôi Lỗi', 'golem', 'normal', 6, 5, { mat: 'mat_iron_scrap', skills: ['m_slam'] });
mob('sword_crane', 'Kiếm Hạc', 'bird', 'normal', 6, 6, { mat: 'mat_thunder_feather', flying: true, skills: ['m_shadow'], capturable: 'pet_crane_young' });
mob('boss_sect_guardian', 'Hộ Sơn Kiếm Thú', 'tiger', 'guild_boss', 6, 9, { mat: 'mat_beast_core', skills: ['m_charge', 'm_slam', 'm_barrage'],
  phases: [ph(0.5, 'Hộ Sơn Kiếm Thú gọi kiếm trận!', ['m_barrage', 'm_meteor', 'm_charge'], { enrage: 1.3 }), ph(0.2, 'Kiếm Thú liều mạng!', ['m_barrage', 'm_meteor', 'm_charge', 'm_slam'], { enrage: 1.6, speedMult: 1.3 })] });

mob('ghost_wisp', 'U Hồn', 'spirit', 'normal', 7, 4, { mat: 'mat_bone_dust', flying: true, skills: ['m_icebolt'], scaling: 'matk', ranged: true });
mob('skeleton_warrior', 'Khô Lâu Chiến Sĩ', 'skeleton', 'normal', 7, 6, { mat: 'mat_bone_dust', skills: ['m_bite', 'm_shadow'] });
mob('ghost_general', 'Quỷ Tướng', 'skeleton', 'elite', 7, 8, { mat: 'mat_bone_dust', skills: ['m_shadow', 'm_freeze_nova'] });
mob('boss_ghost_king', 'U Minh Quỷ Vương', 'demon', 'boss', 7, 9, { mat: 'mat_bone_dust', skills: ['m_freeze_nova', 'm_void_zone', 'm_icebolt'], scaling: 'matk', extraDrops: [{ item: 'qi_ghost_lantern', chance: 1, min: 1, max: 1, questOnly: 'mq_4_03' }, { item: 'set_u_minh_armor', chance: 0.2, min: 1, max: 1 }],
  phases: [ph(0.7, 'Quỷ Vương triệu hồi oan hồn!', ['m_freeze_nova', 'm_icebolt'], { summon: { monster: 'ghost_wisp', count: 4 } }), ph(0.4, 'U Minh Quỷ Vương ẩn vào bóng tối — đánh tan khiên âm khí!', ['m_void_zone', 'm_freeze_nova', 'm_barrage'], { shieldPct: 0.25 }), ph(0.15, 'Quỷ Vương đốt cháy hồn phách!', ['m_void_zone', 'm_freeze_nova', 'm_meteor'], { enrage: 1.6 })] });

mob('war_ghost', 'Chiến Hồn', 'skeleton', 'normal', 8, 5, { mat: 'mat_war_relic', skills: ['m_shadow'] });
mob('war_beast', 'Chiến Thú Cổ', 'boar', 'elite', 8, 7, { mat: 'mat_war_relic', skills: ['m_charge', 'm_slam'] });
mob('world_boss_war_god', 'Cổ Chiến Thần Tàn Hồn', 'demon', 'world_boss', 8, 9, { mat: 'mat_war_relic', skills: ['m_meteor', 'm_slam', 'm_charge'], extraDrops: [{ item: 'set_co_kiem_weapon', chance: 0.3, min: 1, max: 1 }, { item: 'set_co_kiem_ring', chance: 0.3, min: 1, max: 1 }],
  phases: [ph(0.75, 'Chiến Thần gọi đội quân chiến hồn!', ['m_meteor', 'm_slam'], { summon: { monster: 'war_ghost', count: 6 } }), ph(0.5, 'Chiến Thần khoác giáp chiến hồn!', ['m_meteor', 'm_slam', 'm_charge'], { shieldPct: 0.1 }), ph(0.2, 'Cổ Chiến Thần bùng nổ sát khí cuối cùng!', ['m_meteor', 'm_slam', 'm_charge', 'm_void_zone'], { enrage: 1.8, speedMult: 1.3 })] });

// ===== Tu Chân Giới =====
mob('cloud_beast', 'Vân Thú', 'fox', 'normal', 10, 3, { mat: 'mat_beast_core', capturable: 'pet_fox', skills: ['m_bite', 'm_icebolt'] });
mob('spirit_eagle', 'Linh Ưng', 'bird', 'normal', 10, 6, { mat: 'mat_thunder_feather', flying: true, skills: ['m_shadow', 'm_barrage'] });
mob('rogue_cultivator', 'Tà Tu', 'bandit', 'elite', 10, 8, { mat: 'mat_spirit_essence', skills: ['m_firebolt', 'm_shield'], scaling: 'matk', ranged: true });
mob('treasure_mimic', 'Bảo Rương Yêu', 'slime', 'rare', 11, 6, { mat: 'mat_ancient_jade', skills: ['m_bite', 'm_slam'] });
mob('thunder_bird', 'Lôi Điểu', 'bird', 'normal', 12, 4, { mat: 'mat_thunder_feather', flying: true, skills: ['m_thunder'], scaling: 'matk', element: 'loi' });
mob('thunder_golem', 'Lôi Khôi', 'golem', 'elite', 12, 7, { mat: 'mat_thunder_feather', skills: ['m_thunder', 'm_slam'], element: 'loi' });
mob('boss_thunder_roc', 'Lôi Bằng Vương', 'bird', 'boss', 12, 9, { mat: 'mat_thunder_feather', flying: true, skills: ['m_thunder', 'm_barrage'], element: 'loi', scaling: 'matk', extraDrops: [{ item: 'set_loi_kiep_weapon', chance: 0.2, min: 1, max: 1 }, { item: 'qi_thunder_seal', chance: 1, min: 1, max: 1, questOnly: 'mq_5_03' }],
  phases: [ph(0.6, 'Lôi Bằng vỗ cánh, lôi vân phủ kín trời!', ['m_thunder', 'm_lightning_strike', 'm_barrage']), ph(0.3, 'Lôi Bằng Vương hóa thân lôi điện!', ['m_lightning_strike', 'm_thunder', 'm_meteor'], { enrage: 1.4, speedMult: 1.5 })] });
mob('ancient_guardian', 'Thượng Cổ Thủ Vệ', 'golem', 'normal', 13, 5, { mat: 'mat_ancient_jade', skills: ['m_slam', 'm_shield'] });
mob('ancient_serpent', 'Thượng Cổ Mãng', 'snake', 'elite', 13, 8, { mat: 'mat_ancient_jade', skills: ['m_spit', 'm_charge'] });
mob('demon_soldier', 'Ma Binh', 'demon', 'normal', 15, 4, { mat: 'mat_demon_horn', skills: ['m_shadow', 'm_firebolt'] });
mob('demon_sorcerer', 'Ma Pháp Sư', 'demon', 'normal', 15, 6, { mat: 'mat_demon_horn', skills: ['m_firebolt', 'm_void_zone'], scaling: 'matk', ranged: true, retreat: 0.25 });
mob('boss_demon_lord', 'Ma Vực Huyết Quân', 'demon', 'boss', 15, 9, { mat: 'mat_demon_horn', skills: ['m_void_zone', 'm_meteor', 'm_shadow'], scaling: 'matk', extraDrops: [{ item: 'set_ma_vuc_weapon', chance: 0.2, min: 1, max: 1 }, { item: 'qi_demon_seal', chance: 1, min: 1, max: 1, questOnly: 'mq_5_06' }],
  phases: [ph(0.7, 'Huyết Quân hút máu ma binh để hồi phục!', ['m_void_zone', 'm_heal', 'm_shadow'], { summon: { monster: 'demon_soldier', count: 4 } }), ph(0.4, 'Huyết Quân mở Huyết Hải Lĩnh Vực!', ['m_void_zone', 'm_meteor', 'm_barrage'], { shieldPct: 0.2 }), ph(0.15, 'Ma Vực Huyết Quân liều chết!', ['m_meteor', 'm_void_zone', 'm_shadow', 'm_barrage'], { enrage: 1.8 })] });
mob('void_walker', 'Hư Không Hành Giả', 'spirit', 'normal', 17, 5, { mat: 'mat_void_shard', flying: true, skills: ['m_void_zone', 'm_shadow'], scaling: 'matk' });
mob('world_boss_void_titan', 'Thiên Ngoại Cự Thần', 'demon', 'world_boss', 17, 9, { mat: 'mat_void_shard', skills: ['m_meteor', 'm_void_zone', 'm_slam', 'm_freeze_nova'], scaling: 'matk',
  phases: [ph(0.75, 'Cự Thần xé rách hư không!', ['m_meteor', 'm_void_zone'], { summon: { monster: 'void_walker', count: 6 } }), ph(0.45, 'Cự Thần dựng Hỗn Nguyên Cương Khí!', ['m_meteor', 'm_void_zone', 'm_freeze_nova'], { shieldPct: 0.15 }), ph(0.2, 'Thiên Ngoại Cự Thần cuồng nộ!', ['m_meteor', 'm_void_zone', 'm_slam', 'm_lightning_strike'], { enrage: 2, speedMult: 1.3 })] });

// ===== Tiên Giới =====
mob('celestial_crane', 'Tiên Hạc Hộ Đài', 'bird', 'normal', 19, 4, { mat: 'mat_immortal_cloud', flying: true, capturable: 'pet_crane', skills: ['m_icebolt', 'm_shadow'] });
mob('heaven_soldier', 'Thiên Binh', 'bandit', 'normal', 19, 7, { mat: 'mat_immortal_cloud', skills: ['m_shadow', 'm_shield'] });
mob('qilin_young', 'Ấu Kỳ Lân', 'tiger', 'rare', 21, 6, { mat: 'mat_star_core', capturable: 'pet_qilin', skills: ['m_firebolt', 'm_charge'] });
mob('star_spirit', 'Tinh Linh', 'spirit', 'normal', 21, 5, { mat: 'mat_star_core', flying: true, skills: ['m_barrage'], scaling: 'matk' });
mob('heaven_general', 'Thiên Tướng', 'bandit', 'elite', 25, 6, { mat: 'mat_star_core', skills: ['m_shadow', 'm_thunder', 'm_shield'] });
mob('boss_heaven_emperor_guard', 'Thiên Đế Ngự Tiền Kim Giáp', 'golem', 'boss', 25, 9, { mat: 'mat_star_core', skills: ['m_slam', 'm_thunder', 'm_shield'], extraDrops: [{ item: 'qi_immortal_edict', chance: 1, min: 1, max: 1, questOnly: 'mq_7_04' }, { item: 'set_tien_van_weapon', chance: 0.25, min: 1, max: 1 }],
  phases: [ph(0.6, 'Kim Giáp triệu Thiên Binh!', ['m_slam', 'm_thunder'], { summon: { monster: 'heaven_soldier', count: 4 } }), ph(0.3, 'Kim Giáp mở Thiên Cương Giáp!', ['m_slam', 'm_lightning_strike', 'm_meteor'], { shieldPct: 0.25, enrage: 1.5 })] });
mob('chaos_eel', 'Hỗn Độn Man', 'snake', 'normal', 28, 4, { mat: 'mat_chaos_scale', skills: ['m_spit', 'm_void_zone'] });
mob('chaos_beast', 'Hỗn Độn Thú', 'demon', 'elite', 28, 7, { mat: 'mat_chaos_scale', skills: ['m_void_zone', 'm_charge', 'm_meteor'] });
mob('world_boss_chaos_dragon', 'Hỗn Độn Cổ Long', 'dragon', 'world_boss', 28, 9, { mat: 'mat_chaos_scale', skills: ['m_meteor', 'm_freeze_nova', 'm_void_zone', 'm_lightning_strike'], scaling: 'matk', size: [180, 150], flying: true, extraDrops: [{ item: 'qi_chaos_heart', chance: 1, min: 1, max: 1, questOnly: 'mq_7_06' }, { item: 'set_hon_don_weapon', chance: 0.2, min: 1, max: 1 }],
  phases: [ph(0.8, 'Cổ Long phun hỗn độn khí!', ['m_meteor', 'm_void_zone'], { summon: { monster: 'chaos_eel', count: 5 } }), ph(0.5, 'Cổ Long phủ vảy hỗn độn!', ['m_freeze_nova', 'm_void_zone', 'm_meteor'], { shieldPct: 0.2 }), ph(0.2, 'Hỗn Độn Cổ Long khai thiên tích địa!', ['m_lightning_strike', 'm_meteor', 'm_void_zone', 'm_freeze_nova'], { enrage: 2, speedMult: 1.4 })] });

// ===== Phó bản / thử thách / sự kiện =====
mob('dg_bandit_elite', 'Hắc Phong Tử Sĩ', 'bandit', 'elite', 2, 5, { mat: 'mat_bandit_badge', skills: ['m_shadow', 'm_charge'] });
mob('dg_boss_bandit_lord', 'Hắc Phong Lão Tổ', 'bandit', 'dungeon_boss', 2, 9, { mat: 'mat_bandit_badge', skills: ['m_shadow', 'm_slam', 'm_barrage'], extraDrops: [{ item: 'set_hac_phong_helmet', chance: 0.4, min: 1, max: 1 }, { item: 'set_hac_phong_boots', chance: 0.4, min: 1, max: 1 }],
  phases: [ph(0.5, 'Lão Tổ vận Hắc Phong Thần Công — tránh xa lốc xoáy!', ['m_void_zone', 'm_shadow', 'm_slam'], { summon: { monster: 'dg_bandit_elite', count: 2 }, enrage: 1.3 })] });
mob('dg_ghost', 'Oán Linh', 'spirit', 'elite', 7, 6, { mat: 'mat_bone_dust', flying: true, skills: ['m_icebolt', 'm_freeze_nova'], scaling: 'matk' });
mob('dg_boss_ghost_mother', 'Quỷ Mẫu', 'demon', 'dungeon_boss', 7, 9, { mat: 'mat_bone_dust', skills: ['m_freeze_nova', 'm_void_zone'], scaling: 'matk', extraDrops: [{ item: 'set_u_minh_helmet', chance: 0.4, min: 1, max: 1 }, { item: 'set_u_minh_boots', chance: 0.4, min: 1, max: 1 }, { item: 'set_u_minh_artifact', chance: 0.3, min: 1, max: 1 }],
  phases: [ph(0.6, 'Quỷ Mẫu sinh ra oán linh!', ['m_freeze_nova', 'm_void_zone'], { summon: { monster: 'dg_ghost', count: 3 } }), ph(0.25, 'Quỷ Mẫu than khóc — âm khí đóng băng mọi thứ!', ['m_freeze_nova', 'm_void_zone', 'm_barrage'], { enrage: 1.5, shieldPct: 0.15 })] });
mob('dg_ancient_construct', 'Thượng Cổ Khôi Lỗi', 'golem', 'elite', 13, 6, { mat: 'mat_ancient_jade', skills: ['m_slam', 'm_thunder'] });
mob('dg_boss_ancient_beast', 'Thượng Cổ Thao Thiết', 'dragon', 'dungeon_boss', 13, 9, { mat: 'mat_ancient_jade', skills: ['m_charge', 'm_meteor', 'm_slam'], size: [150, 130], extraDrops: [{ item: 'qi_ancient_scroll', chance: 1, min: 1, max: 1, questOnly: 'mq_5_05' }, { item: 'set_loi_kiep_armor', chance: 0.35, min: 1, max: 1 }],
  phases: [ph(0.6, 'Thao Thiết nuốt chửng linh khí — đánh vỡ khiên!', ['m_charge', 'm_meteor'], { shieldPct: 0.25 }), ph(0.3, 'Thao Thiết cuồng thực!', ['m_charge', 'm_meteor', 'm_slam', 'm_void_zone'], { enrage: 1.6, speedMult: 1.3 })] });
mob('dg_immortal_shade', 'Tiên Ảnh', 'spirit', 'elite', 21, 6, { mat: 'mat_immortal_cloud', flying: true, skills: ['m_barrage', 'm_shadow'] });
mob('dg_boss_fallen_immortal', 'Đọa Tiên', 'demon', 'dungeon_boss', 21, 9, { mat: 'mat_star_core', skills: ['m_meteor', 'm_freeze_nova', 'm_shadow'], scaling: 'matk', extraDrops: [{ item: 'set_tien_van_armor', chance: 0.35, min: 1, max: 1 }, { item: 'set_tien_van_helmet', chance: 0.35, min: 1, max: 1 }],
  phases: [ph(0.5, 'Đọa Tiên thức tỉnh tiên lực cuối cùng!', ['m_meteor', 'm_freeze_nova', 'm_lightning_strike'], { summon: { monster: 'dg_immortal_shade', count: 3 }, enrage: 1.4 })] });
// Tâm ma: chỉ số được scale theo người chơi khi sinh ra (xem server/trial)
mob('trial_inner_demon', 'Tâm Ma', 'shadow_self', 'elite', 0, 1, { skills: ['m_shadow', 'm_barrage', 'm_heal'], size: [26, 58] });
mob('event_lantern_beast', 'Niên Thú Đèn Lồng', 'tiger', 'event_boss', 3, 9, { mat: 'mat_beast_core', skills: ['m_firebolt', 'm_charge', 'm_barrage'], extraDrops: [{ item: 'ev_lantern', chance: 1, min: 3, max: 8 }, { item: 'ev_mooncake', chance: 1, min: 2, max: 5 }],
  phases: [ph(0.5, 'Niên Thú phun pháo hoa khắp nơi!', ['m_barrage', 'm_meteor'], { enrage: 1.3 })] });
mob('guild_boss_ancient_tree', 'Thụ Yêu Thiên Niên', 'treant', 'guild_boss', 10, 9, { mat: 'mat_treant_bark', skills: ['m_slam', 'm_spit', 'm_heal'],
  phases: [ph(0.6, 'Thụ Yêu cắm rễ hồi phục — tiêu diệt rễ con!', ['m_slam', 'm_heal', 'm_void_zone'], { summon: { monster: 'bamboo_sprite', count: 5 } }), ph(0.25, 'Thụ Yêu bốc cháy linh hỏa!', ['m_slam', 'm_meteor', 'm_void_zone'], { enrage: 1.6 })] });

export const MONSTERS = monsters;

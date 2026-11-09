import type { ProfessionId, RecipeDef } from '../types.js';
import { herbForRealm, oreForRealm } from './realms.js';

const recipes: Record<string, RecipeDef> = {};
function r(id: string, name: string, profession: ProfessionId, level: number, inputs: [string, number][], output: [string, number], seconds: number, extra: Partial<RecipeDef> = {}): void {
  if (recipes[id]) throw new Error('dup recipe ' + id);
  recipes[id] = { id, name, profession, level, inputs: inputs.map(([item, qty]) => ({ item, qty })), output: { item: output[0], qty: output[1] }, seconds, exp: Math.round(15 + level * level * 1.5), successRate: 0.9, gold: Math.round(10 * Math.pow(1.35, level / 2)), toolRequired: true, ...extra };
}
export const PROFESSION_NAMES: Record<ProfessionId, string> = {
  alchemy: 'Luyện Đan', forging: 'Luyện Khí', talisman: 'Chế Phù', formation: 'Trận Pháp', mining: 'Khai Khoáng', herbalism: 'Hái Thuốc', fishing: 'Câu Cá', farming: 'Trồng Linh Thảo', tailoring: 'Chế Tạo Trang Bị',
};

// ---- Luyện đan ----
for (let i = 1; i <= 5; i++) {
  const t = Math.min(7, i + Math.floor(i / 3));
  r(`rc_pill_hp_${i}`, `Luyện ${'Hồi Xuân,Bổ Huyết,Ngọc Lộ,Hoàn Nguyên,Cửu Chuyển'.split(',')[i - 1]} Đan`, 'alchemy', (i - 1) * 10, [[`herb_t${t}`, 2], [`fish_t${Math.min(7, t)}`, 1]], [`pill_hp_${i}`, 3], 4 + i * 2);
  r(`rc_pill_mp_${i}`, `Luyện ${'Tụ Khí,Ngưng Thần,Thanh Tâm,Linh Nguyên,Tiên Linh'.split(',')[i - 1]} Đan`, 'alchemy', (i - 1) * 10, [[`herb_t${t}`, 3]], [`pill_mp_${i}`, 3], 4 + i * 2);
}
for (let i = 1; i <= 6; i++) r(`rc_pill_tuvi_${i}`, `Luyện Đan Tu Vi bậc ${i}`, 'alchemy', 3 + (i - 1) * 10, [[`herb_t${Math.min(7, i + 1)}`, 4], [`ore_t${Math.min(7, i)}`, 1]], [`pill_tuvi_${i}`, 1], 8 + i * 4);
for (let i = 1; i <= 29; i++) r(`rc_pill_bt_${i}`, `Luyện Đan Đột Phá bậc ${i}`, 'alchemy', Math.min(60, Math.floor(i * 2)), [[herbForRealm(i), 5 + Math.floor(i / 2)], [oreForRealm(i), 2], [i >= 10 ? 'mat_spirit_essence' : 'mat_beast_core', i >= 4 ? 1 : 0]].filter(([, q]) => (q as number) > 0) as [string, number][], [`pill_bt_${i}`, 1], 15 + i * 3, { successRate: Math.max(0.5, 0.92 - i * 0.012) });
r('rc_pill_bt_assist', 'Luyện Hộ Mạch Đan', 'alchemy', 12, [['herb_t2', 4], ['mat_beast_core', 1]], ['pill_bt_assist', 1], 20, { successRate: 0.75 });
r('rc_pill_cleanse', 'Luyện Giải Độc Đan', 'alchemy', 2, [['herb_t1', 2], ['mat_snake_venom', 1]], ['pill_cleanse', 2], 6);
r('rc_pill_atk', 'Luyện Cuồng Lực Đan', 'alchemy', 6, [['herb_t2', 2], ['mat_wolf_fang', 2]], ['pill_atk', 2], 10);
r('rc_pill_def', 'Luyện Kim Cương Đan', 'alchemy', 6, [['herb_t2', 2], ['mat_boar_hide', 2]], ['pill_def', 2], 10);
r('rc_pill_marrow', 'Luyện Tẩy Tủy Đan', 'alchemy', 20, [['herb_t3', 6], ['mat_beast_core', 3], ['fish_t3', 2]], ['pill_marrow', 1], 40, { successRate: 0.6 });
r('rc_pet_food_2', 'Chế Yêu Đan Phấn', 'alchemy', 8, [['mat_beast_core', 1], ['fish_t2', 2]], ['pet_food_2', 2], 8);

// ---- Luyện khí (vũ khí, pháp bảo, ngọc) ----
for (let lv = 0; lv < 29; lv += 2) {
  r(`rc_eq_weapon_${lv}`, `Rèn vũ khí cảnh giới ${lv}`, 'forging', lv * 2, [[oreForRealm(lv), 4 + lv], [herbForRealm(lv), 1]], [`eq_weapon_${lv}`, 1], 10 + lv * 2);
  r(`rc_eq_artifact_${lv}`, `Luyện pháp bảo cảnh giới ${lv}`, 'forging', lv * 2 + 2, [[oreForRealm(lv), 3 + lv], ['stone_enhance', 2]], [`eq_artifact_${lv}`, 1], 12 + lv * 2);
  r(`rc_eq_ring_${lv}`, `Luyện nhẫn cảnh giới ${lv}`, 'forging', lv * 2 + 1, [[oreForRealm(lv), 3 + lv]], [`eq_ring_${lv}`, 1], 10 + lv * 2);
}
for (const g of ['ruby', 'sapphire', 'emerald', 'topaz', 'onyx']) for (let t = 1; t < 5; t++) r(`rc_gem_${g}_${t + 1}`, `Ghép ngọc ${g} cấp ${t + 1}`, 'forging', t * 8, [[`gem_${g}_${t}`, 3]], [`gem_${g}_${t + 1}`, 1], 6, { successRate: 1, toolRequired: false });
r('rc_stone_socket', 'Rèn Khai Khổng Chùy', 'forging', 5, [['ore_t2', 4], ['stone_enhance', 1]], ['stone_socket', 1], 10);
r('rc_stone_enhance', 'Tinh luyện Cường Hóa Thạch', 'forging', 0, [['ore_t1', 3]], ['stone_enhance', 1], 3, { successRate: 1 });
// ---- Chế tạo trang bị (giáp, mũ, giày, dây chuyền, nội thất, thời trang) ----
for (let lv = 0; lv < 29; lv += 2) {
  r(`rc_eq_armor_${lv}`, `May giáp cảnh giới ${lv}`, 'tailoring', lv * 2, [['mat_silk', 3 + lv], [oreForRealm(lv), 2 + lv]], [`eq_armor_${lv}`, 1], 10 + lv * 2);
  r(`rc_eq_helmet_${lv}`, `Chế mũ cảnh giới ${lv}`, 'tailoring', lv * 2, [['mat_silk', 2 + lv], [oreForRealm(lv), 1 + lv]], [`eq_helmet_${lv}`, 1], 8 + lv * 2);
  r(`rc_eq_boots_${lv}`, `Chế giày cảnh giới ${lv}`, 'tailoring', lv * 2, [['mat_silk', 2 + lv], ['mat_boar_hide', 1]], [`eq_boots_${lv}`, 1], 8 + lv * 2);
  r(`rc_eq_amulet_${lv}`, `Chế ngọc bội cảnh giới ${lv}`, 'tailoring', lv * 2 + 1, [['mat_silk', 1 + lv], [herbForRealm(lv), 2]], [`eq_amulet_${lv}`, 1], 8 + lv * 2);
}
r('rc_furn_table', 'Đóng Bàn Trà', 'tailoring', 2, [['mat_wood', 8]], ['furn_table', 1], 8, { toolRequired: false });
r('rc_furn_lamp', 'Chế Đèn Lưu Ly', 'tailoring', 4, [['mat_wood', 4], ['ore_t1', 3]], ['furn_lamp', 1], 8, { toolRequired: false });
r('rc_furn_cushion', 'May Bồ Đoàn Tụ Linh', 'tailoring', 8, [['mat_silk', 6], ['herb_t2', 2]], ['furn_cushion', 1], 12, { toolRequired: false });
r('rc_furn_screen', 'Chế Bình Phong', 'tailoring', 10, [['mat_wood', 10], ['mat_silk', 6]], ['furn_screen', 1], 15, { toolRequired: false });
r('rc_furn_bonsai', 'Trồng Linh Tùng Bồn Cảnh', 'tailoring', 12, [['mat_wood', 6], ['herb_t3', 2]], ['furn_bonsai', 1], 15, { toolRequired: false });
r('rc_furn_cauldron', 'Đúc Đỉnh Đồng', 'tailoring', 18, [['ore_t3', 10]], ['furn_cauldron', 1], 20, { toolRequired: false });
r('rc_fashion_black', 'May Hắc Bào', 'tailoring', 15, [['mat_silk', 20], ['mat_spirit_essence', 2]], ['fashion_black_robe', 1], 30);
// ---- Chế phù ----
r('rc_tal_return', 'Vẽ Hồi Thành Phù', 'talisman', 0, [['mat_paper', 1], ['mat_cinnabar', 1]], ['tal_return', 2], 3);
r('rc_tal_speed', 'Vẽ Thần Hành Phù', 'talisman', 3, [['mat_paper', 1], ['mat_cinnabar', 1], ['mat_wolf_fang', 1]], ['tal_speed', 2], 4);
r('rc_tal_shield', 'Vẽ Kim Quang Phù', 'talisman', 8, [['mat_paper', 2], ['mat_cinnabar', 2], ['ore_t2', 1]], ['tal_shield', 2], 6);
r('rc_tal_capture_1', 'Vẽ Thu Hồn Phù', 'talisman', 2, [['mat_paper', 1], ['mat_cinnabar', 2], ['mat_fox_tail', 1]], ['tal_capture_1', 1], 5);
r('rc_tal_capture_2', 'Vẽ Khốn Thú Phù', 'talisman', 15, [['mat_paper', 2], ['mat_cinnabar', 3], ['mat_beast_core', 1]], ['tal_capture_2', 1], 8);
r('rc_tal_capture_3', 'Vẽ Ngự Linh Tiên Phù', 'talisman', 40, [['mat_paper', 3], ['mat_cinnabar', 5], ['mat_immortal_cloud', 1]], ['tal_capture_3', 1], 15);
// ---- Trận pháp ----
r('rc_formation_flag', 'Luyện Trận Kỳ', 'formation', 0, [['mat_wood', 4], ['mat_silk', 2], ['herb_t1', 2]], ['mat_formation_flag', 1], 10);
r('rc_furn_statue', 'Khắc Tượng Tổ Sư (trận nhãn)', 'formation', 20, [['ore_t4', 15], ['mat_formation_flag', 3]], ['furn_statue', 1], 40);
r('rc_stone_refine', 'Trận luyện Tinh Luyện Phấn', 'formation', 6, [['ore_t2', 3], ['mat_spirit_essence', 1]], ['stone_refine', 1], 12);
r('rc_stone_reroll', 'Trận luyện Tẩy Luyện Thạch', 'formation', 16, [['ore_t3', 4], ['mat_beast_core', 2]], ['stone_reroll', 1], 20);

export const RECIPES = recipes;

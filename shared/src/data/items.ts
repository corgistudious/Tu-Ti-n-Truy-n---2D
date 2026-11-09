import type { EquipSlot } from '../constants.js';
import { equipmentBaseStats } from '../formulas.js';
import type { ItemDef, ItemType, PartialStats, SetDef } from '../types.js';
import { REALMS } from './realms.js';

const items: Record<string, ItemDef> = {};

function add(d: Partial<ItemDef> & Pick<ItemDef, 'id' | 'name' | 'type'>): ItemDef {
  const stackable = d.stackable ?? !['weapon', 'armor', 'helmet', 'boots', 'ring', 'amulet', 'artifact', 'fashion', 'mount', 'tool', 'pet_gear'].includes(d.type);
  const item: ItemDef = {
    desc: '', icon: `icon_${d.type}`, rarity: 0, reqRealm: 0, stackable, maxStack: stackable ? 9999 : 1,
    value: 1, tradable: true, sources: [], ...d,
  } as ItemDef;
  if (items[item.id]) throw new Error(`duplicate item ${item.id}`);
  items[item.id] = item;
  return item;
}

export function rarityForRealm(r: number): number {
  if (r <= 2) return 0; if (r <= 5) return 1; if (r <= 9) return 2; if (r <= 12) return 3; if (r <= 15) return 4;
  if (r <= 18) return 5; if (r <= 21) return 6; if (r <= 24) return 7; if (r <= 27) return 8; return 9;
}

// ---------- Nguyên liệu theo bậc ----------
const HERBS = ['Thanh Linh Thảo', 'Huyết Sâm', 'Tử Vân Chi', 'Ngọc Tủy Liên', 'Long Diên Thảo', 'Tiên Linh Quả', 'Hỗn Nguyên Hoa'];
const ORES = ['Thiết Tinh', 'Hàn Thiết', 'Xích Đồng', 'Huyền Thiết', 'Tinh Thần Sa', 'Tiên Kim', 'Hỗn Độn Thạch'];
const FISH = ['Cá Chép Bạc', 'Linh Ngư', 'Hàn Băng Ngư', 'Kim Lân Ngư', 'Long Ngư', 'Tiên Hà Ngư', 'Hỗn Độn Kình'];
HERBS.forEach((n, i) => add({ id: `herb_t${i + 1}`, name: n, type: 'herb', rarity: Math.min(9, i + Math.floor(i / 2)), reqRealm: 0, value: 5 * Math.pow(3, i), desc: `Linh thảo bậc ${i + 1}, nguyên liệu luyện đan và đột phá.`, icon: `icon_herb_${i + 1}`, sources: ['Hái thuốc', 'Trồng ở linh điền', 'Quái vật'] }));
ORES.forEach((n, i) => add({ id: `ore_t${i + 1}`, name: n, type: 'ore', rarity: Math.min(9, i + Math.floor(i / 2)), value: 6 * Math.pow(3, i), desc: `Khoáng thạch bậc ${i + 1}, dùng luyện khí và rèn trang bị.`, icon: `icon_ore_${i + 1}`, sources: ['Khai khoáng', 'Quái vật'] }));
FISH.forEach((n, i) => add({ id: `fish_t${i + 1}`, name: n, type: 'material', rarity: Math.min(9, i + 1), value: 8 * Math.pow(3, i), desc: `Cá linh bậc ${i + 1}, nguyên liệu đan dược và thức ăn linh thú.`, icon: `icon_fish_${i + 1}`, sources: ['Câu cá'] }));

// ---------- Vật liệu quái ----------
const MOB_MATS: [string, string, number][] = [
  ['mat_slime_gel', 'Dịch Nhầy Linh', 0], ['mat_wolf_fang', 'Nanh Sói Đen', 0], ['mat_boar_hide', 'Da Heo Rừng', 0],
  ['mat_bandit_badge', 'Huy Hiệu Sơn Tặc', 1], ['mat_bamboo_core', 'Trúc Tâm', 0], ['mat_spirit_essence', 'Hồn Tinh', 2],
  ['mat_iron_scrap', 'Mảnh Sắt Cổ Kiếm', 1], ['mat_beast_core', 'Yêu Đan', 2], ['mat_snake_venom', 'Nọc Rắn Lục', 1],
  ['mat_bone_dust', 'Cốt Phấn U Minh', 2], ['mat_war_relic', 'Tàn Binh Cổ', 3], ['mat_thunder_feather', 'Lôi Vũ', 3],
  ['mat_demon_horn', 'Ma Giác', 4], ['mat_ancient_jade', 'Thượng Cổ Ngọc', 4], ['mat_void_shard', 'Hư Không Phiến', 5],
  ['mat_immortal_cloud', 'Tiên Vân Ti', 6], ['mat_star_core', 'Tinh Hạch', 7], ['mat_chaos_scale', 'Hỗn Độn Lân', 8],
  ['mat_fox_tail', 'Linh Hồ Vĩ', 2], ['mat_tiger_claw', 'Hổ Trảo', 3], ['mat_treant_bark', 'Mộc Linh Bì', 1],
];
MOB_MATS.forEach(([id, name, r]) => add({ id, name, type: 'material', rarity: r, value: 10 * Math.pow(2.5, r), desc: 'Vật liệu thu được từ yêu thú, dùng chế tạo và nhiệm vụ.', icon: `icon_${id}`, sources: ['Quái vật'] }));

// ---------- Đan dược ----------
const HP_PILLS: [string, number, number][] = [['Hồi Xuân Đan', 0, 0.25], ['Bổ Huyết Đan', 3, 0.3], ['Ngọc Lộ Đan', 8, 0.35], ['Hoàn Nguyên Đan', 12, 0.4], ['Cửu Chuyển Hoàn Hồn Đan', 19, 0.5]];
HP_PILLS.forEach(([n, r, pct], i) => add({ id: `pill_hp_${i + 1}`, name: n, type: 'pill', rarity: rarityForRealm(r), reqRealm: r, value: 12 * Math.pow(4, i), desc: `Hồi ${pct * 100}% sinh lực tối đa.`, use: { kind: 'heal', hp: pct, pct: true }, cooldown: 6, icon: 'icon_pill_red', sources: ['Cửa hàng', 'Luyện đan'] }));
const MP_PILLS: [string, number, number][] = [['Tụ Khí Đan', 0, 0.3], ['Ngưng Thần Đan', 3, 0.35], ['Thanh Tâm Đan', 8, 0.4], ['Linh Nguyên Đan', 12, 0.45], ['Tiên Linh Đan', 19, 0.55]];
MP_PILLS.forEach(([n, r, pct], i) => add({ id: `pill_mp_${i + 1}`, name: n, type: 'pill', rarity: rarityForRealm(r), reqRealm: r, value: 10 * Math.pow(4, i), desc: `Hồi ${pct * 100}% chân khí tối đa.`, use: { kind: 'heal', mp: pct, pct: true }, cooldown: 6, icon: 'icon_pill_blue', sources: ['Cửa hàng', 'Luyện đan'] }));
const TUVI_PILLS: [string, number, number][] = [['Tẩy Cân Đan', 0, 120], ['Dưỡng Khí Đan', 4, 2500], ['Trúc Cơ Linh Dịch', 10, 60000], ['Kim Nguyên Đan', 14, 900000], ['Tiên Nguyên Đan', 20, 2.5e7], ['Hỗn Nguyên Đan', 26, 4e8]];
TUVI_PILLS.forEach(([n, r, amt], i) => add({ id: `pill_tuvi_${i + 1}`, name: n, type: 'pill', rarity: rarityForRealm(r), reqRealm: r, value: 40 * Math.pow(5, i), desc: `Luyện hóa nhận ${amt.toLocaleString('vi-VN')} tu vi.`, use: { kind: 'tuvi', amount: amt }, cooldown: 3, icon: 'icon_pill_gold', sources: ['Luyện đan', 'Nhiệm vụ', 'Boss'] }));
// đan đột phá — mỗi cảnh giới một loại
const BT_PREFIX = ['', 'Nhập Môn', 'Luyện Cốt', 'Nội Kình', 'Ám Kình', 'Hóa Kình', 'Tiên Thiên', 'Tông Sư', 'Đại Tông Sư', 'Đế Võ', 'Dẫn Khí', 'Trúc Cơ', 'Kết Đan', 'Phá Anh', 'Hóa Thần', 'Phản Hư', 'Hợp Thể', 'Đại Thừa', 'Độ Ách', 'Phi Thăng', 'Địa Mạch', 'Cửu Thiên', 'Chân Linh', 'Huyền Diệu', 'Kim Thân', 'Đại La', 'Quân Lâm', 'Vương Đạo', 'Đế Tâm', 'Hỗn Độn'];
for (let i = 1; i <= 29; i++) {
  add({ id: `pill_bt_${i}`, name: `${BT_PREFIX[i]} Đan`, type: 'pill', rarity: rarityForRealm(i), reqRealm: Math.max(0, i - 1), value: Math.round(50 * Math.pow(1.7, i)), desc: `Đan dược cần thiết để đột phá lên cảnh giới ${REALMS[Math.min(i, REALMS.length - 1)].name}${i >= 29 ? ' và Hỗn Độn' : ''}. Tiêu hao khi đột phá.`, icon: 'icon_pill_purple', sources: ['Luyện đan', 'Boss', 'Cửa hàng tông môn'] });
}
add({ id: 'pill_bt_assist', name: 'Hộ Mạch Đan', type: 'pill', rarity: 3, reqRealm: 2, value: 800, desc: 'Mang trong túi khi đột phá: +10% tỉ lệ thành công (tiêu hao 1 viên).', icon: 'icon_pill_green', sources: ['Luyện đan', 'Vạn Bảo Các'] });
add({ id: 'pill_atk', name: 'Cuồng Lực Đan', type: 'pill', rarity: 2, value: 120, desc: 'Tăng 15% công trong 5 phút.', use: { kind: 'buff', buff: 'atk_up', duration: 300, stats: {} }, cooldown: 30, icon: 'icon_pill_orange' });
add({ id: 'pill_def', name: 'Kim Cương Đan', type: 'pill', rarity: 2, value: 120, desc: 'Tăng 15% phòng thủ trong 5 phút.', use: { kind: 'buff', buff: 'def_up', duration: 300, stats: {} }, cooldown: 30, icon: 'icon_pill_gray' });
add({ id: 'pill_cleanse', name: 'Giải Độc Đan', type: 'pill', rarity: 1, value: 40, desc: 'Giải trừ các hiệu ứng xấu.', use: { kind: 'cleanse' }, cooldown: 10, icon: 'icon_pill_green' });
add({ id: 'pill_marrow', name: 'Tẩy Tủy Đan', type: 'pill', rarity: 4, reqRealm: 3, value: 3000, desc: 'Vĩnh viễn +2% sinh lực và công (tối đa 10 viên).', use: { kind: 'permanent_stat', stats: { maxHp: 0.02, atk: 0.02, matk: 0.02 }, maxUses: 10 }, icon: 'icon_pill_white' });

// ---------- Phù lục ----------
add({ id: 'tal_return', name: 'Hồi Thành Phù', type: 'talisman', rarity: 0, value: 30, desc: 'Dịch chuyển về thành gần nhất (Thanh Vân Thành / Thiên Huyền Thành / Cửu Thiên Tiên Thành).', use: { kind: 'teleport', map: 'nearest_city' }, cooldown: 30, icon: 'icon_talisman' });
add({ id: 'tal_capture_1', name: 'Thu Hồn Phù', type: 'talisman', rarity: 1, value: 80, desc: 'Thu phục linh thú khi sinh lực dưới 30%. Sức mạnh: thấp.', use: { kind: 'capture', power: 0.35 }, icon: 'icon_talisman_capture' });
add({ id: 'tal_capture_2', name: 'Khốn Thú Phù', type: 'talisman', rarity: 3, reqRealm: 6, value: 600, desc: 'Thu phục linh thú. Sức mạnh: trung.', use: { kind: 'capture', power: 0.55 }, icon: 'icon_talisman_capture' });
add({ id: 'tal_capture_3', name: 'Ngự Linh Tiên Phù', type: 'talisman', rarity: 6, reqRealm: 19, value: 9000, desc: 'Thu phục linh thú. Sức mạnh: cao.', use: { kind: 'capture', power: 0.8 }, icon: 'icon_talisman_capture' });
add({ id: 'tal_shield', name: 'Kim Quang Phù', type: 'talisman', rarity: 2, value: 150, desc: 'Tạo khiên hấp thụ 20% sinh lực tối đa trong 10 giây.', use: { kind: 'buff', buff: 'shield', duration: 10, stats: {} }, cooldown: 20, icon: 'icon_talisman_gold' });
add({ id: 'tal_speed', name: 'Thần Hành Phù', type: 'talisman', rarity: 1, value: 60, desc: 'Tăng 25% tốc độ trong 60 giây.', use: { kind: 'buff', buff: 'speed_up', duration: 60, stats: {} }, cooldown: 30, icon: 'icon_talisman' });

// ---------- Cường hóa / ngọc ----------
add({ id: 'stone_enhance', name: 'Cường Hóa Thạch', type: 'material', rarity: 1, value: 50, desc: 'Nguyên liệu cường hóa trang bị.', icon: 'icon_stone_blue', sources: ['Quái vật', 'Cửa hàng'] });
add({ id: 'stone_refine', name: 'Tinh Luyện Phấn', type: 'material', rarity: 2, value: 150, desc: 'Nguyên liệu tinh luyện trang bị.', icon: 'icon_powder', sources: ['Phân giải', 'Boss'] });
add({ id: 'stone_reroll', name: 'Tẩy Luyện Thạch', type: 'material', rarity: 3, value: 400, desc: 'Tẩy luyện lại thuộc tính phụ của trang bị.', icon: 'icon_stone_purple', sources: ['Boss', 'Vạn Bảo Các'] });
add({ id: 'stone_socket', name: 'Khai Khổng Chùy', type: 'material', rarity: 2, value: 300, desc: 'Mở lỗ khảm ngọc trên trang bị.', icon: 'icon_hammer' });
const GEMS: [string, string, keyof PartialStats, number][] = [['gem_ruby', 'Xích Ngọc', 'atk', 1], ['gem_sapphire', 'Lam Ngọc', 'matk', 1], ['gem_emerald', 'Bích Ngọc', 'maxHp', 6], ['gem_topaz', 'Hoàng Ngọc', 'def', 0.8], ['gem_onyx', 'Hắc Ngọc', 'crit', 0.004]];
GEMS.forEach(([id, name, stat, v]) => {
  for (let t = 1; t <= 5; t++) add({ id: `${id}_${t}`, name: `${name} cấp ${t}`, type: 'gem', rarity: t + 1, reqRealm: (t - 1) * 5, value: 100 * Math.pow(4, t), desc: `Khảm vào trang bị: +${stat}.`, icon: `icon_${id}`, gemStat: { stat: stat as never, value: stat === 'crit' ? v * t : Math.round(v * 20 * Math.pow(3.2, t - 1)) }, sources: ['Boss', 'Khai khoáng', 'Ghép ngọc'] });
});

// ---------- Công cụ nghề ----------
const TOOL_T = ['Đồng', 'Sắt', 'Huyền Thiết', 'Tinh Kim', 'Tiên Kim'];
TOOL_T.forEach((n, i) => {
  add({ id: `tool_pick_${i + 1}`, name: `Cuốc ${n}`, type: 'tool', rarity: i, reqRealm: i * 5, value: 50 * Math.pow(5, i), toolFor: 'mining', toolPower: i + 1, desc: 'Công cụ khai khoáng. Đặt trong túi khi đào.', icon: 'icon_pickaxe' });
  add({ id: `tool_sickle_${i + 1}`, name: `Liềm ${n}`, type: 'tool', rarity: i, reqRealm: i * 5, value: 50 * Math.pow(5, i), toolFor: 'herbalism', toolPower: i + 1, desc: 'Công cụ hái thuốc.', icon: 'icon_sickle' });
  add({ id: `tool_rod_${i + 1}`, name: `Cần Câu ${n}`, type: 'tool', rarity: i, reqRealm: i * 5, value: 50 * Math.pow(5, i), toolFor: 'fishing', toolPower: i + 1, desc: 'Công cụ câu cá.', icon: 'icon_rod' });
  add({ id: `tool_furnace_${i + 1}`, name: `Đan Lô ${n}`, type: 'tool', rarity: i, reqRealm: i * 5, value: 80 * Math.pow(5, i), toolFor: 'alchemy', toolPower: i + 1, desc: 'Lò luyện đan. Tăng tỉ lệ thành công.', icon: 'icon_furnace' });
  add({ id: `tool_hammer_${i + 1}`, name: `Búa Rèn ${n}`, type: 'tool', rarity: i, reqRealm: i * 5, value: 80 * Math.pow(5, i), toolFor: 'forging', toolPower: i + 1, desc: 'Búa luyện khí/rèn đúc.', icon: 'icon_hammer' });
});
add({ id: 'tool_brush', name: 'Phù Bút', type: 'tool', rarity: 1, value: 120, toolFor: 'talisman', toolPower: 1, desc: 'Bút vẽ phù.', icon: 'icon_brush' });
add({ id: 'tool_compass', name: 'La Bàn Trận', type: 'tool', rarity: 2, value: 200, toolFor: 'formation', toolPower: 1, desc: 'La bàn bố trận.', icon: 'icon_compass' });
add({ id: 'tool_needle', name: 'Kim Chỉ Linh Tằm', type: 'tool', rarity: 1, value: 120, toolFor: 'tailoring', toolPower: 1, desc: 'Dụng cụ may trang phục.', icon: 'icon_needle' });
add({ id: 'mat_paper', name: 'Hoàng Phù Chỉ', type: 'material', rarity: 0, value: 4, desc: 'Giấy vẽ phù.', icon: 'icon_paper' });
add({ id: 'mat_cinnabar', name: 'Chu Sa', type: 'material', rarity: 1, value: 10, desc: 'Mực đỏ vẽ phù.', icon: 'icon_cinnabar' });
add({ id: 'mat_silk', name: 'Linh Tằm Ti', type: 'material', rarity: 1, value: 12, desc: 'Tơ may trang phục.', icon: 'icon_silk' });
add({ id: 'mat_formation_flag', name: 'Trận Kỳ', type: 'material', rarity: 2, value: 200, desc: 'Cờ trận — vật liệu xây Tụ Linh Trận trong động phủ.', icon: 'icon_flag' });
add({ id: 'mat_wood', name: 'Linh Mộc', type: 'material', rarity: 0, value: 6, desc: 'Gỗ linh mộc, chế tạo nội thất và xây dựng.', icon: 'icon_wood', sources: ['Rừng Thanh Trúc', 'Cửa hàng'] });

// ---------- Hạt giống ----------
HERBS.forEach((n, i) => add({ id: `seed_t${i + 1}`, name: `Hạt ${n}`, type: 'seed', rarity: Math.min(9, i), reqRealm: i * 4, value: 4 * Math.pow(3, i), seed: { herb: `herb_t${i + 1}`, growSeconds: 300 * (i + 1), yield: [2, 4 + i] }, desc: `Gieo ở linh điền, sau ${5 * (i + 1)} phút thu hoạch ${n}.`, icon: 'icon_seed' }));

// ---------- Nội thất ----------
const FURN: [string, string, number, number, number][] = [['furn_table', 'Bàn Trà Linh Mộc', 2, 1, 0], ['furn_lamp', 'Đèn Lưu Ly', 1, 2, 0], ['furn_cushion', 'Bồ Đoàn Tụ Linh', 1, 1, 0.05], ['furn_screen', 'Bình Phong Sơn Thủy', 2, 2, 0], ['furn_bonsai', 'Linh Tùng Bồn Cảnh', 1, 2, 0.03], ['furn_cauldron', 'Đỉnh Đồng Cổ', 2, 2, 0.04], ['furn_statue', 'Tượng Tổ Sư', 2, 3, 0.08]];
FURN.forEach(([id, name, w, h, sb], i) => add({ id, name, type: 'furniture', rarity: Math.min(4, i), value: 100 * (i + 1), furniture: { w, h, spiritBonus: sb || undefined }, desc: sb ? `Nội thất động phủ. +${sb * 100}% tốc độ tu luyện khi đả tọa trong động phủ.` : 'Nội thất trang trí động phủ.', icon: 'icon_furniture' }));

// ---------- Linh thú ----------
add({ id: 'pet_food_1', name: 'Linh Thú Lương', type: 'material', rarity: 0, value: 15, desc: 'Cho linh thú ăn: +80 kinh nghiệm.', use: { kind: 'pet_food', exp: 80 }, icon: 'icon_pet_food' });
add({ id: 'pet_food_2', name: 'Yêu Đan Phấn', type: 'material', rarity: 2, value: 200, desc: 'Cho linh thú ăn: +1500 kinh nghiệm.', use: { kind: 'pet_food', exp: 1500 }, icon: 'icon_pet_food' });
add({ id: 'pet_food_3', name: 'Tiên Thú Quả', type: 'material', rarity: 5, value: 5000, desc: 'Cho linh thú ăn: +60000 kinh nghiệm.', use: { kind: 'pet_food', exp: 60000 }, icon: 'icon_pet_food' });
add({ id: 'pet_evolve_stone', name: 'Tiến Hóa Thạch', type: 'material', rarity: 3, value: 1000, desc: 'Nguyên liệu tiến hóa linh thú.', icon: 'icon_stone_gold' });
add({ id: 'egg_fox', name: 'Trứng Linh Hồ', type: 'pet_egg', rarity: 2, value: 500, use: { kind: 'hatch', pet: 'pet_fox' }, desc: 'Ấp nở thành Linh Hồ.', icon: 'icon_egg' });
add({ id: 'egg_crane', name: 'Trứng Tiên Hạc', type: 'pet_egg', rarity: 5, reqRealm: 10, value: 8000, use: { kind: 'hatch', pet: 'pet_crane' }, desc: 'Ấp nở thành Tiên Hạc.', icon: 'icon_egg' });
const PET_GEAR: [string, string, number][] = [['pgear_collar_1', 'Linh Hoàn Đồng', 0], ['pgear_collar_2', 'Linh Hoàn Ngọc', 10], ['pgear_collar_3', 'Linh Hoàn Tiên', 19]];
PET_GEAR.forEach(([id, n, r]) => add({ id, name: n, type: 'pet_gear', rarity: rarityForRealm(r), reqRealm: r, value: 200 * (r + 1), stats: { atk: Math.round(20 * Math.pow(1.3, r)), maxHp: Math.round(150 * Math.pow(1.3, r)) }, desc: 'Trang bị cho linh thú.', icon: 'icon_collar' }));

// ---------- Thú cưỡi & thời trang ----------
const MOUNTS: [string, string, number, number][] = [['mount_horse', 'Thanh Tông Mã', 0, 0.2], ['mount_wolf', 'Hắc Phong Lang', 4, 0.28], ['mount_crane', 'Bạch Hạc', 10, 0.35], ['mount_qilin', 'Kỳ Lân', 19, 0.45], ['mount_dragon', 'Hỗn Độn Long', 28, 0.6]];
MOUNTS.forEach(([id, name, r, sp]) => add({ id, name, type: 'mount', slot: 'mount', rarity: rarityForRealm(r) + 1, reqRealm: r, value: 2000 * (r + 1), stats: { moveSpeed: sp }, appearance: id, desc: `Thú cưỡi: +${Math.round(sp * 100)}% tốc độ di chuyển.`, icon: 'icon_mount' }));
const FASHION: [string, string, number][] = [['fashion_white_robe', 'Bạch Y Thư Sinh', 0], ['fashion_red_robe', 'Hồng Y Hiệp Nữ', 0], ['fashion_black_robe', 'Hắc Bào Ẩn Sĩ', 5], ['fashion_gold_robe', 'Kim Tuyến Đạo Bào', 10], ['fashion_immortal', 'Tiên Y Vũ Bào', 19], ['fashion_festival', 'Lễ Phục Trung Thu', 0]];
FASHION.forEach(([id, name, r], i) => add({ id, name, type: 'fashion', slot: 'fashion', rarity: 2 + Math.floor(i / 2), reqRealm: r, value: 1000 * (i + 1), stats: { maxHp: 50 * (i + 1) }, appearance: id, desc: 'Thời trang — thay đổi ngoại hình trang phục.', icon: 'icon_fashion', tradable: id !== 'fashion_festival' }));

// ---------- Vật phẩm nhiệm vụ / sự kiện ----------
const QUEST_ITEMS: [string, string][] = [
  ['qi_jade_pendant', 'Ngọc Bội Cổ'], ['qi_letter', 'Thư Của Trưởng Thôn'], ['qi_herb_bundle', 'Bó Thảo Dược'],
  ['qi_bandit_map', 'Bản Đồ Sơn Trại'], ['qi_sword_fragment', 'Mảnh Cổ Kiếm'], ['qi_sect_token', 'Lệnh Bài Thiên Kiếm Tông'],
  ['qi_spirit_root_stone', 'Trắc Linh Thạch'], ['qi_ghost_lantern', 'U Minh Đăng'], ['qi_war_banner', 'Chiến Kỳ Cổ'],
  ['qi_thunder_seal', 'Lôi Ấn'], ['qi_ancient_scroll', 'Thượng Cổ Quyển Trục'], ['qi_demon_seal', 'Phong Ma Ấn'],
  ['qi_ascension_key', 'Phi Thăng Lệnh'], ['qi_immortal_edict', 'Tiên Chiếu'], ['qi_chaos_heart', 'Hỗn Độn Chi Tâm'],
  ['qi_lost_ring', 'Nhẫn Bạc Thất Lạc'], ['qi_medicine', 'Thuốc Giải Độc'], ['qi_clue', 'Manh Mối'],
  ['qi_merchant_goods', 'Hàng Hóa Thương Đội'], ['qi_old_book', 'Sách Cũ Rách'],
];
QUEST_ITEMS.forEach(([id, name]) => add({ id, name, type: 'quest', rarity: 2, value: 0, tradable: false, desc: 'Vật phẩm nhiệm vụ — không thể giao dịch.', icon: 'icon_quest', maxStack: 99 }));
add({ id: 'ev_lantern', name: 'Hoa Đăng', type: 'event', rarity: 3, value: 0, tradable: false, desc: 'Vật phẩm sự kiện — đổi thưởng tại Sứ Giả Sự Kiện.', icon: 'icon_lantern' });
add({ id: 'ev_mooncake', name: 'Bánh Trung Thu', type: 'event', rarity: 2, value: 0, desc: 'Ăn vào hồi 30% sinh lực. Vật phẩm sự kiện.', use: { kind: 'heal', hp: 0.3, pct: true }, cooldown: 10, icon: 'icon_mooncake' });
add({ id: 'bag_stones_small', name: 'Túi Linh Thạch Nhỏ', type: 'material', rarity: 2, value: 0, desc: 'Mở nhận 10 linh thạch.', use: { kind: 'currency', currency: 'spirit_stones', amount: 10 }, icon: 'icon_bag' });

// ---------- Trang bị theo cảnh giới (sinh từ bảng) ----------
const SLOT_NAMES: Record<string, [string, string][]> = {
  weapon: [['Mộc Kiếm', 'sword'], ['Thiết Đao', 'saber'], ['Thanh Phong Kiếm', 'sword'], ['Hàn Quang Đao', 'saber'], ['Tử Trúc Trượng', 'staff']],
  armor: [['Võ Phục', ''], ['Bì Giáp', ''], ['Thiết Giáp', ''], ['Đạo Bào', '']],
  helmet: [['Khăn Đầu', ''], ['Đầu Đai', ''], ['Ngọc Quan', '']],
  boots: [['Giày Vải', ''], ['Hành Ngoa', ''], ['Phi Vân Ngoa', '']],
  ring: [['Đồng Giới', ''], ['Ngọc Giới', ''], ['Linh Giới', '']],
  amulet: [['Hộ Phù', ''], ['Ngọc Bội', ''], ['Linh Châu', '']],
  artifact: [['Đồng Kính', ''], ['Linh Ấn', ''], ['Bảo Tháp', ''], ['Phiên Thiên Ấn', '']],
};
const TIER_PREFIX = ['Phàm', 'Võ Giả', 'Luyện Thể', 'Nội Kình', 'Ám Kình', 'Hóa Kình', 'Tiên Thiên', 'Tông Sư', 'Đại Tông Sư', 'Đế Võ', 'Linh Khí', 'Trúc Cơ', 'Kim Đan', 'Nguyên Anh', 'Hóa Thần', 'Luyện Hư', 'Hợp Thể', 'Đại Thừa', 'Độ Kiếp', 'Nhân Tiên', 'Địa Tiên', 'Thiên Tiên', 'Chân Tiên', 'Huyền Tiên', 'Kim Tiên', 'Đại La', 'Tiên Quân', 'Tiên Vương', 'Tiên Đế'];
const EQUIP_SLOTS_GEN: EquipSlot[] = ['weapon', 'armor', 'helmet', 'boots', 'ring', 'amulet', 'artifact'];
for (let r = 0; r < 29; r++) {
  for (const slot of EQUIP_SLOTS_GEN) {
    const names = SLOT_NAMES[slot];
    const [base, look] = names[r % names.length];
    const rarity = rarityForRealm(r);
    add({
      id: `eq_${slot}_${r}`, name: `${TIER_PREFIX[r]} ${base}`, type: slot as ItemType, slot, rarity, reqRealm: r,
      stats: equipmentBaseStats(slot, r, rarity), value: Math.round(30 * Math.pow(1.55, r)),
      durability: 100, appearance: slot === 'weapon' ? `wpn_${look}_${Math.min(4, Math.floor(r / 6))}` : undefined,
      desc: `Trang bị ${slot} dành cho cảnh giới ${REALMS[r].name}.`, icon: `icon_${slot}`, sources: ['Quái vật', 'Rèn đúc', 'Cửa hàng'],
    });
  }
}
// ---------- Bộ trang bị (set) ----------
const SETS: [string, string, number, string[]][] = [
  ['set_thanh_truc', 'Thanh Trúc', 1, ['weapon', 'armor', 'helmet', 'boots']],
  ['set_hac_phong', 'Hắc Phong', 3, ['weapon', 'armor', 'helmet', 'boots']],
  ['set_co_kiem', 'Cổ Kiếm', 6, ['weapon', 'armor', 'ring', 'amulet']],
  ['set_u_minh', 'U Minh', 8, ['armor', 'helmet', 'boots', 'artifact']],
  ['set_loi_kiep', 'Lôi Kiếp', 12, ['weapon', 'armor', 'helmet', 'boots']],
  ['set_ma_vuc', 'Ma Vực', 15, ['weapon', 'ring', 'amulet', 'artifact']],
  ['set_tien_van', 'Tiên Vân', 20, ['weapon', 'armor', 'helmet', 'boots']],
  ['set_hon_don', 'Hỗn Độn', 28, ['weapon', 'armor', 'ring', 'artifact']],
];
export const SET_DEFS: Record<string, SetDef> = {};
const SET_PIECE_NAME: Record<string, string> = { weapon: 'Kiếm', armor: 'Chiến Giáp', helmet: 'Quan', boots: 'Ngoa', ring: 'Giới', amulet: 'Bội', artifact: 'Bảo Ấn' };
for (const [sid, sname, r, pieces] of SETS) {
  const ids: string[] = [];
  for (const slot of pieces) {
    const rarity = Math.min(9, rarityForRealm(r) + 1);
    const id = `${sid}_${slot}`;
    ids.push(id);
    add({ id, name: `${sname} ${SET_PIECE_NAME[slot]}`, type: slot as ItemType, slot: slot as EquipSlot, rarity, reqRealm: r, stats: equipmentBaseStats(slot, r, rarity), value: Math.round(80 * Math.pow(1.55, r)), set: sid, durability: 120, appearance: slot === 'weapon' ? `wpn_set_${sid}` : undefined, desc: `Một món trong bộ ${sname}.`, icon: `icon_${slot}`, sources: ['Boss khu vực', 'Phó bản'] });
  }
  const k = Math.pow(1.034, r * 9 + 5) * (1 + r * 0.06);
  SET_DEFS[sid] = { id: sid, name: sname, pieces: ids, bonuses: [
    { count: 2, stats: { maxHp: Math.round(80 * k), def: Math.round(4 * k) } },
    { count: 4, stats: { atk: Math.round(10 * k), matk: Math.round(10 * k), crit: 0.05, critDmg: 0.2 } },
  ] };
}

// ---------- Bí tịch (học kỹ năng) được thêm trong skills.ts qua registerManual ----------
export function registerManual(skillId: string, skillName: string, reqRealm: number, rarity: number): void {
  add({ id: `manual_${skillId}`, name: `Bí Tịch: ${skillName}`, type: 'manual', rarity, reqRealm, value: Math.round(100 * Math.pow(1.6, reqRealm)), use: { kind: 'learn_skill', skill: skillId }, desc: `Lĩnh ngộ công pháp ${skillName}.`, icon: 'icon_manual', maxStack: 99 });
}

export const ITEMS = items;

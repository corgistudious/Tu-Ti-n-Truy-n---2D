import type { Appearance, DungeonDef, GatherTable, HousingBuildingDef, MapDef, NpcDef, PetDef, ShopDef, WorldEventDef } from '../types.js';
import { TILE } from '../constants.js';

// ======================= BẢN ĐỒ =======================
type MapSeed = Omit<MapDef, 'portals' | 'npcs' | 'spawns' | 'nodes' | 'interacts' | 'spawnX' | 'channels' | 'seed'> & { channels?: number };
const maps: Record<string, MapDef> = {};
let seedCounter = 1000;
function map(m: MapSeed): MapDef {
  const d: MapDef = { ...m, seed: (seedCounter += 7919), spawnX: 6 * TILE, portals: [], npcs: [], spawns: [], nodes: [], interacts: [], channels: m.channels ?? (m.instance ? 1 : 2) };
  maps[d.id] = d;
  return d;
}
const W = 'nhan_gioi' as const, T = 'tu_chan_gioi' as const, X = 'tien_gioi' as const, S = 'special' as const;
map({ id: 'tan_thu_thon', name: 'Tân Thủ Thôn', world: W, theme: 'village', width: 90, height: 20, terrain: 'plains', platforms: 4, reqRealm: 0, safe: true, pvp: 'none', bgm: 'bgm_village', weather: 'clear', dayNight: true, spiritDensity: 1, description: 'Ngôi làng nhỏ nơi biên giới nhân giới, nơi hành trình bắt đầu.' });
map({ id: 'rung_thanh_truc', name: 'Rừng Thanh Trúc', world: W, theme: 'bamboo', width: 150, height: 22, terrain: 'hills', platforms: 14, reqRealm: 0, safe: false, pvp: 'none', bgm: 'bgm_forest', weather: 'mist', dayNight: true, spiritDensity: 1.1, description: 'Rừng trúc xanh ngát, yêu thú cấp thấp ẩn náu.' });
map({ id: 'hac_phong_son', name: 'Hắc Phong Sơn', world: W, theme: 'dark_mountain', width: 170, height: 24, terrain: 'mountain', platforms: 18, reqRealm: 1, safe: false, pvp: 'none', bgm: 'bgm_mountain', weather: 'storm', dayNight: true, spiritDensity: 1.15, description: 'Núi gió đen, sào huyệt của sơn tặc Hắc Phong Trại.' });
map({ id: 'thanh_van_thanh', name: 'Thanh Vân Thành', world: W, theme: 'city', width: 130, height: 20, terrain: 'city', platforms: 6, reqRealm: 1, safe: true, pvp: 'none', bgm: 'bgm_city', weather: 'clear', dayNight: true, spiritDensity: 1, channels: 3, description: 'Thành trì phồn hoa nhất biên giới — chợ, tông môn sứ, đấu trường.' });
map({ id: 'vo_dao_hoc_vien', name: 'Võ Đạo Học Viện', world: W, theme: 'academy', width: 110, height: 20, terrain: 'city', platforms: 10, reqRealm: 2, safe: false, pvp: 'none', bgm: 'bgm_academy', weather: 'petals', dayNight: true, spiritDensity: 1.25, description: 'Học viện võ đạo đào tạo võ giả trẻ của nhân giới.' });
map({ id: 'co_kiem_son_trang', name: 'Cổ Kiếm Sơn Trang', world: W, theme: 'villa', width: 150, height: 22, terrain: 'hills', platforms: 14, reqRealm: 3, safe: false, pvp: 'none', bgm: 'bgm_villa', weather: 'mist', dayNight: true, spiritDensity: 1.3, description: 'Sơn trang đúc kiếm cổ xưa, nay bị kiếm linh chiếm giữ.' });
map({ id: 'yeu_thu_son_mach', name: 'Yêu Thú Sơn Mạch', world: W, theme: 'wild_mountain', width: 190, height: 26, terrain: 'mountain', platforms: 22, reqRealm: 4, safe: false, pvp: 'none', bgm: 'bgm_wild', weather: 'rain', dayNight: true, spiritDensity: 1.4, description: 'Dãy núi bạt ngàn yêu thú, nơi rèn luyện của võ giả.' });
map({ id: 'van_duoc_coc', name: 'Vạn Dược Cốc', world: W, theme: 'herb_valley', width: 150, height: 22, terrain: 'hills', platforms: 14, reqRealm: 5, safe: false, pvp: 'none', bgm: 'bgm_valley', weather: 'mist', dayNight: true, spiritDensity: 1.5, description: 'Thung lũng linh dược, cũng đầy độc vật.' });
map({ id: 'thien_kiem_tong', name: 'Thiên Kiếm Tông', world: W, theme: 'sect', width: 140, height: 24, terrain: 'mountain', platforms: 16, reqRealm: 5, safe: true, pvp: 'none', bgm: 'bgm_sect', weather: 'clear', dayNight: true, spiritDensity: 1.8, description: 'Đại tông môn kiếm đạo đứng đầu nhân giới.' });
map({ id: 'u_minh_dong', name: 'U Minh Động', world: W, theme: 'ghost_cave', width: 170, height: 22, terrain: 'cave', platforms: 18, reqRealm: 7, safe: false, pvp: 'none', bgm: 'bgm_cave', weather: 'ash', dayNight: false, spiritDensity: 1.6, description: 'Hang động âm khí, U Minh Quỷ Vương ngủ say dưới đáy.' });
map({ id: 'co_chien_truong', name: 'Cổ Chiến Trường', world: W, theme: 'battlefield', width: 200, height: 24, terrain: 'hills', platforms: 16, reqRealm: 8, safe: false, pvp: 'open', bgm: 'bgm_battle', weather: 'ash', dayNight: true, spiritDensity: 1.7, description: 'Chiến trường thượng cổ — vùng PK tự do.' });
map({ id: 'linh_van_chau', name: 'Linh Vân Châu', world: T, theme: 'cloud_land', width: 180, height: 26, terrain: 'sky', platforms: 24, reqRealm: 10, reqQuest: 'mq_4_06', safe: false, pvp: 'none', bgm: 'bgm_cloud', weather: 'mist', dayNight: true, spiritDensity: 2.5, description: 'Đại lục mây linh của Tu Chân Giới.' });
map({ id: 'thien_huyen_thanh', name: 'Thiên Huyền Thành', world: T, theme: 'cult_city', width: 140, height: 22, terrain: 'city', platforms: 8, reqRealm: 10, reqQuest: 'mq_4_06', safe: true, pvp: 'none', bgm: 'bgm_cult_city', weather: 'clear', dayNight: true, spiritDensity: 2.2, channels: 3, description: 'Thành trì tu chân giả, trung tâm thương mại Tu Chân Giới.' });
map({ id: 'van_bao_cac', name: 'Vạn Bảo Các', world: T, theme: 'pavilion', width: 90, height: 20, terrain: 'city', platforms: 8, reqRealm: 11, safe: true, pvp: 'none', bgm: 'bgm_pavilion', weather: 'clear', dayNight: false, spiritDensity: 2.2, description: 'Lầu các buôn bán kỳ trân dị bảo và đấu giá.' });
map({ id: 'loi_kiep_dai', name: 'Lôi Kiếp Đài', world: T, theme: 'thunder_peak', width: 160, height: 26, terrain: 'mountain', platforms: 20, reqRealm: 12, safe: false, pvp: 'none', bgm: 'bgm_thunder', weather: 'storm', dayNight: false, spiritDensity: 3, description: 'Đỉnh núi lôi kiếp — nơi tu sĩ nghênh đón thiên kiếp.' });
map({ id: 'thuong_co_bi_canh', name: 'Thượng Cổ Bí Cảnh', world: T, theme: 'ancient_ruins', width: 190, height: 26, terrain: 'cave', platforms: 22, reqRealm: 13, safe: false, pvp: 'none', bgm: 'bgm_ruins', weather: 'mist', dayNight: false, spiritDensity: 3.2, description: 'Bí cảnh thượng cổ chứa truyền thừa đã thất lạc.' });
map({ id: 'ma_vuc', name: 'Ma Vực', world: T, theme: 'demon_realm', width: 200, height: 26, terrain: 'mountain', platforms: 22, reqRealm: 15, safe: false, pvp: 'open', bgm: 'bgm_demon', weather: 'ash', dayNight: false, spiritDensity: 3.5, description: 'Lãnh địa ma đạo — vùng PK tự do.' });
map({ id: 'thien_ngoai_chien_truong', name: 'Thiên Ngoại Chiến Trường', world: T, theme: 'void', width: 220, height: 28, terrain: 'sky', platforms: 26, reqRealm: 17, safe: false, pvp: 'open', bgm: 'bgm_void', weather: 'storm', dayNight: false, spiritDensity: 4, description: 'Chiến trường ngoài thiên ngoại, nơi tu sĩ chống lại hư không.' });
map({ id: 'phi_thang_dai', name: 'Phi Thăng Đài', world: X, theme: 'ascension', width: 120, height: 26, terrain: 'sky', platforms: 16, reqRealm: 19, reqQuest: 'mq_6_06', safe: true, pvp: 'none', bgm: 'bgm_ascension', weather: 'petals', dayNight: false, spiritDensity: 5, description: 'Nơi tu sĩ phi thăng đặt chân đến Tiên Giới.' });
map({ id: 'cuu_thien_tien_thanh', name: 'Cửu Thiên Tiên Thành', world: X, theme: 'immortal_city', width: 150, height: 24, terrain: 'city', platforms: 10, reqRealm: 19, reqQuest: 'mq_6_06', safe: true, pvp: 'none', bgm: 'bgm_immortal_city', weather: 'petals', dayNight: true, spiritDensity: 5, channels: 3, description: 'Tiên thành trên chín tầng trời.' });
map({ id: 'van_tien_son', name: 'Vạn Tiên Sơn', world: X, theme: 'immortal_mountain', width: 200, height: 28, terrain: 'mountain', platforms: 26, reqRealm: 21, safe: false, pvp: 'none', bgm: 'bgm_immortal_mt', weather: 'mist', dayNight: true, spiritDensity: 6, description: 'Núi tiên nơi vạn tiên tu luyện.' });
map({ id: 'thien_de_cung', name: 'Thiên Đế Cung', world: X, theme: 'heaven_palace', width: 180, height: 26, terrain: 'city', platforms: 18, reqRealm: 25, safe: false, pvp: 'none', bgm: 'bgm_palace', weather: 'clear', dayNight: false, spiritDensity: 7, description: 'Cung điện của Thiên Đế, canh giữ bởi Kim Giáp Thiên Binh.' });
map({ id: 'hon_don_hai', name: 'Hỗn Độn Hải', world: X, theme: 'chaos_sea', width: 230, height: 28, terrain: 'sea', platforms: 28, reqRealm: 28, safe: false, pvp: 'open', bgm: 'bgm_chaos', weather: 'storm', dayNight: false, spiritDensity: 9, description: 'Biển hỗn độn ở rìa tiên giới — cánh cửa tới những tầng thế giới cao hơn.' });
// Bản đồ đặc biệt (instance)
map({ id: 'trial_tam_ma', name: 'Tâm Ma Cảnh', world: S, theme: 'inner_world', width: 40, height: 18, terrain: 'arena', platforms: 3, reqRealm: 0, safe: false, pvp: 'none', bgm: 'bgm_trial', weather: 'mist', dayNight: false, spiritDensity: 0, instance: 'trial', description: 'Ảo cảnh nội tâm — đánh bại tâm ma của chính mình.' });
map({ id: 'trial_thien_kiep', name: 'Thiên Kiếp Lôi Trì', world: S, theme: 'thunder_peak', width: 44, height: 18, terrain: 'arena', platforms: 4, reqRealm: 0, safe: false, pvp: 'none', bgm: 'bgm_thunder', weather: 'storm', dayNight: false, spiritDensity: 0, instance: 'trial', description: 'Thiên kiếp giáng xuống — sống sót qua từng đạo lôi.' });
map({ id: 'dong_phu', name: 'Động Phủ', world: S, theme: 'cave_home', width: 50, height: 18, terrain: 'arena', platforms: 3, reqRealm: 0, safe: true, pvp: 'none', bgm: 'bgm_home', weather: 'clear', dayNight: false, spiritDensity: 2, instance: 'housing', description: 'Động phủ riêng của tu sĩ.' });
map({ id: 'arena_map', name: 'Đấu Trường', world: S, theme: 'arena', width: 40, height: 18, terrain: 'arena', platforms: 2, reqRealm: 0, safe: false, pvp: 'arena', bgm: 'bgm_battle', weather: 'clear', dayNight: false, spiritDensity: 0, instance: 'arena', description: 'Đấu trường xếp hạng 1 đấu 1.' });
map({ id: 'dg_hac_phong_trai', name: 'Hắc Phong Trại (Phó Bản)', world: S, theme: 'dark_mountain', width: 80, height: 20, terrain: 'hills', platforms: 6, reqRealm: 2, safe: false, pvp: 'none', bgm: 'bgm_dungeon', weather: 'storm', dayNight: false, spiritDensity: 1, instance: 'dungeon', description: 'Sào huyệt sâu nhất của Hắc Phong Trại.' });
map({ id: 'dg_quy_mau_dong', name: 'Quỷ Mẫu Động (Phó Bản)', world: S, theme: 'ghost_cave', width: 80, height: 20, terrain: 'cave', platforms: 6, reqRealm: 7, safe: false, pvp: 'none', bgm: 'bgm_dungeon', weather: 'ash', dayNight: false, spiritDensity: 1, instance: 'dungeon', description: 'Hang ổ Quỷ Mẫu dưới đáy U Minh Động.' });
map({ id: 'dg_thao_thiet', name: 'Thao Thiết Bí Cảnh (Phó Bản)', world: S, theme: 'ancient_ruins', width: 90, height: 22, terrain: 'cave', platforms: 8, reqRealm: 13, safe: false, pvp: 'none', bgm: 'bgm_dungeon', weather: 'mist', dayNight: false, spiritDensity: 1, instance: 'dungeon', description: 'Tầng sâu nhất của Thượng Cổ Bí Cảnh.' });
map({ id: 'dg_doa_tien', name: 'Đọa Tiên Uyên (Phó Bản)', world: S, theme: 'immortal_mountain', width: 90, height: 22, terrain: 'sky', platforms: 8, reqRealm: 21, safe: false, pvp: 'none', bgm: 'bgm_dungeon', weather: 'mist', dayNight: false, spiritDensity: 1, instance: 'dungeon', description: 'Vực sâu nơi Đọa Tiên bị phong ấn.' });
map({ id: 'guild_hall', name: 'Tông Môn Đại Điện', world: S, theme: 'sect', width: 70, height: 20, terrain: 'arena', platforms: 4, reqRealm: 0, safe: false, pvp: 'none', bgm: 'bgm_sect', weather: 'clear', dayNight: false, spiritDensity: 2, instance: 'guild', description: 'Đại điện tông môn — nơi khiêu chiến Boss tông môn.' });

// ----- Cổng dịch chuyển hai chiều -----
const slotOrder = (preferLeft: boolean) => preferLeft ? ['L', 'R', 'M1', 'M2', 'M3'] : ['R', 'L', 'M1', 'M2', 'M3'];
const used: Record<string, Set<string>> = {};
function slotX(m: MapDef, slot: string): number {
  switch (slot) {
    case 'L': return 3 * TILE;
    case 'R': return (m.width - 4) * TILE;
    case 'M1': return Math.round(m.width * 0.33) * TILE;
    case 'M2': return Math.round(m.width * 0.66) * TILE;
    default: return Math.round(m.width * 0.5) * TILE;
  }
}
function takeSlot(m: MapDef, preferLeft: boolean): number {
  used[m.id] ??= new Set();
  for (const s of slotOrder(preferLeft)) if (!used[m.id].has(s)) { used[m.id].add(s); return slotX(m, s); }
  throw new Error('no portal slot ' + m.id);
}
function link(a: string, b: string): void {
  const A = maps[a], B = maps[b];
  const ax = takeSlot(A, false), bx = takeSlot(B, true);
  A.portals.push({ id: `to_${b}`, x: ax, y: 0, to: b, toPortal: `to_${a}`, reqRealm: B.reqRealm, reqQuest: B.reqQuest });
  B.portals.push({ id: `to_${a}`, x: bx, y: 0, to: a, toPortal: `to_${b}`, reqRealm: A.reqRealm, reqQuest: A.reqQuest });
}
link('tan_thu_thon', 'rung_thanh_truc');
link('rung_thanh_truc', 'hac_phong_son');
link('hac_phong_son', 'thanh_van_thanh');
link('thanh_van_thanh', 'vo_dao_hoc_vien');
link('thanh_van_thanh', 'co_kiem_son_trang');
link('co_kiem_son_trang', 'yeu_thu_son_mach');
link('yeu_thu_son_mach', 'van_duoc_coc');
link('van_duoc_coc', 'thien_kiem_tong');
link('thien_kiem_tong', 'u_minh_dong');
link('u_minh_dong', 'co_chien_truong');
link('linh_van_chau', 'thien_huyen_thanh');
link('thien_huyen_thanh', 'van_bao_cac');
link('thien_huyen_thanh', 'loi_kiep_dai');
link('loi_kiep_dai', 'thuong_co_bi_canh');
link('thuong_co_bi_canh', 'ma_vuc');
link('ma_vuc', 'thien_ngoai_chien_truong');
link('phi_thang_dai', 'cuu_thien_tien_thanh');
link('cuu_thien_tien_thanh', 'van_tien_son');
link('van_tien_son', 'thien_de_cung');
link('thien_de_cung', 'hon_don_hai');

// ----- NPC đặt trên bản đồ -----
function place(mapId: string, npc: string, xTile: number): void { maps[mapId].npcs.push({ npc, x: xTile * TILE + 16, y: 0 }); }
function spawn(mapId: string, monster: string, count: number, from: number, to: number): void {
  const m = maps[mapId];
  maps[mapId].spawns.push({ monster, count, x1: Math.round(m.width * from) * TILE, x2: Math.round(m.width * to) * TILE });
}
function node(mapId: string, kind: 'herb' | 'ore' | 'fishing', table: string, ...xs: number[]): void {
  const m = maps[mapId];
  xs.forEach((f, i) => m.nodes.push({ id: `${kind}_${i}_${m.nodes.length}`, kind, table, x: Math.round(m.width * f) * TILE + 16, y: 0, respawn: kind === 'fishing' ? 5 : 45 }));
}
function interact(mapId: string, id: string, name: string, quest: string, objective: string, f: number): void {
  const m = maps[mapId];
  m.interacts.push({ id, name, quest, objective, x: Math.round(m.width * f) * TILE + 16, y: 0 });
}

// Tân Thủ Thôn
place('tan_thu_thon', 'npc_village_chief', 14); place('tan_thu_thon', 'npc_martial_teacher', 22); place('tan_thu_thon', 'npc_herbalist_girl', 30);
place('tan_thu_thon', 'npc_blacksmith_village', 38); place('tan_thu_thon', 'npc_storage_village', 46); place('tan_thu_thon', 'npc_grandma', 58); place('tan_thu_thon', 'npc_father', 66);
spawn('tan_thu_thon', 'slime_green', 6, 0.75, 0.92); spawn('tan_thu_thon', 'training_dummy', 2, 0.28, 0.31);
node('tan_thu_thon', 'herb', 'gt_herb_1', 0.8, 0.9); node('tan_thu_thon', 'fishing', 'gt_fish_1', 0.7);
interact('tan_thu_thon', 'int_strange_light', 'Ánh Sáng Kỳ Lạ', 'mq_1_05', 'o2', 0.86);
// Rừng Thanh Trúc
place('rung_thanh_truc', 'npc_hunter', 10); place('rung_thanh_truc', 'npc_lost_child', 120);
spawn('rung_thanh_truc', 'slime_green', 6, 0.1, 0.3); spawn('rung_thanh_truc', 'chicken_wild', 6, 0.2, 0.45); spawn('rung_thanh_truc', 'fox_spirit_young', 5, 0.4, 0.6);
spawn('rung_thanh_truc', 'bamboo_sprite', 7, 0.5, 0.75); spawn('rung_thanh_truc', 'wolf_black', 6, 0.65, 0.9); spawn('rung_thanh_truc', 'boar_iron', 2, 0.7, 0.85); spawn('rung_thanh_truc', 'boss_bamboo_king', 1, 0.92, 0.94);
node('rung_thanh_truc', 'herb', 'gt_herb_1', 0.2, 0.35, 0.55, 0.7); node('rung_thanh_truc', 'ore', 'gt_ore_1', 0.45, 0.8); node('rung_thanh_truc', 'fishing', 'gt_fish_1', 0.3);
interact('rung_thanh_truc', 'int_claw_marks', 'Vết Cào Trên Thân Trúc', 'mq_1_06', 'o1', 0.6);
interact('rung_thanh_truc', 'int_hidden_cave', 'Khe Đá Ẩn', 'hq_bamboo_secret', 'o1', 0.97);
// Hắc Phong Sơn
place('hac_phong_son', 'npc_scout', 8); place('hac_phong_son', 'npc_captive_merchant', 140);
spawn('hac_phong_son', 'bandit_thug', 10, 0.1, 0.4); spawn('hac_phong_son', 'wolf_wind', 8, 0.3, 0.6); spawn('hac_phong_son', 'bandit_archer', 8, 0.45, 0.8);
spawn('hac_phong_son', 'bandit_captain', 3, 0.6, 0.85); spawn('hac_phong_son', 'boss_black_wind', 1, 0.86, 0.88);
node('hac_phong_son', 'ore', 'gt_ore_1', 0.2, 0.5, 0.75); node('hac_phong_son', 'herb', 'gt_herb_1', 0.35, 0.65);
interact('hac_phong_son', 'int_bandit_notice', 'Bảng Cáo Thị Rách', 'mq_2_02', 'o1', 0.25);
interact('hac_phong_son', 'int_supply_crate', 'Thùng Lương Thực', 'sq_hac_phong_supplies', 'o1', 0.55);
// Thanh Vân Thành
const tv = 'thanh_van_thanh';
['npc_city_lord', 'npc_merchant_city', 'npc_market', 'npc_guild_manager', 'npc_arena_master', 'npc_housing_agent', 'npc_teleporter', 'npc_storage_city', 'npc_alchemist_master', 'npc_forge_master', 'npc_pet_keeper', 'npc_event', 'npc_tailor', 'npc_bounty_board', 'npc_fisherman'].forEach((n, i) => place(tv, n, 12 + i * 7));
node(tv, 'fishing', 'gt_fish_1', 0.93);
interact(tv, 'int_wanted_poster', 'Bảng Truy Nã', 'sq_city_investigation', 'o1', 0.5);
interact(tv, 'int_alley_clue', 'Hẻm Tối', 'sq_city_investigation', 'o2', 0.8);
// Võ Đạo Học Viện
place('vo_dao_hoc_vien', 'npc_academy_dean', 12); place('vo_dao_hoc_vien', 'npc_academy_instructor', 20); place('vo_dao_hoc_vien', 'npc_academy_librarian', 28);
spawn('vo_dao_hoc_vien', 'training_dummy', 4, 0.3, 0.4); spawn('vo_dao_hoc_vien', 'stone_golem_small', 8, 0.45, 0.8); spawn('vo_dao_hoc_vien', 'academy_rogue', 2, 0.8, 0.92);
interact('vo_dao_hoc_vien', 'int_library_shelf', 'Giá Sách Cấm', 'sq_academy_book', 'o1', 0.35);
// Cổ Kiếm Sơn Trang
place('co_kiem_son_trang', 'npc_sword_villa_master', 10); place('co_kiem_son_trang', 'npc_old_servant', 18);
spawn('co_kiem_son_trang', 'sword_spirit', 10, 0.15, 0.55); spawn('co_kiem_son_trang', 'rusted_guard', 8, 0.4, 0.85); spawn('co_kiem_son_trang', 'boss_ancient_sword', 1, 0.9, 0.92);
node('co_kiem_son_trang', 'ore', 'gt_ore_2', 0.3, 0.6, 0.8);
interact('co_kiem_son_trang', 'int_sword_forge', 'Lò Đúc Kiếm Cổ', 'mq_3_02', 'o1', 0.5);
// Yêu Thú Sơn Mạch
place('yeu_thu_son_mach', 'npc_beast_tamer', 10); place('yeu_thu_son_mach', 'npc_injured_disciple', 95);
spawn('yeu_thu_son_mach', 'tiger_stripe', 10, 0.1, 0.45); spawn('yeu_thu_son_mach', 'snake_jade', 10, 0.35, 0.7); spawn('yeu_thu_son_mach', 'ape_mountain', 3, 0.6, 0.85);
spawn('yeu_thu_son_mach', 'rare_golden_fox', 1, 0.5, 0.6); spawn('yeu_thu_son_mach', 'boss_beast_king', 1, 0.92, 0.94);
node('yeu_thu_son_mach', 'herb', 'gt_herb_2', 0.2, 0.5, 0.8); node('yeu_thu_son_mach', 'ore', 'gt_ore_2', 0.3, 0.65); node('yeu_thu_son_mach', 'fishing', 'gt_fish_2', 0.4);
// Vạn Dược Cốc
place('van_duoc_coc', 'npc_valley_master', 10); place('van_duoc_coc', 'npc_poisoned_villager', 20);
spawn('van_duoc_coc', 'herb_mantis', 10, 0.15, 0.5); spawn('van_duoc_coc', 'poison_toad', 10, 0.4, 0.8); spawn('van_duoc_coc', 'treant_old', 3, 0.6, 0.85); spawn('van_duoc_coc', 'boss_poison_queen', 1, 0.9, 0.92);
node('van_duoc_coc', 'herb', 'gt_herb_2', 0.15, 0.3, 0.45, 0.6, 0.75); node('van_duoc_coc', 'fishing', 'gt_fish_2', 0.5);
// Thiên Kiếm Tông
['npc_sect_master', 'npc_sect_elder', 'npc_sect_quartermaster', 'npc_sect_mission', 'npc_sect_gate'].forEach((n, i) => place('thien_kiem_tong', n, 14 + i * 9));
spawn('thien_kiem_tong', 'sect_puppet', 8, 0.6, 0.85); spawn('thien_kiem_tong', 'sword_crane', 6, 0.7, 0.92);
node('thien_kiem_tong', 'herb', 'gt_herb_2', 0.75, 0.9);
// U Minh Động
place('u_minh_dong', 'npc_ghost_hunter', 8);
spawn('u_minh_dong', 'ghost_wisp', 10, 0.1, 0.5); spawn('u_minh_dong', 'skeleton_warrior', 12, 0.3, 0.8); spawn('u_minh_dong', 'ghost_general', 3, 0.6, 0.85); spawn('u_minh_dong', 'boss_ghost_king', 1, 0.9, 0.92);
node('u_minh_dong', 'ore', 'gt_ore_2', 0.2, 0.45, 0.7);
interact('u_minh_dong', 'int_ghost_altar', 'Tế Đàn U Minh', 'mq_4_03', 'o1', 0.5);
// Cổ Chiến Trường
place('co_chien_truong', 'npc_war_veteran', 8);
spawn('co_chien_truong', 'war_ghost', 14, 0.1, 0.6); spawn('co_chien_truong', 'war_beast', 4, 0.5, 0.85); spawn('co_chien_truong', 'world_boss_war_god', 1, 0.9, 0.92);
node('co_chien_truong', 'ore', 'gt_ore_3', 0.3, 0.6);
interact('co_chien_truong', 'int_war_banner', 'Chiến Kỳ Rách Nát', 'mq_4_05', 'o1', 0.55);
// Tu Chân Giới
place('linh_van_chau', 'npc_immortal_guide', 8);
spawn('linh_van_chau', 'cloud_beast', 12, 0.1, 0.5); spawn('linh_van_chau', 'spirit_eagle', 10, 0.4, 0.8); spawn('linh_van_chau', 'rogue_cultivator', 4, 0.6, 0.9);
node('linh_van_chau', 'herb', 'gt_herb_3', 0.2, 0.4, 0.7); node('linh_van_chau', 'ore', 'gt_ore_3', 0.3, 0.6); node('linh_van_chau', 'fishing', 'gt_fish_3', 0.5);
['npc_th_city_lord', 'npc_th_merchant', 'npc_th_market', 'npc_th_teleporter', 'npc_th_storage', 'npc_th_guild', 'npc_th_arena', 'npc_th_skill_master'].forEach((n, i) => place('thien_huyen_thanh', n, 14 + i * 8));
['npc_treasure_pavilion', 'npc_auctioneer'].forEach((n, i) => place('van_bao_cac', n, 20 + i * 12));
spawn('van_bao_cac', 'treasure_mimic', 2, 0.7, 0.9);
place('loi_kiep_dai', 'npc_tribulation_elder', 8);
spawn('loi_kiep_dai', 'thunder_bird', 12, 0.1, 0.6); spawn('loi_kiep_dai', 'thunder_golem', 4, 0.5, 0.85); spawn('loi_kiep_dai', 'boss_thunder_roc', 1, 0.9, 0.92);
node('loi_kiep_dai', 'ore', 'gt_ore_4', 0.3, 0.6, 0.8);
place('thuong_co_bi_canh', 'npc_ancient_spirit', 8);
spawn('thuong_co_bi_canh', 'ancient_guardian', 14, 0.1, 0.7); spawn('thuong_co_bi_canh', 'ancient_serpent', 4, 0.5, 0.9);
node('thuong_co_bi_canh', 'herb', 'gt_herb_4', 0.25, 0.55); node('thuong_co_bi_canh', 'ore', 'gt_ore_4', 0.4, 0.75);
interact('thuong_co_bi_canh', 'int_ancient_tablet', 'Bia Đá Thượng Cổ', 'mq_5_04', 'o1', 0.45);
place('ma_vuc', 'npc_demon_defector', 8);
spawn('ma_vuc', 'demon_soldier', 14, 0.1, 0.6); spawn('ma_vuc', 'demon_sorcerer', 10, 0.4, 0.85); spawn('ma_vuc', 'boss_demon_lord', 1, 0.9, 0.92);
node('ma_vuc', 'ore', 'gt_ore_5', 0.3, 0.6);
place('thien_ngoai_chien_truong', 'npc_frontline_commander', 8);
spawn('thien_ngoai_chien_truong', 'void_walker', 18, 0.1, 0.85); spawn('thien_ngoai_chien_truong', 'world_boss_void_titan', 1, 0.9, 0.92);
node('thien_ngoai_chien_truong', 'ore', 'gt_ore_5', 0.3, 0.6); node('thien_ngoai_chien_truong', 'herb', 'gt_herb_5', 0.45, 0.75);
// Tiên Giới
place('phi_thang_dai', 'npc_ascension_envoy', 10);
spawn('phi_thang_dai', 'celestial_crane', 8, 0.5, 0.9);
['npc_ct_city_lord', 'npc_ct_merchant', 'npc_ct_market', 'npc_ct_storage', 'npc_ct_teleporter', 'npc_ct_skill_master'].forEach((n, i) => place('cuu_thien_tien_thanh', n, 14 + i * 9));
node('cuu_thien_tien_thanh', 'fishing', 'gt_fish_5', 0.9);
place('van_tien_son', 'npc_immortal_hermit', 8);
spawn('van_tien_son', 'heaven_soldier', 12, 0.1, 0.5); spawn('van_tien_son', 'star_spirit', 12, 0.4, 0.85); spawn('van_tien_son', 'qilin_young', 1, 0.6, 0.7);
node('van_tien_son', 'herb', 'gt_herb_6', 0.2, 0.5, 0.8); node('van_tien_son', 'ore', 'gt_ore_6', 0.35, 0.65);
place('thien_de_cung', 'npc_heaven_herald', 8);
spawn('thien_de_cung', 'heaven_general', 12, 0.1, 0.8); spawn('thien_de_cung', 'boss_heaven_emperor_guard', 1, 0.9, 0.92);
node('thien_de_cung', 'ore', 'gt_ore_6', 0.4, 0.7);
place('hon_don_hai', 'npc_chaos_ferryman', 8);
spawn('hon_don_hai', 'chaos_eel', 16, 0.1, 0.6); spawn('hon_don_hai', 'chaos_beast', 6, 0.5, 0.85); spawn('hon_don_hai', 'world_boss_chaos_dragon', 1, 0.9, 0.92);
node('hon_don_hai', 'ore', 'gt_ore_7', 0.3, 0.6); node('hon_don_hai', 'herb', 'gt_herb_7', 0.45, 0.75); node('hon_don_hai', 'fishing', 'gt_fish_7', 0.2);
// động phủ & đại điện
node('dong_phu', 'fishing', 'gt_fish_1', 0.85);

// ======================= NPC =======================
const npcs: Record<string, NpcDef> = {};
function ap(gender: 'male' | 'female', hair: number, hairColor: string, outfit: number, outfitColor: string, skin = '#f2c9a0', face = 0): Appearance {
  return { gender, hair, hairColor, face, eyes: 0, skin, outfit, outfitColor };
}
function npc(id: string, name: string, title: string, a: Appearance, greeting: string, extra: Partial<NpcDef> = {}): void {
  npcs[id] = { id, name, title, sprite: 'npc', appearance: a, greeting, ...extra };
}
npc('npc_village_chief', 'Lý Bá', 'Trưởng Thôn', ap('male', 3, '#d8d8d8', 2, '#7a5a3a'), 'Hài tử, thôn ta tuy nhỏ nhưng người người đều chân chất.');
npc('npc_father', 'Lâm Đại Sơn', 'Thợ Săn Già', ap('male', 1, '#3a3a3a', 1, '#5a6a3a'), 'Con à, rừng trúc gần đây không yên ổn, cẩn thận.');
npc('npc_martial_teacher', 'Trần Cương', 'Võ Sư', ap('male', 2, '#222222', 0, '#8a2a2a'), 'Muốn học võ? Trước tiên phải học chịu khổ.', { shop: 'shop_manuals_1', services: ['skills'] });
npc('npc_herbalist_girl', 'Tiểu Dược Linh', 'Dược Đồng', ap('female', 4, '#6a3a2a', 3, '#4a9a5a'), 'Thảo dược trong rừng chữa được bách bệnh đó!', { shop: 'shop_village_general', services: ['craft'] });
npc('npc_blacksmith_village', 'Vương Thiết', 'Thợ Rèn', ap('male', 0, '#2a2a2a', 1, '#5a4a3a', '#d9a878'), 'Muốn rèn đao kiếm? Đưa quặng đây.', { shop: 'shop_village_smith', services: ['enhance', 'craft'] });
npc('npc_storage_village', 'Lão Chu', 'Thủ Kho', ap('male', 3, '#aaaaaa', 2, '#4a4a6a'), 'Đồ đạc gửi chỗ lão, không mất một cây kim.', { services: ['storage', 'mail'] });
npc('npc_grandma', 'Bà Lão Mù', 'Người Kể Chuyện', ap('female', 3, '#eeeeee', 2, '#5a4a5a'), 'Ngươi... có mùi linh khí cổ xưa...');
npc('npc_hunter', 'A Tứ', 'Thợ Săn', ap('male', 1, '#4a2a1a', 1, '#4a6a2a'), 'Yêu thú trong rừng ngày càng hung dữ.');
npc('npc_lost_child', 'Tiểu Bảo', 'Đứa Trẻ Lạc', ap('male', 0, '#2a1a0a', 0, '#c0a040'), 'Hu hu... con muốn về nhà...');
npc('npc_scout', 'Triệu Ảnh', 'Trinh Sát Thanh Vân', ap('female', 1, '#1a1a1a', 4, '#2a2a4a'), 'Hắc Phong Trại đang tụ tập binh mã.');
npc('npc_captive_merchant', 'Tiền Phú Quý', 'Thương Nhân', ap('male', 2, '#5a3a1a', 2, '#a07a2a'), 'Cứu ta với! Ta sẽ hậu tạ!');
npc('npc_city_lord', 'Mộ Dung Thanh', 'Thành Chủ Thanh Vân', ap('male', 2, '#1a1a1a', 3, '#2a4a8a'), 'Thanh Vân Thành luôn chào đón anh hùng.');
npc('npc_merchant_city', 'Hà Ký', 'Tạp Hóa', ap('male', 0, '#3a2a1a', 2, '#8a6a3a'), 'Hàng tốt giá rẻ, mua đi mua đi!', { shop: 'shop_city_general' });
npc('npc_market', 'Lục Kim', 'Quản Sự Chợ', ap('female', 2, '#2a1a1a', 3, '#aa4a6a'), 'Muốn mua bán với các hiệp khách khác? Đến đây.', { services: ['market', 'auction'] });
npc('npc_guild_manager', 'Bạch Vân Sứ', 'Tông Môn Sứ', ap('male', 3, '#cccccc', 3, '#dadada'), 'Lập tông môn, tụ hợp đồng đạo.', { services: ['guild'] });
npc('npc_arena_master', 'Thiết Diện', 'Chủ Đấu Trường', ap('male', 0, '#1a1a1a', 1, '#6a1a1a', '#c09070'), 'Đấu trường chỉ nói chuyện bằng nắm đấm.', { services: ['arena'] });
npc('npc_housing_agent', 'Phương Địa Chủ', 'Địa Chủ', ap('male', 2, '#4a3a2a', 2, '#6a5a2a'), 'Động phủ thượng hạng, linh khí dồi dào!', { services: ['housing'] });
npc('npc_teleporter', 'Phi Mã Dịch Trạm', 'Dịch Trạm', ap('male', 1, '#3a3a3a', 1, '#3a5a7a'), 'Đi đâu? Trả tiền rồi lên ngựa.', { services: ['teleport'], teleports: ['tan_thu_thon', 'thanh_van_thanh', 'co_kiem_son_trang', 'yeu_thu_son_mach', 'thien_kiem_tong', 'co_chien_truong'] });
npc('npc_storage_city', 'Kim Khố Quản', 'Thủ Kho', ap('female', 0, '#2a1a1a', 2, '#5a5a8a'), 'Kho bạc Thanh Vân, an toàn tuyệt đối.', { services: ['storage', 'mail'] });
npc('npc_alchemist_master', 'Đan Thánh Tôn', 'Đan Sư', ap('male', 3, '#eeeeee', 3, '#aa6a2a'), 'Luyện đan cần kiên nhẫn và hỏa hầu.', { shop: 'shop_alchemy', services: ['craft'] });
npc('npc_forge_master', 'Âu Dã Tử', 'Đại Sư Luyện Khí', ap('male', 0, '#6a2a1a', 1, '#3a2a2a', '#c09070'), 'Trang bị tốt cần được tôi luyện.', { shop: 'shop_city_smith', services: ['enhance', 'craft'] });
npc('npc_pet_keeper', 'Linh Nhi', 'Ngự Thú Sư', ap('female', 4, '#aa6a2a', 3, '#6aaa4a'), 'Linh thú là bạn đồng hành trung thành nhất.', { shop: 'shop_pets', services: ['pets'] });
npc('npc_event', 'Nguyệt Sứ', 'Sứ Giả Sự Kiện', ap('female', 2, '#2a2a5a', 3, '#ffaa4a'), 'Lễ hội đang diễn ra, mau tham gia!', { shop: 'shop_event' });
npc('npc_tailor', 'Tô Cẩm Nương', 'Thợ May', ap('female', 1, '#3a1a1a', 3, '#da6a8a'), 'Y phục đẹp tôn lên khí chất tu sĩ.', { shop: 'shop_fashion', services: ['craft'] });
npc('npc_bounty_board', 'Bảng Treo Thưởng', 'Nhiệm Vụ Hằng Ngày', ap('male', 0, '#1a1a1a', 1, '#4a3a2a'), 'Những yêu cầu treo thưởng mới nhất.');
npc('npc_fisherman', 'Ngư Ông', 'Ngư Phủ', ap('male', 3, '#cccccc', 1, '#4a5a6a'), 'Câu cá cũng là tu tâm.', { shop: 'shop_fishing' });
npc('npc_academy_dean', 'Tư Mã Huyền', 'Viện Trưởng', ap('male', 3, '#bbbbbb', 3, '#3a3a6a'), 'Học viện là nơi rèn luyện, không phải nơi nghỉ ngơi.');
npc('npc_academy_instructor', 'Lôi Chấn', 'Giáo Đầu', ap('male', 0, '#1a1a1a', 0, '#5a2a2a'), 'Muốn học công pháp mới? Xem ở đây.', { shop: 'shop_manuals_2', services: ['skills'] });
npc('npc_academy_librarian', 'Thư Lão', 'Quản Thư', ap('male', 3, '#dddddd', 2, '#4a4a2a'), 'Sách là kho tàng vô giá.');
npc('npc_sword_villa_master', 'Âu Dương Kiếm', 'Trang Chủ', ap('male', 2, '#3a3a3a', 3, '#6a6a6a'), 'Cổ Kiếm Sơn Trang đã suy tàn...');
npc('npc_old_servant', 'Phúc Bá', 'Lão Bộc', ap('male', 3, '#cccccc', 2, '#4a3a2a'), 'Lão đã hầu hạ ba đời trang chủ.');
npc('npc_beast_tamer', 'Mạc Hổ', 'Thợ Săn Yêu Thú', ap('male', 1, '#3a2a1a', 1, '#6a4a2a', '#c09070'), 'Muốn thu phục linh thú? Dùng Thu Hồn Phù khi nó yếu.', { shop: 'shop_pets', services: ['pets'] });
npc('npc_injured_disciple', 'Tống Viễn', 'Đệ Tử Bị Thương', ap('male', 0, '#1a1a1a', 0, '#5a7aaa'), 'Khụ... yêu thú quá mạnh...');
npc('npc_valley_master', 'Dược Vương', 'Cốc Chủ', ap('male', 3, '#eeeeee', 3, '#4a8a4a'), 'Vạn Dược Cốc chỉ đón người hữu duyên.', { shop: 'shop_alchemy', services: ['craft'] });
npc('npc_poisoned_villager', 'Lưu Nhị', 'Dân Làng Trúng Độc', ap('male', 1, '#2a2a2a', 1, '#6a6a4a'), 'Ta... trúng độc rồi...');
npc('npc_sect_master', 'Kiếm Vô Trần', 'Tông Chủ Thiên Kiếm Tông', ap('male', 2, '#eeeeee', 3, '#eaeaff'), 'Kiếm tâm thông minh, mới thành đại đạo.');
npc('npc_sect_elder', 'Thanh Phong Trưởng Lão', 'Truyền Công Trưởng Lão', ap('male', 3, '#dddddd', 3, '#8aaaee'), 'Muốn học công pháp tông môn, phải có cống hiến.', { shop: 'shop_manuals_3', services: ['skills'] });
npc('npc_sect_quartermaster', 'Hoàng Quản Sự', 'Quản Sự Tông Môn', ap('male', 0, '#2a2a2a', 2, '#4a6aaa'), 'Vật tư tông môn, đổi bằng linh thạch.', { shop: 'shop_sect' });
npc('npc_sect_mission', 'Nhiệm Vụ Đường', 'Chấp Sự', ap('female', 1, '#1a1a1a', 4, '#6a8aca'), 'Đệ tử tông môn mỗi ngày đều phải làm nhiệm vụ.');
npc('npc_sect_gate', 'Thủ Giới Sứ', 'Người Giữ Cổng Giới', ap('male', 3, '#ffffff', 3, '#c0c0ff'), 'Phàm nhân không qua được cổng giới.', { services: ['teleport'], teleports: ['linh_van_chau'] });
npc('npc_ghost_hunter', 'Chung Quỳ Hậu Nhân', 'Trừ Quỷ Sư', ap('male', 0, '#1a1a1a', 1, '#2a2a2a', '#c09070'), 'Âm khí ở đây đặc quánh.');
npc('npc_war_veteran', 'Lão Binh Tần', 'Cựu Binh', ap('male', 3, '#aaaaaa', 1, '#5a3a2a'), 'Chiến trường này từng nhuộm máu vạn người.');
npc('npc_immortal_guide', 'Vân Du Tử', 'Tiếp Dẫn Sứ', ap('male', 3, '#ffffff', 3, '#aaddff'), 'Chào mừng đến Tu Chân Giới, tiểu hữu.');
npc('npc_th_city_lord', 'Huyền Cơ Chân Nhân', 'Thành Chủ Thiên Huyền', ap('male', 2, '#ffffff', 3, '#5a3a8a'), 'Thiên Huyền Thành không cho phép tranh đấu.');
npc('npc_th_merchant', 'Đa Bảo Thương', 'Thương Nhân', ap('male', 0, '#3a2a1a', 2, '#aa8a3a'), 'Đan dược, phù lục, đủ cả!', { shop: 'shop_th_general' });
npc('npc_th_market', 'Kim Ngọc Quản Sự', 'Quản Sự Chợ', ap('female', 2, '#1a1a1a', 3, '#aa6aaa'), 'Chợ tu sĩ — mua bán tự do.', { services: ['market', 'auction'] });
npc('npc_th_teleporter', 'Truyền Tống Trận Sư', 'Trận Sư', ap('male', 1, '#2a2a5a', 3, '#3a6aaa'), 'Truyền tống trận đi khắp Tu Chân Giới.', { services: ['teleport'], teleports: ['linh_van_chau', 'thien_huyen_thanh', 'loi_kiep_dai', 'thuong_co_bi_canh', 'ma_vuc', 'thanh_van_thanh', 'phi_thang_dai'] });
npc('npc_th_storage', 'Tàng Bảo Sứ', 'Thủ Kho', ap('male', 3, '#bbbbbb', 2, '#4a4a6a'), 'Gửi đồ ở đây, rút ở mọi nơi.', { services: ['storage', 'mail'] });
npc('npc_th_guild', 'Tông Vụ Sứ', 'Tông Môn Sứ', ap('male', 2, '#2a2a2a', 3, '#dadada'), 'Quản lý tông môn.', { services: ['guild'] });
npc('npc_th_arena', 'Luận Đạo Đài Chủ', 'Đấu Trường', ap('female', 1, '#aa2a2a', 4, '#6a1a1a'), 'Luận đạo bằng kiếm!', { services: ['arena'] });
npc('npc_th_skill_master', 'Tàng Kinh Các Chủ', 'Truyền Pháp', ap('male', 3, '#eeeeee', 3, '#3a5a8a'), 'Công pháp cao thâm đều ở Tàng Kinh Các.', { shop: 'shop_manuals_4', services: ['skills'] });
npc('npc_treasure_pavilion', 'Vạn Bảo Lão Nhân', 'Các Chủ', ap('male', 3, '#ffffff', 3, '#aa8a2a'), 'Bảo vật thiên hạ, chỉ chờ người có linh thạch.', { shop: 'shop_treasure', services: ['enhance'] });
npc('npc_auctioneer', 'Ngọc Thù', 'Đấu Giá Sư', ap('female', 2, '#1a1a2a', 3, '#aa3a5a'), 'Phiên đấu giá luôn mở.', { services: ['auction'] });
npc('npc_tribulation_elder', 'Độ Ách Lão Tổ', 'Hộ Kiếp Nhân', ap('male', 3, '#ffffff', 3, '#6a6aaa'), 'Thiên kiếp vô tình, chuẩn bị kỹ mới vượt qua.', { services: ['breakthrough'] });
npc('npc_ancient_spirit', 'Cổ Linh', 'Tàn Hồn Thượng Cổ', ap('male', 3, '#aaffff', 3, '#5aaaaa', '#cce0ff'), 'Truyền thừa... chờ người kế tục...');
npc('npc_demon_defector', 'Mặc Uyên', 'Ma Tu Quy Thuận', ap('female', 1, '#5a1a2a', 4, '#3a1a2a', '#e0c0c0'), 'Ma đạo cũng có kẻ muốn quay đầu.');
npc('npc_frontline_commander', 'Thiết Huyết Tướng Quân', 'Thống Lĩnh', ap('male', 0, '#2a2a2a', 1, '#8a2a2a'), 'Thiên ngoại tà ma không được bước qua phòng tuyến!');
npc('npc_ascension_envoy', 'Tiếp Dẫn Tiên Quan', 'Tiên Quan', ap('female', 2, '#ffffff', 3, '#ffeeaa', '#fff0e0'), 'Chúc mừng phi thăng, tân tiên nhân.');
npc('npc_ct_city_lord', 'Cửu Thiên Huyền Nữ', 'Thành Chủ Tiên Thành', ap('female', 2, '#eeeeff', 3, '#aaccff', '#fff0e0'), 'Tiên thành là nơi tiên nhân an cư.');
npc('npc_ct_merchant', 'Tiên Thương', 'Thương Nhân', ap('male', 0, '#5a3a1a', 2, '#ffcc6a'), 'Tiên đan tiên phù!', { shop: 'shop_ct_general' });
npc('npc_ct_market', 'Thiên Thị Quản Sự', 'Quản Sự Chợ', ap('male', 1, '#2a2a2a', 3, '#aaaaee'), 'Chợ tiên giới.', { services: ['market', 'auction'] });
npc('npc_ct_storage', 'Tiên Khố Sứ', 'Thủ Kho', ap('female', 0, '#1a1a1a', 2, '#ccccff'), 'Tiên khố.', { services: ['storage', 'mail'] });
npc('npc_ct_teleporter', 'Tinh Môn Sứ', 'Truyền Tống', ap('male', 3, '#ffffff', 3, '#ffffcc'), 'Tinh môn thông khắp tiên giới.', { services: ['teleport'], teleports: ['phi_thang_dai', 'cuu_thien_tien_thanh', 'van_tien_son', 'thien_de_cung', 'hon_don_hai', 'thien_huyen_thanh'] });
npc('npc_ct_skill_master', 'Tiên Pháp Truyền Nhân', 'Truyền Pháp', ap('male', 2, '#ffffff', 3, '#ffccaa'), 'Tiên pháp vô biên.', { shop: 'shop_manuals_5', services: ['skills'] });
npc('npc_immortal_hermit', 'Ẩn Tiên', 'Ẩn Sĩ', ap('male', 3, '#ffffff', 2, '#8aaa8a'), 'Danh lợi như mây khói.');
npc('npc_heaven_herald', 'Truyền Lệnh Tiên Quan', 'Tiên Quan', ap('male', 2, '#eeeeee', 3, '#ffd700'), 'Thiên Đế Cung, phàm tiên không được tự tiện.');
npc('npc_chaos_ferryman', 'Độ Hải Nhân', 'Người Chèo Đò', ap('male', 3, '#888888', 1, '#2a2a3a'), 'Bên kia Hỗn Độn Hải là gì? Chưa ai trở về kể lại...');

// ======================= CỬA HÀNG =======================
const shops: Record<string, ShopDef> = {};
function shop(id: string, name: string, items: [string, number, ('gold' | 'spirit_stones')?][]): void {
  shops[id] = { id, name, items: items.map(([item, price, currency]) => ({ item, price, currency: currency ?? 'gold' })) };
}
shop('shop_village_general', 'Tạp Hóa Thôn', [['pill_hp_1', 15], ['pill_mp_1', 12], ['tal_return', 40], ['tool_pick_1', 60], ['tool_sickle_1', 60], ['tool_rod_1', 60], ['tool_furnace_1', 120], ['seed_t1', 6], ['pet_food_1', 20], ['mat_paper', 5], ['mat_cinnabar', 12], ['mat_silk', 14], ['mat_wood', 8], ['tal_capture_1', 100]]);
shop('shop_village_smith', 'Lò Rèn Thôn', [['eq_weapon_0', 40], ['eq_armor_0', 40], ['eq_helmet_0', 30], ['eq_boots_0', 30], ['eq_weapon_1', 120], ['eq_armor_1', 120], ['stone_enhance', 70], ['tool_hammer_1', 120]]);
shop('shop_city_general', 'Tạp Hóa Thanh Vân', [['pill_hp_1', 15], ['pill_hp_2', 60], ['pill_mp_1', 12], ['pill_mp_2', 50], ['tal_return', 40], ['tal_speed', 80], ['tal_shield', 200], ['pill_cleanse', 50], ['pill_atk', 160], ['pill_def', 160], ['tal_capture_1', 100], ['tool_brush', 150], ['tool_compass', 260], ['tool_needle', 150], ['mat_paper', 5], ['mat_cinnabar', 12], ['mat_silk', 14], ['mat_wood', 8], ['seed_t1', 6], ['seed_t2', 20]]);
shop('shop_city_smith', 'Luyện Khí Phường', [...[1, 2, 3, 4, 5].flatMap((r) => ['weapon', 'armor', 'helmet', 'boots', 'ring', 'amulet'].map((s) => [`eq_${s}_${r}`, Math.round(60 * Math.pow(1.6, r))] as [string, number])), ['stone_enhance', 70], ['stone_socket', 400], ['tool_hammer_2', 600], ['tool_pick_2', 300]]);
shop('shop_alchemy', 'Đan Phường', [['herb_t1', 10], ['herb_t2', 35], ['tool_furnace_1', 120], ['tool_furnace_2', 700], ['pill_bt_1', 120], ['pill_bt_2', 260], ['pill_bt_3', 500], ['pill_tuvi_1', 80], ['seed_t2', 20], ['seed_t3', 70]]);
shop('shop_pets', 'Linh Thú Các', [['pet_food_1', 20], ['pet_food_2', 260], ['tal_capture_1', 100], ['tal_capture_2', 800], ['egg_fox', 3000], ['pgear_collar_1', 400], ['mount_horse', 5000]]);
shop('shop_event', 'Lễ Hội', [['ev_mooncake', 5, 'spirit_stones'], ['fashion_festival', 60, 'spirit_stones']]);
shop('shop_fashion', 'Cẩm Y Phường', [['fashion_white_robe', 3000], ['fashion_red_robe', 3000], ['fashion_black_robe', 20, 'spirit_stones'], ['mat_silk', 14], ['furn_table', 300], ['furn_lamp', 300], ['furn_cushion', 900]]);
shop('shop_fishing', 'Ngư Cụ', [['tool_rod_1', 60], ['tool_rod_2', 300], ['pet_food_1', 20]]);
shop('shop_sect', 'Vật Tư Tông Môn', [['pill_bt_5', 6, 'spirit_stones'], ['pill_bt_6', 10, 'spirit_stones'], ['pill_bt_7', 16, 'spirit_stones'], ['pill_bt_8', 25, 'spirit_stones'], ['pill_bt_9', 40, 'spirit_stones'], ['pill_bt_10', 65, 'spirit_stones'], ['pill_bt_assist', 12, 'spirit_stones'], ['pill_marrow', 30, 'spirit_stones'], ['stone_refine', 2, 'spirit_stones'], ['pill_hp_3', 400], ['pill_mp_3', 350], ['mat_formation_flag', 300]]);
shop('shop_th_general', 'Đa Bảo Hiệu', [['pill_hp_3', 400], ['pill_hp_4', 2400], ['pill_mp_3', 350], ['pill_mp_4', 2000], ['tal_return', 40], ['tal_shield', 200], ['pill_bt_11', 90, 'spirit_stones'], ['pill_bt_12', 140, 'spirit_stones'], ['pill_bt_13', 220, 'spirit_stones'], ['seed_t3', 70], ['seed_t4', 240], ['tool_pick_3', 1500], ['tool_sickle_3', 1500], ['tool_rod_3', 1500], ['tool_furnace_3', 3500], ['tool_hammer_3', 3500]]);
shop('shop_treasure', 'Vạn Bảo Các', [['stone_reroll', 8, 'spirit_stones'], ['stone_socket', 3, 'spirit_stones'], ['gem_ruby_2', 15, 'spirit_stones'], ['gem_sapphire_2', 15, 'spirit_stones'], ['gem_emerald_2', 15, 'spirit_stones'], ['gem_topaz_2', 15, 'spirit_stones'], ['gem_onyx_2', 20, 'spirit_stones'], ['egg_crane', 120, 'spirit_stones'], ['mount_crane', 300, 'spirit_stones'], ['pet_evolve_stone', 20, 'spirit_stones'], ['furn_statue', 50, 'spirit_stones'], ['furn_cauldron', 25, 'spirit_stones'], ['pill_bt_assist', 12, 'spirit_stones']]);
shop('shop_ct_general', 'Tiên Thị', [['pill_hp_5', 20000], ['pill_mp_5', 18000], ['tal_return', 40], ['tal_capture_3', 12000], ['pill_tuvi_5', 400, 'spirit_stones'], ['seed_t6', 3000], ['tool_pick_5', 40000], ['tool_sickle_5', 40000], ['tool_furnace_5', 80000], ['pgear_collar_3', 50000], ['fashion_immortal', 800, 'spirit_stones']]);
// Bí tịch theo bậc
const manualShop = (id: string, name: string, tier: number) => shop(id, name, ['kiem', 'dao', 'quyen', 'the', 'phap', 'loi', 'hoa', 'bang', 'doc', 'phu', 'tran', 'ngu'].map((p) => [`manual_${p}_${tier}`, Math.round(150 * Math.pow(4, tier - 1))] as [string, number]));
manualShop('shop_manuals_1', 'Võ Quán — Công Pháp Nhập Môn', 1);
manualShop('shop_manuals_2', 'Học Viện — Công Pháp Trung Cấp', 2);
manualShop('shop_manuals_3', 'Truyền Công Các', 3);
manualShop('shop_manuals_4', 'Tàng Kinh Các', 4);
manualShop('shop_manuals_5', 'Tiên Pháp Các', 5);

// ======================= LINH THÚ =======================
export const PETS: Record<string, PetDef> = {
  pet_fox: { id: 'pet_fox', name: 'Linh Hồ', sprite: 'fox', element: 'hoa', baseStats: { maxHp: 120, atk: 14, matk: 18, def: 6, mdef: 8 }, growth: 1.05, skills: ['m_firebolt'], evolvesTo: 'pet_fox_9tail', evolveLevel: 30, evolveItems: [{ item: 'pet_evolve_stone', qty: 3 }, { item: 'mat_fox_tail', qty: 9 }] },
  pet_fox_9tail: { id: 'pet_fox_9tail', name: 'Cửu Vĩ Thiên Hồ', sprite: 'fox', element: 'hoa', baseStats: { maxHp: 400, atk: 40, matk: 60, def: 20, mdef: 26 }, growth: 1.055, skills: ['m_firebolt', 'm_meteor'] },
  pet_wolf: { id: 'pet_wolf', name: 'Linh Lang', sprite: 'wolf', element: 'none', baseStats: { maxHp: 160, atk: 18, matk: 8, def: 8, mdef: 5 }, growth: 1.05, skills: ['m_bite', 'm_charge'], evolvesTo: 'pet_wolf_king', evolveLevel: 30, evolveItems: [{ item: 'pet_evolve_stone', qty: 3 }, { item: 'mat_wolf_fang', qty: 20 }], mountable: true },
  pet_wolf_king: { id: 'pet_wolf_king', name: 'Thiên Lang Vương', sprite: 'wolf', element: 'none', baseStats: { maxHp: 520, atk: 60, matk: 20, def: 28, mdef: 18 }, growth: 1.055, skills: ['m_bite', 'm_charge', 'm_howl'], mountable: true },
  pet_tiger: { id: 'pet_tiger', name: 'Ban Lan Hổ', sprite: 'tiger', element: 'none', baseStats: { maxHp: 220, atk: 22, matk: 8, def: 12, mdef: 8 }, growth: 1.052, skills: ['m_bite', 'm_charge'], evolvesTo: 'pet_tiger_white', evolveLevel: 40, evolveItems: [{ item: 'pet_evolve_stone', qty: 5 }, { item: 'mat_tiger_claw', qty: 20 }], mountable: true },
  pet_tiger_white: { id: 'pet_tiger_white', name: 'Bạch Hổ Thần Thú', sprite: 'tiger', element: 'none', baseStats: { maxHp: 800, atk: 90, matk: 30, def: 40, mdef: 30 }, growth: 1.056, skills: ['m_bite', 'm_charge', 'm_slam'], mountable: true },
  pet_crane_young: { id: 'pet_crane_young', name: 'Kiếm Hạc Non', sprite: 'bird', element: 'none', baseStats: { maxHp: 140, atk: 16, matk: 16, def: 8, mdef: 10 }, growth: 1.05, skills: ['m_shadow'], evolvesTo: 'pet_crane', evolveLevel: 35, evolveItems: [{ item: 'pet_evolve_stone', qty: 4 }, { item: 'mat_thunder_feather', qty: 10 }] },
  pet_crane: { id: 'pet_crane', name: 'Tiên Hạc', sprite: 'bird', element: 'bang', baseStats: { maxHp: 300, atk: 30, matk: 45, def: 16, mdef: 22 }, growth: 1.055, skills: ['m_icebolt', 'm_barrage'], mountable: true },
  pet_qilin: { id: 'pet_qilin', name: 'Kỳ Lân', sprite: 'tiger', element: 'hoa', baseStats: { maxHp: 900, atk: 80, matk: 90, def: 40, mdef: 40 }, growth: 1.058, skills: ['m_firebolt', 'm_charge', 'm_meteor'], mountable: true },
  summon_wolf: { id: 'summon_wolf', name: 'Linh Lang (Triệu Hồi)', sprite: 'wolf', element: 'none', baseStats: { maxHp: 0.4, atk: 0.5 }, growth: 1, skills: ['m_bite'] },
  summon_tiger: { id: 'summon_tiger', name: 'Hổ Vương (Triệu Hồi)', sprite: 'tiger', element: 'none', baseStats: { maxHp: 0.7, atk: 0.8 }, growth: 1, skills: ['m_bite', 'm_charge'] },
};

// ======================= PHÓ BẢN =======================
export const DUNGEONS: Record<string, DungeonDef> = {
  dg_hac_phong_trai: { id: 'dg_hac_phong_trai', name: 'Hắc Phong Trại', map: 'dg_hac_phong_trai', reqRealm: 2, minPlayers: 1, maxPlayers: 5, waves: [[{ monster: 'bandit_thug', count: 6 }], [{ monster: 'bandit_archer', count: 4 }, { monster: 'dg_bandit_elite', count: 2 }]], boss: 'dg_boss_bandit_lord', timeLimit: 900, dailyLimit: 3, rewards: { exp: 4000, tuvi: 2000, gold: 1500, items: [{ item: 'stone_enhance', qty: 5, chance: 1 }, { item: 'pill_bt_3', qty: 1, chance: 0.5 }] } },
  dg_quy_mau_dong: { id: 'dg_quy_mau_dong', name: 'Quỷ Mẫu Động', map: 'dg_quy_mau_dong', reqRealm: 7, minPlayers: 1, maxPlayers: 5, waves: [[{ monster: 'ghost_wisp', count: 6 }], [{ monster: 'skeleton_warrior', count: 6 }, { monster: 'dg_ghost', count: 2 }]], boss: 'dg_boss_ghost_mother', timeLimit: 900, dailyLimit: 3, rewards: { exp: 90000, tuvi: 50000, gold: 15000, items: [{ item: 'stone_refine', qty: 3, chance: 1 }, { item: 'pill_bt_8', qty: 1, chance: 0.5 }] } },
  dg_thao_thiet: { id: 'dg_thao_thiet', name: 'Thao Thiết Bí Cảnh', map: 'dg_thao_thiet', reqRealm: 13, minPlayers: 1, maxPlayers: 5, waves: [[{ monster: 'ancient_guardian', count: 6 }], [{ monster: 'dg_ancient_construct', count: 3 }, { monster: 'ancient_serpent', count: 2 }]], boss: 'dg_boss_ancient_beast', timeLimit: 1200, dailyLimit: 2, rewards: { exp: 3e6, tuvi: 2e6, gold: 200000, items: [{ item: 'stone_reroll', qty: 2, chance: 1 }, { item: 'pill_bt_14', qty: 1, chance: 0.5 }] } },
  dg_doa_tien: { id: 'dg_doa_tien', name: 'Đọa Tiên Uyên', map: 'dg_doa_tien', reqRealm: 21, minPlayers: 1, maxPlayers: 5, waves: [[{ monster: 'star_spirit', count: 6 }], [{ monster: 'dg_immortal_shade', count: 4 }]], boss: 'dg_boss_fallen_immortal', timeLimit: 1200, dailyLimit: 2, rewards: { exp: 1e8, tuvi: 6e7, gold: 3e6, items: [{ item: 'stone_reroll', qty: 4, chance: 1 }, { item: 'pill_bt_22', qty: 1, chance: 0.5 }] } },
};

// ======================= ĐỘNG PHỦ =======================
export const BUILDINGS: Record<string, HousingBuildingDef> = {
  linh_dien: { id: 'linh_dien', name: 'Linh Điền', maxLevel: 5, desc: 'Ruộng linh thảo — mỗi cấp thêm 2 ô trồng.', effect: 'plots', perLevel: 2, costs: [1, 2, 3, 4, 5].map((l) => ({ gold: 2000 * Math.pow(3, l - 1), spirit_stones: l >= 3 ? 10 * l : 0, items: [{ item: 'mat_wood', qty: 10 * l }] })) },
  tu_linh_tran: { id: 'tu_linh_tran', name: 'Tụ Linh Trận', maxLevel: 10, desc: 'Trận pháp tụ linh — +15% tốc độ đả tọa mỗi cấp (trong động phủ).', effect: 'cultivation', perLevel: 0.15, costs: Array.from({ length: 10 }, (_, i) => ({ gold: 5000 * Math.pow(2.5, i), spirit_stones: 5 * Math.pow(2, i), items: [{ item: 'mat_formation_flag', qty: 1 + i }] })) },
  dan_phong: { id: 'dan_phong', name: 'Đan Phòng', maxLevel: 5, desc: 'Phòng luyện đan — giảm 10% thời gian chế tạo mỗi cấp.', effect: 'craft_speed', perLevel: 0.1, costs: [1, 2, 3, 4, 5].map((l) => ({ gold: 4000 * Math.pow(3, l - 1), spirit_stones: 8 * l, items: [{ item: 'ore_t' + Math.min(7, l), qty: 10 }] })) },
  tang_bao_cac: { id: 'tang_bao_cac', name: 'Tàng Bảo Các', maxLevel: 5, desc: 'Mở rộng kho đồ thêm 20 ô mỗi cấp.', effect: 'storage', perLevel: 20, costs: [1, 2, 3, 4, 5].map((l) => ({ gold: 3000 * Math.pow(3, l - 1), spirit_stones: 5 * l, items: [{ item: 'mat_wood', qty: 20 * l }] })) },
  linh_thu_vien: { id: 'linh_thu_vien', name: 'Linh Thú Viên', maxLevel: 5, desc: '+20% kinh nghiệm cho linh thú mỗi cấp.', effect: 'pet_exp', perLevel: 0.2, costs: [1, 2, 3, 4, 5].map((l) => ({ gold: 3000 * Math.pow(3, l - 1), spirit_stones: 5 * l, items: [{ item: 'pet_food_1', qty: 20 * l }] })) },
};
/** Cấp động phủ: cấp 5+ là Tiên Phủ (cần cảnh giới Tiên Giới) */
export const HOUSING_LEVELS = [
  { level: 1, name: 'Thạch Động', cost: { gold: 5000, spirit_stones: 0 }, reqRealm: 1, maxFurniture: 6, maxBuildingLevel: 1 },
  { level: 2, name: 'Linh Động', cost: { gold: 40000, spirit_stones: 20 }, reqRealm: 6, maxFurniture: 10, maxBuildingLevel: 2 },
  { level: 3, name: 'Động Phủ', cost: { gold: 400000, spirit_stones: 100 }, reqRealm: 10, maxFurniture: 16, maxBuildingLevel: 4 },
  { level: 4, name: 'Đại Động Phủ', cost: { gold: 6e6, spirit_stones: 600 }, reqRealm: 14, maxFurniture: 24, maxBuildingLevel: 6 },
  { level: 5, name: 'Tiên Phủ', cost: { gold: 1e8, spirit_stones: 5000 }, reqRealm: 19, maxFurniture: 36, maxBuildingLevel: 8 },
  { level: 6, name: 'Động Thiên Phúc Địa', cost: { gold: 3e9, spirit_stones: 40000 }, reqRealm: 25, maxFurniture: 50, maxBuildingLevel: 10 },
];

// ======================= BẢNG THU THẬP =======================
export const GATHER_TABLES: Record<string, GatherTable> = {};
for (let t = 1; t <= 7; t++) {
  GATHER_TABLES[`gt_herb_${t}`] = { id: `gt_herb_${t}`, profession: 'herbalism', level: (t - 1) * 8, seconds: 2.5 + t * 0.3, exp: 10 * t * t, loot: [{ item: `herb_t${t}`, weight: 80, min: 1, max: 2 }, { item: `seed_t${t}`, weight: 15, min: 1, max: 1 }, ...(t < 7 ? [{ item: `herb_t${t + 1}`, weight: 5, min: 1, max: 1 }] : [])] };
  GATHER_TABLES[`gt_ore_${t}`] = { id: `gt_ore_${t}`, profession: 'mining', level: (t - 1) * 8, seconds: 3 + t * 0.3, exp: 10 * t * t, loot: [{ item: `ore_t${t}`, weight: 80, min: 1, max: 2 }, { item: 'stone_enhance', weight: 12, min: 1, max: 1 }, { item: `gem_topaz_${Math.min(5, Math.ceil(t / 1.5))}`, weight: 3, min: 1, max: 1 }, ...(t < 7 ? [{ item: `ore_t${t + 1}`, weight: 5, min: 1, max: 1 }] : [])] };
  GATHER_TABLES[`gt_fish_${t}`] = { id: `gt_fish_${t}`, profession: 'fishing', level: (t - 1) * 8, seconds: 4 + t * 0.4, exp: 8 * t * t, loot: [{ item: `fish_t${t}`, weight: 75, min: 1, max: 1 }, { item: 'pet_food_1', weight: 15, min: 1, max: 2 }, { item: 'qi_lost_ring', weight: 2, min: 1, max: 1 }, ...(t < 7 ? [{ item: `fish_t${t + 1}`, weight: 8, min: 1, max: 1 }] : [])] };
}

// ======================= SỰ KIỆN THẾ GIỚI =======================
export const WORLD_EVENTS: Record<string, WorldEventDef> = {
  ev_lantern_festival: { id: 'ev_lantern_festival', name: 'Lễ Hội Hoa Đăng', desc: 'Niên Thú Đèn Lồng xuất hiện ở Thanh Vân Thành! Hợp sức đánh bại để nhận Hoa Đăng.', map: 'co_kiem_son_trang', boss: 'event_lantern_beast', durationMin: 30, dropMult: 1.5 },
  ev_double_exp: { id: 'ev_double_exp', name: 'Linh Khí Bộc Phát', desc: 'Linh khí thiên địa dâng trào: x2 kinh nghiệm và tu vi.', map: '*', durationMin: 60, expMult: 2 },
  ev_war_god: { id: 'ev_war_god', name: 'Chiến Thần Thức Tỉnh', desc: 'Cổ Chiến Thần Tàn Hồn hồi sinh tại Cổ Chiến Trường!', map: 'co_chien_truong', boss: 'world_boss_war_god', durationMin: 45 },
  ev_beast_tide: { id: 'ev_beast_tide', name: 'Thú Triều', desc: 'Yêu thú tràn xuống Rừng Thanh Trúc! Tiêu diệt để bảo vệ Tân Thủ Thôn.', map: 'rung_thanh_truc', durationMin: 20, spawns: [{ monster: 'wolf_black', count: 15, x1: 800, x2: 4000 }, { monster: 'boar_iron', count: 4, x1: 1200, x2: 4000 }], dropMult: 1.3 },
};

export const MAPS = maps;
export const NPCS = npcs;
export const SHOPS = shops;
export const NEAREST_CITY: Record<string, string> = { nhan_gioi: 'thanh_van_thanh', tu_chan_gioi: 'thien_huyen_thanh', tien_gioi: 'cuu_thien_tien_thanh', special: 'thanh_van_thanh' };

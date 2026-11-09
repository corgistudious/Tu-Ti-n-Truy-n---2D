/**
 * MỞ RỘNG THẾ GIỚI NHIỀU TẦNG (data-driven).
 * Thêm: Võ Đạo Giới, Linh Giới, Tiên Ma Chiến Trường, Thượng Tiên Giới, Thần Vực, Hỗn Độn Giới, Thái Cổ Giới, Vạn Giới Chân Cảnh,
 * khu vực ẩn (cơ duyên), phó bản mới, thành chính, chương chính tuyến 8–10.
 * Mỗi bản đồ đều có quái, tinh anh, boss/hoạt động, NPC, tài nguyên, nhiệm vụ — không có bản đồ rỗng.
 * Bản đồ mới được khai báo SAU bản đồ gốc nên seed của bản đồ cũ không đổi.
 */
import { TILE } from '../constants.js';
import type { BossPhase, DungeonDef, MonsterRank, WorldTierDef, WorldTierId } from '../types.js';
import { add as addItem } from './items.js';
import { mob, ph } from './monsters.js';
import { q } from './quests.js';
import { DUNGEONS, MAPS, NEAREST_CITY, NPCS, WORLD_EVENTS, ap, classify, interact, link, map, node, npc, place, shop, spawn } from './world.js';

// ---------- vật liệu đặc trưng từng tầng ----------
const MATS: [string, string, number][] = [
  ['mat_martial_relic', 'Võ Hồn Tàn Phiến', 3], ['mat_spirit_crystal', 'Linh Mạch Tinh Thể', 5], ['mat_tienma_blood', 'Tiên Ma Huyết', 7],
  ['mat_taixu_feather', 'Thái Hư Vũ', 8], ['mat_god_blood', 'Thần Huyết', 8], ['mat_chaos_core', 'Hỗn Độn Hạch', 9],
  ['mat_origin_dust', 'Khởi Nguyên Trần', 9], ['mat_myriad_fragment', 'Vạn Giới Mảnh Vỡ', 9], ['mat_law_shard', 'Pháp Tắc Toái Phiến', 9],
];
for (const [id, name, r] of MATS) addItem({ id, name, type: 'material', rarity: r, value: 10 * Math.pow(2.5, r), desc: 'Vật liệu đặc trưng của tầng thế giới cao, dùng luyện chế và nhiệm vụ.', icon: `icon_${id}`, sources: ['Quái vật', 'Boss'] });
const QI: [string, string][] = [['qi_martial_token', 'Võ Thần Lệnh'], ['qi_spirit_vein_map', 'Linh Mạch Đồ'], ['qi_tienma_banner', 'Tiên Ma Chiến Kỳ'], ['qi_taixu_key', 'Thái Hư Thiên Thược'],
  ['qi_god_seal', 'Thần Ấn'], ['qi_chaos_compass', 'Hỗn Độn La Bàn'], ['qi_origin_stone', 'Khởi Nguyên Thạch'], ['qi_myriad_crown', 'Vạn Giới Vương Miện Tàn']];
for (const [id, name] of QI) addItem({ id, name, type: 'quest', rarity: 6, value: 0, tradable: false, desc: 'Vật phẩm cốt truyện — không thể giao dịch.', icon: 'icon_quest', maxStack: 99 });

// ---------- định nghĩa tầng thế giới ----------
export const WORLD_TIERS: WorldTierDef[] = [
  { id: 'pham_nhan', name: 'Phàm Nhân Giới', order: 1, minRealm: 0, hub: 'thanh_van_thanh', desc: 'Nơi khởi đầu: làng biên giới, giang hồ, môn phái võ học.', continents: [] },
  { id: 'vo_dao', name: 'Võ Đạo Giới', order: 2, minRealm: 4, hub: 'thien_vo_thanh', desc: 'Thế giới của võ giả — đấu trường, tranh đoạt bí tịch, đỉnh cao võ đạo.', continents: [] },
  { id: 'tu_chan', name: 'Tu Chân Giới', order: 3, minRealm: 10, hub: 'thien_huyen_thanh', desc: 'Linh căn, công pháp, luyện đan luyện khí, tông môn và thiên kiếp.', continents: [] },
  { id: 'linh_gioi', name: 'Linh Giới', order: 4, minRealm: 13, hub: 'linh_thien_thanh', desc: 'Linh thú, linh mạch và truyền thừa — cầu nối giữa tu chân và tiên giới.', continents: [] },
  { id: 'tien_gioi', name: 'Tiên Giới', order: 5, minRealm: 19, hub: 'cuu_thien_tien_thanh', desc: 'Tiên lực, tiên pháp, tiên khí — và chiến tranh tiên ma.', continents: [] },
  { id: 'thuong_tien', name: 'Thượng Tiên Giới', order: 6, minRealm: 29, hub: 'thai_hu_thien', desc: 'Đại đạo, pháp tắc, truyền thừa thượng cổ.', continents: [] },
  { id: 'than_vuc', name: 'Thần Vực', order: 7, minRealm: 38, hub: 'than_dinh', desc: 'Thần lực, thần khí, thần thú, quyền năng pháp tắc.', continents: [] },
  { id: 'hon_don', name: 'Hỗn Độn Giới', order: 8, minRealm: 28, hub: 'hon_nguyen_dien', desc: 'Không gian, thời gian, luân hồi — bờ ngoài Hỗn Độn Hải mở cho Tiên Đế, sâu bên trong cần Hỗn Độn cảnh.', continents: [] },
  { id: 'thai_co', name: 'Thái Cổ Giới', order: 9, minRealm: 56, hub: 'thai_co_than_thanh', desc: 'Khởi nguyên, đại đạo, cổ thần và lịch sử vạn giới.', continents: [] },
  { id: 'van_gioi', name: 'Vạn Giới Chân Cảnh', order: 10, minRealm: 65, hub: 'van_gioi_chan_thanh', desc: 'Endgame mở: tranh danh hiệu, bí cảnh vô tận, đại chiến vạn giới — không có điểm kết thúc.', continents: [] },
];
export const CHAPTERS: Record<number, string> = {
  1: 'Thiếu Niên Nhập Đạo', 2: 'Giang Hồ Sơ Khởi', 3: 'Võ Đạo Tranh Phong', 4: 'Bí Mật Linh Căn', 5: 'Tu Chân Phong Vân',
  6: 'Thiên Kiếp Giáng Lâm', 7: 'Phi Thăng Tiên Giới', 8: 'Tiên Ma Đại Chiến', 9: 'Thần Vực Phong Thần', 10: 'Vạn Giới Tranh Bá',
};

// ---------- bộ kỹ năng theo nguyên tố ----------
type Elem = 'fire' | 'ice' | 'thunder' | 'poison' | 'phys' | 'void' | 'holy';
const POOL: Record<Elem, string[]> = {
  fire: ['m_firebolt', 'm_meteor', 'm_bite'], ice: ['m_icebolt', 'm_freeze_nova', 'm_bite'], thunder: ['m_thunder', 'm_lightning_strike', 'm_shadow'],
  poison: ['m_spit', 'm_void_zone', 'm_bite'], phys: ['m_bite', 'm_charge', 'm_slam', 'm_shadow'], void: ['m_void_zone', 'm_barrage', 'm_shadow'], holy: ['m_barrage', 'm_shield', 'm_heal', 'm_thunder'],
};
const EL: Record<Elem, 'hoa' | 'bang' | 'loi' | 'doc' | 'none'> = { fire: 'hoa', ice: 'bang', thunder: 'loi', poison: 'doc', phys: 'none', void: 'none', holy: 'none' };
type Mech = 'summon' | 'shield' | 'storm' | 'heal' | 'split';
/** Cơ chế boss khác nhau (không chỉ tăng HP): triệu hồi, khiên phải phá, bão vùng có báo hiệu, tự hồi phục phải ngắt, tăng tốc cuồng nộ */
function phases(name: string, el: Elem, mech: Mech, minion: string): BossPhase[] {
  const p = POOL[el];
  const strong = el === 'thunder' ? 'm_lightning_strike' : el === 'ice' ? 'm_freeze_nova' : el === 'fire' ? 'm_meteor' : 'm_void_zone';
  switch (mech) {
    case 'summon': return [ph(0.7, `${name} triệu hồi thuộc hạ!`, [...p], { summon: { monster: minion, count: 4 } }), ph(0.35, `${name} cuồng nộ!`, [...p, strong], { enrage: 1.5, speedMult: 1.3 })];
    case 'shield': return [ph(0.6, `${name} dựng hộ thể cương khí — phá khiên trước!`, [...p, 'm_shield'], { shieldPct: 0.25 }), ph(0.25, `${name} liều mạng!`, [...p, strong], { enrage: 1.6 })];
    case 'storm': return [ph(0.65, `${name} khai mở lĩnh vực — né vùng báo hiệu!`, [strong, 'm_void_zone', ...p]), ph(0.3, `${name} hóa thân bão tố!`, [strong, 'm_meteor', 'm_lightning_strike'], { enrage: 1.4, speedMult: 1.4 })];
    case 'heal': return [ph(0.55, `${name} hút linh khí tự hồi phục — dồn sát thương!`, ['m_heal', ...p], { summon: { monster: minion, count: 2 } }), ph(0.2, `${name} bộc phát!`, [...p, strong], { enrage: 1.7, shieldPct: 0.1 })];
    case 'split': return [ph(0.75, `${name} phân thân!`, [...p], { summon: { monster: minion, count: 3 } }), ph(0.5, `${name} hợp thể, phủ giáp!`, [...p, strong], { shieldPct: 0.15 }), ph(0.2, `${name} khai thiên!`, [strong, 'm_meteor', 'm_void_zone'], { enrage: 1.8, speedMult: 1.3 })];
  }
}

// ---------- bảng nội dung bản đồ ----------
interface MobSpec { a: string; n: string; el: Elem; capt?: string }
interface Area {
  id: string; name: string; tier: WorldTierId; cont: string; reg: string; theme: string; terrain: 'plains' | 'hills' | 'mountain' | 'city' | 'cave' | 'sky' | 'arena' | 'sea';
  realm: number; w: number; desc?: string; weather: 'clear' | 'rain' | 'snow' | 'mist' | 'ash' | 'petals' | 'storm'; bgm: string;
  city?: boolean; pvp?: boolean; hidden?: boolean; density?: number;
  mobs?: MobSpec[]; elite?: MobSpec; boss?: MobSpec & { mech: Mech; world?: boolean }; mat: string;
  npc?: [string, string, string, string]; // id, tên, danh xưng, lời chào
  quest?: 'hunt' | 'gather' | 'investigate' | 'escort' | 'rescue' | 'realm';
}
const A: Area[] = [
  // ===== VÕ ĐẠO GIỚI =====
  { id: 'thien_vo_thanh', name: 'Thiên Võ Thành', tier: 'vo_dao', cont: 'vo_chau', reg: 'thien_vo', theme: 'martial_city', terrain: 'city', realm: 5, w: 150, city: true, weather: 'clear', bgm: 'bgm_city', mat: 'mat_martial_relic', desc: 'Kinh đô võ đạo, nơi võ giả khắp nơi tụ về luận võ.' },
  { id: 'long_ho_son', name: 'Long Hổ Sơn', tier: 'vo_dao', cont: 'vo_chau', reg: 'thien_vo', theme: 'tiger_mountain', terrain: 'mountain', realm: 5, w: 180, weather: 'mist', bgm: 'bgm_wild', mat: 'mat_tiger_claw',
    mobs: [{ a: 'tiger', n: 'Thanh Long Hổ', el: 'phys', capt: 'pet_tiger' }, { a: 'snake', n: 'Long Mãng', el: 'poison' }], elite: { a: 'golem', n: 'Long Hổ Thạch Tượng', el: 'phys' },
    boss: { a: 'tiger', n: 'Long Hổ Thiên Vương', el: 'phys', mech: 'summon' }, npc: ['npc_lhs_hermit', 'Hổ Si', 'Ẩn Sĩ Long Hổ', 'Hổ thét long ngâm, võ ý tự sinh.'], quest: 'hunt' },
  { id: 'vo_than_dien', name: 'Võ Thần Điện', tier: 'vo_dao', cont: 'vo_chau', reg: 'vo_than', theme: 'war_temple', terrain: 'city', realm: 6, w: 160, weather: 'clear', bgm: 'bgm_sect', mat: 'mat_martial_relic',
    mobs: [{ a: 'golem', n: 'Võ Thần Khôi Lỗi', el: 'phys' }, { a: 'spirit', n: 'Võ Hồn Tàn Niệm', el: 'void' }], elite: { a: 'bandit', n: 'Điện Vệ Võ Thần', el: 'phys' },
    boss: { a: 'golem', n: 'Võ Thần Pháp Tướng', el: 'holy', mech: 'shield' }, npc: ['npc_vtd_keeper', 'Lão Từ Giữ Điện', 'Thủ Điện Nhân', 'Bí tịch võ thần chỉ trao cho người xứng đáng.'], quest: 'investigate' },
  { id: 'huyet_chien_coc', name: 'Huyết Chiến Cốc', tier: 'vo_dao', cont: 'vo_chau', reg: 'huyet_coc', theme: 'blood_valley', terrain: 'hills', realm: 7, w: 180, weather: 'ash', bgm: 'bgm_battle', mat: 'mat_martial_relic',
    mobs: [{ a: 'bandit', n: 'Huyết Đao Khách', el: 'phys' }, { a: 'boar', n: 'Huyết Lân Trư', el: 'phys' }], elite: { a: 'demon', n: 'Huyết Ma Võ Giả', el: 'fire' },
    boss: { a: 'demon', n: 'Huyết Cốc Ma Đao', el: 'fire', mech: 'heal' }, npc: ['npc_hcc_survivor', 'Đinh Tam', 'Kẻ Sống Sót', 'Thung lũng này đã uống máu ba đời võ giả.'], quest: 'rescue' },
  { id: 'van_kiem_son', name: 'Vạn Kiếm Sơn', tier: 'vo_dao', cont: 'vo_chau', reg: 'van_kiem', theme: 'sword_peak', terrain: 'mountain', realm: 8, w: 190, weather: 'snow', bgm: 'bgm_villa', mat: 'mat_iron_scrap',
    mobs: [{ a: 'spirit', n: 'Vạn Kiếm Linh', el: 'phys' }, { a: 'bird', n: 'Kiếm Vũ Ưng', el: 'thunder' }], elite: { a: 'golem', n: 'Kiếm Mộ Thủ Hộ', el: 'phys' },
    boss: { a: 'spirit', n: 'Kiếm Tổ Tàn Hồn', el: 'thunder', mech: 'split' }, npc: ['npc_vks_smith', 'Mạc Tà Nhị', 'Kiếm Tượng', 'Mỗi thanh kiếm trên núi này đều có một linh hồn.'], quest: 'gather' },
  { id: 'cuu_u_chien_truong', name: 'Cửu U Chiến Trường', tier: 'vo_dao', cont: 'vo_chau', reg: 'cuu_u', theme: 'nether_battle', terrain: 'hills', realm: 9, w: 210, pvp: true, weather: 'ash', bgm: 'bgm_battle', mat: 'mat_bone_dust',
    mobs: [{ a: 'skeleton', n: 'Cửu U Tử Sĩ', el: 'ice' }, { a: 'spirit', n: 'U Minh Chiến Hồn', el: 'void' }], elite: { a: 'skeleton', n: 'Cửu U Tướng Quân', el: 'ice' },
    boss: { a: 'demon', n: 'Cửu U Chiến Thần', el: 'ice', mech: 'storm', world: true }, npc: ['npc_cuu_commander', 'Hàn Thiết Y', 'Chiến Tướng', 'Chiến trường Cửu U — kẻ mạnh sống, kẻ yếu chết.'], quest: 'hunt' },
  // ===== LINH GIỚI =====
  { id: 'linh_thien_thanh', name: 'Linh Thiên Thành', tier: 'linh_gioi', cont: 'linh_chau', reg: 'linh_thien', theme: 'spirit_city', terrain: 'city', realm: 14, w: 150, city: true, weather: 'petals', bgm: 'bgm_cult_city', mat: 'mat_spirit_crystal', desc: 'Thành trì xây trên linh mạch, nơi người và linh thú cùng sống.' },
  { id: 'van_linh_son', name: 'Vạn Linh Sơn', tier: 'linh_gioi', cont: 'linh_chau', reg: 'linh_thien', theme: 'spirit_mountain', terrain: 'mountain', realm: 14, w: 190, weather: 'mist', bgm: 'bgm_immortal_mt', mat: 'mat_spirit_crystal',
    mobs: [{ a: 'fox', n: 'Vạn Linh Hồ', el: 'fire', capt: 'pet_fox' }, { a: 'treant', n: 'Linh Mộc Tinh', el: 'poison' }], elite: { a: 'golem', n: 'Linh Mạch Thủ Hộ', el: 'holy' },
    boss: { a: 'treant', n: 'Vạn Niên Linh Thụ', el: 'poison', mech: 'heal' }, npc: ['npc_vls_druid', 'Thanh Mộc Lão Nhân', 'Hộ Sơn Nhân', 'Vạn Linh Sơn có linh, đừng chặt cây vô cớ.'], quest: 'gather' },
  { id: 'than_thu_coc', name: 'Thần Thú Cốc', tier: 'linh_gioi', cont: 'linh_chau', reg: 'than_thu', theme: 'beast_valley', terrain: 'hills', realm: 15, w: 190, weather: 'clear', bgm: 'bgm_wild', mat: 'mat_beast_core',
    mobs: [{ a: 'tiger', n: 'Lôi Văn Báo', el: 'thunder', capt: 'pet_tiger' }, { a: 'bird', n: 'Thanh Loan Điểu', el: 'ice', capt: 'pet_crane' }], elite: { a: 'wolf', n: 'Thiên Lang Thủ Lĩnh', el: 'phys', capt: 'pet_wolf' },
    boss: { a: 'dragon', n: 'Ấu Long Thần Thú', el: 'fire', mech: 'storm' }, npc: ['npc_ttc_tamer', 'Ngự Thú Tiên Cô', 'Ngự Thú Sư', 'Thần thú chỉ theo người có duyên.'], quest: 'escort' },
  { id: 'linh_hai', name: 'Linh Hải', tier: 'linh_gioi', cont: 'linh_chau', reg: 'linh_hai', theme: 'spirit_sea', terrain: 'sea', realm: 16, w: 200, weather: 'rain', bgm: 'bgm_cloud', mat: 'mat_spirit_crystal',
    mobs: [{ a: 'snake', n: 'Linh Hải Xà', el: 'ice' }, { a: 'slime', n: 'Hải Linh Thủy Mẫu', el: 'poison' }], elite: { a: 'snake', n: 'Giao Long Hộ Hải', el: 'thunder' },
    boss: { a: 'dragon', n: 'Linh Hải Giao Vương', el: 'ice', mech: 'summon' }, npc: ['npc_lh_fisher', 'Ngư Tiên Nương', 'Ngư Tiên', 'Đáy Linh Hải giấu linh mạch cổ xưa.'], quest: 'investigate' },
  { id: 'co_linh_thap', name: 'Cổ Linh Tháp', tier: 'linh_gioi', cont: 'linh_chau', reg: 'co_linh', theme: 'spirit_tower', terrain: 'cave', realm: 18, w: 170, weather: 'mist', bgm: 'bgm_ruins', mat: 'mat_ancient_jade',
    mobs: [{ a: 'spirit', n: 'Tháp Linh', el: 'holy' }, { a: 'golem', n: 'Cổ Linh Khôi', el: 'phys' }], elite: { a: 'spirit', n: 'Truyền Thừa Thủ Hộ', el: 'void' },
    boss: { a: 'golem', n: 'Tháp Chủ Cổ Linh', el: 'holy', mech: 'shield' }, npc: ['npc_clt_spirit', 'Linh Lung', 'Tháp Linh Sứ', 'Mỗi tầng tháp là một thử thách truyền thừa.'], quest: 'realm' },
  // ===== TIÊN GIỚI (bổ sung) =====
  { id: 'tien_ma_chien_truong', name: 'Tiên Ma Chiến Trường', tier: 'tien_gioi', cont: 'cuu_thien', reg: 'tien_ma', theme: 'tienma_battle', terrain: 'hills', realm: 27, w: 220, pvp: true, weather: 'storm', bgm: 'bgm_battle', mat: 'mat_tienma_blood',
    mobs: [{ a: 'demon', n: 'Thiên Ma Binh', el: 'void' }, { a: 'bandit', n: 'Tiên Quân Đào Binh', el: 'holy' }], elite: { a: 'demon', n: 'Ma Tướng Cửu Thiên', el: 'fire' },
    boss: { a: 'demon', n: 'Thiên Ma Chí Tôn', el: 'void', mech: 'split', world: true }, npc: ['npc_tmct_general', 'Lạc Thiên Hành', 'Tiên Quân Thống Soái', 'Tiên ma đại chiến — giữ vững phòng tuyến!'], quest: 'hunt' },
  // ===== THƯỢNG TIÊN GIỚI =====
  { id: 'thai_hu_thien', name: 'Thái Hư Thiên', tier: 'thuong_tien', cont: 'thai_hu', reg: 'thai_hu_trung', theme: 'taixu_sky', terrain: 'sky', realm: 29, w: 170, city: true, weather: 'petals', bgm: 'bgm_ascension', mat: 'mat_taixu_feather', desc: 'Tầng trời Thái Hư, thành chính của Thượng Tiên Giới.' },
  { id: 'vo_cuc_tien_cung', name: 'Vô Cực Tiên Cung', tier: 'thuong_tien', cont: 'thai_hu', reg: 'vo_cuc', theme: 'wuji_palace', terrain: 'city', realm: 32, w: 190, weather: 'clear', bgm: 'bgm_palace', mat: 'mat_taixu_feather',
    mobs: [{ a: 'spirit', n: 'Vô Cực Tiên Ảnh', el: 'holy' }, { a: 'golem', n: 'Tiên Cung Kim Giáp', el: 'phys' }], elite: { a: 'bandit', n: 'Vô Cực Đạo Đồng', el: 'thunder' },
    boss: { a: 'golem', n: 'Vô Cực Thiên Tôn Hóa Thân', el: 'holy', mech: 'shield' }, npc: ['npc_vctc_dao', 'Huyền Vô Cực', 'Đạo Chủ', 'Đạo vô cực — học cũng vô cực.'], quest: 'investigate' },
  { id: 'cuu_trong_thien', name: 'Cửu Trọng Thiên', tier: 'thuong_tien', cont: 'thai_hu', reg: 'cuu_trong', theme: 'ninefold_heaven', terrain: 'sky', realm: 34, w: 210, weather: 'storm', bgm: 'bgm_thunder', mat: 'mat_law_shard',
    mobs: [{ a: 'bird', n: 'Cửu Thiên Lôi Bằng', el: 'thunder' }, { a: 'spirit', n: 'Thiên Phạt Linh', el: 'thunder' }], elite: { a: 'golem', n: 'Lôi Đình Thiên Tướng', el: 'thunder' },
    boss: { a: 'dragon', n: 'Cửu Trọng Lôi Long', el: 'thunder', mech: 'storm' }, npc: ['npc_ctt_judge', 'Phán Quan Thiên Phạt', 'Thiên Phạt Sứ', 'Chín tầng trời, chín đạo thiên phạt.'], quest: 'hunt' },
  { id: 'thuong_co_tien_vuc', name: 'Thượng Cổ Tiên Vực', tier: 'thuong_tien', cont: 'thuong_co_vuc', reg: 'tien_vuc', theme: 'ancient_immortal', terrain: 'cave', realm: 36, w: 200, weather: 'mist', bgm: 'bgm_ruins', mat: 'mat_law_shard',
    mobs: [{ a: 'skeleton', n: 'Thượng Cổ Tiên Thi', el: 'ice' }, { a: 'dragon', n: 'Cổ Tiên Long Hài', el: 'void' }], elite: { a: 'demon', n: 'Đọa Lạc Tiên Vương', el: 'void' },
    boss: { a: 'demon', n: 'Thượng Cổ Tiên Ma', el: 'void', mech: 'heal' }, npc: ['npc_tctv_scholar', 'Bạch Thủ Cổ Sử', 'Cổ Sử Quan', 'Tiên vực thượng cổ là nơi đại đạo từng sụp đổ.'], quest: 'rescue' },
  // ===== THẦN VỰC =====
  { id: 'than_dinh', name: 'Thần Đình', tier: 'than_vuc', cont: 'than_chau', reg: 'than_dinh_trung', theme: 'god_court', terrain: 'city', realm: 38, w: 170, city: true, weather: 'clear', bgm: 'bgm_palace', mat: 'mat_god_blood', desc: 'Thần Đình — trung tâm quyền lực của Thần Vực.' },
  { id: 'van_than_chien_truong', name: 'Vạn Thần Chiến Trường', tier: 'than_vuc', cont: 'than_chau', reg: 'van_than', theme: 'god_battle', terrain: 'hills', realm: 41, w: 220, pvp: true, weather: 'storm', bgm: 'bgm_battle', mat: 'mat_god_blood',
    mobs: [{ a: 'bandit', n: 'Thần Binh Lạc Lối', el: 'holy' }, { a: 'tiger', n: 'Thần Chiến Thú', el: 'fire' }], elite: { a: 'golem', n: 'Thần Tướng Tàn Khu', el: 'holy' },
    boss: { a: 'golem', n: 'Vạn Thần Chiến Hồn', el: 'holy', mech: 'summon', world: true }, npc: ['npc_vtct_herald', 'Chiến Thần Sứ', 'Thần Sứ', 'Chiến công nơi đây được ghi vào thần sử.'], quest: 'hunt' },
  { id: 'thai_co_than_son', name: 'Thái Cổ Thần Sơn', tier: 'than_vuc', cont: 'than_chau', reg: 'than_son', theme: 'god_mountain', terrain: 'mountain', realm: 43, w: 210, weather: 'snow', bgm: 'bgm_immortal_mt', mat: 'mat_god_blood',
    mobs: [{ a: 'bird', n: 'Thần Sơn Kim Ô', el: 'fire' }, { a: 'tiger', n: 'Bạch Trạch Ấu Thú', el: 'holy', capt: 'pet_qilin' }], elite: { a: 'dragon', n: 'Thần Sơn Long Vệ', el: 'fire' },
    boss: { a: 'dragon', n: 'Kim Ô Thần Hoàng', el: 'fire', mech: 'storm' }, npc: ['npc_tcts_monk', 'Khổ Hạnh Thần Tăng', 'Thần Tăng', 'Leo tới đỉnh Thần Sơn là thấy được Hỗn Độn.'], quest: 'gather' },
  { id: 'than_ma_cam_dia', name: 'Thần Ma Cấm Địa', tier: 'than_vuc', cont: 'cam_dia', reg: 'than_ma', theme: 'forbidden_land', terrain: 'cave', realm: 45, w: 200, weather: 'ash', bgm: 'bgm_demon', mat: 'mat_chaos_core',
    mobs: [{ a: 'demon', n: 'Thần Ma Ác Niệm', el: 'void' }, { a: 'skeleton', n: 'Cổ Thần Hài Cốt', el: 'ice' }], elite: { a: 'demon', n: 'Ma Thần Phân Hồn', el: 'fire' },
    boss: { a: 'demon', n: 'Thần Ma Cổ Đế', el: 'void', mech: 'split' }, npc: ['npc_tmcd_warden', 'Cấm Vệ Vô Danh', 'Cấm Địa Thủ Vệ', 'Cấm địa không phải nơi để tò mò.'], quest: 'investigate' },
  // ===== HỖN ĐỘN GIỚI =====
  { id: 'vo_tan_hu_khong', name: 'Vô Tận Hư Không', tier: 'hon_don', cont: 'hu_khong', reg: 'hu_khong_ngoai', theme: 'void_endless', terrain: 'sky', realm: 47, w: 220, weather: 'storm', bgm: 'bgm_void', mat: 'mat_chaos_core',
    mobs: [{ a: 'spirit', n: 'Hư Không Du Hồn', el: 'void' }, { a: 'snake', n: 'Không Gian Liệt Xà', el: 'void' }], elite: { a: 'demon', n: 'Hư Không Lãnh Chúa', el: 'void' },
    boss: { a: 'dragon', n: 'Hư Không Thôn Phệ Thú', el: 'void', mech: 'summon' }, npc: ['npc_vthk_wanderer', 'Lữ Khách Hư Không', 'Lữ Khách', 'Ở đây, phương hướng không còn ý nghĩa.'], quest: 'escort' },
  { id: 'hon_nguyen_dien', name: 'Hỗn Nguyên Điện', tier: 'hon_don', cont: 'hu_khong', reg: 'hon_nguyen', theme: 'chaos_palace', terrain: 'city', realm: 50, w: 170, city: true, weather: 'clear', bgm: 'bgm_chaos', mat: 'mat_chaos_core', desc: 'Điện thờ nơi các Hỗn Độn cường giả tụ hội.' },
  { id: 'hon_don_co_lo', name: 'Hỗn Độn Cổ Lộ', tier: 'hon_don', cont: 'co_lo', reg: 'co_lo_trung', theme: 'chaos_road', terrain: 'hills', realm: 53, w: 230, weather: 'ash', bgm: 'bgm_chaos', mat: 'mat_chaos_core',
    mobs: [{ a: 'golem', n: 'Cổ Lộ Thạch Nhân', el: 'phys' }, { a: 'tiger', n: 'Hỗn Độn Cự Thú', el: 'void' }], elite: { a: 'dragon', n: 'Thời Gian Cự Long', el: 'ice' },
    boss: { a: 'dragon', n: 'Luân Hồi Cổ Long', el: 'void', mech: 'heal', world: true }, npc: ['npc_hdcl_guide', 'Cổ Lộ Dẫn Đường', 'Người Dẫn Đường', 'Con đường này thông tới Thái Cổ.'], quest: 'realm' },
  // ===== THÁI CỔ GIỚI =====
  { id: 'thai_co_than_thanh', name: 'Thái Cổ Thần Thành', tier: 'thai_co', cont: 'khoi_nguyen', reg: 'than_thanh', theme: 'ancient_city', terrain: 'city', realm: 56, w: 170, city: true, weather: 'clear', bgm: 'bgm_palace', mat: 'mat_origin_dust', desc: 'Thành của cổ thần, được dựng trước cả vạn giới.' },
  { id: 'khoi_nguyen_son', name: 'Khởi Nguyên Sơn', tier: 'thai_co', cont: 'khoi_nguyen', reg: 'khoi_nguyen_son', theme: 'origin_mountain', terrain: 'mountain', realm: 58, w: 210, weather: 'mist', bgm: 'bgm_immortal_mt', mat: 'mat_origin_dust',
    mobs: [{ a: 'golem', n: 'Khởi Nguyên Cự Nhân', el: 'phys' }, { a: 'bird', n: 'Nguyên Sơ Phượng Hoàng', el: 'fire' }], elite: { a: 'dragon', n: 'Tổ Long Hậu Duệ', el: 'fire' },
    boss: { a: 'golem', n: 'Bàn Cổ Thạch Thần', el: 'phys', mech: 'shield' }, npc: ['npc_kns_sage', 'Nguyên Sơ Hiền Giả', 'Hiền Giả', 'Vạn vật bắt đầu từ ngọn núi này.'], quest: 'hunt' },
  { id: 'van_dao_bi_canh', name: 'Vạn Đạo Bí Cảnh', tier: 'thai_co', cont: 'van_dao', reg: 'bi_canh', theme: 'dao_realm', terrain: 'cave', realm: 60, w: 200, weather: 'mist', bgm: 'bgm_ruins', mat: 'mat_law_shard',
    mobs: [{ a: 'spirit', n: 'Đạo Văn Linh', el: 'holy' }, { a: 'slime', n: 'Pháp Tắc Chi Tinh', el: 'thunder' }], elite: { a: 'spirit', n: 'Đại Đạo Hóa Thân', el: 'void' },
    boss: { a: 'spirit', n: 'Vạn Đạo Chi Chủ', el: 'holy', mech: 'split' }, npc: ['npc_vdbc_keeper', 'Đạo Tàng Sứ', 'Thủ Bí Cảnh', 'Mỗi đạo văn là một pháp tắc thất truyền.'], quest: 'investigate' },
  { id: 'thoi_khong_truong_ha', name: 'Thời Không Trường Hà', tier: 'thai_co', cont: 'van_dao', reg: 'truong_ha', theme: 'time_river', terrain: 'sea', realm: 62, w: 230, weather: 'rain', bgm: 'bgm_void', mat: 'mat_origin_dust',
    mobs: [{ a: 'snake', n: 'Thời Không Ngư Long', el: 'ice' }, { a: 'spirit', n: 'Quá Khứ Tàn Ảnh', el: 'void' }], elite: { a: 'dragon', n: 'Trường Hà Thủ Hộ Long', el: 'ice' },
    boss: { a: 'dragon', n: 'Thời Không Chi Chủ', el: 'ice', mech: 'storm', world: true }, npc: ['npc_tkth_ferry', 'Đò Thời Gian', 'Lái Đò', 'Dòng sông này chảy qua mọi kỷ nguyên.'], quest: 'rescue' },
  // ===== VẠN GIỚI CHÂN CẢNH =====
  { id: 'van_gioi_chan_thanh', name: 'Vạn Giới Chân Thành', tier: 'van_gioi', cont: 'van_gioi', reg: 'chan_thanh', theme: 'myriad_city', terrain: 'city', realm: 65, w: 180, city: true, weather: 'petals', bgm: 'bgm_immortal_city', mat: 'mat_myriad_fragment', desc: 'Trung tâm vạn giới — nơi khắc tên Người Mạnh Nhất Vạn Giới.' },
  { id: 'van_gioi_chien_truong', name: 'Vạn Giới Chiến Trường', tier: 'van_gioi', cont: 'van_gioi', reg: 'chien_truong', theme: 'myriad_battle', terrain: 'hills', realm: 66, w: 240, pvp: true, weather: 'storm', bgm: 'bgm_battle', mat: 'mat_myriad_fragment',
    mobs: [{ a: 'demon', n: 'Vạn Giới Xâm Lược Giả', el: 'void' }, { a: 'golem', n: 'Giới Bích Thủ Vệ', el: 'holy' }], elite: { a: 'dragon', n: 'Dị Giới Long Quân', el: 'fire' },
    boss: { a: 'dragon', n: 'Vạn Giới Diệt Thế Giả', el: 'void', mech: 'split', world: true }, npc: ['npc_vgct_marshal', 'Vạn Giới Thống Soái', 'Thống Soái', 'Vạn giới chiến trường không có hồi kết.'], quest: 'hunt' },
  // ===== KHU VỰC BỔ SUNG MỖI TẦNG =====
  { id: 'bich_thuy_ho', name: 'Bích Thủy Hồ', tier: 'pham_nhan', cont: 'dong_hoang', reg: 'bien_thuy', theme: 'spirit_sea', terrain: 'sea', realm: 3, w: 150, weather: 'rain', bgm: 'bgm_forest', mat: 'mat_slime_gel',
    mobs: [{ a: 'slime', n: 'Thủy Linh Nhầy', el: 'ice' }, { a: 'snake', n: 'Hồ Thủy Xà', el: 'poison' }], elite: { a: 'snake', n: 'Bích Thủy Giao', el: 'ice' },
    boss: { a: 'snake', n: 'Hồ Chủ Thanh Giao', el: 'ice', mech: 'heal' }, npc: ['npc_bth_fisher', 'Lão Ngư Hồ', 'Ngư Phủ Bích Thủy', 'Hồ này nuôi cả thôn, giờ lại có giao long quấy phá.'], quest: 'rescue' },
  { id: 'thiet_huyet_quan', name: 'Thiết Huyết Quan', tier: 'vo_dao', cont: 'vo_chau', reg: 'cuu_u', theme: 'battlefield', terrain: 'mountain', realm: 8, w: 180, weather: 'snow', bgm: 'bgm_battle', mat: 'mat_war_relic',
    mobs: [{ a: 'bandit', n: 'Quan Ngoại Mã Tặc', el: 'phys' }, { a: 'wolf', n: 'Tuyết Nguyên Lang', el: 'ice', capt: 'pet_wolf' }], elite: { a: 'bandit', n: 'Mã Tặc Thiên Hộ', el: 'phys' },
    boss: { a: 'bandit', n: 'Thiết Huyết Lang Chủ', el: 'phys', mech: 'summon' }, npc: ['npc_thq_captain', 'Cao Thủ Quan', 'Thủ Quan Tướng', 'Quan ải này chưa từng thất thủ — và sẽ không thất thủ.'], quest: 'escort' },
  { id: 'bach_thao_dao', name: 'Bách Thảo Đảo', tier: 'tu_chan', cont: 'linh_van', reg: 'linh_van_dong', theme: 'herb_valley', terrain: 'hills', realm: 12, w: 170, weather: 'mist', bgm: 'bgm_valley', mat: 'mat_treant_bark', density: 4,
    mobs: [{ a: 'treant', n: 'Bách Thảo Tinh', el: 'poison' }, { a: 'bird', n: 'Đan Đỉnh Hạc', el: 'fire', capt: 'pet_crane_young' }], elite: { a: 'treant', n: 'Thiên Niên Sâm Vương', el: 'poison' },
    boss: { a: 'treant', n: 'Bách Thảo Chi Mẫu', el: 'poison', mech: 'heal' }, npc: ['npc_btd_alchemist', 'Đan Phong Tử', 'Đảo Chủ Đan Đạo', 'Trên đảo, mỗi ngọn cỏ đều là linh dược.'], quest: 'gather' },
  { id: 'phong_linh_nguyen', name: 'Phong Linh Nguyên', tier: 'linh_gioi', cont: 'linh_chau', reg: 'co_linh', theme: 'spirit_mountain', terrain: 'plains', realm: 17, w: 210, weather: 'petals', bgm: 'bgm_cloud', mat: 'mat_spirit_crystal',
    mobs: [{ a: 'fox', n: 'Phong Linh Hồ', el: 'thunder', capt: 'pet_fox' }, { a: 'bird', n: 'Phong Thần Ưng', el: 'thunder' }], elite: { a: 'wolf', n: 'Cuồng Phong Lang Vương', el: 'thunder', capt: 'pet_wolf' },
    boss: { a: 'bird', n: 'Phong Linh Thần Điểu', el: 'thunder', mech: 'storm' }, npc: ['npc_pln_nomad', 'Mục Phong Nương', 'Du Mục Linh Giới', 'Gió ở đây mang theo linh khí của vạn linh.'], quest: 'hunt' },
  { id: 'dao_tri_tien_canh', name: 'Dao Trì Tiên Cảnh', tier: 'tien_gioi', cont: 'cuu_thien', reg: 'van_tien', theme: 'immortal_mountain', terrain: 'sky', realm: 22, w: 190, weather: 'petals', bgm: 'bgm_immortal_mt', mat: 'mat_immortal_cloud', density: 7,
    mobs: [{ a: 'bird', n: 'Dao Trì Thanh Điểu', el: 'holy', capt: 'pet_crane' }, { a: 'spirit', n: 'Bàn Đào Tinh Linh', el: 'holy' }], elite: { a: 'golem', n: 'Bàn Đào Thủ Hộ', el: 'holy' },
    boss: { a: 'spirit', n: 'Dao Trì Thánh Mẫu Ảo Ảnh', el: 'holy', mech: 'shield' }, npc: ['npc_dttc_maid', 'Thanh Y Tiên Nga', 'Tiên Nga Dao Trì', 'Bàn đào ba nghìn năm mới chín một lần.'], quest: 'investigate' },
  { id: 'than_hai', name: 'Thần Hải', tier: 'than_vuc', cont: 'than_chau', reg: 'than_dinh_trung', theme: 'spirit_sea', terrain: 'sea', realm: 44, w: 220, weather: 'storm', bgm: 'bgm_cloud', mat: 'mat_god_blood',
    mobs: [{ a: 'snake', n: 'Thần Hải Côn Ngư', el: 'ice' }, { a: 'dragon', n: 'Hải Thần Long Duệ', el: 'thunder' }], elite: { a: 'snake', n: 'Thần Hải Cự Giao', el: 'ice' },
    boss: { a: 'dragon', n: 'Côn Bằng Thần Hải', el: 'ice', mech: 'split' }, npc: ['npc_th_seasage', 'Hải Thần Tế Tự', 'Tế Tự', 'Thần Hải từng là nơi chư thần tắm gội.'], quest: 'rescue' },
  { id: 'van_gioi_vo_tan_hai', name: 'Vạn Giới Vô Tận Hải', tier: 'van_gioi', cont: 'van_gioi', reg: 'vo_tan_hai', theme: 'chaos_sea', terrain: 'sea', realm: 68, w: 240, weather: 'storm', bgm: 'bgm_chaos', mat: 'mat_myriad_fragment',
    mobs: [{ a: 'dragon', n: 'Vô Tận Hải Long', el: 'void' }, { a: 'spirit', n: 'Giới Ngoại Hồn', el: 'void' }], elite: { a: 'demon', n: 'Vạn Giới Hải Ma', el: 'void' },
    boss: { a: 'dragon', n: 'Vô Tận Hải Chủ', el: 'void', mech: 'storm', world: true }, npc: ['npc_vgvth_navigator', 'Hoa Tiêu Vạn Giới', 'Hoa Tiêu', 'Bên kia biển vô tận là những thế giới chưa có tên.'], quest: 'realm' },
  // ===== KHU VỰC ẨN (mở bằng cơ duyên) =====
  { id: 'co_mo_thanh_truc', name: 'Cổ Mộ Thanh Trúc', tier: 'pham_nhan', cont: 'dong_hoang', reg: 'bien_thuy', theme: 'ghost_cave', terrain: 'cave', realm: 2, w: 90, hidden: true, weather: 'mist', bgm: 'bgm_cave', mat: 'mat_bone_dust',
    mobs: [{ a: 'skeleton', n: 'Mộ Thất Khô Lâu', el: 'ice' }], elite: { a: 'spirit', n: 'Mộ Chủ Tàn Hồn', el: 'void' }, boss: { a: 'skeleton', n: 'Cổ Mộ Kiếm Thi', el: 'phys', mech: 'summon' }, npc: ['npc_cmtt_ghost', 'Hồn Ma Kiếm Khách', 'Tàn Hồn', 'Ngươi tìm được nơi này... duyên phận không cạn.'], quest: 'investigate' },
  { id: 'vo_than_mat_that', name: 'Võ Thần Mật Thất', tier: 'vo_dao', cont: 'vo_chau', reg: 'vo_than', theme: 'war_temple', terrain: 'cave', realm: 7, w: 90, hidden: true, weather: 'clear', bgm: 'bgm_sect', mat: 'mat_martial_relic',
    mobs: [{ a: 'golem', n: 'Mật Thất Đồng Nhân', el: 'phys' }], elite: { a: 'golem', n: 'Kim Cương Đồng Nhân', el: 'holy' }, boss: { a: 'golem', n: 'Võ Thần Thí Luyện Tượng', el: 'phys', mech: 'shield' }, npc: ['npc_vtmt_echo', 'Hồi Âm Võ Thần', 'Võ Thần Tàn Niệm', 'Qua được đồng nhân trận, ta truyền ngươi một chiêu.'], quest: 'hunt' },
  { id: 'linh_mach_bi_dong', name: 'Linh Mạch Bí Động', tier: 'linh_gioi', cont: 'linh_chau', reg: 'linh_hai', theme: 'spirit_tower', terrain: 'cave', realm: 16, w: 90, hidden: true, weather: 'mist', bgm: 'bgm_cave', mat: 'mat_spirit_crystal',
    mobs: [{ a: 'slime', n: 'Linh Mạch Tinh Hồn', el: 'holy' }], elite: { a: 'golem', n: 'Linh Mạch Kết Tinh', el: 'ice' }, boss: { a: 'dragon', n: 'Linh Mạch Long Hồn', el: 'ice', mech: 'heal' }, npc: ['npc_lmbd_spirit', 'Mạch Linh', 'Linh Mạch Chi Linh', 'Linh mạch nghìn năm mới hiện một lần.'], quest: 'gather' },
  { id: 'tien_phu_di_tich', name: 'Tiên Phủ Di Tích', tier: 'tien_gioi', cont: 'cuu_thien', reg: 'van_tien', theme: 'ancient_immortal', terrain: 'cave', realm: 23, w: 90, hidden: true, weather: 'petals', bgm: 'bgm_ruins', mat: 'mat_immortal_cloud',
    mobs: [{ a: 'spirit', n: 'Tiên Phủ Hộ Linh', el: 'holy' }], elite: { a: 'golem', n: 'Tiên Phủ Khôi Lỗi', el: 'phys' }, boss: { a: 'spirit', n: 'Tiên Phủ Chủ Nhân Tàn Niệm', el: 'holy', mech: 'split' }, npc: ['npc_tpdt_spirit', 'Phủ Linh', 'Tiên Phủ Khí Linh', 'Chủ nhân đã đi, kho báu chờ người kế thừa.'], quest: 'investigate' },
  { id: 'than_khu_tan_tich', name: 'Thần Khu Tàn Tích', tier: 'than_vuc', cont: 'cam_dia', reg: 'than_ma', theme: 'forbidden_land', terrain: 'cave', realm: 42, w: 90, hidden: true, weather: 'ash', bgm: 'bgm_demon', mat: 'mat_god_blood',
    mobs: [{ a: 'skeleton', n: 'Thần Khu Hài Cốt', el: 'ice' }], elite: { a: 'demon', n: 'Thần Khu Ác Linh', el: 'void' }, boss: { a: 'golem', n: 'Thần Khu Tàn Thể', el: 'holy', mech: 'storm' }, npc: ['npc_tktt_echo', 'Thần Âm', 'Cổ Thần Hồi Âm', 'Thân thể vị thần đã ngã xuống tại đây.'], quest: 'hunt' },
  { id: 'hon_don_chi_nhan', name: 'Hỗn Độn Chi Nhãn', tier: 'hon_don', cont: 'hu_khong', reg: 'hon_nguyen', theme: 'void_endless', terrain: 'sky', realm: 52, w: 90, hidden: true, weather: 'storm', bgm: 'bgm_void', mat: 'mat_chaos_core',
    mobs: [{ a: 'spirit', n: 'Hỗn Độn Nhãn Linh', el: 'void' }], elite: { a: 'dragon', n: 'Hỗn Độn Thủ Nhãn Long', el: 'void' }, boss: { a: 'dragon', n: 'Hỗn Độn Chi Nhãn', el: 'void', mech: 'split' }, npc: ['npc_hdcn_echo', 'Nhãn Linh', 'Hỗn Độn Ý Chí', 'Nhìn vào hỗn độn, hỗn độn cũng nhìn lại ngươi.'], quest: 'realm' },
];

// ---------- dựng dữ liệu ----------
const looks = [['male', 0, '#1a1a1a', 1, '#5a3a2a'], ['female', 4, '#2a1a1a', 3, '#6a8aca'], ['male', 3, '#dddddd', 2, '#4a4a6a'], ['female', 1, '#7a2a2a', 4, '#aa4a6a'], ['male', 2, '#3a2a1a', 3, '#2a6a5a']] as const;
let nameIdx = 0;
const hubNpcSets: Record<string, string[]> = {};
for (const a of A) {
  const density = a.density ?? (1 + a.realm * 0.25);
  map({ id: a.id, name: a.name, world: a.tier === 'tu_chan' || a.tier === 'linh_gioi' ? 'tu_chan_gioi' : a.tier === 'pham_nhan' || a.tier === 'vo_dao' ? 'nhan_gioi' : 'tien_gioi', theme: a.theme, width: a.w, height: a.terrain === 'sky' || a.terrain === 'mountain' ? 26 : 22,
    terrain: a.terrain, platforms: a.city ? 8 : Math.round(a.w / 9), reqRealm: a.realm, safe: !!a.city, pvp: a.pvp ? 'open' : 'none', bgm: a.bgm, weather: a.weather, dayNight: !a.hidden,
    spiritDensity: Math.round(density * 10) / 10, description: a.desc ?? `${a.name} — khu vực ${a.tier === 'van_gioi' ? 'endgame' : 'cảnh giới khuyến nghị ' + a.realm}.`, channels: a.city ? 3 : a.hidden ? 1 : 2 });
  classify(a.id, a.tier, a.cont, a.reg);
  if (a.hidden) MAPS[a.id].hidden = true;
  const m = MAPS[a.id];
  // quái
  const mk = (s: MobSpec, rank: MonsterRank, layer: number, suffix: string) => {
    const id = `${a.id}_${suffix}`;
    mob(id, s.n, s.a, rank, a.realm, layer, { mat: a.mat, skills: rank === 'normal' ? POOL[s.el].slice(0, 2) : POOL[s.el], element: EL[s.el], capturable: s.capt, scaling: ['fire', 'ice', 'thunder', 'void', 'holy'].includes(s.el) ? 'matk' : 'atk', flying: s.a === 'bird' || s.a === 'spirit', ranged: s.a === 'spirit' && rank === 'normal' });
    return id;
  };
  const normals = (a.mobs ?? []).map((s, i) => mk(s, 'normal', 3 + i * 2, `m${i}`));
  normals.forEach((id, i) => spawn(a.id, id, a.hidden ? 6 : 10, 0.1 + i * 0.3, 0.45 + i * 0.35));
  if (a.elite) { const e = mk(a.elite, 'elite', 7, 'elite'); spawn(a.id, e, a.hidden ? 2 : 3, 0.55, 0.85); }
  if (a.boss) {
    const rank: MonsterRank = a.boss.world ? 'world_boss' : 'boss';
    const id = `${a.id}_boss`;
    mob(id, a.boss.n, a.boss.a, rank, a.realm, 9, { mat: a.mat, skills: POOL[a.boss.el], element: EL[a.boss.el], scaling: a.boss.el === 'phys' ? 'atk' : 'matk', flying: a.boss.a === 'bird' || a.boss.a === 'dragon',
      phases: phases(a.boss.n, a.boss.el, a.boss.mech, normals[0] ?? 'slime_green'), size: a.boss.a === 'dragon' ? [170, 140] : undefined,
      extraDrops: [{ item: `pill_bt_${Math.min(65, a.realm + 1)}`, chance: 0.5, min: 1, max: 1 }, { item: 'stone_reroll', chance: 0.4, min: 1, max: 2 }] });
    spawn(a.id, id, 1, 0.9, 0.92);
  }
  // tài nguyên
  const t = Math.min(10, Math.max(1, a.realm < 28 ? 1 + Math.floor(a.realm / 4) : a.realm < 38 ? 8 : a.realm < 47 ? 9 : 10));
  if (!a.city) { node(a.id, 'herb', `gt_herb_${t}`, 0.25, 0.6); node(a.id, 'ore', `gt_ore_${t}`, 0.4, 0.75); }
  if (a.terrain === 'sea' || a.city) node(a.id, 'fishing', `gt_fish_${t}`, 0.93);
  // NPC
  if (a.city) {
    const p = a.id;
    const roles: [string, string, string, Record<string, unknown>][] = [
      [`${p}_lord`, `Thành Chủ ${a.name}`, 'Thành Chủ', {}],
      [`${p}_merchant`, 'Đa Bảo Thương Nhân', 'Thương Nhân', { shop: `shop_${p}` }],
      [`${p}_teleporter`, 'Truyền Tống Sứ', 'Truyền Tống', { services: ['teleport'] }],
      [`${p}_storage`, 'Tàng Bảo Sứ', 'Thủ Kho', { services: ['storage', 'mail'] }],
      [`${p}_market`, 'Thị Vụ Quản Sự', 'Quản Sự Chợ', { services: ['market', 'auction'] }],
      [`${p}_guild`, 'Tông Vụ Sứ', 'Tông Môn & Đấu Trường', { services: ['guild', 'arena'] }],
      [`${p}_smith`, 'Đại Sư Luyện Khí', 'Luyện Khí Sư', { services: ['enhance', 'craft'] }],
    ];
    roles.forEach(([id, name, title, extra], i) => {
      const L = looks[(nameIdx++) % looks.length];
      npc(id, name, title, ap(L[0], L[1], L[2], L[3], L[4]), `Chào mừng đến ${a.name}.`, extra as never);
      place(a.id, id, 12 + i * 9);
    });
    hubNpcSets[a.tier] = [`${p}_teleporter`];
    const r = a.realm;
    shop(`shop_${p}`, `Đa Bảo Hiệu ${a.name}`, [[`pill_hp_${Math.min(5, 2 + Math.floor(r / 10))}`, Math.round(50 * Math.pow(1.25, r))], [`pill_mp_${Math.min(5, 2 + Math.floor(r / 10))}`, Math.round(45 * Math.pow(1.25, r))], ['tal_return', 40], ['stone_enhance', 70],
      [`eq_weapon_${Math.min(64, r)}`, Math.round(80 * Math.pow(1.6, Math.min(r, 40)))], [`eq_armor_${Math.min(64, r)}`, Math.round(80 * Math.pow(1.6, Math.min(r, 40)))], [`pill_bt_${Math.min(65, r + 1)}`, Math.round(10 * Math.pow(1.3, r)), 'spirit_stones'], ['pill_bt_assist', 12, 'spirit_stones'], [`seed_t${t}`, Math.round(4 * Math.pow(3, t - 1))]]);
  } else if (a.npc) {
    const [id, name, title, greet] = a.npc;
    const L = looks[(nameIdx++) % looks.length];
    npc(id, name, title, ap(L[0], L[1], L[2], L[3], L[4]), greet);
    place(a.id, id, 10);
  }
}
// ---------- liên kết cổng ----------
const chain = (ids: string[]) => { for (let i = 0; i + 1 < ids.length; i++) link(ids[i], ids[i + 1]); };
link('co_chien_truong', 'thien_vo_thanh');
chain(['thien_vo_thanh', 'long_ho_son', 'vo_than_dien', 'huyet_chien_coc', 'van_kiem_son', 'cuu_u_chien_truong']);
link('thien_ngoai_chien_truong', 'linh_thien_thanh');
chain(['linh_thien_thanh', 'van_linh_son', 'than_thu_coc', 'linh_hai', 'co_linh_thap']);
link('thien_de_cung', 'tien_ma_chien_truong');
link('tien_ma_chien_truong', 'thai_hu_thien');
chain(['thai_hu_thien', 'vo_cuc_tien_cung', 'cuu_trong_thien', 'thuong_co_tien_vuc']);
link('thuong_co_tien_vuc', 'than_dinh');
chain(['than_dinh', 'van_than_chien_truong', 'thai_co_than_son', 'than_ma_cam_dia']);
link('hon_don_hai', 'vo_tan_hu_khong');
chain(['vo_tan_hu_khong', 'hon_nguyen_dien', 'hon_don_co_lo']);
link('than_ma_cam_dia', 'hon_nguyen_dien');
link('hon_don_co_lo', 'thai_co_than_thanh');
chain(['thai_co_than_thanh', 'khoi_nguyen_son', 'van_dao_bi_canh', 'thoi_khong_truong_ha']);
link('thoi_khong_truong_ha', 'van_gioi_chan_thanh');
link('van_gioi_chan_thanh', 'van_gioi_chien_truong');
link('tan_thu_thon', 'bich_thuy_ho');
link('cuu_u_chien_truong', 'thiet_huyet_quan');
link('van_bao_cac', 'bach_thao_dao');
link('co_linh_thap', 'phong_linh_nguyen');
link('van_tien_son', 'dao_tri_tien_canh');
link('than_dinh', 'than_hai');
link('van_gioi_chien_truong', 'van_gioi_vo_tan_hai');
// khu vực ẩn: cổng trở về nơi phát hiện
const HIDDEN_ORIGIN: Record<string, string> = { co_mo_thanh_truc: 'rung_thanh_truc', vo_than_mat_that: 'vo_than_dien', linh_mach_bi_dong: 'linh_hai', tien_phu_di_tich: 'van_tien_son', than_khu_tan_tich: 'than_ma_cam_dia', hon_don_chi_nhan: 'hon_nguyen_dien' };
for (const [hid, origin] of Object.entries(HIDDEN_ORIGIN)) {
  const h = MAPS[hid];
  h.portals.push({ id: `exit_${origin}`, x: 3 * TILE, y: 0, to: origin, toPortal: MAPS[origin].portals[0]?.id ?? '' });
}
export { HIDDEN_ORIGIN };
// dịch chuyển nhanh (fast travel) qua truyền tống sứ của từng thành chính
const tierMaps = (t: WorldTierId) => Object.values(MAPS).filter((m) => m.tier === t && !m.instance && !m.hidden).map((m) => m.id);
for (const tierId of Object.keys(hubNpcSets) as WorldTierId[]) {
  const tp = NPCS[hubNpcSets[tierId][0]];
  const idx = WORLD_TIERS.findIndex((x) => x.id === tierId);
  const neighbors = [WORLD_TIERS[idx - 1]?.hub, WORLD_TIERS[idx + 1]?.hub].filter((x): x is string => !!x && !!MAPS[x]);
  tp.teleports = [...tierMaps(tierId), ...neighbors];
}
NPCS['npc_teleporter'].teleports = [...(NPCS['npc_teleporter'].teleports ?? []), 'thien_vo_thanh'];
NPCS['npc_th_teleporter'].teleports = [...(NPCS['npc_th_teleporter'].teleports ?? []), 'linh_thien_thanh'];
NPCS['npc_ct_teleporter'].teleports = [...(NPCS['npc_ct_teleporter'].teleports ?? []), 'tien_ma_chien_truong', 'thai_hu_thien'];
for (const t of WORLD_TIERS) {
  // lục địa/vùng sinh từ bản đồ thực tế
  const ms = Object.values(MAPS).filter((m) => m.tier === t.id && !m.instance);
  const conts = [...new Set(ms.map((m) => m.continent))];
  t.continents = conts.map((c) => ({ id: c, name: c.replace(/_/g, ' '), regions: [...new Set(ms.filter((m) => m.continent === c).map((m) => m.region))].map((r) => ({ id: r, name: r.replace(/_/g, ' ') })) }));
}
Object.assign(NEAREST_CITY, Object.fromEntries(WORLD_TIERS.map((t) => [t.id, t.hub])));

// ---------- nhiệm vụ phụ theo khu vực (đa dạng loại, không chỉ "diệt X quái") ----------
for (const a of A) {
  if (!a.npc || !a.quest) continue;
  const [nid, nname] = a.npc;
  const qid = `rq_${a.id}`;
  const elite = a.elite ? `${a.id}_elite` : `${a.id}_m0`;
  const m0 = `${a.id}_m0`;
  const reward = { exp: Math.round(200 * Math.pow(1.13, a.realm * 2)), tuvi: Math.round(120 * Math.pow(1.13, a.realm * 2)), gold: Math.round(300 * Math.pow(1.12, a.realm * 2)), spirit_stones: a.realm >= 10 ? Math.round(a.realm * 2) : 0, items: [{ item: a.mat, qty: 3 }, { item: `pill_bt_${Math.min(65, a.realm + 1)}`, qty: 1 }] };
  const ivId = `int_${a.id}_clue`;
  const base = { kind: (a.hidden ? 'hidden' : 'side') as 'hidden' | 'side', giver: nid, reqRealm: Math.max(0, a.realm - 2), rw: reward };
  switch (a.quest) {
    case 'hunt': q(qid, { ...base, category: 'hunt', name: `${a.name}: Trừ Hại`, offer: [`${a.name} đang bị ${a.elite?.n ?? 'yêu thú'} quấy nhiễu.`, 'Hạ chúng và mang chiến lợi phẩm về đây.'], progress: 'Săn quái và thu vật liệu.', complete: ['Khu vực đã yên ổn hơn nhiều, đa tạ!'],
      obj: [['kill', elite, 3, `Hạ ${a.elite?.n ?? 'quái tinh anh'}`], ['collect', a.mat, 5, 'Thu vật liệu đặc trưng']] }); break;
    case 'gather': q(qid, { ...base, category: 'gather', name: `${a.name}: Linh Vật Thiên Địa`, offer: ['Linh khí nơi này nuôi dưỡng những linh vật hiếm.', 'Thu thập giúp ta — cẩn thận, chúng được canh giữ.'], progress: 'Khai thác tài nguyên trong khu vực.', complete: ['Tốt lắm, những linh vật này sẽ được dùng đúng chỗ.'],
      obj: [['collect', `herb_t${Math.min(10, Math.max(1, a.realm < 28 ? 1 + Math.floor(a.realm / 4) : a.realm < 38 ? 8 : a.realm < 47 ? 9 : 10))}`, 6, 'Hái linh thảo bậc khu vực'], ['kill', m0, 6, `Dọn ${a.mobs?.[0]?.n ?? 'quái'} canh giữ`]] }); break;
    case 'investigate':
      interact(a.id, ivId, 'Dấu Vết Kỳ Lạ', qid, 'o1', 0.5);
      q(qid, { ...base, category: 'investigate', name: `${a.name}: Bí Ẩn Còn Sót`, offer: ['Có những dấu vết không thuộc về thời đại này.', 'Hãy điều tra, rồi đối mặt với thứ canh giữ nó.'], progress: 'Điều tra dấu vết và đánh bại kẻ canh giữ.', complete: ['Vậy ra bí mật là thế... Ngươi đã giúp ta rất nhiều.'],
        obj: [['interact', ivId, 1, 'Điều tra dấu vết kỳ lạ'], ['kill', elite, 1, `Đánh bại ${a.elite?.n ?? 'kẻ canh giữ'}`]] }); break;
    case 'escort': {
      const eid = `${a.id}_lost`;
      npc(eid, 'Tiểu Đồng Lạc Lối', 'Người Lạc', ap('male', 0, '#2a1a0a', 0, '#c0a040'), 'Xin hãy đưa ta về chỗ an toàn...');
      place(a.id, eid, Math.round(a.w * 0.6));
      q(qid, { ...base, category: 'escort', name: `${a.name}: Hộ Tống Người Lạc`, offer: ['Có người lạc sâu trong khu vực.', 'Hộ tống họ về chỗ ta, đừng để họ gục ngã.'], progress: 'Hộ tống người lạc về đầu khu vực.', complete: ['Cảm tạ! Ngươi quả là hiệp sĩ.'],
        obj: [['escort', eid, 1, 'Hộ tống người lạc', { map: a.id, x: 12 * TILE }]] }); break;
    }
    case 'rescue': q(qid, { ...base, category: 'rescue', name: `${a.name}: Giải Cứu`, offer: ['Đồng bạn của ta bị vây khốn bởi lũ quái ở sâu bên trong.', 'Phá vòng vây và thu lại vật phẩm họ đánh rơi.'], progress: 'Phá vòng vây, thu hồi vật phẩm.', complete: ['Họ đã an toàn — ân này không quên.'],
      obj: [['kill', m0, 8, `Phá vòng vây ${a.mobs?.[0]?.n ?? ''}`], ['kill', elite, 1, 'Hạ thủ lĩnh'], ['collect', a.mat, 3, 'Thu hồi vật phẩm']] }); break;
    case 'realm': q(qid, { ...base, category: 'secret_realm', name: `${a.name}: Thí Luyện Truyền Thừa`, offer: ['Truyền thừa chỉ trao cho người đủ cảnh giới và đủ dũng khí.', 'Hãy đạt cảnh giới khuyến nghị rồi đánh bại chủ nhân nơi này.'], progress: 'Đạt cảnh giới và vượt thí luyện.', complete: ['Truyền thừa thuộc về ngươi.'],
      obj: [['realm', String(a.realm), 1, 'Đạt cảnh giới khuyến nghị'], ['kill', `${a.id}_boss`, 1, `Đánh bại ${a.boss?.n ?? 'chủ nhân'}`]] }); break;
  }
}

// ---------- phó bản mới ----------
const NEW_DG: [string, string, number, string, string, string][] = [
  ['dg_vo_than_thi_luyen', 'Võ Thần Thí Luyện', 7, 'war_temple', 'vo_than_dien', 'Thí luyện của Võ Thần Điện'],
  ['dg_co_linh_thap', 'Cổ Linh Tháp Tầng Đỉnh', 17, 'spirit_tower', 'co_linh_thap', 'Tầng đỉnh tháp truyền thừa'],
  ['dg_thuong_co_tien_vuc', 'Tiên Vực Thâm Uyên', 35, 'ancient_immortal', 'thuong_co_tien_vuc', 'Vực sâu thượng cổ'],
  ['dg_than_ma_cam_dia', 'Cấm Địa Thâm Xứ', 44, 'forbidden_land', 'than_ma_cam_dia', 'Nơi sâu nhất cấm địa'],
  ['dg_hon_nguyen', 'Hỗn Nguyên Thí Luyện', 51, 'chaos_palace', 'hon_don_co_lo', 'Thử thách Hỗn Nguyên Điện'],
  ['dg_van_dao', 'Vạn Đạo Luân Hồi', 61, 'dao_realm', 'van_dao_bi_canh', 'Luân hồi của vạn đạo'],
];
for (const [id, name, realm, theme, src, desc] of NEW_DG) {
  map({ id, name: `${name} (Phó Bản)`, world: 'special', theme, width: 90, height: 22, terrain: 'cave', platforms: 8, reqRealm: realm, safe: false, pvp: 'none', bgm: 'bgm_dungeon', weather: 'mist', dayNight: false, spiritDensity: 1, instance: 'dungeon', description: desc });
  MAPS[id].tier = 'special'; MAPS[id].continent = 'instance'; MAPS[id].region = 'dungeon';
  const boss = `${id}_boss`;
  const srcBoss = `${src}_boss`;
  mob(boss, `${name} Chi Chủ`, 'demon', 'dungeon_boss', realm, 9, { mat: 'mat_law_shard', skills: ['m_void_zone', 'm_meteor', 'm_shadow'], scaling: 'matk', phases: phases(`${name} Chi Chủ`, 'void', 'split', `${src}_m0`), extraDrops: [{ item: 'stone_reroll', chance: 1, min: 1, max: 3 }] });
  const d: DungeonDef = { id, name, map: id, reqRealm: realm, minPlayers: 1, maxPlayers: 5, waves: [[{ monster: `${src}_m0`, count: 6 }], [{ monster: `${src}_m1`, count: 4 }, { monster: `${src}_elite`, count: 2 }]], boss, timeLimit: 1200, dailyLimit: 2,
    rewards: { exp: Math.round(5000 * Math.pow(1.13, realm * 2)), tuvi: Math.round(3000 * Math.pow(1.13, realm * 2)), gold: Math.round(2000 * Math.pow(1.12, realm * 2)), items: [{ item: 'stone_reroll', qty: 2, chance: 1 }, { item: `pill_bt_${Math.min(65, realm + 1)}`, qty: 1, chance: 0.5 }] } };
  DUNGEONS[id] = d;
  void srcBoss;
}

// ---------- sự kiện thế giới mới ----------
Object.assign(WORLD_EVENTS, {
  ev_beast_siege: { id: 'ev_beast_siege', name: 'Yêu Thú Công Thành', desc: 'Bầy yêu thú tấn công Thiên Võ Thành! Cùng nhau đẩy lùi.', map: 'long_ho_son', durationMin: 25, spawns: [{ monster: 'long_ho_son_m0', count: 20, x1: 600, x2: 5000 }, { monster: 'long_ho_son_elite', count: 4, x1: 2000, x2: 5000 }], dropMult: 1.5 },
  ev_secret_open: { id: 'ev_secret_open', name: 'Bí Cảnh Mở Cửa', desc: 'Linh khí thượng cổ tràn ra: x1.8 rơi đồ tại Thượng Cổ Bí Cảnh.', map: 'thuong_co_bi_canh', durationMin: 40, dropMult: 1.8 },
  ev_heaven_omen: { id: 'ev_heaven_omen', name: 'Thiên Địa Dị Tượng', desc: 'Dị tượng giáng xuống: tu vi đả tọa và săn quái x1.5 toàn thế giới.', map: '*', durationMin: 30, expMult: 1.5 },
  ev_spirit_vein: { id: 'ev_spirit_vein', name: 'Tranh Đoạt Linh Mạch', desc: 'Linh mạch lộ thiên tại Vạn Linh Sơn — tinh anh canh giữ xuất hiện.', map: 'van_linh_son', durationMin: 30, spawns: [{ monster: 'van_linh_son_elite', count: 8, x1: 1000, x2: 5500 }], dropMult: 1.6 },
  ev_sect_recruit: { id: 'ev_sect_recruit', name: 'Tiên Môn Tuyển Đồ', desc: 'Tiên môn mở tuyển: x2 tu vi tại Thiên Kiếm Tông.', map: 'thien_kiem_tong', durationMin: 45, expMult: 2 },
  ev_sword_conclave: { id: 'ev_sword_conclave', name: 'Đại Hội Luận Kiếm', desc: 'Võ Thần Pháp Tướng giáng lâm Võ Thần Điện — ai hạ được sẽ danh chấn thiên hạ.', map: 'vo_than_dien', boss: 'vo_than_dien_boss', durationMin: 30 },
  ev_demon_tide: { id: 'ev_demon_tide', name: 'Ma Triều', desc: 'Ma binh tràn vào Ma Vực!', map: 'ma_vuc', durationMin: 25, spawns: [{ monster: 'demon_soldier', count: 25, x1: 600, x2: 6000 }], dropMult: 1.4 },
  ev_tribulation_storm: { id: 'ev_tribulation_storm', name: 'Thiên Kiếp Phong Bạo', desc: 'Lôi vân tụ trên Cửu Trọng Thiên — Lôi Long xuất thế.', map: 'cuu_trong_thien', boss: 'cuu_trong_thien_boss', durationMin: 30 },
  ev_myriad_war: { id: 'ev_myriad_war', name: 'Vạn Giới Chiến Trường', desc: 'Dị giới xâm lược! Diệt Thế Giả giáng lâm Vạn Giới Chiến Trường.', map: 'van_gioi_chien_truong', boss: 'van_gioi_chien_truong_boss', durationMin: 45, expMult: 1.5 },
});
/** Lịch sự kiện định kỳ (giờ UTC trong ngày) — bộ lập lịch server tự tạo bản ghi events */
export const EVENT_SCHEDULE: { key: string; hoursUtc: number[] }[] = [
  { key: 'ev_beast_tide', hoursUtc: [1, 9, 17] }, { key: 'ev_beast_siege', hoursUtc: [3, 13] }, { key: 'ev_secret_open', hoursUtc: [5, 15] },
  { key: 'ev_heaven_omen', hoursUtc: [12, 20] }, { key: 'ev_spirit_vein', hoursUtc: [7, 19] }, { key: 'ev_sect_recruit', hoursUtc: [2, 14] },
  { key: 'ev_sword_conclave', hoursUtc: [11] }, { key: 'ev_demon_tide', hoursUtc: [8, 22] }, { key: 'ev_war_god', hoursUtc: [10, 18] },
  { key: 'ev_tribulation_storm', hoursUtc: [16] }, { key: 'ev_myriad_war', hoursUtc: [21] },
];

// ---------- CHƯƠNG 8–10 chính tuyến ----------
const R = (r: number, base = 1) => ({ exp: Math.round(1e10 * base * Math.pow(1.05, r)), tuvi: Math.round(5e9 * base * Math.pow(1.05, r)), gold: Math.round(5e8 * base), spirit_stones: Math.round(2e4 * base) });
q('mq_8_01', { chapter: 8, name: 'Tiên Ma Khai Chiến', giver: 'npc_chaos_ferryman', turnIn: 'npc_tmct_general', prereq: ['mq_7_06'], reqRealm: 28,
  offer: ['Tiên Tôn được giải thoát, nhưng Thiên Ma nhân lúc tiên giới hỗn loạn mà tràn vào.', 'Đến Tiên Ma Chiến Trường tìm Lạc Thiên Hành thống soái.'], progress: 'Đến Tiên Ma Chiến Trường.', complete: ['Truyền nhân Thái Sơ? Đúng lúc lắm — phòng tuyến sắp vỡ.'],
  obj: [['reach', 'tien_ma_chien_truong', 1, 'Đến Tiên Ma Chiến Trường'], ['talk', 'npc_tmct_general', 1, 'Gặp Lạc Thiên Hành']], rw: R(28) });
q('mq_8_02', { chapter: 8, name: 'Giữ Vững Phòng Tuyến', giver: 'npc_tmct_general', prereq: ['mq_8_01'], reqRealm: 28,
  offer: ['Hạ Ma Tướng Cửu Thiên và thu Tiên Ma Huyết — ta cần nó để bố phong ma đại trận.'], progress: 'Hạ Ma Tướng, thu Tiên Ma Huyết.', complete: ['Đại trận đã thành hình!'],
  obj: [['kill', 'tien_ma_chien_truong_elite', 5, 'Hạ Ma Tướng Cửu Thiên'], ['collect', 'mat_tienma_blood', 10, 'Thu Tiên Ma Huyết']], rw: R(28) });
q('mq_8_03', { chapter: 8, name: 'Thiên Ma Chí Tôn', giver: 'npc_tmct_general', prereq: ['mq_8_02'], reqRealm: 28,
  offer: ['Thiên Ma Chí Tôn đích thân xuất trận — boss thế giới, hãy tụ hợp đồng đạo!'], progress: 'Đánh bại Thiên Ma Chí Tôn.', complete: ['Ma quân tan rã! Trên tàn giáp hắn khắc ký hiệu Thái Hư Thiên...'],
  obj: [['kill', 'tien_ma_chien_truong_boss', 1, 'Đánh bại Thiên Ma Chí Tôn']], rw: { ...R(28, 2), items: [{ item: 'qi_tienma_banner', qty: 1 }] } });
q('mq_8_04', { chapter: 8, name: 'Thượng Tiên Giới', giver: 'npc_tmct_general', turnIn: 'thai_hu_thien_lord', prereq: ['mq_8_03'], reqRealm: 29,
  offer: ['Kẻ giật dây Thiên Ma ở Thượng Tiên Giới. Khi ngươi đạt Thái Ất Tiên, hãy lên Thái Hư Thiên.'], progress: 'Đạt Thái Ất Tiên, đến Thái Hư Thiên.', complete: ['Thượng Tiên Giới chào đón ngươi. Có kẻ đang phá vỡ pháp tắc từ Vô Cực Tiên Cung.'],
  obj: [['realm', '29', 1, 'Đạt cảnh giới Thái Ất Tiên'], ['reach', 'thai_hu_thien', 1, 'Đến Thái Hư Thiên'], ['talk', 'thai_hu_thien_lord', 1, 'Gặp Thành Chủ Thái Hư Thiên']], rw: R(29) });
q('mq_8_05', { chapter: 8, name: 'Pháp Tắc Rạn Vỡ', giver: 'thai_hu_thien_lord', turnIn: 'npc_vctc_dao', prereq: ['mq_8_04'], reqRealm: 32,
  offer: ['Vô Cực Thiên Tôn Hóa Thân đang hút pháp tắc của Thượng Tiên Giới.'], progress: 'Đánh bại Hóa Thân, thu Pháp Tắc Toái Phiến.', complete: ['Pháp tắc ổn định trở lại... nhưng bản thể của hắn ở Thượng Cổ Tiên Vực.'],
  obj: [['kill', 'vo_cuc_tien_cung_boss', 1, 'Đánh bại Vô Cực Thiên Tôn Hóa Thân'], ['collect', 'mat_law_shard', 6, 'Thu Pháp Tắc Toái Phiến']], rw: R(32) });
q('mq_8_06', { chapter: 8, name: 'Thượng Cổ Tiên Ma', giver: 'npc_vctc_dao', turnIn: 'npc_tctv_scholar', prereq: ['mq_8_05'], reqRealm: 37,
  offer: ['Thượng Cổ Tiên Ma là gốc rễ của chiến tranh tiên ma. Khi ngươi là Tiên Tổ, hãy kết thúc nó.'], progress: 'Đạt Tiên Tổ, đánh bại Thượng Cổ Tiên Ma.', complete: ['Tiên ma đại chiến khép lại. Phía trên còn Thần Vực — nơi Thần Đình đã im lặng vạn năm.'],
  obj: [['realm', '37', 1, 'Đạt cảnh giới Tiên Tổ'], ['kill', 'thuong_co_tien_vuc_boss', 1, 'Đánh bại Thượng Cổ Tiên Ma']], rw: { ...R(37, 3), items: [{ item: 'qi_taixu_key', qty: 1 }, { item: 'pill_bt_38', qty: 1 }], title: 'Tiên Giới Cường Giả' } });
q('mq_9_01', { chapter: 9, name: 'Thần Đình Im Lặng', giver: 'npc_tctv_scholar', turnIn: 'than_dinh_lord', prereq: ['mq_8_06'], reqRealm: 38,
  offer: ['Với Thái Hư Thiên Thược, cổng Thần Vực đã mở. Đến Thần Đình.'], progress: 'Đến Thần Đình.', complete: ['Thần Đình chưa từng đón tiên nhân... ngươi là người đầu tiên sau vạn năm.'],
  obj: [['reach', 'than_dinh', 1, 'Đến Thần Đình'], ['talk', 'than_dinh_lord', 1, 'Gặp Thành Chủ Thần Đình']], rw: R(38) });
q('mq_9_02', { chapter: 9, name: 'Vạn Thần Chiến Hồn', giver: 'than_dinh_lord', turnIn: 'npc_vtct_herald', prereq: ['mq_9_01'], reqRealm: 41,
  offer: ['Chiến hồn của vạn thần vẫn giao tranh không dứt. Giải thoát chúng.'], progress: 'Diệt Thần Tướng Tàn Khu và Vạn Thần Chiến Hồn.', complete: ['Chiến hồn đã yên nghỉ. Thần sử ghi tên ngươi.'],
  obj: [['kill', 'van_than_chien_truong_elite', 6, 'Diệt Thần Tướng Tàn Khu'], ['kill', 'van_than_chien_truong_boss', 1, 'Giải thoát Vạn Thần Chiến Hồn']], rw: R(41) });
q('mq_9_03', { chapter: 9, name: 'Kim Ô Thần Hoàng', giver: 'npc_vtct_herald', turnIn: 'npc_tcts_monk', prereq: ['mq_9_02'], reqRealm: 43,
  offer: ['Thần Hoàng Kim Ô thiêu đốt Thái Cổ Thần Sơn — chỉ người leo tới đỉnh mới thấy được Hỗn Độn.'], progress: 'Đánh bại Kim Ô Thần Hoàng.', complete: ['Ngọn lửa đã tắt... Từ đỉnh núi, ngươi thấy cổng Cấm Địa.'],
  obj: [['kill', 'thai_co_than_son_boss', 1, 'Đánh bại Kim Ô Thần Hoàng'], ['collect', 'mat_god_blood', 8, 'Thu Thần Huyết']], rw: R(43) });
q('mq_9_04', { chapter: 9, name: 'Cấm Địa', giver: 'npc_tcts_monk', turnIn: 'npc_tmcd_warden', prereq: ['mq_9_03'], reqRealm: 45,
  offer: ['Thần Ma Cổ Đế bị phong ấn trong cấm địa. Phong ấn đang yếu đi.'], progress: 'Điều tra cấm địa, gặp Cấm Vệ.', complete: ['Ngươi muốn vào? Vậy hãy chứng minh bằng cách sống sót.'],
  obj: [['interact', 'int_than_ma_cam_dia_clue', 1, 'Điều tra dấu vết phong ấn'], ['talk', 'npc_tmcd_warden', 1, 'Gặp Cấm Vệ Vô Danh']], rw: R(45) });
q('mq_9_05', { chapter: 9, name: 'Phong Thần', giver: 'npc_tmcd_warden', prereq: ['mq_9_04'], reqRealm: 45,
  offer: ['Hạ Thần Ma Cổ Đế trước khi hắn phá phong ấn.'], progress: 'Đánh bại Thần Ma Cổ Đế.', complete: ['Cổ Đế tan biến, để lại Thần Ấn.'],
  obj: [['kill', 'than_ma_cam_dia_boss', 1, 'Đánh bại Thần Ma Cổ Đế']], rw: { ...R(45, 2), items: [{ item: 'qi_god_seal', qty: 1 }] } });
q('mq_9_06', { chapter: 9, name: 'Cửa Hỗn Độn', giver: 'npc_tmcd_warden', turnIn: 'hon_nguyen_dien_lord', prereq: ['mq_9_05'], reqRealm: 46,
  offer: ['Thần Ấn mở đường vào Hỗn Nguyên Điện. Khi ngươi là Thần Tổ, Hỗn Độn sẽ nhận ngươi.'], progress: 'Đạt Thần Tổ, đến Hỗn Nguyên Điện.', complete: ['Thần Tổ... Hỗn Độn chờ ngươi đã lâu.'],
  obj: [['realm', '46', 1, 'Đạt cảnh giới Thần Tổ'], ['reach', 'hon_nguyen_dien', 1, 'Đến Hỗn Nguyên Điện'], ['talk', 'hon_nguyen_dien_lord', 1, 'Gặp Thành Chủ Hỗn Nguyên Điện']], rw: { ...R(46, 3), items: [{ item: 'pill_bt_47', qty: 1 }], title: 'Vạn Giới Bá Chủ' } });
q('mq_10_01', { chapter: 10, name: 'Hư Không Vô Tận', giver: 'hon_nguyen_dien_lord', turnIn: 'npc_vthk_wanderer', prereq: ['mq_9_06'], reqRealm: 47,
  offer: ['Hư Không Thôn Phệ Thú đang nuốt chửng các thế giới nhỏ.'], progress: 'Đánh bại Hư Không Thôn Phệ Thú.', complete: ['Hư không yên tĩnh hơn... và ngươi nhặt được Hỗn Độn La Bàn.'],
  obj: [['kill', 'vo_tan_hu_khong_boss', 1, 'Đánh bại Hư Không Thôn Phệ Thú']], rw: { ...R(47), items: [{ item: 'qi_chaos_compass', qty: 1 }] } });
q('mq_10_02', { chapter: 10, name: 'Cổ Lộ Luân Hồi', giver: 'npc_vthk_wanderer', turnIn: 'npc_hdcl_guide', prereq: ['mq_10_01'], reqRealm: 53,
  offer: ['La bàn chỉ về Hỗn Độn Cổ Lộ — Luân Hồi Cổ Long canh giữ con đường tới Thái Cổ.'], progress: 'Đánh bại Luân Hồi Cổ Long.', complete: ['Con đường Thái Cổ đã mở.'],
  obj: [['kill', 'hon_don_co_lo_boss', 1, 'Đánh bại Luân Hồi Cổ Long'], ['collect', 'mat_chaos_core', 10, 'Thu Hỗn Độn Hạch']], rw: R(53) });
q('mq_10_03', { chapter: 10, name: 'Chúa Tể Hỗn Độn', giver: 'npc_hdcl_guide', turnIn: 'thai_co_than_thanh_lord', prereq: ['mq_10_02'], reqRealm: 55,
  offer: ['Chỉ Hỗn Độn Chúa Tể mới bước qua cổng Thái Cổ.'], progress: 'Đạt Hỗn Độn Chúa Tể, đến Thái Cổ Thần Thành.', complete: ['Thái Cổ Thần Thành mở cửa cho kẻ đã chinh phục hỗn độn.'],
  obj: [['realm', '55', 1, 'Đạt Hỗn Độn Chúa Tể'], ['reach', 'thai_co_than_thanh', 1, 'Đến Thái Cổ Thần Thành'], ['talk', 'thai_co_than_thanh_lord', 1, 'Gặp Thành Chủ Thái Cổ Thần Thành']], rw: R(55, 2) });
q('mq_10_04', { chapter: 10, name: 'Khởi Nguyên', giver: 'thai_co_than_thanh_lord', turnIn: 'npc_kns_sage', prereq: ['mq_10_03'], reqRealm: 58,
  offer: ['Bàn Cổ Thạch Thần giữ Khởi Nguyên Thạch — mảnh đá đầu tiên của vạn giới.'], progress: 'Đánh bại Bàn Cổ Thạch Thần.', complete: ['Khởi Nguyên Thạch... nó đang cộng hưởng với ngọc bội Thái Sơ.'],
  obj: [['kill', 'khoi_nguyen_son_boss', 1, 'Đánh bại Bàn Cổ Thạch Thần']], rw: { ...R(58), items: [{ item: 'qi_origin_stone', qty: 1 }] } });
q('mq_10_05', { chapter: 10, name: 'Trường Hà Thời Không', giver: 'npc_kns_sage', turnIn: 'npc_tkth_ferry', prereq: ['mq_10_04'], reqRealm: 62,
  offer: ['Thời Không Chi Chủ muốn viết lại lịch sử vạn giới. Ngăn hắn lại.'], progress: 'Đánh bại Thời Không Chi Chủ.', complete: ['Dòng thời gian được bảo toàn.'],
  obj: [['kill', 'thoi_khong_truong_ha_boss', 1, 'Đánh bại Thời Không Chi Chủ'], ['collect', 'mat_origin_dust', 10, 'Thu Khởi Nguyên Trần']], rw: R(62, 2) });
q('mq_10_06', { chapter: 10, name: 'Vạn Giới Tranh Bá', giver: 'npc_tkth_ferry', turnIn: 'van_gioi_chan_thanh_lord', prereq: ['mq_10_05'], reqRealm: 64,
  offer: ['Khi ngươi là Thái Cổ Đạo Tổ, hãy đến Vạn Giới Chân Thành. Ở đó, hành trình mới thật sự bắt đầu.'], progress: 'Đạt Thái Cổ Đạo Tổ, đến Vạn Giới Chân Thành.', complete: ['Tên ngươi đã được khắc lên bia Vạn Giới. Nhưng ngai Người Mạnh Nhất Vạn Giới — phải giành lấy mỗi ngày.'],
  obj: [['realm', '64', 1, 'Đạt Thái Cổ Đạo Tổ'], ['reach', 'van_gioi_chan_thanh', 1, 'Đến Vạn Giới Chân Thành'], ['talk', 'van_gioi_chan_thanh_lord', 1, 'Gặp Thành Chủ Vạn Giới Chân Thành']], rw: { ...R(64, 5), items: [{ item: 'qi_myriad_crown', qty: 1 }, { item: 'pill_bt_65', qty: 1 }], title: 'Vạn Giới Chí Tôn' } });

// ---------- LÃNH THỔ TÔNG MÔN ----------
import { TERRITORY_MAPS } from './achievements.js';
for (const mid of TERRITORY_MAPS) {
  const m = MAPS[mid];
  mob(`${mid}_guardian`, `Thủ Hộ Linh Mạch ${m.name}`, 'golem', 'boss', m.reqRealm, 9, { mat: 'mat_spirit_crystal', skills: ['m_slam', 'm_shield', 'm_barrage'],
    phases: phases(`Thủ Hộ ${m.name}`, 'holy', 'shield', m.spawns[0]?.monster ?? 'slime_green'), extraDrops: [{ item: 'stone_refine', chance: 1, min: 2, max: 4 }] });
}
Object.assign(WORLD_EVENTS, { ev_territory_war: { id: 'ev_territory_war', name: 'Lãnh Thổ Chiến', desc: 'Thủ Hộ Linh Mạch xuất hiện ở mọi lãnh thổ — tông môn gây nhiều sát thương nhất sẽ chiếm lĩnh vùng đất.', map: '*', durationMin: 60, territory: true } });
EVENT_SCHEDULE.push({ key: 'ev_territory_war', hoursUtc: [19] });

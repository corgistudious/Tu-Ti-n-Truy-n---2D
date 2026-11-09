/**
 * HỆ THỐNG SỨC MẠNH NGOÀI CẢNH GIỚI: linh căn, thể chất, kinh mạch, lịch luyện, danh vọng thế lực, cơ duyên.
 * Tất cả hiệu ứng đều có trần (cap) để không làm vỡ cân bằng; server tính, client chỉ hiển thị.
 */
import type { PartialStats, SkillPath } from '../types.js';
import { add as addItem } from './items.js';
import { NPCS, MAPS } from './world.js';

// ======================= LINH CĂN =======================
export const ROOT_ELEMENTS = {
  kim: { name: 'Kim', paths: ['kiem', 'dao'] as SkillPath[], stat: 'atk' },
  moc: { name: 'Mộc', paths: ['ngu_thu', 'tran'] as SkillPath[], stat: 'maxHp' },
  thuy: { name: 'Thủy', paths: ['phap', 'tran'] as SkillPath[], stat: 'maxMp' },
  hoa: { name: 'Hỏa', paths: ['hoa'] as SkillPath[], stat: 'matk' },
  tho: { name: 'Thổ', paths: ['the', 'quyen'] as SkillPath[], stat: 'def' },
  loi: { name: 'Lôi', paths: ['loi'] as SkillPath[], stat: 'matk' },
  bang: { name: 'Băng', paths: ['bang'] as SkillPath[], stat: 'mdef' },
  phong: { name: 'Phong', paths: ['kiem', 'phu'] as SkillPath[], stat: 'crit' },
  am: { name: 'Âm', paths: ['doc', 'phu'] as SkillPath[], stat: 'pen' },
  hon_don: { name: 'Hỗn Độn', paths: ['kiem', 'dao', 'quyen', 'the', 'phap', 'loi', 'hoa', 'bang', 'doc', 'phu', 'tran', 'ngu_thu'] as SkillPath[], stat: 'atk' },
} as const;
export type RootElement = keyof typeof ROOT_ELEMENTS;
/** Phẩm linh căn: tốc độ tu luyện, thưởng sát thương con đường hợp nguyên tố */
export const ROOT_GRADES = [
  { id: 0, name: 'Chưa thức tỉnh', cultivation: 1.0, dmg: 0 },
  { id: 1, name: 'Phàm Phẩm Linh Căn', cultivation: 1.05, dmg: 0.03 },
  { id: 2, name: 'Hoàng Phẩm Linh Căn', cultivation: 1.12, dmg: 0.06 },
  { id: 3, name: 'Huyền Phẩm Linh Căn', cultivation: 1.2, dmg: 0.09 },
  { id: 4, name: 'Địa Phẩm Linh Căn', cultivation: 1.3, dmg: 0.12 },
  { id: 5, name: 'Thiên Phẩm Linh Căn', cultivation: 1.42, dmg: 0.15 },
  { id: 6, name: 'Thần Phẩm Linh Căn', cultivation: 1.55, dmg: 0.18 },
] as const;
/** Xác suất phẩm khi thức tỉnh (có kiểm soát): đa số Hoàng/Huyền, hiếm Thiên/Thần */
export const AWAKEN_TABLE: [number, number][] = [[1, 30], [2, 35], [3, 22], [4, 9], [5, 3.5], [6, 0.5]];

// ======================= THỂ CHẤT =======================
export const PHYSIQUES: Record<string, { name: string; desc: string; stats: PartialStats; rarity: number }> = {
  pham_the: { name: 'Phàm Thể', desc: 'Thể chất người thường.', stats: {}, rarity: 0 },
  kim_cuong_the: { name: 'Kim Cương Thể', desc: '+8% sinh lực, +10% phòng vật lý.', stats: { maxHp: 0.08, def: 0.1 }, rarity: 3 },
  thien_linh_the: { name: 'Thiên Linh Thể', desc: '+12% chân khí, +8% công pháp thuật.', stats: { maxMp: 0.12, matk: 0.08 }, rarity: 3 },
  kiem_cot: { name: 'Thiên Sinh Kiếm Cốt', desc: '+4% chí mạng, +8% công vật lý.', stats: { crit: 0.04, atk: 0.08 }, rarity: 4 },
  van_doc_bat_xam: { name: 'Vạn Độc Bất Xâm Thể', desc: '+10% kháng, +5% sinh lực.', stats: { res: 0.1, maxHp: 0.05 }, rarity: 4 },
  cuu_duong_the: { name: 'Cửu Dương Chi Thể', desc: '+12% công pháp thuật, +6% xuyên giáp.', stats: { matk: 0.12, pen: 0.06 }, rarity: 5 },
  hoang_co_thanh_the: { name: 'Hoang Cổ Thánh Thể', desc: '+15% sinh lực, +12% phòng, +6% công.', stats: { maxHp: 0.15, def: 0.12, mdef: 0.12, atk: 0.06 }, rarity: 6 },
  hon_don_the: { name: 'Hỗn Độn Thể', desc: '+8% mọi chỉ số chính.', stats: { maxHp: 0.08, maxMp: 0.08, atk: 0.08, matk: 0.08, def: 0.08, mdef: 0.08 }, rarity: 8 },
};

// ======================= KINH MẠCH (12 chính kinh + 8 kỳ kinh) =======================
const MERIDIAN_NAMES = ['Thủ Thái Âm Phế Kinh', 'Thủ Dương Minh Đại Trường Kinh', 'Túc Dương Minh Vị Kinh', 'Túc Thái Âm Tỳ Kinh', 'Thủ Thiếu Âm Tâm Kinh', 'Thủ Thái Dương Tiểu Trường Kinh',
  'Túc Thái Dương Bàng Quang Kinh', 'Túc Thiếu Âm Thận Kinh', 'Thủ Quyết Âm Tâm Bào Kinh', 'Thủ Thiếu Dương Tam Tiêu Kinh', 'Túc Thiếu Dương Đởm Kinh', 'Túc Quyết Âm Can Kinh',
  'Nhâm Mạch', 'Đốc Mạch', 'Xung Mạch', 'Đới Mạch', 'Âm Kiều Mạch', 'Dương Kiều Mạch', 'Âm Duy Mạch', 'Dương Duy Mạch'];
const MER_STATS: (keyof PartialStats)[] = ['maxHp', 'atk', 'def', 'maxMp', 'matk', 'mdef'];
export const MERIDIANS = MERIDIAN_NAMES.map((name, i) => ({
  idx: i, name, reqRealm: Math.min(60, Math.floor(i * 3)),
  stat: i >= 12 ? null : MER_STATS[i % 6],
  bonus: i >= 12 ? 0.025 : 0.02,                // kỳ kinh: +2.5% mọi chỉ số chính; chính kinh: +2% một chỉ số
  pill: `pill_meridian_${1 + Math.floor(i / 5)}`, pillQty: 1 + (i % 5), gold: Math.round(500 * Math.pow(2.1, i)), rate: Math.max(0.35, 0.85 - i * 0.025),
}));
const MP_NAMES = ['Thông Mạch Đan', 'Khai Mạch Đan', 'Phá Quan Đan', 'Tiên Thiên Thông Huyền Đan'];
MP_NAMES.forEach((n, i) => addItem({ id: `pill_meridian_${i + 1}`, name: n, type: 'pill', rarity: 2 + i * 2, reqRealm: i * 12, value: Math.round(300 * Math.pow(6, i)), desc: 'Dùng khi đả thông kinh mạch (bảng Tu Luyện → Kinh Mạch).', icon: 'icon_pill_purple', sources: ['Luyện đan', 'Boss', 'Cơ duyên'] }));
addItem({ id: 'stone_spirit_root', name: 'Trắc Linh Thạch Tinh Phách', type: 'material', rarity: 5, reqRealm: 9, value: 20000, desc: 'Dùng để tẩy luyện linh căn: thử nâng phẩm linh căn (có thể thất bại, không bao giờ tụt phẩm).', icon: 'icon_stone_gold', sources: ['Cơ duyên', 'Boss thế giới'] });

// ======================= LỊCH LUYỆN (kinh nghiệm chiến đấu) =======================
/** Cấp lịch luyện từ tổng kinh nghiệm chiến đấu: log-scale, thưởng chí mạng/xuyên giáp nhỏ có trần */
export function combatLevel(exp: number): number { return Math.min(100, Math.floor(Math.log10(Math.max(1, exp)) * 8)); }
export function combatLevelStats(level: number): PartialStats { return { crit: Math.min(0.05, level * 0.0005), pen: Math.min(0.05, level * 0.0005) }; }

// ======================= THẾ LỰC & DANH VỌNG =======================
export const FACTIONS: Record<string, { name: string; kind: 'chinh_dao' | 'ma_dao' | 'tong_mon' | 'gia_toc' | 'thuong_hoi' | 'trung_lap' | 'tien_mon' | 'than_toc'; desc: string; rival?: string }> = {
  bien_thon: { name: 'Biên Thôn', kind: 'trung_lap', desc: 'Dân làng biên giới.' },
  thanh_van: { name: 'Thanh Vân Thành', kind: 'chinh_dao', desc: 'Thành trì chính đạo nhân giới.', rival: 'hac_phong' },
  hac_phong: { name: 'Hắc Phong Trại', kind: 'ma_dao', desc: 'Sơn tặc khét tiếng.', rival: 'thanh_van' },
  thien_kiem: { name: 'Thiên Kiếm Tông', kind: 'tong_mon', desc: 'Đại tông môn kiếm đạo.', rival: 'ma_dao' },
  vo_dao_minh: { name: 'Võ Đạo Minh', kind: 'chinh_dao', desc: 'Liên minh võ giả Võ Đạo Giới.' },
  au_duong: { name: 'Âu Dương Gia Tộc', kind: 'gia_toc', desc: 'Gia tộc đúc kiếm cổ xưa.' },
  van_bao: { name: 'Vạn Bảo Thương Hội', kind: 'thuong_hoi', desc: 'Thương hội lớn nhất tu chân giới.' },
  ma_dao: { name: 'Ma Đạo', kind: 'ma_dao', desc: 'Liên minh ma tu.', rival: 'thien_kiem' },
  linh_toc: { name: 'Linh Tộc', kind: 'trung_lap', desc: 'Cư dân Linh Giới.' },
  tien_dinh: { name: 'Tiên Đình', kind: 'tien_mon', desc: 'Chính quyền tiên giới.', rival: 'thien_ma' },
  thien_ma: { name: 'Thiên Ma Tộc', kind: 'ma_dao', desc: 'Ma tộc ngoài thiên.', rival: 'tien_dinh' },
  than_toc: { name: 'Thần Tộc', kind: 'than_toc', desc: 'Hậu duệ chư thần.' },
  van_gioi_hoi: { name: 'Vạn Giới Hội', kind: 'trung_lap', desc: 'Liên minh cường giả vạn giới.' },
};
export const REP_TIERS = [
  { min: -Infinity, name: 'Thù Địch', discount: -0.2 }, { min: -3000, name: 'Lạnh Nhạt', discount: -0.05 }, { min: 0, name: 'Trung Lập', discount: 0 },
  { min: 1000, name: 'Thân Thiện', discount: 0.05 }, { min: 5000, name: 'Tôn Kính', discount: 0.1 }, { min: 15000, name: 'Sùng Bái', discount: 0.15 },
];
export function repTier(v: number) { let t = REP_TIERS[0]; for (const x of REP_TIERS) if (v >= x.min) t = x; return t; }
/** NPC thuộc thế lực (theo tiền tố/ID hoặc bản đồ) */
const NPC_FACTION: Record<string, string> = {
  npc_village_chief: 'bien_thon', npc_father: 'bien_thon', npc_martial_teacher: 'bien_thon', npc_herbalist_girl: 'bien_thon', npc_blacksmith_village: 'bien_thon', npc_grandma: 'bien_thon', npc_hunter: 'bien_thon',
  npc_sword_villa_master: 'au_duong', npc_old_servant: 'au_duong', npc_treasure_pavilion: 'van_bao', npc_auctioneer: 'van_bao', npc_th_merchant: 'van_bao',
  npc_demon_defector: 'ma_dao', npc_tmct_general: 'tien_dinh',
};
const TIER_FACTION: Record<string, string> = { pham_nhan: 'thanh_van', vo_dao: 'vo_dao_minh', tu_chan: 'thien_kiem', linh_gioi: 'linh_toc', tien_gioi: 'tien_dinh', thuong_tien: 'tien_dinh', than_vuc: 'than_toc', hon_don: 'van_gioi_hoi', thai_co: 'van_gioi_hoi', van_gioi: 'van_gioi_hoi' };
for (const m of Object.values(MAPS)) for (const n of m.npcs) {
  const d = NPCS[n.npc];
  if (!d || d.faction) continue;
  d.faction = NPC_FACTION[n.npc] ?? (n.npc.startsWith('npc_sect') ? 'thien_kiem' : TIER_FACTION[m.tier] ?? 'thanh_van');
}

// ======================= LỊCH TRÌNH NPC & NGÀY ĐÊM =======================
/** Chu kỳ ngày đêm 24 phút thực (đồng bộ với client): đêm khi giờ game 20h–5h */
export function gameHour(nowMs: number): number { return Math.floor((nowMs / 60000) % 24); }
export function isNight(nowMs: number): boolean { const h = gameHour(nowMs); return h >= 20 || h < 5; }
export function npcX(p: { x: number; nightX?: number }, nowMs: number): number { return p.nightX !== undefined && isNight(nowMs) ? p.nightX : p.x; }
// thương nhân / bảng treo thưởng về quán trọ ban đêm
for (const [mapId, npcIds] of Object.entries({ thanh_van_thanh: ['npc_merchant_city', 'npc_bounty_board', 'npc_tailor'], tan_thu_thon: ['npc_herbalist_girl', 'npc_blacksmith_village'], thien_huyen_thanh: ['npc_th_merchant'] })) {
  for (const p of MAPS[mapId].npcs) if (npcIds.includes(p.npc)) p.nightX = p.x + 96;
}

// ======================= CƠ DUYÊN =======================
export type FortuneTrigger = 'explore' | 'kill' | 'meditate' | 'gather';
export interface FortuneReward { kind: 'discover_map' | 'spirit_root' | 'physique' | 'item' | 'tuvi' | 'pet_egg'; value: string; qty?: number }
export interface FortuneDef {
  id: string; name: string; desc: string; trigger: FortuneTrigger;
  map?: string; target?: string;                    // map / monster id / node kind
  timeOfDay?: 'day' | 'night'; minRealm?: number; maxRealm?: number; quest?: string;
  chance: number;                                    // xác suất mỗi lần kiểm tra
  once: boolean; cooldownHours?: number; globalCap?: number; // giới hạn: một lần/nhân vật, hồi chiêu, số lượng toàn server
  rewards: FortuneReward[];
}
addItem({ id: 'art_thai_so_kiem', name: 'Thái Sơ Cổ Kiếm', type: 'weapon', slot: 'weapon', rarity: 8, reqRealm: 10, value: 50000, stats: { atk: 900, matk: 900, crit: 0.06, pen: 0.08 }, durability: 200, appearance: 'wpn_sword_4', tradable: false, desc: 'Cổ kiếm của Thái Sơ Tiên Tôn — chỉ 10 thanh tồn tại trên toàn server.', icon: 'icon_weapon', sources: ['Cơ duyên'] });
addItem({ id: 'art_hon_don_chau', name: 'Hỗn Độn Châu', type: 'artifact', slot: 'artifact', rarity: 9, reqRealm: 28, value: 2e6, stats: { atk: 1.2e5, matk: 1.4e5, pen: 0.12 }, durability: 300, tradable: false, desc: 'Viên châu sinh ra từ hỗn độn — chỉ 3 viên trên toàn server.', icon: 'icon_artifact', sources: ['Cơ duyên'] });
export const FORTUNES: FortuneDef[] = [
  { id: 'fo_co_mo', name: 'Cổ Mộ Dưới Rừng Trúc', desc: 'Một khe đá ẩn hiện dưới ánh trăng giữa Rừng Thanh Trúc.', trigger: 'explore', map: 'rung_thanh_truc', timeOfDay: 'night', minRealm: 1, chance: 0.25, once: true, rewards: [{ kind: 'discover_map', value: 'co_mo_thanh_truc' }] },
  { id: 'fo_vo_than', name: 'Mật Thất Võ Thần', desc: 'Pho tượng trong Võ Thần Điện khẽ dịch chuyển khi bạn đả tọa.', trigger: 'meditate', map: 'vo_than_dien', minRealm: 5, chance: 0.12, once: true, rewards: [{ kind: 'discover_map', value: 'vo_than_mat_that' }, { kind: 'item', value: 'pill_meridian_2', qty: 2 }] },
  { id: 'fo_linh_mach', name: 'Linh Mạch Lộ Thiên', desc: 'Khai khoáng ở Linh Hải chạm phải mạch linh khí cổ.', trigger: 'gather', map: 'linh_hai', target: 'ore', minRealm: 14, chance: 0.08, once: true, rewards: [{ kind: 'discover_map', value: 'linh_mach_bi_dong' }] },
  { id: 'fo_tien_phu', name: 'Tiên Phủ Ẩn Hiện', desc: 'Sương mù Vạn Tiên Sơn tan đi, lộ ra một tiên phủ cổ.', trigger: 'explore', map: 'van_tien_son', timeOfDay: 'day', minRealm: 21, chance: 0.15, once: true, rewards: [{ kind: 'discover_map', value: 'tien_phu_di_tich' }] },
  { id: 'fo_than_khu', name: 'Thần Khu Thức Tỉnh', desc: 'Hạ Ma Thần Phân Hồn, bạn cảm nhận một thân thể thần linh bị chôn vùi.', trigger: 'kill', target: 'than_ma_cam_dia_elite', minRealm: 42, chance: 0.1, once: true, rewards: [{ kind: 'discover_map', value: 'than_khu_tan_tich' }] },
  { id: 'fo_hon_don_nhan', name: 'Hỗn Độn Chi Nhãn', desc: 'Giữa Hỗn Nguyên Điện, hỗn độn mở ra một con mắt.', trigger: 'meditate', map: 'hon_nguyen_dien', minRealm: 50, chance: 0.08, once: true, rewards: [{ kind: 'discover_map', value: 'hon_don_chi_nhan' }] },
  { id: 'fo_thien_dia_linh_can', name: 'Thiên Địa Tẩy Linh', desc: 'Lôi kiếp quét qua Lôi Kiếp Đài, tẩy luyện linh căn của bạn.', trigger: 'meditate', map: 'loi_kiep_dai', minRealm: 12, chance: 0.05, once: true, rewards: [{ kind: 'spirit_root', value: 'upgrade' }] },
  { id: 'fo_kiem_cot', name: 'Kiếm Ý Nhập Cốt', desc: 'Đả tọa giữa vạn kiếm, kiếm ý thấm vào xương cốt.', trigger: 'meditate', map: 'van_kiem_son', minRealm: 7, chance: 0.04, once: true, rewards: [{ kind: 'physique', value: 'kiem_cot' }] },
  { id: 'fo_van_doc', name: 'Vạn Độc Thối Thể', desc: 'Sống sót giữa độc vụ, thân thể bạn kháng được vạn độc.', trigger: 'kill', target: 'boss_poison_queen', minRealm: 5, chance: 0.3, once: true, rewards: [{ kind: 'physique', value: 'van_doc_bat_xam' }] },
  { id: 'fo_cuu_duong', name: 'Kim Ô Truyền Hỏa', desc: 'Ngọn lửa cuối cùng của Kim Ô Thần Hoàng nhập vào bạn.', trigger: 'kill', target: 'thai_co_than_son_boss', minRealm: 43, chance: 0.25, once: true, rewards: [{ kind: 'physique', value: 'cuu_duong_the' }] },
  { id: 'fo_hoang_co', name: 'Hoang Cổ Huyết Mạch', desc: 'Trên Cổ Chiến Trường, máu chiến thần thượng cổ thức tỉnh trong bạn.', trigger: 'kill', target: 'world_boss_war_god', minRealm: 8, chance: 0.05, once: true, rewards: [{ kind: 'physique', value: 'hoang_co_thanh_the' }] },
  { id: 'fo_hon_don_the', name: 'Hỗn Độn Khai Thể', desc: 'Đả tọa nơi Hỗn Độn Cổ Lộ, thân thể bạn hóa thành hỗn độn.', trigger: 'meditate', map: 'hon_don_co_lo', minRealm: 53, chance: 0.02, once: true, rewards: [{ kind: 'physique', value: 'hon_don_the' }] },
  { id: 'fo_thai_so_kiem', name: 'Thái Sơ Kiếm Minh', desc: 'Trong Cổ Mộ, một thanh cổ kiếm rung lên đáp lại ngọc bội của bạn.', trigger: 'kill', target: 'co_mo_thanh_truc_boss', minRealm: 2, chance: 0.2, once: true, globalCap: 10, rewards: [{ kind: 'item', value: 'art_thai_so_kiem' }] },
  { id: 'fo_hon_don_chau', name: 'Hỗn Độn Châu Hiện Thế', desc: 'Hỗn Độn Chi Nhãn khép lại, để lại một viên châu.', trigger: 'kill', target: 'hon_don_chi_nhan_boss', minRealm: 52, chance: 0.15, once: true, globalCap: 3, rewards: [{ kind: 'item', value: 'art_hon_don_chau' }] },
  { id: 'fo_linh_ho', name: 'Linh Hồ Báo Ân', desc: 'Một con linh hồ bị thương mà bạn tha mạng quay lại dâng trứng.', trigger: 'kill', target: 'fox_spirit_young', minRealm: 0, chance: 0.01, once: true, rewards: [{ kind: 'pet_egg', value: 'egg_fox' }] },
  { id: 'fo_ngo_dao', name: 'Đốn Ngộ', desc: 'Một khoảnh khắc đốn ngộ giữa lúc đả tọa.', trigger: 'meditate', chance: 0.003, once: false, cooldownHours: 24, rewards: [{ kind: 'tuvi', value: 'layer_10pct' }] },
  { id: 'fo_tham_duoc', name: 'Linh Dược Ngàn Năm', desc: 'Hái được một gốc linh dược ngàn năm.', trigger: 'gather', target: 'herb', chance: 0.01, once: false, cooldownHours: 12, rewards: [{ kind: 'item', value: 'pill_marrow', qty: 1 }, { kind: 'item', value: 'pill_meridian_1', qty: 2 }] },
  { id: 'fo_tinh_phach', name: 'Trắc Linh Tinh Phách', desc: 'Boss thế giới để lại một khối tinh phách đo linh căn.', trigger: 'kill', target: 'world_boss_void_titan', minRealm: 17, chance: 0.2, once: false, cooldownHours: 72, rewards: [{ kind: 'item', value: 'stone_spirit_root', qty: 1 }] },
];

// ======================= NHIỆM VỤ CÓ LỰA CHỌN & HẬU QUẢ =======================
import { q as defineQuest } from './quests.js';
defineQuest('cq_bandit_badges', { kind: 'side', category: 'investigate', name: '[Lựa chọn] Số Phận Huy Hiệu Sơn Tặc', giver: 'npc_captive_merchant', prereq: ['mq_2_03'], reqRealm: 1,
  offer: ['Huy hiệu sơn tặc rất có giá... Thành Chủ muốn chúng làm bằng chứng, còn Hắc Phong Trại trả giá cao để chuộc lại.', 'Mang 8 huy hiệu tới đây, ngươi tự quyết định giao cho ai.'],
  progress: 'Thu 8 Huy Hiệu Sơn Tặc.', complete: ['Ngươi đã chọn — hãy sống với lựa chọn đó.'],
  obj: [['collect', 'mat_bandit_badge', 8, 'Thu Huy Hiệu Sơn Tặc']], rw: { exp: 1800, tuvi: 900, gold: 500 } });
defineQuest('cq_defector', { kind: 'side', category: 'investigate', name: '[Lựa chọn] Ma Tu Quy Thuận', giver: 'npc_demon_defector', prereq: ['mq_5_06'], reqRealm: 15,
  offer: ['Ta muốn rời ma đạo, nhưng cần bằng chứng để chính đạo tin ta. Mang Ma Giác về đây.', 'Ngươi có thể che giấu ta... hoặc giao ta cho Thiên Kiếm Tông.'],
  progress: 'Thu 6 Ma Giác.', complete: ['Quyết định của ngươi sẽ được cả chính và ma ghi nhớ.'],
  obj: [['collect', 'mat_demon_horn', 6, 'Thu Ma Giác']], rw: { exp: 2e7, tuvi: 1e7, gold: 8e5, spirit_stones: 150 } });
defineQuest('cq_trade_contract', { kind: 'side', category: 'investigate', name: '[Lựa chọn] Khế Ước Vạn Bảo', giver: 'npc_treasure_pavilion', prereq: ['mq_5_02'], reqRealm: 11,
  offer: ['Vạn Bảo Các cần Xích Đồng. Ta trả giá công bằng.', 'Nghe nói chợ đen trả gấp đôi... tùy ngươi.'],
  progress: 'Thu 15 Xích Đồng.', complete: ['Giao dịch hoàn tất.'],
  obj: [['collect', 'ore_t3', 15, 'Thu Xích Đồng']], rw: { exp: 3e6, tuvi: 1.5e6, gold: 2e5 } });
import { QUESTS as QS } from './quests.js';
QS['cq_bandit_badges'].choices = [
  { id: 'thanh_van', text: 'Giao cho Thành Chủ Thanh Vân làm bằng chứng', rep: { thanh_van: 1500, hac_phong: -1500 }, items: [{ item: 'stone_enhance', qty: 5 }], outcome: 'Thành Chủ dùng bằng chứng truy quét sơn tặc. Chính đạo ghi nhận công lao.' },
  { id: 'hac_phong', text: 'Bán lại cho Hắc Phong Trại lấy vàng', rep: { hac_phong: 1500, thanh_van: -1500 }, items: [{ item: 'pill_hp_2', qty: 10 }], outcome: 'Sơn tặc trả hậu hĩnh — nhưng dân Thanh Vân bắt đầu xì xào về ngươi.' },
];
QS['cq_defector'].choices = [
  { id: 'shelter', text: 'Che giấu Mặc Uyên', rep: { ma_dao: 2000, thien_kiem: -1000 }, items: [{ item: 'pill_meridian_2', qty: 2 }], outcome: 'Mặc Uyên truyền lại bí pháp ma đạo để tạ ơn.' },
  { id: 'report', text: 'Giao Mặc Uyên cho Thiên Kiếm Tông', rep: { thien_kiem: 2000, ma_dao: -2500 }, items: [{ item: 'pill_bt_assist', qty: 3 }], outcome: 'Tông môn trọng thưởng; ma đạo xem ngươi là kẻ thù.' },
];
QS['cq_trade_contract'].choices = [
  { id: 'honest', text: 'Bán cho Vạn Bảo Các với giá công bằng', rep: { van_bao: 2500 }, items: [{ item: 'stone_reroll', qty: 1 }], outcome: 'Vạn Bảo Các ghi tên ngươi vào sổ khách quý (giảm giá ở cửa hàng thương hội).' },
  { id: 'black_market', text: 'Bán cho chợ đen lấy gấp đôi', rep: { van_bao: -2000 }, items: [{ item: 'bag_stones_small', qty: 4 }], outcome: 'Lời to — nhưng Vạn Bảo Các sẽ không quên.' },
];

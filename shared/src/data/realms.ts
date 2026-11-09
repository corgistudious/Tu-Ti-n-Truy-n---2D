import type { RealmDef, RealmStage, TrialKind } from '../types.js';

const NAMES: [string, string, RealmStage, string][] = [
  ['pham_nhan', 'Phàm Nhân', 'vo_dao', 'Thân thể người thường, chưa biết đến võ đạo.'],
  ['nhap_mon', 'Nhập Môn', 'vo_dao', 'Bước đầu rèn luyện quyền cước, biết điều tức hơi thở.'],
  ['luyen_the', 'Luyện Thể', 'vo_dao', 'Tôi luyện gân cốt, da thịt cứng như gỗ đá.'],
  ['noi_kinh', 'Nội Kình', 'vo_dao', 'Khí lực vận chuyển trong kinh mạch, xuất chiêu mang theo kình lực.'],
  ['am_kinh', 'Ám Kình', 'vo_dao', 'Kình lực ẩn tàng, thương tổn từ bên trong.'],
  ['hoa_kinh', 'Hóa Kình', 'vo_dao', 'Cương nhu hợp nhất, kình lực tùy tâm biến hóa.'],
  ['tien_thien', 'Tiên Thiên', 'vo_dao', 'Đả thông nhâm đốc, chân khí tiên thiên tự sinh.'],
  ['vo_dao_tong_su', 'Võ Đạo Tông Sư', 'vo_dao', 'Khai tông lập phái, một người địch trăm người.'],
  ['dai_tong_su', 'Đại Tông Sư', 'vo_dao', 'Võ ý thông thần, chạm tới ranh giới thiên địa.'],
  ['vo_dao_dai_de', 'Võ Đạo Đại Đế', 'vo_dao', 'Đỉnh cao võ đạo nhân gian, linh căn chờ thức tỉnh.'],
  ['luyen_khi', 'Luyện Khí', 'tu_chan', 'Dẫn linh khí nhập thể, chính thức bước vào tu chân.'],
  ['truc_co', 'Trúc Cơ', 'tu_chan', 'Xây nền đạo cơ, thọ nguyên tăng mạnh.'],
  ['kim_dan', 'Kim Đan', 'tu_chan', 'Ngưng tụ kim đan, pháp lực hùng hậu.'],
  ['nguyen_anh', 'Nguyên Anh', 'tu_chan', 'Đan phá anh thành, nguyên thần xuất khiếu.'],
  ['hoa_than', 'Hóa Thần', 'tu_chan', 'Nguyên anh hóa thần, cảm ngộ pháp tắc.'],
  ['luyen_hu', 'Luyện Hư', 'tu_chan', 'Luyện thần phản hư, thân hòa vào hư không.'],
  ['hop_the', 'Hợp Thể', 'tu_chan', 'Thân thần hợp nhất, pháp tướng thiên địa.'],
  ['dai_thua', 'Đại Thừa', 'tu_chan', 'Đại đạo viên mãn, chờ ngày độ kiếp.'],
  ['do_kiep', 'Độ Kiếp', 'tu_chan', 'Nghênh đón cửu trùng thiên kiếp, thành thì phi thăng.'],
  ['nhan_tien', 'Nhân Tiên', 'tien_gioi', 'Vừa phi thăng tiên giới, tiên khí còn non nớt.'],
  ['dia_tien', 'Địa Tiên', 'tien_gioi', 'Tiên thể vững chắc, mượn địa mạch tu hành.'],
  ['thien_tien', 'Thiên Tiên', 'tien_gioi', 'Ngự gió cửu thiên, tiên pháp thông huyền.'],
  ['chan_tien', 'Chân Tiên', 'tien_gioi', 'Chân linh bất diệt, nắm giữ một phần pháp tắc.'],
  ['huyen_tien', 'Huyền Tiên', 'tien_gioi', 'Huyền diệu khó lường, pháp tắc dung hợp.'],
  ['kim_tien', 'Kim Tiên', 'tien_gioi', 'Kim thân bất hoại, vạn kiếp bất ma.'],
  ['dai_la_kim_tien', 'Đại La Kim Tiên', 'tien_gioi', 'Siêu thoát thời không, nhảy khỏi luân hồi.'],
  ['tien_quan', 'Tiên Quân', 'tien_gioi', 'Thống lĩnh một phương tiên vực.'],
  ['tien_vuong', 'Tiên Vương', 'tien_gioi', 'Vương giả tiên giới, một niệm định sinh tử.'],
  ['tien_de', 'Tiên Đế', 'tien_gioi', 'Chí tôn tiên giới — nhưng phía trên vẫn còn Hỗn Độn.'],
];

/** Vật liệu theo bậc (tier) dùng cho đột phá */
export function herbForRealm(idx: number): string { return `herb_t${Math.min(7, 1 + Math.floor(idx / 4))}`; }
export function oreForRealm(idx: number): string { return `ore_t${Math.min(7, 1 + Math.floor(idx / 4))}`; }

const UNLOCKS: Record<number, string[]> = {
  0: ['tan_thu_thon', 'rung_thanh_truc'],
  1: ['hac_phong_son', 'thanh_van_thanh'],
  2: ['vo_dao_hoc_vien'],
  3: ['co_kiem_son_trang'],
  4: ['yeu_thu_son_mach'],
  5: ['van_duoc_coc'],
  6: ['thien_kiem_tong'],
  7: ['u_minh_dong'],
  8: ['co_chien_truong'],
  10: ['linh_van_chau', 'thien_huyen_thanh'],
  11: ['van_bao_cac'],
  12: ['loi_kiep_dai'],
  13: ['thuong_co_bi_canh'],
  15: ['ma_vuc'],
  17: ['thien_ngoai_chien_truong'],
  19: ['phi_thang_dai', 'cuu_thien_tien_thanh'],
  21: ['van_tien_son'],
  25: ['thien_de_cung'],
  28: ['hon_don_hai'],
};

/** Nhiệm vụ cốt truyện chặn đột phá ở các mốc lớn */
const QUEST_GATES: Record<number, string> = {
  0: 'mq_1_04',   // Phàm Nhân -> Nhập Môn: phải học võ ở thôn
  5: 'mq_3_05',   // Hóa Kình -> Tiên Thiên: gia nhập Thiên Kiếm Tông
  9: 'mq_4_06',   // Võ Đạo Đại Đế -> Luyện Khí: thức tỉnh linh căn
  18: 'mq_6_06',  // Độ Kiếp -> Nhân Tiên: phi thăng
  28: 'mq_7_06',  // Tiên Đế -> Hỗn Độn
};

function trialFor(idx: number, stage: RealmStage): TrialKind {
  if (idx <= 2) return 'none';
  if (stage === 'vo_dao') return 'tam_ma';
  if (stage === 'tu_chan') return idx >= 14 ? 'both' : 'thien_kiep';
  return 'both';
}

function makeRealm(idx: number, id: string, name: string, stage: RealmStage, description: string): RealmDef {
  const bt = {
    materials: idx === 0 ? [] : [
      { item: `pill_bt_${Math.min(idx, 29)}`, qty: 1 },
      { item: herbForRealm(idx), qty: 3 + Math.floor(idx / 3) },
      { item: oreForRealm(idx), qty: 2 + Math.floor(idx / 4) },
    ],
    gold: Math.round(100 * Math.pow(1.6, Math.min(idx, 40))),
    baseRate: Math.max(0.35, 0.95 - idx * 0.018),
    trial: trialFor(idx, stage),
    questRequired: QUEST_GATES[idx],
  };
  return { idx, id, name, stage, layers: 9, breakthrough: bt, unlockMaps: UNLOCKS[idx] ?? [], description };
}

export const REALMS: RealmDef[] = NAMES.map(([id, name, stage, d], i) => makeRealm(i, id, name, stage, d));

/** Cảnh giới vượt Tiên Đế: Hỗn Độn Cảnh tầng thứ N — không có điểm kết thúc. */
export function realmDef(idx: number): RealmDef {
  if (idx < REALMS.length) return REALMS[idx];
  const n = idx - REALMS.length + 1;
  return makeRealm(idx, `hon_don_${n}`, `Hỗn Độn Cảnh — Trọng ${n}`, 'hon_don', 'Vượt ngoài tiên giới, mỗi trọng là một tầng thế giới mới.');
}

export function realmName(idx: number, layer: number): string {
  return `${realmDef(idx).name} tầng ${layer}`;
}

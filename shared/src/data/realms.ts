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
  ['tien_de', 'Tiên Đế', 'tien_gioi', 'Chí tôn tiên giới — nhưng phía trên vẫn còn Thượng Tiên Giới.'],
  // Thượng Tiên (29-37)
  ['thai_at_tien', 'Thái Ất Tiên', 'thuong_tien', 'Bước qua giới hạn tiên giới, chạm tới Thái Hư.'],
  ['thai_thanh_tien', 'Thái Thanh Tiên', 'thuong_tien', 'Tiên lực thanh khiết, không vướng nhân quả.'],
  ['thai_hu_tien', 'Thái Hư Tiên', 'thuong_tien', 'Thân hòa vào thái hư, đi lại giữa các tầng trời.'],
  ['hon_nguyen_tien', 'Hỗn Nguyên Tiên', 'thuong_tien', 'Ba hoa tụ đỉnh, năm khí triều nguyên.'],
  ['vo_cuc_tien', 'Vô Cực Tiên', 'thuong_tien', 'Đạo vô cực, lực vô biên.'],
  ['dao_tien', 'Đạo Tiên', 'thuong_tien', 'Lĩnh ngộ một đại đạo hoàn chỉnh.'],
  ['tien_ton', 'Tiên Tôn', 'thuong_tien', 'Được vạn tiên tôn kính.'],
  ['tien_thanh', 'Tiên Thánh', 'thuong_tien', 'Lập ngôn thành pháp, một lời định càn khôn.'],
  ['tien_to', 'Tiên Tổ', 'thuong_tien', 'Tổ của một mạch tiên đạo — Thần Vực đã mở cửa.'],
  // Thần (38-46)
  ['than_nhan', 'Thần Nhân', 'than', 'Tiên thể hóa thần thể, thần lực sơ sinh.'],
  ['than_tuong', 'Thần Tướng', 'than', 'Thần lực ngưng tụ thành giáp.'],
  ['than_quan', 'Thần Quân', 'than', 'Thống lĩnh thần binh một phương.'],
  ['than_vuong', 'Thần Vương', 'than', 'Vương giả Thần Vực.'],
  ['than_hoang', 'Thần Hoàng', 'than', 'Thần uy bao trùm vạn dặm.'],
  ['than_de', 'Thần Đế', 'than', 'Đế giả trong chư thần.'],
  ['than_ton', 'Thần Tôn', 'than', 'Chạm tới quyền năng pháp tắc.'],
  ['chu_than', 'Chủ Thần', 'than', 'Nắm giữ thần quốc riêng.'],
  ['than_to', 'Thần Tổ', 'than', 'Tổ thần — Hỗn Độn hiện ra trước mắt.'],
  // Hỗn Độn (47-55)
  ['hon_don_linh_the', 'Hỗn Độn Linh Thể', 'hon_don', 'Thân thể dung nạp hỗn độn khí.'],
  ['hon_don_dao_the', 'Hỗn Độn Đạo Thể', 'hon_don', 'Hỗn độn khí hóa thành đạo thể.'],
  ['hon_nguyen_thanh', 'Hỗn Nguyên Thánh', 'hon_don', 'Thánh giả trong hỗn nguyên.'],
  ['hon_don_thanh_ton', 'Hỗn Độn Thánh Tôn', 'hon_don', 'Làm chủ không gian.'],
  ['hon_don_chi_thanh', 'Hỗn Độn Chí Thánh', 'hon_don', 'Bước vào dòng thời gian.'],
  ['hon_don_dao_quan', 'Hỗn Độn Đạo Quân', 'hon_don', 'Cảm ngộ luân hồi.'],
  ['hon_don_dao_ton', 'Hỗn Độn Đạo Tôn', 'hon_don', 'Một niệm khai thiên.'],
  ['hon_don_dao_to', 'Hỗn Độn Đạo Tổ', 'hon_don', 'Tổ của hỗn độn đạo.'],
  ['hon_don_chua_te', 'Hỗn Độn Chúa Tể', 'hon_don', 'Chúa tể hỗn độn — Thái Cổ đang chờ.'],
  // Thái Cổ (56-64)
  ['khoi_nguyen', 'Khởi Nguyên Cảnh', 'thai_co', 'Truy về khởi nguyên vạn vật.'],
  ['bat_hu', 'Bất Hủ Cảnh', 'thai_co', 'Thân không hủy theo thời gian.'],
  ['vinh_hang', 'Vĩnh Hằng Cảnh', 'thai_co', 'Tồn tại vượt mọi chu kỳ thế giới.'],
  ['thai_co_dao_quan', 'Thái Cổ Đạo Quân', 'thai_co', 'Đạo quân thời thái cổ.'],
  ['thai_co_dao_ton', 'Thái Cổ Đạo Tôn', 'thai_co', 'Được cổ thần tôn kính.'],
  ['thai_co_chi_ton', 'Thái Cổ Chí Tôn', 'thai_co', 'Chí tôn của vạn đạo cổ xưa.'],
  ['khai_thien', 'Khai Thiên Cảnh', 'thai_co', 'Có thể khai mở một thiên địa.'],
  ['sang_the', 'Sáng Thế Cảnh', 'thai_co', 'Sáng tạo thế giới của riêng mình.'],
  ['thai_co_dao_to', 'Thái Cổ Đạo Tổ', 'thai_co', 'Đạo tổ — cánh cửa Vạn Giới Chân Cảnh mở ra.'],
];

/** Vật liệu theo bậc (tier) dùng cho đột phá */
export function materialTier(idx: number): number {
  if (idx < 28) return Math.min(7, 1 + Math.floor(idx / 4));
  if (idx < 38) return 8;
  if (idx < 47) return 9;
  return 10;
}
export function herbForRealm(idx: number): string { return `herb_t${materialTier(idx)}`; }
export function oreForRealm(idx: number): string { return `ore_t${materialTier(idx)}`; }
/** Số cảnh giới có tên; sau đó là Vạn Giới Chân Cảnh — Trọng N vô hạn */
export const MAX_PILL_REALM = 65;

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
  28: ['hon_don_hai', 'tien_ma_chien_truong'],
  29: ['thai_hu_thien'], 33: ['vo_cuc_tien_cung'], 35: ['cuu_trong_thien'], 37: ['thuong_co_tien_vuc'],
  38: ['than_dinh'], 41: ['van_than_chien_truong'], 43: ['thai_co_than_son'], 45: ['than_ma_cam_dia'],
  47: ['vo_tan_hu_khong'], 50: ['hon_nguyen_dien'], 53: ['hon_don_co_lo'],
  56: ['thai_co_than_thanh'], 58: ['khoi_nguyen_son'], 60: ['van_dao_bi_canh'], 62: ['thoi_khong_truong_ha'],
  65: ['van_gioi_chan_thanh', 'van_gioi_chien_truong'],
};

/** Nhiệm vụ cốt truyện chặn đột phá ở các mốc lớn */
const QUEST_GATES: Record<number, string> = {
  0: 'mq_1_04',   // Phàm Nhân -> Nhập Môn: phải học võ ở thôn
  5: 'mq_3_05',   // Hóa Kình -> Tiên Thiên: gia nhập Thiên Kiếm Tông
  9: 'mq_4_06',   // Võ Đạo Đại Đế -> Luyện Khí: thức tỉnh linh căn
  18: 'mq_6_06',  // Độ Kiếp -> Nhân Tiên: phi thăng
  28: 'mq_7_06',  // Tiên Đế -> Thượng Tiên
  37: 'mq_8_06',  // Tiên Tổ -> Thần Vực
  46: 'mq_9_06',  // Thần Tổ -> Hỗn Độn
  55: 'mq_10_03', // Hỗn Độn Chúa Tể -> Thái Cổ
  64: 'mq_10_06', // Thái Cổ Đạo Tổ -> Vạn Giới Chân Cảnh
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
      { item: `pill_bt_${Math.min(idx, MAX_PILL_REALM)}`, qty: 1 },
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
  return makeRealm(idx, `van_gioi_${n}`, `Vạn Giới Chân Cảnh — Trọng ${n}`, 'van_gioi', 'Đỉnh của vạn giới vẫn chưa phải điểm cuối: mỗi trọng là một tầng thế giới và pháp tắc mới.');
}

export function realmName(idx: number, layer: number): string {
  return `${realmDef(idx).name} tầng ${layer}`;
}

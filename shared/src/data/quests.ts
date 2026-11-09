import type { DialogueLine, QuestDef, QuestObjective } from '../types.js';

const quests: Record<string, QuestDef> = {};
type O = [QuestObjective['type'], string, number, string, Partial<QuestObjective>?];
interface Q {
  name: string; kind?: QuestDef['kind']; chapter?: number; category?: QuestDef['category']; giver: string; turnIn?: string; reqRealm?: number; prereq?: string[];
  offer: (string | [string, string])[]; progress: string; complete: (string | [string, string])[]; obj: O[]; rw: QuestDef['rewards']; repeatable?: 'daily' | 'weekly';
}
const P = 'Bạn';
function lines(giver: string, arr: (string | [string, string])[]): DialogueLine[] {
  return arr.map((l) => (typeof l === 'string' ? { speaker: giver, text: l } : { speaker: l[0], text: l[1] }));
}
function q(id: string, d: Q): void {
  if (quests[id]) throw new Error('dup quest ' + id);
  quests[id] = {
    id, name: d.name, kind: d.kind ?? 'main', chapter: d.chapter, category: d.category ?? (d.kind === 'main' || !d.kind ? 'story' : undefined),
    giver: d.giver, turnIn: d.turnIn ?? d.giver, reqRealm: d.reqRealm ?? 0, prereq: d.prereq ?? [],
    dialogue: { offer: lines(d.giver, d.offer), progress: d.progress, complete: lines(d.turnIn ?? d.giver, d.complete) },
    objectives: d.obj.map(([type, target, count, desc, extra], i) => ({ id: `o${i + 1}`, type, target, count, desc, ...(extra ?? {}) })),
    rewards: d.rw, repeatable: d.repeatable,
  };
}

// ======================= CHƯƠNG 1 — THÔN BIÊN GIỚI =======================
q('mq_1_01', { chapter: 1, name: 'Tỉnh Giấc Nơi Biên Thôn', giver: 'npc_father', turnIn: 'npc_village_chief',
  offer: ['Con dậy rồi à? Đêm qua trời đổ mưa sao băng, cả rừng trúc sáng rực.', 'Trưởng thôn Lý Bá muốn gặp con. Mau đến đó.'],
  progress: 'Trưởng thôn đang đợi ở đầu thôn.', complete: ['Ngươi đến rồi. Đêm qua yêu thú trong rừng gầm rú, linh khí đột nhiên dao động...', 'Thôn ta cần người có sức. Ngươi có muốn giúp không?'],
  obj: [['talk', 'npc_village_chief', 1, 'Gặp Trưởng Thôn Lý Bá']], rw: { exp: 60, tuvi: 30, gold: 50, items: [{ item: 'pill_hp_1', qty: 5 }] } });
q('mq_1_02', { chapter: 1, name: 'Thử Sức', giver: 'npc_village_chief', prereq: ['mq_1_01'],
  offer: ['Linh nhầy ở cuối thôn đang phá hoại ruộng rau.', 'Đánh bại 3 con Lục Linh Nhầy cho ta xem bản lĩnh. Nhấn J (hoặc nút Đánh) để tấn công.'],
  progress: 'Lục Linh Nhầy ở phía đông thôn.', complete: ['Không tệ! Thân thủ khá linh hoạt.'],
  obj: [['kill', 'slime_green', 3, 'Đánh bại Lục Linh Nhầy']], rw: { exp: 120, tuvi: 60, gold: 80, items: [{ item: 'eq_weapon_0', qty: 1 }] } });
q('mq_1_03', { chapter: 1, name: 'Bó Thảo Dược', giver: 'npc_herbalist_girl', prereq: ['mq_1_02'],
  offer: ['Huynh/tỷ ơi, muội cần Thanh Linh Thảo để làm thuốc cho dân làng bị thương.', 'Cỏ mọc ở bãi cỏ cuối thôn. Đứng cạnh bụi cỏ phát sáng rồi nhấn E để hái nhé!'],
  progress: 'Cần 3 Thanh Linh Thảo.', complete: ['Cảm ơn nhiều! Muội tặng bình thuốc tự làm.'],
  obj: [['collect', 'herb_t1', 3, 'Hái Thanh Linh Thảo']], rw: { exp: 150, tuvi: 70, gold: 60, items: [{ item: 'pill_hp_1', qty: 5 }, { item: 'pill_mp_1', qty: 5 }, { item: 'tool_sickle_1', qty: 1 }] } });
q('mq_1_04', { chapter: 1, name: 'Bái Sư Học Võ', giver: 'npc_martial_teacher', prereq: ['mq_1_02'],
  offer: ['Ngươi muốn học võ? Võ đạo bắt đầu bằng mồ hôi.', 'Đánh Mộc Nhân Luyện Công 5 lần. Sau đó đến ta mua bí tịch nhập môn — mỗi con đường một khác: Kiếm, Đao, Quyền, Thể, Pháp, Lôi, Hỏa, Băng, Độc, Phù, Trận, Ngự Thú.'],
  progress: 'Mộc Nhân ở sân luyện võ.', complete: ['Tốt. Từ nay ngươi là đệ tử ký danh của ta.', 'Khi tu vi đủ, mở bảng Nhân Vật và Đột Phá lên Nhập Môn.'],
  obj: [['kill', 'training_dummy', 5, 'Đánh Mộc Nhân Luyện Công']], rw: { exp: 200, tuvi: 120, gold: 300, items: [{ item: 'pill_bt_1', qty: 1 }, { item: 'herb_t1', qty: 3 }, { item: 'ore_t1', qty: 2 }] } });
q('mq_1_05', { chapter: 1, name: 'Ánh Sáng Kỳ Lạ', giver: 'npc_grandma', prereq: ['mq_1_04'],
  offer: ['Hài tử... ngươi có thấy ánh sáng xanh ở bãi cỏ phía đông không?', 'Bà già này mù, nhưng cảm nhận được... thứ đó đã ngủ hàng ngàn năm.'],
  progress: 'Điều tra ánh sáng kỳ lạ ở cuối thôn.', complete: [[P, 'Là một miếng ngọc bội cổ, ấm như có sinh mệnh.'], 'Giữ lấy nó. Duyên phận của ngươi bắt đầu từ đây.'],
  obj: [['kill', 'slime_green', 4, 'Dọn dẹp linh nhầy quanh nơi phát sáng'], ['interact', 'int_strange_light', 1, 'Điều tra ánh sáng kỳ lạ']], rw: { exp: 260, tuvi: 150, gold: 100, items: [{ item: 'qi_jade_pendant', qty: 1 }] } });
q('mq_1_06', { chapter: 1, name: 'Dấu Vết Yêu Thú', giver: 'npc_father', turnIn: 'npc_hunter', prereq: ['mq_1_05'],
  offer: ['Từ khi ngọc bội xuất hiện, yêu thú trong Rừng Thanh Trúc kéo về gần thôn.', 'Vào rừng xem xét, tìm A Tứ thợ săn.'],
  progress: 'Điều tra vết cào và diệt sói đen trong Rừng Thanh Trúc.', complete: ['Vết cào này... không phải của sói thường. Có thứ gì đó lớn hơn đang sai khiến chúng.'],
  obj: [['interact', 'int_claw_marks', 1, 'Điều tra vết cào trên thân trúc', { map: 'rung_thanh_truc' }], ['kill', 'wolf_black', 5, 'Diệt Hắc Phong Lang']], rw: { exp: 450, tuvi: 260, gold: 200, items: [{ item: 'eq_armor_0', qty: 1 }] } });
q('mq_1_07', { chapter: 1, name: 'Thanh Trúc Yêu Vương', giver: 'npc_hunter', turnIn: 'npc_village_chief', prereq: ['mq_1_06'],
  offer: ['Sâu trong rừng có Thanh Trúc Yêu Vương — nó bị linh khí ngọc bội của ngươi đánh thức!', 'Tiêu diệt nó trước khi nó tràn vào thôn. Nên rủ thêm đồng đội.'],
  progress: 'Yêu Vương ở cuối Rừng Thanh Trúc.', complete: ['Ngươi đã cứu cả thôn! Nhưng nơi này quá nhỏ cho ngươi rồi.'],
  obj: [['kill', 'boss_bamboo_king', 1, 'Đánh bại Thanh Trúc Yêu Vương']], rw: { exp: 900, tuvi: 500, gold: 600, items: [{ item: 'pill_bt_2', qty: 1 }, { item: 'set_thanh_truc_armor', qty: 1 }] } });
q('mq_1_08', { chapter: 1, name: 'Lên Đường', giver: 'npc_village_chief', turnIn: 'npc_city_lord', prereq: ['mq_1_07'], reqRealm: 1,
  offer: ['Cầm thư này đến Thanh Vân Thành, giao cho Thành Chủ Mộ Dung Thanh — cố nhân của ta.', 'Đường qua Hắc Phong Sơn, coi chừng sơn tặc.'],
  progress: 'Mang thư đến Thành Chủ Thanh Vân.', complete: ['Thư của Lý huynh... Ta hiểu rồi. Thanh Vân Thành sẽ là nơi ngươi dừng chân.'],
  obj: [['deliver', 'npc_city_lord', 1, 'Giao thư cho Thành Chủ Thanh Vân', { map: 'thanh_van_thanh' }]], rw: { exp: 1200, tuvi: 600, gold: 800, items: [{ item: 'tal_return', qty: 5 }] } });

// ======================= CHƯƠNG 2 — HẮC PHONG SƠN =======================
q('mq_2_01', { chapter: 2, name: 'Thành Chủ Nhờ Cậy', giver: 'npc_city_lord', turnIn: 'npc_scout', prereq: ['mq_1_08'], reqRealm: 1,
  offer: ['Hắc Phong Trại cướp bóc thương đội ngày càng ngang ngược.', 'Trinh sát Triệu Ảnh đang ở chân Hắc Phong Sơn. Đến gặp nàng.'],
  progress: 'Tìm Triệu Ảnh ở Hắc Phong Sơn.', complete: ['Thành chủ cử ngươi tới? Tốt, ta đang thiếu người.'],
  obj: [['talk', 'npc_scout', 1, 'Gặp trinh sát Triệu Ảnh']], rw: { exp: 900, tuvi: 500, gold: 300 } });
q('mq_2_02', { chapter: 2, name: 'Cáo Thị Rách', giver: 'npc_scout', prereq: ['mq_2_01'],
  offer: ['Bọn sơn tặc dán cáo thị đe dọa trên đường núi. Xem nội dung, rồi dạy chúng một bài học.'],
  progress: 'Đọc cáo thị và đánh bại sơn tặc.', complete: ['Chúng định tấn công thương đội của Tiền Phú Quý! Hắn đã bị bắt rồi.'],
  obj: [['interact', 'int_bandit_notice', 1, 'Đọc bảng cáo thị'], ['kill', 'bandit_thug', 8, 'Đánh bại Sơn Tặc Lâu La']], rw: { exp: 1500, tuvi: 800, gold: 500, items: [{ item: 'eq_helmet_1', qty: 1 }] } });
q('mq_2_03', { chapter: 2, name: 'Giải Cứu Thương Nhân', category: 'rescue', giver: 'npc_scout', turnIn: 'npc_scout', prereq: ['mq_2_02'],
  offer: ['Tiền Phú Quý bị giam sâu trong núi, có cung thủ canh gác.', 'Diệt cung thủ rồi hộ tống ông ta ra chân núi. Đừng để ông ta chết!'],
  progress: 'Giải cứu và hộ tống Tiền Phú Quý về chỗ Triệu Ảnh.', complete: [['npc_captive_merchant', 'Đa tạ ân nhân! Tiền mỗ không quên ơn này.'], 'Làm tốt lắm. Giờ đến lượt Trại Chủ.'],
  obj: [['kill', 'bandit_archer', 6, 'Diệt Sơn Tặc Cung Thủ'], ['escort', 'npc_captive_merchant', 1, 'Hộ tống Tiền Phú Quý ra chân núi', { map: 'hac_phong_son', x: 12 * 32 }]], rw: { exp: 2200, tuvi: 1100, gold: 1500, items: [{ item: 'pill_hp_2', qty: 10 }] } });
q('mq_2_04', { chapter: 2, name: 'Hắc Phong Trại Chủ', giver: 'npc_scout', turnIn: 'npc_city_lord', prereq: ['mq_2_03'],
  offer: ['Trại chủ ở đỉnh núi. Hắn giữ bản đồ sơn trại — lấy về cho Thành Chủ.'],
  progress: 'Đánh bại Hắc Phong Trại Chủ, lấy Bản Đồ Sơn Trại.', complete: ['Bản đồ này... đánh dấu một hang động khác — Hắc Phong Trại còn có sào huyệt bí mật!'],
  obj: [['kill', 'boss_black_wind', 1, 'Đánh bại Hắc Phong Trại Chủ'], ['collect', 'qi_bandit_map', 1, 'Lấy Bản Đồ Sơn Trại']], rw: { exp: 3500, tuvi: 1800, gold: 2500, items: [{ item: 'pill_bt_3', qty: 1 }, { item: 'set_hac_phong_armor', qty: 1 }] } });
q('mq_2_05', { chapter: 2, name: 'Võ Đạo Học Viện', giver: 'npc_city_lord', turnIn: 'npc_academy_dean', prereq: ['mq_2_04'], reqRealm: 2,
  offer: ['Tài năng như ngươi nên vào Võ Đạo Học Viện. Ta đã viết thư tiến cử.'],
  progress: 'Đến Võ Đạo Học Viện gặp Viện Trưởng.', complete: ['Thư tiến cử của Mộ Dung Thành Chủ? Muốn nhập học phải qua khảo hạch.'],
  obj: [['talk', 'npc_academy_dean', 1, 'Gặp Viện Trưởng Tư Mã Huyền']], rw: { exp: 2000, tuvi: 1000, gold: 500 } });
q('mq_2_06', { chapter: 2, name: 'Khảo Hạch Nhập Học', giver: 'npc_academy_dean', prereq: ['mq_2_05'],
  offer: ['Khảo hạch: đánh bại 8 Thạch Khôi Lỗi và bắt Phản Đồ Học Viện đang trốn ở sân sau.'],
  progress: 'Hoàn thành khảo hạch.', complete: ['Đạt! Ngươi là học viên Võ Đạo Học Viện. Đến gặp Giáo Đầu Lôi Chấn để học công pháp trung cấp.'],
  obj: [['kill', 'stone_golem_small', 8, 'Đánh bại Thạch Khôi Lỗi'], ['kill', 'academy_rogue', 1, 'Bắt Phản Đồ Học Viện']], rw: { exp: 5000, tuvi: 2600, gold: 3000, items: [{ item: 'manual_the_1', qty: 1 }, { item: 'pill_bt_4', qty: 1 }] } });

// ======================= CHƯƠNG 3 — CỔ KIẾM & TÔNG MÔN =======================
q('mq_3_01', { chapter: 3, name: 'Lời Mời Từ Sơn Trang', giver: 'npc_academy_dean', turnIn: 'npc_sword_villa_master', prereq: ['mq_2_06'], reqRealm: 3,
  offer: ['Âu Dương Trang Chủ của Cổ Kiếm Sơn Trang cầu cứu. Kiếm linh nổi loạn chiếm sơn trang.'],
  progress: 'Đến Cổ Kiếm Sơn Trang.', complete: ['Ngươi đến thật đúng lúc. Ngọc bội trên người ngươi... sao lại cộng hưởng với kiếm khí?'],
  obj: [['talk', 'npc_sword_villa_master', 1, 'Gặp Trang Chủ Âu Dương Kiếm']], rw: { exp: 6000, tuvi: 3000, gold: 1500 } });
q('mq_3_02', { chapter: 3, name: 'Cổ Kiếm Chi Hồn', giver: 'npc_sword_villa_master', prereq: ['mq_3_01'],
  offer: ['Lò đúc kiếm cổ là nơi kiếm hồn ngự. Kiểm tra lò, rồi đánh bại Cổ Kiếm Chi Hồn, mang mảnh kiếm về.'],
  progress: 'Điều tra lò đúc và đánh bại Cổ Kiếm Chi Hồn.', complete: ['Mảnh kiếm này khắc chữ "Thái Sơ" — giống hệt hoa văn trên ngọc bội của ngươi!', 'Có lẽ chúng đến từ cùng một vị tiên nhân thượng cổ.'],
  obj: [['interact', 'int_sword_forge', 1, 'Kiểm tra Lò Đúc Kiếm Cổ'], ['kill', 'boss_ancient_sword', 1, 'Đánh bại Cổ Kiếm Chi Hồn'], ['collect', 'qi_sword_fragment', 1, 'Lấy Mảnh Cổ Kiếm']], rw: { exp: 12000, tuvi: 6000, gold: 5000, items: [{ item: 'eq_weapon_3', qty: 1 }, { item: 'pill_bt_5', qty: 1 }] } });
q('mq_3_03', { chapter: 3, name: 'Dãy Núi Yêu Thú', giver: 'npc_sword_villa_master', turnIn: 'npc_beast_tamer', prereq: ['mq_3_02'], reqRealm: 4,
  offer: ['Thiên Kiếm Tông có thể giải mã chữ Thái Sơ. Đường đến đó qua Yêu Thú Sơn Mạch.', 'Mạc Hổ ở đó sẽ dẫn đường. Hổ dữ trên núi — cẩn thận.'],
  progress: 'Vượt Yêu Thú Sơn Mạch, gặp Mạc Hổ.', complete: ['Người của Âu Dương huynh? Ta có việc cần nhờ.'],
  obj: [['kill', 'tiger_stripe', 10, 'Đánh bại Ban Lan Hổ'], ['talk', 'npc_beast_tamer', 1, 'Gặp Mạc Hổ']], rw: { exp: 18000, tuvi: 9000, gold: 4000, items: [{ item: 'tal_capture_1', qty: 3 }] } });
q('mq_3_04', { chapter: 3, name: 'Cứu Đệ Tử Thiên Kiếm', category: 'rescue', giver: 'npc_beast_tamer', turnIn: 'npc_injured_disciple', prereq: ['mq_3_03'],
  offer: ['Một đệ tử Thiên Kiếm Tông bị Yêu Thú Vương đả thương sâu trong núi.', 'Hái 5 Huyết Sâm làm thuốc và tiêu diệt Bạch Ngạch Yêu Thú Vương.'],
  progress: 'Mang Huyết Sâm đến cho Tống Viễn, diệt Yêu Thú Vương.', complete: ['Ơn cứu mạng... Ta là Tống Viễn, đệ tử Thiên Kiếm Tông. Ta sẽ tiến cử ngươi bái nhập tông môn!'],
  obj: [['collect', 'herb_t2', 5, 'Hái Huyết Sâm'], ['kill', 'boss_beast_king', 1, 'Tiêu diệt Yêu Thú Vương Bạch Ngạch']], rw: { exp: 30000, tuvi: 15000, gold: 8000, items: [{ item: 'pill_bt_assist', qty: 2 }] } });
q('mq_3_05', { chapter: 3, name: 'Bái Nhập Thiên Kiếm Tông', giver: 'npc_injured_disciple', turnIn: 'npc_sect_master', prereq: ['mq_3_04'], reqRealm: 5,
  offer: ['Đi qua Vạn Dược Cốc là đến Thiên Kiếm Tông. Gặp Tông Chủ Kiếm Vô Trần.'],
  progress: 'Đến Thiên Kiếm Tông gặp Tông Chủ.', complete: ['Thái Sơ... Ngọc bội này là di vật của Thái Sơ Tiên Tôn — vị tiên nhân phi thăng cuối cùng của nhân giới.', 'Từ hôm nay ngươi là đệ tử Thiên Kiếm Tông.'],
  obj: [['reach', 'van_duoc_coc', 1, 'Đi qua Vạn Dược Cốc'], ['talk', 'npc_sect_master', 1, 'Bái kiến Tông Chủ Kiếm Vô Trần']], rw: { exp: 40000, tuvi: 20000, gold: 10000, items: [{ item: 'qi_sect_token', qty: 1 }, { item: 'pill_bt_6', qty: 1 }], title: 'Đệ Tử Thiên Kiếm' } });

// ======================= CHƯƠNG 4 — LINH CĂN THỨC TỈNH =======================
q('mq_4_01', { chapter: 4, name: 'Đệ Tử Ngoại Môn', giver: 'npc_sect_master', turnIn: 'npc_sect_elder', prereq: ['mq_3_05'], reqRealm: 6,
  offer: ['Đệ tử mới phải lập công. Phá 10 Thủ Sơn Khôi Lỗi luyện tập, rồi gặp Thanh Phong Trưởng Lão.'],
  progress: 'Phá khôi lỗi và gặp Trưởng Lão.', complete: ['Kiếm pháp có căn cơ. Ta sẽ truyền công cho ngươi khi ngươi có cống hiến.'],
  obj: [['kill', 'sect_puppet', 10, 'Phá Thủ Sơn Khôi Lỗi'], ['talk', 'npc_sect_elder', 1, 'Gặp Thanh Phong Trưởng Lão']], rw: { exp: 60000, tuvi: 30000, gold: 12000, spirit_stones: 10 } });
q('mq_4_02', { chapter: 4, name: 'Độc Hậu Vạn Dược', giver: 'npc_sect_elder', turnIn: 'npc_valley_master', prereq: ['mq_4_01'],
  offer: ['Vạn Độc Tri Chu Hậu đầu độc Vạn Dược Cốc, cắt nguồn dược liệu của tông môn.', 'Diệt nó và mang Giải Độc Đan đến cho dân làng trúng độc.'],
  progress: 'Diệt Tri Chu Hậu, cứu dân làng.', complete: ['Vạn Dược Cốc nợ ngươi một ân tình. Đan dược của cốc luôn sẵn cho ngươi.'],
  obj: [['kill', 'boss_poison_queen', 1, 'Tiêu diệt Vạn Độc Tri Chu Hậu'], ['deliver', 'npc_poisoned_villager', 1, 'Mang Giải Độc Đan cho Lưu Nhị'], ['collect', 'pill_cleanse', 1, 'Chuẩn bị Giải Độc Đan']], rw: { exp: 90000, tuvi: 45000, gold: 15000, items: [{ item: 'pill_bt_7', qty: 1 }, { item: 'tool_furnace_2', qty: 1 }] } });
q('mq_4_03', { chapter: 4, name: 'U Minh Đăng', giver: 'npc_sect_master', turnIn: 'npc_ghost_hunter', prereq: ['mq_4_02'], reqRealm: 7,
  offer: ['Chữ Thái Sơ chỉ tới U Minh Động. Tương truyền Thái Sơ Tiên Tôn để lại U Minh Đăng soi đường linh căn.', 'U Minh Quỷ Vương canh giữ nó.'],
  progress: 'Điều tra tế đàn và lấy U Minh Đăng.', complete: ['U Minh Đăng! Đèn này soi được linh căn ẩn giấu... Ngươi phải đến Cổ Chiến Trường.'],
  obj: [['interact', 'int_ghost_altar', 1, 'Điều tra Tế Đàn U Minh'], ['kill', 'boss_ghost_king', 1, 'Đánh bại U Minh Quỷ Vương'], ['collect', 'qi_ghost_lantern', 1, 'Lấy U Minh Đăng']], rw: { exp: 150000, tuvi: 80000, gold: 25000, items: [{ item: 'pill_bt_8', qty: 1 }] } });
q('mq_4_04', { chapter: 4, name: 'Lão Binh Cổ Chiến Trường', giver: 'npc_ghost_hunter', turnIn: 'npc_war_veteran', prereq: ['mq_4_03'], reqRealm: 8,
  offer: ['Ở Cổ Chiến Trường có một lão binh canh giữ ký ức trận chiến thượng cổ. Hãy tìm ông ta. Coi chừng — nơi đó PK tự do.'],
  progress: 'Tìm Lão Binh Tần.', complete: ['Ngọn đèn đó... Thái Sơ Tiên Tôn từng chiến đấu ở đây chống lại ma đạo.'],
  obj: [['talk', 'npc_war_veteran', 1, 'Gặp Lão Binh Tần']], rw: { exp: 100000, tuvi: 50000, gold: 10000 } });
q('mq_4_05', { chapter: 4, name: 'Chiến Kỳ Cổ', giver: 'npc_war_veteran', prereq: ['mq_4_04'],
  offer: ['Chiến kỳ của Tiên Tôn còn cắm giữa chiến trường, bị chiến hồn vây quanh. Giải phóng nó.'],
  progress: 'Giải phóng chiến kỳ.', complete: ['Chiến kỳ rung động khi gặp U Minh Đăng... Linh căn trong ngươi đang thức tỉnh!'],
  obj: [['interact', 'int_war_banner', 1, 'Chạm vào Chiến Kỳ Cổ'], ['kill', 'war_ghost', 15, 'Siêu độ Chiến Hồn'], ['kill', 'war_beast', 3, 'Đánh bại Chiến Thú Cổ']], rw: { exp: 250000, tuvi: 140000, gold: 30000, items: [{ item: 'qi_war_banner', qty: 1 }, { item: 'pill_bt_9', qty: 1 }] } });
q('mq_4_06', { chapter: 4, name: 'Thức Tỉnh Linh Căn', giver: 'npc_war_veteran', turnIn: 'npc_sect_master', prereq: ['mq_4_05'], reqRealm: 9,
  offer: ['Khi ngươi đạt đỉnh võ đạo — Võ Đạo Đại Đế — hãy trở về tông môn. Tông Chủ sẽ dùng U Minh Đăng thức tỉnh linh căn cho ngươi.'],
  progress: 'Đạt cảnh giới Võ Đạo Đại Đế rồi trở về Thiên Kiếm Tông.', complete: ['Linh căn Thái Sơ! Thiên địa linh khí đang tụ về ngươi.', 'Con đường tu chân đã mở. Thủ Giới Sứ sẽ đưa ngươi đến Linh Vân Châu khi ngươi đột phá Luyện Khí.'],
  obj: [['realm', '9', 1, 'Đạt cảnh giới Võ Đạo Đại Đế'], ['talk', 'npc_sect_master', 1, 'Trở về gặp Tông Chủ']], rw: { exp: 400000, tuvi: 200000, gold: 50000, spirit_stones: 50, items: [{ item: 'qi_spirit_root_stone', qty: 1 }, { item: 'pill_bt_10', qty: 1 }], title: 'Linh Căn Thái Sơ' } });

// ======================= CHƯƠNG 5 — TU CHÂN GIỚI =======================
q('mq_5_01', { chapter: 5, name: 'Bước Vào Tu Chân', giver: 'npc_sect_gate', turnIn: 'npc_immortal_guide', prereq: ['mq_4_06'], reqRealm: 10,
  offer: ['Ngươi đã là tu sĩ Luyện Khí. Qua cổng giới này là Linh Vân Châu của Tu Chân Giới.'],
  progress: 'Đến Linh Vân Châu.', complete: ['Tiểu hữu từ nhân giới lên? Hiếm thấy, hiếm thấy.'],
  obj: [['reach', 'linh_van_chau', 1, 'Đặt chân đến Linh Vân Châu'], ['talk', 'npc_immortal_guide', 1, 'Gặp Vân Du Tử']], rw: { exp: 600000, tuvi: 300000, gold: 60000, spirit_stones: 30 } });
q('mq_5_02', { chapter: 5, name: 'Thiên Huyền Thành', giver: 'npc_immortal_guide', turnIn: 'npc_th_city_lord', prereq: ['mq_5_01'],
  offer: ['Vân thú quanh đây hung hãn với người lạ. Chứng tỏ thực lực rồi đến Thiên Huyền Thành.'],
  progress: 'Diệt Vân Thú, đến Thiên Huyền Thành.', complete: ['Truyền nhân Thái Sơ? Ma đạo đang tìm kiếm di vật của Tiên Tôn... ngươi gặp nguy rồi.'],
  obj: [['kill', 'cloud_beast', 12, 'Đánh bại Vân Thú'], ['talk', 'npc_th_city_lord', 1, 'Gặp Huyền Cơ Chân Nhân']], rw: { exp: 900000, tuvi: 450000, gold: 80000, spirit_stones: 40, items: [{ item: 'pill_bt_11', qty: 1 }] } });
q('mq_5_03', { chapter: 5, name: 'Lôi Ấn', giver: 'npc_th_city_lord', turnIn: 'npc_tribulation_elder', prereq: ['mq_5_02'], reqRealm: 12,
  offer: ['Muốn chống ma đạo ngươi phải mạnh lên. Lôi Bằng Vương ở Lôi Kiếp Đài giữ Lôi Ấn — tín vật thiên kiếp.'],
  progress: 'Đoạt Lôi Ấn từ Lôi Bằng Vương.', complete: ['Có Lôi Ấn, thiên kiếp sẽ nhận ra ngươi. Lão phu sẽ hộ pháp cho những lần độ kiếp sau.'],
  obj: [['kill', 'boss_thunder_roc', 1, 'Đánh bại Lôi Bằng Vương'], ['collect', 'qi_thunder_seal', 1, 'Lấy Lôi Ấn']], rw: { exp: 2e6, tuvi: 1e6, gold: 150000, spirit_stones: 80, items: [{ item: 'pill_bt_13', qty: 1 }] } });
q('mq_5_04', { chapter: 5, name: 'Bia Đá Thượng Cổ', giver: 'npc_tribulation_elder', turnIn: 'npc_ancient_spirit', prereq: ['mq_5_03'], reqRealm: 13,
  offer: ['Trong Thượng Cổ Bí Cảnh có bia đá ghi chép về Thái Sơ Tiên Tôn. Đi xem.'],
  progress: 'Đọc bia đá và gặp Cổ Linh.', complete: ['Truyền nhân... cuối cùng cũng đến. Tiên Tôn không phi thăng — người bị ma đạo phong ấn!'],
  obj: [['interact', 'int_ancient_tablet', 1, 'Đọc Bia Đá Thượng Cổ'], ['talk', 'npc_ancient_spirit', 1, 'Gặp Cổ Linh']], rw: { exp: 3e6, tuvi: 1.5e6, gold: 200000, spirit_stones: 80 } });
q('mq_5_05', { chapter: 5, name: 'Truyền Thừa Thao Thiết', category: 'secret_realm', giver: 'npc_ancient_spirit', prereq: ['mq_5_04'],
  offer: ['Thượng Cổ Thao Thiết đã nuốt quyển trục truyền thừa. Vào bí cảnh sâu nhất (phó bản) và đoạt lại.'],
  progress: 'Hoàn thành phó bản Thao Thiết Bí Cảnh.', complete: ['Quyển trục ghi: "Phong ấn Tiên Tôn nằm tại Ma Vực, giữ bởi Huyết Quân".'],
  obj: [['dungeon', 'dg_thao_thiet', 1, 'Hoàn thành Thao Thiết Bí Cảnh'], ['collect', 'qi_ancient_scroll', 1, 'Lấy Thượng Cổ Quyển Trục']], rw: { exp: 5e6, tuvi: 2.5e6, gold: 300000, spirit_stones: 120, items: [{ item: 'pill_bt_14', qty: 1 }] } });
q('mq_5_06', { chapter: 5, name: 'Ma Vực Huyết Quân', giver: 'npc_ancient_spirit', turnIn: 'npc_demon_defector', prereq: ['mq_5_05'], reqRealm: 15,
  offer: ['Vào Ma Vực. Có một ma tu muốn quay đầu tên Mặc Uyên — nàng biết đường đến chỗ Huyết Quân.'],
  progress: 'Gặp Mặc Uyên, đánh bại Huyết Quân, lấy Phong Ma Ấn.', complete: ['Phong Ma Ấn đã vỡ... Tiên Tôn được giải thoát một phần. Nhưng người nói: "Ta chờ ngươi ở Tiên Giới".'],
  obj: [['talk', 'npc_demon_defector', 1, 'Gặp Mặc Uyên'], ['kill', 'boss_demon_lord', 1, 'Đánh bại Ma Vực Huyết Quân'], ['collect', 'qi_demon_seal', 1, 'Lấy Phong Ma Ấn']], rw: { exp: 1e7, tuvi: 5e6, gold: 600000, spirit_stones: 200, items: [{ item: 'pill_bt_16', qty: 1 }], title: 'Phá Ma Giả' } });

// ======================= CHƯƠNG 6 — ĐỘ KIẾP PHI THĂNG =======================
q('mq_6_01', { chapter: 6, name: 'Thiên Ngoại Tà Ma', giver: 'npc_demon_defector', turnIn: 'npc_frontline_commander', prereq: ['mq_5_06'], reqRealm: 17,
  offer: ['Ma đạo bị đánh bại nhưng hư không bên ngoài đang nứt vỡ. Thiết Huyết Tướng Quân cần viện binh.'],
  progress: 'Diệt Hư Không Hành Giả và gặp Tướng Quân.', complete: ['Ngươi chiến đấu khá lắm. Kẻ đứng sau là Thiên Ngoại Cự Thần.'],
  obj: [['kill', 'void_walker', 20, 'Diệt Hư Không Hành Giả'], ['talk', 'npc_frontline_commander', 1, 'Gặp Thiết Huyết Tướng Quân']], rw: { exp: 2e7, tuvi: 1e7, gold: 1e6, spirit_stones: 300 } });
q('mq_6_02', { chapter: 6, name: 'Thiên Ngoại Cự Thần', giver: 'npc_frontline_commander', prereq: ['mq_6_01'],
  offer: ['Cự Thần là Boss thế giới — tập hợp tu sĩ khắp nơi cùng đánh!'],
  progress: 'Đánh bại Thiên Ngoại Cự Thần.', complete: ['Phòng tuyến giữ vững! Danh tiếng ngươi vang khắp Tu Chân Giới.'],
  obj: [['kill', 'world_boss_void_titan', 1, 'Tham gia tiêu diệt Thiên Ngoại Cự Thần']], rw: { exp: 4e7, tuvi: 2e7, gold: 2e6, spirit_stones: 500, items: [{ item: 'pill_bt_18', qty: 1 }] } });
q('mq_6_03', { chapter: 6, name: 'Chuẩn Bị Độ Kiếp', giver: 'npc_frontline_commander', turnIn: 'npc_tribulation_elder', prereq: ['mq_6_02'], reqRealm: 18,
  offer: ['Ngươi đã ở cảnh giới Độ Kiếp. Về Lôi Kiếp Đài tìm Độ Ách Lão Tổ, mang theo Long Diên Thảo.'],
  progress: 'Mang 10 Long Diên Thảo cho Độ Ách Lão Tổ.', complete: ['Tốt. Cửu trùng thiên kiếp không phải trò đùa.'],
  obj: [['collect', 'herb_t5', 10, 'Thu thập Long Diên Thảo']], rw: { exp: 3e7, tuvi: 1.5e7, gold: 1e6, spirit_stones: 300 } });
q('mq_6_04', { chapter: 6, name: 'Hộ Kiếp', giver: 'npc_tribulation_elder', prereq: ['mq_6_03'],
  offer: ['Lôi khôi và Lôi Bằng làm nhiễu loạn lôi trì. Dọn sạch chúng để thiên kiếp không mất kiểm soát.'],
  progress: 'Dọn dẹp Lôi Kiếp Đài.', complete: ['Lôi trì đã tĩnh. Giờ chỉ còn thiếu Phi Thăng Lệnh.'],
  obj: [['kill', 'thunder_golem', 10, 'Phá Lôi Khôi'], ['kill', 'boss_thunder_roc', 1, 'Đánh bại Lôi Bằng Vương']], rw: { exp: 4e7, tuvi: 2e7, gold: 1.5e6, spirit_stones: 400 } });
q('mq_6_05', { chapter: 6, name: 'Phi Thăng Lệnh', giver: 'npc_tribulation_elder', turnIn: 'npc_th_city_lord', prereq: ['mq_6_04'],
  offer: ['Huyền Cơ Chân Nhân giữ Phi Thăng Lệnh của Tu Chân Giới. Đến xin người.'],
  progress: 'Gặp Huyền Cơ Chân Nhân.', complete: ['Phi Thăng Lệnh đây. Khi ngươi vượt cửu trùng thiên kiếp, cổng tiên sẽ mở.'],
  obj: [['talk', 'npc_th_city_lord', 1, 'Xin Phi Thăng Lệnh']], rw: { exp: 2e7, tuvi: 1e7, gold: 1e6, items: [{ item: 'qi_ascension_key', qty: 1 }] } });
q('mq_6_06', { chapter: 6, name: 'Phi Thăng', giver: 'npc_th_city_lord', turnIn: 'npc_th_teleporter', prereq: ['mq_6_05'], reqRealm: 18,
  offer: ['Hãy chuẩn bị đầy đủ rồi đến Truyền Tống Trận Sư. Khi ngươi đột phá thành Nhân Tiên, trận pháp sẽ đưa ngươi tới Phi Thăng Đài.'],
  progress: 'Báo danh phi thăng với Truyền Tống Trận Sư.', complete: ['Danh tính đã ghi vào Phi Thăng Bảng. Vượt qua thiên kiếp, cổng tiên giới sẽ mở cho ngươi!'],
  obj: [['realm', '18', 1, 'Ở cảnh giới Độ Kiếp'], ['talk', 'npc_th_teleporter', 1, 'Báo danh phi thăng']], rw: { exp: 5e7, tuvi: 2e7, gold: 3e6, spirit_stones: 800, items: [{ item: 'pill_bt_19', qty: 1 }], title: 'Độ Kiếp Giả' } });

// ======================= CHƯƠNG 7 — TIÊN GIỚI =======================
q('mq_7_01', { chapter: 7, name: 'Tân Tiên Nhân', giver: 'npc_ascension_envoy', turnIn: 'npc_ct_city_lord', prereq: ['mq_6_06'], reqRealm: 19,
  offer: ['Chúc mừng phi thăng! Mời đến Cửu Thiên Tiên Thành đăng ký tiên tịch.'],
  progress: 'Đến Cửu Thiên Tiên Thành.', complete: ['Truyền nhân Thái Sơ... Thái Sơ Tiên Tôn từng là thành chủ nơi này, trước khi bị Thiên Đế phản bội.'],
  obj: [['reach', 'cuu_thien_tien_thanh', 1, 'Đến Cửu Thiên Tiên Thành'], ['talk', 'npc_ct_city_lord', 1, 'Gặp Cửu Thiên Huyền Nữ']], rw: { exp: 2e8, tuvi: 1e8, gold: 1e7, spirit_stones: 1000, title: 'Tiên Nhân' } });
q('mq_7_02', { chapter: 7, name: 'Vạn Tiên Sơn', giver: 'npc_ct_city_lord', turnIn: 'npc_immortal_hermit', prereq: ['mq_7_01'], reqRealm: 21,
  offer: ['Ẩn Tiên ở Vạn Tiên Sơn là bạn cũ của Tiên Tôn. Tinh Linh quấy nhiễu đường lên núi.'],
  progress: 'Lên Vạn Tiên Sơn gặp Ẩn Tiên.', complete: ['Ngọc bội Thái Sơ... Lão hủ đợi ngày này đã ba vạn năm.'],
  obj: [['kill', 'star_spirit', 15, 'Đánh tan Tinh Linh'], ['talk', 'npc_immortal_hermit', 1, 'Gặp Ẩn Tiên']], rw: { exp: 5e8, tuvi: 2.5e8, gold: 2e7, spirit_stones: 2000 } });
q('mq_7_03', { chapter: 7, name: 'Đọa Tiên Uyên', category: 'secret_realm', giver: 'npc_immortal_hermit', prereq: ['mq_7_02'],
  offer: ['Một đồng môn của Tiên Tôn đã đọa lạc. Vào Đọa Tiên Uyên giải thoát hắn.'],
  progress: 'Hoàn thành phó bản Đọa Tiên Uyên.', complete: ['Trước khi tan biến, Đọa Tiên nói: "Thiên Đế... dùng Tiên Chiếu giả để phong ấn Tiên Tôn".'],
  obj: [['dungeon', 'dg_doa_tien', 1, 'Hoàn thành Đọa Tiên Uyên']], rw: { exp: 1e9, tuvi: 5e8, gold: 4e7, spirit_stones: 3000, items: [{ item: 'pill_bt_23', qty: 1 }] } });
q('mq_7_04', { chapter: 7, name: 'Thiên Đế Cung', giver: 'npc_immortal_hermit', turnIn: 'npc_heaven_herald', prereq: ['mq_7_03'], reqRealm: 25,
  offer: ['Tiên Chiếu thật nằm trong Thiên Đế Cung, Kim Giáp Ngự Tiền canh giữ.'],
  progress: 'Đoạt Tiên Chiếu từ Kim Giáp Ngự Tiền.', complete: ['Ngươi... ngươi dám! Nhưng Tiên Chiếu này là thật — Thiên Đế đã lừa dối tiên giới!', 'Ta sẽ không ngăn ngươi. Hãy đến Hỗn Độn Hải, nơi Tiên Tôn bị đày.'],
  obj: [['talk', 'npc_heaven_herald', 1, 'Đối chất Truyền Lệnh Tiên Quan'], ['kill', 'boss_heaven_emperor_guard', 1, 'Đánh bại Kim Giáp Ngự Tiền'], ['collect', 'qi_immortal_edict', 1, 'Lấy Tiên Chiếu']], rw: { exp: 3e9, tuvi: 1.5e9, gold: 1e8, spirit_stones: 6000, items: [{ item: 'pill_bt_26', qty: 1 }] } });
q('mq_7_05', { chapter: 7, name: 'Bên Kia Hỗn Độn', giver: 'npc_heaven_herald', turnIn: 'npc_chaos_ferryman', prereq: ['mq_7_04'], reqRealm: 28,
  offer: ['Người chèo đò Hỗn Độn Hải sẽ chở ngươi — nếu ngươi sống sót qua Hỗn Độn Thú.'],
  progress: 'Đánh bại Hỗn Độn Thú, gặp Người Chèo Đò.', complete: ['Ta chở được ngươi tới chỗ Cổ Long. Tiên Tôn bị giam trong tim nó.'],
  obj: [['kill', 'chaos_beast', 8, 'Đánh bại Hỗn Độn Thú'], ['talk', 'npc_chaos_ferryman', 1, 'Gặp Độ Hải Nhân']], rw: { exp: 6e9, tuvi: 3e9, gold: 2e8, spirit_stones: 10000 } });
q('mq_7_06', { chapter: 7, name: 'Hỗn Độn Chi Tâm', giver: 'npc_chaos_ferryman', prereq: ['mq_7_05'],
  offer: ['Hỗn Độn Cổ Long — Boss thế giới mạnh nhất. Đánh bại nó, giải thoát Tiên Tôn, và con đường vượt Tiên Đế sẽ mở ra.'],
  progress: 'Đánh bại Hỗn Độn Cổ Long, lấy Hỗn Độn Chi Tâm.', complete: [['Thái Sơ Tiên Tôn', 'Đa tạ, truyền nhân. Phía trên tiên giới còn vô tận hỗn độn — con đường của ngươi mới chỉ bắt đầu.']],
  obj: [['kill', 'world_boss_chaos_dragon', 1, 'Đánh bại Hỗn Độn Cổ Long'], ['collect', 'qi_chaos_heart', 1, 'Lấy Hỗn Độn Chi Tâm']], rw: { exp: 2e10, tuvi: 1e10, gold: 1e9, spirit_stones: 50000, items: [{ item: 'pill_bt_29', qty: 1 }], title: 'Truyền Nhân Thái Sơ' } });

// ======================= NHIỆM VỤ PHỤ =======================
q('sq_hunt_wolves', { kind: 'side', category: 'hunt', name: 'Săn Sói Đen', giver: 'npc_hunter', prereq: ['mq_1_06'],
  offer: ['Bầy sói đen tha mất gà của dân. Săn 10 con và mang 5 nanh sói về.'], progress: 'Săn sói và lấy nanh.', complete: ['Nanh sói này làm mũi tên tốt lắm!'],
  obj: [['kill', 'wolf_black', 10, 'Săn Hắc Phong Lang'], ['collect', 'mat_wolf_fang', 5, 'Thu thập Nanh Sói Đen']], rw: { exp: 700, tuvi: 350, gold: 400, items: [{ item: 'eq_boots_0', qty: 1 }] } });
q('sq_lost_child', { kind: 'side', category: 'escort', name: 'Đứa Trẻ Lạc Đường', giver: 'npc_lost_child', turnIn: 'npc_hunter', prereq: ['mq_1_05'],
  offer: ['Hu hu... con đi hái nấm rồi lạc... ca ca/tỷ tỷ đưa con về chỗ chú A Tứ được không?'], progress: 'Hộ tống Tiểu Bảo về chỗ A Tứ đầu rừng.', complete: ['Tiểu Bảo! May quá. Đa tạ, ngươi tốt bụng thật.'],
  obj: [['escort', 'npc_lost_child', 1, 'Hộ tống Tiểu Bảo về đầu rừng', { map: 'rung_thanh_truc', x: 12 * 32 }]], rw: { exp: 900, tuvi: 450, gold: 300, items: [{ item: 'pet_food_1', qty: 10 }] } });
q('sq_herb_collect', { kind: 'side', category: 'gather', name: 'Kho Thuốc Của Thôn', giver: 'npc_herbalist_girl', prereq: ['mq_1_03'],
  offer: ['Kho thuốc sắp cạn rồi. Huynh/tỷ giúp muội 10 Thanh Linh Thảo và 2 con cá chép bạc nhé.'], progress: 'Thu thập thảo dược và cá.', complete: ['Đủ rồi! Muội dạy huynh/tỷ công thức luyện Hồi Xuân Đan.'],
  obj: [['collect', 'herb_t1', 10, 'Hái Thanh Linh Thảo'], ['collect', 'fish_t1', 2, 'Câu Cá Chép Bạc']], rw: { exp: 800, tuvi: 400, gold: 300, items: [{ item: 'tool_furnace_1', qty: 1 }, { item: 'tool_rod_1', qty: 1 }] } });
q('sq_hac_phong_supplies', { kind: 'side', category: 'investigate', name: 'Lương Thảo Sơn Tặc', giver: 'npc_scout', prereq: ['mq_2_01'],
  offer: ['Sơn tặc giấu lương thực đâu đó giữa núi. Tìm thùng lương và thu huy hiệu để chứng minh.'], progress: 'Tìm thùng lương và thu huy hiệu.', complete: ['Không có lương thực, chúng sẽ yếu đi nhiều.'],
  obj: [['interact', 'int_supply_crate', 1, 'Tìm Thùng Lương Thực'], ['collect', 'mat_bandit_badge', 10, 'Thu Huy Hiệu Sơn Tặc']], rw: { exp: 2400, tuvi: 1200, gold: 1500, items: [{ item: 'stone_enhance', qty: 5 }] } });
q('sq_city_investigation', { kind: 'side', category: 'investigate', name: 'Kẻ Trộm Chợ Đêm', giver: 'npc_market', prereq: ['mq_1_08'], reqRealm: 1,
  offer: ['Có kẻ trộm hàng ở chợ mỗi đêm. Xem bảng truy nã, lần theo dấu vết trong hẻm tối.', 'Ta nghi là đầu mục sơn tặc trà trộn vào thành.'], progress: 'Điều tra và bắt kẻ trộm.', complete: ['Quả nhiên là người của Hắc Phong Trại! Chợ được yên ổn rồi.'],
  obj: [['interact', 'int_wanted_poster', 1, 'Xem bảng truy nã'], ['interact', 'int_alley_clue', 1, 'Lục soát hẻm tối'], ['kill', 'bandit_captain', 1, 'Bắt Sơn Tặc Đầu Mục ở Hắc Phong Sơn']], rw: { exp: 3500, tuvi: 1700, gold: 3000, items: [{ item: 'eq_ring_1', qty: 1 }] } });
q('sq_academy_book', { kind: 'side', category: 'lost_item', name: 'Sách Cấm Thất Lạc', giver: 'npc_academy_librarian', prereq: ['mq_2_05'],
  offer: ['Một quyển sách cấm bị đặt nhầm chỗ. Tìm trên giá sách cấm giúp lão.'], progress: 'Tìm sách trên giá sách cấm.', complete: ['Đúng nó! Cuốn này ghi chép Thể Tu cổ pháp. Tặng ngươi một bản sao.'],
  obj: [['interact', 'int_library_shelf', 1, 'Lục tìm Giá Sách Cấm']], rw: { exp: 3000, tuvi: 1500, gold: 1000, items: [{ item: 'manual_the_2', qty: 1 }] } });
q('sq_rescue_villager', { kind: 'side', category: 'rescue', name: 'Cứu Người Trúng Độc', giver: 'npc_poisoned_villager', turnIn: 'npc_valley_master', prereq: ['mq_3_05'],
  offer: ['Độc Thiềm cắn ta... cần nọc của chúng làm thuốc giải... xin hãy giúp...'], progress: 'Diệt Độc Thiềm, lấy nọc rắn, mang đến Dược Vương.', complete: ['Có nọc độc này, ta luyện được thuốc giải. Ngươi đã cứu một mạng người.'],
  obj: [['kill', 'poison_toad', 8, 'Diệt Độc Thiềm'], ['collect', 'mat_snake_venom', 3, 'Thu Nọc Rắn Lục']], rw: { exp: 30000, tuvi: 15000, gold: 6000, items: [{ item: 'pill_cleanse', qty: 5 }] } });
q('sq_bandit_lair', { kind: 'side', category: 'secret_realm', name: 'Thâm Nhập Sơn Trại', giver: 'npc_scout', prereq: ['mq_2_04'], reqRealm: 2,
  offer: ['Bản đồ chỉ ra sào huyệt bí mật của Hắc Phong Trại. Vào phó bản Hắc Phong Trại tiêu diệt Lão Tổ của chúng.'], progress: 'Hoàn thành phó bản Hắc Phong Trại.', complete: ['Hắc Phong Trại từ nay xóa sổ!'],
  obj: [['dungeon', 'dg_hac_phong_trai', 1, 'Hoàn thành phó bản Hắc Phong Trại']], rw: { exp: 6000, tuvi: 3000, gold: 4000, items: [{ item: 'set_hac_phong_weapon', qty: 1 }] } });
q('sq_ghost_mother', { kind: 'side', category: 'secret_realm', name: 'Quỷ Mẫu Động', giver: 'npc_ghost_hunter', prereq: ['mq_4_03'], reqRealm: 7,
  offer: ['Dưới đáy U Minh Động còn Quỷ Mẫu sinh ra oán linh vô tận. Vào phó bản tiêu diệt.'], progress: 'Hoàn thành phó bản Quỷ Mẫu Động.', complete: ['Âm khí tan rồi. Ngươi là trừ quỷ sư giỏi nhất ta từng thấy.'],
  obj: [['dungeon', 'dg_quy_mau_dong', 1, 'Hoàn thành Quỷ Mẫu Động']], rw: { exp: 200000, tuvi: 100000, gold: 30000, items: [{ item: 'set_u_minh_boots', qty: 1 }] } });
q('sq_lost_ring', { kind: 'side', category: 'lost_item', name: 'Nhẫn Bạc Dưới Nước', giver: 'npc_fisherman', prereq: ['mq_1_08'],
  offer: ['Lão đánh rơi nhẫn cưới xuống nước. Câu cá đủ lâu, có khi câu được nó.'], progress: 'Câu được Nhẫn Bạc Thất Lạc.', complete: ['Nhẫn của bà nhà ta! Đa tạ, đa tạ!'],
  obj: [['collect', 'qi_lost_ring', 1, 'Tìm Nhẫn Bạc Thất Lạc (câu cá)']], rw: { exp: 2500, tuvi: 1200, gold: 2000, items: [{ item: 'tool_rod_2', qty: 1 }] } });
q('sq_first_pet', { kind: 'side', category: 'hunt', name: 'Linh Thú Đầu Tiên', giver: 'npc_pet_keeper', prereq: ['mq_1_08'],
  offer: ['Muốn có linh thú? Đánh Tiểu Linh Hồ còn dưới 30% sinh lực rồi dùng Thu Hồn Phù.', 'Tặng ngươi 3 lá phù.'], progress: 'Thu phục một linh thú.', complete: ['Linh thú của ngươi đáng yêu quá! Nhớ cho nó ăn thường xuyên.'],
  obj: [['capture', 'any', 1, 'Thu phục một linh thú']], rw: { exp: 2000, tuvi: 1000, gold: 1000, items: [{ item: 'pet_food_1', qty: 20 }, { item: 'pgear_collar_1', qty: 1 }] } });
// Nghề nghiệp
q('pq_alchemy', { kind: 'profession', category: 'profession', name: 'Nhập Môn Luyện Đan', giver: 'npc_alchemist_master', prereq: ['mq_1_08'],
  offer: ['Luyện đan cần Đan Lô trong túi. Luyện 2 mẻ Hồi Xuân Đan cho ta xem.'], progress: 'Luyện Hồi Xuân Đan.', complete: ['Hỏa hầu tạm được. Ngươi có thiên phú.'],
  obj: [['craft', 'rc_pill_hp_1', 2, 'Luyện Hồi Xuân Đan']], rw: { exp: 1500, tuvi: 700, gold: 800, items: [{ item: 'herb_t1', qty: 10 }, { item: 'fish_t1', qty: 5 }] } });
q('pq_forging', { kind: 'profession', category: 'profession', name: 'Nhập Môn Luyện Khí', giver: 'npc_forge_master', prereq: ['mq_1_08'],
  offer: ['Tinh luyện 3 Cường Hóa Thạch từ Thiết Tinh. Cần Búa Rèn trong túi.'], progress: 'Tinh luyện Cường Hóa Thạch.', complete: ['Khá lắm. Luyện khí cần kiên trì.'],
  obj: [['craft', 'rc_stone_enhance', 3, 'Tinh luyện Cường Hóa Thạch']], rw: { exp: 1500, tuvi: 700, gold: 800, items: [{ item: 'tool_hammer_1', qty: 1 }, { item: 'ore_t1', qty: 10 }] } });
q('pq_talisman', { kind: 'profession', category: 'profession', name: 'Nhập Môn Chế Phù', giver: 'npc_merchant_city', prereq: ['mq_1_08'],
  offer: ['Mua Phù Bút, Hoàng Phù Chỉ và Chu Sa ở chỗ ta, rồi vẽ Hồi Thành Phù.'], progress: 'Vẽ Hồi Thành Phù.', complete: ['Nét bút vững vàng!'],
  obj: [['craft', 'rc_tal_return', 1, 'Vẽ Hồi Thành Phù']], rw: { exp: 1200, tuvi: 600, gold: 600, items: [{ item: 'mat_paper', qty: 10 }, { item: 'mat_cinnabar', qty: 10 }] } });
q('pq_mining', { kind: 'profession', category: 'profession', name: 'Nhập Môn Khai Khoáng', giver: 'npc_blacksmith_village', prereq: ['mq_1_04'],
  offer: ['Cầm cuốc này, đào 5 Thiết Tinh ở mỏ quặng Rừng Thanh Trúc.'], progress: 'Đào Thiết Tinh.', complete: ['Quặng tốt! Lò rèn của ta sẽ dùng.'],
  obj: [['collect', 'ore_t1', 5, 'Khai thác Thiết Tinh']], rw: { exp: 600, tuvi: 300, gold: 300, items: [{ item: 'tool_pick_1', qty: 1 }, { item: 'stone_enhance', qty: 3 }] } });
q('pq_fishing', { kind: 'profession', category: 'profession', name: 'Nhập Môn Câu Cá', giver: 'npc_fisherman', prereq: ['mq_1_08'],
  offer: ['Câu cá cần Cần Câu trong túi. Câu 3 Cá Chép Bạc cho lão.'], progress: 'Câu Cá Chép Bạc.', complete: ['Kiên nhẫn đấy!'],
  obj: [['collect', 'fish_t1', 3, 'Câu Cá Chép Bạc']], rw: { exp: 800, tuvi: 400, gold: 400, items: [{ item: 'pet_food_1', qty: 10 }] } });
q('pq_formation', { kind: 'profession', category: 'profession', name: 'Nhập Môn Trận Pháp', giver: 'npc_sect_elder', prereq: ['mq_3_05'],
  offer: ['Trận pháp là nền tảng của động phủ. Luyện 2 Trận Kỳ cho ta (cần La Bàn Trận).'], progress: 'Luyện Trận Kỳ.', complete: ['Có Trận Kỳ, ngươi có thể bố Tụ Linh Trận trong động phủ.'],
  obj: [['craft', 'rc_formation_flag', 2, 'Luyện Trận Kỳ']], rw: { exp: 30000, tuvi: 15000, gold: 5000, items: [{ item: 'tool_compass', qty: 1 }] } });
// Hằng ngày
q('dq_sect_hunt', { kind: 'daily', category: 'sect', name: '[Tông Môn] Tuần Tra Sơn Môn', giver: 'npc_sect_mission', prereq: ['mq_3_05'], repeatable: 'daily',
  offer: ['Nhiệm vụ hằng ngày: phá 15 Thủ Sơn Khôi Lỗi bị tà khí khống chế.'], progress: 'Phá khôi lỗi.', complete: ['Hoàn thành nhiệm vụ tông môn hôm nay.'],
  obj: [['kill', 'sect_puppet', 15, 'Phá Thủ Sơn Khôi Lỗi']], rw: { exp: 40000, tuvi: 25000, gold: 5000, spirit_stones: 5 } });
q('dq_sect_herbs', { kind: 'daily', category: 'sect', name: '[Tông Môn] Dược Viên', giver: 'npc_sect_mission', prereq: ['mq_3_05'], repeatable: 'daily',
  offer: ['Dược viên tông môn cần 10 Huyết Sâm.'], progress: 'Nộp Huyết Sâm.', complete: ['Tông môn ghi nhận cống hiến.'],
  obj: [['collect', 'herb_t2', 10, 'Nộp Huyết Sâm']], rw: { exp: 30000, tuvi: 20000, gold: 4000, spirit_stones: 5 } });
q('dq_bounty_bandits', { kind: 'daily', category: 'hunt', name: '[Treo Thưởng] Sơn Tặc', giver: 'npc_bounty_board', prereq: ['mq_1_08'], repeatable: 'daily',
  offer: ['Treo thưởng: diệt 15 Sơn Tặc Lâu La.'], progress: 'Diệt sơn tặc.', complete: ['Nhận thưởng tại bảng.'],
  obj: [['kill', 'bandit_thug', 15, 'Diệt Sơn Tặc Lâu La']], rw: { exp: 2500, tuvi: 1200, gold: 1500 } });
q('dq_bounty_ghosts', { kind: 'daily', category: 'hunt', name: '[Treo Thưởng] Khô Lâu', giver: 'npc_bounty_board', prereq: ['mq_4_03'], reqRealm: 7, repeatable: 'daily',
  offer: ['Treo thưởng: diệt 20 Khô Lâu Chiến Sĩ ở U Minh Động.'], progress: 'Diệt khô lâu.', complete: ['Nhận thưởng tại bảng.'],
  obj: [['kill', 'skeleton_warrior', 20, 'Diệt Khô Lâu Chiến Sĩ']], rw: { exp: 120000, tuvi: 60000, gold: 12000, spirit_stones: 3 } });
// Ẩn
q('hq_bamboo_secret', { kind: 'hidden', category: 'hidden', name: '[Ẩn] Khe Đá Rừng Trúc', giver: 'npc_hunter', prereq: [],
  offer: ['(Sau khe đá có một bộ hài cốt ôm cuốn bí tịch phủ bụi...)'], progress: 'Điều tra khe đá.', complete: ['(Bạn lĩnh ngộ được một bí tịch kiếm pháp thất truyền.)'],
  obj: [['interact', 'int_hidden_cave', 1, 'Điều tra Khe Đá Ẩn']], rw: { exp: 1500, tuvi: 800, gold: 500, items: [{ item: 'manual_kiem_2', qty: 1 }], title: 'Người Có Cơ Duyên' } });
q('hq_grandma_story', { kind: 'hidden', category: 'hidden', name: '[Ẩn] Chuyện Của Bà Lão', giver: 'npc_grandma', turnIn: 'npc_ancient_spirit', prereq: ['mq_3_05'],
  offer: ['Ngươi đã biết về Thái Sơ rồi sao...', 'Bà già này từng là thị nữ của Tiên Tôn, ở lại nhân giới canh giữ ngọc bội. Nếu ngươi gặp Cổ Linh ở bí cảnh thượng cổ, hãy nói với người: "A Nguyệt vẫn đợi".'],
  progress: 'Chuyển lời đến Cổ Linh ở Thượng Cổ Bí Cảnh.', complete: ['A Nguyệt... nàng vẫn còn sống. Tiên Tôn sẽ vui lắm.'],
  obj: [['talk', 'npc_ancient_spirit', 1, 'Chuyển lời đến Cổ Linh']], rw: { exp: 2e6, tuvi: 1e6, gold: 100000, items: [{ item: 'pill_marrow', qty: 2 }], title: 'Người Giữ Lời Hứa' } });

export const QUESTS = quests;

/**
 * Thành tựu & danh hiệu cạnh tranh. Tiêu chí "Người Mạnh Nhất" công khai, chỉ dựa trên thành tích chơi (không mua được).
 */
import { MONSTERS, WORLD_EVENTS } from './index_refs.js';

export type AchType = 'realm' | 'kill' | 'kill_rank' | 'kill_monster' | 'quest_main' | 'quest_any' | 'discover' | 'arena_win' | 'pvp_kill' | 'fortune' | 'craft' | 'meridian' | 'dungeon' | 'guild_join' | 'territory';
export interface AchievementDef { id: string; name: string; desc: string; category: string; type: AchType; target?: string; count: number; points: number; title?: string; reward?: { gold?: number; spirit_stones?: number } }

const A: AchievementDef[] = [];
const ach = (d: AchievementDef) => A.push(d);
// cảnh giới
[[1, 'Nhập Đạo'], [6, 'Tiên Thiên Cao Thủ'], [9, 'Võ Đạo Chí Cảnh'], [10, 'Bước Vào Tu Chân'], [13, 'Nguyên Anh Lão Quái'], [18, 'Độ Kiếp Chi Nhân'], [19, 'Phi Thăng'], [28, 'Tiên Đế'], [37, 'Thượng Tiên Tổ'], [46, 'Thần Tổ'], [55, 'Hỗn Độn Chúa Tể'], [64, 'Thái Cổ Đạo Tổ'], [70, 'Vạn Giới Hành Giả']].forEach(([r, n]) =>
  ach({ id: `ach_realm_${r}`, name: n as string, desc: `Đạt cảnh giới chỉ số ${r}`, category: 'Tu luyện', type: 'realm', count: r as number, points: 10 + (r as number) * 2, title: (r as number) >= 19 ? (n as string) : undefined }));
// săn quái
[[100, 'Thợ Săn Tập Sự'], [1000, 'Thợ Săn Yêu Thú'], [10000, 'Đồ Tể Vạn Yêu'], [100000, 'Sát Thần']].forEach(([c, n], i) => ach({ id: `ach_kill_${c}`, name: n as string, desc: `Hạ ${c} quái vật`, category: 'Chiến đấu', type: 'kill', count: c as number, points: 10 * (i + 1), title: i >= 2 ? (n as string) : undefined }));
[[1, 'Diệt Boss Đầu Tiên'], [25, 'Kẻ Săn Boss'], [200, 'Ác Mộng Của Boss']].forEach(([c, n], i) => ach({ id: `ach_boss_${c}`, name: n as string, desc: `Hạ ${c} boss`, category: 'Chiến đấu', type: 'kill_rank', target: 'boss', count: c as number, points: 15 * (i + 1) }));
// boss thế giới cụ thể
for (const m of Object.values(MONSTERS)) if (m.rank === 'world_boss') ach({ id: `ach_wb_${m.id}`, name: `Diệt ${m.name}`, desc: `Tham gia tiêu diệt boss thế giới ${m.name}`, category: 'Boss thế giới', type: 'kill_monster', target: m.id, count: 1, points: 30 });
// cốt truyện & nhiệm vụ
[[8, 'Thiếu Niên Nhập Đạo'], [20, 'Giang Hồ Lão Luyện'], [43, 'Phi Thăng Truyền Kỳ'], [61, 'Vạn Giới Truyền Thuyết']].forEach(([c, n], i) => ach({ id: `ach_main_${c}`, name: n as string, desc: `Hoàn thành ${c} nhiệm vụ chính tuyến`, category: 'Cốt truyện', type: 'quest_main', count: c as number, points: 20 * (i + 1) }));
[[50, 'Hiệp Khách Nhiệt Tình'], [300, 'Người Giúp Đỡ Vạn Giới']].forEach(([c, n], i) => ach({ id: `ach_quest_${c}`, name: n as string, desc: `Hoàn thành ${c} nhiệm vụ bất kỳ`, category: 'Cốt truyện', type: 'quest_any', count: c as number, points: 15 * (i + 1) }));
// khám phá
[[10, 'Lữ Khách'], [30, 'Nhà Thám Hiểm'], [60, 'Bước Chân Vạn Giới']].forEach(([c, n], i) => ach({ id: `ach_disc_${c}`, name: n as string, desc: `Khám phá ${c} khu vực`, category: 'Khám phá', type: 'discover', count: c as number, points: 15 * (i + 1), title: i === 2 ? 'Bước Chân Vạn Giới' : undefined }));
[[1, 'Có Duyên'], [5, 'Thiên Mệnh Chi Tử'], [12, 'Cơ Duyên Thông Thiên']].forEach(([c, n], i) => ach({ id: `ach_fort_${c}`, name: n as string, desc: `Gặp ${c} cơ duyên`, category: 'Khám phá', type: 'fortune', count: c as number, points: 20 * (i + 1), title: i === 2 ? 'Cơ Duyên Thông Thiên' : undefined }));
// PvP
[[1, 'Chiến Thắng Đầu Tiên'], [50, 'Đấu Sĩ'], [500, 'Bất Bại Chiến Thần']].forEach(([c, n], i) => ach({ id: `ach_arena_${c}`, name: n as string, desc: `Thắng ${c} trận đấu trường`, category: 'PvP', type: 'arena_win', count: c as number, points: 15 * (i + 1), title: i === 2 ? 'Bất Bại Chiến Thần' : undefined }));
[[10, 'Kẻ Giang Hồ'], [200, 'Sát Tinh']].forEach(([c, n], i) => ach({ id: `ach_pvp_${c}`, name: n as string, desc: `Hạ ${c} người chơi ở vùng PK/chiến tranh`, category: 'PvP', type: 'pvp_kill', count: c as number, points: 15 * (i + 1) }));
// nghề, kinh mạch, phó bản, tông môn
[[10, 'Thợ Thủ Công'], [200, 'Tông Sư Chế Tác']].forEach(([c, n], i) => ach({ id: `ach_craft_${c}`, name: n as string, desc: `Chế tạo thành công ${c} lần`, category: 'Nghề', type: 'craft', count: c as number, points: 10 * (i + 1) }));
[[1, 'Đả Thông Kinh Mạch'], [12, 'Thập Nhị Chính Kinh'], [20, 'Kỳ Kinh Bát Mạch']].forEach(([c, n], i) => ach({ id: `ach_mer_${c}`, name: n as string, desc: `Đả thông ${c} kinh mạch`, category: 'Tu luyện', type: 'meridian', count: c as number, points: 15 * (i + 1) }));
[[1, 'Phó Bản Đầu Tiên'], [50, 'Chinh Phục Bí Cảnh']].forEach(([c, n], i) => ach({ id: `ach_dg_${c}`, name: n as string, desc: `Hoàn thành ${c} phó bản`, category: 'PvE', type: 'dungeon', count: c as number, points: 15 * (i + 1) }));
ach({ id: 'ach_guild', name: 'Nhập Môn Tông Phái', desc: 'Gia nhập một tông môn', category: 'Xã hội', type: 'guild_join', count: 1, points: 10 });
ach({ id: 'ach_territory', name: 'Chiếm Lĩnh Một Phương', desc: 'Tông môn của bạn chiếm được một lãnh thổ', category: 'Xã hội', type: 'territory', count: 1, points: 40 });
export const ACHIEVEMENTS: Record<string, AchievementDef> = Object.fromEntries(A.map((a) => [a.id, a]));

/** Danh hiệu cạnh tranh — tính lại định kỳ từ dữ liệu thật, mất khi bị vượt */
export const STRONGEST_TITLES = [
  { id: 'Vạn Giới Chí Tôn', rule: 'Hạng 1 bảng Vạn Giới (điểm tổng hợp)', scope: 'all', from: 1, to: 1 },
  { id: 'Vạn Giới Bá Chủ', rule: 'Hạng 2–10 bảng Vạn Giới', scope: 'all', from: 2, to: 10 },
  { id: 'Tiên Giới Cường Giả', rule: 'Top 10 điểm tổng hợp trong cảnh giới Tiên Giới (Nhân Tiên–Tiên Đế)', scope: 'tien', from: 1, to: 10 },
  { id: 'Võ Đạo Chí Tôn', rule: 'Điểm đấu trường cao nhất trong cảnh giới Võ Đạo (Phàm Nhân–Võ Đạo Đại Đế)', scope: 'vo_dao_arena', from: 1, to: 1 },
  { id: 'Thiên Kiêu', rule: 'Top 10 điểm tổng hợp trong số nhân vật tạo dưới 30 ngày', scope: 'new', from: 1, to: 10 },
] as const;
/** Công thức điểm Vạn Giới (công khai): cảnh giới + đấu trường + boss + thành tựu + bí cảnh */
export const STRONGEST_FORMULA = 'Điểm = cảnh giới×1000 + tầng×100 + max(0, điểm đấu trường−1000)×2 + min(boss đã hạ, 2000)×5 + điểm thành tựu×3 + min(phó bản hoàn thành, 1000)×10';
export const TERRITORY_MAPS = ['long_ho_son', 'van_linh_son', 'linh_van_chau', 'van_tien_son', 'cuu_trong_thien', 'thai_co_than_son', 'khoi_nguyen_son'];
void WORLD_EVENTS;

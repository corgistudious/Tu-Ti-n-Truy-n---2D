import type { SkillDef, SkillPath, SkillShape, StatusApply } from '../types.js';
import { registerManual, rarityForRealm } from './items.js';

const skills: Record<string, SkillDef> = {};

type Opt = Partial<SkillDef> & { shape: SkillShape };
function sk(id: string, name: string, path: SkillPath, desc: string, o: Opt): SkillDef {
  const reqRealm = o.reqRealm ?? 0;
  const s: SkillDef = {
    id, name, path, desc, icon: `skill_${id}`, anim: 'cast', fx: `fx_${path}`, scaling: 'matk', power: 1, powerPerLevel: 0.12, hits: 1,
    cost: 10, cooldown: 4, castTime: 0.2, effects: [], reqRealm, maxLevel: 10,
    learnCost: { gold: Math.round(200 * Math.pow(1.7, reqRealm)), spirit_stones: reqRealm >= 10 ? Math.round(5 * Math.pow(1.4, reqRealm - 9)) : 0 },
    ...o,
  };
  if (skills[id]) throw new Error('dup skill ' + id);
  skills[id] = s;
  if (!id.startsWith('m_') && id !== 'basic_attack') registerManual(id, name, reqRealm, rarityForRealm(reqRealm));
  return s;
}
const st = (id: StatusApply['id'], duration: number, extra: Partial<StatusApply> = {}): StatusApply => ({ id, duration, ...extra });

// ===== Đánh thường: combo 3 đòn (đòn 3 đẩy lùi) — xử lý combo ở server =====
sk('basic_attack', 'Đánh Thường', 'co_ban', 'Chuỗi 3 đòn; đòn thứ ba gây 160% sát thương và đẩy lùi.', { anim: 'attack', scaling: 'atk', power: 0.9, powerPerLevel: 0, cost: 0, cooldown: 0.38, castTime: 0, shape: { type: 'melee', range: 62, height: 60 }, maxLevel: 1, fx: 'fx_slash' });

// ===== Kiếm tu: nhanh, xuyên giáp, kiếm khí tầm xa =====
sk('kiem_1', 'Lưu Vân Kiếm', 'kiem', 'Ba nhát kiếm liên hoàn phía trước.', { anim: 'attack', scaling: 'atk', power: 0.75, hits: 3, cost: 8, cooldown: 3, reqRealm: 1, shape: { type: 'melee', range: 80, height: 64 } });
sk('kiem_2', 'Kiếm Khí Trảm', 'kiem', 'Phóng kiếm khí xuyên qua 3 mục tiêu.', { anim: 'attack', scaling: 'atk', power: 1.6, cost: 15, cooldown: 5, reqRealm: 4, shape: { type: 'projectile', speed: 700, range: 520, radius: 22, pierce: 3 } });
sk('kiem_3', 'Phá Giáp Kiếm Ý', 'kiem', 'Nhát chém phá giáp, giảm 25% phòng thủ mục tiêu 6 giây.', { anim: 'attack', scaling: 'atk', power: 2.2, cost: 22, cooldown: 8, reqRealm: 8, shape: { type: 'melee', range: 90, height: 70 }, effects: [st('armor_break', 6, { power: 0.25 })] });
sk('kiem_4', 'Vạn Kiếm Quy Tông', 'kiem', 'Triệu hồi mưa kiếm rơi xuống vùng phía trước (có báo hiệu).', { scaling: 'atk', power: 1.1, hits: 5, cost: 45, cooldown: 16, reqRealm: 12, castTime: 0.5, shape: { type: 'aoe', radius: 150, offset: 160, delay: 0.6 } });
sk('kiem_5', 'Tru Tiên Kiếm Trận', 'kiem', 'Kiếm trận chém liên tục mọi kẻ địch trong vùng 5 giây.', { scaling: 'atk', power: 0.9, cost: 80, cooldown: 30, reqRealm: 20, castTime: 0.6, shape: { type: 'zone', radius: 180, offset: 120, duration: 5, interval: 0.5 } });

// ===== Đao tu: chậm, sát thương lớn, choáng =====
sk('dao_1', 'Khai Sơn Đao', 'dao', 'Bổ đao mạnh, đẩy lùi.', { anim: 'attack', scaling: 'atk', power: 1.9, cost: 10, cooldown: 4, reqRealm: 1, knockback: 220, shape: { type: 'melee', range: 84, height: 72 } });
sk('dao_2', 'Toàn Phong Đao', 'dao', 'Xoay đao gây sát thương xung quanh.', { anim: 'attack', scaling: 'atk', power: 0.8, hits: 4, cost: 18, cooldown: 7, reqRealm: 4, shape: { type: 'aoe', radius: 100, offset: 0 } });
sk('dao_3', 'Lôi Đình Trảm', 'dao', 'Lướt tới chém, gây choáng 1.2 giây.', { anim: 'attack', scaling: 'atk', power: 2.4, cost: 25, cooldown: 10, reqRealm: 8, shape: { type: 'dash', distance: 220, height: 64 }, effects: [st('stun', 1.2, { chance: 0.8 })] });
sk('dao_4', 'Cuồng Đao Quyết', 'dao', 'Tăng 30% công trong 10 giây.', { scaling: 'atk', power: 0, cost: 30, cooldown: 25, reqRealm: 12, shape: { type: 'self' }, effects: [st('atk_up', 10, { power: 0.3 })] });
sk('dao_5', 'Đoạn Hồn Nhất Đao', 'dao', 'Một đao duy nhất — gây thêm 80% sát thương lên mục tiêu bị choáng.', { anim: 'attack', scaling: 'atk', power: 5, cost: 70, cooldown: 24, reqRealm: 20, castTime: 0.5, shape: { type: 'melee', range: 120, height: 90 }, combo: { requires: 'stun', bonus: 0.8, consume: true } });

// ===== Quyền tu: combo nhanh, tích tầng =====
sk('quyen_1', 'Liên Hoàn Quyền', 'quyen', 'Năm cú đấm thần tốc.', { anim: 'attack', scaling: 'atk', power: 0.45, hits: 5, cost: 6, cooldown: 2.5, reqRealm: 1, shape: { type: 'melee', range: 56, height: 60 } });
sk('quyen_2', 'Hổ Khiếu Quyền', 'quyen', 'Quyền phong hình hổ bay tới, đẩy lùi.', { anim: 'attack', scaling: 'atk', power: 1.7, cost: 14, cooldown: 5, reqRealm: 4, knockback: 260, shape: { type: 'projectile', speed: 520, range: 300, radius: 26 } });
sk('quyen_3', 'Thăng Long Quyền', 'quyen', 'Đấm hất tung kẻ địch, choáng ngắn.', { anim: 'attack', scaling: 'atk', power: 2.1, cost: 20, cooldown: 8, reqRealm: 8, shape: { type: 'melee', range: 64, height: 110 }, effects: [st('stun', 0.8)] });
sk('quyen_4', 'Bát Quái Chưởng', 'quyen', 'Chưởng lực bao quanh, tăng 20% tốc độ.', { scaling: 'atk', power: 1.2, hits: 2, cost: 30, cooldown: 14, reqRealm: 12, shape: { type: 'aoe', radius: 120, offset: 0 }, effects: [st('speed_up', 6, { power: 0.2 })] });
sk('quyen_5', 'Phá Thiên Quyền', 'quyen', 'Đấm vỡ không gian; mục tiêu bị phá giáp nhận gấp đôi.', { anim: 'attack', scaling: 'atk', power: 4.2, cost: 65, cooldown: 22, reqRealm: 20, shape: { type: 'melee', range: 90, height: 90 }, combo: { requires: 'armor_break', bonus: 1, consume: false } });

// ===== Thể tu: phòng thủ, khiên, hồi phục =====
sk('the_1', 'Thiết Bố Sam', 'the', 'Tạo khiên hấp thụ 15% sinh lực tối đa.', { scaling: 'atk', power: 0, cost: 12, cooldown: 12, reqRealm: 1, shape: { type: 'self' }, effects: [st('shield', 8, { power: 0.15 })] });
sk('the_2', 'Bá Vương Xung', 'the', 'Lao tới húc văng mọi kẻ địch trên đường.', { anim: 'attack', scaling: 'atk', power: 1.5, cost: 15, cooldown: 7, reqRealm: 4, knockback: 300, shape: { type: 'dash', distance: 260, height: 70 } });
sk('the_3', 'Kim Cương Bất Hoại', 'the', 'Tăng 40% phòng thủ 8 giây.', { scaling: 'atk', power: 0, cost: 20, cooldown: 20, reqRealm: 8, shape: { type: 'self' }, effects: [st('def_up', 8, { power: 0.4 })] });
sk('the_4', 'Chấn Địa', 'the', 'Dậm đất tạo chấn động làm chậm kẻ địch xung quanh.', { anim: 'attack', scaling: 'atk', power: 1.8, cost: 28, cooldown: 12, reqRealm: 12, shape: { type: 'aoe', radius: 160, offset: 0 }, effects: [st('slow', 3, { power: 0.4 })] });
sk('the_5', 'Bất Diệt Kim Thân', 'the', 'Hồi phục liên tục và khiên lớn trong 6 giây.', { scaling: 'matk', power: 0, cost: 60, cooldown: 40, reqRealm: 20, shape: { type: 'self' }, effects: [st('shield', 6, { power: 0.35 }), st('regen', 6, { power: 0.04 })] });

// ===== Pháp tu: phép thuật tầm xa cân bằng =====
sk('phap_1', 'Linh Quang Đạn', 'phap', 'Bắn cầu linh quang.', { scaling: 'matk', power: 1.3, cost: 8, cooldown: 1.5, reqRealm: 1, shape: { type: 'projectile', speed: 600, range: 480, radius: 18 } });
sk('phap_2', 'Hồi Xuân Thuật', 'phap', 'Hồi phục sinh lực cho bản thân và đồng đội gần.', { scaling: 'matk', power: 0, heal: 2.5, cost: 20, cooldown: 8, reqRealm: 4, shape: { type: 'aoe', radius: 200, offset: 0 } });
sk('phap_3', 'Tán Hoa Phi Diệp', 'phap', 'Phóng 5 lá linh theo hình quạt.', { scaling: 'matk', power: 0.8, cost: 18, cooldown: 6, reqRealm: 8, shape: { type: 'projectile', speed: 560, range: 420, radius: 14, count: 5, spread: 0.5 } });
sk('phap_4', 'Linh Khí Hộ Thể', 'phap', 'Khiên linh khí 20% sinh lực và hồi chân khí.', { scaling: 'matk', power: 0, cost: 25, cooldown: 18, reqRealm: 12, shape: { type: 'self' }, effects: [st('shield', 10, { power: 0.2 }), st('regen', 5, { power: 0.02 })] });
sk('phap_5', 'Thiên Địa Đồng Thọ', 'phap', 'Nổ linh khí cực lớn tại vị trí chỉ định.', { scaling: 'matk', power: 5.5, cost: 90, cooldown: 28, reqRealm: 20, castTime: 0.8, shape: { type: 'aoe', radius: 190, offset: 220, delay: 0.8 } });

// ===== Lôi tu: đánh dấu lôi + kích nổ =====
sk('loi_1', 'Chưởng Tâm Lôi', 'loi', 'Tia sét đánh mục tiêu, đánh dấu Lôi Ấn.', { scaling: 'matk', power: 1.4, cost: 10, cooldown: 2.5, reqRealm: 1, shape: { type: 'projectile', speed: 900, range: 460, radius: 16 }, effects: [st('mark_thunder', 6, { stacks: 3 })] });
sk('loi_2', 'Lôi Bạo', 'loi', 'Kích nổ Lôi Ấn: +60% sát thương mỗi tầng ấn và choáng.', { scaling: 'matk', power: 1.6, cost: 18, cooldown: 6, reqRealm: 4, shape: { type: 'aoe', radius: 110, offset: 140 }, combo: { requires: 'mark_thunder', bonus: 0.6, consume: true, extra: st('stun', 1) } });
sk('loi_3', 'Lôi Ảnh Bộ', 'loi', 'Hóa thành tia sét lướt đi, gây sát thương trên đường.', { scaling: 'matk', power: 1.3, cost: 16, cooldown: 7, reqRealm: 8, shape: { type: 'dash', distance: 300, height: 60 }, effects: [st('mark_thunder', 6, { stacks: 3 })] });
sk('loi_4', 'Cửu Thiên Lôi Phạt', 'loi', 'Gọi sét đánh xuống vùng (báo hiệu 0.7s), mỗi tia gắn Lôi Ấn.', { scaling: 'matk', power: 1.0, hits: 4, cost: 40, cooldown: 15, reqRealm: 12, castTime: 0.4, shape: { type: 'aoe', radius: 140, offset: 200, delay: 0.7 }, effects: [st('mark_thunder', 6, { stacks: 3 })] });
sk('loi_5', 'Thiên Lôi Diệt Thế', 'loi', 'Lôi trường 5 giây; đánh vào mục tiêu đóng băng gây vỡ băng (+100%).', { scaling: 'matk', power: 1.2, cost: 85, cooldown: 30, reqRealm: 20, shape: { type: 'zone', radius: 170, offset: 150, duration: 5, interval: 0.5 }, combo: { requires: 'freeze', bonus: 1, consume: true } });

// ===== Hỏa tu: thiêu đốt DoT =====
sk('hoa_1', 'Hỏa Cầu Thuật', 'hoa', 'Cầu lửa gây thiêu đốt.', { scaling: 'matk', power: 1.2, cost: 9, cooldown: 2, reqRealm: 1, shape: { type: 'projectile', speed: 520, range: 440, radius: 20 }, effects: [st('burn', 4, { power: 0.25, chance: 0.6 })] });
sk('hoa_2', 'Liệt Diễm Trảm', 'hoa', 'Chém lửa; mục tiêu đang cháy nhận thêm 50%.', { anim: 'attack', scaling: 'matk', power: 1.8, cost: 16, cooldown: 5, reqRealm: 4, shape: { type: 'melee', range: 90, height: 70 }, combo: { requires: 'burn', bonus: 0.5, consume: false } });
sk('hoa_3', 'Hỏa Long Quyển', 'hoa', 'Lốc lửa lan rộng thiêu đốt mạnh.', { scaling: 'matk', power: 0.7, hits: 4, cost: 26, cooldown: 10, reqRealm: 8, shape: { type: 'aoe', radius: 130, offset: 120 }, effects: [st('burn', 5, { power: 0.3, chance: 1 })] });
sk('hoa_4', 'Hỏa Hải', 'hoa', 'Biển lửa dưới chân kẻ địch 4 giây.', { scaling: 'matk', power: 0.8, cost: 38, cooldown: 16, reqRealm: 12, shape: { type: 'zone', radius: 160, offset: 160, duration: 4, interval: 0.5 }, effects: [st('burn', 3, { power: 0.2, chance: 0.5 })] });
sk('hoa_5', 'Phần Thiên Chu Tước', 'hoa', 'Chu Tước lửa xuyên mọi mục tiêu, gây thiêu đốt cực mạnh.', { scaling: 'matk', power: 3.8, cost: 80, cooldown: 26, reqRealm: 20, castTime: 0.5, shape: { type: 'projectile', speed: 650, range: 700, radius: 40, pierce: 99 }, effects: [st('burn', 6, { power: 0.5, chance: 1 })] });

// ===== Băng tu: khống chế đóng băng/làm chậm =====
sk('bang_1', 'Hàn Băng Tiễn', 'bang', 'Mũi băng làm chậm 30%.', { scaling: 'matk', power: 1.15, cost: 9, cooldown: 2, reqRealm: 1, shape: { type: 'projectile', speed: 640, range: 460, radius: 16 }, effects: [st('slow', 3, { power: 0.3, chance: 1 })] });
sk('bang_2', 'Băng Phong', 'bang', 'Đóng băng kẻ địch xung quanh 1.5 giây.', { scaling: 'matk', power: 1.1, cost: 20, cooldown: 9, reqRealm: 4, shape: { type: 'aoe', radius: 120, offset: 0 }, effects: [st('freeze', 1.5, { chance: 0.85 })] });
sk('bang_3', 'Băng Liên Tỏa', 'bang', 'Ba cột băng trồi lên liên tiếp phía trước.', { scaling: 'matk', power: 1.0, hits: 3, cost: 22, cooldown: 8, reqRealm: 8, shape: { type: 'aoe', radius: 90, offset: 150, delay: 0.3 }, effects: [st('slow', 3, { power: 0.4 })] });
sk('bang_4', 'Huyền Băng Giáp', 'bang', 'Khiên băng; kẻ tấn công cận chiến bị làm chậm.', { scaling: 'matk', power: 0, cost: 25, cooldown: 18, reqRealm: 12, shape: { type: 'self' }, effects: [st('shield', 8, { power: 0.25 })] });
sk('bang_5', 'Vạn Lý Băng Phong', 'bang', 'Bão tuyết đóng băng toàn vùng; mục tiêu đang chậm bị đóng băng chắc chắn.', { scaling: 'matk', power: 3.2, cost: 85, cooldown: 30, reqRealm: 20, castTime: 0.6, shape: { type: 'aoe', radius: 220, offset: 160, delay: 0.5 }, combo: { requires: 'slow', bonus: 0.3, consume: true, extra: st('freeze', 2.5) } });

// ===== Độc tu: cộng dồn độc, kích nổ =====
sk('doc_1', 'Độc Châm', 'doc', 'Phi châm tẩm độc (cộng dồn 5 tầng).', { anim: 'attack', scaling: 'matk', power: 0.9, cost: 7, cooldown: 1.6, reqRealm: 1, shape: { type: 'projectile', speed: 760, range: 420, radius: 12 }, effects: [st('poison', 6, { power: 0.12, stacks: 5, chance: 1 })] });
sk('doc_2', 'Độc Vụ', 'doc', 'Màn sương độc 5 giây.', { scaling: 'matk', power: 0.4, cost: 18, cooldown: 10, reqRealm: 4, shape: { type: 'zone', radius: 140, offset: 120, duration: 5, interval: 0.5 }, effects: [st('poison', 6, { power: 0.1, stacks: 5, chance: 0.6 })] });
sk('doc_3', 'Vạn Độc Phệ Tâm', 'doc', 'Kích phát độc: +40% sát thương mỗi tầng độc.', { scaling: 'matk', power: 1.4, cost: 22, cooldown: 7, reqRealm: 8, shape: { type: 'projectile', speed: 700, range: 400, radius: 18 }, combo: { requires: 'poison', bonus: 0.4, consume: true } });
sk('doc_4', 'Thực Cốt Độc Chưởng', 'doc', 'Chưởng độc phá giáp.', { anim: 'attack', scaling: 'matk', power: 2.0, cost: 26, cooldown: 11, reqRealm: 12, shape: { type: 'melee', range: 70, height: 64 }, effects: [st('poison', 6, { power: 0.15, stacks: 5 }), st('armor_break', 5, { power: 0.2 })] });
sk('doc_5', 'Thiên Độc Vạn Cổ', 'doc', 'Vạn cổ trùng lan khắp vùng rộng, độc chồng tối đa ngay lập tức.', { scaling: 'matk', power: 2.6, cost: 80, cooldown: 28, reqRealm: 20, shape: { type: 'aoe', radius: 230, offset: 100 }, effects: [st('poison', 8, { power: 0.15, stacks: 5, chance: 1 }), st('poison', 8, { power: 0.15, stacks: 5, chance: 1 }), st('poison', 8, { power: 0.15, stacks: 5, chance: 1 })] });

// ===== Phù tu: phù lục ném, khiên phù =====
sk('phu_1', 'Bạo Liệt Phù', 'phu', 'Ném phù nổ tại điểm rơi.', { scaling: 'matk', power: 1.5, cost: 10, cooldown: 3, reqRealm: 1, shape: { type: 'aoe', radius: 80, offset: 180, delay: 0.35 } });
sk('phu_2', 'Định Thân Phù', 'phu', 'Phù định thân gây choáng 1.5 giây.', { scaling: 'matk', power: 0.8, cost: 18, cooldown: 10, reqRealm: 4, shape: { type: 'projectile', speed: 600, range: 380, radius: 18 }, effects: [st('stun', 1.5, { chance: 0.9 })] });
sk('phu_3', 'Kim Quang Hộ Phù', 'phu', 'Khiên cho bản thân và đồng đội gần.', { scaling: 'matk', power: 0, cost: 30, cooldown: 20, reqRealm: 8, shape: { type: 'aoe', radius: 200, offset: 0 }, effects: [st('shield', 8, { power: 0.15 })] });
sk('phu_4', 'Ngũ Lôi Phù', 'phu', 'Năm lá phù sét bay toả ra.', { scaling: 'matk', power: 0.9, cost: 30, cooldown: 12, reqRealm: 12, shape: { type: 'projectile', speed: 600, range: 420, radius: 16, count: 5, spread: 0.7 }, effects: [st('mark_thunder', 6, { stacks: 3 })] });
sk('phu_5', 'Thiên Cương Phong Ma Phù', 'phu', 'Phong ấn: gây sát thương lớn và choáng mục tiêu đang bị độc/cháy.', { scaling: 'matk', power: 4.0, cost: 75, cooldown: 25, reqRealm: 20, shape: { type: 'aoe', radius: 150, offset: 200, delay: 0.5 }, combo: { requires: 'burn', bonus: 0.6, consume: true, extra: st('stun', 2) } });

// ===== Trận pháp: vùng kéo dài =====
sk('tran_1', 'Khốn Tiên Trận', 'tran', 'Trận pháp làm chậm và gây sát thương theo thời gian.', { scaling: 'matk', power: 0.45, cost: 14, cooldown: 8, reqRealm: 1, shape: { type: 'zone', radius: 120, offset: 100, duration: 4, interval: 0.5 }, effects: [st('slow', 1, { power: 0.35 })] });
sk('tran_2', 'Tụ Linh Trận', 'tran', 'Trận hồi phục cho đồng đội đứng trong 6 giây.', { scaling: 'matk', power: 0, heal: 0.5, cost: 25, cooldown: 18, reqRealm: 4, shape: { type: 'zone', radius: 150, offset: 0, duration: 6, interval: 1 } });
sk('tran_3', 'Bát Môn Kim Tỏa', 'tran', 'Trận khóa: choáng tất cả trong vùng sau 0.8s.', { scaling: 'matk', power: 1.6, cost: 30, cooldown: 14, reqRealm: 8, shape: { type: 'aoe', radius: 140, offset: 140, delay: 0.8 }, effects: [st('stun', 1.5, { chance: 0.8 })] });
sk('tran_4', 'Thất Sát Trận', 'tran', 'Sát trận chém liên tục 5 giây.', { scaling: 'matk', power: 0.75, cost: 40, cooldown: 18, reqRealm: 12, shape: { type: 'zone', radius: 160, offset: 140, duration: 5, interval: 0.5 } });
sk('tran_5', 'Chu Thiên Tinh Đấu Đại Trận', 'tran', 'Đại trận tinh tú: sát thương + phá giáp + làm chậm toàn vùng 6 giây.', { scaling: 'matk', power: 1.0, cost: 90, cooldown: 35, reqRealm: 20, shape: { type: 'zone', radius: 240, offset: 120, duration: 6, interval: 0.5 }, effects: [st('armor_break', 2, { power: 0.2 }), st('slow', 2, { power: 0.3 })] });

// ===== Ngự thú: triệu hồi linh thú chiến đấu =====
sk('ngu_1', 'Triệu Linh Lang', 'ngu_thu', 'Triệu hồi sói linh chiến đấu 20 giây.', { scaling: 'matk', power: 0, cost: 20, cooldown: 25, reqRealm: 1, shape: { type: 'summon', pet: 'summon_wolf', duration: 20 } });
sk('ngu_2', 'Thú Hống', 'ngu_thu', 'Tiếng gầm tăng công cho bản thân, linh thú và đồng đội.', { scaling: 'matk', power: 0, cost: 20, cooldown: 20, reqRealm: 4, shape: { type: 'aoe', radius: 220, offset: 0 }, effects: [st('atk_up', 8, { power: 0.2 })] });
sk('ngu_3', 'Linh Ưng Kích', 'ngu_thu', 'Đại bàng linh lao xuống mổ mục tiêu, xé rách giáp 20% trong 5 giây.', { scaling: 'matk', power: 2.0, cost: 20, cooldown: 7, reqRealm: 8, shape: { type: 'projectile', speed: 800, range: 500, radius: 24 }, effects: [st('armor_break', 5, { power: 0.2 })] });
sk('ngu_4', 'Triệu Hổ Vương', 'ngu_thu', 'Triệu hồi hổ vương 25 giây.', { scaling: 'matk', power: 0, cost: 40, cooldown: 40, reqRealm: 12, shape: { type: 'summon', pet: 'summon_tiger', duration: 25 } });
sk('ngu_5', 'Vạn Thú Triều Bái', 'ngu_thu', 'Sóng bầy thú lao qua chiến trường, xuyên mọi mục tiêu; +50% lên mục tiêu bị xé giáp.', { combo: { requires: 'armor_break', bonus: 0.5, consume: false }, scaling: 'matk', power: 1.0, hits: 6, cost: 80, cooldown: 30, reqRealm: 20, shape: { type: 'projectile', speed: 480, range: 640, radius: 60, pierce: 99 } });

// ===== Kỹ năng quái vật/boss (không học được) =====
sk('m_bite', 'Cắn Xé', 'co_ban', '', { anim: 'attack', scaling: 'atk', power: 1, cost: 0, cooldown: 1.6, shape: { type: 'melee', range: 50, height: 50 } });
sk('m_charge', 'Húc Lao', 'co_ban', '', { anim: 'attack', scaling: 'atk', power: 1.6, cost: 0, cooldown: 6, knockback: 220, shape: { type: 'dash', distance: 200, height: 50 } });
sk('m_spit', 'Phun Độc', 'co_ban', '', { scaling: 'matk', power: 1, cost: 0, cooldown: 4, shape: { type: 'projectile', speed: 380, range: 340, radius: 14 }, effects: [st('poison', 5, { power: 0.08, stacks: 3, chance: 0.6 })] });
sk('m_firebolt', 'Yêu Hỏa', 'co_ban', '', { scaling: 'matk', power: 1.1, cost: 0, cooldown: 3.5, shape: { type: 'projectile', speed: 420, range: 400, radius: 16 }, effects: [st('burn', 3, { power: 0.15, chance: 0.4 })] });
sk('m_icebolt', 'Hàn Khí', 'co_ban', '', { scaling: 'matk', power: 1.0, cost: 0, cooldown: 3.5, shape: { type: 'projectile', speed: 420, range: 400, radius: 16 }, effects: [st('slow', 2, { power: 0.3, chance: 0.6 })] });
sk('m_slam', 'Đập Đất', 'co_ban', '', { anim: 'attack', scaling: 'atk', power: 1.8, cost: 0, cooldown: 7, castTime: 0.8, shape: { type: 'aoe', radius: 140, offset: 0, delay: 0.8 }, effects: [st('stun', 1, { chance: 0.6 })] });
sk('m_thunder', 'Lôi Kích', 'co_ban', '', { scaling: 'matk', power: 1.6, cost: 0, cooldown: 6, castTime: 0.6, shape: { type: 'aoe', radius: 90, offset: 180, delay: 0.9 } });
sk('m_shadow', 'Ám Ảnh Trảm', 'co_ban', '', { anim: 'attack', scaling: 'atk', power: 1.4, cost: 0, cooldown: 5, shape: { type: 'dash', distance: 240, height: 60 } });
sk('m_howl', 'Tru Hống', 'co_ban', '', { scaling: 'atk', power: 0, cost: 0, cooldown: 20, shape: { type: 'self' }, effects: [st('atk_up', 8, { power: 0.3 })] });
sk('m_heal', 'Tự Liệu', 'co_ban', '', { scaling: 'matk', power: 0, heal: 3, cost: 0, cooldown: 18, shape: { type: 'self' } });
sk('m_barrage', 'Loạn Xạ', 'co_ban', '', { scaling: 'matk', power: 0.7, cost: 0, cooldown: 8, shape: { type: 'projectile', speed: 400, range: 420, radius: 14, count: 5, spread: 0.9 } });
sk('m_void_zone', 'Hư Không Lĩnh Vực', 'co_ban', '', { scaling: 'matk', power: 0.6, cost: 0, cooldown: 14, castTime: 0.5, shape: { type: 'zone', radius: 150, offset: 100, duration: 5, interval: 0.5 } });
sk('m_shield', 'Hộ Thể Cương Khí', 'co_ban', '', { scaling: 'matk', power: 0, cost: 0, cooldown: 25, shape: { type: 'self' }, effects: [st('shield', 8, { power: 0.12 })] });
sk('m_meteor', 'Thiên Thạch', 'co_ban', '', { scaling: 'matk', power: 2.4, cost: 0, cooldown: 10, castTime: 1, shape: { type: 'aoe', radius: 170, offset: 220, delay: 1.2 }, effects: [st('burn', 4, { power: 0.2 })] });
sk('m_freeze_nova', 'Băng Bạo', 'co_ban', '', { scaling: 'matk', power: 1.3, cost: 0, cooldown: 12, castTime: 0.8, shape: { type: 'aoe', radius: 180, offset: 0, delay: 1 }, effects: [st('freeze', 1.5, { chance: 0.7 })] });
sk('m_lightning_strike', 'Thiên Kiếp Lôi', 'co_ban', 'Thiên kiếp giáng xuống — có báo hiệu, hãy né.', { scaling: 'matk', power: 2.2, cost: 0, cooldown: 2.2, castTime: 0, shape: { type: 'aoe', radius: 70, offset: 0, delay: 1.1 } });

export const SKILLS = skills;
export const PLAYER_SKILL_PATHS: SkillPath[] = ['kiem', 'dao', 'quyen', 'the', 'phap', 'loi', 'hoa', 'bang', 'doc', 'phu', 'tran', 'ngu_thu'];
export const PATH_NAMES: Record<SkillPath, string> = {
  kiem: 'Kiếm Tu', dao: 'Đao Tu', quyen: 'Quyền Tu', the: 'Thể Tu', phap: 'Pháp Tu', loi: 'Lôi Tu', hoa: 'Hỏa Tu', bang: 'Băng Tu', doc: 'Độc Tu', phu: 'Phù Tu', tran: 'Trận Pháp', ngu_thu: 'Ngự Thú', co_ban: 'Cơ Bản',
};

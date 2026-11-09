# Thiết kế gameplay (đã cài đặt)

Dữ liệu: `shared/src/data/*.ts`. Công thức: `shared/src/formulas.ts`.

## Cảnh giới & tu luyện
- Võ Đạo 10 (Phàm Nhân → Võ Đạo Đại Đế), Tu Chân 9 (Luyện Khí → Độ Kiếp), Tiên Giới 10 (Nhân Tiên → Tiên Đế), sau đó **Hỗn Độn Cảnh — Trọng N** vô hạn.
- Mỗi cảnh giới 9 tầng; tu vi lên tầng tự động; tầng 9 đầy phải **đột phá**: nguyên liệu (đan đột phá riêng từng cảnh giới, linh thảo, khoáng thạch theo bậc), vàng,
  nhiệm vụ cốt truyện ở các mốc lớn (Nhập Môn, Tiên Thiên, Luyện Khí, Nhân Tiên, Hỗn Độn), và **thử thách gameplay**:
  - *Tâm Ma*: instance riêng, đánh bại bản sao bóng tối scale theo chỉ số người chơi trong 120 giây.
  - *Thiên Kiếp*: instance riêng, sống sót qua 3 + cảnh giới/3 đạo lôi có vùng báo hiệu (đạo cuối 3 tia).
- Tỉ lệ: gốc giảm dần theo cảnh giới, +10% Hộ Mạch Đan, +5% mỗi lần thất bại trước (tối đa 25%), +25% khi vượt thử thách. Thất bại: −15% tu vi tầng hiện tại, hồi 120 giây, Tâm Ma −10% công 5 phút; không tụt cảnh giới.
- Đả tọa: tu vi theo mật độ linh khí bản đồ, Tụ Linh Trận và nội thất động phủ.

## Chiến đấu
Sát thương = công × hệ số kỹ năng × (1 − def/(def + 3·công)) × biến thiên ±5% × (1 + thưởng combo), chí mạng trừ theo kháng, kẹp 1..1e15.
PvP giảm 50%. 13 trạng thái (thiêu đốt, đóng băng, trúng độc cộng dồn, choáng, chậm, khiên, hồi phục, lôi ấn cộng dồn, phá giáp, tăng công/thủ/tốc, tâm ma);
boss giảm 70% thời gian khống chế. Đánh thường combo 3 đòn (đòn 3 ×1.6 + đẩy lùi), né có khung bất tử.

## Công pháp
12 con đường × 5 kỹ năng (Kiếm, Đao, Quyền, Thể, Pháp, Lôi, Hỏa, Băng, Độc, Phù, Trận, Ngự Thú), học bằng bí tịch, nâng cấp tới cấp 10 (giới hạn theo cảnh giới, cấp ≥5 cần thêm bí tịch).
Mỗi đường có cơ chế riêng (test dữ liệu đảm bảo ≥4 chữ ký cơ chế khác nhau/đường): cận chiến, đạn xuyên/quạt, AoE báo hiệu, lướt, trận pháp kéo dài, triệu hồi, khiên/hồi phục,
và **combo**: lôi ấn → kích nổ; độc cộng dồn → phệ tâm; đóng băng → lôi phá băng; chậm → bão tuyết đóng băng; cháy → liệt diễm/phong ma phù; choáng → đoạn hồn; phá giáp → phá thiên/vạn thú.

## Quái & boss
71 quái: thường, tinh anh, hiếm, boss khu vực, boss thế giới, boss phó bản, boss tông môn, boss sự kiện. AI: phát hiện, tuần tra, truy đuổi (nhảy bậc), vận chiêu có thời gian
(cho người chơi né), giữ khoảng cách (quái tầm xa), rút lui khi máu thấp, trở về & hồi máu khi bị kéo xa, hồi sinh. Boss nhiều giai đoạn: triệu hồi, khiên, cuồng nộ, tăng tốc,
đổi bộ kỹ năng, thông báo giai đoạn.

## Vật phẩm & trang bị
512 mẫu data-driven, 10 độ hiếm, trang bị cho mọi cảnh giới × 7 ô + thời trang + thú cưỡi, 8 bộ set (2/4 món), thuộc tính phụ ngẫu nhiên (Hiếm+), cường hóa +15 (từ +7 thất bại tụt 1),
tinh luyện +10, 3 lỗ khảm (tối đa 2 ngọc cùng chỉ số), tẩy luyện, độ bền & sửa chữa, khóa linh hồn khi trang bị đồ Huyền Phẩm+, khóa vật phẩm.

## Nghề
Luyện đan, luyện khí, chế phù, trận pháp, chế tạo trang bị (công thức, cấp, công cụ, thời gian, tỉ lệ), khai khoáng, hái thuốc, câu cá (điểm tài nguyên trên bản đồ, kênh thu thập
bị ngắt khi di chuyển/bị đánh, hồi phục), trồng linh thảo (linh điền động phủ, thời gian thực).

## Xã hội & kinh tế
Chat thế giới/bản đồ/tổ đội/tông môn/riêng (rate limit, chống lặp, lọc từ), bạn bè/chặn, tổ đội 5 người (chia tu vi + thưởng 10%/thành viên, sở hữu vật phẩm rơi chung),
tông môn (4 chức vụ, quyền hạn, kho, quyên góp → cống hiến, cấp tông môn, chiến tranh 1 giờ có tính điểm, boss tông môn mỗi ngày), báo cáo người chơi kèm ngữ cảnh chat.
Tiền Vàng (nguồn: quái, nhiệm vụ, bán NPC, đấu trường; tiêu: shop, cường hóa, dịch chuyển, đột phá, xây dựng, phí) và Linh Thạch (nguồn: nhiệm vụ cao cấp, túi linh thạch từ boss;
tiêu: vật phẩm cao cấp, cường hóa cao, nâng cấp). Phí sàn: giao dịch 2%, chợ 5% (+1% đăng), đấu giá 6% — nguồn tiêu hao chống lạm phát.

## PvP & PvE
Vùng an toàn (thành, làng, tông môn), bản đồ PK tự do (Cổ Chiến Trường, Ma Vực, Thiên Ngoại Chiến Trường, Hỗn Độn Hải) với chế độ Hòa bình/Tông môn/Toàn bộ, phản kích 30 giây,
điểm PK. Bảo hộ tân thủ (< Nội Kình), chặn tấn công người kém > 2 cảnh giới. Tỉ thí (không chết), đấu trường xếp hạng Elo 1v1 (ghép theo điểm, nới dần), chiến tranh tông môn.
4 phó bản tổ đội (đợt quái + boss, giới hạn lượt/ngày, thời gian), boss thế giới, sự kiện thế giới (admin lên lịch: x2 kinh nghiệm, thú triều, boss sự kiện).

## Linh thú, thú cưỡi, động phủ
Thu phục (dưới 30% máu, phù theo cấp, tỉ lệ), 11 mẫu (có tiến hóa), phẩm chất 0-5, cấp & kinh nghiệm (nhận từ quái), AI đồng hành, trang bị, đổi tên, phóng sinh; triệu hồi tạm thời (Ngự Thú).
Thú cưỡi: +tốc độ + hiển thị. Động phủ 6 cấp (cấp 5 Tiên Phủ cần Tiên Giới): Linh Điền, Tụ Linh Trận, Đan Phòng, Tàng Bảo Các, Linh Thú Viên; nội thất có hiệu ứng; quyền vào riêng tư/bạn bè/tông môn/công khai.

## Cốt truyện
7 chương: Thôn Biên Giới → Hắc Phong Sơn → Cổ Kiếm & Thiên Kiếm Tông → Thức Tỉnh Linh Căn → Tu Chân Giới → Độ Kiếp Phi Thăng → Tiên Giới & Hỗn Độn.
Mạch truyện xoay quanh ngọc bội của Thái Sơ Tiên Tôn bị phong ấn; nhiệm vụ phụ: săn, thu thập, điều tra, hộ tống, giải cứu, bí cảnh, đồ thất lạc, nghề, tông môn hằng ngày, nhiệm vụ ẩn kích hoạt khi khám phá.

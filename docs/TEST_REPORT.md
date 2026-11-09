# Báo cáo kiểm thử — 2026-11-09

Tất cả số liệu dưới đây là kết quả chạy thật trong môi trường phát triển (container Linux 16 vCPU).

## Tóm tắt

| Bộ kiểm thử | Lệnh | Kết quả |
|---|---|---|
| Typecheck TS (shared, server, asset-pipeline) | `npm run typecheck` | ✅ không lỗi |
| Dữ liệu & công thức & vật lý (shared) | `npm run test -w shared` | ✅ 17/17 |
| Tích hợp server (PostgreSQL + Redis + HTTP + WebSocket thật, bot giao thức) | `npm run test -w server` | ✅ 17/17 (~82 giây) |
| Asset pipeline | `npm run test -w asset-pipeline` | ✅ 6/6 |
| Validator toàn bộ asset | `npm run assets:validate` | ✅ 199 file đạt (cảnh báo bán trong suốt ở khung "chết" mờ dần — có chủ đích) |
| Client Godot 4.3 headless (Linux) | `godot --headless --path client -- --autotest` | ✅ PASS |
| Client PC Web trong Chromium (bản xuất Godot Web) | `node tests/e2e/web_client.mjs` | ✅ PASS (21 giây từ mở trang tới hoàn tất) |
| Admin Dashboard trong Chromium | đăng nhập, Tổng quan, Kinh tế | ✅ |
| Android | xuất APK debug, `apksigner verify` | ✅ build & chữ ký; ❌ chưa chạy trên thiết bị |
| Docker image server | build + chạy với Postgres/Redis | ✅ migrate, /readyz, /play, /admin |
| Backup/restore + toàn vẹn DB | `scripts/backup.sh`, `restore.sh`, `db-integrity.sql` | ✅ 6/6 kiểm tra = 0 |
| Load test | `tests/load/bots.ts` | ✅ xem bảng dưới |

## Phạm vi test tích hợp server (17 kịch bản)

- **Tài khoản**: đăng ký (mật khẩu yếu bị từ chối, trùng email 409), xác thực email bằng token trong hộp thư đi, đăng nhập sai/đúng,
  danh sách phiên, đăng xuất thiết bị khác (token cũ 401), đổi mật khẩu, quên/đặt lại mật khẩu (token dùng 1 lần), nhật ký bảo mật; khóa tạm sau 5 lần sai.
- **Nhân vật**: tên không hợp lệ/từ cấm/màu ngoài bảng → 400, trùng tên 409, ngoại hình lưu đúng, xóa cần gõ tên, nhân vật chờ xóa không vào được game, khôi phục.
- **Di chuyển & chống gian lận**: dịch chuyển 2000px bị sửa vị trí, bay lên trời bị sửa, gói tin cũ (replay) bị bỏ qua, đi bộ hợp lệ được chấp nhận.
- **Nhiệm vụ**: nhận nhiệm vụ phải đứng gần NPC, trả nhiệm vụ cộng vàng/sổ cái/DB.
- **Chiến đấu**: hạ 3 quái bằng đánh thường thật (server tính sát thương), tiến độ nhiệm vụ diệt quái, tu vi tăng; **8 yêu cầu nhặt song song → 1 thành công**.
- **Kỹ năng**: học bí tịch, gán thanh kỹ năng, tiêu hao chân khí, hồi chiêu, Lôi Ấn → Lôi Bạo kích nổ (combo tiêu hao ấn).
- **Túi đồ**: mua shop (không bán món ngoài danh sách), trang bị tăng chỉ số, cường hóa, sổ cái; **bán cùng món 6 lần song song → tiền chỉ cộng 1 lần**; khóa vật phẩm chặn bán; tháo trang bị.
- **Tu luyện**: đả tọa tăng tu vi; đột phá bị chặn bởi nhiệm vụ cốt truyện; đột phá không thử thách; Tâm Ma (scale theo người chơi, thắng → kết quả); Thiên Kiếp (vùng báo hiệu lôi, kết thúc → kết quả).
- **Giao dịch trực tiếp**: phải khóa trước khi xác nhận, vật phẩm đang giao dịch không hủy được, xác nhận đồng thời → thực thi đúng 1 lần, quyền sở hữu & phí 2% chính xác.
- **Chợ & đấu giá**: không mua hàng của mình, 2 người mua cùng tin rao → 1 thành công, phí 5%+1%, đặt giá tối thiểu +5%, người bị vượt giá được hoàn qua thư, mua ngay, nhận vật phẩm qua thư, số dư khớp sổ cái.
- **Multiplayer & xã hội**: hai người thấy nhau qua snapshot, vị trí đồng bộ, AOI loại người ở xa, chat bản đồ + chống lặp, tổ đội, bạn bè, tông môn (tạo/mời/quyên góp/chức vụ/quyền/chat), báo cáo.
- **PvP**: làng an toàn chặn, bảo hộ tân thủ, chênh lệch > 2 cảnh giới bị chặn, chế độ hòa bình, tỉ thí (thua không chết), đấu trường ghép cặp → thắng → Elo tăng → trở về.
- **Phó bản tổ đội**: chỉ đội trưởng mở, cả đội vào cùng instance, các đợt quái, boss chuyển giai đoạn (thông báo), hoàn thành → vàng + ghi `dungeon_runs`.
- **Linh thú/động phủ/nghề**: thu phục bằng phù, triệu hồi (AI xuất hiện), cho ăn lên cấp; mua động phủ, xây Linh Điền, vào instance, trồng (chưa chín bị chặn), thu hoạch, đặt nội thất (tăng tu luyện), quyền truy cập; luyện đan (chưa xong bị chặn, nhận thành phẩm, kinh nghiệm nghề); hái thuốc + hồi phục điểm tài nguyên.
- **Kết nối & bảo mật**: mất kết nối giữ phiên, kết nối lại tiếp quản; đăng nhập thiết bị 2 đá phiên 1; lưu DB khi rời; spam gói tin bị đếm vi phạm; tham số RPC độc hại bị từ chối;
  admin: 403 với người chơi, cấm chat có hiệu lực, gửi vật phẩm qua thư, khóa tài khoản đá khỏi game + vô hiệu token, audit log, sự kiện x2 kinh nghiệm.
- **Bản đồ**: mọi bản đồ công khai khởi tạo trên server, quái đứng trên mặt đất.

## Kiểm thử dữ liệu (shared)
Toàn vẹn tham chiếu (đột phá, rơi đồ, kỹ năng quái, NPC/quái/cổng/tài nguyên/điểm điều tra trên bản đồ, nhiệm vụ, cửa hàng, công thức, phó bản, linh thú, bí tịch),
đủ 23 khu vực đặc tả, 7 chương chính tuyến, 12 con đường × 5 kỹ năng có cơ chế khác nhau, đủ 10 độ hiếm, sát thương không tràn số, cân bằng 5 mốc cảnh giới,
tu vi đơn điệu & hữu hạn tới Hỗn Độn sâu, sinh bản đồ tất định & cổng không kẹt tường, vật lý không xuyên tường ở tốc độ cao (lỗi xuyên tường được phát hiện & sửa nhờ test này).

## Load test
Xem [tests/reports/load-test-2026-11-09.md](../tests/reports/load-test-2026-11-09.md): 500 bot trên một bản đồ — tick server TB 25 ms (ngân sách 50 ms), RPC p95 87 ms, 0 lần sửa vị trí.

## Lỗi thật phát hiện & sửa nhờ kiểm thử trong lượt này
1. Vật lý xuyên tường khi vận tốc lớn → chia nhỏ bước di chuyển.
2. SQL tham số kiểu không nhất quán khi khóa tài khoản sai mật khẩu (500) → ép kiểu tường minh.
3. Kênh cuối không giới hạn người → tick 62 ms với 300 người → kênh động.
4. Bundle production chạy migration hai lần song song (lỗi entry-point) → sửa nhận diện entry + tạo bảng migration trong khóa advisory.
5. Bố cục HUD tính trước khi biết kích thước, ký tự thiếu trong font Web → bố cục lại định kỳ, thay ký tự.

## Chưa kiểm thử
Thiết bị Android thật (cảm ứng, hiệu năng, safe area), trình duyệt có GPU thật (FPS), SMTP thật, OpenAI API Mode, triển khai VPS thật,
độ trễ mạng nhân tạo (chỉ kiểm thử localhost), playtest cân bằng dài hạn.

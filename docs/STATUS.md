# Trạng thái dự án — cập nhật 2026-11-09 (lượt làm việc 1)

Tài liệu này ghi **chính xác** những gì đã chạy và đã kiểm thử, và những gì **chưa** hoàn thành.
Mỗi lượt làm việc sau cần cập nhật file này trước khi kết thúc.

## Kết luận ngắn

Đã có một **vertical slice hoạt động thật, xuyên suốt toàn hệ thống**: server có quyền quyết định cuối cùng với DB thật,
client Godot chạy trên **Desktop (headless), PC Web (Chromium)** và đã **xuất APK Android có chữ ký**; hầu hết hệ thống
gameplay trong đặc tả đã có logic server + giao diện client + kiểm thử tích hợp.

**Chưa phải** MMORPG hoàn chỉnh ở mức phát hành thương mại: đồ họa/âm thanh hiện là placeholder nguyên bản sinh bằng mã
(chờ asset ChatGPT), chưa có AAB, chưa đo hiệu năng trên thiết bị thật, chưa triển khai production, nhiều nội dung cần
cân bằng & đánh bóng. Chi tiết bên dưới.

## Tiêu chí hoàn thành (mục XXXIII)

| # | Tiêu chí | Trạng thái | Bằng chứng |
|---|---|---|---|
| 1 | Source code đầy đủ | ✅ Monorepo đủ thư mục yêu cầu | repo này |
| 2 | Client Godot chạy được | ✅ | Godot 4.3 headless `--autotest` PASS (đi bộ 1900px, NPC, nhận nhiệm vụ, túi đồ) |
| 3 | Backend multiplayer chạy được | ✅ | 17 test tích hợp WS/HTTP thật; load test 500 bot |
| 4 | Database thực | ✅ PostgreSQL 16, migration có checksum | `database/migrations/001_init.sql`, backup/restore đã chạy |
| 5 | Tài khoản & nhân vật | ✅ đăng ký/đăng nhập/xác thực email/quên & đổi mật khẩu/phiên/đăng xuất thiết bị/khóa sai mật khẩu/tạo-chọn-xóa có bảo vệ 24h | test "Tài khoản", "Nhân vật" |
| 6 | Bản đồ & NPC | ✅ 23 khu vực đặc tả + 9 instance, 67 NPC, cổng 2 chiều | test dữ liệu + server khởi tạo mọi bản đồ |
| 7 | Chiến đấu thực tế | ✅ server tính sát thương, hitbox/projectile/AoE báo hiệu/zone/dash, 13 trạng thái, combo | test "chiến đấu", "kỹ năng" |
| 8 | Nhiệm vụ chính & phụ | ✅ 43 chính tuyến (7 chương tới Hỗn Độn) + 23 phụ/nghề/hằng ngày/ẩn; hộ tống, điều tra, giải cứu, bí cảnh | test nhiệm vụ mở đầu; toàn vẹn tham chiếu |
| 9 | Tu luyện | ✅ 29 cảnh giới + Hỗn Độn vô hạn, đả tọa, đột phá với Tâm Ma / Thiên Kiếp (gameplay), thất bại có hậu quả | test "Tu luyện & đột phá" |
| 10 | Inventory & equipment | ✅ túi/kho/trang bị/khóa/sắp xếp/tìm kiếm, cường hóa/tinh luyện/khảm/tẩy luyện/sửa/bộ set | test túi đồ (kể cả chống bán trùng song song) |
| 11 | Kinh tế & giao dịch | ✅ shop NPC, giao dịch trực tiếp (khóa tài sản, idempotent, phí), chợ, đấu giá ký quỹ, thư, sổ cái | test "Kinh tế"; script kiểm tra toàn vẹn sổ cái |
| 12 | Multiplayer đồng bộ | ✅ AOI, snapshot 10 Hz delta, nội suy, kênh động, reconnect, chống đăng nhập kép | test AOI/reconnect; load test |
| 13 | Tông môn | ✅ tạo/mời/chức vụ-quyền/kho/quyên góp/cấp/chiến tranh/boss tông môn/nhật ký | test "Xã hội" |
| 14 | Linh thú & tiên phủ | ✅ thu phục/triệu hồi/AI/cho ăn/tiến hóa/trang bị; động phủ→tiên phủ 6 cấp, công trình, linh điền, nội thất, quyền truy cập | test "Linh thú, Động phủ, Nghề" |
| 15 | Phi thăng tiên giới | ✅ nội dung | Chương 6-7, 5 bản đồ Tiên Giới, quest gate Độ Kiếp→Nhân Tiên |
| 16 | Admin Dashboard | ✅ | Đã đăng nhập & thao tác trong Chromium; test ban/mute/grant/event có audit log |
| 17 | Android build | ⚠️ **APK debug** đã xuất & ký (v1/v2/v3, arm64+armv7). **AAB chưa** (cần Gradle + Android SDK đầy đủ — dl.google.com bị chặn trong môi trường này). Chưa chạy trên thiết bị thật. | `scripts/build-android.sh` |
| 18 | Web build | ✅ | Chromium headless: autotest PASS + ảnh chụp |
| 19 | Kiểm thử & báo cáo | ✅ (phạm vi trong TEST_REPORT) | [TEST_REPORT.md](TEST_REPORT.md) |
| 20 | Tài liệu vận hành | ✅ | README, SETUP, DEPLOYMENT, API, ARCHITECTURE |

## Chưa hoàn thành / hạn chế đã biết (phải làm ở các lượt sau)

1. **Đồ họa & âm thanh chính thức**: toàn bộ 199 tài nguyên là placeholder nguyên bản do `asset-pipeline` sinh. Danh sách prompt ChatGPT đã có
   (`docs/CHATGPT_ASSET_REQUESTS.md`) nhưng **chưa nhập asset ChatGPT nào**. Chân dung NPC 256×256 chưa có (manifest đánh dấu thiếu).
   Thân nhân vật nữ đang dùng chung sheet với nam (khác ở tóc/trang phục).
2. **Android AAB** chưa xuất; APK release cần keystore của chủ dự án. Chưa kiểm thử trên điện thoại thật (cảm ứng, safe area, bàn phím ảo chỉ được cài đặt trong mã).
3. **Hiệu năng client** chưa đo trên thiết bị thật: 144 FPS Godot headless Linux; 11 FPS trong Chromium dùng WebGL phần mềm (không GPU) — không đại diện.
4. **Mở rộng ngang**: một tiến trình server phục vụ toàn thế giới (500 bot/1 bản đồ: tick 25 ms). Chưa có sharding nhiều tiến trình/máy.
5. **Chống gian lận di chuyển** là kiểm tra tốc độ/va chạm/thời gian trên không (không mô phỏng lại vật lý phía server). Chưa có hệ thống phát hiện bất thường theo thống kê.
6. **Bản đồ** được sinh tất định từ dữ liệu (địa hình, bục, cổng, NPC, điểm tài nguyên) — chưa có level design thủ công.
7. **PvP chiến trường đội** (queue 2 phe riêng) chưa có — hiện có PK tự do ở bản đồ mở, tỉ thí, đấu trường 1v1 xếp hạng, chiến tranh tông môn.
8. **Email**: gửi qua SMTP khi cấu hình `SMTP_URL`; trong kiểm thử chỉ xác minh qua bảng `mail_outbox` (chưa thử SMTP thật).
9. **Cân bằng game**: công thức đã được test ở 5 mốc cảnh giới, nhưng tốc độ cày/kinh tế dài hạn chưa được mô phỏng hay chơi thử.
10. **UI client** đầy đủ chức năng nhưng còn thô: một số thao tác chọn mặc định (vd khảm viên ngọc đầu tiên trong túi, đặt nội thất tại vị trí đang đứng).
11. **Triển khai production** chưa thực hiện (theo yêu cầu không tự ý thay đổi VPS). Docker image đã build và chạy thử thành công cục bộ.
12. **Giám sát**: có `/metrics` + cấu hình Prometheus/cảnh báo; chưa có dashboard Grafana.

## Môi trường đã dùng trong lượt này

Node 22, PostgreSQL 16, Redis 7, Godot 4.3-stable + export templates, apksigner/zipalign (apt), OpenJDK 21, Chromium (Playwright), Docker 29.

## Việc tiếp theo đề xuất (theo thứ tự)

1. Nhập asset ChatGPT cho CHR_001 + lớp nhân vật → duyệt → thay placeholder (không đổi mã).
2. Build AAB trên máy có Android SDK; chạy thử trên 2-3 điện thoại; đo FPS & tối ưu.
3. Playtest chương 1-3, chỉnh cân bằng và UI.
4. Sharding theo bản đồ (gateway định tuyến WS), Grafana.
5. Chiến trường đội, level design thủ công cho các bản đồ chính.

## Ảnh chụp (lượt 1)
- `docs/screenshots/web-client-chromium.png` — bản xuất Godot Web chạy trong Chromium, đã vào Tân Thủ Thôn, mở túi đồ.
- `docs/screenshots/admin-dashboard.png` — Admin Dashboard sau khi đăng nhập.
- `docs/screenshots/chr001-placeholder-sheet.png` — sprite sheet placeholder của CHR_001 (8 animation).
- `docs/screenshots/monsters-tiles-parallax.png` — quái, tileset, icon, parallax placeholder.

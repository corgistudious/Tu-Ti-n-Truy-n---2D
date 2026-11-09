# Kiến trúc

```
 Godot 4 client (Android APK / Web)           Admin Dashboard (web)
   │  HTTPS: đăng ký/đăng nhập/nhân vật/bundle dữ liệu      │ HTTPS /api/admin/* (RBAC)
   │  WSS  : input, atk, skill, dodge, rpc  ◄── snap/ev/res │
   ▼                                                        ▼
 Nginx (TLS, rate limit, WS upgrade)  ──►  Node.js server (Fastify + ws)
                                             ├─ World: tick 20 Hz, snapshot 10 Hz
                                             │   ├─ MapInstance (bản đồ × kênh động / instance phó bản, thử thách, đấu trường, động phủ)
                                             │   │    ├─ AI quái (phát hiện, tuần tra, truy đuổi, vận chiêu, rút lui, trở về, hồi sinh, giai đoạn boss)
                                             │   │    ├─ Combat (sát thương, trạng thái, đạn, AoE báo hiệu, trận pháp, combo)
                                             │   │    └─ AOI (ô 512px, ±3 ô) → snapshot delta theo người chơi
                                             │   └─ PlayerSession (hàng đợi thao tác tuần tự, kiểm tra di chuyển, tu vi, lưu định kỳ)
                                             ├─ RPC handlers (core, inventory, progression, economy, social, pets_housing, pvp)
                                             └─ Services: currency (sổ cái), items (instance), stats, mailer, audit
                                                   │ transaction                    │ rate limit, khóa đăng nhập đơn, cache xếp hạng
                                                   ▼                                ▼
                                             PostgreSQL 16                     Redis 7
```

## Nguyên tắc

- **Server là nguồn xác thực cuối cùng**: client chỉ gửi ý định (vị trí dự đoán, đánh, kỹ năng, RPC). Server kiểm tra hồi chiêu,
  chi phí, khoảng cách tới NPC/điểm tương tác, quyền, cảnh giới; tự tính sát thương, phần thưởng, rơi đồ, tỉ lệ đột phá, cường hóa.
- **Dữ liệu game duy nhất** ở `shared/` — server dùng trực tiếp; client tải `/api/data/bundle` (cache theo version hash).
  Lưới bản đồ sinh tất định ở server và gửi kèm tin `map`, nên client và server luôn cùng một lưới va chạm.
- **Vật lý chung**: `shared/src/tilemap.ts` (TS) và `client/scripts/world/tile_physics.gd` (bản sao GDScript) — client dự đoán, server kiểm chứng.

## Toàn vẹn kinh tế & chống nhân đôi

- Mọi thay đổi tiền đi qua `changeCurrency()` trong transaction: `SELECT ... FOR UPDATE`, CHECK ≥ 0 ở DB, ghi `currency_ledger` với số dư sau.
- Vật phẩm là `item_instances` (UUID) với `owner_id + container` (`bag/storage/equip/market/auction/mail/guild/pet/housing/escrow`).
  Di chuyển giữa chủ sở hữu bằng `detach()` + `placeIntoBag()` trong cùng transaction; mọi thay đổi quan trọng ghi `item_logs`.
- Mỗi người chơi có **hàng đợi thao tác tuần tự** (`PlayerSession.enqueue`) → không có race condition giữa các RPC của cùng một người.
- Giao dịch trực tiếp: khóa tài sản trong bộ nhớ khi bấm "Khóa", xác nhận hai phía, thực thi một transaction với **idempotency key**.
- Chợ/đấu giá: hàng được ký gửi (container `market`/`auction`), tiền đặt giá bị trừ ngay (ký quỹ), hoàn trả qua thư.
- Đã kiểm thử: nhặt cùng vật phẩm 8 lần song song → 1 thành công; bán cùng món 6 lần song song → 1 lần cộng tiền; mua cùng tin rao bởi 2 người → 1 thành công.
- `scripts/db-integrity.sql`: số dư khớp sổ cái, không ví âm, không trùng ô, không vật phẩm treo.

## Bảo mật

- Mật khẩu: scrypt (N=16384, r=8, p=1, salt 16 byte), so sánh thời gian hằng. Khóa tạm 15 phút sau 5 lần sai.
- Phiên: token ngẫu nhiên 256-bit, DB chỉ lưu SHA-256; thu hồi từng thiết bị / mọi thiết bị; đổi/đặt lại mật khẩu thu hồi phiên.
- Email xác thực / đặt lại mật khẩu: token một lần, có hạn, lưu dạng băm. Quên mật khẩu không tiết lộ email tồn tại.
- Rate limit: đăng ký/đăng nhập/xác thực WS (Redis), chat theo kênh + chống lặp, gói tin WS ≤ 60/giây, Nginx `limit_req`.
- Kiểm tra tham số mọi RPC (kiểu, khoảng, UUID), lọc nội dung chat/tên, chống replay input (seq tăng dần).
- Log JSON tự che khóa nhạy cảm (`password`, `token`, `secret`, `api_key`...). Không có tài khoản/khóa cố định trong mã.
- Admin: vai trò `support < gm < admin`, mọi thao tác quan trọng ghi `admin_logs` (kèm IP).
- Khóa API OpenAI (API Mode của asset pipeline) chỉ nằm ở biến môi trường server.

## Mở rộng

- Kênh động: mỗi kênh ≤ 60 người, mở thêm khi đầy (tối đa 40/bản đồ), dọn kênh trống sau 5 phút.
- Bản đồ không có người chơi được tick thưa hơn; instance trống bị hủy sau 60 giây.
- Khóa đăng nhập đơn theo tài khoản lưu ở Redis (`online:acc:<id>`) — nền tảng cho nhiều tiến trình.
- Hướng tiếp theo: shard theo bản đồ (mỗi tiến trình một nhóm bản đồ), gateway định tuyến WS, pub/sub Redis cho chat thế giới/tông môn.

## Lưu trạng thái

- Ghi ngay (transaction): tiền, vật phẩm, kỹ năng, nhiệm vụ hoàn thành, đột phá, thú cưng, động phủ, tông môn.
- Ghi định kỳ 30 giây + khi rời mạng: vị trí, HP/MP, tu vi trong tầng, tiến độ nhiệm vụ đang làm (mất tối đa 30 giây tiến độ khi sập server).
- Mất kết nối: phiên được giữ 30 giây; kết nối lại tiếp quản phiên cũ, không nạp lại dữ liệu.

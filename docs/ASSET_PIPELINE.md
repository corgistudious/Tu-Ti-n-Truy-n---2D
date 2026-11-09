# Asset Pipeline (ChatGPT thiết kế — Claude tích hợp)

Thư mục `asset-pipeline/`. Manifest: `assets/manifest.json` (id, đường dẫn, đặc tả kỹ thuật, trạng thái, nguồn, giấy phép, phiên bản, SHA-256, người duyệt).

## Lệnh

| Lệnh | Tác dụng |
|---|---|
| `npm run generate -w asset-pipeline` | Sinh placeholder pixel art/âm thanh nguyên bản vào `client/assets`, đồng bộ manifest |
| `npm run prompts -w asset-pipeline` | Sinh prompt cho từng asset → `asset-pipeline/prompts/*.txt` và `docs/CHATGPT_ASSET_REQUESTS.md` |
| `npm run validate -w asset-pipeline` | Kiểm tra mọi file theo đặc tả (kích thước, lưới khung, alpha, khung trống, dấu hiệu khử răng cưa, số màu, WAV 16-bit) |
| `npm run import -w asset-pipeline [-- --source openai-api]` | Nhập file từ `asset-pipeline/inbox/<ID>.png|wav`: kiểm tra → lưu bản cũ vào `archive/` → thay thế → trạng thái `pending_review` |
| `npm run approve -w asset-pipeline -- <ID> --license "..." --reviewer "..."` | Duyệt (bắt buộc ghi giấy phép/quyền sử dụng) |
| `npx tsx asset-pipeline/src/cli.ts reject <ID>` | Từ chối |

Thư viện: `validate.ts` có `extractFrames` (tách khung), `normalizeSheet` (animation importer — chuẩn hóa sheet ChatGPT có kích thước/khung khác
về lưới game, nearest-neighbor, căn chân), `importTileset` (tilemap importer — lấy 8 ô 32×32 theo chỉ số từ tileset bất kỳ).

## Manual Mode
1. Mở `docs/CHATGPT_ASSET_REQUESTS.md`, copy prompt của asset (vd `CHR_001`, `char_hair_2`, `mon_wolf`, `tiles_bamboo`).
2. Dán vào ChatGPT, tải PNG về, đổi tên `<ID>.png`, đặt vào `asset-pipeline/inbox/`.
3. `npm run import -w asset-pipeline` — file sai đặc tả bị từ chối kèm lý do.
4. Xuất client/chạy game để xem; rồi `approve` kèm giấy phép. Client không cần đổi mã (đường dẫn giữ nguyên).
Không tự động điều khiển cuộc trò chuyện ChatGPT.

## API Mode
Server có `POST /api/admin/assets/generate` (chỉ admin) gọi OpenAI Images API bằng `OPENAI_API_KEY` trong **biến môi trường server**
(bật bằng `ASSET_API_ENABLED=true`). Ảnh trả về ở trạng thái `pending_validation` → lưu vào inbox → import (validator) → duyệt.
Không bao giờ nhúng khóa API trong client. (Chưa chạy thật trong lượt này vì không có khóa API.)

## Quy chuẩn
Nhân vật/NPC 64×96/khung (sheet 8 cột × 8 hàng: idle 4, run 6, jump 2, attack 4, hurt 2, death 4, cast 4, meditate 2; gốc ở chân (32,94); quay phải),
lớp: body/legs/outfit/belt/face/hair/weapon — body/hair/outfit vẽ **thang xám** để game tô màu. Quái 64×64 (rồng 128×128), lưới 4 cột × 5 hàng
(idle, move, attack, hurt, death). Tile 32×32 (8 ô/theme). Parallax 640×360 × 3 lớp. Icon vật phẩm 32×32 (atlas 16 cột), icon kỹ năng 64×64 (atlas 8 cột).
Chân dung NPC 256×256 (chưa có). Nearest-neighbor, không khử răng cưa, nền trong suốt.

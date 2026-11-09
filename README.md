# Tu Tiên Truyện 2D

MMORPG 2D **HD Chibi Pixel Art** — Võ Hiệp · Tu Tiên · Phi Thăng · Thế Giới Mở.
Nền tảng: **Android (APK)** và **PC Web** (trình duyệt). Client **Godot 4.3**, server **Node.js + TypeScript** có quyền quyết định cuối cùng,
**PostgreSQL** + **Redis**, WebSocket thời gian thực, Docker Compose + Nginx (HTTPS/WSS).

> Trạng thái thật của dự án (đã làm / chưa làm / bằng chứng kiểm thử): **[docs/STATUS.md](docs/STATUS.md)**.
> Dự án **chưa** hoàn thành toàn bộ phạm vi MMORPG thương mại — xem mục "Chưa hoàn thành" trong STATUS.

## Cấu trúc monorepo

| Thư mục | Nội dung |
|---|---|
| `client/` | Client Godot 4 (GDScript): đăng nhập, tạo nhân vật phân lớp, thế giới, HUD, cảm ứng Android, mọi bảng chức năng, preset xuất Web/Android |
| `server/` | Server game: HTTP (tài khoản, nhân vật, admin), WebSocket (tick 20 Hz, AOI, RPC), chiến đấu, AI, nhiệm vụ, tu luyện, kinh tế, xã hội, PvP, phó bản, linh thú, động phủ |
| `shared/` | Dữ liệu game data-driven (29 cảnh giới + Hỗn Độn vô hạn, 512 vật phẩm, 61 kỹ năng người chơi (12 con đường × 5 + đánh thường) + 16 kỹ năng quái, 71 quái (19 boss), 32 bản đồ, 67 NPC, 66 nhiệm vụ (43 chính tuyến / 7 chương), 195 công thức), công thức, vật lý tile dùng chung |
| `database/` | Migration SQL có kiểm soát (checksum, advisory lock) |
| `assets/` | `manifest.json` — danh mục mọi tài nguyên, trạng thái duyệt, nguồn gốc & giấy phép |
| `asset-pipeline/` | Sinh pixel art nguyên bản, validator PNG/WAV, tách khung, chuẩn hóa sheet, nhập tileset, prompt ChatGPT, nhập/duyệt asset |
| `admin/` | Admin Dashboard (web tĩnh, gọi `/api/admin/*`, RBAC + audit log) |
| `infrastructure/` | Dockerfile, docker-compose (prod/staging/dev), Nginx HTTPS/WSS, Prometheus |
| `scripts/` | setup, build Web/Android, chạy test, backup/restore, kiểm tra toàn vẹn DB |
| `tests/` | Load test (bot thật), e2e Web (Chromium), báo cáo |
| `docs/` | Tài liệu |

## Chạy nhanh (phát triển)

```bash
./scripts/setup-dev.sh
```

```bash
npm run dev
```

Mở Godot 4.3 với thư mục `client/` và chạy (máy chủ mặc định `http://127.0.0.1:8080`), hoặc xuất Web:

```bash
GODOT=/đường/dẫn/godot ./scripts/build-web.sh
```

rồi chạy server với `CLIENT_DIR=client/export/web` và mở `http://localhost:8080/play/index.html`.

Tạo tài khoản quản trị (không có tài khoản mặc định trong mã nguồn):

```bash
ADMIN_EMAIL=ban@vidu.vn ADMIN_PASSWORD='MatKhauManh1' npm run admin:create -w server
```

Admin Dashboard: `http://localhost:8080/admin/index.html`.

## Kiểm thử

```bash
./scripts/test-all.sh
```

Chi tiết và kết quả thực tế: [docs/TEST_REPORT.md](docs/TEST_REPORT.md).

## Tài liệu

- [docs/STATUS.md](docs/STATUS.md) — trạng thái, tiêu chí hoàn thành, việc còn lại
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — kiến trúc, luồng dữ liệu, bảo mật, mở rộng
- [docs/SETUP.md](docs/SETUP.md) — cài đặt môi trường, build client
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — triển khai production/staging, HTTPS, backup, giám sát
- [docs/API.md](docs/API.md) — HTTP API, giao thức WebSocket, danh sách RPC
- [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md) — hệ thống gameplay đã cài đặt
- [docs/ASSET_PIPELINE.md](docs/ASSET_PIPELINE.md) — quy trình asset với ChatGPT (Manual Mode / API Mode)
- [docs/CHATGPT_ASSET_REQUESTS.md](docs/CHATGPT_ASSET_REQUESTS.md) — danh sách prompt tài nguyên (sinh tự động)
- [tests/reports/load-test-2026-11-09.md](tests/reports/load-test-2026-11-09.md) — load test

## Bản quyền tài nguyên

Toàn bộ hình ảnh và âm thanh hiện tại được **sinh bằng mã trong dự án** (nguyên bản). Font Be Vietnam Pro theo SIL OFL 1.1.
Không sao chép tài sản của bất kỳ trò chơi nào. Mọi asset mới phải qua validator và duyệt giấy phép (`asset-pipeline`).

# Cài đặt môi trường phát triển

## Yêu cầu

- Node.js ≥ 20 (đã kiểm thử với 22), npm
- PostgreSQL 16 và Redis 7 (hoặc Docker để chạy `infrastructure/docker-compose.dev.yml`)
- Godot **4.3-stable** + export templates 4.3 (để chạy/xuất client)
- Android: Android SDK (platform-tools, build-tools có `apksigner`/`zipalign`), JDK 17+, keystore debug/release
- Chromium/Playwright (tùy chọn, cho kiểm thử Web)

## Các bước

```bash
./scripts/setup-dev.sh
```

Hoặc thủ công:

```bash
npm ci
```

```bash
docker compose -f infrastructure/docker-compose.dev.yml up -d
```

```bash
npm run migrate
```

```bash
npm run assets:generate
```

```bash
npm run dev
```

Biến môi trường server: xem `server/src/config.ts` và `.env.example`. Mặc định dev: `DATABASE_URL=postgres://tutien:tutien_dev@127.0.0.1:5432/tutien`
(giá trị dev này **bị từ chối** khi `NODE_ENV=production|staging`).

Kiểm thử tích hợp dùng CSDL `tutien_test` (xóa sạch schema mỗi lần chạy): `TEST_DATABASE_URL` để đổi.

## Client Godot

- Mở `client/project.godot` bằng Godot 4.3, chạy cảnh chính. Ở màn hình đăng nhập nhập địa chỉ server (Desktop/Android).
- Bản Web tự dùng cùng origin với trang (server phục vụ tại `/play/`).
- Tự kiểm thử headless: `godot --headless --path client -- --autotest --server=http://127.0.0.1:8080`
- Xuất Web: `GODOT=godot ./scripts/build-web.sh` → `client/export/web`
- Xuất Android APK: cấu hình Android SDK/JDK/keystore trong Editor Settings rồi `GODOT=godot ./scripts/build-android.sh`
  (`MODE=release` + biến `GODOT_ANDROID_KEYSTORE_RELEASE_PATH/_USER/_PASSWORD` cho bản phát hành).
- AAB: cài Android Build Template trong editor, bật Gradle build và định dạng AAB trong preset "Android".

## Điều khiển

PC: A/D hoặc ←/→ di chuyển, Space nhảy (S+Space xuống bục), J đánh, K/L/U/I/O kỹ năng 1-5, Shift né, E tương tác, F nhặt,
B túi đồ (đặc tả yêu cầu cả "I = túi đồ" và "I = kỹ năng 4" — giữ I cho kỹ năng, túi đồ mặc định B), C nhân vật, M bản đồ,
Q nhiệm vụ, N kỹ năng, R đả tọa, Enter chat, Esc đóng cửa sổ. Đổi phím trong Cài đặt (lưu cục bộ và lên server).

Android: joystick trái, nút Nhảy/Tương tác, thanh kỹ năng + Né/Đả tọa/Nhặt bên phải.

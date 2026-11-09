# Triển khai

> Không tự ý thay đổi dịch vụ đang chạy trên VPS. Không xóa dữ liệu hay triển khai production khi chưa có xác nhận của chủ dự án.
> Lượt làm việc này **chưa** triển khai lên máy chủ nào; Docker image đã được build và chạy thử cục bộ.

## 1. Chuẩn bị

1. Máy chủ Linux có Docker + Docker Compose, tên miền trỏ về máy chủ.
2. `cp .env.example .env` và điền: `PUBLIC_URL`, `POSTGRES_PASSWORD`, `REDIS_PASSWORD` (mật khẩu mạnh, ngẫu nhiên), `SMTP_URL`, `CORS_ORIGINS`.
3. Chứng chỉ TLS (ví dụ Let's Encrypt) tại `infrastructure/certs/fullchain.pem` và `privkey.pem` (hoặc đặt `CERTS_DIR`).
4. Xuất client Web trước khi build image: `GODOT=godot ./scripts/build-web.sh`.

## 2. Khởi chạy

```bash
docker compose -f infrastructure/docker-compose.yml --env-file .env up -d --build
```

Server tự chạy migration (có khóa advisory, an toàn khi nhiều instance khởi động cùng lúc).

Tạo tài khoản quản trị (trong container):

```bash
docker compose -f infrastructure/docker-compose.yml --env-file .env exec -e ADMIN_EMAIL=ban@vidu.vn -e ADMIN_PASSWORD='MatKhauManh1' server node dist/cli/admin.js
```

## 3. Staging

```bash
docker compose -f infrastructure/docker-compose.yml -f infrastructure/docker-compose.staging.yml -p tutien-staging --env-file .env.staging up -d --build
```

## 4. Kiểm tra sức khỏe

- `GET /healthz` — tiến trình sống; `GET /readyz` — DB + Redis sẵn sàng (Docker HEALTHCHECK dùng /healthz).
- `GET /metrics` (chỉ mạng nội bộ qua Nginx) — `tt_online`, `tt_instances`, `tt_monsters`, `tt_tick_ms`, RSS.
- Prometheus: `infrastructure/monitoring/prometheus.yml` + `alerts.yml` (cảnh báo tick > 35 ms).

## 5. Sao lưu & khôi phục

```bash
DATABASE_URL=postgres://... BACKUP_DIR=/srv/backups ./scripts/backup.sh
```

- Định dạng `pg_dump -Fc`, kiểm tra đọc được + SHA-256, giữ 14 bản (BACKUP_KEEP). Nên đặt cron hằng ngày và chép ra ngoài máy chủ.
- Khôi phục vào CSDL đích (yêu cầu gõ xác nhận) rồi tự chạy kiểm tra toàn vẹn:

```bash
DATABASE_URL=postgres://.../tutien_restore ./scripts/restore.sh /srv/backups/tutien-....dump
```

- Kiểm tra toàn vẹn định kỳ: `psql "$DATABASE_URL" -f scripts/db-integrity.sql` (mọi dòng phải = 0).

## 6. Cập nhật phiên bản

1. Sao lưu DB. 2. Build image mới. 3. `docker compose up -d server` (migration mới chạy tự động; file migration đã chạy không được sửa — checksum sẽ chặn).
4. Kiểm tra `/readyz`, đăng nhập thử, xem `/api/admin/errors`.

## 7. Android / Web

- Web: server phục vụ `client/export/web` tại `/play/` (Nginx chuyển `/` → `/play/index.html`). Bản xuất không dùng threads nên không cần COOP/COEP.
- Android: phát hành APK/AAB ký bằng keystore release của chủ dự án; địa chỉ server nhập ở màn hình đăng nhập (nên dùng HTTPS/WSS).

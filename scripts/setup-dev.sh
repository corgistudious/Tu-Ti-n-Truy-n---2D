#!/usr/bin/env bash
# Thiết lập môi trường phát triển: cài phụ thuộc, khởi động Postgres+Redis (Docker), chạy migration, sinh asset.
set -euo pipefail
cd "$(dirname "$0")/.."
npm ci
if command -v docker >/dev/null && docker info >/dev/null 2>&1; then
  docker compose -f infrastructure/docker-compose.dev.yml up -d
  sleep 4
else
  echo "Không có Docker: hãy tự cài PostgreSQL 16 (user tutien/tutien_dev, db tutien, tutien_test) và Redis 7."
fi
npm run migrate
npm run assets:generate
echo "Xong. Chạy server: npm run dev   |   Tạo admin: ADMIN_EMAIL=.. ADMIN_PASSWORD=.. npm run admin:create -w server"

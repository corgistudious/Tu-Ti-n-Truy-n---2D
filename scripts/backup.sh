#!/usr/bin/env bash
# Sao lưu PostgreSQL (định dạng custom, nén) + kiểm tra toàn vẹn file sao lưu. Giữ BACKUP_KEEP bản gần nhất.
# Dùng: DATABASE_URL=... ./scripts/backup.sh   (hoặc chạy trong cron hằng ngày)
set -euo pipefail
: "${DATABASE_URL:?Cần DATABASE_URL}"
DIR="${BACKUP_DIR:-./backups}"; KEEP="${BACKUP_KEEP:-14}"
mkdir -p "$DIR"; chmod 700 "$DIR"
F="$DIR/tutien-$(date -u +%Y%m%dT%H%M%SZ).dump"
pg_dump --format=custom --no-owner --dbname="$DATABASE_URL" --file="$F"
pg_restore --list "$F" >/dev/null   # xác minh file đọc được
sha256sum "$F" > "$F.sha256"
ls -1t "$DIR"/tutien-*.dump | tail -n +$((KEEP + 1)) | while read -r old; do rm -f "$old" "$old.sha256"; done
echo "Đã sao lưu: $F ($(du -h "$F" | cut -f1))"

#!/usr/bin/env bash
# Khôi phục bản sao lưu vào CSDL ĐÍCH. CẢNH BÁO: ghi đè dữ liệu. Yêu cầu xác nhận gõ tay.
# Dùng: DATABASE_URL=postgres://.../tutien_restore ./scripts/restore.sh backups/tutien-....dump
set -euo pipefail
: "${DATABASE_URL:?Cần DATABASE_URL (CSDL đích)}"
F="${1:?Cần đường dẫn file .dump}"
sha256sum -c "$F.sha256"
echo "Sẽ KHÔI PHỤC $F vào $DATABASE_URL (dữ liệu hiện có sẽ bị thay thế). Gõ 'KHOI PHUC' để tiếp tục:"
read -r ans; [ "$ans" = "KHOI PHUC" ] || { echo "Đã hủy"; exit 1; }
pg_restore --clean --if-exists --no-owner --dbname="$DATABASE_URL" "$F"
psql "$DATABASE_URL" -f "$(dirname "$0")/db-integrity.sql"

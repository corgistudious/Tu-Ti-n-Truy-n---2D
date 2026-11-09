#!/usr/bin/env bash
# Chạy toàn bộ kiểm thử: typecheck, unit/data (shared), tích hợp server (DB+Redis thật), asset pipeline,
# client Godot headless tự kiểm thử, (tùy chọn) Web trong Chromium.
set -euo pipefail
cd "$(dirname "$0")/.."
npm run typecheck
npm run test -w shared
npm run test -w asset-pipeline
npm run test -w server
npm run assets:validate
if command -v "${GODOT:-godot}" >/dev/null; then
  (cd server && SKIP_MIGRATE=0 PORT=18080 REGISTER_LIMIT_PER_HOUR=1000 npx tsx src/index.ts >/tmp/tt-test-server.log 2>&1 & echo $! >/tmp/tt-test-server.pid)
  sleep 6
  (cd client && "${GODOT:-godot}" --headless --path . -- --autotest --server=http://127.0.0.1:18080) | grep AUTOTEST
  kill "$(cat /tmp/tt-test-server.pid)" || true
fi
echo "TẤT CẢ KIỂM THỬ ĐÃ CHẠY"

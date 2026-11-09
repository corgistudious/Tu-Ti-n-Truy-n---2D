#!/usr/bin/env bash
# Xuất client Godot cho PC Web -> client/export/web (server phục vụ tại /play/)
set -euo pipefail
cd "$(dirname "$0")/../client"
GODOT="${GODOT:-godot}"
mkdir -p export/web
"$GODOT" --headless --path . --import >/dev/null 2>&1 || true
"$GODOT" --headless --path . --export-release "Web" export/web/index.html
ls -la export/web

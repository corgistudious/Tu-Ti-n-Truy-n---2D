#!/usr/bin/env bash
# Xuất APK Android. Cần: export templates Godot 4.3, Android SDK (platform-tools, build-tools/apksigner), JDK 17+.
# Bản phát hành: đặt biến môi trường GODOT_ANDROID_KEYSTORE_RELEASE_PATH / _USER / _PASSWORD (KHÔNG commit keystore).
# AAB (Google Play) cần gradle build: cài Android build template (Project > Install Android Build Template),
# bật gradle_build/use_gradle_build=true và gradle_build/export_format=1 trong preset rồi chạy với MODE=aab.
set -euo pipefail
cd "$(dirname "$0")/../client"
GODOT="${GODOT:-godot}"
MODE="${MODE:-debug}"
mkdir -p export/android
"$GODOT" --headless --path . --import >/dev/null 2>&1 || true
if [ "$MODE" = "release" ]; then
  "$GODOT" --headless --path . --export-release "Android" export/android/tu-tien-truyen-2d.apk
else
  "$GODOT" --headless --path . --export-debug "Android" export/android/tu-tien-truyen-2d-debug.apk
fi
ls -la export/android

#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
SRC="build/icon-source.png"
ICONSET="build/icon.iconset"
ICNS="build/icon.icns"

if [[ ! -f "$SRC" ]]; then
  echo "missing $SRC" >&2
  exit 1
fi

rm -rf "$ICONSET"
mkdir -p "$ICONSET"

for size in 16 32 128 256 512; do
  sips -z "$size" "$size" "$SRC" --out "$ICONSET/icon_${size}x${size}.png" >/dev/null
  double=$((size * 2))
  sips -z "$double" "$double" "$SRC" --out "$ICONSET/icon_${size}x${size}@2x.png" >/dev/null
done

rm -f "$ICNS"
iconutil -c icns "$ICONSET" -o "$ICNS"
rm -rf "$ICONSET"

sips -z 1024 1024 "$SRC" --out build/icon.png >/dev/null

echo "wrote $ICNS and build/icon.png"
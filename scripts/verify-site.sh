#!/bin/sh
set -eu

BASE_URL=${1:-https://italianbrosco.com}
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT HUP INT TERM

curl -fsSL "$BASE_URL/" -o "$TMP_DIR/home.html"
curl -fsSL "$BASE_URL/catalog.js" -o "$TMP_DIR/catalog.js"
curl -fsSL "$BASE_URL/assets/favicon.svg" -o "$TMP_DIR/favicon.svg"
curl -fsSL "$BASE_URL/debug/apps/" -o "$TMP_DIR/debug-apps.html"

grep -q '<title>Italian Bros — Useful apps, thoughtfully made</title>' "$TMP_DIR/home.html"
grep -q 'rel="icon" href="/assets/favicon.svg"' "$TMP_DIR/home.html"
grep -q '<svg' "$TMP_DIR/favicon.svg"
grep -q 'window.APP_CATALOG' "$TMP_DIR/catalog.js"
grep -q '<title>Italianbros Co. — Digital Officina</title>' "$TMP_DIR/debug-apps.html"

for icon in abc-smash calcspace deal-analyzer dream-journal easy-audio-notes echobeat eyes-up hundred mortgage-calculator pollwar real-or-ai super-game tin-wings; do
  curl -fsSL "$BASE_URL/assets/icons/$icon.png" -o "$TMP_DIR/$icon.png"
  test -s "$TMP_DIR/$icon.png"
done

printf 'Verified %s: showcase, catalog, 13 icons, and preserved /debug/apps page.\n' "$BASE_URL"

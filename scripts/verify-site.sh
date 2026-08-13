#!/bin/sh
set -eu

BASE_URL=${1:-https://italianbrosco.com}
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT HUP INT TERM

curl -fsSL "$BASE_URL/" -o "$TMP_DIR/home.html"
curl -fsSL "$BASE_URL/catalog.js" -o "$TMP_DIR/catalog.js"
curl -fsSL "$BASE_URL/app.js" -o "$TMP_DIR/app.js"
curl -fsSL "$BASE_URL/assets/favicon.svg" -o "$TMP_DIR/favicon.svg"
curl -fsSL "$BASE_URL/debug/apps/" -o "$TMP_DIR/debug-apps.html"
curl -fsSL "$BASE_URL/clay-scorecard/privacy/" -o "$TMP_DIR/clay-privacy.html"
curl -fsSL "$BASE_URL/clay-scorecard/support/" -o "$TMP_DIR/clay-support.html"
curl -fsSL "$BASE_URL/road-trip-arcade/privacy/" -o "$TMP_DIR/road-trip-privacy.html"
curl -fsSL "$BASE_URL/road-trip-arcade/support/" -o "$TMP_DIR/road-trip-support.html"
curl -fsSL "$BASE_URL/tin-wings/privacy/" -o "$TMP_DIR/tin-wings-privacy.html"
curl -fsSL "$BASE_URL/tin-wings/support/" -o "$TMP_DIR/tin-wings-support.html"
curl -fsSL "$BASE_URL/dealanalyzer/deal/" -o "$TMP_DIR/deal-viewer.html"

grep -q '<title>Italian Bros — Independent product studio</title>' "$TMP_DIR/home.html"
grep -q 'rel="icon" href="/assets/favicon.svg"' "$TMP_DIR/home.html"
grep -q '<svg' "$TMP_DIR/favicon.svg"
grep -q 'window.APP_CATALOG' "$TMP_DIR/catalog.js"
grep -q 'Release updates coming soon' "$TMP_DIR/app.js"
if grep -Eqi 'testflight\.apple\.com|play\.google\.com/apps/testing|public beta|closed test' "$TMP_DIR/home.html" "$TMP_DIR/catalog.js" "$TMP_DIR/app.js"; then
  printf 'Testing links or testing language leaked into the public showcase.\n' >&2
  exit 1
fi
grep -q '<title>Italianbros Co. — Digital Officina</title>' "$TMP_DIR/debug-apps.html"
grep -q '<title>Clay Scorecard Privacy Policy' "$TMP_DIR/clay-privacy.html"
grep -q 'does not collect or transmit personal data' "$TMP_DIR/clay-privacy.html"
grep -q '<title>Clay Scorecard Support' "$TMP_DIR/clay-support.html"
grep -q 'ciminillo@italianbrosco.com' "$TMP_DIR/clay-support.html"
grep -q '<title>Road Trip Arcade Privacy Policy' "$TMP_DIR/road-trip-privacy.html"
grep -q 'does not collect or transmit personal data' "$TMP_DIR/road-trip-privacy.html"
grep -q '<title>Road Trip Arcade Support' "$TMP_DIR/road-trip-support.html"
grep -q 'ciminillo@italianbrosco.com' "$TMP_DIR/road-trip-support.html"
grep -q '<title>Tin Wings Privacy Policy' "$TMP_DIR/tin-wings-privacy.html"
grep -q 'temporary room and gameplay state' "$TMP_DIR/tin-wings-privacy.html"
grep -q '<title>Tin Wings Support' "$TMP_DIR/tin-wings-support.html"
grep -q 'ciminillo@italianbrosco.com' "$TMP_DIR/tin-wings-support.html"
grep -q '<title>Shared Deal — Deal Analyzer</title>' "$TMP_DIR/deal-viewer.html"
grep -q 'class="header-title">Shared Deal' "$TMP_DIR/deal-viewer.html"
grep -q 'styles.css?v=20260813.1' "$TMP_DIR/deal-viewer.html"
grep -q 'id="results-heading">RESULTS' "$TMP_DIR/deal-viewer.html"

for icon in abc-smash calcspace clay-scorecard deal-analyzer dream-journal easy-audio-notes echobeat eyes-up hundred mortgage-calculator pollwar real-or-ai road-trip-arcade super-game tin-wings; do
  curl -fsSL "$BASE_URL/assets/icons/$icon.webp" -o "$TMP_DIR/$icon.webp"
  test -s "$TMP_DIR/$icon.webp"
done

printf 'Verified %s: showcase, catalog, 15 icons, shared Deal Analyzer viewer, Tin Wings, Road Trip Arcade, and Clay Scorecard legal pages, and preserved /debug/apps page.\n' "$BASE_URL"

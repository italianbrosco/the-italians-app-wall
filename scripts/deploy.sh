#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
REMOTE=${ITALIANBROS_SITE_REMOTE:-do-server}
TARGET=${ITALIANBROS_SITE_TARGET:-/var/www/landing}
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
BACKUP_ROOT=${ITALIANBROS_SITE_BACKUP_ROOT:-/var/backups/italianbros-landing}
REMOTE_STAGE=""

cleanup() {
  if [ -n "$REMOTE_STAGE" ]; then
    ssh "$REMOTE" "rm -rf '$REMOTE_STAGE'" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT HUP INT TERM

cd "$ROOT"
node scripts/verify-catalog.mjs
node scripts/verify-deal-viewer.mjs

REMOTE_STAGE=$(ssh "$REMOTE" "mktemp -d /tmp/italianbros-site.XXXXXX")
case "$REMOTE_STAGE" in
  /tmp/italianbros-site.*) ;;
  *) printf 'Unexpected remote staging path: %s\n' "$REMOTE_STAGE" >&2; exit 1 ;;
esac

rsync -az \
  index.html styles.css catalog.js app.js app-ads.txt \
  .well-known assets debug abc-smash are-you-human blackwake-21 clay-scorecard dont-touch-red marbles pt-airman road-trip-arcade tin-wings underworld-21 dealanalyzer yawtzee \
  "$REMOTE:$REMOTE_STAGE/"

ssh "$REMOTE" "set -eu
  sudo install -d -m 755 '$TARGET' '$TARGET/.well-known' '$TARGET/assets' '$TARGET/assets/icons' '$TARGET/debug' '$TARGET/debug/apps' '$TARGET/abc-smash' '$TARGET/are-you-human' '$TARGET/blackwake-21' '$TARGET/clay-scorecard' '$TARGET/dont-touch-red' '$TARGET/marbles' '$TARGET/pt-airman' '$TARGET/road-trip-arcade' '$TARGET/tin-wings' '$TARGET/underworld-21' '$TARGET/dealanalyzer' '$TARGET/yawtzee' '$BACKUP_ROOT/$STAMP'
  if [ ! -f '$TARGET/debug/apps/index.html' ]; then
    sudo install -m 644 '$TARGET/index.html' '$TARGET/debug/apps/index.html'
  fi
  for file in index.html styles.css catalog.js app.js app-ads.txt; do
    if [ -f '$TARGET/'\"\$file\" ]; then sudo cp -a '$TARGET/'\"\$file\" '$BACKUP_ROOT/$STAMP/'; fi
  done
  sudo install -m 644 '$REMOTE_STAGE/index.html' '$TARGET/index.html'
  sudo install -m 644 '$REMOTE_STAGE/styles.css' '$TARGET/styles.css'
  sudo install -m 644 '$REMOTE_STAGE/catalog.js' '$TARGET/catalog.js'
  sudo install -m 644 '$REMOTE_STAGE/app.js' '$TARGET/app.js'
  sudo install -m 644 '$REMOTE_STAGE/app-ads.txt' '$TARGET/app-ads.txt'
  sudo cp -R '$REMOTE_STAGE/.well-known/.' '$TARGET/.well-known/'
  sudo cp -R '$REMOTE_STAGE/assets/.' '$TARGET/assets/'
  sudo rm -f \
    '$TARGET/assets/brand/three-brothers-fountain.png' \
    '$TARGET/assets/brand/three-brothers-fountain.webp' \
    '$TARGET/assets/brand/three-brothers-ink.webp'
  sudo cp -R '$REMOTE_STAGE/debug/.' '$TARGET/debug/'
  sudo cp -R '$REMOTE_STAGE/abc-smash/.' '$TARGET/abc-smash/'
  sudo cp -R '$REMOTE_STAGE/are-you-human/.' '$TARGET/are-you-human/'
  sudo cp -R '$REMOTE_STAGE/blackwake-21/.' '$TARGET/blackwake-21/'
  sudo cp -R '$REMOTE_STAGE/clay-scorecard/.' '$TARGET/clay-scorecard/'
  sudo cp -R '$REMOTE_STAGE/dont-touch-red/.' '$TARGET/dont-touch-red/'
  sudo cp -R '$REMOTE_STAGE/marbles/.' '$TARGET/marbles/'
  sudo cp -R '$REMOTE_STAGE/pt-airman/.' '$TARGET/pt-airman/'
  sudo cp -R '$REMOTE_STAGE/road-trip-arcade/.' '$TARGET/road-trip-arcade/'
  sudo cp -R '$REMOTE_STAGE/tin-wings/.' '$TARGET/tin-wings/'
  sudo cp -R '$REMOTE_STAGE/underworld-21/.' '$TARGET/underworld-21/'
  sudo cp -R '$REMOTE_STAGE/dealanalyzer/.' '$TARGET/dealanalyzer/'
  sudo cp -R '$REMOTE_STAGE/yawtzee/.' '$TARGET/yawtzee/'
  sudo chmod -R a+rX '$TARGET/.well-known' '$TARGET/assets' '$TARGET/debug' '$TARGET/abc-smash' '$TARGET/are-you-human' '$TARGET/blackwake-21' '$TARGET/clay-scorecard' '$TARGET/dont-touch-red' '$TARGET/marbles' '$TARGET/pt-airman' '$TARGET/road-trip-arcade' '$TARGET/tin-wings' '$TARGET/underworld-21' '$TARGET/dealanalyzer' '$TARGET/yawtzee'
"

printf 'Deployed Italian Bros showcase to %s:%s (backup %s/%s).\n' "$REMOTE" "$TARGET" "$BACKUP_ROOT" "$STAMP"

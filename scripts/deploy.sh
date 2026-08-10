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

REMOTE_STAGE=$(ssh "$REMOTE" "mktemp -d /tmp/italianbros-site.XXXXXX")
case "$REMOTE_STAGE" in
  /tmp/italianbros-site.*) ;;
  *) printf 'Unexpected remote staging path: %s\n' "$REMOTE_STAGE" >&2; exit 1 ;;
esac

rsync -az \
  index.html styles.css catalog.js app.js \
  assets debug \
  "$REMOTE:$REMOTE_STAGE/"

ssh "$REMOTE" "set -eu
  sudo install -d -m 755 '$TARGET' '$TARGET/assets' '$TARGET/assets/icons' '$TARGET/debug' '$TARGET/debug/apps' '$BACKUP_ROOT/$STAMP'
  if [ ! -f '$TARGET/debug/apps/index.html' ]; then
    sudo install -m 644 '$TARGET/index.html' '$TARGET/debug/apps/index.html'
  fi
  for file in index.html styles.css catalog.js app.js; do
    if [ -f '$TARGET/'\"\$file\" ]; then sudo cp -a '$TARGET/'\"\$file\" '$BACKUP_ROOT/$STAMP/'; fi
  done
  sudo install -m 644 '$REMOTE_STAGE/index.html' '$TARGET/index.html'
  sudo install -m 644 '$REMOTE_STAGE/styles.css' '$TARGET/styles.css'
  sudo install -m 644 '$REMOTE_STAGE/catalog.js' '$TARGET/catalog.js'
  sudo install -m 644 '$REMOTE_STAGE/app.js' '$TARGET/app.js'
  sudo cp -R '$REMOTE_STAGE/assets/.' '$TARGET/assets/'
  sudo cp -R '$REMOTE_STAGE/debug/.' '$TARGET/debug/'
  sudo chmod -R a+rX '$TARGET/assets' '$TARGET/debug'
"

printf 'Deployed Italian Bros showcase to %s:%s (backup %s/%s).\n' "$REMOTE" "$TARGET" "$BACKUP_ROOT" "$STAMP"

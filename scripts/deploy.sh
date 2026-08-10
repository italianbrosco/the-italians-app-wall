#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
REMOTE=${ITALIANBROS_SITE_REMOTE:-do-server}
TARGET=${ITALIANBROS_SITE_TARGET:-/var/www/landing}
STAMP=$(date -u +%Y%m%dT%H%M%SZ)

cd "$ROOT"
node scripts/verify-catalog.mjs

ssh "$REMOTE" "set -eu; mkdir -p '$TARGET/debug/apps' '$TARGET/backups/$STAMP'; if [ ! -f '$TARGET/debug/apps/index.html' ]; then cp '$TARGET/index.html' '$TARGET/debug/apps/index.html'; fi; cp '$TARGET/index.html' '$TARGET/backups/$STAMP/index.html'"

rsync -az \
  index.html styles.css catalog.js app.js \
  assets debug \
  "$REMOTE:$TARGET/"

printf 'Deployed Italian Bros showcase to %s:%s (backup %s).\n' "$REMOTE" "$TARGET" "$STAMP"

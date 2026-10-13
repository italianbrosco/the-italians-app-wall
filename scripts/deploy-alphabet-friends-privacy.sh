#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
REMOTE=do-server
TARGET=/var/www/landing/alphabet-friends
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
STAGE=$(ssh "$REMOTE" 'mktemp -d /tmp/alphabet-friends-privacy.XXXXXX')
case "$STAGE" in /tmp/alphabet-friends-privacy.*) ;; *) exit 1 ;; esac
cleanup() { ssh "$REMOTE" "rm -f '$STAGE/index.html' '$STAGE/legal.css'; rmdir '$STAGE'" >/dev/null 2>&1 || true; }
trap cleanup EXIT HUP INT TERM
scp "$ROOT/alphabet-friends/privacy/index.html" "$REMOTE:$STAGE/index.html"
scp "$ROOT/alphabet-friends/legal.css" "$REMOTE:$STAGE/legal.css"
ssh "$REMOTE" "set -eu
 if [ -d '$TARGET' ]; then
  sudo install -d -m 755 '/var/backups/italianbros-alphabet-friends-policy'
  sudo cp -a '$TARGET' '/var/backups/italianbros-alphabet-friends-policy/$STAMP'
 fi
 sudo install -d -m 755 '$TARGET/privacy'
 sudo install -m 644 '$STAGE/index.html' '$TARGET/privacy/index.html'
 sudo install -m 644 '$STAGE/legal.css' '$TARGET/legal.css'
"
printf 'Published https://italianbrosco.com/alphabet-friends/privacy/\n'

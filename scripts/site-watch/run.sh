#!/usr/bin/env bash
# Thin wrapper so a Cursor Automation can call scripts/site-watch/run.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
exec python3 "$ROOT/scripts/site-watch/watch.py" "$@"

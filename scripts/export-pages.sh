#!/usr/bin/env bash
# Static export for GitHub Pages. WHOOP API routes are server-only — park them.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
API_HOLD="$(mktemp -d)"
cleanup() {
  if [ -d "$API_HOLD/api" ]; then
    rm -rf "$ROOT/app/api"
    mv "$API_HOLD/api" "$ROOT/app/api"
  fi
  rmdir "$API_HOLD" 2>/dev/null || true
}
trap cleanup EXIT
mv "$ROOT/app/api" "$API_HOLD/api"
GITHUB_PAGES=1 ./node_modules/.bin/next build
touch "$ROOT/out/.nojekyll"

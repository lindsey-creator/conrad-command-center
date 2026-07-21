#!/usr/bin/env bash
# First-time dev setup: sibling Goldfront-os + npm install.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PARENT="$(dirname "$ROOT")"
BRAIN_DIR="${GOLDFRONT_OS:-$PARENT/Goldfront-os}"

if [[ ! -d "$BRAIN_DIR/brain" ]]; then
  echo "Cloning Goldfront-os next to conrad-command-center..."
  git clone https://github.com/lindsey-creator/Goldfront-os.git "$BRAIN_DIR"
fi

LINK="$PARENT/conrad-command-center"
if [[ "$ROOT" != "$LINK" ]]; then
  ln -sfn "$ROOT" "$LINK" 2>/dev/null || true
fi

cd "$ROOT"
npm ci
echo "Ready. Run: ./scripts/run-stack.sh"

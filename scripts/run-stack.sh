#!/usr/bin/env bash
# Build Command Center and run Goldfront-os Brain (single port serves UI + API).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BRAIN_DIR="${GOLDFRONT_OS:-$(dirname "$ROOT")/Goldfront-os}"
CC_DIR="$ROOT"
PORT="${PORT:-8000}"
HOST="${HOST:-127.0.0.1}"

if [[ ! -d "$BRAIN_DIR/brain" ]]; then
  echo "Goldfront-os not found at: $BRAIN_DIR"
  echo "Clone it: git clone https://github.com/lindsey-creator/Goldfront-os.git \"$BRAIN_DIR\""
  exit 1
fi

echo "Building Command Center..."
cd "$CC_DIR"
npm ci
npm run build

# Brain resolves dist at ../conrad-command-center/dist relative to Goldfront-os repo root.
BRAIN_PARENT="$(dirname "$BRAIN_DIR")"
LINK="$BRAIN_PARENT/conrad-command-center"
if [[ "$CC_DIR" != "$LINK" ]]; then
  if [[ -L "$LINK" || ! -e "$LINK" ]]; then
    ln -sfn "$CC_DIR" "$LINK"
    echo "Linked $LINK -> $CC_DIR"
  elif [[ "$LINK/dist/index.html" != "$CC_DIR/dist/index.html" ]]; then
    echo "Warning: $LINK exists and is not this repo — Brain may serve the wrong dist."
  fi
fi

echo "Starting Brain on http://${HOST}:${PORT} ..."
cd "$BRAIN_DIR"
if [[ -d .venv ]]; then
  # shellcheck disable=SC1091
  source .venv/bin/activate
fi
exec python3 -m uvicorn brain.main:app --host "$HOST" --port "$PORT"

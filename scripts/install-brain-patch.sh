#!/usr/bin/env bash
# Apply Superman Brain patches to a local Goldfront-os checkout.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LEGACY_PATCH="$ROOT/goldfront-os-additions/brain-changes.patch"
COUNCIL_PATCH="$ROOT/goldfront-os-additions/patches/0001-Executive-Council-daily-scan-live-chat-context-Gmail.patch"
BRAIN_DIR="${1:-../Goldfront-os}"

if [[ ! -d "$BRAIN_DIR/.git" ]]; then
  echo "Usage: $0 [path-to-Goldfront-os]"
  echo "Goldfront-os not found at: $BRAIN_DIR"
  exit 1
fi

cd "$BRAIN_DIR"

if [[ -f "$LEGACY_PATCH" ]] && ! rg -q 'approvals/pending' brain/main.py 2>/dev/null; then
  echo "Applying legacy Command Center patch …"
  git apply "$LEGACY_PATCH"
fi

if [[ -f "$COUNCIL_PATCH" ]] && ! rg -q '/council/scan' brain/main.py 2>/dev/null; then
  echo "Applying Executive Council / live context patch …"
  git apply "$COUNCIL_PATCH"
elif rg -q '/council/scan' brain/main.py 2>/dev/null; then
  echo "Executive Council already installed."
fi

echo "Running tests …"
python3 -m pytest tests/test_council.py tests/test_live_context.py -q
echo "Done. Restart: uvicorn brain.main:app --host 0.0.0.0 --port 8000"

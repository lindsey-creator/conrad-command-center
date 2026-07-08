#!/usr/bin/env bash
# Apply Command Center Brain endpoints to a local Goldfront-os checkout.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PATCH="$ROOT/goldfront-os-additions/brain-changes.patch"
BRAIN_DIR="${1:-../Goldfront-os}"

if [[ ! -d "$BRAIN_DIR/.git" ]]; then
  echo "Usage: $0 [path-to-Goldfront-os]"
  echo "Goldfront-os not found at: $BRAIN_DIR"
  exit 1
fi

if [[ ! -f "$PATCH" ]]; then
  echo "Patch not found: $PATCH"
  exit 1
fi

cd "$BRAIN_DIR"
echo "Applying patch in $BRAIN_DIR ..."
git apply "$PATCH"
echo "Running tests ..."
python3 -m pytest -q
echo "Done. Restart the Brain: uvicorn brain.main:app --host 0.0.0.0 --port 8000"

#!/usr/bin/env bash
# Hit core Brain endpoints (Brain must already be running).
set -euo pipefail

BASE="${1:-http://127.0.0.1:8000}"

paths=(
  /health
  /connectors/status
  /brief/daily
  /approvals/pending
  /ads/meta
  /weather
  /connect/google/status
  /connect/whoop/status
)

for path in "${paths[@]}"; do
  code=$(curl -s -o /tmp/smoke.json -w "%{http_code}" "${BASE}${path}")
  if [[ "$code" != "200" ]]; then
    echo "FAIL $path HTTP $code"
    cat /tmp/smoke.json
    exit 1
  fi
  echo "OK   $path"
done

code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/")
if [[ "$code" != "200" ]]; then
  echo "FAIL / (UI) HTTP $code — run npm run build and sibling conrad-command-center link"
  exit 1
fi
echo "OK   / (Command Center UI)"

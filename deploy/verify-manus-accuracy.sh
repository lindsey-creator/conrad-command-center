#!/usr/bin/env bash
# Confirm public URLs serve Brain + Echo Command UI (not legacy static HTML).
set -euo pipefail

check_health() {
  local label="$1"
  local url="$2"
  local body
  body="$(curl -sf --max-time 15 "$url" 2>/dev/null || true)"
  if echo "$body" | python3 -c "import sys,json; json.load(sys.stdin)" 2>/dev/null; then
    echo "OK   $label  $url"
    return 0
  fi
  echo "FAIL $label  $url"
  echo "     Expected JSON health; got: $(echo "$body" | head -c 120)"
  return 1
}

check_ui() {
  local label="$1"
  local url="$2"
  local html
  html="$(curl -sf --max-time 15 "$url" 2>/dev/null || true)"
  if echo "$html" | grep -qi 'Echo Command'; then
    echo "OK   $label UI title (Echo Command)"
    return 0
  fi
  if echo "$html" | grep -qi 'Conrad Command Center' && ! echo "$html" | grep -q 'id="root"'; then
    echo "FAIL $label still serving LEGACY static dashboard HTML"
    echo "     Run: bash deploy/manus-accurate.sh on Manus"
    return 1
  fi
  if echo "$html" | grep -q 'id="root"'; then
    echo "OK   $label React shell (id=root)"
    return 0
  fi
  echo "WARN $label could not classify UI at $url"
  return 0
}

FAIL=0
check_health "local Brain" "http://127.0.0.1:8000/health" || FAIL=1
check_ui "local Brain" "http://127.0.0.1:8000/" || FAIL=1

for host in command.theconradteam.com commandcenter.theconradteam.com conradstrong.com; do
  check_health "public $host" "https://${host}/health" || FAIL=1
  check_ui "public $host" "https://${host}/" || FAIL=1
done

exit "$FAIL"

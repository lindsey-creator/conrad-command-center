#!/usr/bin/env bash
# Confirm Brain + Echo Command UI (not legacy static HTML).
# Exit 0 = all checks pass
# Exit 2 = local OK, public failed (Cloudflare / DNS)
# Exit 1 = local failed
set -euo pipefail

VERIFY_PUBLIC="${VERIFY_PUBLIC:-1}"

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
  echo "     Expected JSON; got: $(echo "$body" | head -c 100)"
  return 1
}

check_ui() {
  local label="$1"
  local url="$2"
  local html
  html="$(curl -sf --max-time 15 "$url" 2>/dev/null || true)"
  if echo "$html" | grep -qi 'Conrad Command Center'; then
    echo "OK   $label UI (Conrad Command Center / Jarvis)"
    return 0
  fi
  if echo "$html" | grep -qi 'Conrad Command Center' && ! echo "$html" | grep -q 'id="root"'; then
    echo "FAIL $label LEGACY static dashboard — nginx still wrong"
    return 1
  fi
  if echo "$html" | grep -q 'id="root"'; then
    echo "OK   $label UI (React dist)"
    return 0
  fi
  echo "WARN $label unclassified HTML"
  return 0
}

LOCAL_FAIL=0
PUBLIC_FAIL=0

check_health "local /health" "http://127.0.0.1:8000/health" || LOCAL_FAIL=1
check_ui "local /" "http://127.0.0.1:8000/" || LOCAL_FAIL=1

if [ "$LOCAL_FAIL" -ne 0 ]; then
  exit 1
fi

if [ "$VERIFY_PUBLIC" != "1" ]; then
  exit 0
fi

# Optional: VERIFY_HOSTS="command.theconradteam.com conradstrong.com"
HOSTS="${VERIFY_HOSTS:-command.theconradteam.com commandcenter.theconradteam.com conradstrong.com}"

for host in $HOSTS; do
  if ! getent hosts "$host" >/dev/null 2>&1 && ! host "$host" >/dev/null 2>&1; then
    echo "SKIP public $host (no DNS)"
    continue
  fi
  check_health "public $host" "https://${host}/health" || PUBLIC_FAIL=1
  check_ui "public $host" "https://${host}/" || PUBLIC_FAIL=1
done

if [ "$PUBLIC_FAIL" -ne 0 ]; then
  exit 2
fi
exit 0

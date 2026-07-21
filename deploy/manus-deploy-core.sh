#!/usr/bin/env bash
# Ordered Manus deploy (steps 1–7). Sourced by manus-accurate.sh — do not curl this alone.
set -euo pipefail

BRAIN_PARENT="${BRAIN_PARENT:-$HOME/Documents/Claude/Projects/Brain}"
BRAIN_DIR="${BRAIN_DIR:-$BRAIN_PARENT/goldfront-os}"
UI_DIR="${UI_DIR:-$BRAIN_PARENT/conrad-command-center}"
DEPLOY_DIR="${DEPLOY_DIR:-$UI_DIR/deploy}"

step() { echo ""; echo "==> [$1/7] $2"; }

die() { echo "ERROR: $*" >&2; exit 1; }

step 1 "Connector env (merge legacy dashboard → Brain .env)"
if [ -f "$BRAIN_DIR/deploy/reuse_manus_env.sh" ]; then
  BRAIN_DIR="$BRAIN_DIR" bash "$BRAIN_DIR/deploy/reuse_manus_env.sh"
else
  [ -f "$BRAIN_DIR/.env" ] || cp "$BRAIN_DIR/.env.example" "$BRAIN_DIR/.env"
  echo "    reuse_manus_env.sh not found — using existing .env"
fi

# Production: same-origin API (empty VITE_BRAIN_API)
echo "VITE_BRAIN_API=" > "$UI_DIR/.env"
echo "VITE_BRAIN_POLL_MS=30000" >> "$UI_DIR/.env"

step 2 "Build Command Center (React → dist/)"
for cmd in python3 node npm curl; do command -v "$cmd" >/dev/null || die "Install $cmd"; done
( cd "$UI_DIR" && npm ci && npm run build )
[ -f "$UI_DIR/dist/index.html" ] || die "UI build failed — missing dist/index.html"

step 3 "Python venv + Brain dependencies"
cd "$BRAIN_DIR"
[ -d .venv ] || python3 -m venv .venv
# shellcheck disable=SC1091
source .venv/bin/activate
pip install -q -U pip
pip install -q -r requirements.txt

step 4 "systemd superman-brain (always-on on :8000)"
systemd_ok=false
if command -v systemctl >/dev/null 2>&1 && systemctl is-system-running --quiet 2>/dev/null; then
  systemd_ok=true
fi

if $systemd_ok; then
  sudo tee /etc/systemd/system/superman-brain.service >/dev/null <<UNIT
[Unit]
Description=Superman Brain (Goldfront OS + Command Center)
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$BRAIN_DIR
Environment=GOLDFRONT_OWNER=lindsey
EnvironmentFile=-$BRAIN_DIR/.env
ExecStart=$BRAIN_DIR/.venv/bin/uvicorn brain.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
UNIT
  sudo systemctl daemon-reload
  sudo systemctl enable superman-brain
  sudo systemctl restart superman-brain
  sleep 2
  sudo systemctl is-active superman-brain >/dev/null || {
    journalctl -u superman-brain -n 30 --no-pager || true
    die "superman-brain failed to start"
  }
else
  echo "    systemd not running — start Brain in foreground or use existing :8000"
  if ! curl -sf "http://127.0.0.1:8000/health" >/dev/null 2>&1; then
    cd "$BRAIN_DIR"
    # shellcheck disable=SC1091
    source .venv/bin/activate
    nohup uvicorn brain.main:app --host 0.0.0.0 --port 8000 >>"$BRAIN_DIR/brain.log" 2>&1 &
    sleep 2
  fi
fi

step 5 "Local health check"
HEALTH="$(curl -sf "http://127.0.0.1:8000/health" 2>/dev/null || true)"
echo "$HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); assert d.get('status')=='ok'" 2>/dev/null \
  || die "Brain /health failed on :8000 — journalctl -u superman-brain -n 40"

step 6 "nginx → :8000 (disable legacy static dashboard)"
bash "$DEPLOY_DIR/manus-fix-nginx.sh"

step 7 "Connector status (never print secrets)"
STATUS="$(curl -sf "http://127.0.0.1:8000/connectors/status" 2>/dev/null || true)"
if [ -n "$STATUS" ]; then
  echo "$STATUS" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f\"    connected: {d.get('connected_count', 0)}/{d.get('total', 0)}\")
for name, c in sorted(d.get('connectors', {}).items()):
    flag = 'live' if c.get('connected') else 'connect_source'
    print(f'    {name}: {flag}')
" 2>/dev/null || true
fi

echo ""
echo "Core deploy complete. UI: http://127.0.0.1:8000/"

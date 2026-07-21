#!/usr/bin/env bash
# Run ON THE MANUS BOX (Manus terminal or Manus AI with shell access).
# Makes command.theconradteam.com match the Echo Command Center on GitHub main.
#
# One line:
#   curl -fsSL https://raw.githubusercontent.com/lindsey-creator/conrad-command-center/main/deploy/manus-accurate.sh | bash
set -euo pipefail

BRAIN_PARENT="${BRAIN_PARENT:-$HOME/Documents/Claude/Projects/Brain}"
BRAIN_DIR="$BRAIN_PARENT/goldfront-os"
UI_DIR="$BRAIN_PARENT/conrad-command-center"
GO_URL="${GO_URL:-https://github.com/lindsey-creator/Goldfront-os.git}"
CC_URL="${CC_URL:-https://github.com/lindsey-creator/conrad-command-center.git}"

echo "=============================================="
echo " Manus accurate deploy — Echo Command Center"
echo "=============================================="

mkdir -p "$BRAIN_PARENT"
cd "$BRAIN_PARENT"

if [ -d goldfront-os/.git ]; then
  (cd goldfront-os && git pull --ff-only)
else
  git clone "$GO_URL" goldfront-os
fi

if [ -d conrad-command-center/.git ]; then
  (cd conrad-command-center && git pull --ff-only)
else
  git clone "$CC_URL" conrad-command-center
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || echo "$UI_DIR/deploy")"
# When piped from curl, BASH_SOURCE may be empty — use freshly cloned UI deploy/
if [ ! -f "$SCRIPT_DIR/manus-fix-nginx.sh" ]; then
  SCRIPT_DIR="$UI_DIR/deploy"
fi

if [ -f "$BRAIN_DIR/deploy/FINISH_ON_MANUS.sh" ]; then
  echo "==> Standard Manus finish (build, systemd, env merge)"
  bash "$BRAIN_DIR/deploy/FINISH_ON_MANUS.sh"
else
  echo "==> FINISH_ON_MANUS.sh missing — minimal build"
  for cmd in python3 node npm curl; do command -v "$cmd" >/dev/null; done
  [ -f "$BRAIN_DIR/deploy/reuse_manus_env.sh" ] && bash "$BRAIN_DIR/deploy/reuse_manus_env.sh" || true
  (cd "$UI_DIR" && npm ci && npm run build)
  cd "$BRAIN_DIR"
  [ -d .venv ] || python3 -m venv .venv
  # shellcheck disable=SC1091
  source .venv/bin/activate
  pip install -q -U pip && pip install -q -r requirements.txt
  sudo systemctl restart superman-brain 2>/dev/null || \
    uvicorn brain.main:app --host 0.0.0.0 --port 8000 &
fi

echo "==> Nginx: proxy domains to :8000 (fix legacy static dashboard)"
bash "$SCRIPT_DIR/manus-fix-nginx.sh"

echo "==> Accuracy verification"
if bash "$SCRIPT_DIR/verify-manus-accuracy.sh"; then
  echo "=============================================="
  echo " ACCURATE — public site matches Echo Command"
  echo "=============================================="
else
  echo "=============================================="
  echo " INCOMPLETE — local OK but public URL may need:"
  echo "   • Cloudflare Tunnel (Manus blocks inbound 443)"
  echo "     see Goldfront-os/deploy/CLOUDFLARE-CONRADSTRONG.md"
  echo "   • Or DNS + certbot on nginx-conradstrong.com.conf"
  echo "=============================================="
  exit 1
fi

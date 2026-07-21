#!/usr/bin/env bash
# One command on Manus — ordered deploy end-to-end.
#   curl -fsSL https://raw.githubusercontent.com/lindsey-creator/conrad-command-center/main/deploy/manus-accurate.sh | bash
set -euo pipefail

BRAIN_PARENT="${BRAIN_PARENT:-$HOME/Documents/Claude/Projects/Brain}"
BRAIN_DIR="$BRAIN_PARENT/goldfront-os"
UI_DIR="$BRAIN_PARENT/conrad-command-center"
GO_URL="${GO_URL:-https://github.com/lindsey-creator/Goldfront-os.git}"
CC_URL="${CC_URL:-https://github.com/lindsey-creator/conrad-command-center.git}"

echo "=============================================="
echo " Echo Command — Manus deploy (ordered)"
echo " See deploy/ORDER.md for the full checklist"
echo "=============================================="

mkdir -p "$BRAIN_PARENT"
cd "$BRAIN_PARENT"

echo "==> [0/7] git pull both repos"
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

DEPLOY_DIR="$UI_DIR/deploy"
export BRAIN_PARENT BRAIN_DIR UI_DIR DEPLOY_DIR

bash "$DEPLOY_DIR/manus-deploy-core.sh"

echo ""
echo "==> Verification"
VERIFY_PUBLIC="${VERIFY_PUBLIC:-1}" bash "$DEPLOY_DIR/verify-manus-accuracy.sh"
EXIT=$?

if [ "$EXIT" -eq 0 ]; then
  echo "=============================================="
  echo " DONE — local + public accurate"
  echo " https://command.theconradteam.com"
  echo "=============================================="
elif [ "$EXIT" -eq 2 ]; then
  echo "=============================================="
  echo " DONE locally — public URL needs Cloudflare Tunnel"
  echo " sudo bash $BRAIN_DIR/deploy/cloudflared-manus.sh"
  echo " See $BRAIN_DIR/deploy/CLOUDFLARE-CONRADSTRONG.md"
  echo "=============================================="
  exit 0
else
  exit 1
fi

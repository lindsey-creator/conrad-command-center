#!/usr/bin/env bash
# Point command.* / conradstrong.com at uvicorn :8000 (not /var/www/dashboard static).
set -euo pipefail

BRAIN_PARENT="${BRAIN_PARENT:-$HOME/Documents/Claude/Projects/Brain}"
BRAIN_DIR="${BRAIN_DIR:-$BRAIN_PARENT/goldfront-os}"
command -v nginx >/dev/null || { echo "nginx not installed — skip"; exit 0; }

echo "==> Disabling legacy static dashboard nginx sites (if any)"
for f in /etc/nginx/sites-enabled/*; do
  [ -f "$f" ] || continue
  if sudo grep -q 'root /var/www/dashboard' "$f" 2>/dev/null; then
    echo "    disable $(basename "$f") (static dashboard)"
    sudo rm -f "$f"
  fi
done

CONF_SRC="$BRAIN_DIR/deploy/nginx-conradstrong.com.conf"
SITE="/etc/nginx/sites-available/conradstrong.com"

if [ -f "$CONF_SRC" ] && [ -f "/etc/letsencrypt/live/conradstrong.com/fullchain.pem" ]; then
  echo "==> Installing $CONF_SRC (TLS + all hostnames → :8000)"
  sudo cp "$CONF_SRC" "$SITE"
elif [ -f "/etc/letsencrypt/live/command.theconradteam.com/fullchain.pem" ]; then
  echo "==> Installing command.theconradteam.com proxy (TLS)"
  sudo tee /etc/nginx/sites-available/command.theconradteam.com >/dev/null <<'NGX'
server { listen 80; server_name command.theconradteam.com commandcenter.theconradteam.com; return 301 https://$host$request_uri; }
server {
    listen 443 ssl http2;
    server_name command.theconradteam.com commandcenter.theconradteam.com;
    ssl_certificate /etc/letsencrypt/live/command.theconradteam.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/command.theconradteam.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-ssl.conf 2>/dev/null || include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
    }
}
NGX
  sudo ln -sf /etc/nginx/sites-available/command.theconradteam.com /etc/nginx/sites-enabled/command.theconradteam.com
else
  echo "==> Installing HTTP proxy (no cert yet) for command + conradstrong hostnames"
  sudo tee "$SITE" >/dev/null <<'NGX'
server {
    listen 80;
    server_name conradstrong.com www.conradstrong.com commandcenter.theconradteam.com command.theconradteam.com;
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
    }
}
NGX
fi

sudo ln -sf "$SITE" /etc/nginx/sites-enabled/conradstrong.com 2>/dev/null || true
sudo nginx -t
sudo systemctl reload nginx
echo "==> nginx reloaded"

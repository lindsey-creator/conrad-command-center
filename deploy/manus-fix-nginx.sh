#!/usr/bin/env bash
# Point command.* / conradstrong.com at uvicorn :8000 (not /var/www/dashboard static).
set -euo pipefail

BRAIN_PARENT="${BRAIN_PARENT:-$HOME/Documents/Claude/Projects/Brain}"
BRAIN_DIR="${BRAIN_DIR:-$BRAIN_PARENT/goldfront-os}"
command -v nginx >/dev/null || { echo "nginx not installed — skip"; exit 0; }

echo "    Disable legacy static dashboard nginx sites"
for f in /etc/nginx/sites-enabled/*; do
  [ -e "$f" ] || continue
  if sudo grep -qE 'root /var/www/dashboard|alias /var/www/dashboard' "$f" 2>/dev/null; then
    echo "      remove $(basename "$f")"
    sudo rm -f "$f"
  fi
done

CONF_SRC="$BRAIN_DIR/deploy/nginx-conradstrong.com.conf"
SITE="/etc/nginx/sites-available/conradstrong.com"

install_proxy_block() {
  local cert_name="$1"
  sudo tee "$SITE" >/dev/null <<NGX
server {
    listen 80;
    server_name conradstrong.com www.conradstrong.com commandcenter.theconradteam.com command.theconradteam.com;
    return 301 https://\$host\$request_uri;
}
server {
    listen 443 ssl http2;
    server_name conradstrong.com www.conradstrong.com commandcenter.theconradteam.com command.theconradteam.com;
    ssl_certificate     /etc/letsencrypt/live/${cert_name}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${cert_name}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300s;
    }
}
NGX
}

if [ -f "$CONF_SRC" ] && [ -f "/etc/letsencrypt/live/conradstrong.com/fullchain.pem" ]; then
  echo "    Install nginx-conradstrong.com.conf (all hostnames → :8000)"
  sudo cp "$CONF_SRC" "$SITE"
elif [ -f "/etc/letsencrypt/live/command.theconradteam.com/fullchain.pem" ]; then
  echo "    Install unified TLS proxy (command + commandcenter hostnames)"
  install_proxy_block "command.theconradteam.com"
elif [ -f "/etc/letsencrypt/live/conradstrong.com/fullchain.pem" ]; then
  install_proxy_block "conradstrong.com"
else
  echo "    Install HTTP proxy (until certbot / Cloudflare tunnel)"
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

# Remove duplicate enabled sites so unified proxy wins (legacy static or old vhosts)
SITE_REAL="$(readlink -f "$SITE" 2>/dev/null || echo "$SITE")"
for stale in command.theconradteam.com commandcenter.theconradteam.com brain.theconradteam.com conradstrong.com default; do
  enabled="/etc/nginx/sites-enabled/$stale"
  [ -e "$enabled" ] || continue
  real="$(readlink -f "$enabled" 2>/dev/null || echo "$enabled")"
  if [ "$real" != "$SITE_REAL" ]; then
    echo "    remove duplicate nginx site: $stale"
    sudo rm -f "$enabled"
  fi
done

sudo ln -sf "$SITE" /etc/nginx/sites-enabled/conradstrong.com
sudo nginx -t
sudo systemctl reload nginx
echo "    nginx reloaded"

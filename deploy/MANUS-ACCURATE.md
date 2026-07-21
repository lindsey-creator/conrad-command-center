# Manus — make the live site match Echo Command Center

**Problem today:** `https://command.theconradteam.com` often serves **legacy static HTML** from `/var/www/dashboard` (old “Conrad Command Center”). The **accurate** product is the **React Echo Command** app built from this repo and served by **Superman Brain** on port **8000**.

**Symptom:** `curl https://command.theconradteam.com/health` returns HTML instead of:

```json
{"status":"ok","service":"goldfront-brain"}
```

---

## For Manus AI (paste this entire block into Manus terminal)

You are on the Manus box (`102.210.17.121`). Run the accurate deploy script from GitHub `main`:

```bash
curl -fsSL https://raw.githubusercontent.com/lindsey-creator/conrad-command-center/main/deploy/manus-accurate.sh | bash
```

What it does:

1. `git pull` **Goldfront-os** + **conrad-command-center** under `~/Documents/Claude/Projects/Brain/`
2. Runs **`FINISH_ON_MANUS.sh`** — merges connector keys from `/var/www/dashboard/.env`, `npm run build`, Python venv, **systemd** `superman-brain`
3. **Fixes nginx** — disables static `root /var/www/dashboard` sites; proxies `command.theconradteam.com`, `commandcenter.theconradteam.com`, and `conradstrong.com` → `http://127.0.0.1:8000`
4. Runs **`verify-manus-accuracy.sh`** — `/health` must be JSON; `/` must be Echo Command (React), not legacy HTML

Do **not** print secret values from `.env`. If a connector is missing, leave the UI on **connect source** — never invent data.

---

## Manual path (same result)

```bash
export BRAIN_PARENT="$HOME/Documents/Claude/Projects/Brain"
bash "$BRAIN_PARENT/conrad-command-center/deploy/manus-accurate.sh"
```

---

## Public URL note (Manus network)

Manus may **block inbound 443** from the internet. If verify fails on `https://conradstrong.com/health` but **local** `http://127.0.0.1:8000/health` is OK:

1. Use **Cloudflare Tunnel** — `Goldfront-os/deploy/CLOUDFLARE-CONRADSTRONG.md`
2. Or run: `sudo bash ~/Documents/Claude/Projects/Brain/goldfront-os/deploy/cloudflared-manus.sh`

Legacy GoDaddy A records to `102.210.17.121` alone will **not** fix HTTPS timeouts.

---

## Verify (you or Manus)

```bash
curl -sf http://127.0.0.1:8000/health | python3 -m json.tool
curl -sf https://command.theconradteam.com/health | python3 -m json.tool
curl -s https://command.theconradteam.com/ | grep -o '<title>[^<]*'
# Expect: Echo Command · conradstrong.com  (NOT legacy inline dashboard)
```

---

## Connector accuracy

After deploy, open **Stack → Connections** on the live site. Google and Whoop OAuth redirect URIs come from the Brain (`/connect/google/status`) and must use the **public hostname** (e.g. `https://command.theconradteam.com/google/oauth/callback`), not localhost.

Keys still merge from:

- `goldfront-os/.env` (Brain)
- `/var/www/dashboard/.env` (legacy dashboard — via `reuse_manus_env.sh`)

See `Goldfront-os/deploy/CONNECT-EVERYTHING.md` for the full env list.

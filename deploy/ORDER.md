# Deploy order — Conrad Command Center + Superman Brain

Do these **in order**. Do not skip steps.

---

## A. Manus production (always-on box)

**Give this to Manus AI:** [`deploy/MANUS-AGENT-PROMPT.md`](MANUS-AGENT-PROMPT.md) (full copy-paste prompt).

**One command** (Manus terminal or Manus AI):

```bash
curl -fsSL https://raw.githubusercontent.com/lindsey-creator/conrad-command-center/main/deploy/manus-accurate.sh | bash
```

| Step | What happens |
|------|----------------|
| 0 | `git pull` **Goldfront-os** + **conrad-command-center** |
| 1 | Merge connector keys from `/var/www/dashboard/.env` → `goldfront-os/.env` |
| 2 | `npm ci && npm run build` → `conrad-command-center/dist/` |
| 3 | Python venv + `pip install -r requirements.txt` |
| 4 | **systemd** `superman-brain` on port **8000** |
| 5 | Local `/health` must return JSON |
| 6 | **nginx** proxies all command/conradstrong hostnames → `:8000` (disables legacy static `/var/www/dashboard`) |
| 7 | Print connector status (no secrets) |
| ✓ | **verify-manus-accuracy.sh** — local + public URLs |

**Folder layout on Manus:**

```
~/Documents/Claude/Projects/Brain/
├── goldfront-os/              ← Brain (FastAPI)
└── conrad-command-center/     ← UI source; dist/ served by Brain
```

**If verify says “local OK, public failed” (exit code 2 handled as success):**

Manus often blocks inbound HTTPS. Run Cloudflare Tunnel:

```bash
sudo bash ~/Documents/Claude/Projects/Brain/goldfront-os/deploy/cloudflared-manus.sh
```

See `Goldfront-os/deploy/CLOUDFLARE-CONRADSTRONG.md`.

---

## B. Mac / dev machine (local test)

```bash
git clone https://github.com/lindsey-creator/conrad-command-center.git
git clone https://github.com/lindsey-creator/Goldfront-os.git   # sibling folder
cd conrad-command-center
./scripts/setup-dev.sh    # optional: links + npm ci
./scripts/run-stack.sh    # build + uvicorn :8000
./scripts/smoke-test.sh http://127.0.0.1:8000
```

Open **http://127.0.0.1:8000**.

For hot reload: `VITE_BRAIN_API=http://127.0.0.1:8000 npm run dev` (port 5173).

---

## C. Connectors (after deploy works)

1. Open **Stack → Connections** on the live UI.
2. Add keys to `goldfront-os/.env` on Manus (or use Google/Whoop wizards).
3. `sudo systemctl restart superman-brain`
4. Modules flip from **Connect source** to **Live** — never fake data.

Full env list: `Goldfront-os/deploy/CONNECT-EVERYTHING.md`.

---

## D. Accuracy checks (must pass)

```bash
# On Manus:
curl -sf http://127.0.0.1:8000/health | python3 -m json.tool
curl -s http://127.0.0.1:8000/ | grep -o '<title>[^<]*'
# Echo Command · conradstrong.com

curl -sf https://command.theconradteam.com/health | python3 -m json.tool
# NOT HTML — must be JSON
```

---

## E. Do not use (outdated)

- Serving `/var/www/dashboard` static HTML for `command.theconradteam.com`
- `FINISH_ON_MANUS.sh` alone without **step 6 nginx fix** (wrong default `DOMAIN=brain.theconradteam.com`)
- Pointing GoDaddy A record at Manus IP without Cloudflare Tunnel (HTTPS timeout)

Use **`manus-accurate.sh`** instead — it runs the ordered core + nginx fix + verify.

---

## F. Repo map

| Repo | Role |
|------|------|
| **conrad-command-center** | React UI (this repo) |
| **Goldfront-os** | Brain API + serves `../conrad-command-center/dist` |

**API docs (local):** http://127.0.0.1:8000/docs

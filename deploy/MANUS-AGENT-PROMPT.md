# Manus AI — agent prompt (copy everything below)

You are on the **Manus box** (`102.210.17.121`). Your job is to make the **live** site match the **Echo Command Center** on GitHub — not the legacy static “Conrad Command Center” HTML.

## Rules

- Do **not** print secret values from `.env` files.
- Run commands in order; stop and report on failure.
- Never invent connector data — modules stay on “connect source” until keys exist.

## Step 1 — Ordered deploy (required)

```bash
curl -fsSL https://raw.githubusercontent.com/lindsey-creator/conrad-command-center/main/deploy/manus-accurate.sh | bash
```

If this fails, capture `journalctl -u superman-brain -n 50 --no-pager` and the last 30 lines of output.

## Step 2 — Accuracy checks (required)

```bash
curl -sf http://127.0.0.1:8000/health | python3 -m json.tool
curl -s http://127.0.0.1:8000/ | grep -o '<title>[^<]*'
curl -sf https://command.theconradteam.com/health | python3 -m json.tool
curl -s https://command.theconradteam.com/ | grep -o '<title>[^<]*'
```

**Pass criteria:**

| Check | Pass |
|-------|------|
| Local `/health` | JSON with `"status":"ok"` |
| Local `/` title | Contains **Echo Command** |
| Public `/health` | JSON (not HTML) |
| Public `/` title | **Echo Command**, not legacy inline dashboard |

## Step 3 — If public HTTPS fails but local passes

Manus often blocks inbound 443. Run Cloudflare Tunnel:

```bash
sudo bash ~/Documents/Claude/Projects/Brain/goldfront-os/deploy/cloudflared-manus.sh
```

Then re-run Step 2 for `https://conradstrong.com/health`.

## Step 4 — Goldfront-os bootstrap (one-time, optional but recommended)

So future `curl …/manus_bootstrap.sh` uses the ordered deploy:

```bash
cd ~/Documents/Claude/Projects/Brain/goldfront-os
git pull
curl -fsSL https://raw.githubusercontent.com/lindsey-creator/conrad-command-center/main/goldfront-os-additions/manus_bootstrap.patch | git apply
git commit -am "Bootstrap → conrad-command-center manus-accurate.sh"
git push
```

(If `git apply` fails, replace the last line of `deploy/manus_bootstrap.sh` with:  
`exec bash "$BRAIN_PARENT/conrad-command-center/deploy/manus-accurate.sh"`)

## Step 5 — Connectors (after UI is accurate)

1. Merge keys: `bash ~/Documents/Claude/Projects/Brain/goldfront-os/deploy/reuse_manus_env.sh`
2. Restart: `sudo systemctl restart superman-brain`
3. Open **Stack → Connections** on the live site; complete Google / Whoop OAuth if needed.

## Report back

Paste:

1. Exit code from Step 1  
2. All four curl outputs from Step 2  
3. `sudo systemctl status superman-brain --no-pager` (first 15 lines)  
4. Whether Cloudflare tunnel was needed  

Reference: `conrad-command-center/deploy/ORDER.md`

# Connecting the Command Center to the Brain

The Command Center is glass. The **Brain** ([`Goldfront-os`](https://github.com/lindsey-creator/Goldfront-os)) is the
source of truth. The UI calls the Brain's FastAPI service — it never computes
numbers itself.

## Quick start (local)

```bash
# Sibling folders:
#   conrad-command-center/
#   Goldfront-os/

cd conrad-command-center
./scripts/run-stack.sh
```

Open **http://127.0.0.1:8000** — one port for UI + API.

Dev mode with hot reload (two terminals):

```bash
# Terminal 1
cd Goldfront-os && uvicorn brain.main:app --reload --port 8000

# Terminal 2
cd conrad-command-center
echo 'VITE_BRAIN_API=http://127.0.0.1:8000' > .env
npm run dev   # http://localhost:5173
```

Smoke test (Brain running):

```bash
./scripts/smoke-test.sh http://127.0.0.1:8000
```

## Production layout

The Brain serves the built React app when this path exists:

`../conrad-command-center/dist` (sibling of the `Goldfront-os` repo root)

```bash
cd conrad-command-center && npm ci && npm run build
cd ../Goldfront-os && pip install -r requirements.txt
sudo systemctl restart superman-brain   # or your process manager
```

## Core endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/health` | Liveness |
| `POST` | `/chat` | Echo / Ask the room (drafts return `approval_id`) |
| `GET` | `/brief/daily` | Morning brief |
| `GET` | `/money/top-moves` | Top money moves |
| `GET` | `/blindspots`, `/watchlist`, `/team/pulse` | Intel modules |
| `GET` | `/crm/ghl`, `/ads/meta`, `/weather` | Connectors (or `connect_source`) |
| `POST` | `/tasks` | Queue ClickUp task (approval gate) |
| `GET` | `/approvals/pending` | Pending drafts/tasks |
| `POST` | `/approvals/{id}/approve`, `/deny` | Human gate |
| `GET` | `/connectors/status` | Which env vars are configured |

## ClickUp task actions (dashboard)

| Method | Path |
|--------|------|
| `GET` | `/clickup/tasks/{task_id}` |
| `PATCH` | `/clickup/tasks/{task_id}` |
| `POST` | `/clickup/tasks/{task_id}/complete`, `/reopen`, `/assign`, `/unassign`, `/comment` |
| `GET` | `/clickup/members` |

## OAuth wizards (Connections page)

| Method | Path |
|--------|------|
| `GET` | `/connect/google`, `/connect/whoop` — start OAuth |
| `GET` | `/connect/google/status`, `/connect/whoop/status` |
| `POST` | `/connect/google/config`, `/connect/whoop/config` |

See `Goldfront-os/deploy/CONNECT-EVERYTHING.md` for env vars and Manus deploy.

## Legacy patch

If you run an old Brain checkout, apply:

```bash
./scripts/install-brain-patch.sh ../Goldfront-os
```

Current `Goldfront-os` on GitHub already includes these routes.

## Rule

Numbers come from the Brain's engine. The UI displays and narrates. If a value
isn't available, show the empty/connect state — do not invent it.

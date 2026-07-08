# Connecting the Command Center to the Brain

The Command Center is glass. The **Brain** (separate `goldfront-os` repo) is the
source of truth. The UI calls the Brain's FastAPI service — it never computes
numbers itself.

## Run the Brain locally
```bash
cd goldfront-os
pip install -r requirements.txt
uvicorn brain.main:app --reload      # http://127.0.0.1:8000  (see /docs)
```
Set the UI's API base to that URL (e.g. `VITE_BRAIN_API=http://127.0.0.1:8000`).

## Endpoints that exist today
- `GET  /health`
- `POST /evaluate-deal` — deterministic deal math (margin, DSCR, flywheel, verdict)
- `POST /train/voice`, `/train/deal-decision`, `/train/team-interaction`, `/train/conversation`
- `GET  /decisions/history` — recency-weighted decision history
- `GET  /train/counts`
- `GET  /ads/meta` — Meta Ads spend, leads, CPL (connect_source until wired)
- `GET  /weather` — Cleveland conditions (connect_source until wired)
- `POST /tasks` — issue a task → routed into ClickUp (human gate when configured)

## Endpoints Fable should add (thin wrappers over the Brain, no new math)
- `GET /brief/daily` — the morning brief (Fieldy + calendar + pipeline)
- `GET /money/top-moves` — today's Top-3 money moves (from the engine + memory)
- `GET /blindspots` and `GET /watchlist`
- `GET /team/pulse` — overdue + accountability radar output

## Live connectors (authorize in an interactive Cowork/Claude session)
ClickUp · Fieldy · GoHighLevel · Gmail · Google Calendar · (Apple Health / Whoop
sync via the dashboard). Until a connector is authorized, its module shows a clean
"connect source" state — never fake data.

## Rule
Numbers come from the Brain's engine. The UI displays and narrates. If a value
isn't available, show the empty/connect state — do not invent it.

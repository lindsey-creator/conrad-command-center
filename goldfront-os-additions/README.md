# Goldfront-os Brain additions

Patches and modules for **Superman Brain** (Goldfront-os). The Command Center UI
calls these endpoints; without them you only get legacy stubs.

## Executive Council (latest — apply this)

Multi-seat routing, **daily money scan**, live cockpit context on every `/chat`,
Gmail blindspots, `/council/scan`, `/intel/snapshot`, `/deals/pipeline`.

```bash
cd Goldfront-os   # or goldfront-os on Manus
git pull
git apply ../conrad-command-center/goldfront-os-additions/patches/0001-Executive-Council-daily-scan-live-chat-context-Gmail.patch
python3 -m pytest tests/test_council.py tests/test_live_context.py -q
```

Or from Command Center repo:

```bash
./scripts/install-brain-patch.sh ../Goldfront-os
```

**Manus deploy** applies patches automatically in `deploy/manus-deploy-core.sh` (step 3).

## Operator horizon (10-steps-ahead)

`0002-Operator-horizon-ten-steps-ahead.patch` — apply after patch 0001:

- `GET /intel/horizon` — now / 72h edge / 30d signals + contrarian board + readiness score
- `?narrate=1` — optional Claude paragraph (needs `ANTHROPIC_API_KEY`)
- `/chat` **operator mode** when you ask about edge, contrarian, “10 steps ahead”, etc.

```bash
git apply ../conrad-command-center/goldfront-os-additions/patches/0002-Operator-horizon-ten-steps-ahead.patch
python3 -m pytest tests/test_horizon.py -q
```


If your checkout predates approvals/Meta/weather, also apply `brain-changes.patch`
(or use `install-brain-patch.sh`, which applies both when needed).

## New / updated endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/council/scan` | Executive Council daily money scan (ranked moves + seats) |
| `GET` | `/intel/snapshot` | Live cockpit payload injected into `/chat` |
| `GET` | `/deals/pipeline` | Seed pipeline deals (qualitative) |
| `POST` | `/chat` | Now includes `council_seats` + full live context |
| `GET` | `/ads/meta` | Meta Ads spend, leads, CPL |
| `GET` | `/weather` | Cleveland weather |
| `POST` | `/tasks` | Queue ClickUp task (human gate) |
| `GET` | `/approvals/pending` | Pending drafts and tasks |
| `POST` | `/approvals/{id}/approve` | Approve draft or create ClickUp task |
| `POST` | `/approvals/{id}/deny` | Deny and discard |

## Intelligence requirements

| Variable | Effect |
|----------|--------|
| `ANTHROPIC_API_KEY` | Full Claude narration + council synthesis in `/chat` |
| ClickUp / GHL / Meta / Google / Fieldy env | Live scans and context (no fake data) |
| Trained memory (`/train/*`) | Deal Hunter + money moves from your real decisions |

## Deploy

```bash
cd conrad-command-center && npm run build
cd ../Goldfront-os && uvicorn brain.main:app --host 0.0.0.0 --port 8000
```

The Brain serves `conrad-command-center/dist` when that folder exists as a sibling.


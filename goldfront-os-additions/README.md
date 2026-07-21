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

**Manus deploy** applies this patch automatically in `deploy/manus-deploy-core.sh`
(step 3) when you run `manus-accurate.sh`.

## Legacy patch (older Brain only)

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


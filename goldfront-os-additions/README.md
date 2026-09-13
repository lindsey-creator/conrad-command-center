# Goldfront-os Brain additions

These files complete the Command Center build. Copy them into the
[`Goldfront-os`](https://github.com/lindsey-creator/Goldfront-os) repo on the `master`
branch (or merge via patch).

## New endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/ads/meta` | Meta Ads spend, leads, CPL |
| `GET` | `/weather` | Cleveland weather |
| `POST` | `/tasks` | Queue ClickUp task (human gate) |
| `GET` | `/approvals/pending` | Pending drafts and tasks |
| `POST` | `/approvals/{id}/approve` | Approve draft or create ClickUp task |
| `POST` | `/approvals/{id}/deny` | Deny and discard |

`/chat` drafts now return `approval_id` when a draft is produced.

## Install

```bash
cd Goldfront-os
git apply ../conrad-command-center/goldfront-os-additions/brain-changes.patch

# Or copy new modules manually:
cp -r ../conrad-command-center/goldfront-os-additions/brain/approvals brain/
cp ../conrad-command-center/goldfront-os-additions/brain/connectors/meta.py brain/connectors/
cp ../conrad-command-center/goldfront-os-additions/brain/connectors/weather.py brain/connectors/
cp ../conrad-command-center/goldfront-os-additions/tests/test_approvals.py tests/

python3 -m pytest -q
```

## Env vars (optional connectors)

```env
META_ACCESS_TOKEN=
META_AD_ACCOUNT_ID=
WEATHER_API_KEY=          # OpenWeather
CLICKUP_DEFAULT_LIST_ID=  # optional; auto-discovers first list
```

## Required for this HUD branch to appear on Railway

`cursor[bot]` cannot push `lindsey-creator/Goldfront-os`. Apply this one-line cache bust on `master` (or merge a Brain PR) or Railway will keep serving the old EchoCommand UI:

```bash
cd Goldfront-os
git apply ../conrad-command-center/goldfront-os-additions/Dockerfile.hud-cache-bust.patch
```

Then on Railway service `jarvis-brain`:

```
CONRAD_COMMAND_CENTER_REF=cursor/jarvis-iron-man-hud-2fef
HUD_BUILD=2026-09-13-phase1-jenman
```

`HUD_BUILD` must be a Dockerfile `ARG` used in the clone `RUN`. Bumping the env var alone does not rebuild the HUD.

## Deploy

After merging, rebuild the Command Center and restart the Brain:

```bash
cd conrad-command-center && npm run build
cd ../Goldfront-os && uvicorn brain.main:app --host 0.0.0.0 --port 8000
```

The Brain serves `conrad-command-center/dist` when that folder exists as a sibling.

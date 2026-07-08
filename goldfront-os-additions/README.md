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

## Deploy

After merging, rebuild the Command Center and restart the Brain:

```bash
cd conrad-command-center && npm run build
cd ../Goldfront-os && uvicorn brain.main:app --host 0.0.0.0 --port 8000
```

The Brain serves `conrad-command-center/dist` when that folder exists as a sibling.

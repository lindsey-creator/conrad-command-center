# Site watch

Weekday HTTP checks for Conrad / Goldfront public sites. This replaces one-off
Grok Bot jobs with an in-repo script that a Cursor Automation can call later.

No secrets. No CRM. No email.

## What it checks

Configured in `config.json`:

| URL | Extra |
| --- | --- |
| https://conradmortgage.com | Records the 301/redirect chain (apex historically hops to theconradteam.com). |
| https://theconradteam.com | NMLS disclosure, apply CTAs, leftover Gold Star copy, `/apply` probe. |
| https://rhinolending.capital/apply | Expects HTTP 200. Also notes www as related context. |
| https://landownersclub.com | Status, links, phones. |

Every page: status code, redirect hops, extracted links (canonical, assets,
JSON-LD, `<a href>`), and NANP phone numbers.

## Phone lock

Do not invent numbers. The lock is only these two:

| Number | Role |
| --- | --- |
| `216-513-5139` | **DEAD.** Flag if found. Never publish. Never use as a contact number. |
| `216-250-9078` | Lindsey's publish number. OK if present. |

Any other number the pages actually contain is listed as **unclassified**:
report only. Do not change a Maps/listing phone if you cannot prove which
listing it is.

## Run locally

From the repo root (Python 3.10+, stdlib only — no `pip install`):

```bash
python3 scripts/site-watch/watch.py --self-test
python3 scripts/site-watch/watch.py --sample
```

- Writes `reports/site-watch/YYYY-MM-DD.md` (UTC date).
- `--sample` also writes `reports/site-watch/SAMPLE.md` (same contents).
- Exit `0` if no FAIL findings, `1` if any FAIL, `2` on config/self-test errors.

HEAD is not used. Several of these hosts return 405 to HEAD.

## What a Cursor Automation should call

```bash
python3 scripts/site-watch/watch.py
```

Suggested automation prompt (weekday):

```
Run the in-repo site watch. No secrets. No CRM. No email.

  python3 scripts/site-watch/watch.py

Commit reports/site-watch/YYYY-MM-DD.md if it is new or changed.
If the process exits 1, open or update a PR with the report. Do not merge.
If 216-513-5139 appears, treat it as P0: remove it from the site; never publish it.
If another phone appears, report it only. Do not invent a replacement.
Do not change a Maps/listing phone unless you can prove which listing it is.
216-250-9078 is Lindsey's publish number.
```

## Limits

The script reads the HTML/JS the server delivered. It does not run a headless
browser, so client-only SPA links may not appear as `<a href>`. Content checks
still scan the delivered bundle (NMLS, Gold Star, Apply).

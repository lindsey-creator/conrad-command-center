# Site-watch fix pack — 2026-08-20

Tracked unblock for the two **live site** FAILs from this morning’s site-watch
run ([PR #4](https://github.com/lindsey-creator/conrad-command-center/pull/4)
report `reports/site-watch/2026-08-20.md`, generated 2026-08-20 12:08:40Z).

This pack does **not** add or change the watcher. No email. No GHL. No GBP.

| FAIL | URL | In this repo? | Ship |
| --- | --- | --- | --- |
| No `NMLS` in delivered HTML | https://theconradteam.com | No | Manus/ops on the live host (see §1) |
| Apex `/apply` HTTP 404 | https://rhinolending.capital/apply | No | Whoever already 301s apex `/` → www (see §2) |

**Phone lock:** `216-513-5139` is dead. Do not publish it. It was not on either
page in the morning run or in the re-check below. Do not invent a replacement.
`216-250-9078` is Lindsey’s publish number. Other numbers already on a page are
report-only.

---

## Repo check (why there is no code fix here)

This repository is **Conrad Command Center** (React UI for Goldfront OS). It
does not contain marketing-site HTML, footers, or host redirects for
`theconradteam.com` or `rhinolending.capital`.

Public `lindsey-creator` repos checked 2026-08-20: `conrad-command-center`,
`Goldfront-os`, `vapi-warm-caller`. None of those are those two public sites.

`src/components/Footer.tsx` in **this** repo is the Command Center footer
(`CONRAD COMMAND CENTER · conradstrong.com`). It is not the Conrad Team site
footer. Do not put an NMLS line there.

**NMLS is not in this repo.** Do not invent a license number. Leave the
in-repo work as this document. The live Conrad Team JS already publishes
branch / LO numbers (quoted in §1 as evidence, not as a new assignment).

Named owner of the live marketing hosts is **not recorded in this repo**.
Do not invent one. Headers and paths below are the ship target for
Manus/ops.

---

## 1. https://theconradteam.com — no NMLS in delivered HTML

### Exact evidence

Morning watch (PR #4, `python3 scripts/site-watch/watch.py --sample`,
2026-08-20 12:08:40Z):

| Field | Value |
| --- | --- |
| Requested | https://theconradteam.com |
| Final URL / status | https://theconradteam.com — **200** |
| Content check | NMLS disclosure — **FAIL** — `not found in delivered HTML/JS` |
| Apply CTA | PASS |
| leftover Gold Star | PASS (not present) |
| `/apply` probe | 200 |
| Dead phone `216-513-5139` | not found |
| Phones on page | `216-279-5821` (unclassified — report only) |

The watcher greps the **HTML GET body** only. Linked JS is listed as a link
check; it is not concatenated into the NMLS scan. The FAIL text says
“HTML/JS”; the scan that failed was the HTML document.

Re-check (this pack, 2026-08-20 12:33Z, GET — these hosts `405` HEAD):

```
GET https://theconradteam.com
HTTP/2 200
content-type: text/html; charset=UTF-8
last-modified: Tue, 18 Aug 2026 21:12:27 GMT
server: cloudflare
x-manus-proxy-mode: transparent/1
x-powered-by: Express
```

- Title: `Conrad Mortgage Team | Powered by Revolution Mortgage | Strongsville, Ohio`
- HTML size: 373,603 bytes (SPA shell + Manus runtime). **0** matches for
  `NMLS` / `nmls` in that document.
- PWA marker: `/__manus/pwa/manifest.webmanifest`
- Script: `https://theconradteam.com/assets/index-Di_yQG3S.js` — HTTP 200,
  1,210,961 bytes. That **live JS already contains** footer strings (source
  map `client/src/components/Footer.tsx` on the **live site**, not this repo):

  - `Branch NMLS #2840570`
  - `Lindsey Stuart Conrad NMLS #89896`
  - `T2 Financial LLC dba Revolution Mortgage. Branch NMLS #2840570. Branch Manager: Lindsey Stuart Conrad NMLS #89896. 13593 Pearl Road, Strongsville, Ohio 44136.`
  - `Equal Housing Lender · NMLS #2840570 · Strongsville, Ohio`

- `216-513-5139` not in that JS. `216-250-9078` not in that JS.
  `216-279-5821` / `tel:2162795821` is present (unclassified — do not change).

So: the live Manus app already has NMLS **after JS runs**. A no-JS GET of
the HTML (the watch, view-source, many crawlers) does not.

### What done looks like

```bash
curl -sS https://theconradteam.com | grep -i NMLS
```

must print at least one hit **in the HTML document**. Smallest live-host
change: put the same footer disclosure already in the live JS into the
static HTML footer (or prerender the footer).

Copy the numbers **already on the live JS**. Do not invent a different
NMLS. Do not publish `216-513-5139`.

**TODO (if a human cannot confirm the live-JS numbers on
[NMLS Consumer Access](https://www.nmlsconsumeraccess.org)):** leave the
HTML as-is and confirm before shipping. Do not invent a license number.

### Who owns the live host

Not this repo. Response headers show a **Manus Space** behind Cloudflare
(`x-manus-proxy-mode`, `/__manus/pwa`, `files.manuscdn.com`). A named
person or ticket owner for that Space is **not in this repo** — do not
invent one.

**Ship path:** Manus/ops on the live `theconradteam.com` project
(`client/src/components/Footer.tsx` and/or the HTML shell) so a GET of `/`
includes `NMLS` without executing JS.

---

## 2. https://rhinolending.capital/apply — apex 404; www 200

### Exact evidence

Morning watch (same report):

| Field | Value |
| --- | --- |
| Requested | https://rhinolending.capital/apply |
| Final URL / status | same URL — **404** (expected 200) |
| Related | https://www.rhinolending.capital/apply — **200** |
| Dead phone | not found |

Re-check (2026-08-20 12:33Z, GET):

```
GET https://rhinolending.capital/apply
HTTP/2 404
content-type: text/html; charset=utf-8
server: ip-10-123-*.ec2.internal
content-length: 143
```

Body (exact):

```html
<!DOCTYPE HTML>
<html lang='en-us'>
  <head>
    <title>Not Found</title>
  </head>
  <body>
    HTTP Status: 404 (not found)
  </body>
</html>
```

No `Location`. Follow-redirects still 404. No Cloudflare / Manus headers.

```
GET https://rhinolending.capital/
HTTP/2 301
location: http://www.rhinolending.capital
server: ip-10-123-*.ec2.internal
```

Apex `/` already redirects to www. Apex `/apply` does not.

```
GET https://www.rhinolending.capital/apply
HTTP/2 200
content-type: text/html; charset=UTF-8
last-modified: Fri, 14 Aug 2026 16:30:07 GMT
server: cloudflare
x-manus-proxy-mode: transparent/1
x-powered-by: Express
```

Title: `Rhino Capital | Non-QM DSCR Loans Cleveland Ohio | Investment Property Lending`.

This repo has no `rhinolending.capital` nginx, DNS, or redirect files.

### What done looks like

```bash
curl -sS -o /dev/null -w '%{http_code} %{redirect_url}\n' https://rhinolending.capital/apply
```

is **200**, or **301/302** to `https://www.rhinolending.capital/apply` which
is **200**.

Smallest live-host change: give `/apply` the same apex → www redirect `/`
already has (prefer `https://www.rhinolending.capital/apply`, not `http://`).
Better: redirect **all** apex paths to the matching www path so other deep
links do not 404 the same way.

Do not publish `216-513-5139` on the apply page while touching redirects.

### Who owns the live host

Not this repo. Two different hosts, no named owner recorded here:

| Host | What it does | Signals |
| --- | --- | --- |
| Apex `rhinolending.capital` | 301 `/` → www; **404 `/apply`** | `ip-10-123-*.ec2.internal` (not Manus/CF) |
| `www.rhinolending.capital` | `/apply` 200 | Cloudflare + Manus Space |

**Ship path:** the same place that already 301s apex `/` to www (DNS /
redirect / parking box), plus Manus/ops on the www Space if the redirect
must land on a specific route. Named individual: not in this repo — do
not invent one.

---

## Out of scope

- Do not copy or edit `scripts/site-watch/watch.py` (PR #4).
- Do not send email, touch GHL, or publish GBP.
- Do not publish `216-513-5139`.
- Do not invent NMLS IDs or phone numbers.
- Do not change a Maps / listing phone unless the listing is proven.

---

## Verify after the live host ships

```bash
# FAIL 1 — NMLS must appear in the HTML document
curl -sS https://theconradteam.com | grep -i NMLS

# FAIL 2 — apex /apply must be 200 or redirect to www /apply 200
curl -sS -o /dev/null -w '%{http_code} %{redirect_url}\n' https://rhinolending.capital/apply
curl -sS -o /dev/null -w '%{http_code}\n' https://www.rhinolending.capital/apply

# Phone lock — must print nothing
curl -sS https://theconradteam.com https://www.rhinolending.capital/apply | grep -E '216-513-5139|2165135139' || true
```

When those three hold, the morning FAILs are cleared. Re-run the watcher
from PR #4 if that PR is on the machine; do not block this pack on it.

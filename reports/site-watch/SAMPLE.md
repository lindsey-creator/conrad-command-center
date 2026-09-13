# Site watch report — 2026-08-20

Generated (UTC): 2026-08-20 12:08:40Z
Command: `python3 scripts/site-watch/watch.py --sample`
Scope: HTTP GET only. No secrets. No CRM. No email.

## Summary

2 site(s) have FAIL findings out of 4 watched.

| Site | Requested | Final status | Redirects | Dead phones | Broken links | Result |
| --- | --- | --- | --- | --- | --- | --- |
| Conrad Mortgage | https://conradmortgage.com | 200 | 2 | 0 | 0 | OK |
| The Conrad Team | https://theconradteam.com | 200 | 0 | 0 | 0 | FAIL |
| Rhino Lending apply | https://rhinolending.capital/apply | 404 | 0 | 0 | 0 | FAIL |
| Landowners Club | https://landownersclub.com | 200 | 0 | 0 | 0 | OK |

## Phone lock

- Dead (never publish): **216-513-5139** — FAIL if found.
- Lindsey publish number: **216-250-9078**.
- Unclassified phones: Do not invent other numbers. Report unclassified phones only. Do not change a Maps/listing phone if you cannot prove which listing it is.
- This report lists numbers found on the fetched pages. It does not invent numbers.

## Conrad Mortgage

- Requested: https://conradmortgage.com
- Final URL: https://theconradteam.com/
- Status: 200
- Note: Apex and www historically 301. Record every hop; do not treat a 301 as a fetch failure if the final page is OK.
- Redirect chain:
  - `301` https://conradmortgage.com → http://theconradteam.com/
  - `301` http://theconradteam.com/ → https://theconradteam.com/

### Phones found

| Number | Class | Raw match | Action |
| --- | --- | --- | --- |
| 216-279-5821 | unclassified | `+1-216-279-5821` | Report only. Do not invent a replacement. Do not change a Maps/listing phone without proving the listing. |

### Content checks

_No content checks configured._

### Links checked

| URL | Kind | Status | Broken |
| --- | --- | --- | --- |
| https://theconradteam.com/__manus/pwa/manifest.webmanifest | link | 200 | no |
| https://theconradteam.com/assets/index-CnZ1TVxE.css | link | 200 | no |
| https://theconradteam.com/assets/index-Di_yQG3S.js | script | 200 | no |
| https://www.conradmortgage.com/ | canonical | 200 | no |
| https://d2xsxph8kpxj0f.cloudfront.net/310519663484039959/8CbiSTSkde2spuM7wLd4nA/ConradTeam_Horizontal-Blue_d45453a3.webp | og:image | 200 | no |
| https://www.conradmortgage.com | json-ld | 200 | no |
| https://www.facebook.com/conradmortgage | json-ld | 200 | no |
| https://www.linkedin.com/company/conradmortgage | json-ld | 200 | no |
| https://d2xsxph8kpxj0f.cloudfront.net/310519663484039959/8CbiSTSkde2spuM7wLd4nA/ConradTeam_Icon-Blue_f4fbb5fc.png | link | 200 | no |

### Findings

- NOTE 301 https://conradmortgage.com → http://theconradteam.com/
- NOTE 301 http://theconradteam.com/ → https://theconradteam.com/

## The Conrad Team

- Requested: https://theconradteam.com
- Final URL: https://theconradteam.com
- Status: 200
- Note: Check NMLS disclosure, apply CTAs, and leftover Gold Star copy.

### Phones found

| Number | Class | Raw match | Action |
| --- | --- | --- | --- |
| 216-279-5821 | unclassified | `+1-216-279-5821` | Report only. Do not invent a replacement. Do not change a Maps/listing phone without proving the listing. |

### Content checks

| Check | Kind | Result | Detail |
| --- | --- | --- | --- |
| NMLS disclosure | require | FAIL | not found in delivered HTML/JS |
| Apply CTA | require | PASS | present |
| leftover Gold Star copy | forbid | PASS | not present |

### Path probes

| URL | Status | Final URL |
| --- | --- | --- |
| https://theconradteam.com/apply | 200 | https://theconradteam.com/apply |

### Links checked

| URL | Kind | Status | Broken |
| --- | --- | --- | --- |
| https://theconradteam.com/__manus/pwa/manifest.webmanifest | link | 200 | no |
| https://theconradteam.com/assets/index-CnZ1TVxE.css | link | 200 | no |
| https://theconradteam.com/assets/index-Di_yQG3S.js | script | 200 | no |
| https://www.conradmortgage.com/ | canonical | 200 | no |
| https://d2xsxph8kpxj0f.cloudfront.net/310519663484039959/8CbiSTSkde2spuM7wLd4nA/ConradTeam_Horizontal-Blue_d45453a3.webp | og:image | 200 | no |
| https://www.conradmortgage.com | json-ld | 200 | no |
| https://www.facebook.com/conradmortgage | json-ld | 200 | no |
| https://www.linkedin.com/company/conradmortgage | json-ld | 200 | no |
| https://d2xsxph8kpxj0f.cloudfront.net/310519663484039959/8CbiSTSkde2spuM7wLd4nA/ConradTeam_Icon-Blue_f4fbb5fc.png | link | 200 | no |

### Findings

- FAIL NMLS disclosure: not found in delivered HTML/JS

## Rhino Lending apply

- Requested: https://rhinolending.capital/apply
- Final URL: https://rhinolending.capital/apply
- Status: 404
- Note: Apex /apply has 404'd while www served the app. Check the listed URL; related www is context only.

### Phones found

| Number | Class | Raw match | Action |
| --- | --- | --- | --- |
| 216-319-5782 | unclassified | `+12163195782` | Report only. Do not invent a replacement. Do not change a Maps/listing phone without proving the listing. |

### Content checks

_No content checks configured._

### Related URLs

| URL | Status | Final URL |
| --- | --- | --- |
| https://www.rhinolending.capital/apply | 200 | https://www.rhinolending.capital/apply |

### Links checked

_No first-party/social/asset links extracted (SPA shells often have no `<a href>` until JS runs)._

### Findings

- FAIL HTTP 404 (expected 200) for https://rhinolending.capital/apply

## Landowners Club

- Requested: https://landownersclub.com
- Final URL: https://landownersclub.com
- Status: 200

### Phones found

_No NANP phones found in delivered HTML/JSON-LD/tel URIs._

### Content checks

_No content checks configured._

### Links checked

| URL | Kind | Status | Broken |
| --- | --- | --- | --- |
| https://landownersclub.com/ | canonical | 200 | no |
| https://landownersclub.com/__manus/pwa/manifest.webmanifest | link | 200 | no |
| https://landownersclub.com/assets/index-4lKXrFA5.js | script | 200 | no |
| https://landownersclub.com/assets/index-FtzHNL9j.css | link | 200 | no |

### Findings

- None.

## Limits

- Checks the HTML/JS the server actually delivered. No headless browser, so client-only routes may not appear as `<a href>` links.
- Does not change Maps listings, CRM records, or send email.
- Phone lock is exhaustive for the two configured numbers only.


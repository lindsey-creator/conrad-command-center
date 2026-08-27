# Map Pack targeting notes — Conrad Mortgage / Conrad Team

- Date: 2026-08-21
- Market: Cleveland, OH / Northeast Ohio
- Status: DRAFT — observation notes only, not a rank report
- Snapshot: **NO_SNAPSHOT** — public Google Maps pack results were not loaded this run
- Focus: **GBP Services alignment** (Friday job)

---

## Target queries (from `seo-system/README.md`)

| Query | Intent | Services to surface in GBP |
|---|---|---|
| mortgage lender Cleveland | High — core QM | Conventional purchase · Cleveland home loans |
| mortgage broker Cleveland Ohio | High — broker | Conventional purchase · First-time buyer |
| home loan Cleveland | Mid — broad | Cleveland home loans · Conventional purchase |
| first time home buyer Cleveland | Mid — education | First-time homebuyer conversations |
| refinance Cleveland Ohio | Mid — QM refi | Refinance conversations |

## Services ↔ query mapping (draft strategy)

When a human pastes Friday’s service rows into GBP, align titles to how searchers phrase intent:

| GBP service title | Best query fit | Why |
|---|---|---|
| Conventional purchase mortgages | mortgage lender Cleveland · home loan Cleveland | Purchase intent |
| First-time homebuyer help | first time home buyer Cleveland | Education / FTB |
| Refinance conversations | refinance Cleveland Ohio | Refi intent |
| Cleveland home loans | mortgage broker Cleveland Ohio · home loan Cleveland | Local + broad |

## Category alignment (verify in GBP admin)

Per `seo-system/business.md` — candidates only:

- **Primary:** Mortgage lender · Mortgage broker
- **Secondary (if accurate):** Loan agency
- **Do not add on Conrad Mortgage GBP without human OK:** Real estate developer, construction company, hard money lender

## Pack observation template

Leave empty until Monday category-audit run or a human loads results.

| observed_date | query | pack_position | business_name | visible_category | services_visible_yn | our_listing_yn | notes |
|---|---|---|---|---|---|---|---|
| | mortgage lender Cleveland | | | | | | |
| | first time home buyer Cleveland | | | | | | |
| | refinance Cleveland Ohio | | | | | | |

## Targeting priorities (services-focused)

1. **GBP Services completeness** — four QM rows drafted today; human confirms product fit before paste.
2. **Service titles match search language** — “First-time homebuyer help” vs. internal jargon; trim after GBP character limits.
3. **NAP consistency** — phone `216-250-9078` on every surface Conrad controls. Site-watch (2026-08-21): theconradteam.com shows `216-279-5821` — resolve before GBP paste.
4. **No product sprawl** — site lists DSCR/investor products; keep them off Conrad Mortgage GBP unless listing is confirmed for those units.
5. **Description themes** — communication clarity and timeline transparency (common category pain points; competitor CSV not yet available).

## Prior run carryover

- Thursday 2026-08-20: GBP post drafts in `content/seo-drafts/2026-08-20/gbp-posts.md` — still valid for publish cadence.
- Monday/Tuesday jobs not run — no `gbp-categories.csv` or `competitor-reviews.csv` yet.

## Flags for human

- **NO_SNAPSHOT** — run query table in incognito; log on Monday’s category-audit job.
- **Phone mismatch:** GBP drafts use `216-250-9078`; live site uses `216-279-5821`. Confirm canonical customer number before paste.
- **Address seen on site:** Strongsville, OH 44136 (13593 Pearl Road on theconradteam.com footer) — confirm GBP storefront vs. service-area before adding to Services or description.
- **NMLS #2840570** visible on public site — confirm disclosure on GBP if not already present.

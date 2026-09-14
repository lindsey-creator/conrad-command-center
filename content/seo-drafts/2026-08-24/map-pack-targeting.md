# Map Pack targeting notes — Conrad Mortgage / Conrad Team

- Date: 2026-08-24
- Market: Cleveland, OH / Northeast Ohio
- Job focus: **GBP category audit** (Monday)
- Status: DRAFT — observation notes only, not a rank report
- Snapshot: **NO_SNAPSHOT** — public Google Maps pack results were not loaded this run

---

## Why categories matter for Map Pack

Google matches query intent to business **category + services + relevance signals**. For Conrad Mortgage / Conrad Team, the category audit ensures the listing reads as a **QM home loan provider** — not construction, hard money, or investor lending — so pack queries like “mortgage lender Cleveland” surface the right entity.

---

## Target queries (from `seo-system/README.md`)

| Query | Category signal to watch | Conrad relevance |
|---|---|---|
| mortgage lender Cleveland | “Mortgage lender” primary on pack cards | Primary target — align Conrad primary here if licensed as lender |
| mortgage broker Cleveland Ohio | “Mortgage broker” primary | Use if intermediary model fits Conrad’s license |
| home loan Cleveland | Often lender or broker | Broad purchase intent |
| first time home buyer Cleveland | Lenders + credit unions | FTB education fits QM services draft |
| refinance Cleveland Ohio | Lender-heavy | Refinance conversations service aligns |

---

## Recommended GBP category stack (draft)

| Layer | Recommendation | Notes |
|---|---|---|
| Primary | Mortgage lender **or** Mortgage broker | Pick one — do not dual-primary |
| Secondary | Loan agency | Only if accurate |
| Avoid | Construction · Hard money · Real estate developer · DSCR | Goldfront / investor — separate listings |

---

## Pack observation template

When a human loads results, fill from what they see. Leave cells empty if unknown.

| observed_date | query | pack_position | business_name | visible_category | our_listing_yn | phone_visible | notes |
|---|---|---|---|---|---|---|---|
| | mortgage lender Cleveland | | | | | | |
| | mortgage broker Cleveland Ohio | | | | | | |
| | home loan Cleveland | | | | | | |
| | first time home buyer Cleveland | | | | | | |
| | refinance Cleveland Ohio | | | | | | |

---

## Targeting priorities (category pass)

1. **Category clarity** — One accurate primary; no construction/investor bleed on Conrad Mortgage GBP.
2. **Services parity** — GBP Services (2026-08-21 draft) should match category scope (QM purchase, FTB, refi).
3. **Description keywords** — Use “mortgage lender” / “home loans” / “Cleveland” naturally in description (see `gbp-description.md`) without keyword stuffing.
4. **NAP consistency** — Phone `216-250-9078` on every surface Conrad controls. Do not publish `216-513-5139`.
5. **Local relevance** — Cleveland / Northeast Ohio language in posts and page copy; service-area framing until street address is verified for GBP.

---

## Competitors to watch (names only — no invented metrics)

Industry presence in Cleveland includes large banks and retail lenders (e.g., CrossCountry Mortgage, Nations Lending, regional banks). **Do not** claim Conrad’s rank vs. these without a seen pack snapshot. Tuesday’s competitor teardown job will draft review-theme CSV when run.

---

## Flags for human

- **NO_SNAPSHOT this run** — complete the observation table above in incognito; update `seo-system/output/week-1/gbp-categories.csv`.
- **Site maintenance:** theconradteam.com returned “under maintenance” on 2026-08-24 — re-check NAP when live.
- **Phone mismatch (prior site-watch):** site showed `216-279-5821`; repo lock is `216-250-9078` — resolve before GBP paste.
- **NMLS on site (prior):** `#2840570` — confirm before adding to GBP if not already there.
- **Strongsville address (prior site footer):** 13593 Pearl Road, Strongsville OH 44136 — confirm storefront vs. service area before using on GBP.

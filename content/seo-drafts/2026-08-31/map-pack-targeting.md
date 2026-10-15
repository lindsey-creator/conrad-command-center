# Map Pack targeting notes — Conrad Mortgage / Conrad Team

- Date: 2026-08-31
- Market: Cleveland, OH / Northeast Ohio
- Job focus: **GBP category audit** (Monday refresh)
- Status: DRAFT — observation notes only, not a rank report
- Snapshot: **NO_SNAPSHOT** — public Google Maps pack results were not loaded this run

---

## Why categories matter for Map Pack

Google matches query intent to business **category + services + relevance signals**. For Conrad Mortgage / Conrad Team, the category audit ensures the listing reads as a **QM home loan provider** — not construction, hard money, or investor lending — so pack queries like “mortgage lender Cleveland” surface the right entity.

This is the **second Monday pass** (prior: 2026-08-24). Category recommendations are unchanged; the human still needs an incognito pack snapshot to fill competitor rows.

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
| 2026-08-31 | mortgage lender Cleveland | | | | | | |
| 2026-08-31 | mortgage broker Cleveland Ohio | | | | | | |
| 2026-08-31 | home loan Cleveland | | | | | | |
| 2026-08-31 | first time home buyer Cleveland | | | | | | |
| 2026-08-31 | refinance Cleveland Ohio | | | | | | |

---

## Targeting priorities (category pass — month 2)

1. **Category clarity** — One accurate primary; no construction/investor bleed on Conrad Mortgage GBP.
2. **Services parity** — GBP Services (2026-08-28 draft) must match category scope (QM purchase, FTB, refi).
3. **Description keywords** — Use “mortgage lender” / “home loans” / “Cleveland” naturally in description (see `gbp-description.md`) without keyword stuffing.
4. **NAP consistency** — Phone `216-250-9078` on every surface Conrad controls. Do not publish `216-513-5139`.
5. **Local relevance** — Cleveland / Northeast Ohio language in posts and page copy; service-area framing until street address is verified for GBP.
6. **Cross-signal check** — Tuesday competitor teardown (2026-08-25) noted generic praise themes (communication, plain language). Category + services should reinforce those strengths once pack competitors are SEEN.

---

## Competitors to watch (names only — no invented metrics)

Industry presence in Cleveland includes large banks and retail lenders (e.g., CrossCountry Mortgage, Nations Lending, regional banks). **Do not** claim Conrad’s rank vs. these without a seen pack snapshot. Tuesday’s competitor teardown job will refresh review-theme CSV when run with SEEN pack names.

---

## Flags for human

- **NO_SNAPSHOT this run** — complete the observation table above in incognito; update `seo-system/output/week-1/gbp-categories.csv`.
- **Site live:** theconradteam.com returned HTTP 200 on 2026-08-31 — re-verify NAP and phone.
- **Phone mismatch:** site shows `216-777-4330`; repo lock is `216-250-9078` — resolve before GBP paste.
- **NMLS on site (prior):** `#2840570` — confirm before adding to GBP if not already there.
- **Strongsville address (prior site footer):** 13593 Pearl Road, Strongsville OH 44136 — confirm storefront vs. service area before using on GBP.
- **Prior Monday also NO_SNAPSHOT** — two consecutive Mondays without pack data; prioritize incognito check this week.

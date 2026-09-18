# Map Pack targeting notes — Conrad Mortgage / Conrad Team

- Date: 2026-08-20
- Market: Cleveland, OH / Northeast Ohio
- Status: DRAFT — observation notes only, not a rank report
- Snapshot: **NO_SNAPSHOT** — public Google Maps pack results were not loaded this run (no login; no automated Maps scrape)

---

## Target queries (from `seo-system/README.md`)

Use these as search strings to observe in a normal browser session. Record pack business names and categories when a human runs the check.

| Query | Intent | Conrad relevance |
|---|---|---|
| mortgage lender Cleveland | High — core QM purchase/refi | Primary target |
| mortgage broker Cleveland Ohio | High — broker positioning | Primary target |
| home loan Cleveland | Mid — broad purchase | Primary target |
| first time home buyer Cleveland | Mid — education / FTB | Strong fit for QM guidance |
| refinance Cleveland Ohio | Mid — QM refi conversations | Strong fit |

## Category alignment (verify in GBP admin)

Per `seo-system/business.md` — candidates only, not confirmed live state:

- **Primary candidates:** Mortgage lender · Mortgage broker
- **Secondary candidates (if accurate):** Loan agency
- **Avoid on Conrad Mortgage GBP:** Construction, hard money, DSCR, real estate developer — unless a human confirms this listing represents those units

## Pack observation template

When a human loads results, fill this table from what they see. Leave cells empty if unknown.

| observed_date | query | pack_position | business_name | visible_category | our_listing_yn | phone_visible | notes |
|---|---|---|---|---|---|---|---|
| | mortgage lender Cleveland | | | | | | |
| | mortgage broker Cleveland Ohio | | | | | | |
| | home loan Cleveland | | | | | | |
| | first time home buyer Cleveland | | | | | | |
| | refinance Cleveland Ohio | | | | | | |

## Targeting priorities (draft strategy)

1. **GBP completeness** — categories, services, description, and posts aligned to QM purchase, first-time buyer education, and refinance (no rate quotes).
2. **NAP consistency** — phone `216-250-9078` on every surface Conrad controls. Do not publish `216-513-5139`. If an unverified Maps pin still shows the dead number, flag for human review — do not overwrite without proof.
3. **Local relevance signals** — Cleveland / Northeast Ohio language in posts, description, and location page copy. Service-area framing unless a verified street address is confirmed for GBP.
4. **Review reply cadence** — Wednesday job will draft replies when reviews are pasted; consistent responses support trust signals without inventing metrics.
5. **Content themes to emphasize (QM only on this listing):**
   - Clear process and next steps (addresses common “communication / timeline” complaints in the category)
   - First-time buyer education without credit decisions
   - Refinance conversations framed as “talk to the team about today’s options” — no rate numbers

## Competitors to watch (names only — no invented metrics)

Public industry lists for Cleveland mention large banks and regional lenders (e.g., Third Federal, Huntington, KeyBank). **Do not** claim Conrad’s rank vs. these without a seen pack snapshot. Use Monday’s category-audit CSV (future run) for named pack competitors.

## Flags for human

- **NO_SNAPSHOT this run** — run the query table above in an incognito browser and save results to `seo-system/output/week-1/gbp-categories.csv` on Monday’s job.
- **Website phone mismatch:** `theconradteam.com` showed `216-279-5821` on fetch (2026-08-20 site-watch). GBP drafts use phone lock `216-250-9078` per repo policy. Confirm which number belongs on GBP before paste.
- **NMLS on site:** `#2840570` visible on public site header — confirm before adding to GBP if not already there.

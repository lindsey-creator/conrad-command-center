# Map Pack targeting notes — Conrad Mortgage / Conrad Team

- Date: 2026-09-28
- Market: Cleveland, OH / Northeast Ohio
- Job focus: **GBP category audit** (Monday — lender/broker positioning vs. pack norms)
- Status: DRAFT — observation notes only, not a rank report
- Snapshot: **NO_SNAPSHOT** — public Google Maps pack results were not loaded this run

---

## Why categories matter for Map Pack

Map Pack cards surface a **visible primary category** on many listings. A Conrad Mortgage GBP whose category says “construction” or “hard money” while Services describe QM purchase/refi sends mixed signals. Monday’s pass aligns **category + Services + description** to the four-row **2026-09-25** refresh.

Pack competitor names remain **UNVERIFIED** — **eighth consecutive Monday** without SEEN rows in `gbp-categories.csv`.

---

## Target queries (from `seo-system/README.md`)

| Query | What to observe in pack | Category alignment (this run) |
|---|---|---|
| mortgage lender Cleveland | Lender-primary cards; snippet themes | Prefer **Mortgage lender** primary if pack peers use lender |
| mortgage broker Cleveland Ohio | Broker-primary cards | Prefer **Mortgage broker** primary if that matches license + pack peers |
| home loan Cleveland | Mixed lender/broker/credit union | One primary only — not both |
| first time home buyer Cleveland | Often lenders + credit unions | Secondary **Loan agency** only if accurate |
| refinance Cleveland Ohio | Lender-heavy | Keep primary QM-aligned; no investor/DSCR categories |

---

## Pack observation template

When a human loads results, fill from what they see. Leave cells empty if unknown.

| observed_date | query | pack_position | business_name | visible_category | our_listing_yn | phone_visible | notes |
|---|---|---|---|---|---|---|---|
| 2026-09-28 | mortgage lender Cleveland | | | | | | |
| 2026-09-28 | mortgage broker Cleveland Ohio | | | | | | |
| 2026-09-28 | home loan Cleveland | | | | | | |
| 2026-09-28 | first time home buyer Cleveland | | | | | | |
| 2026-09-28 | refinance Cleveland Ohio | | | | | | |

---

## Targeting priorities (category pass — month 2, week 5)

1. **Category before post blitz** — fix primary/secondary, then publish queued posts from 2026-09-24 / 2026-09-25 themes.
2. **One primary only** — lender *or* broker; match how you answer the phone and how NMLS is disclosed.
3. **Services consistency** — four QM rows from 2026-09-25; no DSCR/Goldfront on this listing.
4. **Phone consistency** — drafts use **216-250-9078**; confirm on GBP before any save (site shows **216-279-2223**).
5. **Local relevance without steering** — “Greater Cleveland / Northeast Ohio” only; no neighborhood preference lists.

---

## Cadence suggestion (human)

| Step | Action |
|---|---|
| 1 | Incognito pack check → fill CSV with SEEN rows |
| 2 | GBP admin category screenshot (before) |
| 3 | Apply category + Services alignment |
| 4 | Screenshot (after) |
| 5 | Stagger one GBP post per day from this folder + prior approved queues |

---

## Blockers (unchanged)

| Blocker | Action |
|---|---|
| NO_SNAPSHOT (8 Mondays) | Human runs five queries incognito; fills `seo-system/output/week-1/gbp-categories.csv` |
| NO_REVIEWS_PROVIDED | Paste verbatim reviews before posting 2026-09-23 reply templates |
| Phone mismatch | Resolve theconradteam.com **216-279-2223** vs repo lock **216-250-9078** before GBP paste |

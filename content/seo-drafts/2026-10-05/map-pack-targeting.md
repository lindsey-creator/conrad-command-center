# Map Pack targeting notes — Conrad Mortgage / Conrad Team

- Date: 2026-10-05
- Market: Cleveland, OH / Northeast Ohio
- Job focus: **GBP category audit** (Monday — lender/broker positioning vs. pack norms)
- Status: DRAFT — observation notes only, not a rank report
- Snapshot: **NO_SNAPSHOT** — public Google Maps pack results were not loaded this run

---

## Why categories matter for Map Pack

Map Pack cards surface a **visible primary category** on many listings. A Conrad Mortgage GBP whose category says “construction” or “hard money” while Services describe QM purchase/refi sends mixed signals. Monday’s pass aligns **category + Services + description** to the four-row **2026-10-02** Q4 loan-team refresh.

Pack competitor names remain **UNVERIFIED** — **ninth consecutive Monday** without SEEN rows in `gbp-categories.csv`.

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
| 2026-10-05 | mortgage lender Cleveland | | | | | | |
| 2026-10-05 | mortgage broker Cleveland Ohio | | | | | | |
| 2026-10-05 | home loan Cleveland | | | | | | |
| 2026-10-05 | first time home buyer Cleveland | | | | | | |
| 2026-10-05 | refinance Cleveland Ohio | | | | | | |

---

## Targeting priorities (category pass — October refresh)

1. **Category before post blitz** — fix primary/secondary, then publish queued posts from 2026-10-01 / 2026-10-02 themes.
2. **One primary only** — lender *or* broker; match how you answer the phone and how NMLS is disclosed.
3. **Services consistency** — four QM rows from 2026-10-02; no DSCR/Goldfront on this listing.
4. **Phone consistency** — drafts use **216-250-9078**; confirm on GBP before any save (site shows **216-279-2223**).
5. **Q4 messaging** — loan-team roles, gift-fund paperwork, and cash-to-close clarity belong in Services and posts *after* category matches QM lending.

---

## Signals to avoid on this listing

| Signal | Why it hurts |
|---|---|
| Construction / modular builder category | Goldfront Homes is a separate entity |
| Hard money / DSCR primary | Investor products — not Conrad Mortgage QM GBP |
| Mixed primary (lender + broker) | GBP allows one primary only |
| Services that mention unconfirmed FHA/VA/USDA | Clean Services when category is set |

---

## Human next step

Run the five queries in incognito Google Maps (logged out). Copy **business name** and **visible category** into `gbp-categories.csv` with `verification=SEEN`. Do not paste third-party directory lists as pack proof.

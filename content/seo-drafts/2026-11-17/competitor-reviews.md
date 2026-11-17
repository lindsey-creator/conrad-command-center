# Competitor review teardown — Conrad Mortgage / Conrad Team

- Date: 2026-11-17 (Tuesday)
- Brand: Conrad Mortgage / Conrad Team
- Market: Cleveland, OH / Northeast Ohio
- Status: DRAFT — human review only
- Phone lock: 216-250-9078
- Do not publish: 216-513-5139
- Snapshot: **NO_SNAPSHOT** — no SEEN pack competitors from Monday audit (2026-11-16)

*Mirror of canonical CSV: `seo-system/output/week-1/competitor-reviews.csv`*

---

## Blocker (read first)

Monday's `gbp-categories.csv` (2026-11-16) has **no rows** with `our_listing_yn=N` and `verification=SEEN`. Per `competitor-teardown.md`, this run **cannot** name or score pack competitors.

This is the **twenty-first consecutive Monday** without pack observation (through 2026-11-16). The competitor set remains blocked until a human completes an incognito pack check.

**Human action before Wednesday review-replies:**

1. Search the five target queries in incognito (see `map-pack-targeting.md`).
2. Record **business names only** in `gbp-categories.csv` with `verification=SEEN`.
3. Open each named competitor's **public** Google listing or review surface.
4. Add rows to `competitor-reviews.csv` with themes in their words — empty `review_count` / `star_rating` unless visible.

---

## CSV status this run

| Row type | Status | Notes |
|---|---|---|
| Header | Written | Matches prompt spec |
| Competitor rows | **None** | NO_SNAPSHOT — no pack names from Monday |
| SUMMARY | Written | Vendor-slip + holiday-coverage themes for Wed/Fri drafts |

---

## Generic review themes (industry — not pack-validated)

Use these to shape Conrad copy **without** naming competitors or inventing star counts. Replace with SEEN competitor quotes after pack observation.

### Praise themes (borrow for Conrad positioning)

| Theme | Polarity | Sample phrasing pattern | Implication for Conrad | Action |
|---|---|---|---|---|
| Wrote when title or appraisal slipped | praise | "emailed when title pushed" / "told us appraisal was rescheduled" | **Third-party vendor slip transparency** on parallel calendars | USE_IN_WED_REPLIES |
| Backup contact when LO was out | praise | "someone covered Thanksgiving week" / "same file notes when primary was on PTO" | **Holiday PTO coverage** — named backup | USE_IN_WED_REPLIES |
| File received confirmation after offer | praise | "confirmed underwriting had the file" / "knew who owned it after we went under contract" | **File continuity after offer** before travel | USE_IN_WED_REPLIES |
| Conditions walkthrough before travel | praise | "walked open items before we left town" / "due dates before holiday week" | **Pre-travel condition walkthrough** | USE_IN_WED_REPLIES |
| Cash-to-close before leaving town | praise | "fees in plain English before we traveled" / "understood cash needed if closing slipped" | **Cash-to-close before travel** | USE_IN_FRI_SERVICES |
| Parallel calendars during vendor delay | praise | "loan and title on one timeline when appraiser was slow" | Carry **Mon 2026-11-16** parallel-calendar Services | USE_IN_FRI_SERVICES |
| Insurance milestone called out early | praise | "flagged homeowners insurance before clear-to-close" | **Insurance on parallel map** — not a surprise condition | USE_IN_WED_REPLIES |
| Calm tone when vendor missed window | praise | "no panic when inspection slipped" / "steady updates when third party was late" | Posts: **vendor slip + holiday coverage** without rate billboard | USE_IN_FRI_SERVICES |
| Upload receipt on critical conditions | praise | "confirmed pay stub hit the file" | **Document upload received** on conditions list | USE_IN_WED_REPLIES |
| Reachable before travel-heavy week | praise | "could reach someone before Thanksgiving" | **216-250-9078** when urgent — not ghosting | USE_IN_WED_REPLIES |

### Complaint themes (address in Conrad process — never mock competitors)

| Theme | Polarity | Sample phrasing pattern | Implication for Conrad | Action |
|---|---|---|---|---|
| Learned vendor slip from agent | complaint | "title delay from our realtor, not lender" / "never said appraisal moved" | **Proactive written vendor-slip update** | USE_IN_WED_REPLIES |
| Primary LO disappeared for holiday | complaint | "couldn't find anyone Thanksgiving week" / "new person didn't know file" | **Holiday PTO coverage** + file notes | USE_IN_WED_REPLIES |
| File restarted after offer | complaint | "had to re-send everything" / "underwriting acted like new file" | **File continuity confirmation** in first 72 hours | USE_IN_WED_REPLIES |
| Open conditions before travel with no owners | complaint | "list of items but nobody named" / "didn't know what to do before we left" | **Pre-travel condition walkthrough** with owners | USE_IN_WED_REPLIES |
| Cash shock when closing slid past travel | complaint | "different numbers when we got back" / "fees changed and nobody explained" | **Cash-to-close before travel** + written update if dates shift | USE_IN_WED_REPLIES |
| Insurance surprise at clear-to-close | complaint | "homeowners insurance appeared late" / "nobody mentioned binder timing" | **Insurance on parallel calendar** early | USE_IN_FRI_SERVICES |
| Three calendars with no shared map | complaint | "title said one date, lender another" | **Parallel loan/title/insurance milestones** | USE_IN_FRI_SERVICES |
| Silence when appraiser no-showed | complaint | "found out inspection failed days later" | **Written date-shift update** when third party slips | USE_IN_WED_REPLIES |
| Refi sold on rate only | complaint | "never talked timeline before holidays" | **Calendar-first refi** with holiday buffer | USE_IN_FRI_SERVICES |
| Post-clear-to-close ghosting | complaint | "couldn't reach anyone day before closing" | Named contact + **216-250-9078** when urgent | USE_IN_WED_REPLIES |

---

## Vendor slip + holiday coverage (refresh — for posts and page copy)

When borrowers compare Cleveland mortgage teams in **late November** — files where **title, appraisal, or insurance vendors slip** while borrowers **travel for Thanksgiving** — public reviews often reward lenders who:

1. **Write when a third-party vendor moves a date** — loan, title, and insurance stay on one readable map.
2. **Name a backup contact** when the primary loan officer is on PTO.
3. **Confirm file received and assigned** after offer — before the borrower leaves town.
4. **Walk open conditions** with owners and due dates pre-travel.
5. **Explain cash-to-close in plain English** if signing targets slide into holiday week.

Align Wed review replies and Fri services refresh to these themes — not to invented competitor names or star counts. Cross-check Mon 2026-11-16 category draft · Thu 2026-11-12 GBP posts · Fri 2026-11-13 services.

---

## SUMMARY bullets (for Wed/Fri handoff)

- **Third-party vendor slip transparency** — written updates when title, appraisal, or insurance shifts.
- **Holiday PTO coverage** — one accountable backup; file notes preserved.
- **File continuity after offer** — confirmation underwriting received the file.
- **Pre-travel condition walkthrough** — owners and due dates before holiday travel.
- **Cash-to-close before travel** — plain English if dates slip toward Thanksgiving week.

Follow-up at **216-250-9078**. Never **216-513-5139**.

---

## Human verify before extending CSV

| Item | Status |
|---|---|
| Pack competitor names from Monday SEEN rows | **Blocked** — NO_SNAPSHOT |
| Public competitor URLs opened this run | None |
| Review counts / star ratings in CSV | Empty per playbook |
| Dead phone in any draft | **Absent** |
# Competitor review teardown — Conrad Mortgage / Conrad Team

- Date: 2026-10-13 (Tuesday)
- Brand: Conrad Mortgage / Conrad Team
- Market: Cleveland, OH / Northeast Ohio
- Status: DRAFT — human review only
- Phone lock: 216-250-9078
- Do not publish: 216-513-5139
- Snapshot: **NO_SNAPSHOT** — no SEEN pack competitors from Monday audit (2026-10-12)

*Mirror of canonical CSV: `seo-system/output/week-1/competitor-reviews.csv`*

---

## Blocker (read first)

Monday's `gbp-categories.csv` (2026-10-12) has **no rows** with `our_listing_yn=N` and `verification=SEEN`. Per `competitor-teardown.md`, this run **cannot** name or score pack competitors.

This is the **eleventh consecutive Monday** without pack observation (prior: 2026-08-24 through 2026-10-05, plus 2026-10-12). The competitor set remains blocked until a human completes an incognito pack check.

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
| SUMMARY | Written | Mid-October verification + appraisal + pre-approval + holiday-buffer themes for Wed/Fri drafts |

---

## Generic review themes (industry — not pack-validated)

Use these to shape Conrad copy **without** naming competitors or inventing star counts. Replace with SEEN competitor quotes after pack observation.

### Praise themes (borrow for Conrad positioning)

| Theme | Polarity | Sample phrasing pattern | Implication for Conrad | Action |
|---|---|---|---|---|
| Realistic verification windows | praise | "told us what to refresh in October" / "didn't wait until Thanksgiving to ask for pay stubs" | **Mid-October document refresh** on milestone map | USE_IN_FRI_SERVICES |
| Appraisal date communication | praise | "called when appraisal moved" / "explained what we could still control" | **Proactive appraisal timing updates** when contract shifts | USE_IN_WED_REPLIES |
| Pre-approval explained honestly | praise | "clear what pre-approval meant for our offer" / "didn't oversell how fast we could close" | FTB: **pre-approval boundaries** on first calls | USE_IN_WED_REPLIES |
| Holiday buffer on timeline | praise | "built in time before Christmas" / "no fake year-end closing promise" | **Q4 holiday closing buffer** on purchase + refi | USE_IN_FRI_SERVICES |
| Conditions with owners | praise | "each condition had a name and due date" / "knew what we were waiting on" | Wed replies: **open conditions with owner** | USE_IN_WED_REPLIES |
| Cash-to-close before signing | praise | "walked fees before signing week" / "understood credits at the table" | Align **2026-10-09** services rows | USE_IN_FRI_SERVICES |
| Same contact mid-file | praise | "same person when underwriting got quiet" / "didn't start over every week" | Description: **named point person when timeline moves** | USE_IN_WED_REPLIES |
| Calm Q4 planning tone | praise | "steady about fall market" / "no panic about rates on every call" | Posts: **calm mid-October planning** without rate billboard | USE_IN_FRI_SERVICES |

### Complaint themes (address in Conrad process — never mock competitors)

| Theme | Polarity | Sample phrasing pattern | Implication for Conrad | Action |
|---|---|---|---|---|
| Last-minute verification scramble | complaint | "asked for new docs the week of closing" / "employer verification at the last second" | **Verification windows** explained in October | USE_IN_FRI_SERVICES |
| Appraisal silence | complaint | "found out appraisal slipped from our agent" / "never updated us on timeline" | **Proactive appraisal update** when dates shift | USE_IN_WED_REPLIES |
| Pre-approval oversold | complaint | "pre-approval didn't match final numbers" / "couldn't close on the date they promised" | **Pre-approval boundaries** — what it is/is not | USE_IN_WED_REPLIES |
| No holiday buffer | complaint | "closing pushed into holidays with no warning" / "offices closed and nobody answered" | **Holiday buffer** on signing targets | USE_IN_FRI_SERVICES |
| Underwriting black box | complaint | "just said in underwriting for weeks" / "no list of what was missing" | **Conditions list with owners and due dates** | USE_IN_WED_REPLIES |
| Fee shock at signing | complaint | "different numbers at the table" / "didn't understand cash to close" | **Cash-to-close before signing week** | USE_IN_WED_REPLIES |
| FTB timeline stress | complaint | "didn't know if we could meet earnest money deadline" | FTB: **earnest money + inspection timing** with pre-approval education | USE_IN_FRI_SERVICES |
| Post-clear-to-close ghosting | complaint | "couldn't reach anyone day before closing" | Origination GBP focus — reachable **216-250-9078** when urgent | USE_IN_WED_REPLIES |

---

## Mid-October verification + appraisal (October week-2 refresh — for posts and page copy)

When borrowers compare Cleveland mortgage teams in mid-October, public reviews often reward lenders who make **what still needs to happen before holidays** obvious:

1. **Verification windows** — which documents to refresh now vs what can wait until after an accepted offer?
2. **Appraisal timing** — who calls when the appraisal or contract date moves?
3. **Pre-approval boundaries** — what the letter supports for *your* file vs final approval?
4. **Holiday closing buffer** — honest signing targets when offices and conditions compress in Q4?
5. **Open conditions** — named owner and due date, not only “in underwriting”?

These complement **loan-team clarity** themes from 2026-10-06 and **category + Services alignment** from 2026-10-12 — use Wed/Fri jobs to cover review-reply hooks without repeating this week's GBP post angles verbatim.

---

## Alignment with recent drafts

| Source | Use for |
|---|---|
| Monday 2026-10-12 category audit | Mortgage lender OR broker + Loan agency secondary; align Services before category save |
| Friday 2026-10-09 services | Four QM rows — verification windows, appraisal timing, pre-approval boundaries, holiday buffer |
| Thu 2026-10-08 GBP posts | Stagger — mid-October file momentum already drafted; this run angles **competitor-derived trust themes** |
| Wed 2026-10-07 review replies | Extend with **appraisal updates + pre-approval boundaries + open conditions** |
| Tue 2026-10-06 competitor teardown | Prior generic themes (loan team, gift funds) — this run **narrows to mid-October verification/appraisal** |

---

## Publishing guardrails

- Phone in all drafts: **216-250-9078** only.
- Never **216-513-5139**.
- No invented review counts, star ratings, or Map Pack ranks.
- No named competitor callouts until pack names are SEEN in CSV.
- Site-watch 2026-10-13: theconradteam.com HTTP 200; public page **216-279-2223** — resolve before GBP paste.

# Competitor review teardown — Conrad Mortgage / Conrad Team

- Date: 2026-10-06 (Tuesday)
- Brand: Conrad Mortgage / Conrad Team
- Market: Cleveland, OH / Northeast Ohio
- Status: DRAFT — human review only
- Phone lock: 216-250-9078
- Do not publish: 216-513-5139
- Snapshot: **NO_SNAPSHOT** — no SEEN pack competitors from Monday audit (2026-10-05)

*Mirror of canonical CSV: `seo-system/output/week-1/competitor-reviews.csv`*

---

## Blocker (read first)

Monday's `gbp-categories.csv` (2026-10-05) has **no rows** with `our_listing_yn=N` and `verification=SEEN`. Per `competitor-teardown.md`, this run **cannot** name or score pack competitors.

This is the **ninth consecutive Monday** without pack observation (prior: 2026-08-24 through 2026-09-28, plus 2026-10-05). The competitor set remains blocked until a human completes an incognito pack check.

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
| SUMMARY | Written | Q4 loan-team + gift funds + cash-to-close themes for Wed/Fri drafts |

---

## Generic review themes (industry — not pack-validated)

Use these to shape Conrad copy **without** naming competitors or inventing star counts. Replace with SEEN competitor quotes after pack observation.

### Praise themes (borrow for Conrad positioning)

| Theme | Polarity | Sample phrasing pattern | Implication for Conrad | Action |
|---|---|---|---|---|
| Loan team roles explained | praise | "knew who was handling our file after we applied" / "processor vs underwriter made sense" | Posts + page: **Q4 loan-team clarity** after apply | USE_IN_FRI_SERVICES |
| October document refresh | praise | "helped us update pay stubs before holidays" / "refreshed docs before Q4 slowdown" | **October document refresh** on purchase + refi files | USE_IN_FRI_SERVICES |
| Gift fund paperwork early | praise | "walked us through gift letter timing" / "knew what the bank needed from family" | FTB: **gift-fund paperwork** before offer day | USE_IN_WED_REPLIES |
| Cash-to-close before signing | praise | "fees explained before we signed" / "understood credits at the table" | Align **2026-10-02** refi + purchase rows | USE_IN_FRI_SERVICES |
| Proactive date updates | praise | "called when closing moved" / "didn't wait for us to chase" | Wed replies: **proactive outreach when appraisal or contract dates shift** | USE_IN_WED_REPLIES |
| Same point person mid-file | praise | "same contact through underwriting" / "didn't start over every week" | Description: **named contact when timeline moves** | USE_IN_WED_REPLIES |
| Milestone map after apply | praise | "always knew what stage we were in" / "checklist after docs went in" | Carry **milestone map** from 2026-10-02 services | USE_IN_FRI_SERVICES |
| Honest Q4 timing talk | praise | "realistic about appraisal in fall" / "no fake closing dates" | Q4 messaging — **steady planning** without panic | USE_IN_WED_REPLIES |

### Complaint themes (address in Conrad process — never mock competitors)

| Theme | Polarity | Sample phrasing pattern | Implication for Conrad | Action |
|---|---|---|---|---|
| Handoff confusion after apply | complaint | "new person every week" / "didn't know who to email" | **Loan-team role clarity** on first follow-up | USE_IN_WED_REPLIES |
| Gift fund surprise mid-file | complaint | "found out gift letter was wrong late" / "family money delayed closing" | FTB: **gift paperwork** on early calls | USE_IN_WED_REPLIES |
| Stale documents in Q4 | complaint | "asked for old pay stubs at the last minute" | **October document refresh** before holidays | USE_IN_FRI_SERVICES |
| Fee shock at signing | complaint | "different numbers at the table" / "didn't understand cash to close" | **Cash-to-close before signing week** | USE_IN_WED_REPLIES |
| No update when closing slips | complaint | "found out closing moved from our agent" / "lender never called" | **Proactive update** when dates shift | USE_IN_WED_REPLIES |
| Underwriting black box | complaint | "no idea where our file was" / "just said 'in underwriting'" | Milestone map — **what happens after docs are in** | USE_IN_FRI_SERVICES |
| FTB timing stress | complaint | "didn't know if we could meet earnest money deadline" | FTB: **earnest money + inspection timing** | USE_IN_FRI_SERVICES |
| Post-clear-to-close ghosting | complaint | "couldn't reach anyone day before closing" | Origination GBP focus — reachable **216-250-9078** when urgent | USE_IN_WED_REPLIES |

---

## Q4 loan-team clarity (October week-1 refresh — for posts and page copy)

When borrowers compare Cleveland mortgage teams in early Q4, public reviews often reward lenders who make **who does what** obvious after application:

1. **Who owns the next step** — loan advisor, processor, underwriting handoffs?
2. **What documents to refresh in October** — before holidays slow tours and signatures?
3. **Gift-fund paperwork** — letters, sourcing, and timing for first-time buyers?
4. **Cash-to-close and fees** — reviewed before signing, not at the table?
5. **Proactive call or message** — when contract or closing dates move?

These complement (do not replace) **underwriting conditions** themes from 2026-09-29 — use Wed/Fri jobs to cover conditions and date-shift hooks without repeating this week's GBP post angles.

---

## Alignment with recent drafts

| Source | Use for |
|---|---|
| Monday 2026-10-05 category audit | Mortgage lender OR broker + Loan agency secondary; align Services before category save |
| Friday 2026-10-02 services | Four QM rows — Q4 loan team, gift funds, cash-to-close, October doc refresh |
| Wed 2026-09-30 review replies | Extend with **loan-team + gift-fund + cash-to-close** hooks |
| Mon 2026-10-05 GBP posts | Stagger — category posts already drafted; do not duplicate same week |

---

## Publishing guardrails

- Phone in all drafts: **216-250-9078** only.
- Never **216-513-5139**.
- No invented review counts, star ratings, or Map Pack ranks.
- No named competitor callouts until pack names are SEEN in CSV.
- Site-watch 2026-10-06: theconradteam.com HTTP 200; public page **216-279-2223** — resolve before GBP paste.

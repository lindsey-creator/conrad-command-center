# Competitor review teardown — Conrad Mortgage / Conrad Team

- Date: 2026-09-29 (Tuesday)
- Brand: Conrad Mortgage / Conrad Team
- Market: Cleveland, OH / Northeast Ohio
- Status: DRAFT — human review only
- Phone lock: 216-250-9078
- Do not publish: 216-513-5139
- Snapshot: **NO_SNAPSHOT** — no SEEN pack competitors from Monday audit (2026-09-28)

*Mirror of canonical CSV: `seo-system/output/week-1/competitor-reviews.csv`*

---

## Blocker (read first)

Monday's `gbp-categories.csv` (2026-09-28) has **no rows** with `our_listing_yn=N` and `verification=SEEN`. Per `competitor-teardown.md`, this run **cannot** name or score pack competitors.

This is the **eighth consecutive Monday** without pack observation (prior: 2026-08-24 through 2026-09-21, plus 2026-09-28). The competitor set remains blocked until a human completes an incognito pack check.

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
| SUMMARY | Written | Fall underwriting + conditions + proactive timeline themes for Wed/Fri drafts |

---

## Generic review themes (industry — not pack-validated)

Use these to shape Conrad copy **without** naming competitors or inventing star counts. Replace with SEEN competitor quotes after pack observation.

### Praise themes (borrow for Conrad positioning)

| Theme | Polarity | Sample phrasing pattern | Implication for Conrad | Action |
|---|---|---|---|---|
| Conditions explained plainly | praise | "told us what each condition meant" / "knew why they needed that letter" | Page + posts: **conditions with owners** — not mystery requests | USE_IN_FRI_SERVICES |
| Proactive date updates | praise | "called when closing moved" / "didn't wait for us to chase" | Wed replies + posts: **proactive outreach when appraisal or contract dates shift** | USE_IN_WED_REPLIES |
| Open conditions list | praise | "always knew what was still open" / "checklist before signing week" | Align with 2026-09-25 **milestone map + conditions** | USE_IN_FRI_SERVICES |
| Appraisal timeline clarity | praise | "explained appraisal timing in fall market" / "realistic about turnaround" | Fall file rhythm — no billboard dates | USE_IN_WED_REPLIES |
| Earnest money / inspection tied to loan | praise | "helped us understand inspection vs loan timing" | FTB service row + Wed replies for nervous buyers | USE_IN_WED_REPLIES |
| Cash-to-close before signing | praise | "walked fees before we signed" / "no surprise at the table" | Carry refi + purchase **fee clarity** (2026-09-25 services) | USE_IN_FRI_SERVICES |
| Same point person mid-file | praise | "same contact through underwriting" / "didn't start over every week" | Description: **named contact when timeline moves** — not only at application | USE_IN_WED_REPLIES |
| Honest slow-down conversations | praise | "said underwriting was backed up and what to expect" | Q4 messaging — **steady market planning** without panic | USE_IN_WED_REPLIES |

### Complaint themes (address in Conrad process — never mock competitors)

| Theme | Polarity | Sample phrasing pattern | Implication for Conrad | Action |
|---|---|---|---|---|
| Surprise conditions signing week | complaint | "new items the week of closing" / "conditions out of nowhere" | **Open conditions list** + owners before signing week | USE_IN_WED_REPLIES |
| No update when closing slips | complaint | "found out closing moved from our agent" / "lender never called" | **Proactive update** when dates shift — Wed reply hooks | USE_IN_WED_REPLIES |
| Document requests without why | complaint | "kept asking for letters with no context" | Checklist with **why each item matters** (2026-09-25 FTB row) | USE_IN_FRI_SERVICES |
| Underwriting black box | complaint | "no idea where our file was" / "just said 'in underwriting'" | Milestone map — **what happens after docs are in** | USE_IN_FRI_SERVICES |
| Appraisal delay silence | complaint | "appraisal took weeks and nobody explained" | Appraisal status in **proactive update** language | USE_IN_WED_REPLIES |
| Rate changed mid-file | complaint | "different terms after we started" / "fees higher at closing" | Education only; **cash-to-close before signing** | USE_IN_WED_REPLIES |
| FTB timing stress | complaint | "didn't know if we could meet earnest money deadline" | FTB: **earnest money + inspection timing** on first calls | USE_IN_FRI_SERVICES |
| Post-clear-to-close ghosting | complaint | "couldn't reach anyone day before closing" | Origination GBP focus — reachable **216-250-9078** when urgent | USE_IN_WED_REPLIES |

---

## Fall file rhythm + conditions ownership (September week-5 refresh — for posts and page copy)

When borrowers compare Cleveland mortgage teams in late Q3 / early Q4, public reviews often reward lenders who make **underwriting and closing weeks** predictable:

1. **What each condition is for** — plain English, not jargon?
2. **Who owns clearing each item** — borrower, processor, or third party?
3. **When you will hear back** — after docs, after appraisal, when underwriting finishes?
4. **Proactive call or message** — when contract or closing dates move?
5. **Cash-to-close and fees** — reviewed before signing, not at the table?

These complement (do not replace) **pre-approval clarity** themes from 2026-09-22 — use Wed/Fri jobs to cover response windows and first-call prep without repeating this week's GBP post angles.

---

## Alignment with recent drafts

| Source | Use for |
|---|---|
| Monday 2026-09-28 category audit | Mortgage lender OR broker + Loan agency secondary; align Services before category save |
| Friday 2026-09-25 services | Four QM rows — fall rhythm, conditions, milestone map, proactive updates |
| Wed 2026-09-23 review replies | Extend with **conditions + date-shift** hooks |
| Thu 2026-09-24 GBP posts | Stagger — fall rhythm posts already drafted; do not duplicate same week |

---

## Publishing guardrails

- Phone in all drafts: **216-250-9078** only.
- Never **216-513-5139**.
- No invented review counts, star ratings, or Map Pack ranks.
- No named competitor callouts until pack names are SEEN in CSV.
- Site-watch 2026-09-29: theconradteam.com HTTP 200; public page **216-279-2223** — resolve before GBP paste.

# Competitor review teardown — Conrad Mortgage / Conrad Team

- Date: 2026-09-22 (Tuesday)
- Brand: Conrad Mortgage / Conrad Team
- Market: Cleveland, OH / Northeast Ohio
- Status: DRAFT — human review only
- Phone lock: 216-250-9078
- Do not publish: 216-513-5139
- Snapshot: **NO_SNAPSHOT** — no SEEN pack competitors from Monday audit (2026-09-21)

*Mirror of canonical CSV: `seo-system/output/week-1/competitor-reviews.csv`*

---

## Blocker (read first)

Monday's `gbp-categories.csv` (2026-09-21) has **no rows** with `our_listing_yn=N` and `verification=SEEN`. Per `competitor-teardown.md`, this run **cannot** name or score pack competitors.

This is the **sixth consecutive Monday** without pack observation (prior: 2026-08-24, 2026-08-31, 2026-09-07, 2026-09-14, 2026-09-21). The competitor set remains blocked until a human completes an incognito pack check.

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
| SUMMARY | Written | Pre-approval clarity + first-call accountability themes for Wed/Fri drafts |

---

## Generic review themes (industry — not pack-validated)

Use these to shape Conrad copy **without** naming competitors or inventing star counts. Replace with SEEN competitor quotes after pack observation.

### Praise themes (borrow for Conrad positioning)

| Theme | Polarity | Sample phrasing pattern | Implication for Conrad | Action |
|---|---|---|---|---|
| Fast first response | praise | "called back the same day" / "answered my questions on the first call" | Posts + page: **realistic response window** after inquiry or application | USE_IN_WED_REPLIES |
| Pre-approval explained | praise | "knew the difference between pre-qualified and pre-approved" / "clear on what pre-approval meant for our offer" | Service copy: **pre-approval clarity** language (2026-09-18 services) | USE_IN_FRI_SERVICES |
| Named point person | praise | "always knew who to call" / "one person owned our file" | Description: **point person + milestone map** — not a rotating inbox | USE_IN_WED_REPLIES |
| Document checklist upfront | praise | "sent a list before we applied" / "knew what to upload first" | Align with 2026-09-18 **document checklist before underwriting** | USE_IN_FRI_SERVICES |
| Honest timeline on first call | praise | "didn't overpromise closing" / "realistic about how long it takes" | Posts: **no billboard dates** — milestones instead | USE_IN_WED_REPLIES |
| First-time buyer patience | praise | "never made us feel dumb" / "walked us through every step" | FTB service row + Wed replies for nervous buyers | USE_IN_WED_REPLIES |
| Refi evaluation without pressure | praise | "told us when refi didn't make sense" / "ran numbers honestly" | Refi service copy: **timing + cash-to-close before signing** | USE_IN_FRI_SERVICES |
| Local knowledge | praise | "understood Cleveland market" / "helpful for Northeast Ohio" | Map Pack notes: local context without steering | USE_IN_FRI_SERVICES |

### Complaint themes (address in Conrad process — never mock competitors)

| Theme | Polarity | Sample phrasing pattern | Implication for Conrad | Action |
|---|---|---|---|---|
| Radio silence after application | complaint | "never heard back after we applied" / "weeks with no update" | Named contact + **when you will hear back** after key steps | USE_IN_WED_REPLIES |
| Pre-approval confusion | complaint | "thought we were approved but weren't" / "letter wasn't worth anything" | Plain English: **pre-qualified vs pre-approved** on page + posts | USE_IN_FRI_SERVICES |
| Handoff whack-a-mole | complaint | "new person every call" / "had to re-explain our story" | **One point person** through milestones | USE_IN_WED_REPLIES |
| Document requests without context | complaint | "kept asking for stuff with no explanation" | Checklist with **why each item matters** | USE_IN_FRI_SERVICES |
| Bait-and-switch on rates | complaint | "rate changed after we started" / "different than advertised" | Education only; no rate quotes in GBP copy | USE_IN_WED_REPLIES |
| Overpromised closing date | complaint | "promised 30 days, took 60" | Milestone map — not a billboard closing date | USE_IN_WED_REPLIES |
| Last-minute conditions | complaint | "new requirements the week of closing" | Carry 2026-09-15 closing-week themes in Wed replies — not duplicate Tue posts | USE_IN_WED_REPLIES |
| Post-close ghosting | complaint | "couldn't reach anyone after closing" | Origination GBP focus — do not claim servicing unless verified | IGNORE |

---

## Pre-approval clarity + first-call accountability (September week-4 refresh — for posts and page copy)

When borrowers compare Cleveland mortgage teams, public reviews often reward lenders who make **the first two weeks** predictable:

1. **What pre-approval means for your file** — pre-qualified vs pre-approved, in plain English?
2. **Who owns your file** — one named contact, not a rotating queue?
3. **When you will hear back** — after application, after documents, after underwriting?
4. **What documents to gather first** — before underwriting starts whack-a-mole?
5. **Realistic timeline** — milestones, not a billboard closing date on the first call?

These complement (do not replace) **closing-week transparency** themes from 2026-09-15 — use Wed/Fri jobs to cover conditions, appraisal, and cash-to-close without repeating this week's GBP post angles.

---

## Alignment with recent drafts

| Source | Use for |
|---|---|
| Monday 2026-09-21 category audit | Mortgage lender OR broker + Loan agency secondary; category/services parity |
| Friday 2026-09-18 services | Four QM service rows — pre-approval clarity, FTB first call, refi timing, point person |
| Wed 2026-09-16 review replies | Closing-week transparency — extend with **response window** hooks |
| Thu 2026-09-17 GBP posts | Stagger — do not publish duplicate themes same week |

---

## Publishing guardrails

- Phone in all drafts: **216-250-9078** only.
- Never **216-513-5139**.
- No invented review counts, star ratings, or Map Pack ranks.
- No named competitor callouts until pack names are SEEN in CSV.
- Site-watch 2026-09-22: theconradteam.com HTTP 200; public page **216-279-2223** — resolve before GBP paste.

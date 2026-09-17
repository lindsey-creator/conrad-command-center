# Competitor review teardown — Conrad Mortgage / Conrad Team

- Date: 2026-09-15 (Tuesday)
- Brand: Conrad Mortgage / Conrad Team
- Market: Cleveland, OH / Northeast Ohio
- Status: DRAFT — human review only
- Phone lock: 216-250-9078
- Do not publish: 216-513-5139
- Snapshot: **NO_SNAPSHOT** — no SEEN pack competitors from Monday audit (2026-09-14)

*Mirror of canonical CSV: `seo-system/output/week-1/competitor-reviews.csv`*

---

## Blocker (read first)

Monday's `gbp-categories.csv` (2026-09-14) has **no rows** with `our_listing_yn=N` and `verification=SEEN`. Per `competitor-teardown.md`, this run **cannot** name or score pack competitors.

This is the **fifth consecutive Monday** without pack observation (prior: 2026-08-24, 2026-08-31, 2026-09-07, 2026-09-14). The competitor set remains blocked until a human completes an incognito pack check.

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
| SUMMARY | Written | Closing-week transparency themes for Wed/Fri drafts |

---

## Generic review themes (industry — not pack-validated)

Use these to shape Conrad copy **without** naming competitors or inventing star counts. Replace with SEEN competitor quotes after pack observation.

### Praise themes (borrow for Conrad positioning)

| Theme | Polarity | Sample phrasing pattern | Implication for Conrad | Action |
|---|---|---|---|---|
| Smooth closing | praise | "smooth closing from start to finish" / "no surprises at the table" | Posts + page: **closing-week milestone map** — what happens when | USE_IN_WED_REPLIES |
| Early condition clarity | praise | "knew exactly what was still needed" / "list of items upfront" | Service copy: **underwriting conditions with owners and due dates** | USE_IN_FRI_SERVICES |
| Fee honesty | praise | "closing costs matched what we discussed" / "no hidden fees" | Description: review **cash-to-close before signing** — not day-of | USE_IN_WED_REPLIES |
| Appraisal communication | praise | "appraisal came in on time" / "kept us updated on appraisal" | Posts: **when appraisal is ordered** and what happens if value differs | USE_IN_WED_REPLIES |
| Document prep | praise | "told us what to upload and when" | Align with 2026-09-11 **document checklist** language | USE_IN_FRI_SERVICES |
| Plain-language underwriting | praise | "explained why they needed that letter" / "made conditions make sense" | Wed replies: explain **why** a condition exists, not just "send this" | USE_IN_WED_REPLIES |
| Proactive delay updates | praise | "called when there was a delay" / "never left us guessing" | Posts: **timeline slip protocol** — who calls, what changed | USE_IN_WED_REPLIES |
| Local knowledge | praise | "understood Cleveland market" / "helpful for Northeast Ohio" | Map Pack notes: local market context without steering | USE_IN_FRI_SERVICES |

### Complaint themes (address in Conrad process — never mock competitors)

| Theme | Polarity | Sample phrasing pattern | Implication for Conrad | Action |
|---|---|---|---|---|
| Last-minute conditions | complaint | "new requirements the week of closing" | Closing-week posts: **condition sprint** early; flag open items weekly | USE_IN_WED_REPLIES |
| Fee surprises at signing | complaint | "fees changed at closing" / "higher than quoted" | No rate quotes; **cash-to-close review** before signing appointment | USE_IN_FRI_SERVICES |
| Appraisal silence | complaint | "no update on appraisal for weeks" | Milestone updates after order and after receipt | USE_IN_WED_REPLIES |
| Document whack-a-mole | complaint | "kept asking for the same documents" | Checklist tied to file type; confirm receipt | USE_IN_FRI_SERVICES |
| Clear-to-close confusion | complaint | "thought we were clear to close but weren't" | Define **clear-to-close** in plain English on page + posts | USE_IN_WED_REPLIES |
| Rate vs. reality | complaint | "rate was different than promised" | Education only; every situation is different | USE_IN_WED_REPLIES |
| Post-close servicing | complaint | "couldn't reach anyone after closing" | Origination GBP focus — do not claim servicing unless verified | IGNORE |

---

## Closing-week transparency (September week-3 refresh — for posts and page copy)

When borrowers compare Cleveland mortgage teams, public reviews often reward lenders who make **the last mile** predictable:

1. **What conditions are open** — and who owns clearing each one?
2. **When appraisal is ordered** — and how will you tell me if timing or value shifts?
3. **When cash-to-close is final** — reviewed before signing, not at the table?
4. **What “clear to close” means** — and what still has to happen before keys?
5. **Who calls if the timeline slips** — and what changed?

Conrad drafts should mirror these cues without naming pack competitors or inventing review stats. Align with Friday 2026-09-11 services (document checklist · refi five questions · closing-week clarity).

---

## Competitor observation template (fill after pack check)

| observed_date | competitor_name | source_url | review_count | star_rating | theme | polarity | sample_phrase | implication_for_conrad | action | verification |
|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | |
| | | | | | | | | | | |

**Rules:** Leave count/star empty unless seen on the page you opened. No fabricated quotes.

---

## Known industry presence (names only — not pack-validated)

Large Cleveland mortgage brands often appear in local search (e.g., CrossCountry Mortgage, Howard Hanna Mortgage Services, regional banks). **Do not** treat these as pack competitors or cite their review metrics until a human records them in `gbp-categories.csv` with `verification=SEEN`.

---

## Phone check

| Number | Rule |
|---|---|
| 216-250-9078 | Use in all drafts and recommended GBP edits |
| 216-279-2223 | Seen on theconradteam.com (2026-09-15 site-watch) — resolve before paste |
| 216-513-5139 | **Dead — never publish.** If an unverified Maps pin shows it, flag `FLAG_UNVERIFIED_MAPS`; do not overwrite without proof of control |

---

## Do not

- Invent pack ranks, review counts, or star ratings
- Score Conrad "vs." competitors numerically
- Log into Google from this automation
- Publish review replies or posts without human review
- Recommend 216-513-5139 anywhere

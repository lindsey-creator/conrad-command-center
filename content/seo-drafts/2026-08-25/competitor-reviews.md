# Competitor review teardown — Conrad Mortgage / Conrad Team

- Date: 2026-08-25 (Tuesday)
- Brand: Conrad Mortgage / Conrad Team
- Market: Cleveland, OH / Northeast Ohio
- Status: DRAFT — human review only
- Phone lock: 216-250-9078
- Do not publish: 216-513-5139
- Snapshot: **NO_SNAPSHOT** — no SEEN pack competitors from Monday audit

*Mirror of canonical CSV: `seo-system/output/week-1/competitor-reviews.csv`*

---

## Blocker (read first)

Monday’s `gbp-categories.csv` (2026-08-24) has **no rows** with `our_listing_yn=N` and `verification=SEEN`. Per `competitor-teardown.md`, this run **cannot** name or score pack competitors.

**Human action before Wednesday review-replies:**

1. Search the five target queries in incognito (see `map-pack-targeting.md`).
2. Record **business names only** in `gbp-categories.csv` with `verification=SEEN`.
3. Open each named competitor’s **public** Google listing or review surface.
4. Add rows to `competitor-reviews.csv` with themes in their words — empty `review_count` / `star_rating` unless visible.

---

## CSV status this run

| Row type | Status | Notes |
|---|---|---|
| Header | Written | Matches prompt spec |
| Competitor rows | **None** | NO_SNAPSHOT — no pack names from Monday |
| SUMMARY | Written | Process themes for Wed/Fri drafts only |

---

## Generic review themes (industry — not pack-validated)

Use these to shape Conrad copy **without** naming competitors or inventing star counts. Replace with SEEN competitor quotes after pack observation.

### Praise themes (borrow for Conrad positioning)

| Theme | Polarity | Sample phrasing pattern | Implication for Conrad | Action |
|---|---|---|---|---|
| Responsive communication | praise | “answered my questions quickly” / “kept me in the loop” | Draft GBP posts + description that promise **documented next steps** and **proactive updates** | USE_IN_WED_REPLIES |
| Plain-language guidance | praise | “explained every step” / “made a complicated process simple” | FTB + purchase copy: checklist language, no jargon walls | USE_IN_FRI_SERVICES |
| Timeliness | praise | “everything progressed quickly” / “timely updates” | Service page: timeline expectations from application to clear-to-close | USE_IN_FRI_SERVICES |
| Availability | praise | “always available” / “picked up the phone” | Description + posts: “real people answer” — phone 216-250-9078 once per asset | USE_IN_WED_REPLIES |
| First-time buyer patience | praise | “guided us through our first time homeowner journey” | FTB service row + FAQ — education, not credit decision | USE_IN_FRI_SERVICES |
| Closing support | praise | “smooth closing from start to finish” | Map Pack notes: closing coordination as differentiator (no attendance claims unless verified) | USE_IN_WED_REPLIES |

### Complaint themes (address in Conrad process — never mock competitors)

| Theme | Polarity | Sample phrasing pattern | Implication for Conrad | Action |
|---|---|---|---|---|
| Ghosting / silence | complaint | “couldn’t get a call back” / “left in the dark” | Review replies + posts: name **who** owns the next step and **when** to expect contact | USE_IN_WED_REPLIES |
| Last-minute surprises | complaint | “fees changed at closing” / “no surprises” (inverse praise) | Refi + purchase copy: document fee/timeline conversations honestly | USE_IN_FRI_SERVICES |
| Bait-and-switch on rates | complaint | “rate was different than quoted” | No rate quotes in drafts; “every situation is different” language | USE_IN_WED_REPLIES |
| Process confusion | complaint | “didn’t know what documents were needed” | Service page: pre-approval checklist + document list CTA | USE_IN_FRI_SERVICES |
| Slow closing | complaint | “delays with no explanation” | Posts: proactive milestone updates (without promising specific days) | USE_IN_WED_REPLIES |

---

## Competitor observation template (fill after pack check)

| observed_date | competitor_name | source_url | review_count | star_rating | theme | polarity | sample_phrase | implication_for_conrad | action | verification |
|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | |
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
| 216-279-5821 | Seen on theconradteam.com in prior site-watch — resolve before paste |
| 216-513-5139 | **Dead — never publish.** If an unverified Maps pin shows it, flag `FLAG_UNVERIFIED_MAPS`; do not overwrite without proof of control |

---

## Do not

- Invent pack ranks, review counts, or star ratings
- Score Conrad “vs.” competitors numerically
- Log into Google from this automation
- Publish review replies or posts without human review
- Recommend 216-513-5139 anywhere

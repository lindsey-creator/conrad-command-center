# Competitor review teardown — Conrad Mortgage / Conrad Team

- Date: 2026-10-20 (Tuesday)
- Brand: Conrad Mortgage / Conrad Team
- Market: Cleveland, OH / Northeast Ohio
- Status: DRAFT — human review only
- Phone lock: 216-250-9078
- Do not publish: 216-513-5139
- Snapshot: **NO_SNAPSHOT** — no SEEN pack competitors from Monday audit (2026-10-19)

*Mirror of canonical CSV: `seo-system/output/week-1/competitor-reviews.csv`*

---

## Blocker (read first)

Monday's `gbp-categories.csv` (2026-10-19) has **no rows** with `our_listing_yn=N` and `verification=SEEN`. Per `competitor-teardown.md`, this run **cannot** name or score pack competitors.

This is the **twelfth consecutive Monday** without pack observation (prior: 2026-08-24 through 2026-10-12, plus 2026-10-19). The competitor set remains blocked until a human completes an incognito pack check.

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
| SUMMARY | Written | Under-contract Q4 themes for Wed/Fri drafts |

---

## Generic review themes (industry — not pack-validated)

Use these to shape Conrad copy **without** naming competitors or inventing star counts. Replace with SEEN competitor quotes after pack observation.

### Praise themes (borrow for Conrad positioning)

| Theme | Polarity | Sample phrasing pattern | Implication for Conrad | Action |
|---|---|---|---|---|
| Inspection + loan calendars explained | praise | "helped us line up inspection and loan deadlines" / "knew which contract date affected our upload" | **Parallel-track calendar** when under contract in Q4 | USE_IN_FRI_SERVICES |
| Open conditions with owners | praise | "each condition had a name" / "knew if we or the lender owed the next item" | **Open conditions with clear owners** on milestone map | USE_IN_WED_REPLIES |
| First 72 hours after offer | praise | "told us what to upload in the first three days" / "confirmed the file was assigned" | **Post-offer FTB rhythm** — earnest money + uploads | USE_IN_WED_REPLIES |
| Title / move buffer before holidays | praise | "built time for title before Christmas" / "honest about year-end signing" | **Title and move calendar buffer** on purchase + refi | USE_IN_FRI_SERVICES |
| Written contact when dates shift | praise | "emailed when inspection pushed our timeline" / "one person to message, not a generic inbox" | **Named point person + written updates** when either track moves | USE_IN_WED_REPLIES |
| Cash-to-close before signing | praise | "walked fees before signing week" / "understood credits at the table" | Align **2026-10-16** services rows | USE_IN_FRI_SERVICES |
| Calm under-contract tone | praise | "didn't panic when appraisal slipped" / "steady updates in October" | Posts: **calm Q4 under-contract** without rate billboard | USE_IN_FRI_SERVICES |
| Gift-fund paperwork early | praise | "gift letter checklist before underwriting stalled" | FTB: **gift-fund basics** in first 72 hours | USE_IN_WED_REPLIES |

### Complaint themes (address in Conrad process — never mock competitors)

| Theme | Polarity | Sample phrasing pattern | Implication for Conrad | Action |
|---|---|---|---|---|
| Loan team unaware of inspection dates | complaint | "underwriting asked for docs after inspection contingency" / "nobody read our contract dates" | **Inspection + loan overlap** on shared calendar | USE_IN_FRI_SERVICES |
| Conditions without owners | complaint | "just said in underwriting for weeks" / "couldn't tell who was waiting on what" | **Conditions list with owners and due dates** | USE_IN_WED_REPLIES |
| Slow start after offer | complaint | "didn't know if our file was received" / "earnest money stress with no contact" | **First 72 hours** — assignment confirmation | USE_IN_WED_REPLIES |
| Title surprise near signing | complaint | "title issue the week of closing" / "no buffer before holidays" | **Title/move buffer** on honest signing targets | USE_IN_FRI_SERVICES |
| Inspection result silence | complaint | "found out appraisal moved from our agent" / "never updated us when inspection failed" | **Proactive update** when inspection or appraisal shifts | USE_IN_WED_REPLIES |
| Fee shock at signing | complaint | "different numbers at the table" / "didn't understand cash to close" | **Cash-to-close before signing week** | USE_IN_WED_REPLIES |
| Rotating contacts mid-file | complaint | "new person every week" / "had to re-explain our file" | **Named point person** through under contract | USE_IN_WED_REPLIES |
| Post-clear-to-close ghosting | complaint | "couldn't reach anyone day before closing" | Reachable **216-250-9078** when urgent | USE_IN_WED_REPLIES |

---

## Under contract in Q4 (late-October refresh — for posts and page copy)

When borrowers compare Cleveland mortgage teams after **offer acceptance** in Q4, public reviews often reward lenders who make **parallel calendars and ownership** obvious:

1. **Inspection + loan overlap** — which contract dates affect document deadlines vs inspection milestones?
2. **Open conditions** — named owner and due date, not only “in underwriting”?
3. **First 72 hours** — what uploads matter right after offer, and who confirms the file is assigned?
4. **Title and move buffer** — honest signing targets when title, conditions, and holidays compress?
5. **Written updates** — who to contact when either the inspection track or loan track moves?

These complement **mid-October verification** themes from 2026-10-13 and **category + Services alignment** from 2026-10-19 — use Wed/Fri jobs to cover review-reply hooks without repeating Thu 2026-10-15 or Mon 2026-10-19 post angles verbatim.

---

## Alignment with recent drafts

| Source | Use for |
|---|---|
| Monday 2026-10-19 category audit | Mortgage lender OR broker + Loan agency secondary; align Services before category save |
| Friday 2026-10-16 services | Four QM rows — inspection + loan overlap, open conditions, first 72 hours, title/move buffer |
| Thu 2026-10-15 GBP posts | Stagger — under-contract Q4 posts already drafted; this run angles **competitor-derived trust themes** |
| Wed 2026-10-14 review replies | Extend with **conditions ownership + post-offer rhythm + title buffer** |
| Tue 2026-10-13 competitor teardown | Prior generic themes (verification/appraisal) — this run **narrows to under-contract Q4 calendars** |

---

## Publishing guardrails

- Phone in all drafts: **216-250-9078** only.
- Never **216-513-5139**.
- No invented review counts, star ratings, or Map Pack ranks.
- No named competitor callouts until pack names are SEEN in CSV.
- Site-watch 2026-10-20: theconradteam.com HTTP 200; public page **216-279-2223** — resolve before GBP paste.

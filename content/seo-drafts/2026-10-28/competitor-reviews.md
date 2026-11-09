# Competitor review teardown — Conrad Mortgage / Conrad Team

- Date: 2026-10-28 (Tuesday)
- Brand: Conrad Mortgage / Conrad Team
- Market: Cleveland, OH / Northeast Ohio
- Status: DRAFT — human review only
- Phone lock: 216-250-9078
- Do not publish: 216-513-5139
- Snapshot: **NO_SNAPSHOT** — no SEEN pack competitors from Monday audit (2026-10-26)

*Mirror of canonical CSV: `seo-system/output/week-1/competitor-reviews.csv`*

---

## Blocker (read first)

Monday's `gbp-categories.csv` (2026-10-26) has **no rows** with `our_listing_yn=N` and `verification=SEEN`. Per `competitor-teardown.md`, this run **cannot** name or score pack competitors.

This is the **fourteenth consecutive Monday** without pack observation (prior: 2026-08-24 through 2026-10-19, plus 2026-10-26). The competitor set remains blocked until a human completes an incognito pack check.

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
| SUMMARY | Written | Late-October / winter-shopping themes for Wed/Fri drafts |

---

## Generic review themes (industry — not pack-validated)

Use these to shape Conrad copy **without** naming competitors or inventing star counts. Replace with SEEN competitor quotes after pack observation.

### Praise themes (borrow for Conrad positioning)

| Theme | Polarity | Sample phrasing pattern | Implication for Conrad | Action |
|---|---|---|---|---|
| Written update when appraisal moves | praise | "emailed when appraisal slipped" / "told us the new date in writing" | **Written appraisal/inspection updates** — what shifted and who owns next steps | USE_IN_WED_REPLIES |
| Document refresh before holidays | praise | "asked for updated pay stubs before Thanksgiving" / "kept our file current" | **Document refresh + holiday buffer** on purchase and refi | USE_IN_FRI_SERVICES |
| Pre-approval explained honestly | praise | "didn't oversell pre-approval" / "said what still had to be verified" | **Pre-approval boundaries for winter shopping** on FTB calls | USE_IN_FRI_SERVICES |
| Refi timeline before rate talk | praise | "walked our calendar first" / "said when waiting made sense" | **Calendar-first refi** before year-end | USE_IN_FRI_SERVICES |
| File assigned after offer | praise | "confirmed our file was received after we went under contract" / "same team from pre-approval" | **Post-offer file continuity** — no restart from zero | USE_IN_WED_REPLIES |
| Open conditions with owners | praise | "each condition had a name" / "knew if we or the lender owed the next item" | **Open conditions with clear owners** on milestone map | USE_IN_WED_REPLIES |
| Named point person mid-file | praise | "one person to message, not a generic inbox" / "same contact through October" | **Named point person** when timelines compress | USE_IN_WED_REPLIES |
| Cash-to-close before signing | praise | "walked fees before signing week" / "understood credits at the table" | Align **2026-10-23** services rows | USE_IN_FRI_SERVICES |
| Calm late-October tone | praise | "steady updates when inspection pushed" / "no panic in October" | Posts: **late-October file rhythm** without rate billboard | USE_IN_FRI_SERVICES |
| Gift-fund paperwork early | praise | "gift letter checklist before underwriting stalled" | FTB: **gift-fund basics** before winter shopping peaks | USE_IN_WED_REPLIES |

### Complaint themes (address in Conrad process — never mock competitors)

| Theme | Polarity | Sample phrasing pattern | Implication for Conrad | Action |
|---|---|---|---|---|
| Silence when appraisal/inspection shifts | complaint | "found out from our agent" / "never updated us when inspection failed" | **Proactive written update** when either track moves | USE_IN_WED_REPLIES |
| Stale documents near signing | complaint | "underwriting asked for new docs the week of closing" / "holiday surprise requests" | **Document refresh** early + realistic signing targets | USE_IN_FRI_SERVICES |
| Pre-approval oversold | complaint | "told us we were approved then issues at underwriting" / "shopping on a letter that wasn't real" | **Pre-approval boundaries** — education, not guarantees | USE_IN_WED_REPLIES |
| Refi sold on rate only | complaint | "never talked timeline" / "rate changed and nobody explained break-even" | **Calendar-first refi** — fees and timing before signing week | USE_IN_FRI_SERVICES |
| File restart after offer | complaint | "had to re-upload everything" / "new person didn't know our pre-approval" | **File received + assigned** confirmation in first 72 hours | USE_IN_WED_REPLIES |
| Conditions without owners | complaint | "just said in underwriting for weeks" / "couldn't tell who was waiting on what" | **Conditions list with owners and due dates** | USE_IN_WED_REPLIES |
| Fee shock at signing | complaint | "different numbers at the table" / "didn't understand cash to close" | **Cash-to-close before signing week** | USE_IN_WED_REPLIES |
| Rotating contacts mid-file | complaint | "new person every week" / "had to re-explain our file" | **Named point person** through late October | USE_IN_WED_REPLIES |
| Post-clear-to-close ghosting | complaint | "couldn't reach anyone day before closing" | Reachable **216-250-9078** when urgent | USE_IN_WED_REPLIES |

---

## Late-October file rhythm (refresh — for posts and page copy)

When borrowers compare Cleveland mortgage teams in **late October** — winter shopping, refi before year-end, or files already under contract — public reviews often reward lenders who make **written updates, document rhythm, and honest pre-approval boundaries** obvious:

1. **Written appraisal/inspection updates** — what changed on **your** file, who owns next steps, and the next date you should hear from us.
2. **Document refresh + holidays** — which items may need updating before signing when pay periods or year-end compress timelines.
3. **Pre-approval boundaries for winter shopping** — what pre-approval means for **your** file before showings and offers.
4. **Calendar-first refi** — timeline, title, and conditions before rate or payment talk; honest guidance when waiting makes sense.
5. **Post-offer continuity** — confirmation the file is **received and assigned** so the process does not restart from zero.

These complement **under-contract Q4 calendar** themes from 2026-10-20 and **GBP Services alignment** from 2026-10-23 — use Wed/Fri jobs to cover review-reply hooks without repeating Thu 2026-10-22 or Mon 2026-10-26 post angles verbatim.

---

## Alignment with recent drafts

| Source | Use for |
|---|---|
| Monday 2026-10-26 category audit | Mortgage lender OR broker + Loan agency secondary; align Services before category save |
| Friday 2026-10-23 services | Four QM rows — written updates, appraisal/inspection clarity, pre-approval boundaries, calendar-first refi |
| Thu 2026-10-22 GBP posts | Stagger — late-October post set already drafted; this run angles **competitor-derived trust themes** |
| Wed 2026-10-21 review replies | Extend with **written date-shift updates + pre-approval boundaries + document refresh** |
| Tue 2026-10-20 competitor teardown | Prior generic themes (under-contract Q4 calendars) — this run **widens to winter shopping + late-October file rhythm** |

---

## Publishing guardrails

- Phone in all drafts: **216-250-9078** only.
- Never **216-513-5139**.
- No invented review counts, star ratings, or Map Pack ranks.
- No named competitor callouts until pack names are SEEN in CSV.
- Site-watch 2026-10-28: theconradteam.com HTTP 200; public page **216-279-2223** — resolve before GBP paste.

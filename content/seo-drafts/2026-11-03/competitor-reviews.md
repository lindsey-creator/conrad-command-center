# Competitor review teardown — Conrad Mortgage / Conrad Team

- Date: 2026-11-03 (Tuesday)
- Brand: Conrad Mortgage / Conrad Team
- Market: Cleveland, OH / Northeast Ohio
- Status: DRAFT — human review only
- Phone lock: 216-250-9078
- Do not publish: 216-513-5139
- Snapshot: **NO_SNAPSHOT** — no SEEN pack competitors from Monday audit (2026-11-02)

*Mirror of canonical CSV: `seo-system/output/week-1/competitor-reviews.csv`*

---

## Blocker (read first)

Monday's `gbp-categories.csv` (2026-11-02) has **no rows** with `our_listing_yn=N` and `verification=SEEN`. Per `competitor-teardown.md`, this run **cannot** name or score pack competitors.

This is the **fifteenth consecutive Monday** without pack observation (prior: 2026-08-24 through 2026-10-26, plus 2026-11-02). The competitor set remains blocked until a human completes an incognito pack check.

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
| SUMMARY | Written | Early November / pre-Thanksgiving themes for Wed/Fri drafts |

---

## Generic review themes (industry — not pack-validated)

Use these to shape Conrad copy **without** naming competitors or inventing star counts. Replace with SEEN competitor quotes after pack observation.

### Praise themes (borrow for Conrad positioning)

| Theme | Polarity | Sample phrasing pattern | Implication for Conrad | Action |
|---|---|---|---|---|
| Gift letter checklist before underwriting | praise | "had gift-fund paperwork ready early" / "knew what the donor letter needed" | **Gift-fund paperwork early** on FTB files before Thanksgiving underwriting | USE_IN_WED_REPLIES |
| File received after offer | praise | "confirmed our file was in the system after acceptance" / "same team from pre-approval" | **Post-offer file received and assigned** — no restart from zero | USE_IN_WED_REPLIES |
| Cash-to-close before signing week | praise | "walked fees before we signed" / "understood credits at the table" | **Cash-to-close before signing week** — plain English | USE_IN_FRI_SERVICES |
| One person through November | praise | "same contact when dates moved" / "one name to message, not a generic inbox" | **One accountable contact** when pre-Thanksgiving timelines compress | USE_IN_WED_REPLIES |
| Written update when signing target moves | praise | "emailed when appraisal slipped" / "told us the new date in writing" | **Written updates** when appraisal/inspection/signing targets shift | USE_IN_WED_REPLIES |
| Document refresh before Thanksgiving | praise | "asked for updated pay stubs before holiday week" / "kept our file current" | **Document refresh** before Thanksgiving-week signing | USE_IN_FRI_SERVICES |
| Open conditions with owners | praise | "each condition had a name" / "knew if we or the lender owed the next item" | **Open conditions with clear owners** on milestone map | USE_IN_WED_REPLIES |
| Calm early-November tone | praise | "steady updates when inspection pushed" / "no panic before Thanksgiving" | Posts: **pre-Thanksgiving signing prep** without rate billboard | USE_IN_FRI_SERVICES |
| Pre-approval explained honestly | praise | "didn't oversell pre-approval" / "said what still had to be verified" | **Pre-approval boundaries** before winter shopping peaks | USE_IN_FRI_SERVICES |
| Reachable before closing | praise | "could reach someone when closing week got tight" | **216-250-9078** when urgent — not ghosting | USE_IN_WED_REPLIES |

### Complaint themes (address in Conrad process — never mock competitors)

| Theme | Polarity | Sample phrasing pattern | Implication for Conrad | Action |
|---|---|---|---|---|
| Gift-fund surprise near underwriting | complaint | "underwriting stalled on gift letter" / "nobody said donor docs upfront" | **Gift-fund checklist early** on first-time buyer calls | USE_IN_WED_REPLIES |
| File lost after offer | complaint | "had to re-upload everything" / "new person didn't know our pre-approval" | **File received confirmation** in first 72 hours after acceptance | USE_IN_WED_REPLIES |
| Fee shock at signing | complaint | "different numbers at the table" / "didn't understand cash to close" | **Cash-to-close walkthrough before signing week** | USE_IN_WED_REPLIES |
| Rotating contacts mid-file | complaint | "new person every week" / "had to re-explain our file" | **One accountable contact** through early November | USE_IN_WED_REPLIES |
| Silence when dates shift | complaint | "found out from our agent" / "never updated us when inspection failed" | **Proactive written update** when either track moves | USE_IN_WED_REPLIES |
| Stale documents near signing | complaint | "underwriting asked for new docs the week of closing" / "Thanksgiving surprise requests" | **Document refresh** early + realistic signing targets | USE_IN_FRI_SERVICES |
| Conditions without owners | complaint | "just said in underwriting for weeks" / "couldn't tell who was waiting on what" | **Conditions list with owners and due dates** | USE_IN_WED_REPLIES |
| Pre-approval oversold | complaint | "told us we were approved then issues at underwriting" | **Pre-approval boundaries** — education, not guarantees | USE_IN_WED_REPLIES |
| Post-clear-to-close ghosting | complaint | "couldn't reach anyone day before closing" | Named contact + **216-250-9078** when urgent | USE_IN_WED_REPLIES |
| Refi sold on rate only | complaint | "never talked timeline" / "rate changed and nobody explained break-even" | **Calendar-first refi** before year-end (carry from prior runs) | USE_IN_FRI_SERVICES |

---

## Early November / pre-Thanksgiving signing prep (refresh — for posts and page copy)

When borrowers compare Cleveland mortgage teams in **early November** — files targeting **pre-Thanksgiving signing**, winter shopping, or refi before year-end — public reviews often reward lenders who make **gift-fund readiness, post-offer continuity, and cash-to-close clarity** obvious:

1. **Gift-fund paperwork early** — donor letter and sourcing basics before underwriting stalls on first-time buyer files.
2. **Post-offer file received and assigned** — confirmation the file is in the system and a named contact owns next steps.
3. **Cash-to-close before signing week** — credits, fees, and cash needed in plain English before the signing table.
4. **One accountable contact** — same point person when appraisal, inspection, or holiday calendars compress timelines.
5. **Written updates when dates shift** — what changed on **your** file, who owns next steps, and the next date you should hear from us.
6. **Document refresh before Thanksgiving-week signing** — pay stubs and account updates when year-end pay periods compress.

These complement **late-October file rhythm** themes from 2026-10-28 and **GBP Services alignment** from 2026-10-30 — use Wed/Fri jobs to cover review-reply hooks without repeating Mon 2026-11-02 category posts or Thu 2026-10-29 post angles verbatim.

---

## Alignment with recent drafts

| Source | Use for |
|---|---|
| Monday 2026-11-02 category audit | Mortgage lender OR broker + Loan agency secondary; align Services before category save |
| Friday 2026-10-30 services | Four QM rows — gift-fund early, post-offer handoff, cash-to-close, one accountable contact |
| Thu 2026-10-29 GBP posts | Stagger — pre-Thanksgiving post set already drafted; this run angles **competitor-derived trust themes** |
| Wed 2026-10-21 review replies | Extend with **gift-fund early + file received + cash-to-close + written date-shift updates** |
| Tue 2026-10-28 competitor teardown | Prior generic themes (late-October file rhythm) — this run **narrows to pre-Thanksgiving signing prep** |

---

## Publishing guardrails

- Phone in all drafts: **216-250-9078** only.
- Never **216-513-5139**.
- No invented review counts, star ratings, or Map Pack ranks.
- No named competitor callouts until pack names are SEEN in CSV.
- Site-watch 2026-11-03: theconradteam.com HTTP 200; public page **216-279-2223** — resolve before GBP paste.

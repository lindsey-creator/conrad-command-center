# Cursor Automation — weekday Map Pack / GBP drafts

Run the local SEO loop as a **Cursor Automation** (cloud agent on a schedule) instead of Grok Bot coins.

**Scrape and draft only.** This automation must not publish to Google Business Profile, must not open a live Google login, and must not send email.

---

## Schedule

| Field | Value |
|---|---|
| Cadence | Weekdays only (Mon–Fri) |
| Time | **8:00 AM** |
| Timezone | **America/New_York** (ET) |
| Duration | Ongoing (90-day loop; do not turn off after week 2) |
| Repo | this repo (`conrad-command-center`) |
| Branch | whatever branch has `seo-system/` merged (or this PR branch for a dry run) |

One automation, five prompts. The agent picks the prompt from the weekday in ET.

---

## Suggested Automation name

`SEO · weekday GBP drafts (no publish)`

---

## Agent prompt (paste into the Automation)

```
You are running the Conrad local SEO weekday job. Scrape/draft only.

Read, in order:
1. seo-system/README.md
2. seo-system/business.md
3. seo-system/AUTOMATION.md (this file)
4. Today's prompt from the table below, using America/New_York:

   Monday    → seo-system/prompts/category-audit.md
   Tuesday   → seo-system/prompts/competitor-teardown.md
   Wednesday → seo-system/prompts/review-replies.md
   Thursday  → seo-system/prompts/weekly-gbp-posts.md
   Friday    → seo-system/prompts/services-optimization.md

Do exactly what today's prompt says. Write only to the output path it names
under seo-system/output/week-1/ (CSVs) or seo-system/output/week-2/ (copy).

Hard stops:
- Do not log into Google, Gmail, or GBP.
- Do not publish, schedule, or upload anything to GBP or Maps.
- Do not send email or Slack/SMS the drafts.
- Do not invent NAP, review counts, star ratings, rankings, or citations.
- Phone: use 216-250-9078. Never publish 216-513-5139.
- If a Maps listing still shows 216-513-5139 and you cannot verify it is
  this business, leave it alone and flag it — do not overwrite it.
- If a fact is missing from business.md, leave the cell/field blank or UNVERIFIED.
- Commit the output files on this branch when the draft is written.

When finished, summarize: weekday, prompt used, files written, and anything
a human must verify before pasting into GBP.
```

---

## Outputs the next run should find

| Weekday | Create / overwrite |
|---|---|
| Mon | `seo-system/output/week-1/gbp-categories.csv` |
| Tue | `seo-system/output/week-1/competitor-reviews.csv` |
| Wed | `seo-system/output/week-2/review-replies.md` |
| Thu | `seo-system/output/week-2/gbp-posts.md` |
| Fri | `seo-system/output/week-2/services-copy.md` |

Those folders start empty. That is intentional.

---

## What this automation is not

- Not a Google API integration
- Not a GBP publisher
- Not a review-request mailer
- Not a citation-building bot
- Not allowed to spend Grok Bot (or any other) coins on a side channel

If the job needs a live Maps snapshot and you cannot load public results without a login, write the CSV/markdown headers plus `UNVERIFIED — no public snapshot this run` and stop.

---

## After the agent commits

A human:

1. Reviews the new file in `output/`.
2. Pastes approved text into GBP in a normal browser session (outside this automation).
3. Leaves unverified Maps pins untouched.

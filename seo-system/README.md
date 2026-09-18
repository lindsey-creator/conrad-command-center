# Local SEO playbook — Conrad Mortgage / Conrad Team

90-day loop for Cleveland Map Pack and Google Business Profile (GBP) **draft** work. Cursor Automations run the weekday jobs in this folder so the work does not burn Grok Bot coins.

**This system scrapes and drafts only.** It does not log into Google, does not publish to GBP, and does not send email. A human pastes approved copy into GBP.

Do not invent NAP, review counts, rankings, or citations. Phone lock: use `216-250-9078`. Never publish `216-513-5139`. See [`business.md`](business.md).

---

## What lives here

| Path | Role |
|---|---|
| [`business.md`](business.md) | Conrad Mortgage / Conrad Team profile. Fill verified NAP; leave the rest blank. |
| [`AUTOMATION.md`](AUTOMATION.md) | Weekday 8:00 ET Cursor Automation (scrape / draft only). |
| [`prompts/`](prompts/) | One prompt per job. The automation reads the prompt for that weekday. |
| [`output/week-1/`](output/week-1/) | Empty. Week-1 jobs write CSVs here. |
| [`output/week-2/`](output/week-2/) | Empty. Week-2 jobs write draft copy here. |

---

## 90-day local SEO loop

Three passes over the same five jobs. Each pass is one month of weekdays. After day 90, repeat from Month 1 using the latest files in `output/` as the prior baseline.

```
Month 1 — foundation (weeks 1–4)
  Week 1  CSVs     → output/week-1/
  Week 2  copy     → output/week-2/
  Week 3  CSVs     → output/week-1/ (overwrite or date-stamp)
  Week 4  copy     → output/week-2/

Month 2 — tighten (weeks 5–8)
  Same Mon–Fri jobs. Compare to Month 1 files. Note deltas only from sources you can see.

Month 3 — hold / refresh (weeks 9–13)
  Same jobs. Refresh posts and review drafts. Re-audit categories if Google’s picker changed.
```

### Weekday jobs (every week)

| Weekday (America/New_York) | Job | Prompt | Writes |
|---|---|---|---|
| **Monday** | GBP category audit | [`prompts/category-audit.md`](prompts/category-audit.md) | `output/week-1/gbp-categories.csv` |
| **Tuesday** | Competitor review teardown | [`prompts/competitor-teardown.md`](prompts/competitor-teardown.md) | `output/week-1/competitor-reviews.csv` |
| **Wednesday** | Review reply drafts | [`prompts/review-replies.md`](prompts/review-replies.md) | `output/week-2/review-replies.md` |
| **Thursday** | Weekly GBP post drafts | [`prompts/weekly-gbp-posts.md`](prompts/weekly-gbp-posts.md) | `output/week-2/gbp-posts.md` |
| **Friday** | Services copy | [`prompts/services-optimization.md`](prompts/services-optimization.md) | `output/week-2/services-copy.md` |

Week 1 of each month is CSV-heavy (Mon–Tue matter most). Week 2 is copy-heavy (Wed–Fri). The automation still runs every weekday so nothing depends on someone remembering the calendar.

### What each job is for

1. **Category audit** — Primary / secondary GBP categories vs. what Map Pack lenders in Cleveland actually use. Output is a checklist, not a live ranking.
2. **Competitor teardown** — Public review themes from listings you can open. No invented star counts. No “we are #3 in the pack.”
3. **Review replies** — Draft responses to reviews a human pasted or that a public page showed. Human posts them.
4. **GBP posts** — One week of post drafts (offer / update / event / product — only types GBP still supports). Human publishes.
5. **Services copy** — Service titles + short descriptions aligned to confirmed QM work. Human pastes into GBP Services.

### Human gate (every week)

After the weekday drafts land:

1. Open the new file in `output/`.
2. Delete anything that invents a number, address, rate, or license.
3. Confirm phone is `216-250-9078` and the dead number is absent.
4. Paste approved lines into GBP yourself. The automation never gets a Google login.

---

## Target queries (hypotheses — not current ranks)

Use these as **search strings to observe**, not as claimed positions:

- mortgage lender Cleveland
- mortgage broker Cleveland Ohio
- home loan Cleveland
- first time home buyer Cleveland
- refinance Cleveland Ohio

Record what the pack shows *today* in the CSV. If you did not load the results, leave rank cells empty.

---

## Hard rules

- **Scrape / draft only.** No GBP publish, no Google login, no email, no SMS.
- **No invented proof.** Empty cells beat fake review counts, citation counts, or Map Pack ranks.
- **Phone lock.** `216-250-9078` everywhere except a Maps listing you cannot verify (leave that pin alone).
- **Do not publish `216-513-5139`.**
- **Do not mix brands.** Conrad Mortgage GBP copy stays QM. Goldfront products stay off that listing unless a human says otherwise.
- **Compliance.** Drafts are not credit decisions, not rate locks, not Fair Housing steering.

---

## How a later automation uses the empty folders

`output/week-1/` and `output/week-2/` are intentionally empty (`.gitkeep` only). The weekday agent creates or overwrites:

```
seo-system/output/week-1/gbp-categories.csv
seo-system/output/week-1/competitor-reviews.csv
seo-system/output/week-2/review-replies.md
seo-system/output/week-2/gbp-posts.md
seo-system/output/week-2/services-copy.md
```

If a file from a prior week should be kept, date-stamp it (`gbp-posts-2026-08-20.md`) and leave the canonical name for the latest draft.

---

## Manual run (same as the automation)

From the repo root:

1. Read `seo-system/business.md`.
2. Open today’s prompt under `seo-system/prompts/`.
3. Follow it. Write only to the path the prompt names.
4. Stop. Do not log into Google. Do not send the copy anywhere.

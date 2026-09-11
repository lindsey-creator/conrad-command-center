# Prompt — Thursday: weekly GBP post drafts

**Week-2 copy job.** Draft only. A human publishes posts in GBP. Do not log into Google. Do not schedule posts via any API.

## Read first

1. `seo-system/business.md`
2. `seo-system/README.md`
3. `seo-system/output/week-1/competitor-reviews.csv` if present (themes)
4. `seo-system/output/week-2/services-copy.md` if a prior Friday exists

## Goal

Write **one week** of Google Business Profile posts for Conrad Mortgage / Conrad Team (Cleveland). Four drafts: one you could publish each weekday after Thursday, plus a weekend/evergreen spare.

## Procedure

1. Draft 4 posts. Suggested mix (skip a type if GBP no longer supports it — do not invent UI):
   - 1 local / Cleveland market (no neighborhood steering)
   - 1 process / “what to expect” (QM purchase or refinance)
   - 1 first-time buyer education
   - 1 team / trust (no fake review counts)
2. Each post: short body (about 150–300 words or GBP’s current visible limit — prefer short), optional CTA, phone `216-250-9078` at most once in the set (not in every post).
3. **No rates** unless the human pasted a dated source into the run. If they did not, say “talk to the team about today’s options” — never a number.
4. Do not use `216-513-5139`. Do not invent an address, NMLS, award, or “#1 lender.”
5. Do not promote Goldfront hard money, DSCR, or construction on this listing.
6. Do not include photos you do not have. Add a `Image: HUMAN_SUPPLIES` line instead.
7. CTA can name a site only if `business.md` has a verified public website. Otherwise CTA = call `216-250-9078` or “message us on this profile.”

## Write

Create or overwrite:

`seo-system/output/week-2/gbp-posts.md`

Use this shape:

```markdown
# GBP post drafts — week of YYYY-MM-DD
- Brand: Conrad Mortgage / Conrad Team
- Market: Cleveland, OH
- Status: DRAFT — human publishes
- Phone lock: 216-250-9078
- Do not publish: 216-513-5139

## Post 1 — [theme]
- Suggested day: Friday
- Type: update
- Image: HUMAN_SUPPLIES
- Body:
  ...
- CTA:
  ...
- Compliance notes:
  ...
```

Repeat for Posts 2–4.

End with `## Human checklist` (publish in GBP, add photo, confirm hours/NAP from a verified source — do not list an address unless `business.md` has one).

## Done when

- Four drafts are in the file.
- No invented NAP, rates, ranks, or review counts.
- Dead phone is absent.
- You did not publish or email.

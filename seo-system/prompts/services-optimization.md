# Prompt — Friday: services copy

**Week-2 copy job.** Draft only. A human pastes services into GBP. Do not log into Google. Do not invent products.

## Read first

1. `seo-system/business.md`
2. `seo-system/README.md`
3. `seo-system/output/week-1/competitor-reviews.csv` if present
4. `seo-system/output/week-2/gbp-posts.md` if Thursday already ran (keep language consistent)

## Goal

Write GBP **Services** titles and short descriptions for Conrad Mortgage / Conrad Team that match **confirmed QM lending** and Cleveland search language.

## Procedure

1. Start from the “Service themes that match confirmed QM work” list in `business.md`.
2. You may draft these service rows (safe set):
   - Conventional purchase mortgages
   - First-time homebuyer conversations
   - QM refinance conversations
   - Cleveland / Northeast Ohio home loans (service-area language, not a fake storefront)
3. Add FHA, VA, USDA, jumbo, or investor/DSCR rows **only** if `business.md` or a human note in this run confirms them. Otherwise omit — do not “complete the set.”
4. Each service: title (GBP-short) + 1–2 sentence description + optional “do not say” line.
5. No rates, no approval language, no “guaranteed close,” no invented NMLS, no review counts.
6. Phone: `216-250-9078` once at the top of the file (not in every service). Never `216-513-5139`.
7. Do not write a street address unless `business.md` has a verified one.
8. Pull 1–2 complaint themes from Tuesday’s CSV (`SEEN` only) and answer them in the descriptions (communication, timeline clarity) without claiming metrics.

## Write

Create or overwrite:

`seo-system/output/week-2/services-copy.md`

Use this shape:

```markdown
# GBP services copy
- Date: YYYY-MM-DD
- Brand: Conrad Mortgage / Conrad Team
- Phone: 216-250-9078
- Status: DRAFT — human pastes into GBP Services
- Address: [copy from business.md or UNVERIFIED — omit from GBP if unverified]

## Service: [title]
- Description:
  ...
- Do not say:
  ...
```

End with `## Skipped products` listing common mortgage products you did **not** write because they are unconfirmed.

## Done when

- The markdown file exists with only confirmed (or clearly labeled candidate) services.
- Dead phone is absent.
- No invented NAP, ranks, citations, or review counts.
- You did not publish or email.

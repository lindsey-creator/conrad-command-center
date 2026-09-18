# Prompt — Wednesday: review reply drafts

**Week-2 copy job.** Draft only. A human posts replies in GBP. Do not log into Google. Do not send email.

## Read first

1. `seo-system/business.md`
2. `seo-system/README.md`
3. `seo-system/output/week-1/competitor-reviews.csv` if it exists (themes only)
4. Any review text a human pasted at the bottom of this file or in the Automation follow-up. If none, see “No reviews provided.”

## Goal

Draft on-brand replies for Conrad Mortgage / Conrad Team reviews. Voice: calm, direct, Cleveland-local, no invented proof.

## Procedure

1. Only reply to reviews you have **verbatim**. If the Automation run has no pasted reviews and you cannot see public Conrad reviews without a login, do not invent reviews.
2. One draft per review. Match the customer’s name only if it appeared on the review. Do not add last names that were not shown.
3. Thank them. Reflect one specific detail they wrote. Offer a next step that is not a credit decision (call, form, ask for the loan officer they worked with).
4. Phone in drafts: `216-250-9078` only, and only when a phone is useful (complaint / “can’t reach you”). Never mention `216-513-5139`.
5. Complaints: own the miss, do not argue, move offline. Do not promise a rate, approval, or timeline you cannot see.
6. Fair Housing: no neighborhood steering, no “areas we prefer.”
7. Do not claim star ratings, review totals, awards, or “top rated in Cleveland.”

## No reviews provided

Write `seo-system/output/week-2/review-replies.md` with:

- The header block below
- A `## Queue` section that says `NO_REVIEWS_PROVIDED`
- Three **reusable templates** (5-star / mixed / 1-star) with placeholders like `[NAME]`, `[DETAIL THEY WROTE]`, `[LO FIRST NAME IF KNOWN]`
- A one-line note: human should paste new GBP reviews into the next Wednesday run

Do not fill templates with fake customer names or fake stories.

## Write

Create or overwrite:

`seo-system/output/week-2/review-replies.md`

Use this shape:

```markdown
# Review reply drafts
- Date: YYYY-MM-DD
- Brand: Conrad Mortgage / Conrad Team
- Phone in copy: 216-250-9078
- Status: DRAFT — human posts in GBP
- Publish: no

## Reply 1
- Source: [url or "pasted"]
- Reviewer: [name as shown or UNVERIFIED]
- Stars: [only if shown, else UNVERIFIED]
- Review (verbatim):
  > ...
- Draft reply:
  ...
- Do not mention: 216-513-5139, invented metrics, other brands' review counts
```

## Done when

- The markdown file exists.
- Every draft is tied to a verbatim review **or** is clearly a blank template.
- Dead phone is absent.
- You did not publish or email the replies.

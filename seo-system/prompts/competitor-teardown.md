# Prompt — Tuesday: competitor review teardown

**Week-1 CSV job.** Draft / scrape only. Do not log into Google. Do not invent review volume or stars.

## Read first

1. `seo-system/business.md`
2. `seo-system/README.md`
3. `seo-system/output/week-1/gbp-categories.csv` if Monday already wrote it (use names from `SEEN` rows only)

## Goal

Tear down **public** review themes for Map Pack competitors in Cleveland mortgage search — so Conrad’s reply and services drafts (Wed–Fri) match what buyers actually complain about and praise.

## Procedure

1. Build the competitor name list from Monday’s CSV (`our_listing_yn=N` and `verification=SEEN`). If that file is missing or all `NO_SNAPSHOT`, stop after writing the header plus one `NO_SNAPSHOT` row. Do not invent a competitor set.
2. For each named competitor you can open on a **public** page:
   - Record themes in their own words (speed, communication, closing, fees, bait-and-switch, local knowledge).
   - Quote a short public phrase if you can see it. No fabricated quotes.
   - Leave `review_count` and `star_rating` **empty** unless the number is visible on the page you opened. If you cannot see a number, do not estimate.
3. Do not score Conrad against them. No “we are behind on reviews.” No citation counts.
4. Ignore listings you cannot confirm are mortgage businesses in the Cleveland market.
5. Phone lock: do not write `216-513-5139` into any cell. If a competitor card is actually an unverified Conrad pin with the dead number, flag `FLAG_UNVERIFIED_MAPS` and skip teardown of that pin.

## Write

Create or overwrite:

`seo-system/output/week-1/competitor-reviews.csv`

Use this header exactly:

```csv
observed_date,competitor_name,source_url,review_count,star_rating,theme,polarity,sample_phrase,implication_for_conrad,action,verification
```

Rules for cells:

- `review_count` / `star_rating` — empty unless seen. Never fill from memory.
- `polarity` — `praise`, `complaint`, or `mixed`.
- `implication_for_conrad` — process note only (e.g. “draft replies that name next step / timeline”). No fake metrics.
- `action` — `USE_IN_WED_REPLIES`, `USE_IN_FRI_SERVICES`, `IGNORE`, `NO_SNAPSHOT`, `FLAG_UNVERIFIED_MAPS`.
- `verification` — `SEEN` or `UNVERIFIED`.
- `source_url` — the public URL you opened, or empty.

Add a `SUMMARY` row: 3–5 theme bullets in `implication_for_conrad`. No numbers unless they appeared in `SEEN` rows.

## Done when

- The CSV exists and has the header.
- Every competitor name came from a seen pack or a URL you opened.
- Count and star cells are empty whenever unseen.
- You did not log in, email anyone, or publish.

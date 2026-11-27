# Prompt — Monday: GBP category audit

**Week-1 CSV job.** Draft / scrape only. Do not log into Google. Do not publish category changes.

## Read first

1. `seo-system/business.md`
2. `seo-system/README.md`

## Goal

Produce a category checklist for the Conrad Mortgage / Conrad Team Cleveland listing: what to verify in GBP, what nearby lenders appear to use, and what to change **after a human looks**. This is not a rank report.

## Procedure

1. Confirm the listing identity from `business.md` only. If GBP name, place ID, or address is `UNVERIFIED`, do not invent them.
2. Use **public** search only (no login). For each query in the README “Target queries” list, note which **business names** appear in the local pack **if you can see them**. If you cannot see results, write `NO_SNAPSHOT` and leave competitor cells empty.
3. For Conrad Mortgage / Conrad Team, list:
   - Primary category candidates (from `business.md`)
   - Secondary category candidates
   - Categories to avoid (Goldfront / construction / hard money unless a human confirmed this listing)
4. Do **not** claim current primary/secondary categories unless you can see them on a public page. Mark unseen fields `UNVERIFIED`.
5. Phone check: any public snippet you record must use `216-250-9078` if you recommend a number. If a Maps card shows `216-513-5139` and you cannot verify the listing, add a `FLAG_UNVERIFIED_MAPS` row — do not recommend overwriting that pin.

## Write

Create or overwrite:

`seo-system/output/week-1/gbp-categories.csv`

Use this header exactly:

```csv
observed_date,query,pack_position,business_name,visible_primary_category,our_listing_yn,phone_visible,phone_lock_ok,recommended_primary,recommended_secondary,action,notes,verification
```

Rules for cells:

- `observed_date` — ISO date of this run (`YYYY-MM-DD`).
- `pack_position` — integer only if you saw the pack. Else empty.
- `our_listing_yn` — `Y`, `N`, or empty if unknown. Never guess.
- `phone_visible` — the number on the card, or empty. Do not copy `216-513-5139` into `recommended_*` fields.
- `phone_lock_ok` — `Y` if visible phone is `216-250-9078`; `N` if any other number; `UNVERIFIED` if no phone seen.
- `action` — one of `KEEP`, `CHANGE_AFTER_HUMAN`, `FLAG_UNVERIFIED_MAPS`, `NO_SNAPSHOT`.
- `verification` — `SEEN` or `UNVERIFIED`.
- No invented review counts, ratings, or “#1 in Cleveland” notes.

Add a last row with `query` = `SUMMARY` and a short `notes` cell: what a human should click in GBP this week (categories only). Leave counts out.

## Done when

- The CSV exists and has the header.
- Every non-empty fact is something you saw or that `business.md` already stated.
- The dead phone is not recommended anywhere.
- You did not log in or publish.

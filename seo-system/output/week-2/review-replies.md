# Review reply drafts
- Date: 2026-08-26
- Brand: Conrad Mortgage / Conrad Team
- Phone in copy: 216-250-9078
- Status: DRAFT — human posts in GBP
- Publish: no

## Queue

**NO_REVIEWS_PROVIDED** — No verbatim GBP reviews were pasted into this run, and public Conrad reviews could not be loaded without a Google login. Do not post the templates below as-is; fill placeholders from real reviews first.

**Human action:** Paste new GBP reviews (reviewer first name, star rating if shown, full review text) into the next Wednesday Automation follow-up or at the bottom of `seo-system/prompts/review-replies.md`, then re-run this job for review-specific drafts.

---

## Reusable templates

Use these only after replacing placeholders with text from a **verbatim** review. Do not substitute fake names or invented stories.

---

### Template A — 5-star (communication / process praise)

- Use when: Reviewer praises responsiveness, clear updates, plain language, patience (especially first-time buyers), or smooth closing.
- Themes from `competitor-reviews.csv` SUMMARY (generic, not competitor-attributed): proactive updates, documented next steps, plain-language guidance.

**Draft reply:**

Hi [NAME] — thank you for taking the time to share this. [DETAIL THEY WROTE — e.g., “Knowing what happened next at every step” / “You explained things without jargon”] is exactly what we aim for on every Cleveland and Northeast Ohio file.

If [LO FIRST NAME IF KNOWN] or anyone on our team can help again — purchase, refinance, or just a question down the road — message us here or call **216-250-9078**.

— Conrad Mortgage / Conrad Team

- Do not mention: 216-513-5139, invented metrics, other brands' review counts, “#1 in Cleveland,” rate quotes

---

### Template B — Mixed / 3–4 star (something went well, something to improve)

- Use when: Reviewer liked the outcome or a team member but noted delays, confusion, or a missed callback.
- Own the miss. Do not argue. Move offline.

**Draft reply:**

Hi [NAME] — thank you for the honest feedback. We are glad [DETAIL THEY PRAISED — e.g., “the closing went smoothly” / “[LO FIRST NAME IF KNOWN] stayed patient with our questions”] worked for you, and we hear you on [DETAIL THEY CRITICIZED — e.g., “response time mid-process” / “a document request that felt last-minute”].

That is not the experience we want anyone to have. I would like to understand what happened so we can fix it — please message us here or call **216-250-9078** and ask for [LO FIRST NAME IF KNOWN or “our office manager”]. We will follow up directly.

— Conrad Mortgage / Conrad Team

- Do not mention: 216-513-5139, invented metrics, promises about rates/approval/timelines you cannot verify, Fair Housing–sensitive neighborhood comments

---

### Template C — 1–2 star (complaint / felt ignored / surprise at closing)

- Use when: Reviewer reports ghosting, bait-and-switch framing, last-minute fee/timeline surprises, or process confusion — themes from generic teardown SUMMARY.
- Tone: calm, accountable, offline resolution. No public debate.

**Draft reply:**

Hi [NAME] — I am sorry this did not match what you expected. [REFLECT ONE SPECIFIC DETAIL THEY WROTE — e.g., “Waiting days for a callback” / “Fees or timing that changed late in the process”] is serious, and you deserved clearer communication throughout.

We would like to hear your side directly and see what we can do to make it right. Please call **216-250-9078** or message us here with the best way to reach you — we will have a lead team member respond, not an automated reply.

Thank you for giving us the chance to address this.

— Conrad Mortgage / Conrad Team

- Do not mention: 216-513-5139, invented metrics, arguing about facts you cannot verify in the file, rate/approval promises, other lenders’ practices

---

## Reply checklist (before human posts in GBP)

- [ ] Review text is **verbatim** from GBP — not paraphrased from memory
- [ ] Reviewer name matches GBP (first name only if that is all GBP shows)
- [ ] Star rating copied only if visible on the review
- [ ] Phone is **216-250-9078** when a phone is included — never 216-513-5139
- [ ] No invented review counts, awards, or “top rated” language
- [ ] No Fair Housing steering or neighborhood preference language
- [ ] Complaint replies move offline — no rate locks, approvals, or closing date promises

---

## Blockers carried from prior runs

- **NO_SNAPSHOT** for pack competitors (Mon/Tue) — complete incognito pack check before using competitor-specific reply angles
- **Site maintenance:** theconradteam.com under maintenance as of 2026-08-25
- **Phone mismatch (site-watch):** prior fetch showed 216-279-5821; repo lock remains 216-250-9078 — human confirms before GBP paste

# Build prompt — Command Center (Cursor / Manus)

Paste the block below into your build tool once the Brain has been trained and
validated (master-spec §10, steps 2–3). Everything below the line is the prompt.

---

You are building the **Conrad Command Center** — the glass HUD for **JARVIS**, the
sole AI command for Lindsey Conrad's lending + construction operation (Goldfront +
Conrad Enterprises, 8 business units) and his personal operating rhythm.

**Read these first as the source of truth, in order:**
1. `docs/master-spec.md` — architecture, hard principles, data model
2. `docs/executive-council.md` — the vision: a board of executives (business + personal seats)
3. `docs/command-center-experience.md` — the experience/design spec + modules
4. `docs/coaching-frameworks.md` — the voices to bake into the Brain (Hormozi, Miller, Sinek, Martell)
5. `docs/JARVIS-LIVE.md` — naming lock (JARVIS, Command Center, Brain, Manus builds)
6. `README.md` + `BRAND.md` — what's already built and the design bar

**Match and elevate the existing dashboard.** Lindsey already runs
`command.theconradteam.com` (Manus deploy, ClickUp + GCal + GHL + Gmail +
Weather, mobile-locked, 15-min refresh). Rebuild it to feel like an elite cockpit —
calm, sharp, uncluttered. When he opens it he should feel **"we got this."**

**Non-negotiables (master-spec §3):**
- The deterministic engine (`brain/engine/deal_math.py`) computes every number; the
  UI and **JARVIS** NARRATE numbers, never calculate them.
- Nothing sends without a human gate (Approval Queue).
- Escalate the novel 20%; don't guess. Credit-adjacent = internal-facing only.
- **Wellbeing guardrail**: health/performance modules track, display, remind, and
  route to real professionals — they never dose, prescribe, diagnose, or give
  medical/tax/investment advice.
- Brand the assistant **JARVIS** everywhere — not Echo, Chief of Staff, Fable, or Manus.

**Mobile-first / travel:** he runs this from a Cybertruck (autodrive) on Starlink
Mini. Excellent on phone/tablet; degrade gracefully on a weak connection. **Build
once, build durable.**

**Modules to build (one screen):**
Business — Empire Blind Spots · Today's Watch List (CRITICAL) · Money in Motion
(with the Top-3 money moves) · GoHighLevel CRM (leads/missed calls/texts/pipeline)
· Meta Ads (spend/leads/CPL) · Team Pulse (overdue + who's behind) · Schedule ·
Week Ahead · Weather.
Personal — Health & performance (Apple Health + Whoop, supplement schedule,
peptide protocol, diet) · Calendar protection · Wellbeing check-in. All personal
modules obey the wellbeing guardrail.

**Type-1 surface:** exactly **three** slots — **MONEY NOW / LEAKING / EFFICIENCY** —
Brain-backed, never invented.

**Three capabilities on top of the old dashboard:**
1. **Daily Fieldy brief** — Fieldy all day; each morning a brief of decisions,
   commitments he made, promises others made to him, follow-ups owed, and items
   that should become tasks or watch-list entries.
2. **Accountability radar** — cross-reference commitments (Fieldy, ClickUp, GHL,
   email) against what moved; surface person, gap, suggested move.
3. **Task-from-anywhere** — issue ClickUp tasks by voice or text; Brain routes with
   context; approvals from his phone.

**Stack & order:** React front end talking to the existing FastAPI Brain in
`Goldfront-os`; reuse `/evaluate-deal`, `/train/*`, `/decisions/history` and add
read endpoints per `BRAIN_CONNECTION.md`. **Never fake data** — wire to the Brain;
where a source isn't connected, show a clean "connect this source" state.

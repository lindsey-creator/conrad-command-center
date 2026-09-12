# Cybertruck HUD + Speak

Landscape-first JARVIS pack for the truck glass. No custom domain. Live URL stays Railway.

## Toggle the pack

| How | What happens |
| --- | --- |
| Auto | `orientation: landscape` **and** `16:9` (or width ≥ 1400px) → `data-pack="cybertruck"` |
| `?cybertruck=1` or `?pack=cybertruck` | Force Cybertruck giant type |
| `?pack=phone` or `?cybertruck=0` | Force compact |
| Chrome header | Shows **CYBERTRUCK** or **PHONE** |

Root attribute: `data-pack="cybertruck" | "phone"` on `.rhino`. Ultrawide (`min-aspect-ratio: 2.2/1`) spreads rails and the WHOOP strip.

## Preview URLs (local `npm run preview`)

- Idle void + WHOOP strip + dim Arc: `/?idle=1&whoop=low&cybertruck=1`
- Talk Mode (orb ~70%): `/?talk=1&cybertruck=1`
- **Speak demo:** `/?speak=1`

Idle is cinematic: Day Orbit WHOOP strip, dim Arc Core, three ticks (TYPE-1 / MONEY NOW / LEAKING). Talk Mode gives the orb the glass. No SaaS cards. White type, cyan accent only.

## Talk Mode — Brain `/chat` (not ChatGPT on the glass)

After STT (or GO), the dock POSTs the transcript to Goldfront-os `POST /chat` `{ "message": "…" }`. Same-origin `/chat` when the Brain serves the glass; `VITE_BRAIN_API` in local dev.

- Reply shows on the dock and is spoken with chunked TTS.
- `mode=fallback` / `engine=null` / empty answer → JARVIS says **“Sir, the brain key is offline — I cannot think yet.”**
- Timeout or HTTP error → **“Sir, the brain did not respond.”**
- The glass never calls Anthropic or OpenAI. Human seat only.

**Railway — `jarvis-brain` service must set `ANTHROPIC_API_KEY`.** Until that key is on the service, live `/chat` returns `mode: "fallback"` and `engine: null`. Set it in the Railway Variables tab for `jarvis-brain` (production). Do not put the key in the HUD repo.

Prove: type **Brief me** and GO (`/?speak=1`). THINKING stays until `/chat` returns, then the dock speaks.

## Demo Speak (do this first)

Speak was broken because TTS ran after `await` (Chrome drops `speechSynthesis` off a click) and SPEAK/WISPR died silently with no mic.

**Now:**

1. Open `/?speak=1` (or the live HUD).
2. Click **SPEAK** — that click unlocks TTS.
3. You should hear **“JARVIS online, sir.”** and the orb go SPEAK WAVE.
4. Click **SPEAK** again, allow the microphone. Orb → LISTEN RIPPLE. Talk, or type and **GO**.
5. JARVIS replies with TTS (SPEAKING). **HEAR** replays the last line.
6. If the mic is blocked: amber banner, JARVIS says to type, **GO** still speaks.

States: IDLE PULSE → LISTEN RIPPLE → THINK SWIRL → SPEAK WAVE → ALERT FLARE (Type-1 / money only).

## READY AGENT (KB)

Loop on glass: **observe → reason → act → evidence → escalate**. Arc Core tint is **L0–L3**.

**AUTO** (no send): drafts · research · assign · schedule · board. **GO** (confirm): send · publish · spend · outreach · sign · $.

Top-7 live chips (PROVEN / CLAIMED, never invented): Morning brief · GHL apply watch · Leak sweeper · Meeting-prep · Plaud extractor · Type-1 queue · Rhino handoff.

Autonomy: **L0 silent / L1 report / L2 auto / L3 GO**. Never Team GHL. Never ChatGPT-as-him. Never auto-send.

## Five-panel glass

1. **Arc Core** — blue / amber (leak) / red (Type-1)
2. **Type-1 Targeting Queue** — max 3
3. **MONEY NOW radar** — blips, not a table
4. **LEAKING detection grid** — scan cells, not a table
5. **Day Orbit** — calendar nodes + WHOOP

**Off glass:** raw feeds, pipeline tables, vanity metrics, FYIs, mixed Rise/Non-QM.

Command bar: Brief me · What’s leaking? · Put [X] on [board] · Sharpen [X] · Go/approve Type-1. Mutating commands **confirm** — they never auto-execute.

Operator: Lindsey — he/him. JARVIS says sir. Railway URL only.

## WHOOP Day Orbit

Idle strip: recovery / sleep / strain from Brain `GET /health/metrics` (and `GET /whoop` if present). Missing data stays **CLAIMED** with `—`. Rule: low recovery (< 34) → **WORK LOAD DOWN · GYM STAYS**. Never medical advice.

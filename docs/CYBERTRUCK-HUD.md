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

- Idle landscape + WHOOP strip: `/?idle=1&cybertruck=1`
- Talk Mode 70vh orb: `/?talk=1&cybertruck=1`
- Low-recovery work gate (CLAIMED preview): `/?idle=1&whoop=low&cybertruck=1`
- **Speak demo:** `/?speak=1`

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

## Type-1 + feeds (Rhino lock)

HUD decision glass is **only** Type-1 cards: MONEY NOW / LEAKING / EFFICIENCY. Queue cap **3**.

Feeds (Idle glass strip, not SaaS cards):

- Town — **pattern-match** only
- GHL — **new/cold apply fills** only (personal location, 216-250-9078)
- Rise — **QM weekly blockers** only (never a sleep score)
- Non-QM — **milestones** only

Operator: Lindsey — he/him. JARVIS says sir. Railway URL only.

## WHOOP Day Orbit

Idle strip: recovery / sleep / strain from Brain `GET /health/metrics` (and `GET /whoop` if present). Missing data stays **CLAIMED** with `—`. Rule: low recovery (< 34) → **WORK LOAD DOWN · GYM STAYS**. Never medical advice.

# JARVIS live — naming lock

This doc locks how Lindsey Conrad's operator stack is named in product copy, prompts, and the Command Center UI.

## Roles

| Name | What it is |
|------|------------|
| **JARVIS** | Sole AI command — this chat, Grok Bot, and the voice/text line in Command Center. Not Chief of Staff, Echo, Fable, or Manus. |
| **Command Center** | The glass HUD (`conrad-command-center`) where JARVIS lives. Mobile-first cockpit for money, leaks, Type-1s, and connectors. |
| **Brain** | FastAPI engine in sibling repo `Goldfront-os`. Computes every number; UI narrates only. |
| **Supercomputer** | Knowledge / memory layer (training, decisions, ingest) — not the HUD itself. |
| **Manus** | Named production **builds and deploy** on the always-on box only — not the assistant persona. |

## Wiring rules

- Command Center talks to Brain per `BRAIN_CONNECTION.md`. No invented metrics; offline sources show **Connect source** or **Offline**.
- Nothing sends without the **Approval Queue** human gate.
- Personal GHL location **3nUeqi** is for Lindsey's apply flows only — do not use Team GHL **FFdZ** writes from this UI.
- Publish phone for apply flows: **216-250-9078**.
- Do not build `rhinolending.capital/apply` in this repo; do not activate ads from here.

## Operator

- **Lindsey Conrad** — he/him in all UI and docs we maintain.

## Header copy (canonical)

**JARVIS · Command** with a live indicator when `/health` reports Brain reachable.

## Production glass

Live Brain + HUD (Railway, no custom domain required):

`https://jarvis-brain-production-8def.up.railway.app`

The Brain serves `conrad-command-center` `dist` cloned from `main` at image build. Merge HUD changes to `main`, then rebuild `jarvis-brain` on Railway.

## Type-1 lock (max 3)

Always three slots — never a fourth, never invented numbers:

| Slot | Meaning | Brain |
|------|---------|--------|
| **MONEY NOW** | Capital / next dollar move | `GET /money/top-moves` |
| **LEAKING** | What bites if ignored | `GET /watchlist` |
| **EFFICIENCY** | Team / process gaps | `GET /team/pulse` |

Empty slots show **Connect source** or **Clear**.

## Voice — Wispr Flow → command line

On phone or Cybertruck tablet, Lindsey dictates with **[Wispr Flow](https://wisprflow.ai)** (system-wide dictation). The cockpit is built for that flow:

1. Tap **Speak** on the command line (or tap the text field) so focus lands in `#jarvis-command-input`.
2. Trigger Wispr Flow — transcribed text appears in the command line.
3. **Execute** (or Enter) sends to Brain; nothing runs without live data or Approval Queue rules.

Browser hold-to-talk mic is a fallback when Wispr is unavailable. JARVIS copy uses he/him for Lindsey in UI we maintain.

## Live feeds (HUD lane)

Six structured slots: Town mail · GHL apply fills · calendar next · WHOOP recovery · Rise QM board · Non-QM LO hunt.

Brain fills them (`/inbox/radar`, `/crm/ghl`, `/brief/daily`, `/health/metrics`, `/watchlist`). Missing routes or keys → **Connect source**, never fake threads.

## Command intents

The command line routes before `/chat`: *what's leaking*, *apply fills*, *Rise status*, *draft LO outreach* (plus money / efficiency / WHOOP / calendar / town). `/chat` is the fallback; chips hit live reads so the glass still answers when the model lane is slow.
